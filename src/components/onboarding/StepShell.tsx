import { ReactNode } from "react";
import { Wordmark } from "@/components/Wordmark";
import { FloralCorner, OrnamentDivider } from "@/components/Ornaments";
import botanicalSprig from "@/assets/botanical-sprig.png";

interface StepShellProps {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * Shared layout for every onboarding step.
 * Mobile: single column with sticky footer.
 * Desktop: full-bleed immersive — content card floats over decorative canvas.
 */
export const StepShell = ({
  step,
  totalSteps,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: StepShellProps) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 text-gold/30 hidden lg:block">
        <FloralCorner className="w-full h-full" />
      </div>
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-rose-soft/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 w-[400px] h-[400px] rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <img
        src={botanicalSprig}
        alt=""
        aria-hidden
        loading="lazy"
        className="hidden lg:block absolute bottom-10 right-10 w-40 opacity-60 -rotate-12 pointer-events-none"
        width={1024}
        height={1536}
      />

      {/* Top bar with progress */}
      <header className="relative z-10 px-6 md:px-12 lg:px-20 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <Wordmark size="sm" />
            <span className="eyebrow">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="h-px bg-border-soft w-full overflow-hidden rounded-full">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, hsl(var(--gold-dim)), hsl(var(--gold-bright)))",
              }}
              aria-hidden
            />
          </div>
        </div>
      </header>

      {/* Content — centered card on desktop, plain on mobile */}
      <main className="relative z-10 px-6 md:px-12 lg:px-20 py-6 lg:py-12 pb-32 lg:pb-32">
        <div className="max-w-2xl lg:max-w-3xl mx-auto animate-fade-up">
          <div className="lg:glass-card lg:rounded-sm lg:px-12 lg:py-14">
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-foreground mb-4 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <>
                <div className="my-6 max-w-xs"><OrnamentDivider className="justify-start" /></div>
                <p className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-10 font-light max-w-xl">
                  {subtitle}
                </p>
              </>
            )}
            <div className="mt-2">{children}</div>
          </div>
        </div>
      </main>

      {/* Footer (sticky on mobile, floating bar on desktop) */}
      <footer className="fixed bottom-0 inset-x-0 z-20 bg-cream/85 backdrop-blur-md border-t border-border-soft">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-4">
          {footer}
        </div>
      </footer>
    </div>
  );
};
