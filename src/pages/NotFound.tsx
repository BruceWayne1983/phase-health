import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Wordmark } from "@/components/Wordmark";
import { OrnamentDivider } from "@/components/Ornaments";
import { ChevronRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      <div
        className="pointer-events-none absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full blur-3xl translate-x-1/3"
        style={{ background: "hsl(var(--gold-soft) / 0.6)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"
        style={{ background: "hsl(var(--gold) / 0.12)" }}
        aria-hidden
      />

      <header className="relative z-10 px-6 md:px-12 lg:px-20 pt-8">
        <Wordmark size="sm" variant="text-only" />
      </header>

      <main className="relative z-10 px-6 md:px-12 lg:px-20 min-h-[calc(100dvh-120px)] flex items-center justify-center">
        <div className="max-w-xl text-center animate-fade-up">
          <p className="eyebrow mb-5">404</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-foreground tracking-tight mb-6">
            This page has wandered off.
          </h1>
          <div className="my-6 max-w-xs mx-auto"><OrnamentDivider /></div>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-10 font-light">
            Let's get you back to the main flow.
          </p>
          <Link to="/" className="btn-primary group text-base px-8 py-4 inline-flex">
            <span>Back to Anadya</span>
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
