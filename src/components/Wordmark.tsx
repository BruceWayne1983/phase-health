import logoImage from "@/assets/anadya-logo.jpeg";

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "text-only" | "mark-only";
  className?: string;
}

/**
 * Anadya wordmark. Uses the master brand logo asset for full / mark variants.
 * The text-only variant is a typographic fallback for small contexts (nav, mobile headers).
 */
export const Wordmark = ({ size = "md", variant = "text-only", className = "" }: WordmarkProps) => {
  const heights: Record<NonNullable<WordmarkProps["size"]>, string> = {
    sm: "h-10",
    md: "h-16",
    lg: "h-28",
  };
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-4xl" : "text-2xl";
  const tracking = size === "lg" ? "tracking-[0.28em]" : "tracking-[0.36em]";

  if (variant === "full" || variant === "mark-only") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={logoImage}
          alt="Anadya"
          className={`${heights[size]} w-auto object-contain select-none`}
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // text-only fallback, still ornamented
  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-gold">
        <span className="gold-bar" aria-hidden />
        <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden>
          <circle cx="3" cy="3" r="1.2" fill="currentColor" />
        </svg>
        <span className="gold-bar" aria-hidden />
      </div>
      <span
        className={`font-serif ${textSize} ${tracking} text-foreground uppercase`}
        style={{ fontWeight: 400 }}
      >
        Anadya
      </span>
    </div>
  );
};
