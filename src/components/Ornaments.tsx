// Reusable SVG decorative ornaments — line-florals, blobs, dividers.
// All use `currentColor` so they inherit text color (typically gold).

export const FloralCorner = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    style={flip ? { transform: "scaleX(-1)" } : undefined}
    fill="none"
    stroke="currentColor"
    strokeWidth="0.6"
    aria-hidden
  >
    <path d="M10 190 Q 60 140 80 80 Q 95 30 150 15" strokeLinecap="round" />
    {/* leaves */}
    <path d="M40 150 q 12 -6 18 -18 q -14 0 -18 18 z" />
    <path d="M62 118 q 14 -4 22 -16 q -16 -2 -22 16 z" />
    <path d="M82 78 q 14 -2 22 -14 q -16 -4 -22 14 z" />
    <path d="M108 48 q 14 0 22 -10 q -16 -8 -22 10 z" />
    {/* tiny flower */}
    <g transform="translate(150 15)">
      <circle r="2.5" fill="currentColor" stroke="none" />
      <ellipse cx="0" cy="-7" rx="3" ry="5" />
      <ellipse cx="6" cy="-3" rx="3" ry="5" transform="rotate(72)" />
      <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(144)" />
      <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(216)" />
      <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(288)" />
    </g>
  </svg>
);

export const Laurel = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 240 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.7" aria-hidden>
    <path d="M10 40 Q 120 -10 230 40" strokeLinecap="round" />
    <path d="M10 40 Q 120 90 230 40" strokeLinecap="round" />
    {[30, 60, 90, 120, 150, 180, 210].map((x, i) => (
      <g key={i} transform={`translate(${x} 40)`}>
        <ellipse cx="0" cy="-12" rx="4" ry="9" transform={`rotate(${(x - 120) / 4})`} />
        <ellipse cx="0" cy="12" rx="4" ry="9" transform={`rotate(${-(x - 120) / 4})`} />
      </g>
    ))}
    <circle cx="120" cy="40" r="3" fill="currentColor" stroke="none" />
  </svg>
);

export const SunMotif = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.5" aria-hidden>
    <circle cx="100" cy="100" r="40" />
    <circle cx="100" cy="100" r="55" strokeDasharray="1 4" />
    {Array.from({ length: 24 }).map((_, i) => {
      const a = (i * Math.PI * 2) / 24;
      const x1 = 100 + Math.cos(a) * 65;
      const y1 = 100 + Math.sin(a) * 65;
      const x2 = 100 + Math.cos(a) * (i % 2 === 0 ? 88 : 78);
      const y2 = 100 + Math.sin(a) * (i % 2 === 0 ? 88 : 78);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" />;
    })}
  </svg>
);

export const OrnamentDivider = ({ className = "" }: { className?: string }) => (
  <div className={`ornament-divider ${className}`}>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden>
      <path d="M7 1 L8.5 5.5 L13 7 L8.5 8.5 L7 13 L5.5 8.5 L1 7 L5.5 5.5 Z" />
    </svg>
  </div>
);

export const BlobBackdrop = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 600 600" className={className} aria-hidden>
    <defs>
      <radialGradient id="blob1" cx="50%" cy="50%">
        <stop offset="0%" stopColor="hsl(var(--rose-soft))" stopOpacity="0.7" />
        <stop offset="100%" stopColor="hsl(var(--rose-soft))" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="300" cy="300" rx="280" ry="240" fill="url(#blob1)" />
  </svg>
);
