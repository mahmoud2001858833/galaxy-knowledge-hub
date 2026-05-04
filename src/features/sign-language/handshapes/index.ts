import type { HandConfig } from './ParametricHand';

// ASL fingerspelling A–Z, configured as ParametricHand poses.
// Approximations tuned for visual recognizability, not anatomical precision.
const C: Record<string, HandConfig> = {
  asl_a: { thumb: 'up',          index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', label: 'A' },
  asl_b: { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended', label: 'B' },
  asl_c: { thumb: 'out',         index: 'bent', middle: 'bent', ring: 'bent', pinky: 'bent', orientation: 'side_right', label: 'C' },
  asl_d: { thumb: 'touch_middle',index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', label: 'D' },
  asl_e: { thumb: 'across',      index: 'hook', middle: 'hook', ring: 'hook', pinky: 'hook', label: 'E' },
  asl_f: { thumb: 'touch_index', index: 'curled', middle: 'extended', ring: 'extended', pinky: 'extended', label: 'F' },
  asl_g: { thumb: 'out',         index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', orientation: 'side_right', label: 'G' },
  asl_h: { thumb: 'tucked',      index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', orientation: 'side_right', label: 'H' },
  asl_i: { thumb: 'across',      index: 'curled', middle: 'curled', ring: 'curled', pinky: 'extended', label: 'I' },
  asl_j: { thumb: 'across',      index: 'curled', middle: 'curled', ring: 'curled', pinky: 'extended', rotate: -20, label: 'J' },
  asl_k: { thumb: 'between',     index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', spread: true, label: 'K' },
  asl_l: { thumb: 'out',         index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', label: 'L' },
  asl_m: { thumb: 'tucked',      index: 'bent', middle: 'bent', ring: 'bent', pinky: 'curled', label: 'M' },
  asl_n: { thumb: 'tucked',      index: 'bent', middle: 'bent', ring: 'curled', pinky: 'curled', label: 'N' },
  asl_o: { thumb: 'touch_index', index: 'bent', middle: 'bent', ring: 'bent', pinky: 'bent', label: 'O' },
  asl_p: { thumb: 'between',     index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', orientation: 'down', spread: true, label: 'P' },
  asl_q: { thumb: 'out',         index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', orientation: 'down', label: 'Q' },
  asl_r: { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', crossed: true, label: 'R' },
  asl_s: { thumb: 'across',      index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', label: 'S' },
  asl_t: { thumb: 'between',     index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', label: 'T' },
  asl_u: { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', label: 'U' },
  asl_v: { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', spread: true, label: 'V' },
  asl_w: { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'extended', pinky: 'curled', spread: true, label: 'W' },
  asl_x: { thumb: 'across',      index: 'hook', middle: 'curled', ring: 'curled', pinky: 'curled', label: 'X' },
  asl_y: { thumb: 'out',         index: 'curled', middle: 'curled', ring: 'curled', pinky: 'extended', label: 'Y' },
  asl_z: { thumb: 'across',      index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', rotate: 10, label: 'Z' },

  // ── Common sign primitives ──
  open_palm:    { thumb: 'out',         index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended' },
  flat_hand:    { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended' },
  flat_hand_down:{thumb: 'across',      index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended', orientation: 'down' },
  fist:         { thumb: 'across',      index: 'curled',   middle: 'curled',   ring: 'curled',   pinky: 'curled' },
  thumbs_up:    { thumb: 'up',          index: 'curled',   middle: 'curled',   ring: 'curled',   pinky: 'curled' },
  thumbs_down:  { thumb: 'up',          index: 'curled',   middle: 'curled',   ring: 'curled',   pinky: 'curled', orientation: 'down' },
  point:        { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled' },
  point_up:     { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled' },
  point_down:   { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled', orientation: 'down' },
  point_right:  { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled', orientation: 'side_right' },
  point_left:   { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled', orientation: 'side_left' },
  victory:      { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'curled',   pinky: 'curled', spread: true },
  three:        { thumb: 'out',         index: 'extended', middle: 'extended', ring: 'curled',   pinky: 'curled', spread: true },
  four:         { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended' },
  five:         { thumb: 'out',         index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended', spread: true },
  ok:           { thumb: 'touch_index', index: 'curled',   middle: 'extended', ring: 'extended', pinky: 'extended' },
  love:         { thumb: 'out',         index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'extended' }, // ILY
  call_me:      { thumb: 'out',         index: 'curled',   middle: 'curled',   ring: 'curled',   pinky: 'extended' },
  rock:         { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'extended' },
  pinch:        { thumb: 'touch_index', index: 'bent',     middle: 'curled',   ring: 'curled',   pinky: 'curled' },
  claw:         { thumb: 'out',         index: 'hook',     middle: 'hook',     ring: 'hook',     pinky: 'hook', spread: true },
  bent_hand:    { thumb: 'across',      index: 'bent',     middle: 'bent',     ring: 'bent',     pinky: 'bent' },
  spread_hand:  { thumb: 'out',         index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended', spread: true },
  prayer:       { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended' }, // rendered with two_handed
  wave:         { thumb: 'out',         index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended' },
  finger_gun:   { thumb: 'up',          index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled', orientation: 'side_right' },
  crossed_fingers:{thumb: 'across',     index: 'extended', middle: 'extended', ring: 'curled',   pinky: 'curled', crossed: true },
  one:          { thumb: 'across',      index: 'extended', middle: 'curled',   ring: 'curled',   pinky: 'curled' },
  two:          { thumb: 'across',      index: 'extended', middle: 'extended', ring: 'curled',   pinky: 'curled', spread: true },
};

export type HandshapeId = keyof typeof C | string;

export const HANDSHAPES = C;

export const ALLOWED_HANDSHAPE_IDS = Object.keys(C);

export function getHandshape(id?: string): HandConfig {
  if (!id) return C.open_palm;
  if (C[id]) return C[id];
  // fingerspelling fallback by single letter
  const letter = id.toLowerCase().replace(/^asl_/, '');
  if (letter.length === 1 && C['asl_' + letter]) return C['asl_' + letter];
  return C.open_palm;
}

export const ALLOWED_MOVEMENTS = [
  'none', 'tap', 'wave_h', 'wave_v', 'circle', 'push', 'pull', 'up', 'down',
] as const;
export type Movement = typeof ALLOWED_MOVEMENTS[number];
