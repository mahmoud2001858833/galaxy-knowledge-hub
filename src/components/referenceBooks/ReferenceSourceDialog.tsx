import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBookPage, type ReferenceSource } from '@/lib/referenceBooks/api';

/** Shows the text of the book page an answer or question was drawn from. */
export const ReferenceSourceDialog: React.FC<{
  source: Pick<ReferenceSource, 'bookId' | 'bookTitle' | 'pageNumber' | 'content'> | null;
  onClose: () => void;
}> = ({ source, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source) return;
    setText(source.content);
    if (!source.pageNumber) return;
    let alive = true;
    setLoading(true);
    getBookPage(source.bookId, source.pageNumber)
      .then((r) => alive && r.text && setText(r.text))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [source]);

  return (
    <Dialog open={!!source} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{source?.bookTitle}</DialogTitle>
          <DialogDescription>{source?.pageNumber ? `صفحة ${source.pageNumber}` : 'مقطع من الكتاب'}</DialogDescription>
        </DialogHeader>
        {loading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" aria-hidden />}
        <p className="whitespace-pre-wrap rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-foreground">{text}</p>
      </DialogContent>
    </Dialog>
  );
};
