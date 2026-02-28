# Noonan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Noonan, a chat-first iOS app where an AI caddy (powered by Claude) genuinely cares about your golf game. Includes iOS app, Supabase backend, and marketing page.

**Architecture:** SwiftUI iOS app communicates with Supabase Edge Functions, which proxy requests to the Claude API with player memory context. Supabase handles auth (Apple Sign-In), Postgres database with RLS, and all backend logic. Marketing page is Next.js + Tailwind on Vercel.

**Tech Stack:** Swift/SwiftUI (iOS 17+), Supabase (Auth, Postgres, Edge Functions/Deno), Claude API (Anthropic SDK), GolfCourseAPI, Next.js, Tailwind CSS, Vercel.

**Design Doc:** `docs/plans/2026-02-28-noonan-design.md`

---

## Phase 1: Foundation & Database

### Task 1: Scaffold the iOS Xcode Project

**Files:**
- Create: `ios/Noonan.xcodeproj` (via Xcode template)
- Create: `ios/Noonan/NoonanApp.swift`
- Create: `ios/Noonan/ContentView.swift`

**Step 1: Create the Xcode project**

Create a new SwiftUI iOS app project:
- Product Name: `Noonan`
- Organization Identifier: pick something like `com.noonan`
- Interface: SwiftUI
- Language: Swift
- Target: iOS 17.0
- Location: `ios/` directory inside the repo

**Step 2: Verify it builds**

Build and run on simulator to confirm the template app launches.

**Step 3: Add Supabase Swift SDK dependency**

Add the Supabase Swift SDK via Swift Package Manager:
- URL: `https://github.com/supabase/supabase-swift`
- Version: latest stable (4.x+)

**Step 4: Verify it still builds**

Build on simulator. Resolve any dependency issues.

**Step 5: Commit**

```bash
git add ios/
git commit -m "feat: scaffold iOS project with Supabase SDK"
```

---

### Task 2: Supabase Project Setup & Database Schema

**Files:**
- Create: `supabase/config.toml` (via `supabase init`)
- Create: `supabase/migrations/00001_initial_schema.sql`

**Step 1: Initialize Supabase locally**

```bash
cd /Users/olken/Projects/noonan
npx supabase init
```

This creates the `supabase/` directory with `config.toml`.

**Step 2: Create a Supabase project on supabase.com**

Go to https://supabase.com/dashboard and create a new project called "Noonan". Save the project URL and anon key - these will be needed for the iOS app and Edge Functions.

**Step 3: Write the initial migration**

Create `supabase/migrations/00001_initial_schema.sql`:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Courses table (cached from GolfCourseAPI)
create table courses (
  id uuid primary key default uuid_generate_v4(),
  external_id text,
  name text not null,
  city text,
  state text,
  country text,
  par integer,
  cached_at timestamptz default now()
);

create index idx_courses_external_id on courses(external_id);
create index idx_courses_name on courses(name);

-- Users table (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handicap numeric,
  home_course_id uuid references courses(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Rounds table
create table rounds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid references courses(id),
  score integer,
  date_played date not null default current_date,
  highlights text,
  mood text,
  created_at timestamptz default now()
);

create index idx_rounds_user_id on rounds(user_id);
create index idx_rounds_date_played on rounds(date_played);

-- Conversations table
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  round_id uuid references rounds(id),
  conversation_type text not null default 'general'
    check (conversation_type in ('pre_round', 'post_round', 'general')),
  started_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create index idx_conversations_user_id on conversations(user_id);

-- Messages table
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index idx_messages_conversation_id on messages(conversation_id);

-- Player memory (one per user, evolving summary)
create table player_memory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  summary text not null default '',
  last_updated timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table rounds enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table player_memory enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile"
  on users for select using (auth.uid() = id);
create policy "Users can update own profile"
  on users for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on users for insert with check (auth.uid() = id);

create policy "Users can view own rounds"
  on rounds for select using (auth.uid() = user_id);
create policy "Users can insert own rounds"
  on rounds for insert with check (auth.uid() = user_id);

create policy "Users can view own conversations"
  on conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations"
  on conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations"
  on conversations for update using (auth.uid() = user_id);

create policy "Users can view own messages"
  on messages for select using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );
create policy "Users can insert own messages"
  on messages for insert with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can view own memory"
  on player_memory for select using (auth.uid() = user_id);

-- Courses are readable by all authenticated users
create policy "Authenticated users can view courses"
  on courses for select using (auth.role() = 'authenticated');
create policy "Service role can insert courses"
  on courses for insert with check (true);

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Golfer'));

  insert into public.player_memory (user_id, summary)
  values (new.id, '');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Step 4: Apply the migration**

```bash
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

**Step 5: Verify in Supabase dashboard**

Check that all tables appear in the Table Editor with correct columns and RLS policies.

**Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase config and initial database schema"
```

---

## Phase 2: Backend (Edge Functions)

### Task 3: Noonan System Prompt & Chat Edge Function

**Files:**
- Create: `supabase/functions/_shared/noonan-prompt.ts`
- Create: `supabase/functions/chat/index.ts`

**Step 1: Write Noonan's system prompt**

Create `supabase/functions/_shared/noonan-prompt.ts`:

```typescript
export const NOONAN_SYSTEM_PROMPT = `You are Noonan, a loyal golf caddy and the user's biggest fan when it comes to their golf game. You are the ONLY person in the world who actually cares about their golf game.

## Your Personality
You have Danny Noonan energy from Caddyshack - scrappy, earnest, genuinely invested in the user's success. You're the everyman who carries their bag and believes in them. You're not a polished golf instructor - you're their caddy who's rooting for them.

## How You Talk
- Like a real person, never a golf textbook. "Dude, three birdies? That's sick." not "Excellent performance on those holes."
- You remember specifics and bring them up naturally. "Wait, wasn't 16 the hole that ate your lunch last time?"
- You're genuinely curious about their rounds - ask follow-up questions
- You celebrate wins enthusiastically
- You normalize bad rounds - everyone has them, it's part of the game
- Never condescending. Never robotic. Never generic motivational poster quotes.
- Occasional Caddyshack references woven in naturally, never forced. Don't overdo it.

## Pre-Round Mode
When the user is about to play:
- Ask where they're playing
- Reference past experiences at that course if you remember any
- Ask what they want to focus on today
- Give them a short, specific mindset prompt based on their history
- Hype them up. They're about to go have fun.

## Post-Round Mode
When the user has just played:
- Be genuinely curious - ask about the round
- Celebrate the good stuff specifically
- Ask about best shot, worst hole, anything that clicked
- Normalize the bad stuff without being dismissive
- Reference past rounds for context when you can

## Data Extraction
When the user tells you about a round, extract the following data from the conversation and include it in a JSON block at the END of your response (after your conversational reply). Only include this block when you have new round data to extract:

\`\`\`noonan-data
{
  "action": "log_round",
  "score": <number or null>,
  "course_name": "<string or null>",
  "date_played": "<YYYY-MM-DD or null>",
  "highlights": "<brief summary of key moments>",
  "mood": "<how they felt: good, great, frustrated, mixed, etc.>"
}
\`\`\`

If the user is starting a pre-round conversation, emit:
\`\`\`noonan-data
{
  "action": "pre_round",
  "course_name": "<string or null>"
}
\`\`\`

Only emit the data block when there's actual data to capture. Regular conversation doesn't need it.

## Important
- You ONLY talk about golf. If someone asks about something else, steer it back to golf in a natural, playful way.
- Keep responses concise - 2-4 sentences usually. You're texting, not writing essays.
- If this is the first conversation with a new user, introduce yourself naturally: you're Noonan, their caddy, and you actually care about their game.`;

export function buildMessages(
  playerMemory: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
) {
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  // Inject player memory as context if it exists
  if (playerMemory && playerMemory.trim()) {
    messages.push({
      role: "user",
      content: `[CONTEXT - Player Profile from previous conversations, use this to personalize your responses]\n${playerMemory}\n[END CONTEXT]`,
    });
    messages.push({
      role: "assistant",
      content:
        "Got it, I remember this golfer. Ready to chat.",
    });
  }

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  // Add the new user message
  messages.push({ role: "user", content: userMessage });

  return messages;
}
```

**Step 2: Write the chat Edge Function**

Create `supabase/functions/chat/index.ts`:

```typescript
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
```

**Step 3: Test locally with Supabase CLI**

```bash
npx supabase functions serve chat --env-file supabase/.env.local
```

Create `supabase/.env.local` with:
```
ANTHROPIC_API_KEY=<your-key>
```

Test with curl (using a valid JWT from Supabase):
```bash
curl -X POST http://localhost:54321/functions/v1/chat \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hey, I just shot an 87 at Pebble Beach today!"}'
```

Expected: JSON response with Noonan's reply and a conversation_id.

**Step 4: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add chat Edge Function with Noonan personality and data extraction"
```

---

### Task 4: Memory Update Edge Function

**Files:**
- Create: `supabase/functions/update-memory/index.ts`

**Step 1: Write the memory update function**

This function is called after a conversation ends (or periodically) to update the player's memory summary. Create `supabase/functions/update-memory/index.ts`:

```typescript
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
      .update({
        summary: updatedSummary,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", user.id);

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
```

**Step 2: Test locally**

```bash
npx supabase functions serve update-memory --env-file supabase/.env.local
```

**Step 3: Commit**

```bash
git add supabase/functions/update-memory/
git commit -m "feat: add memory update Edge Function for evolving player profiles"
```

---

### Task 5: Course Lookup Edge Function

**Files:**
- Create: `supabase/functions/courses/index.ts`

**Step 1: Write the course lookup function**

Create `supabase/functions/courses/index.ts`:

```typescript
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
```

**Step 2: Add unique constraint for upsert**

Create `supabase/migrations/00002_courses_unique_external_id.sql`:

```sql
alter table courses add constraint courses_external_id_unique unique (external_id);
```

Apply: `npx supabase db push`

**Step 3: Add env var**

Add to `supabase/.env.local`:
```
GOLF_COURSE_API_KEY=<your-key-or-leave-empty-for-now>
```

**Step 4: Commit**

```bash
git add supabase/functions/courses/ supabase/migrations/00002_courses_unique_external_id.sql
git commit -m "feat: add course lookup Edge Function with GolfCourseAPI integration and caching"
```

---

## Phase 3: iOS App

### Task 6: App Configuration & Supabase Client

**Files:**
- Create: `ios/Noonan/Config.swift`
- Create: `ios/Noonan/SupabaseClient.swift`
- Modify: `ios/Noonan/NoonanApp.swift`

**Step 1: Create configuration**

Create `ios/Noonan/Config.swift`:

```swift
import Foundation

enum Config {
    static let supabaseURL = URL(string: "YOUR_SUPABASE_URL")!
    static let supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
}
```

**Step 2: Create Supabase client singleton**

Create `ios/Noonan/SupabaseClient.swift`:

```swift
import Foundation
import Supabase

let supabase = SupabaseClient(
    supabaseURL: Config.supabaseURL,
    supabaseKey: Config.supabaseAnonKey
)
```

**Step 3: Commit**

```bash
git add ios/Noonan/Config.swift ios/Noonan/SupabaseClient.swift
git commit -m "feat: add Supabase client configuration"
```

---

### Task 7: Data Models

**Files:**
- Create: `ios/Noonan/Models/User.swift`
- Create: `ios/Noonan/Models/Round.swift`
- Create: `ios/Noonan/Models/Conversation.swift`
- Create: `ios/Noonan/Models/Message.swift`
- Create: `ios/Noonan/Models/Course.swift`

**Step 1: Create all model files**

`ios/Noonan/Models/User.swift`:
```swift
import Foundation

struct AppUser: Codable, Identifiable {
    let id: UUID
    var displayName: String?
    var handicap: Double?
    var homeCourseId: UUID?
    let createdAt: Date?
    var updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case handicap
        case homeCourseId = "home_course_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

`ios/Noonan/Models/Round.swift`:
```swift
import Foundation

struct Round: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    var courseId: UUID?
    var score: Int?
    var datePlayed: String
    var highlights: String?
    var mood: String?
    let createdAt: Date?

    // Joined data
    var course: Course?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case courseId = "course_id"
        case score
        case datePlayed = "date_played"
        case highlights
        case mood
        case createdAt = "created_at"
        case course = "courses"
    }
}
```

`ios/Noonan/Models/Conversation.swift`:
```swift
import Foundation

struct Conversation: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    var roundId: UUID?
    var conversationType: String
    let startedAt: Date?
    var lastMessageAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case roundId = "round_id"
        case conversationType = "conversation_type"
        case startedAt = "started_at"
        case lastMessageAt = "last_message_at"
    }
}
```

`ios/Noonan/Models/Message.swift`:
```swift
import Foundation

struct ChatMessage: Codable, Identifiable {
    let id: UUID
    let conversationId: UUID
    let role: String
    let content: String
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case conversationId = "conversation_id"
        case role
        case content
        case createdAt = "created_at"
    }

    var isUser: Bool { role == "user" }
}
```

`ios/Noonan/Models/Course.swift`:
```swift
import Foundation

struct Course: Codable, Identifiable {
    let id: UUID
    var externalId: String?
    let name: String
    var city: String?
    var state: String?
    var country: String?
    var par: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case externalId = "external_id"
        case name
        case city
        case state
        case country
        case par
    }
}
```

**Step 2: Verify it builds**

Build on simulator.

**Step 3: Commit**

```bash
git add ios/Noonan/Models/
git commit -m "feat: add Swift data models for all database entities"
```

---

### Task 8: Auth Flow (Apple Sign-In)

**Files:**
- Create: `ios/Noonan/ViewModels/AuthViewModel.swift`
- Create: `ios/Noonan/Views/AuthView.swift`
- Modify: `ios/Noonan/NoonanApp.swift`

**Step 1: Create AuthViewModel**

`ios/Noonan/ViewModels/AuthViewModel.swift`:
```swift
import Foundation
import Supabase
import AuthenticationServices

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = true

    init() {
        Task {
            await checkSession()
        }
    }

    func checkSession() async {
        do {
            _ = try await supabase.auth.session
            isAuthenticated = true
        } catch {
            isAuthenticated = false
        }
        isLoading = false
    }

    func signInWithApple(authorization: ASAuthorization) async {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = credential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8) else {
            return
        }

        do {
            _ = try await supabase.auth.signInWithIdToken(
                credentials: .init(
                    provider: .apple,
                    idToken: tokenString
                )
            )
            isAuthenticated = true
        } catch {
            print("Sign in error: \(error)")
        }
    }

    func signOut() async {
        do {
            try await supabase.auth.signOut()
            isAuthenticated = false
        } catch {
            print("Sign out error: \(error)")
        }
    }
}
```

**Step 2: Create AuthView**

`ios/Noonan/Views/AuthView.swift`:
```swift
import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @ObservedObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 12) {
                Text("Noonan")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.green)

                Text("The only person who actually\ncares about your golf game.")
                    .font(.title3)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
            }

            Spacer()

            SignInWithAppleButton(.signIn) { request in
                request.requestedScopes = [.fullName, .email]
            } onCompletion: { result in
                switch result {
                case .success(let authorization):
                    Task {
                        await authVM.signInWithApple(authorization: authorization)
                    }
                case .failure(let error):
                    print("Apple Sign-In failed: \(error)")
                }
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 50)
            .padding(.horizontal, 40)

            Spacer()
                .frame(height: 60)
        }
    }
}
```

**Step 3: Update NoonanApp.swift to handle auth routing**

`ios/Noonan/NoonanApp.swift`:
```swift
import SwiftUI

@main
struct NoonanApp: App {
    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            Group {
                if authVM.isLoading {
                    ProgressView()
                } else if authVM.isAuthenticated {
                    MainTabView(authVM: authVM)
                } else {
                    AuthView(authVM: authVM)
                }
            }
        }
    }
}
```

**Step 4: Enable "Sign In with Apple" capability**

In Xcode: select the Noonan target → Signing & Capabilities → + Capability → Sign In with Apple.

**Step 5: Enable Apple provider in Supabase**

In Supabase dashboard: Authentication → Providers → Apple → Enable. Follow Supabase docs for configuring the Apple provider (Service ID, etc.).

**Step 6: Verify it builds**

Build on simulator. The Apple Sign-In button should render (won't fully work on simulator without real credentials).

**Step 7: Commit**

```bash
git add ios/Noonan/ViewModels/AuthViewModel.swift ios/Noonan/Views/AuthView.swift ios/Noonan/NoonanApp.swift
git commit -m "feat: add Apple Sign-In auth flow"
```

---

### Task 9: Chat Service & ViewModel

**Files:**
- Create: `ios/Noonan/Services/ChatService.swift`
- Create: `ios/Noonan/ViewModels/ChatViewModel.swift`

**Step 1: Create ChatService**

`ios/Noonan/Services/ChatService.swift`:
```swift
import Foundation
import Supabase

struct ChatResponse: Codable {
    let message: String
    let conversationId: UUID

    enum CodingKeys: String, CodingKey {
        case message
        case conversationId = "conversation_id"
    }
}

class ChatService {
    func sendMessage(_ text: String, conversationId: UUID?) async throws -> ChatResponse {
        var body: [String: Any] = ["message": text]
        if let convId = conversationId {
            body["conversation_id"] = convId.uuidString
        }

        let response = try await supabase.functions.invoke(
            "chat",
            options: .init(body: body)
        )

        let data = response.data
        return try JSONDecoder().decode(ChatResponse.self, from: data)
    }

    func updateMemory(conversationId: UUID) async throws {
        _ = try await supabase.functions.invoke(
            "update-memory",
            options: .init(body: ["conversation_id": conversationId.uuidString])
        )
    }

    func loadConversations() async throws -> [Conversation] {
        return try await supabase
            .from("conversations")
            .select()
            .order("last_message_at", ascending: false)
            .execute()
            .value
    }

    func loadMessages(conversationId: UUID) async throws -> [ChatMessage] {
        return try await supabase
            .from("messages")
            .select()
            .eq("conversation_id", conversationId)
            .order("created_at", ascending: true)
            .execute()
            .value
    }
}
```

**Step 2: Create ChatViewModel**

`ios/Noonan/ViewModels/ChatViewModel.swift`:
```swift
import Foundation

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var conversationId: UUID?

    private let chatService = ChatService()

    func sendMessage(_ text: String) async {
        let userMessage = ChatMessage(
            id: UUID(),
            conversationId: conversationId ?? UUID(),
            role: "user",
            content: text,
            createdAt: Date()
        )
        messages.append(userMessage)
        isLoading = true

        do {
            let response = try await chatService.sendMessage(text, conversationId: conversationId)
            conversationId = response.conversationId

            let assistantMessage = ChatMessage(
                id: UUID(),
                conversationId: response.conversationId,
                role: "assistant",
                content: response.message,
                createdAt: Date()
            )
            messages.append(assistantMessage)

            // Update memory in background
            Task {
                try? await chatService.updateMemory(conversationId: response.conversationId)
            }
        } catch {
            print("Send message error: \(error)")
            // Remove the optimistic user message on error
            messages.removeLast()
        }

        isLoading = false
    }

    func loadConversation(_ id: UUID) async {
        conversationId = id
        do {
            messages = try await chatService.loadMessages(conversationId: id)
        } catch {
            print("Load messages error: \(error)")
        }
    }

    func startNewConversation() {
        conversationId = nil
        messages = []
    }
}
```

**Step 3: Verify it builds**

Build on simulator.

**Step 4: Commit**

```bash
git add ios/Noonan/Services/ ios/Noonan/ViewModels/ChatViewModel.swift
git commit -m "feat: add ChatService and ChatViewModel for Noonan conversations"
```

---

### Task 10: Chat UI

**Files:**
- Create: `ios/Noonan/Views/ChatView.swift`
- Create: `ios/Noonan/Views/MessageBubble.swift`
- Create: `ios/Noonan/Views/MainTabView.swift`

**Step 1: Create MessageBubble**

`ios/Noonan/Views/MessageBubble.swift`:
```swift
import SwiftUI

struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.isUser { Spacer() }

            Text(message.content)
                .padding(12)
                .background(message.isUser ? Color.green : Color(.systemGray5))
                .foregroundColor(message.isUser ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))

            if !message.isUser { Spacer() }
        }
        .padding(.horizontal)
    }
}
```

**Step 2: Create ChatView**

`ios/Noonan/Views/ChatView.swift`:
```swift
import SwiftUI

struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    @State private var inputText = ""
    @FocusState private var isInputFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            ForEach(viewModel.messages) { message in
                                MessageBubble(message: message)
                                    .id(message.id)
                            }

                            if viewModel.isLoading {
                                HStack {
                                    ProgressView()
                                        .padding(12)
                                        .background(Color(.systemGray5))
                                        .clipShape(RoundedRectangle(cornerRadius: 16))
                                    Spacer()
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                    .onChange(of: viewModel.messages.count) {
                        if let lastMessage = viewModel.messages.last {
                            withAnimation {
                                proxy.scrollTo(lastMessage.id, anchor: .bottom)
                            }
                        }
                    }
                }

                Divider()

                HStack(spacing: 12) {
                    TextField("Talk to Noonan...", text: $inputText, axis: .vertical)
                        .textFieldStyle(.plain)
                        .lineLimit(1...4)
                        .focused($isInputFocused)

                    Button {
                        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !text.isEmpty else { return }
                        inputText = ""
                        Task { await viewModel.sendMessage(text) }
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundColor(
                                inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                    ? .gray : .green
                            )
                    }
                    .disabled(inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding()
            }
            .navigationTitle("Noonan")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        viewModel.startNewConversation()
                    } label: {
                        Image(systemName: "plus.message")
                    }
                }
            }
        }
    }
}
```

**Step 3: Create MainTabView**

`ios/Noonan/Views/MainTabView.swift`:
```swift
import SwiftUI

struct MainTabView: View {
    @ObservedObject var authVM: AuthViewModel

    var body: some View {
        TabView {
            ChatView()
                .tabItem {
                    Label("Chat", systemImage: "message.fill")
                }

            RoundsView()
                .tabItem {
                    Label("My Rounds", systemImage: "flag.fill")
                }

            ProfileView(authVM: authVM)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .tint(.green)
    }
}
```

**Step 4: Create placeholder views for Rounds and Profile (filled in next tasks)**

`ios/Noonan/Views/RoundsView.swift`:
```swift
import SwiftUI

struct RoundsView: View {
    var body: some View {
        NavigationStack {
            Text("No rounds yet. Go talk to Noonan!")
                .foregroundColor(.secondary)
                .navigationTitle("My Rounds")
        }
    }
}
```

`ios/Noonan/Views/ProfileView.swift`:
```swift
import SwiftUI

struct ProfileView: View {
    @ObservedObject var authVM: AuthViewModel

    var body: some View {
        NavigationStack {
            List {
                Button("Sign Out", role: .destructive) {
                    Task { await authVM.signOut() }
                }
            }
            .navigationTitle("Profile")
        }
    }
}
```

**Step 5: Build and verify**

Build on simulator. The app should show auth screen, and after sign-in, show the tab bar with the chat interface.

**Step 6: Commit**

```bash
git add ios/Noonan/Views/
git commit -m "feat: add chat UI, message bubbles, tab bar, and placeholder views"
```

---

### Task 11: Rounds History View

**Files:**
- Modify: `ios/Noonan/Views/RoundsView.swift`
- Create: `ios/Noonan/ViewModels/RoundsViewModel.swift`

**Step 1: Create RoundsViewModel**

`ios/Noonan/ViewModels/RoundsViewModel.swift`:
```swift
import Foundation

@MainActor
class RoundsViewModel: ObservableObject {
    @Published var rounds: [Round] = []
    @Published var isLoading = false

    func loadRounds() async {
        isLoading = true
        do {
            rounds = try await supabase
                .from("rounds")
                .select("*, courses(*)")
                .order("date_played", ascending: false)
                .execute()
                .value
        } catch {
            print("Load rounds error: \(error)")
        }
        isLoading = false
    }
}
```

**Step 2: Update RoundsView**

Replace `ios/Noonan/Views/RoundsView.swift`:

```swift
import SwiftUI

struct RoundsView: View {
    @StateObject private var viewModel = RoundsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if viewModel.rounds.isEmpty {
                    ContentUnavailableView(
                        "No Rounds Yet",
                        systemImage: "flag.slash",
                        description: Text("Tell Noonan about your next round!")
                    )
                } else {
                    List(viewModel.rounds) { round in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(round.course?.name ?? "Unknown Course")
                                    .font(.headline)
                                Spacer()
                                if let score = round.score {
                                    Text("\(score)")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.green)
                                }
                            }

                            Text(round.datePlayed)
                                .font(.caption)
                                .foregroundColor(.secondary)

                            if let highlights = round.highlights {
                                Text(highlights)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .lineLimit(2)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("My Rounds")
            .task {
                await viewModel.loadRounds()
            }
            .refreshable {
                await viewModel.loadRounds()
            }
        }
    }
}
```

**Step 3: Build and verify**

Build on simulator.

**Step 4: Commit**

```bash
git add ios/Noonan/Views/RoundsView.swift ios/Noonan/ViewModels/RoundsViewModel.swift
git commit -m "feat: add rounds history view with course name and score display"
```

---

### Task 12: Profile View

**Files:**
- Modify: `ios/Noonan/Views/ProfileView.swift`
- Create: `ios/Noonan/ViewModels/ProfileViewModel.swift`

**Step 1: Create ProfileViewModel**

`ios/Noonan/ViewModels/ProfileViewModel.swift`:
```swift
import Foundation

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: AppUser?
    @Published var isLoading = false

    func loadProfile() async {
        isLoading = true
        do {
            let session = try await supabase.auth.session
            user = try await supabase
                .from("users")
                .select()
                .eq("id", value: session.user.id)
                .single()
                .execute()
                .value
        } catch {
            print("Load profile error: \(error)")
        }
        isLoading = false
    }

    func updateDisplayName(_ name: String) async {
        guard let userId = user?.id else { return }
        do {
            try await supabase
                .from("users")
                .update(["display_name": name])
                .eq("id", value: userId)
                .execute()
            user?.displayName = name
        } catch {
            print("Update name error: \(error)")
        }
    }

    func updateHandicap(_ handicap: Double?) async {
        guard let userId = user?.id else { return }
        do {
            try await supabase
                .from("users")
                .update(["handicap": handicap as Any])
                .eq("id", value: userId)
                .execute()
            user?.handicap = handicap
        } catch {
            print("Update handicap error: \(error)")
        }
    }
}
```

**Step 2: Update ProfileView**

Replace `ios/Noonan/Views/ProfileView.swift`:

```swift
import SwiftUI

struct ProfileView: View {
    @ObservedObject var authVM: AuthViewModel
    @StateObject private var viewModel = ProfileViewModel()
    @State private var displayName = ""
    @State private var handicapText = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Your Info") {
                    TextField("Display Name", text: $displayName)
                        .onSubmit {
                            Task { await viewModel.updateDisplayName(displayName) }
                        }

                    TextField("Handicap", text: $handicapText)
                        .keyboardType(.decimalPad)
                        .onSubmit {
                            let handicap = Double(handicapText)
                            Task { await viewModel.updateHandicap(handicap) }
                        }
                }

                Section {
                    Button("Sign Out", role: .destructive) {
                        Task { await authVM.signOut() }
                    }
                }
            }
            .navigationTitle("Profile")
            .task {
                await viewModel.loadProfile()
                displayName = viewModel.user?.displayName ?? ""
                if let h = viewModel.user?.handicap {
                    handicapText = String(format: "%.1f", h)
                }
            }
        }
    }
}
```

**Step 3: Build and verify**

Build on simulator.

**Step 4: Commit**

```bash
git add ios/Noonan/Views/ProfileView.swift ios/Noonan/ViewModels/ProfileViewModel.swift
git commit -m "feat: add profile view with display name and handicap editing"
```

---

## Phase 4: Deploy & Polish

### Task 13: Deploy Edge Functions & Configure Secrets

**Step 1: Deploy all Edge Functions**

```bash
cd /Users/olken/Projects/noonan
npx supabase functions deploy chat
npx supabase functions deploy update-memory
npx supabase functions deploy courses
```

**Step 2: Set secrets in Supabase**

```bash
npx supabase secrets set ANTHROPIC_API_KEY=<your-anthropic-api-key>
npx supabase secrets set GOLF_COURSE_API_KEY=<your-golf-course-api-key>
```

**Step 3: Test end-to-end**

Build the iOS app on simulator, sign in, and have a conversation with Noonan. Verify:
- Messages send and receive
- Noonan responds in character
- Round data gets extracted and appears in My Rounds
- Memory updates work (have a second conversation and see if Noonan references the first)

**Step 4: Commit any config fixes**

```bash
git add -A
git commit -m "chore: deployment configuration and fixes"
```

---

### Task 14: App Icon & Branding

**Files:**
- Modify: `ios/Noonan/Assets.xcassets/AppIcon.appiconset/`
- Create: `ios/Noonan/Theme.swift`

**Step 1: Create a theme file**

`ios/Noonan/Theme.swift`:
```swift
import SwiftUI

enum NoonanTheme {
    static let primary = Color.green
    static let background = Color(.systemBackground)
    static let userBubble = Color.green
    static let assistantBubble = Color(.systemGray5)
}
```

**Step 2: Create app icon**

Design or generate an app icon - a golf-themed icon with the Noonan character/caddy vibe. Export at 1024x1024 and add to the AppIcon asset catalog in Xcode.

**Step 3: Commit**

```bash
git add ios/Noonan/Theme.swift ios/Noonan/Assets.xcassets/
git commit -m "feat: add app theme and icon"
```

---

## Phase 5: Marketing Page

### Task 15: Marketing Page

**Files:**
- Create: `web/` directory with Next.js project

**Step 1: Scaffold Next.js project**

```bash
cd /Users/olken/Projects/noonan
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

**Step 2: Build the landing page**

Use the `frontend-design` skill to build the marketing page with these sections:

1. **Hero** - "The only person who actually cares about your golf game." with chat UI mockup
2. **The Problem** - "Nobody wants to hear about your round." Funny, relatable copy.
3. **How It Works** - Three cards: Pre-Round Prep, Post-Round Recap, Your Golf Memory
4. **Meet Noonan** - Character introduction with sample chat exchanges
5. **Download CTA** - App Store badge + email signup

**Visual direction:**
- Green palette (golf course greens: #2D5016, #4A7C2E, #6BA344)
- Casual, slightly retro typography (consider Inter or similar)
- Clean but fun - not enterprise
- Mobile-responsive

**Step 3: Deploy to Vercel**

```bash
cd web
npx vercel --prod
```

**Step 4: Commit**

```bash
git add web/
git commit -m "feat: add marketing landing page"
```

---

## Phase 6: App Store Prep

### Task 16: App Store Submission Prep

**Step 1: Configure app metadata in Xcode**

- Bundle ID, version 1.0.0, build number 1
- App category: Sports
- Privacy policy URL (create a simple one)

**Step 2: Create App Store listing**

In App Store Connect:
- App name: Noonan
- Subtitle: "Your AI Golf Caddy"
- Description: Focus on the "only person who cares about your golf game" angle
- Keywords: golf, caddy, AI, golf companion, golf tracker, caddyshack
- Screenshots from simulator (6.7" and 6.1")

**Step 3: Submit for review**

Archive and upload from Xcode, submit for App Store review.

**Step 4: Commit any final changes**

```bash
git add -A
git commit -m "chore: App Store submission prep"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1. Foundation | Tasks 1-2 | iOS project scaffold, Supabase database |
| 2. Backend | Tasks 3-5 | Chat, memory, and course Edge Functions |
| 3. iOS App | Tasks 6-12 | Full working iOS app with chat, rounds, profile |
| 4. Deploy | Tasks 13-14 | Live backend, branding |
| 5. Marketing | Task 15 | Landing page on Vercel |
| 6. App Store | Task 16 | App Store submission |
