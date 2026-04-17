import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Wordmark } from "@/components/Wordmark";
import { FloralCorner, Laurel, OrnamentDivider } from "@/components/Ornaments";
import heroGoddess from "@/assets/hero-goddess.jpg";
import botanicalSprig from "@/assets/botanical-sprig.png";

const PROMISES = [
  { title: "Clinical depth", body: "Cycle tracking that goes beyond predictions — phase-aware insights, symptom mapping, and trend analysis." },
  { title: "Bloods, understood", body: "Upload your panels. We translate them into language you can act on." },
  { title: "Personal protocols", body: "Supplement and lifestyle guidance tuned to your hormones, your phase, your life." },
  { title: "Privacy, always", body: "Your data is yours. We never sell it. Encrypted at rest, deletable at will." },
];

const Welcome = () => {
  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      {/* Decorative corner florals */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-72 h-72 text-gold/40 hidden md:block">
        <FloralCorner className="w-full h-full" />
      </div>
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 text-gold/30 hidden md:block">
        <FloralCorner className="w-full h-full" flip />
      </div>
      {/* Soft rose halo */}
      <div className="pointer-events-none absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-rose-soft/40 blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl translate-y-1/3 -translate-x-1/4" aria-hidden />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 lg:px-20 pt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Wordmark size="sm" />
          <span className="hidden md:block eyebrow">Hormone health · Every phase</span>
        </div>
      </header>

      {/* Hero — split on desktop, stacked on mobile */}
      <main className="relative z-10 px-6 md:px-12 lg:px-20 pt-12 md:pt-16 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <div className="animate-fade-up">
            <p className="eyebrow mb-6">She who rises</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] leading-[0.95] text-foreground tracking-tight">
              Your body,
              <br />
              <span className="italic font-serif text-rose-deep">understood.</span>
            </h1>

            <div className="mt-8 max-w-md">
              <OrnamentDivider className="justify-start" />
            </div>

            <p className="mt-8 text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-lg font-light">
              One sanctuary for every phase of your hormonal life — from your first cycle, through transition, long past your last.
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
                <span>Begin your ritual</span>
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="text-text-dim text-xs sm:text-sm">
                Three quiet minutes.<br className="hidden sm:block" /> A few honest questions.
              </p>
            </div>
          </div>

          {/* Right — goddess imagery, full-bleed feel */}
          <div className="relative animate-fade-in order-first lg:order-last">
            <div className="relative aspect-[3/4] lg:aspect-[4/5] rounded-sm overflow-hidden card-elevated">
              <img
                src={heroGoddess}
                alt="Anadya — she who rises"
                className="w-full h-full object-cover"
                width={1080}
                height={1920}
              />
              {/* Soft veil */}
              <div className="absolute inset-0 bg-gradient-to-t from-cream/50 via-transparent to-cream/20" />
              {/* Caption plate */}
              <div className="absolute bottom-6 left-6 right-6 glass-card rounded-sm px-5 py-4 flex items-center gap-4">
                <Laurel className="w-12 h-4 text-gold flex-shrink-0" />
                <div>
                  <p className="eyebrow text-[9px]">Anadyomene · ἀναδυομένη</p>
                  <p className="font-serif italic text-foreground/90 text-sm leading-snug mt-0.5">
                    "She who rises from the water."
                  </p>
                </div>
              </div>
            </div>

            {/* Floating botanical sprig */}
            <img
              src={botanicalSprig}
              alt=""
              aria-hidden
              loading="lazy"
              className="hidden md:block absolute -top-10 -right-10 w-32 lg:w-40 opacity-90 rotate-12 pointer-events-none"
              width={1024}
              height={1536}
            />
            <img
              src={botanicalSprig}
              alt=""
              aria-hidden
              loading="lazy"
              className="hidden md:block absolute -bottom-12 -left-12 w-28 lg:w-36 opacity-70 -rotate-[160deg] pointer-events-none"
              width={1024}
              height={1536}
            />
          </div>
        </div>
      </main>

      {/* Footer band */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-20 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-border-soft">
          <p className="eyebrow">Anadya · 2026</p>
          <p className="text-text-dim text-xs">Privacy-first. Encrypted. Yours.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
