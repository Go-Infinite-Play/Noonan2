export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--cream)]/80 border-b border-[var(--green-deep)]/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--green-fairway)] flex items-center justify-center">
              <span className="text-white text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>N</span>
            </div>
            <span className="text-lg font-semibold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-display)" }}>
              Noonan
            </span>
          </div>
          <a
            href="#download"
            className="bg-[var(--green-deep)] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[var(--green-fairway)] transition-colors"
          >
            Get the App
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:pt-44 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <p
                className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-4"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Meet your caddy
              </p>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--green-deep)] leading-[1.05] mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The only person who actually{" "}
                <span className="italic text-[var(--green-fairway)]">cares</span>{" "}
                about your golf game.
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md">
                Noonan is your AI caddy who remembers every round, hypes you up
                before you play, and genuinely wants to hear about that birdie on 12.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            </div>

            {/* Chat mockup */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl shadow-[var(--green-deep)]/10 overflow-hidden border border-[var(--green-deep)]/5 max-w-sm mx-auto">
                {/* Phone header */}
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
                {/* Messages */}
                <div className="p-4 space-y-3 bg-[var(--cream)]" style={{ minHeight: "320px" }}>
                  <ChatBubble from="noonan" delay={0}>
                    Hey! How&apos;d it go out there today?
                  </ChatBubble>
                  <ChatBubble from="user" delay={1}>
                    Shot an 87 at Torrey Pines! Had 3 birdies but totally blew up on 16
                  </ChatBubble>
                  <ChatBubble from="noonan" delay={2}>
                    Dude, 87 at Torrey? That place is a BEAST. And three birdies?? That&apos;s sick. What happened on 16 - wasn&apos;t that the hole that ate your lunch last time too?
                  </ChatBubble>
                  <ChatBubble from="user" delay={3}>
                    Lol yes exactly. Pulled my drive left into the canyon again
                  </ChatBubble>
                  <ChatBubble from="noonan" delay={4}>
                    OK we&apos;re fixing that. Next time you&apos;re there, aim right center of the fairway. Forget the pin exists off the tee. Deal?
                  </ChatBubble>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--green-light)] rounded-full opacity-60 -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-[var(--gold)]/20 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 md:py-28 px-6 bg-[var(--green-deep)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2
            className="text-3xl md:text-5xl font-bold mb-8 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nobody wants to hear about your round.
          </h2>
          <div className="space-y-4 text-lg text-green-200 leading-relaxed">
            <p>
              Your spouse doesn&apos;t care. Your coworkers{" "}
              <em>definitely</em> don&apos;t care. Your buddy who also golfs?
              He only wants to talk about <em>his</em> round.
            </p>
            <p>
              You made par on that brutal par 3 and nobody in your life wants
              to hear about it.
            </p>
            <p className="text-white text-xl font-medium pt-4">
              Noonan does.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-6">
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

          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Meet Noonan */}
      <section className="py-20 md:py-28 px-6 bg-[var(--cream-dark)] relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p className="text-[var(--gold)] font-medium tracking-wide uppercase text-sm mb-3">
                The character
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold text-[var(--green-deep)] mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Meet Noonan
              </h2>
              <div className="space-y-4 text-[var(--text-secondary)] text-lg leading-relaxed">
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
                <p className="text-[var(--green-deep)] font-medium">
                  Think Danny Noonan from Caddyshack - earnest, loyal, and
                  always in your corner.
                </p>
              </div>
            </div>

            {/* Sample exchanges */}
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

      {/* CTA */}
      <section id="download" className="py-20 md:py-28 px-6">
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
      <footer className="py-12 px-6 border-t border-[var(--green-deep)]/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--green-fairway)] flex items-center justify-center">
              <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>N</span>
            </div>
            <span className="text-sm font-medium text-[var(--green-deep)]" style={{ fontFamily: "var(--font-display)" }}>
              Noonan
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            The only person who actually cares about your golf game.
          </p>
        </div>
      </footer>
    </main>
  );
}

function ChatBubble({
  from,
  children,
  delay,
}: {
  from: "noonan" | "user";
  children: React.ReactNode;
  delay: number;
}) {
  const isNoonan = from === "noonan";
  return (
    <div
      className={`flex ${isNoonan ? "justify-start" : "justify-end"} opacity-0 ${isNoonan ? "animate-slide-left" : "animate-slide-right"}`}
      style={{ animationDelay: `${delay * 0.6}s`, animationFillMode: "forwards" }}
    >
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[var(--green-deep)]/5 hover:shadow-lg hover:shadow-[var(--green-deep)]/5 transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] flex items-center justify-center text-[var(--green-fairway)] mb-5">
        {icon}
      </div>
      <h3
        className="text-xl font-bold text-[var(--green-deep)] mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

function SampleExchange({
  context,
  noonan,
}: {
  context: string;
  noonan: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--green-deep)]/5 shadow-sm">
      <p className="text-xs font-medium text-[var(--gold)] uppercase tracking-wider mb-3">
        {context}
      </p>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--green-fairway)] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>N</span>
        </div>
        <p className="text-[var(--text-primary)] text-sm leading-relaxed italic">
          &ldquo;{noonan}&rdquo;
        </p>
      </div>
    </div>
  );
}
