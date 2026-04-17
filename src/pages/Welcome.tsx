import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Wordmark } from "@/components/Wordmark";

const PROMISES = [
  "Cycle tracking with clinical depth",
  "Bloods upload and AI-led interpretation",
  "Personalised supplement protocols",
  "Privacy-first. We never sell your data.",
];

const Welcome = () => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8">
        <Wordmark size="sm" />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center px-6 max-w-xl mx-auto w-full animate-fade-up">
        <p className="eyebrow mb-6">Hormone health, every phase</p>
        <h1 className="font-serif text-5xl sm:text-6xl leading-[1.05] text-foreground tracking-tight">
          Your hormones,
          <br />
          <span className="italic text-gold-bright">understood.</span>
        </h1>
        <p className="mt-6 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md">
          One app. Every phase of your life. From your first cycle to long past your last.
        </p>

        <ul className="mt-10 space-y-3">
          {PROMISES.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <span className="mt-2 inline-block w-1 h-1 bg-gold rounded-full flex-shrink-0" />
              <span className="text-foreground/90 text-[15px]">{p}</span>
            </li>
          ))}
        </ul>
      </main>

      {/* Footer CTA */}
      <footer className="px-6 pb-10 pt-6 max-w-xl mx-auto w-full">
        <Link
          to="/onboarding/age"
          className="group w-full flex items-center justify-between bg-gold hover:bg-gold-bright transition-colors text-background font-medium rounded-sm px-6 py-4"
        >
          <span className="text-[15px]">Start</span>
          <ChevronRight
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
        <p className="mt-4 text-text-dim text-xs text-center">
          Takes about 3 minutes. We'll ask you a few questions.
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
