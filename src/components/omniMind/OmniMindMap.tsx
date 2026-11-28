import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, Download, Loader2, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MindMapNode } from '@/components/shared/InteractiveMindMap';

interface OmniMindMapProps {
  rootTitle: string;
  subjectTitle?: string;
  nodes: MindMapNode[];
  className?: string;
}

/** On-brand, design-token themed mind map for the Omni Mind chat — an outline/tree instead of
 * InteractiveMindMap's hardcoded-dark circular layout, so it actually matches the rest of the page
 * and prints cleanly to PDF (a plain nested list capture beats a canvas-cropped graphic). */
export function OmniMindMap({ rootTitle, subjectTitle, nodes, className }: OmniMindMapProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const toggle = (map: Record<string, boolean>, set: (m: Record<string, boolean>) => void, id: string) =>
    set({ ...map, [id]: !map[id] });

  async function exportPdf() {
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const el = printRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 48;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 24;
      const img = canvas.toDataURL('image/png');
      pdf.addImage(img, 'PNG', 24, position, imgW, imgH);
      heightLeft -= pageH - 48;
      while (heightLeft > 0) {
        position = heightLeft - imgH + 24;
        pdf.addPage();
        pdf.addImage(img, 'PNG', 24, position, imgW, imgH);
        heightLeft -= pageH - 48;
      }
      pdf.save(`${rootTitle.replace(/\s+/g, '-')}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)} dir="rtl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground shadow">
            <Workflow className="h-4.5 w-4.5" />
          </span>
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              خريطة ذهنية {subjectTitle ? `— ${subjectTitle}` : ''}
            </span>
            <h3 className="mt-0.5 text-base font-bold text-foreground">{rootTitle}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          disabled={exporting}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          PDF كامل
        </button>
      </div>

      <div className="space-y-1.5">
        {nodes.map((n) => (
          <TreeNode key={n.id} node={n} depth={0} expanded={expanded} open={open} onToggleExpand={(id) => toggle(expanded, setExpanded, id)} onToggleOpen={(id) => toggle(open, setOpen, id)} />
        ))}
      </div>

      {/* off-screen, fully expanded — captured for the PDF so printing never depends on current UI state */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
        <div ref={printRef} className="w-[760px] bg-white p-8" dir="rtl">
          <p className="mb-1 text-xs font-semibold text-primary">خريطة ذهنية{subjectTitle ? ` — ${subjectTitle}` : ''}</p>
          <h2 className="mb-5 text-xl font-black text-slate-900">{rootTitle}</h2>
          <PrintTree nodes={nodes} depth={0} />
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  node, depth, expanded, open, onToggleExpand, onToggleOpen,
}: {
  node: MindMapNode; depth: number;
  expanded: Record<string, boolean>; open: Record<string, boolean>;
  onToggleExpand: (id: string) => void; onToggleOpen: (id: string) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isExpanded = expanded[node.id] ?? depth < 1;
  const isOpen = open[node.id] ?? false;
  const hasDetail = !!(node.description || node.formula);

  return (
    <div style={{ marginInlineStart: depth ? 18 : 0 }} className={depth ? 'border-r-2 border-border/70 pr-3' : ''}>
      <div className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 hover:bg-background/60">
        {hasChildren ? (
          <button type="button" onClick={() => onToggleExpand(node.id)} className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground" aria-label="توسيع">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        ) : <span className="w-5 shrink-0" />}
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: node.color || 'hsl(var(--primary))' }} />
        <button
          type="button"
          onClick={() => hasDetail && onToggleOpen(node.id)}
          className={cn('flex-1 text-right text-sm font-semibold text-foreground', hasDetail && 'cursor-pointer hover:text-primary')}
        >
          {node.label}
        </button>
        {node.category && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{node.category}</span>}
      </div>
      {isOpen && hasDetail && (
        <div className="mr-9 mb-1.5 rounded-xl border border-border bg-background/60 p-2.5 text-xs leading-relaxed text-muted-foreground">
          {node.description}
          {node.formula && <p className="mt-1 font-mono text-foreground" dir="ltr">{node.formula}</p>}
        </div>
      )}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} expanded={expanded} open={open} onToggleExpand={onToggleExpand} onToggleOpen={onToggleOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Flat, fully-expanded, always-on-detail rendering for the PDF capture — plain colors (no CSS vars: html2canvas can't resolve them reliably off-screen). */
function PrintTree({ nodes, depth }: { nodes: MindMapNode[]; depth: number }) {
  return (
    <div style={{ marginInlineStart: depth ? 16 : 0 }}>
      {nodes.map((n) => (
        <div key={n.id} style={{ marginBottom: 10, borderInlineStart: depth ? '2px solid #e2e8f0' : 'none', paddingInlineStart: depth ? 10 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: n.color || '#6d28d9', display: 'inline-block' }} />
            <strong style={{ fontSize: 13, color: '#0f172a' }}>{n.label}</strong>
            {n.category && <span style={{ fontSize: 10, color: '#64748b', background: '#f1f5f9', borderRadius: 999, padding: '1px 8px' }}>{n.category}</span>}
          </div>
          {(n.description || n.formula) && (
            <div style={{ fontSize: 11, color: '#475569', marginTop: 3, marginInlineStart: 14, lineHeight: 1.6 }}>
              {n.description}
              {n.formula && <div style={{ fontFamily: 'monospace', color: '#0f172a', marginTop: 2 }} dir="ltr">{n.formula}</div>}
            </div>
          )}
          {!!n.children?.length && <PrintTree nodes={n.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

export default OmniMindMap;
