interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Anadya wordmark: ornamental gold rule above the name in Cormorant.
 */
export const Wordmark = ({ size = "md", className = "" }: WordmarkProps) => {
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const tracking = size === "lg" ? "tracking-[0.32em]" : "tracking-[0.38em]";
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
