import React from 'react';

/**
 * Parametric line-art hand illustration.
 * Renders a stylized but anatomically suggestive right hand using SVG primitives.
 * The same component renders ASL A–Z fingerspelling AND common sign primitives
 * by switching the per-finger state and the thumb posture.
 */
export type FingerState = 'extended' | 'half' | 'curled' | 'bent' | 'hook';
export type ThumbState = 'out' | 'across' | 'up' | 'tucked' | 'touch_index' | 'touch_middle' | 'between';
export type Orientation = 'palm' | 'back' | 'side_right' | 'side_left' | 'down' | 'up_palm';

export interface HandConfig {
  thumb: ThumbState;
  index: FingerState;
  middle: FingerState;
  ring: FingerState;
  pinky: FingerState;
  spread?: boolean;       // index/middle (or all) splayed apart (V vs U)
  crossed?: boolean;      // index over middle (R)
  orientation?: Orientation;
  rotate?: number;        // overall hand rotation (deg)
  label?: string;         // small overlay (e.g. ASL letter)
}

interface Props {
  config: HandConfig;
  size?: number;
  className?: string;
  active?: boolean;
}

// Finger anchor points on the palm (top edge), in SVG units.
const FINGER_ANCHORS = {
  index:  { x: 38, y: 60, baseRot: 0 },
  middle: { x: 50, y: 56, baseRot: 0 },
  ring:   { x: 62, y: 60, baseRot: 0 },
  pinky:  { x: 73, y: 66, baseRot: 6 },
};

const FINGER_LEN = {
  extended: 42,
  half: 26,
  bent: 30,
  hook: 24,
  curled: 10,
};

const Finger: React.FC<{
  anchor: { x: number; y: number; baseRot: number };
  state: FingerState;
  rotate?: number;
  width?: number;
}> = ({ anchor, state, rotate = 0, width = 11 }) => {
  const len = FINGER_LEN[state];
  const r = anchor.baseRot + rotate;

  if (state === 'curled') {
    // Small bump on the palm.
    return (
      <g transform={`translate(${anchor.x}, ${anchor.y})`}>
        <ellipse cx={0} cy={2} rx={width / 2 + 0.5} ry={5} fill="currentColor" opacity={0.18} />
        <ellipse cx={0} cy={2} rx={width / 2 + 0.5} ry={5} fill="none" stroke="currentColor" strokeWidth={2} />
      </g>
    );
  }

  if (state === 'hook') {
    // Bent at second knuckle (X).
    return (
      <g transform={`translate(${anchor.x}, ${anchor.y}) rotate(${r})`}>
        <rect x={-width / 2} y={-len * 0.55} width={width} height={len * 0.55} rx={width / 2} fill="currentColor" opacity={0.15} />
        <rect x={-width / 2} y={-len * 0.55} width={width} height={len * 0.55} rx={width / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
        <g transform={`translate(0, ${-len * 0.55}) rotate(70)`}>
          <rect x={-width / 2} y={-len * 0.45} width={width} height={len * 0.45} rx={width / 2} fill="currentColor" opacity={0.15} />
          <rect x={-width / 2} y={-len * 0.45} width={width} height={len * 0.45} rx={width / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
        </g>
      </g>
    );
  }

  if (state === 'bent') {
    return (
      <g transform={`translate(${anchor.x}, ${anchor.y}) rotate(${r})`}>
        <rect x={-width / 2} y={-len * 0.5} width={width} height={len * 0.5} rx={width / 2} fill="currentColor" opacity={0.15} />
        <rect x={-width / 2} y={-len * 0.5} width={width} height={len * 0.5} rx={width / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
        <g transform={`translate(0, ${-len * 0.5}) rotate(45)`}>
          <rect x={-width / 2} y={-len * 0.5} width={width} height={len * 0.5} rx={width / 2} fill="currentColor" opacity={0.15} />
          <rect x={-width / 2} y={-len * 0.5} width={width} height={len * 0.5} rx={width / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
        </g>
      </g>
    );
  }

  // extended / half — single tapered finger
  return (
    <g transform={`translate(${anchor.x}, ${anchor.y}) rotate(${r})`}>
      <rect x={-width / 2} y={-len} width={width} height={len + 2} rx={width / 2} fill="currentColor" opacity={0.15} />
      <rect x={-width / 2} y={-len} width={width} height={len + 2} rx={width / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
      {/* knuckle hints */}
      <line x1={-width / 2 + 1} y1={-len * 0.55} x2={width / 2 - 1} y2={-len * 0.55}
            stroke="currentColor" strokeWidth={1} opacity={0.45} />
    </g>
  );
};

const Thumb: React.FC<{ state: ThumbState }> = ({ state }) => {
  // base near (28, 80) on palm
  const w = 12;
  const len = 32;
  let transform = '';
  let segLen = len;
  let bend = 0;

  switch (state) {
    case 'out':         transform = 'translate(26, 78) rotate(-55)'; break;
    case 'up':          transform = 'translate(26, 78) rotate(-25)'; break;
    case 'across':      transform = 'translate(26, 78) rotate(-110)'; segLen = 26; break;
    case 'tucked':      transform = 'translate(28, 82) rotate(-90)'; segLen = 18; break;
    case 'touch_index': transform = 'translate(30, 76) rotate(-80)'; segLen = 24; bend = 25; break;
    case 'touch_middle':transform = 'translate(32, 74) rotate(-90)'; segLen = 26; bend = 30; break;
    case 'between':     transform = 'translate(30, 74) rotate(-95)'; segLen = 22; break;
  }

  return (
    <g transform={transform}>
      <rect x={-w / 2} y={-segLen * 0.5} width={w} height={segLen * 0.5} rx={w / 2} fill="currentColor" opacity={0.18} />
      <rect x={-w / 2} y={-segLen * 0.5} width={w} height={segLen * 0.5} rx={w / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <g transform={`translate(0, ${-segLen * 0.5}) rotate(${bend})`}>
        <rect x={-w / 2} y={-segLen * 0.5} width={w} height={segLen * 0.5} rx={w / 2} fill="currentColor" opacity={0.18} />
        <rect x={-w / 2} y={-segLen * 0.5} width={w} height={segLen * 0.5} rx={w / 2} fill="none" stroke="currentColor" strokeWidth={2.2} />
      </g>
    </g>
  );
};

export const ParametricHand: React.FC<Props> = ({ config, size = 120, className = '', active }) => {
  const { thumb, index, middle, ring, pinky, spread, crossed, orientation = 'palm', rotate = 0, label } = config;

  // Spread offsets for V vs U.
  const indexRot = spread ? -14 : crossed ? 8 : 0;
  const middleRot = spread ? 10 : crossed ? -8 : 0;
  const ringRot = 0;
  const pinkyRot = 0;

  // Mirror for back-of-hand orientations.
  const flip = orientation === 'back' || orientation === 'side_left' ? -1 : 1;
  const baseTilt =
    orientation === 'side_right' ? 75 :
    orientation === 'side_left'  ? -75 :
    orientation === 'down'       ? 180 :
    orientation === 'up_palm'    ? 0 :
    0;

  return (
    <svg
      viewBox="0 0 110 150"
      width={size}
      height={size}
      className={`${className} ${active ? 'text-[hsl(var(--damij-primary))]' : 'text-slate-700'}`}
      aria-label={label || 'sign'}
    >
      <g transform={`translate(55, 75) rotate(${rotate + baseTilt}) scale(${flip}, 1) translate(-55, -75)`}>
        {/* wrist */}
        <rect x={36} y={120} width={38} height={22} rx={6} fill="currentColor" opacity={0.12} />
        <rect x={36} y={120} width={38} height={22} rx={6} fill="none" stroke="currentColor" strokeWidth={2} />
        {/* palm */}
        <path
          d="M 28 70 Q 28 110 55 122 Q 82 110 82 70 Q 82 60 73 58 Q 65 56 55 56 Q 45 56 38 58 Q 28 60 28 70 Z"
          fill="currentColor" opacity={0.1}
        />
        <path
          d="M 28 70 Q 28 110 55 122 Q 82 110 82 70 Q 82 60 73 58 Q 65 56 55 56 Q 45 56 38 58 Q 28 60 28 70 Z"
          fill="none" stroke="currentColor" strokeWidth={2.4}
        />
        {/* fingers */}
        <Finger anchor={FINGER_ANCHORS.index}  state={index}  rotate={indexRot} />
        <Finger anchor={FINGER_ANCHORS.middle} state={middle} rotate={middleRot} />
        <Finger anchor={FINGER_ANCHORS.ring}   state={ring}   rotate={ringRot} />
        <Finger anchor={FINGER_ANCHORS.pinky}  state={pinky}  rotate={pinkyRot} />
        <Thumb state={thumb} />
        {/* O/F closure ring when thumb touches index */}
        {(thumb === 'touch_index') && (
          <circle cx={42} cy={32} r={9} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.7} />
        )}
      </g>
      {label && (
        <g>
          <rect x={2} y={2} width={26} height={20} rx={6} fill="currentColor" opacity={0.08} />
          <text x={15} y={17} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
            {label}
          </text>
        </g>
      )}
    </svg>
  );
};

export default ParametricHand;
