import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Wordmark } from "@/components/Wordmark";
import { GoldRule, HormoneCurve, OrnamentDivider } from "@/components/Ornaments";

const PROMISES = [
  {
    title: "Clinical depth",
    body: "Cycle tracking that goes beyond prediction. Phase-aware insight, symptom correlation, trend analysis.",
  },
  {
    title: "Bloods, decoded",
    body: "Upload your panels, we translate the numbers into action. Trended over time, always in context.",
  },
  {
    title: "Protocols, personal",
    body: "Supplement and lifestyle guidance generated from your actual data, never a generic template.",
  },
  {
    title: "Privacy, absolute",
    body: "Medical-grade encryption. No data sold, ever. Delete anything at any time.",
  },
];

const Welcome = () => {
  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      {/* Soft gold halos, ivory atmosphere */}
      <div
        className="pointer-events-none absolute top-1/4 right-0 w-[640px] h-[640px] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"
        style={{ background: "hsl(var(--gold-soft) / 0.7)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"
        style={{ background: "hsl(var(--gold) / 0.12)" }}
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 lg:px-20 pt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Wordmark size="sm" variant="text-only" />
          <span className="hidden md:block eyebrow">Hormone health, every phase.</span>
        </div>
      </header>

      {/* Hero — split on desktop, stacked on mobile */}
      <main className="relative z-10 px-6 md:px-12 lg:px-20 pt-12 md:pt-16 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <div className="animate-fade-up">
            <p className="eyebrow mb-6">Hormone health, every phase.</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] leading-[0.95] text-foreground tracking-tight">
              Your body,
              <br />
              <span className="italic font-serif text-gold">understood.</span>
            </h1>

            <div className="mt-8 max-w-md">
              <OrnamentDivider className="justify-start" />
            </div>

            <p className="mt-8 text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-lg font-light">
              Clinical-grade tracking. Your bloods, decoded. Supplement protocols tuned to you. Built for every phase of your hormonal life.
            </p>

            <ul className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-6 max-w-2xl">
              {PROMISES.map((p) => (
                <li key={p.title} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gold">
                    <span className="gold-bar" aria-hidden />
                    <span className="font-serif text-lg text-foreground">{p.title}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed pl-10">{p.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-5">
              <Link to="/onboarding/age" className="btn-primary group text-base px-8 py-4">
                <span>Begin</span>
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="text-text-dim text-xs sm:text-sm">
                Takes 3 minutes.<br className="hidden sm:block" /> Uses what you tell us.
              </p>
            </div>
          </div>

          {/* Right — framed logo plate, treated like an editorial ad */}
          <div className="relative animate-fade-in order-first lg:order-last">
            <div className="relative aspect-[3/4] lg:aspect-[4/5] rounded-sm overflow-hidden card-elevated bg-cream flex items-center justify-center p-8 lg:p-12">
              <Wordmark variant="full" size="lg" className="scale-110" />

              {/* Subtle hormone curve as editorial backdrop */}
              <div
                className="absolute inset-x-6 bottom-6 text-gold pointer-events-none"
                style={{ opacity: 0.18 }}
                aria-hidden
              >
                <HormoneCurve className="w-full h-auto" />
              </div>

              {/* Caption plate */}
              <div className="absolute bottom-6 left-6 right-6 glass-card rounded-sm px-5 py-4">
                <div className="text-gold mb-2"><GoldRule /></div>
                <p className="font-serif italic text-foreground/90 text-sm leading-snug text-center">
                  A new standard for women's health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer band */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-20 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-border-soft">
          <p className="eyebrow">Anadya · Hormone health · 2026</p>
          <p className="text-text-dim text-xs">Privacy first. Encrypted. Yours.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
