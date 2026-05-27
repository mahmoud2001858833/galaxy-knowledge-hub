// Builds short Arabic step instructions when a target landmark is being tracked.
import type { LocalLandmark } from './destinationParser';
import { LANDMARK_AR } from './destinationParser';

export type LandmarkPoint = {
  x: number; // center 0-1
  y: number;
  w: number;
  h: number;
  label: string;        // english label coming from AI
  proximity: number;    // 0-100
};

// Map AI english labels (possibly noisy) to our canonical landmark.
const LABEL_MAP: Array<[RegExp, LocalLandmark]> = [
  [/door|gate|entrance|exit|باب/i, 'door'],
  [/chair|كرسي/i, 'chair'],
  [/table|desk|طاولة|طابلة|مكتب/i, 'table'],
  [/stair|step|staircase|درج|سلم/i, 'stairs'],
  [/window|نافذة|شباك/i, 'window'],
  [/person|man|woman|people|human|شخص|رجل/i, 'person'],
  [/bed|سرير/i, 'bed'],
  [/sink|basin|مغسلة|حوض/i, 'sink'],
  [/toilet|wc|حمام|مرحاض/i, 'toilet'],
  [/sofa|couch|كنبة|أريكة/i, 'sofa'],
  [/car|vehicle|سيارة/i, 'car'],
];

export function classifyLandmark(label: string): LocalLandmark | null {
  for (const [rx, lm] of LABEL_MAP) if (rx.test(label)) return lm;
  return null;
}

export function findTarget(points: LandmarkPoint[], target: LocalLandmark): LandmarkPoint | null {
  let best: LandmarkPoint | null = null;
  let bestScore = -1;
  for (const p of points) {
    if (classifyLandmark(p.label) !== target) continue;
    // Prefer larger/closer
    const score = (p.w * p.h) + p.proximity / 200;
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return best;
}

export function bearingFromX(x: number): 'left' | 'center' | 'right' {
  if (x < 0.38) return 'left';
  if (x > 0.62) return 'right';
  return 'center';
}

export function distanceBucket(p: LandmarkPoint): 'arrived' | 'near' | 'mid' | 'far' {
  const area = p.w * p.h;
  if (p.proximity >= 85 || area > 0.42) return 'arrived';
  if (p.proximity >= 60 || area > 0.18) return 'near';
  if (p.proximity >= 35 || area > 0.06) return 'mid';
  return 'far';
}

export function buildStepAr(target: LocalLandmark, p: LandmarkPoint | null): {
  text: string;
  arrived: boolean;
  bearing: 'left' | 'center' | 'right' | null;
} {
  const name = LANDMARK_AR[target];
  if (!p) return { text: `${name} غير ظاهر، أدر الكاميرا ببطء`, arrived: false, bearing: null };
  const b = bearingFromX(p.x);
  const d = distanceBucket(p);
  if (d === 'arrived') return { text: `وصلت إلى ${name}`, arrived: true, bearing: b };
  const dirAr = b === 'left' ? 'يسارك' : b === 'right' ? 'يمينك' : 'أمامك';
  if (b === 'center') {
    if (d === 'near') return { text: `${name} أمامك مباشرة، تقدم بحذر`, arrived: false, bearing: b };
    if (d === 'mid') return { text: `${name} أمامك، تقدم للأمام`, arrived: false, bearing: b };
    return { text: `${name} أمامك بعيداً، استمر للأمام`, arrived: false, bearing: b };
  }
  return { text: `${name} على ${dirAr}، التف قليلاً ثم تقدم`, arrived: false, bearing: b };
}
