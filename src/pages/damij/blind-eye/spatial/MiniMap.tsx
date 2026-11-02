import React from 'react';
import type { MapObject, WorldMap } from './worldMap';

/**
 * Heading-up view of the virtual map for a sighted companion: the user is the arrow at the centre,
 * "up" is where the camera faces, rings are 1 m apart.
 */

type Props = {
  map: WorldMap;
  targetId: number | null;
  /** bump to re-render */
  version: number;
  big?: boolean;
  onToggle?: () => void;
  lang: string;
};

const RAD = Math.PI / 180;

const color = (m: MapObject, target: boolean) =>
  target ? '#facc15'
    : ['door', 'doorway', 'elevator'].includes(m.kind) ? '#38bdf8'
    : ['stairs', 'step'].includes(m.kind) ? '#f43f5e'
    : ['person', 'pet'].includes(m.kind) ? '#c084fc'
    : m.obstacle ? '#fb923c' : '#4ade80';

const MiniMap: React.FC<Props> = ({ map, targetId, big, onToggle, lang }) => {
  const size = big ? 340 : 168;
  const c = size / 2;
  const far = Math.max(3, Math.min(9, ...map.objects.map((o) => map.rel(o).dist + 0.8)));
  const scale = (c - 14) / far;
  const h = map.heading * RAD;
  const toScreen = (x: number, y: number) => {
    const dx = x - map.x;
    const dy = y - map.y;
    const right = dx * Math.cos(h) - dy * Math.sin(h);
    const fwd = dx * Math.sin(h) + dy * Math.cos(h);
    return { sx: c + right * scale, sy: c - fwd * scale };
  };
  const target = map.objects.find((o) => o.id === targetId) ?? null;
  const tp = target ? toScreen(target.x, target.y) : null;
  const trail = map.trail.map((p) => toScreen(p.x, p.y));

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      aria-label={lang === 'ar' ? 'خريطة الغرفة' : 'Room map'}
      className="rounded-2xl border border-white/25 bg-black/75 p-1 shadow-2xl backdrop-blur"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        {Array.from({ length: Math.floor(far) }, (_, i) => (
          <circle key={i} cx={c} cy={c} r={(i + 1) * scale} fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="2 3" />
        ))}
        {/* camera view cone */}
        <path d={`M${c},${c} L${c - Math.tan(25 * RAD) * (c - 8)},8 L${c + Math.tan(25 * RAD) * (c - 8)},8 Z`} fill="rgba(56,189,248,0.10)" />
        {trail.length > 1 && (
          <polyline points={trail.map((p) => `${p.sx},${p.sy}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
        )}
        {tp && <line x1={c} y1={c} x2={tp.sx} y2={tp.sy} stroke="#facc15" strokeWidth={2} strokeDasharray="5 4" />}
        {map.objects.map((o) => {
          const p = toScreen(o.x, o.y);
          if (p.sx < -10 || p.sy < -10 || p.sx > size + 10 || p.sy > size + 10) return null;
          const isT = o.id === targetId;
          const r = isT ? 7 : 4 + Math.min(2, o.seen / 3);
          return (
            <g key={o.id} opacity={Math.max(0.45, Math.min(1, o.conf / 2))}>
              {isT && <circle cx={p.sx} cy={p.sy} r={12} fill="none" stroke="#facc15" strokeWidth={2} />}
              <circle cx={p.sx} cy={p.sy} r={r} fill={color(o, isT)} stroke="black" strokeWidth={1} />
              {(big || isT) && (
                <text x={p.sx} y={p.sy - r - 3} fontSize={big ? 11 : 9} textAnchor="middle" fill="white" stroke="black" strokeWidth={2.5} paintOrder="stroke">
                  {o.label}
                </text>
              )}
            </g>
          );
        })}
        {/* the user */}
        <path d={`M${c},${c - 10} L${c + 7},${c + 7} L${c},${c + 3} L${c - 7},${c + 7} Z`} fill="white" stroke="#0ea5e9" strokeWidth={1.5} />
      </svg>
      {big && (
        <div className="px-2 pb-1 text-[11px] text-white/70">
          {lang === 'ar'
            ? `${map.objects.length} عنصر · ${map.steps} خطوة · كل دائرة = متر`
            : `${map.objects.length} objects · ${map.steps} steps · ring = 1 m`}
        </div>
      )}
    </button>
  );
};

export default MiniMap;
