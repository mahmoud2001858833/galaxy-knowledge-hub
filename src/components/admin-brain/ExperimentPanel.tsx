// Shows an experiment the central AI ran: equation, parameters, key results and a line chart.
import { motion } from 'framer-motion';
import { X, FlaskConical } from 'lucide-react';
import type { ExperimentResult } from './experiments';

const COLORS = ['hsl(var(--brand-from))', 'hsl(var(--brand-to))', 'hsl(var(--muted-foreground))'];
const fmt = (v: number) => (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(2) : Number(v.toPrecision(4)).toLocaleString('ar'));

function niceTicks(min: number, max: number, n = 5) {
  if (max === min) max = min + 1;
  const step = Math.pow(10, Math.floor(Math.log10((max - min) / n)));
  const err = ((max - min) / n) / step;
  const s = step * (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1);
  const out: number[] = [];
  for (let v = Math.ceil(min / s) * s; v <= max + s * 1e-9; v += s) out.push(Number(v.toPrecision(10)));
  return out;
}

function Chart({ res }: { res: ExperimentResult }) {
  const W = 520, H = 250, L = 52, R = 14, T = 14, B = 36;
  const all = res.series.flatMap((s) => s.points);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(0, ...ys), y1 = Math.max(...ys);
  if (y1 === y0) y1 = y0 + 1;
  y1 += (y1 - y0) * 0.05;
  const X = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R);
  const Y = (v: number) => H - B - ((v - y0) / (y1 - y0)) * (H - T - B);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ direction: "ltr" }} role="img" aria-label={res.title}>
      {niceTicks(y0, y1).map((t) => (
        <g key={`y${t}`}>
          <line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={L - 6} y={Y(t) + 4} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">{fmt(t)}</text>
        </g>
      ))}
      {niceTicks(x0, x1, 6).map((t) => (
        <text key={`x${t}`} x={X(t)} y={H - B + 16} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{fmt(t)}</text>
      ))}
      <line x1={L} x2={W - R} y1={Y(Math.max(y0, 0))} y2={Y(Math.max(y0, 0))} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
      {res.series.map((s, i) => (
        <motion.path
          key={s.name}
          d={s.points.map(([a, b], j) => `${j ? 'L' : 'M'}${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join('')}
          fill="none"
          stroke={COLORS[i % COLORS.length]}
          strokeWidth={i === 0 ? 2.5 : 1.5}
          strokeDasharray={i === 0 ? undefined : '5 4'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: i * 0.25, ease: 'easeInOut' }}
        />
      ))}
      <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="hsl(var(--foreground))">{res.xLabel}</text>
      <text x={12} y={(T + H - B) / 2} textAnchor="middle" fontSize={11} fill="hsl(var(--foreground))" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>{res.yLabel}</text>
    </svg>
  );
}

export default function ExperimentPanel({ res, onClose }: { res: ExperimentResult; onClose: () => void }) {
  return (
    <motion.div
      data-brain-ui
      dir="rtl"
      className="fixed z-[9997] left-1/2 top-[6vh] w-[min(94vw,620px)] max-h-[80vh] -translate-x-1/2 overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl"
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground">
            <FlaskConical className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{res.title}</h3>
            <p className="text-xs text-muted-foreground" dir="ltr">{res.equation}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="إغلاق" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {res.params.map((m) => (
          <span key={m.label} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {m.label}: <b className="text-foreground">{fmt(m.value)}</b> {m.unit}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-background/60 p-2">
        <Chart res={res} />
        {res.series.length > 1 && (
          <div className="flex flex-wrap justify-center gap-4 pb-1 text-xs text-muted-foreground">
            {res.series.map((s, i) => (
              <span key={s.name} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5" style={{ background: COLORS[i % COLORS.length] }} /> {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {res.metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border p-3">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{fmt(m.value)} <span className="text-xs font-normal text-muted-foreground">{m.unit}</span></p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
