import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.39";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

const MEMORY_UPDATE_PROMPT = `You are a memory system for Noonan, an AI golf caddy. Your job is to maintain a concise, evolving summary of a golfer's profile.

Given the current memory summary and a recent conversation, update the summary to incorporate any new information. The summary should capture:

- Their typical score range and handicap
- Courses they've played and how they did
- Strengths and weaknesses in their game
- What they're working on improving
- Mental game tendencies (do they get frustrated? stay positive?)
- Any personal details they've shared (how often they play, who they play with)
- Goals they've mentioned
- Recurring patterns across rounds

Keep the summary concise (under 500 words). Write it as notes, not prose. Focus on what's most useful for personalizing future conversations. Drop outdated info if it's been superseded.

If there's nothing meaningful to add from this conversation, return the existing summary unchanged.`;

Deno.serve(async (req) => {
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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

    const { conversation_id } = await req.json();
    if (!conversation_id) {
      return new Response(
        JSON.stringify({ error: "conversation_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure player_memory exists (safety net for auth trigger race condition)
    const safetyClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await safetyClient
      .from("player_memory")
      .upsert(
        { user_id: user.id, summary: "" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    // Get current memory
    const { data: memory } = await supabase
      .from("player_memory")
      .select("summary")
      .eq("user_id", user.id)
      .single();

    // Get the conversation messages
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ message: "No messages to process" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Format conversation for the memory update
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Golfer" : "Noonan"}: ${m.content}`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: MEMORY_UPDATE_PROMPT,
      messages: [
        {
          role: "user",
          content: `Current memory summary:\n${memory?.summary || "(empty - new golfer)"}\n\nRecent conversation:\n${conversationText}\n\nReturn the updated memory summary:`,
        },
      ],
    });

    const updatedSummary =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Use service client to update memory (bypasses RLS for the update)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("player_memory")
      .upsert({
        user_id: user.id,
        summary: updatedSummary,
        last_updated: new Date().toISOString(),
      }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({ message: "Memory updated", summary: updatedSummary }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Memory update error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
