import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, NotebookPen } from 'lucide-react';

export interface NotebookEntry {
  id: string;
  at: string;
  values: Record<string, string | number>;
}

export function useSimNotebook(experimentKey: string) {
  const storageKey = `sim3d_notebook_${experimentKey}`;
  const [entries, setEntries] = useState<NotebookEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: NotebookEntry[]) => {
      setEntries(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage full */
      }
    },
    [storageKey]
  );

  const record = useCallback(
    (values: Record<string, string | number>) => {
      const entry: NotebookEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: new Date().toLocaleTimeString('ar-EG'),
        values,
      };
      persist([entry, ...entries].slice(0, 100));
    },
    [entries, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { entries, record, clear };
}

interface SimNotebookProps {
  entries: NotebookEntry[];
  onClear: () => void;
  onRecord?: () => void;
  fileName?: string;
}

/** Experiment logbook: live readings saved by the student, exportable as CSV. */
export const SimNotebook = ({ entries, onClear, onRecord, fileName = 'experiment' }: SimNotebookProps) => {
  const columns = Array.from(new Set(entries.flatMap((e) => Object.keys(e.values))));

  const exportCsv = () => {
    const header = ['الوقت', ...columns].join(',');
    const rows = entries.map((e) => [e.at, ...columns.map((c) => e.values[c] ?? '')].join(','));
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-notebook.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card dir="rtl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <NotebookPen className="h-5 w-5 text-primary" />
          دفتر التجربة
        </CardTitle>
        <div className="flex gap-2">
          {onRecord && (
            <Button size="sm" onClick={onRecord}>
              تسجيل قراءة
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!entries.length}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear} disabled={!entries.length}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            لا توجد قراءات بعد — شغّل التجربة ثم اضغط «تسجيل قراءة».
          </p>
        ) : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="p-2 font-semibold">الوقت</th>
                  {columns.map((c) => (
                    <th key={c} className="p-2 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="p-2 font-mono text-muted-foreground">{e.at}</td>
                    {columns.map((c) => (
                      <td key={c} className="p-2 font-mono">
                        {e.values[c] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
