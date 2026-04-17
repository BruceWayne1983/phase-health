interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Anadya wordmark: a 2x24 gold bar above the name, set in Georgia.
 * No icon mark in v1 per brand spec.
 */
export const Wordmark = ({ size = "md", className = "" }: WordmarkProps) => {
  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";
  const tracking = size === "lg" ? "tracking-[0.18em]" : "tracking-[0.22em]";
  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <span className="gold-bar" aria-hidden />
      <span
        className={`font-serif ${textSize} ${tracking} text-foreground`}
        style={{ fontWeight: 400 }}
      >
        ANADYA
      </span>
    </div>
  );
};
