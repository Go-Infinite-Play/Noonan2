import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { display_name, handicap_range, estimated_handicap, play_frequency, weakness } = await req.json();

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert user profile
    await serviceClient
      .from("users")
      .upsert({
        id: user.id,
        display_name: display_name || "Golfer",
        handicap: estimated_handicap || null,
      }, { onConflict: "id" });

    // Seed player memory with onboarding data
    const memorySummary = [
      `- Name: ${display_name}`,
      `- Skill level: ${handicap_range}`,
      `- Estimated handicap: ${estimated_handicap}`,
      `- Plays: ${play_frequency}`,
      `- Main weakness: ${weakness}`,
      `- Status: New user, just completed onboarding. No rounds logged yet.`,
    ].join("\n");

    await serviceClient
      .from("player_memory")
      .upsert({
        user_id: user.id,
        summary: memorySummary,
        last_updated: new Date().toISOString(),
      }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({ message: "Onboarding complete" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
