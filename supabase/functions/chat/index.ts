import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.39";
import {
  NOONAN_SYSTEM_PROMPT,
  buildMessages,
} from "../_shared/noonan-prompt.ts";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, conversation_id } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Service client for operations that bypass RLS (memory updates, etc.)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ensure user and player_memory exist (safety net for auth trigger race condition)
    await serviceClient
      .from("users")
      .upsert(
        { id: user.id, display_name: user.user_metadata?.full_name || "Golfer" },
        { onConflict: "id", ignoreDuplicates: true }
      );

    await serviceClient
      .from("player_memory")
      .upsert(
        { user_id: user.id, summary: "" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, conversation_type: "general" })
        .select("id")
        .single();
      if (convError) throw convError;
      convId = conv.id;
    }

    // Get player memory
    const { data: memory } = await supabase
      .from("player_memory")
      .select("summary")
      .eq("user_id", user.id)
      .single();

    // Get recent conversation history (last 20 messages)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Build messages and call Claude
    const messages = buildMessages(
      memory?.summary || "",
      history || [],
      message
    );

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: NOONAN_SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Save assistant message
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: assistantMessage,
    });

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", convId);

    // Parse and handle noonan-data blocks
    const dataMatch = assistantMessage.match(
      /```noonan-data\n([\s\S]*?)\n```/
    );
    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        if (data.action === "log_round") {
          // Look up course if provided
          let courseId = null;
          if (data.course_name) {
            const { data: course } = await serviceClient
              .from("courses")
              .select("id")
              .ilike("name", `%${data.course_name}%`)
              .limit(1)
              .single();
            courseId = course?.id || null;
          }

          const { data: round } = await supabase
            .from("rounds")
            .insert({
              user_id: user.id,
              course_id: courseId,
              score: data.score,
              date_played: data.date_played || new Date().toISOString().split("T")[0],
              highlights: data.highlights,
              mood: data.mood,
            })
            .select("id")
            .single();

          // Link conversation to round
          if (round) {
            await supabase
              .from("conversations")
              .update({
                round_id: round.id,
                conversation_type: "post_round",
              })
              .eq("id", convId);
          }
        } else if (data.action === "pre_round") {
          await supabase
            .from("conversations")
            .update({ conversation_type: "pre_round" })
            .eq("id", convId);
        }
      } catch {
        // Data parsing failed, that's ok - don't break the chat
        console.error("Failed to parse noonan-data block");
      }
    }

    // Strip the noonan-data block from the response sent to the client
    const cleanMessage = assistantMessage
      .replace(/```noonan-data\n[\s\S]*?\n```/, "")
      .trim();

    return new Response(
      JSON.stringify({
        message: cleanMessage,
        conversation_id: convId,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
