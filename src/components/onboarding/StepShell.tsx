import { ReactNode } from "react";

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
 * Mobile-first: single column, generous whitespace, sticky footer with CTAs.
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
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Top bar with progress */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow">
            Step {step} of {totalSteps}
          </span>
          <span className="eyebrow">Anadya</span>
        </div>
        <div className="h-px bg-border w-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 pb-32 max-w-xl mx-auto w-full animate-fade-up">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="font-serif text-3xl sm:text-4xl leading-[1.1] text-foreground mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-10">
            {subtitle}
          </p>
        )}
        <div className="mt-2">{children}</div>
      </main>

      {/* Footer (sticky) */}
      <footer className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {footer}
        </div>
      </footer>
    </div>
  );
};
