// Reusable SVG decorative ornaments. All use `currentColor` so they inherit text colour.

export const OrnamentDivider = ({ className = "" }: { className?: string }) => (
  <div className={`ornament-divider ${className}`}>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden>
      <path d="M7 1 L8.5 5.5 L13 7 L8.5 8.5 L7 13 L5.5 8.5 L1 7 L5.5 5.5 Z" />
    </svg>
  </div>
);

/** Simple horizontal gold line with optional centre dot. Section divider. */
export const GoldRule = ({
  className = "",
  withDot = true,
}: {
  className?: string;
  withDot?: boolean;
}) => (
  <div className={`flex items-center gap-3 text-gold ${className}`}>
    <span
      className="flex-1 h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.7), transparent)" }}
      aria-hidden
    />
    {withDot && (
      <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden>
        <circle cx="3" cy="3" r="1.4" fill="currentColor" />
      </svg>
    )}
    <span
      className="flex-1 h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.7), transparent)" }}
      aria-hidden
    />
  </div>
);

/**
 * Abstract editorial chart of a typical 28-day hormone cycle.
 * Three curves: oestrogen, LH, progesterone. Gold on transparent.
 */
export const HormoneCurve = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 600 240"
    className={className}
    fill="none"
    stroke="currentColor"
    aria-hidden
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Axis */}
    <line x1="20" y1="210" x2="580" y2="210" strokeWidth="0.5" opacity="0.5" />
    <line x1="20" y1="30" x2="20" y2="210" strokeWidth="0.5" opacity="0.5" />

    {/* Oestrogen — rises to ovulation peak, second hump in luteal */}
    <path
      d="M20 180 C 80 175, 130 150, 180 90 C 220 45, 260 75, 300 115 C 340 90, 400 80, 460 130 C 510 170, 560 195, 580 200"
      strokeWidth="1.2"
      opacity="0.9"
    />
    {/* LH surge — single sharp peak at ovulation */}
    <path
      d="M20 200 L 180 200 L 200 60 L 220 200 L 580 200"
      strokeWidth="1"
      opacity="0.7"
      strokeDasharray="3 3"
    />
    {/* Progesterone — rises in luteal only */}
    <path
      d="M20 200 C 100 200, 180 200, 230 195 C 280 185, 340 80, 400 75 C 460 80, 520 180, 580 200"
      strokeWidth="1"
      opacity="0.55"
    />

    {/* Phase labels */}
    <g
      fontFamily="Inter, sans-serif"
      fontSize="8"
      letterSpacing="2"
      fill="currentColor"
      stroke="none"
      opacity="0.55"
      textAnchor="middle"
    >
      <text x="60" y="228">MENSTRUAL</text>
      <text x="180" y="228">FOLLICULAR</text>
      <text x="320" y="228">OVULATION</text>
      <text x="480" y="228">LUTEAL</text>
    </g>
  </svg>
);
