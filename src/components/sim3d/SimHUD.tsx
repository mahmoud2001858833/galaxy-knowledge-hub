import { ReactNode } from 'react';

export interface SimReading {
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
}

interface SimHUDProps {
  readings: SimReading[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  title?: string;
  children?: ReactNode;
}

const positionClass = {
  'top-right': 'top-3 right-3',
  'top-left': 'top-3 left-3',
  'bottom-right': 'bottom-3 right-3',
  'bottom-left': 'bottom-3 left-3',
};

const toneClass = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
};

/** Live readings overlay drawn above the 3D canvas. */
export const SimHUD = ({ readings, position = 'top-right', title, children }: SimHUDProps) => (
  <div
    dir="rtl"
    className={`absolute ${positionClass[position]} z-20 min-w-[9rem] rounded-xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-md`}
  >
    {title && <div className="mb-2 text-xs font-bold text-muted-foreground">{title}</div>}
    <div className="space-y-1.5">
      {readings.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">{r.label}</span>
          <span className={`font-mono font-bold ${toneClass[r.tone ?? 'default']}`}>
            {r.value}
            {r.unit ? <span className="mr-1 text-[0.65rem] font-normal">{r.unit}</span> : null}
          </span>
        </div>
      ))}
    </div>
    {children}
  </div>
);
