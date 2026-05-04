// Renders a real sign-language hand illustration (one or two ParametricHands)
// based on the word + chosen sign system, plus a tiny movement indicator.
import React from 'react';
import ParametricHand from './handshapes/ParametricHand';
import { getHandshape } from './handshapes';
import { getSignVisual } from './handshapes/wordToHandshape';
import {
  ArrowLeftRight, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown,
  RotateCw, Hand,
} from 'lucide-react';

interface Props {
  word: { ar: string; category: string; id?: string };
  signSystem: string;
  size?: number;
  className?: string;
}

const MovementIcon: React.FC<{ movement: string; className?: string }> = ({ movement, className = 'w-3 h-3' }) => {
  switch (movement) {
    case 'wave_h': return <ArrowLeftRight className={className} />;
    case 'wave_v': return <ArrowUpDown className={className} />;
    case 'circle': return <RotateCw className={className} />;
    case 'push':   return <ArrowRight className={className} />;
    case 'pull':   return <ArrowLeftRight className={className} />;
    case 'up':     return <ArrowUp className={className} />;
    case 'down':   return <ArrowDown className={className} />;
    case 'tap':
    case 'tap_chest':
    case 'tap_chin':
    case 'tap_forehead':
      return <Hand className={className} />;
    default: return null;
  }
};

const SignGlyph: React.FC<Props> = ({ word, signSystem, size = 80, className = '' }) => {
  const visual = getSignVisual(word, signSystem);
  const cfg = getHandshape(visual.handshape);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}
         aria-label={`sign for ${word.ar}`}>
      {visual.twoHanded ? (
        <div className="flex items-end -space-x-2">
          <ParametricHand config={cfg} size={size * 0.78} />
          <ParametricHand
            config={{ ...cfg, rotate: (cfg.rotate || 0) - 12 }}
            size={size * 0.78}
            className="-scale-x-100"
          />
        </div>
      ) : (
        <ParametricHand config={cfg} size={size} active />
      )}
      {visual.movement !== 'none' && (
        <span className="absolute -bottom-1 -left-1 bg-[hsl(var(--damij-primary))] text-white rounded-full p-1 shadow">
          <MovementIcon movement={visual.movement} />
        </span>
      )}
    </div>
  );
};

export default SignGlyph;
