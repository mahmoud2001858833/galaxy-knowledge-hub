import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  title?: string;
  content: string;
  size?: 'xs' | 'sm';
  className?: string;
}

const HelpTooltip: React.FC<Props> = ({ title, content, size = 'xs', className = '' }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 280) });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (ev: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const dim = size === 'sm' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label="شرح"
        className={`inline-flex items-center justify-center text-slate-400 hover:text-sky-600 ${className}`}
      >
        <HelpCircle className={dim} />
      </button>
      {open && pos && createPortal(
        <div
          dir="rtl"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] w-[280px] p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700"
        >
          {title && <div className="font-bold text-sky-300 mb-1">{title}</div>}
          <div className="leading-relaxed whitespace-pre-line">{content}</div>
          <div className="absolute -top-1.5 right-6 w-3 h-3 rotate-45 bg-slate-900 border-t border-r border-slate-700" />
        </div>,
        document.body
      )}
    </>
  );
};

export default HelpTooltip;
