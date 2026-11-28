import React, { useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConceptNode {
  id: string;
  label: string;
  color?: string;
  description?: string;
}

export interface ConceptEdge {
  from: string;
  to: string;
  label?: string;
}

interface ConceptGraphProps {
  title: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  className?: string;
}

type Positioned = ConceptNode & { x: number; y: number; angle: number };

/** Places nodes so labels don't collide: when the graph has a clear hub/leaf shape (a few concepts
 * each branching into their own details — the common case here), hubs go on an inner ring and each
 * hub's own leaves cluster in a dedicated outward arc next to it; otherwise falls back to one ring. */
function layout(nodes: ConceptNode[], edges: ConceptEdge[], size: number): Positioned[] {
  const center = size / 2;
  const hubIds = new Set(edges.map((e) => e.from));
  const hubs = nodes.filter((n) => hubIds.has(n.id));
  const leaves = nodes.filter((n) => !hubIds.has(n.id));

  const place = (n: ConceptNode, angle: number, radius: number): Positioned => ({
    ...n, angle, x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle),
  });

  if (hubs.length >= 2 && hubs.length < nodes.length && leaves.length > 0) {
    const innerR = size * 0.18;
    const outerR = size * 0.4;
    const hubArc = (2 * Math.PI) / hubs.length;
    const out: Positioned[] = [];
    const claimed = new Set<string>();
    hubs.forEach((hub, hi) => {
      const hubAngle = hi * hubArc - Math.PI / 2;
      out.push(place(hub, hubAngle, innerR));
      const children = leaves.filter((l) => edges.some((e) => e.from === hub.id && e.to === l.id && !claimed.has(l.id)));
      children.forEach((c) => claimed.add(c.id));
      const spread = Math.min(hubArc * 0.86, children.length > 1 ? hubArc * 0.86 : 0);
      children.forEach((child, ci) => {
        const t = children.length > 1 ? ci / (children.length - 1) - 0.5 : 0;
        out.push(place(child, hubAngle + t * spread, outerR));
      });
    });
    const orphans = leaves.filter((l) => !claimed.has(l.id));
    orphans.forEach((o, oi) => out.push(place(o, (oi / Math.max(1, orphans.length)) * 2 * Math.PI - Math.PI / 2, outerR)));
    return out;
  }

  const n = Math.max(1, nodes.length);
  const radius = size * 0.36;
  return nodes.map((node, i) => place(node, (i / n) * 2 * Math.PI - Math.PI / 2, radius));
}

/** A relationship/concept graph: distinct from InteractiveMindMap's hierarchical parent/child tree.
 * Design tokens only. */
export const ConceptGraph: React.FC<ConceptGraphProps> = ({ title, nodes, edges, className }) => {
  const [selected, setSelected] = useState<ConceptNode | null>(null);
  const size = Math.min(640, Math.max(440, 90 + nodes.length * 48));

  const positions = useMemo(() => layout(nodes, edges, size), [nodes, edges, size]);
  const byId = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions]);

  return (
    <div className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)} dir="rtl">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground shadow">
          <Share2 className="h-4.5 w-4.5" />
        </span>
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            خريطة علاقات تفاعلية
          </span>
          <h3 className="mt-0.5 text-base font-bold text-foreground">{title}</h3>
        </div>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-h-[560px]" role="img" aria-label={title}>
        <defs>
          <marker id="concept-graph-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="fill-border" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = byId.get(e.from), b = byId.get(e.to);
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          // pull the arrowhead back from the target node's circle radius so it doesn't overlap
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const tx = b.x - (dx / len) * 22, ty = b.y - (dy / len) * 22;
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <line x1={a.x} y1={a.y} x2={tx} y2={ty} className="stroke-border" strokeWidth={1.5} markerEnd="url(#concept-graph-arrow)" />
              {e.label && (
                <text x={mx} y={my - 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {positions.map((p) => {
          // label sits further OUT along the same angle as the node (away from the graph's center),
          // not in a fixed band below it — that's what was causing neighboring labels to overlap.
          const labelR = 34;
          const lx = p.x + Math.cos(p.angle) * labelR;
          const ly = p.y + Math.sin(p.angle) * labelR;
          const cos = Math.cos(p.angle);
          const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
          const label = p.label.length > 20 ? `${p.label.slice(0, 19)}…` : p.label;
          return (
            <g key={p.id} onClick={() => setSelected(p)} className="cursor-pointer" role="button" aria-label={p.label}>
              <circle
                cx={p.x} cy={p.y} r={16}
                fill={p.color || 'hsl(var(--primary))'}
                opacity={!selected || selected.id === p.id ? 1 : 0.5}
                className="stroke-background transition-opacity"
                strokeWidth={2.5}
              />
              <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" className="fill-foreground font-semibold" style={{ fontSize: 11 }}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {selected && (
        <div className="mt-3 rounded-2xl border border-border bg-background/60 p-3 text-sm">
          <p className="font-semibold text-foreground">{selected.label}</p>
          {selected.description && <p className="mt-1 leading-relaxed text-muted-foreground">{selected.description}</p>}
        </div>
      )}
    </div>
  );
};

export default ConceptGraph;
