import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GOLF_COURSE_API_URL = "https://golfcourseapi.com/api/v1";
const GOLF_COURSE_API_KEY = Deno.env.get("GOLF_COURSE_API_KEY");

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

    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: "Query must be at least 2 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check cache first
    const { data: cached } = await supabase
      .from("courses")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(10);

    if (cached && cached.length > 0) {
      return new Response(JSON.stringify({ courses: cached }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch from GolfCourseAPI if not cached
    if (!GOLF_COURSE_API_KEY) {
      return new Response(
        JSON.stringify({ courses: [], message: "Course API not configured" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const apiResponse = await fetch(
      `${GOLF_COURSE_API_URL}/courses?search=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${GOLF_COURSE_API_KEY}` },
      }
    );

    if (!apiResponse.ok) {
      console.error("GolfCourseAPI error:", apiResponse.status);
      return new Response(JSON.stringify({ courses: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiData = await apiResponse.json();
    const courses = apiData.courses || [];

    // Cache results in Supabase
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    for (const course of courses) {
      await serviceClient.from("courses").upsert(
        {
          external_id: String(course.id),
          name: course.name,
          city: course.city,
          state: course.state,
          country: course.country,
          par: course.par,
          cached_at: new Date().toISOString(),
        },
        { onConflict: "external_id" }
      );
    }

    // Re-fetch from our cache to return consistent format
    const { data: results } = await supabase
      .from("courses")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(10);

    return new Response(JSON.stringify({ courses: results || [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Course lookup error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
