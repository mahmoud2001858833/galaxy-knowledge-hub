import React from 'react';
import { Dots, describeDots } from './brailleAlphabet';

interface Props {
  dots: Dots;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  label?: string;
}

const SIZES = {
  sm: { cell: 'w-10 h-14', dot: 'w-3.5 h-3.5' },
  md: { cell: 'w-16 h-24', dot: 'w-6 h-6' },
  lg: { cell: 'w-24 h-36', dot: 'w-9 h-9' },
};

export const BrailleCellDisplay: React.FC<Props> = ({ dots, size = 'md', highlighted, label }) => {
  const s = SIZES[size];
  const aria = `${label ? `حرف ${label}: ` : ''}${describeDots(dots)}`;

  // Layout: column 1 (dots 1,2,3) | column 2 (dots 4,5,6)
  // CSS grid 3 rows x 2 cols. In RTL we keep dot 1 visually on the left of cell.
  return (
    <div
      role="img"
      aria-label={aria}
      title={aria}
      dir="ltr"
      className={`${s.cell} grid grid-cols-2 grid-rows-3 gap-1 p-2 rounded-xl border-2 transition-all ${
        highlighted
          ? 'border-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 shadow-lg scale-105'
          : 'border-[hsl(var(--damij-primary))]/20 bg-[hsl(var(--damij-surface))]'
      }`}
    >
      {[1, 4, 2, 5, 3, 6].map((d) => (
        <div key={d} className="flex items-center justify-center">
          <div
            className={`${s.dot} rounded-full transition-all ${
              dots.includes(d)
                ? 'bg-[hsl(var(--damij-primary))] shadow-md'
                : 'bg-[hsl(var(--damij-primary))]/10 border border-[hsl(var(--damij-primary))]/20'
            }`}
          />
        </div>
      ))}
    </div>
  );
};
