import { Button } from '@/components/ui/button';
import { Maximize2, RotateCcw } from 'lucide-react';
import { SimView } from './SimControls';

const views: { key: SimView; label: string }[] = [
  { key: 'default', label: 'عام' },
  { key: 'front', label: 'أمامي' },
  { key: 'top', label: 'علوي' },
  { key: 'side', label: 'جانبي' },
  { key: 'section', label: 'مقطع' },
];

interface SimViewButtonsProps {
  view: SimView;
  onViewChange: (v: SimView) => void;
  autoRotate?: boolean;
  onToggleAutoRotate?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left';
}

const positionClass = {
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
  'top-left': 'top-3 left-3',
};

/** DOM overlay with camera preset buttons. Place inside the canvas wrapper. */
export const SimViewButtons = ({
  view,
  onViewChange,
  autoRotate,
  onToggleAutoRotate,
  position = 'bottom-left',
}: SimViewButtonsProps) => (
  <div
    dir="rtl"
    className={`absolute ${positionClass[position]} z-20 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card/80 p-1.5 shadow-lg backdrop-blur-md`}
  >
    {views.map((v) => (
      <Button
        key={v.key}
        size="sm"
        variant={view === v.key ? 'default' : 'ghost'}
        className="h-7 px-2 text-xs"
        onClick={() => onViewChange(v.key)}
      >
        {v.label}
      </Button>
    ))}
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs"
      onClick={() => onViewChange('default')}
      title="إعادة ضبط الكاميرا"
    >
      <RotateCcw className="h-3.5 w-3.5" />
    </Button>
    {onToggleAutoRotate && (
      <Button
        size="sm"
        variant={autoRotate ? 'default' : 'ghost'}
        className="h-7 px-2 text-xs"
        onClick={onToggleAutoRotate}
        title="دوران تلقائي"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </Button>
    )}
  </div>
);
