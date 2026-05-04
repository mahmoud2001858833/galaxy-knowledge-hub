import React from 'react';
import { motion } from 'framer-motion';
import { ParametricHand } from './handshapes/ParametricHand';
import { getHandshape, type Movement } from './handshapes';

interface Props {
  word: string;
  handshapeId?: string;
  movement?: Movement;
  twoHanded?: boolean;
  active?: boolean;
  size?: number;
  letter?: string;          // when used as a letter card
  caption?: string;         // small subtitle
  onClick?: () => void;
}

const movementToAnim: Record<Movement, any> = {
  none:    {},
  tap:     { y: [0, 4, 0],     transition: { duration: 0.7, repeat: Infinity } },
  wave_h:  { x: [-4, 4, -4],   transition: { duration: 0.9, repeat: Infinity } },
  wave_v:  { y: [-4, 4, -4],   transition: { duration: 0.9, repeat: Infinity } },
  circle:  { rotate: [0, 360], transition: { duration: 1.6, repeat: Infinity, ease: 'linear' } },
  push:    { x: [0, 8, 0],     transition: { duration: 0.9, repeat: Infinity } },
  pull:    { x: [0, -8, 0],    transition: { duration: 0.9, repeat: Infinity } },
  up:      { y: [0, -8, 0],    transition: { duration: 0.9, repeat: Infinity } },
  down:    { y: [0, 8, 0],     transition: { duration: 0.9, repeat: Infinity } },
};

const movementArrow: Record<Movement, string> = {
  none: '', tap: '⇅', wave_h: '↔', wave_v: '↕', circle: '↻',
  push: '→', pull: '←', up: '↑', down: '↓',
};

export const HandSignCard: React.FC<Props> = ({
  word, handshapeId, movement = 'none', twoHanded, active, size = 88, letter, caption, onClick,
}) => {
  const cfg = getHandshape(letter ? `asl_${letter.toLowerCase()}` : handshapeId);
  const anim = active ? movementToAnim[movement] : {};

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-2 transition-all bg-white
        ${active
          ? 'border-[hsl(var(--damij-primary))] shadow-lg scale-110 z-10'
          : 'border-slate-200 hover:border-[hsl(var(--damij-primary))]/50 hover:shadow-md'}`}
      style={{ minWidth: size + 16 }}
    >
      <motion.div animate={anim} className="relative">
        {twoHanded ? (
          <div className="flex items-end gap-0">
            <ParametricHand config={{ ...cfg }} size={size * 0.7} active={active} />
            <ParametricHand config={{ ...cfg, orientation: 'side_left' }} size={size * 0.7} active={active} />
          </div>
        ) : (
          <ParametricHand config={cfg} size={size} active={active} />
        )}
        {active && movement !== 'none' && (
          <span className="absolute -top-1 -right-1 bg-[hsl(var(--damij-primary))] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
            {movementArrow[movement]}
          </span>
        )}
      </motion.div>
      <span className={`text-xs font-semibold mt-1 max-w-[110px] truncate ${active ? 'text-[hsl(var(--damij-primary))]' : 'text-slate-700'}`}>
        {letter ? letter.toUpperCase() : word}
      </span>
      {caption && <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{caption}</span>}
    </button>
  );
};

export default HandSignCard;
