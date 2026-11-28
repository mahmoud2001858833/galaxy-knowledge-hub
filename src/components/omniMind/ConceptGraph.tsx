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

const SIZE = 440;
const CENTER = SIZE / 2;
const RADIUS = SIZE * 0.34;

/** A relationship/concept graph: nodes placed on a circle, labeled directed edges between them —
 * distinct from InteractiveMindMap's hierarchical parent/child tree. Design tokens only. */
export const ConceptGraph: React.FC<ConceptGraphProps> = ({ title, nodes, edges, className }) => {
  const [selected, setSelected] = useState<ConceptNode | null>(null);

  const positions = useMemo(() => {
    const n = Math.max(1, nodes.length);
    return nodes.map((node, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return { ...node, x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) };
    });
  }, [nodes]);

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

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full max-h-[460px]" role="img" aria-label={title}>
        <defs>
          <marker id="concept-graph-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="fill-border" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = byId.get(e.from), b = byId.get(e.to);
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          // pull the arrowhead back from the target node's circle radius (18) so it doesn't overlap
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const tx = b.x - (dx / len) * 20, ty = b.y - (dy / len) * 20;
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
        {positions.map((p) => (
          <g key={p.id} onClick={() => setSelected(p)} className="cursor-pointer" role="button" aria-label={p.label}>
            <circle
              cx={p.x} cy={p.y} r={18}
              fill={p.color || 'hsl(var(--primary))'}
              opacity={!selected || selected.id === p.id ? 1 : 0.55}
              className="stroke-background transition-opacity"
              strokeWidth={2.5}
            />
            <text x={p.x} y={p.y + 32} textAnchor="middle" className="fill-foreground font-semibold" style={{ fontSize: 11 }}>
              {p.label.length > 16 ? `${p.label.slice(0, 15)}…` : p.label}
            </text>
          </g>
        ))}
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
