import React from 'react';

interface Props {
  size?: number;
  showText?: boolean;
  monochrome?: boolean;
}

/**
 * DamijBrandLogo
 * Official institutional mark for the Damij platform.
 * Symbolism:
 *  - Two interlocked rings = inclusion / merging of abilities ("دمج")
 *  - Inside the left ring: an abstract hand (sign language)
 *  - Inside the right ring: six dots in a 2x3 grid (Braille cell)
 *  - A horizontal baseline = stable foundation, accessibility
 */
const DamijBrandLogo: React.FC<Props> = ({ size = 140, showText = true, monochrome = false }) => {
  const navy = monochrome ? 'currentColor' : 'hsl(var(--damij-primary))';
  const teal = monochrome ? 'currentColor' : 'hsl(var(--damij-primary-2))';
  const gold = monochrome ? 'currentColor' : 'hsl(var(--damij-accent))';

  return (
    <div className="inline-flex items-center gap-3 select-none" style={{ direction: 'ltr' }}>
      <svg
        viewBox="0 0 140 140"
        width={size}
        height={size}
        role="img"
        aria-label="Damij platform logo"
      >
        <defs>
          <linearGradient id="damijRingL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={navy} />
            <stop offset="100%" stopColor={teal} />
          </linearGradient>
          <linearGradient id="damijRingR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={teal} />
            <stop offset="100%" stopColor={navy} />
          </linearGradient>
        </defs>

        {/* Left ring */}
        <circle cx="50" cy="70" r="34" fill="none" stroke="url(#damijRingL)" strokeWidth="6" />
        {/* Right ring */}
        <circle cx="90" cy="70" r="34" fill="none" stroke="url(#damijRingR)" strokeWidth="6" />

        {/* Hand (left ring) — minimal palm + 4 fingers + thumb */}
        <g transform="translate(50,70)">
          <rect x="-9" y="-2" width="18" height="14" rx="3" fill={navy} />
          {[-7.5, -2.5, 2.5, 7.5].map((x, i) => (
            <rect key={i} x={x - 1.6} y={-15 + (i === 1 ? -2 : 0)} width="3.2" height={13 + (i === 1 ? 2 : 0)} rx="1.5" fill={navy} />
          ))}
          {/* Thumb */}
          <rect x="-12" y="2" width="3.2" height="9" rx="1.5" transform="rotate(-30 -10 6)" fill={navy} />
        </g>

        {/* Braille cell (right ring): 2 cols x 3 rows */}
        <g transform="translate(90,70)">
          {[
            [-6, -10], [6, -10],
            [-6, 0],   [6, 0],
            [-6, 10],  [6, 10],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.4" fill={teal} />
          ))}
        </g>

        {/* Gold accent baseline */}
        <rect x="22" y="118" width="96" height="3" rx="1.5" fill={gold} />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight" style={{ direction: 'rtl' }}>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: navy }}>
            دامج
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: teal }}>
            DAMIJ
          </span>
        </div>
      )}
    </div>
  );
};

export default DamijBrandLogo;
