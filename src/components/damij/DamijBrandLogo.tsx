import React from 'react';

interface Props {
  size?: number;
  showText?: boolean;
  monochrome?: boolean;
  animated?: boolean;
}

/**
 * DamijBrandLogo — animated institutional mark.
 * Symbolism:
 *  - Two interlocked rings = inclusion / merging of abilities ("دمج")
 *  - Inside the left ring: an abstract hand (sign language)
 *  - Inside the right ring: six dots in a 2x3 grid (Braille cell)
 *  - A horizontal baseline = stable foundation, accessibility
 *
 * Animations are CSS based and automatically pause in Eco mode and for users
 * who prefer reduced motion (handled globally by `damij-eco` and reduce-motion media query).
 */
const DamijBrandLogo: React.FC<Props> = ({ size = 140, showText = true, monochrome = false, animated = true }) => {
  const navy = monochrome ? 'currentColor' : 'hsl(var(--damij-primary))';
  const teal = monochrome ? 'currentColor' : 'hsl(var(--damij-primary-2))';
  const gold = monochrome ? 'currentColor' : 'hsl(var(--damij-accent))';

  return (
    <div className="inline-flex items-center gap-3 select-none" style={{ direction: 'ltr' }}>
      <style>{`
        @keyframes damijSpin { to { transform: rotate(360deg); } }
        @keyframes damijSpinR { to { transform: rotate(-360deg); } }
        @keyframes damijPulseDot {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.25); opacity: 1; }
        }
        @keyframes damijShimmer {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }
        @keyframes damijHandWave {
          0%, 100% { transform: translate(50px,70px) rotate(-4deg); }
          50% { transform: translate(50px,70px) rotate(6deg); }
        }
        .damij-ring-l { transform-origin: 50px 70px; animation: damijSpin 22s linear infinite; }
        .damij-ring-r { transform-origin: 90px 70px; animation: damijSpinR 26s linear infinite; }
        .damij-hand { transform-origin: 50px 70px; animation: damijHandWave 4.5s ease-in-out infinite; }
        .damij-dot { transform-box: fill-box; transform-origin: center; animation: damijPulseDot 2.4s ease-in-out infinite; }
        .damij-bar-wrap { overflow: hidden; }
        .damij-bar-shine { animation: damijShimmer 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .damij-ring-l, .damij-ring-r, .damij-hand, .damij-dot, .damij-bar-shine { animation: none !important; }
        }
        html.damij-eco .damij-ring-l,
        html.damij-eco .damij-ring-r,
        html.damij-eco .damij-hand,
        html.damij-eco .damij-dot,
        html.damij-eco .damij-bar-shine { animation: none !important; }
      `}</style>

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
          <linearGradient id="damijBar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gold} stopOpacity="0.2" />
            <stop offset="50%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor={gold} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Left ring (rotating dashed) */}
        <g className={animated ? 'damij-ring-l' : undefined}>
          <circle cx="50" cy="70" r="34" fill="none" stroke="url(#damijRingL)" strokeWidth="6" strokeLinecap="round" strokeDasharray="160 60" />
        </g>
        {/* Right ring (counter rotating dashed) */}
        <g className={animated ? 'damij-ring-r' : undefined}>
          <circle cx="90" cy="70" r="34" fill="none" stroke="url(#damijRingR)" strokeWidth="6" strokeLinecap="round" strokeDasharray="140 70" />
        </g>

        {/* Hand (left ring) */}
        <g className={animated ? 'damij-hand' : undefined} transform="translate(50,70)">
          <rect x="-9" y="-2" width="18" height="14" rx="3" fill={navy} />
          {[-7.5, -2.5, 2.5, 7.5].map((x, i) => (
            <rect key={i} x={x - 1.6} y={-15 + (i === 1 ? -2 : 0)} width="3.2" height={13 + (i === 1 ? 2 : 0)} rx="1.5" fill={navy} />
          ))}
          <rect x="-12" y="2" width="3.2" height="9" rx="1.5" transform="rotate(-30 -10 6)" fill={navy} />
        </g>

        {/* Braille cell with staggered pulsing dots */}
        <g transform="translate(90,70)">
          {[
            [-6, -10], [6, -10],
            [-6, 0],   [6, 0],
            [-6, 10],  [6, 10],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.4"
              fill={teal}
              className={animated ? 'damij-dot' : undefined}
              style={animated ? { animationDelay: `${i * 0.18}s` } : undefined}
            />
          ))}
        </g>

        {/* Gold baseline + traveling shimmer */}
        <g>
          <rect x="22" y="118" width="96" height="3" rx="1.5" fill={gold} />
          <g clipPath="url(#barClip)">
            <rect x="22" y="118" width="40" height="3" rx="1.5" fill="url(#damijBar)" className={animated ? 'damij-bar-shine' : undefined} />
          </g>
          <defs>
            <clipPath id="barClip">
              <rect x="22" y="118" width="96" height="3" rx="1.5" />
            </clipPath>
          </defs>
        </g>
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
