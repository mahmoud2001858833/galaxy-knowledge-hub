import React, { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * «كوكبة المهام»: the whole master plan in one scene. Days run around a wheel of time, each team is a ring,
 * every task is a point on its day and ring, and a thread runs from each point to a label that says what
 * it is and for whom. Bars around the wheel chart each day's load. Hovering a point, a label, a team or a
 * day lights up its threads and dims the rest; the threads can be hidden.
 */

export type CItem = {
  id: string; group: string; day: number; title: string; laneName: string; lane: string;
  state: 'done' | 'late' | 'live' | 'scheduled'; points: number | null; publish: string | null;
};
type Props = {
  items: CItem[];
  groups: { key: string; title: string }[];
  days: number;
  dayLabel: (d: number) => { wd: string; dm: string };
  today: number;
  onOpen: (id: string) => void;
};

const SIZE = 1500;
const C = SIZE / 2;
const R_CORE = 118;
const R_DAYS = 168;
const R_BAR0 = R_DAYS + 10; // daily load bars sit just outside the day ring
const BAR_MAX = 44;
const R_RING0 = R_BAR0 + BAR_MAX + 40;
const RING_GAP = 46;
const R_OUT = R_RING0 + RING_GAP * 5 + RING_GAP * 0.4;
const R_LABEL = R_OUT + 70;
const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const STATE_LABEL = { done: 'منجزة', late: 'متأخرة', live: 'وصلت', scheduled: 'مجدولة' } as const;

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 0° at the top, clockwise
const pt = (deg: number, r: number) => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))] as const;
const arc = (a0: number, a1: number, r0: number, r1: number) => {
  const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
  const big = a1 - a0 > 180 ? 1 : 0;
  return `M${x0},${y0} A${r1},${r1} 0 ${big} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${big} 0 ${x3},${y3} Z`;
};
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export default function PlanConstellation({ items, groups, days, dayLabel, today, onOpen }: Props) {
  const [threads, setThreads] = useState(true);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState<{ kind: 'item' | 'group' | 'day' | 'lane'; key: string } | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; it: CItem } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const span = 360 / days;
  const groupIndex = useMemo(() => new Map(groups.map((g, i) => [g.key, i])), [groups]);
  const visible = useMemo(() => items.filter((i) => !hidden.has(i.group) && groupIndex.has(i.group) && i.day >= 0 && i.day < days), [items, hidden, groupIndex, days]);

  // place every task on its day sector and team ring
  const layout = useMemo(() => {
    const byCell = new Map<string, CItem[]>();
    for (const it of visible) {
      const k = `${it.day}|${it.group}`;
      byCell.set(k, [...(byCell.get(k) ?? []), it]);
    }
    const pos = new Map<string, { a: number; r: number; color: string }>();
    for (const [k, list] of byCell) {
      const [d, g] = k.split('|');
      const gi = groupIndex.get(g)!;
      const lanes = [...new Set(list.map((i) => i.lane))];
      list.sort((a, b) => a.lane.localeCompare(b.lane) || a.title.localeCompare(b.title));
      list.forEach((it, j) => {
        const a = Number(d) * span + span * ((j + 0.5) / list.length) * 0.84 + span * 0.08;
        const li = lanes.indexOf(it.lane);
        const r = R_RING0 + gi * RING_GAP + (lanes.length > 1 ? ((li / (lanes.length - 1)) - 0.5) * (RING_GAP * 0.6) : 0);
        pos.set(it.id, { a, r, color: COLORS[gi % COLORS.length] });
      });
    }
    // labels: evenly around the outer circle, in the order of their points
    const ordered = [...visible].sort((x, y) => pos.get(x.id)!.a - pos.get(y.id)!.a || pos.get(x.id)!.r - pos.get(y.id)!.r);
    const labels = new Map<string, number>();
    ordered.forEach((it, i) => labels.set(it.id, ((i + 0.5) / ordered.length) * 360));
    return { pos, labels };
  }, [visible, groupIndex, span]);

  const load = useMemo(() => {
    const per = Array.from({ length: days }, () => new Array(groups.length).fill(0) as number[]);
    for (const it of visible) per[it.day][groupIndex.get(it.group)!]++;
    const max = Math.max(1, ...per.map((d) => d.reduce((s, n) => s + n, 0)));
    return { per, max };
  }, [visible, days, groups.length, groupIndex]);

  const lit = (it: CItem) => {
    if (!focus) return true;
    if (focus.kind === 'item') return focus.key === it.id;
    if (focus.kind === 'group') return focus.key === it.group;
    if (focus.kind === 'lane') return focus.key === it.lane;
    return focus.key === String(it.day);
  };
  const showTip = (e: React.MouseEvent, it: CItem) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, it });
  };
  const enter = (e: React.MouseEvent, it: CItem) => { setFocus({ kind: 'item', key: it.id }); showTip(e, it); };
  const leave = () => { setFocus(null); setTip(null); };

  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="me-auto">
          <h2 className="text-2xl font-black">كوكبة المهام</h2>
          <p className="text-sm text-muted-foreground">الأيام بتدور حول الدائرة، كل فريق حلقة، وكل مهمة نقطة طالع منها خيط بيحكي شو هي ولمين. مرّر الماوس على أي إشي.</p>
        </div>
        <button
          type="button"
          onClick={() => setThreads((v) => !v)}
          aria-pressed={threads}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent"
        >
          {threads ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {threads ? 'إخفاء الخيوط' : 'إظهار الخيوط'}
        </button>
      </div>

      {/* teams: hover to light up, click to hide/show */}
      <div className="mb-3 flex flex-wrap gap-2">
        {groups.map((g, i) => {
          const off = hidden.has(g.key);
          const n = items.filter((it) => it.group === g.key).length;
          if (!n) return null;
          return (
            <button
              key={g.key}
              type="button"
              onMouseEnter={() => !off && setFocus({ kind: 'group', key: g.key })}
              onMouseLeave={() => setFocus(null)}
              onClick={() => setHidden((h) => { const s = new Set(h); if (s.has(g.key)) s.delete(g.key); else s.add(g.key); return s; })}
              aria-pressed={!off}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${off ? 'border-dashed border-border text-muted-foreground opacity-60' : 'border-border bg-background hover:bg-accent'}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {g.title} · {n.toLocaleString('ar')}
            </button>
          );
        })}
      </div>

      <div ref={box} className="relative mx-auto w-full max-w-[1100px]" onMouseLeave={leave}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full select-none" role="img" aria-label="كوكبة المهام: كل مهام الفريق حول دائرة الأيام">
          <style>{`
            @keyframes sew { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
            @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
            .thread { stroke-dasharray: 1; animation: sew 1.4s cubic-bezier(.2,.7,.2,1) both; transition: opacity .25s, stroke-width .25s; }
            .dot { transform-box: fill-box; transform-origin: center; animation: pop .5s cubic-bezier(.3,1.6,.5,1) both; transition: opacity .25s; }
            .fade { transition: opacity .25s; }
            @media (prefers-reduced-motion: reduce) { .thread, .dot { animation: none; } }
          `}</style>

          {/* day sectors */}
          {Array.from({ length: days }, (_, d) => {
            const a0 = d * span, a1 = (d + 1) * span;
            const [lx, ly] = pt(a0 + span / 2, (R_CORE + R_DAYS) / 2 + 4);
            const isToday = d === today;
            const { wd, dm } = dayLabel(d);
            return (
              <g key={d} onMouseEnter={() => setFocus({ kind: 'day', key: String(d) })} onMouseLeave={() => setFocus(null)} className="cursor-default">
                <path d={arc(a0 + 0.6, a1 - 0.6, R_CORE + 6, R_DAYS)} fill={isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} opacity={focus?.kind === 'day' && focus.key === String(d) ? 1 : 0.9} />
                <path d={arc(a0, a1, R_DAYS + 8, R_OUT)} fill={isToday ? 'hsl(var(--primary) / 0.06)' : 'transparent'} />
                <line x1={pt(a0, R_DAYS + 8)[0]} y1={pt(a0, R_DAYS + 8)[1]} x2={pt(a0, R_OUT)[0]} y2={pt(a0, R_OUT)[1]} stroke="hsl(var(--border))" strokeWidth={1} />
                <text x={lx} y={ly - 6} textAnchor="middle" fontSize={15} fontWeight={800} fill={isToday ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}>{wd}</text>
                <text x={lx} y={ly + 13} textAnchor="middle" fontSize={13} fill={isToday ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'}>{dm}</text>
              </g>
            );
          })}

          {/* team rings */}
          {groups.map((g, i) => (
            <circle key={g.key} cx={C} cy={C} r={R_RING0 + i * RING_GAP} fill="none" stroke={COLORS[i % COLORS.length]} strokeOpacity={hidden.has(g.key) ? 0.08 : 0.22} strokeWidth={RING_GAP * 0.62} />
          ))}

          {/* daily load chart */}
          {load.per.map((counts, d) => {
            let r = R_BAR0;
            const w = span * 0.42;
            const a0 = d * span + (span - w) / 2;
            return (
              <g key={d}>
                {counts.map((n, gi) => {
                  if (!n) return null;
                  const h = (n / load.max) * BAR_MAX;
                  const p = arc(a0, a0 + w, r, r + h);
                  r += h;
                  return <path key={gi} d={p} fill={COLORS[gi % COLORS.length]} opacity={0.85} />;
                })}
                {counts.some(Boolean) && (() => {
                  const [x, y] = pt(d * span + span / 2, r + 13);
                  return <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill="hsl(var(--foreground))">{counts.reduce((s, n) => s + n, 0).toLocaleString('ar')}</text>;
                })()}
              </g>
            );
          })}

          {/* threads and labels */}
          {threads && visible.map((it, i) => {
            const p = layout.pos.get(it.id)!;
            const la = layout.labels.get(it.id)!;
            const [x0, y0] = pt(p.a, p.r);
            const [x1, y1] = pt(la, R_LABEL - 6);
            const [c1x, c1y] = pt(p.a, R_OUT + 20);
            const [c2x, c2y] = pt(la, R_LABEL - 40);
            const on = lit(it);
            return (
              <path
                key={`t-${it.id}`}
                pathLength={1}
                className="thread"
                style={{ animationDelay: `${Math.min(i * 12, 900)}ms` }}
                d={`M${x0},${y0} C${c1x},${c1y} ${c2x},${c2y} ${x1},${y1}`}
                fill="none"
                stroke={p.color}
                strokeWidth={on && focus ? 2.6 : 1.1}
                opacity={on ? (focus ? 0.95 : 0.45) : 0.06}
              />
            );
          })}
          {threads && visible.map((it) => {
            const la = layout.labels.get(it.id)!;
            const [x, y] = pt(la, R_LABEL);
            const right = la < 180;
            const rot = right ? la - 90 : la + 90;
            const on = lit(it);
            return (
              <text
                key={`l-${it.id}`}
                x={x}
                y={y}
                transform={`rotate(${rot} ${x} ${y})`}
                textAnchor={right ? 'start' : 'end'}
                dominantBaseline="middle"
                fontSize={13}
                className="fade cursor-pointer"
                opacity={on ? 1 : 0.12}
                fill="hsl(var(--foreground))"
                onMouseEnter={(e) => enter(e, it)}
                onMouseMove={(e) => showTip(e, it)}
                onMouseLeave={leave}
                onClick={() => onOpen(it.id)}
              >
                <tspan fontWeight={800} fill={layout.pos.get(it.id)!.color}>{it.laneName}</tspan>
                <tspan> · {cut(it.title, 30)}</tspan>
              </text>
            );
          })}

          {/* points */}
          {visible.map((it, i) => {
            const p = layout.pos.get(it.id)!;
            const [x, y] = pt(p.a, p.r);
            const on = lit(it);
            const big = focus?.kind === 'item' && focus.key === it.id;
            return (
              <g
                key={`d-${it.id}`}
                className="dot cursor-pointer"
                style={{ animationDelay: `${Math.min(i * 8, 700)}ms` }}
                opacity={on ? 1 : 0.18}
                onMouseEnter={(e) => enter(e, it)}
                onMouseMove={(e) => showTip(e, it)}
                onMouseLeave={leave}
                onClick={() => onOpen(it.id)}
                role="button"
                aria-label={`${it.title} — ${it.laneName}`}
              >
                <circle cx={x} cy={y} r={big ? 11 : 7} fill={it.state === 'scheduled' ? 'hsl(var(--card))' : p.color} stroke={it.state === 'late' ? 'hsl(var(--destructive))' : p.color} strokeWidth={it.state === 'late' ? 3 : 2} />
                {it.state === 'done' && <circle cx={x} cy={y} r={2.6} fill="hsl(var(--card))" />}
              </g>
            );
          })}

          {/* core */}
          <circle cx={C} cy={C} r={R_CORE} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
          <text x={C} y={C - 26} textAnchor="middle" fontSize={20} fontWeight={700} fill="hsl(var(--muted-foreground))">المهام الكبرى</text>
          <text x={C} y={C + 26} textAnchor="middle" fontSize={56} fontWeight={900} fill="hsl(var(--foreground))">{visible.length.toLocaleString('ar')}</text>
          <text x={C} y={C + 56} textAnchor="middle" fontSize={16} fill="hsl(var(--muted-foreground))">مهمة · {days.toLocaleString('ar')} يوم</text>
        </svg>

        {tip && (
          <div
            className="pointer-events-none absolute z-10 w-64 rounded-2xl border border-border bg-popover p-3 text-right text-sm text-popover-foreground shadow-lg"
            style={{ left: Math.min(tip.x + 14, (box.current?.clientWidth ?? 0) - 264), top: tip.y + 14 }}
          >
            <div className="font-bold leading-snug">{tip.it.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {tip.it.laneName} · {dayLabel(tip.it.day).wd} {dayLabel(tip.it.day).dm}
              {tip.it.points ? ` · ${tip.it.points.toLocaleString('ar')} نقطة` : ''}
            </div>
            <div className="mt-1.5 text-xs font-semibold">{STATE_LABEL[tip.it.state]} · اكبس لتشوف التفاصيل</div>
          </div>
        )}
      </div>
    </section>
  );
}
