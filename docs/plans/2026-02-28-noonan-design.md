# Noonan - Design Document

**Date:** 2026-02-28
**Status:** Approved

## One-Liner

Noonan is the only person in the world who actually cares about your golf game.

## Target User

Casual weekend golfer. Plays a few times a month, shoots 90-110, just wants someone to talk golf with and feel good about their game.

## Product Concept

Chat-first iOS app powered by Claude. The app IS the conversation with Noonan. Everything - logging rounds, pre-round prep, getting tips - flows through natural conversation. Noonan extracts and stores structured data behind the scenes.

**Approach:** Chat-first for v1, evolving toward a hybrid with quick actions and round history views over time.

## Noonan's Personality

Noonan is your loyal caddy. Danny Noonan energy from Caddyshack - scrappy, earnest, genuinely invested in your success. The everyman who carries your bag and believes in you.

**Tone guidelines:**
- Talks like a real person, not a golf textbook. "Dude, three birdies? That's sick." not "Excellent performance on those holes."
- Remembers specifics and brings them up naturally. "Wait, wasn't 16 the hole that ate your lunch last time?"
- Pre-round: hypes you up, sets mental game. References past struggles from memory.
- Post-round: genuinely curious, celebrates wins, normalizes bad rounds.
- Never condescending. Never robotic. Never generic motivational poster quotes.
- Occasional Caddyshack references woven in naturally, not forced.

## Three Interaction Modes

1. **Pre-round prep** - Noonan helps you get your head right. Asks where you're playing, what you want to focus on, gives a short mindset prompt based on your history.
2. **Post-round recap** - The core loop. Tell Noonan how it went. He reacts, asks questions, extracts round data, remembers it all.
3. **Anytime chat** - Talk golf whenever. Ask about your stats, vent about your slice, get a tip.

## Architecture & Tech Stack

### iOS App (SwiftUI)
- Native Swift/SwiftUI, targeting iOS 17+
- Single primary screen: chat with Noonan
- Simple tab bar: Chat, My Rounds (history list), Profile/Settings
- Text-based input (voice is a future feature)

### AI Backend (Claude API)
- Claude API calls routed through Supabase Edge Functions (never direct from client)
- System prompt defines Noonan's personality, tone, and data extraction instructions
- Each API call includes: system prompt + player memory summary + recent conversation messages

### Supabase
- **Auth:** Apple Sign-In (required for App Store) + email/password
- **Database:** Postgres with RLS - users, rounds, messages, player memory
- **Edge Functions:** API layer between iOS app and Claude. Handles auth, constructs Claude payload with memory, processes responses, extracts/stores round data

### Golf Course Data
- GolfCourseAPI (free tier, ~30k courses)
- Cache course data in Supabase after first lookup
- Used for autocomplete when Noonan asks "where'd you play?"

### Marketing Page
- Next.js + Tailwind, hosted on Vercel
- App Store link, character introduction, vibe, screenshots

## Data Model

### `users`
- `id` (uuid, PK) - from Supabase Auth
- `display_name` (text)
- `handicap` (numeric, nullable)
- `home_course_id` (uuid, nullable, FK to courses)
- `created_at`, `updated_at`

### `courses`
- `id` (uuid, PK)
- `external_id` (text) - GolfCourseAPI ID
- `name` (text)
- `city`, `state`, `country` (text)
- `par` (integer)
- `cached_at` (timestamp)

### `rounds`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `course_id` (uuid, FK, nullable)
- `score` (integer, nullable)
- `date_played` (date)
- `highlights` (text) - AI-extracted summary
- `mood` (text, nullable)
- `created_at`

### `conversations`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `round_id` (uuid, FK, nullable)
- `conversation_type` (text) - 'pre_round', 'post_round', 'general'
- `started_at`, `last_message_at`

### `messages`
- `id` (uuid, PK)
- `conversation_id` (uuid, FK)
- `role` (text) - 'user' or 'assistant'
- `content` (text)
- `created_at`

### `player_memory`
- `id` (uuid, PK)
- `user_id` (uuid, FK, unique)
- `summary` (text) - AI-generated running summary of the player
- `last_updated` (timestamp)

**Memory design:** Single evolving document per user. After each conversation, an Edge Function asks Claude to update the memory summary with new insights. Keeps context payload small and focused.

## v1 Features

- Chat with Noonan (core experience)
- Pre-round prep (mindset, focus, course lookup)
- Post-round recap (reactions, questions, data extraction)
- Round history (simple chronological list with summaries)
- Profile/settings (name, home course, handicap)

## NOT in v1

- Hole-by-hole scoring
- Stats/trends dashboard
- Voice input
- Push notifications
- Social features
- On-course live companion mode

## Launch Strategy

- Real product, App Store launch
- Free to start, monetization figured out later
- Marketing page to drive downloads

## Marketing Page Structure

1. **Hero** - "The only person who actually cares about your golf game." App Store button + chat mockup.
2. **The Problem** - "Nobody wants to hear about your round." Funny, relatable copy.
3. **How It Works** - Three cards: Pre-Round Prep, Post-Round Recap, Your Golf Memory.
4. **Meet Noonan** - Character introduction, sample exchanges.
5. **Download CTA** - App Store badge, email signup.

**Visual direction:** Green palette (golf course greens), casual/slightly retro feel, approachable typography. Fun, not enterprise.
