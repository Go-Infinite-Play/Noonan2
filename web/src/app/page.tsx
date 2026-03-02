"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Nav - appears over dark hero */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Image
            src="/noonan-logo.png"
            alt="Noonan"
            width={140}
            height={40}
            className="h-8 w-auto brightness-0 invert"
            priority
          />
          <a
            href="#download"
            className="bg-white/10 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-all"
          >
            Get the App
          </a>
        </div>
      </nav>

      <main>
        {/* ===== HERO: FULL VIEWPORT, PERMANENT ===== */}
        <section className="relative min-h-screen flex items-center justify-center bg-[var(--green-deep)] overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.07]"
            style={{
              background: "radial-gradient(circle, rgba(74,155,74,1) 0%, transparent 70%)",
            }}
          />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <StaticHero />

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* ===== TRANSITION: THE ANSWER ===== */}
        <section className="py-24 md:py-32 px-6 bg-[var(--cream)]">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <p className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-4">
                  Meet your caddy
                </p>
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--green-deep)] leading-[1.08] mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  The only person who actually{" "}
                  <span className="italic text-[var(--green-fairway)]">cares</span>{" "}
                  about your golf game.
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md">
                  Noonan is your caddy who remembers every round, hypes you up
                  before you play, and genuinely wants to hear about that birdie on 12.
                </p>
                <a
                  href="#download"
                  className="inline-flex items-center justify-center bg-[var(--green-deep)] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[var(--green-fairway)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Download for iOS
                </a>
              </div>

              {/* Hero chat mockup */}
              <HeroChatMockup />
            </div>
          </div>
        </section>

        {/* ===== LIVE CONVERSATION DEMO ===== */}
        <section className="py-20 md:py-28 px-6 bg-[var(--cream-dark)]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-3">
                See it in action
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold text-[var(--green-deep)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                A real conversation with Noonan
              </h2>
            </div>

            <ScrollChat
              messages={[
                { from: "noonan", text: "Hey! How\u2019d it go out there today?" },
                { from: "user", text: "Shot an 87 at Torrey Pines! Had 3 birdies but totally blew up on 16" },
                { from: "noonan", text: "Dude, 87 at Torrey? That place is a BEAST. And three birdies?? That\u2019s sick. What happened on 16 \u2013 wasn\u2019t that the hole that ate your lunch last time too?" },
                { from: "user", text: "Lol yes exactly. Pulled my drive left into the canyon again" },
                { from: "noonan", text: "OK we\u2019re fixing that. Next time you\u2019re there, aim right center of the fairway. Forget the pin exists off the tee. Deal?" },
                { from: "user", text: "Deal. The 3 birdies were all on the front 9 though, felt like I was on fire" },
                { from: "noonan", text: "That\u2019s what I\u2019m talking about. Your front 9 has been getting better every round. Remember when you couldn\u2019t break 45 on a side? Those days are gone, man." },
              ]}
            />
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-20 md:py-28 px-6 bg-[var(--cream)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-3">
                How it works
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold text-[var(--green-deep)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your caddy for every round
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                }
                title="Pre-Round Prep"
                description="Tell Noonan where you're playing. He'll remember what happened last time, help you set a focus for today, and get your head right before you tee off."
              />
              <FeatureCard
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                }
                title="Post-Round Recap"
                description="The core experience. Tell Noonan how it went. He asks the right questions, celebrates the wins, and remembers everything for next time."
              />
              <FeatureCard
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                }
                title="Your Golf Memory"
                description="Noonan remembers your tendencies, your goals, your nemesis holes. Every conversation makes him a better caddy for you."
              />
            </div>
          </div>
        </section>

        {/* ===== MEET NOONAN ===== */}
        <section className="py-20 md:py-28 px-6 bg-[var(--green-deep)] text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <p className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-3">
                  The character
                </p>
                <h2
                  className="text-3xl md:text-5xl font-bold text-white mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Meet Noonan
                </h2>
                <div className="space-y-4 text-green-200 text-lg leading-relaxed">
                  <p>
                    Noonan is the caddy you always wanted. He&apos;s not some
                    slick golf instructor with a polo and a clipboard. He&apos;s the
                    scrappy kid who carries your bag and genuinely believes
                    you&apos;re about to have the round of your life.
                  </p>
                  <p>
                    He remembers that you&apos;ve been struggling with your driver.
                    He gets fired up when you break 90. He knows hole 7 at your
                    home course is your nemesis. And he&apos;s got your back.
                  </p>
                </div>
                {/* Mascot placeholder */}
                <div className="mt-8 w-48 h-48 rounded-2xl border-2 border-dashed border-green-400/30 flex items-center justify-center">
                  <span className="text-green-400/50 text-sm text-center px-4">Noonan mascot<br />coming soon</span>
                </div>
              </div>

              <div className="space-y-6">
                <SampleExchange
                  context="Pre-round"
                  noonan="Alright, Pebble Beach today? Last time you were there you said you kept overthinking your approach shots. One thought today: pick your target and commit. No second-guessing. You got this."
                />
                <SampleExchange
                  context="After a bad round"
                  noonan="92 is not the end of the world, man. Everybody has those days. But you said your putting felt good - that's huge. The scores will come. What do you want to work on next time out?"
                />
                <SampleExchange
                  context="Celebrating a win"
                  noonan="WAIT. You broke 80?! At YOUR course?? I need details. Every single hole. Start from 1. I'm not going anywhere."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== APP SCREENSHOTS ===== */}
        <section className="py-20 md:py-28 px-6 bg-[var(--cream)]">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-3">
              The app
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-[var(--green-deep)] mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for your game
            </h2>
            <div className="flex gap-6 justify-center overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-64 h-[500px] rounded-3xl border-2 border-dashed border-[var(--green-deep)]/15 flex items-center justify-center shrink-0"
                >
                  <span className="text-[var(--text-muted)] text-sm">Screenshot {i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section id="download" className="py-20 md:py-28 px-6 bg-[var(--cream-dark)]">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-3xl md:text-5xl font-bold text-[var(--green-deep)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your caddy&apos;s waiting
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed">
              Download Noonan and finally have someone who wants to hear
              about your round. Every shot, every hole, every time.
            </p>
            <a
              href="#"
              className="inline-flex items-center justify-center bg-[var(--green-deep)] text-white px-10 py-5 rounded-full text-lg font-medium hover:bg-[var(--green-fairway)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--green-deep)]/20"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download for iOS
            </a>
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              Free to download. No credit card required.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-[var(--green-deep)]/10 bg-[var(--cream)]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/noonan-logo.png"
              alt="Noonan"
              width={100}
              height={28}
              className="h-6 w-auto"
            />
            <p className="text-sm text-[var(--text-muted)]">
              The only person who actually cares about your golf game.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ===== STATIC HERO TEXT ===== */
function StaticHero() {
  return (
    <div className="space-y-8">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Nobody wants to hear about your round.
      </h1>

      <div className="space-y-5 max-w-xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl text-green-200/80 leading-relaxed">
          Your spouse doesn&apos;t care. Your coworkers <span className="text-green-100 font-medium">definitely</span> don&apos;t care.
          Your buddy who also golfs? He only wants to talk about <span className="text-green-100 font-medium">his</span> round.
        </p>
        <p className="text-base sm:text-lg md:text-xl text-green-200/80 leading-relaxed">
          You made par on that brutal par 3 and nobody in your life wants to hear about it.
        </p>
      </div>

      <div className="pt-4">
        <p
          className="text-3xl sm:text-4xl md:text-5xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--gold)" }}
        >
          Noonan does.
        </p>
      </div>

      <div className="pt-4">
        <a
          href="#download"
          className="inline-flex items-center justify-center bg-white text-[var(--green-deep)] px-8 py-4 rounded-full text-base font-semibold hover:bg-green-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Download for iOS
        </a>
        <p className="mt-4 text-sm text-green-300/50">Free. No credit card required.</p>
      </div>
    </div>
  );
}

/* ===== SCROLL-TRIGGERED CHAT ===== */
function ScrollChat({ messages }: { messages: Array<{ from: string; text: string }> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount === 0) {
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= messages.length) clearInterval(interval);
          }, 800);
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [visibleCount, messages.length]);

  return (
    <div ref={containerRef} className="bg-white rounded-3xl shadow-2xl shadow-[var(--green-deep)]/10 overflow-hidden border border-[var(--green-deep)]/5">
      <div className="bg-[var(--green-deep)] text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--green-fairway)] flex items-center justify-center">
            <span className="text-white text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>N</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Noonan</p>
            <p className="text-xs text-green-300">Your caddy</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3 bg-[var(--cream)]" style={{ minHeight: "360px" }}>
        {messages.map((msg, i) => {
          const isNoonan = msg.from === "noonan";
          const isVisible = i < visibleCount;
          return (
            <div
              key={i}
              className={`flex ${isNoonan ? "justify-start" : "justify-end"} transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isNoonan
                    ? "bg-white text-[var(--text-primary)] rounded-bl-md shadow-sm"
                    : "bg-[var(--green-fairway)] text-white rounded-br-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {visibleCount > 0 && visibleCount < messages.length && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-3 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] typing-dot" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] typing-dot" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] typing-dot" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== HERO CHAT MOCKUP ===== */
function HeroChatMockup() {
  return (
    <div className="relative">
      <div className="bg-white rounded-3xl shadow-2xl shadow-[var(--green-deep)]/10 overflow-hidden border border-[var(--green-deep)]/5 max-w-sm mx-auto">
        <div className="bg-[var(--green-deep)] text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--green-fairway)] flex items-center justify-center">
              <span className="text-white text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>N</span>
            </div>
            <div>
              <p className="font-semibold text-sm">Noonan</p>
              <p className="text-xs text-green-300">Your caddy</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3 bg-[var(--cream)]" style={{ minHeight: "280px" }}>
          <StaticBubble from="noonan">
            Alright, Pebble Beach today! Last time you said you were overthinking approaches. One thought: pick your target and commit. You got this.
          </StaticBubble>
          <StaticBubble from="user">
            Let&apos;s go. Feeling good about today
          </StaticBubble>
          <StaticBubble from="noonan">
            That&apos;s what I like to hear. Go get &apos;em, champ. I want to hear about every birdie later.
          </StaticBubble>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--green-light)] rounded-full opacity-60 -z-10" />
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-[var(--gold)]/20 rounded-full -z-10" />
    </div>
  );
}

function StaticBubble({ from, children }: { from: "noonan" | "user"; children: React.ReactNode }) {
  const isNoonan = from === "noonan";
  return (
    <div className={`flex ${isNoonan ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isNoonan
            ? "bg-white text-[var(--text-primary)] rounded-bl-md shadow-sm"
            : "bg-[var(--green-fairway)] text-white rounded-br-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[var(--green-deep)]/5 hover:shadow-lg hover:shadow-[var(--green-deep)]/5 transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] flex items-center justify-center text-[var(--green-fairway)] mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[var(--green-deep)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

function SampleExchange({ context, noonan }: { context: string; noonan: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <p className="text-xs font-medium text-[var(--gold)] uppercase tracking-wider mb-3">
        {context}
      </p>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--green-fairway)] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>N</span>
        </div>
        <p className="text-white/90 text-sm leading-relaxed italic">
          &ldquo;{noonan}&rdquo;
        </p>
      </div>
    </div>
  );
}
