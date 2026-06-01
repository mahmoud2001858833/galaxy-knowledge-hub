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
  [/chair|seat|كرسي/i, 'chair'],
  [/table|dining|طاولة|طابلة|سفرة/i, 'table'],
  [/desk|مكتب/i, 'desk'],
  [/stair|step|staircase|درج|سلم|سلالم/i, 'stairs'],
  [/window|نافذة|شباك/i, 'window'],
  [/person|man|woman|people|human|شخص|رجل|ولد/i, 'person'],
  [/bed|سرير|تخت/i, 'bed'],
  [/sink|basin|مغسلة|حوض|مجلى/i, 'sink'],
  [/toilet|wc|restroom|حمام|مرحاض|تواليت/i, 'toilet'],
  [/sofa|couch|كنبة|أريكة|صوفا/i, 'sofa'],
  [/car|vehicle|truck|سيارة|عربية/i, 'car'],
  [/kitchen|stove|oven|cooker|مطبخ|كزينه/i, 'kitchen'],
  [/fridge|refrigerator|ثلاجة|براد|فريزر/i, 'fridge'],
  [/tv|television|screen|monitor|تلفاز|تلفزيون|شاشة/i, 'tv'],
  [/closet|wardrobe|cabinet|cupboard|drawer|خزانة|دولاب|كبت/i, 'closet'],
  [/switch|button|مفتاح|زر/i, 'light_switch'],
  [/computer|laptop|pc|كمبيوتر|حاسوب|لابتوب/i, 'computer'],
  [/balcony|terrace|patio|شرفة|بلكون|تراس/i, 'balcony'],
  [/elevator|lift|مصعد|اسانسير/i, 'elevator'],
  [/plant|tree|flower|leaf|نبتة|زرع|شجرة|ورد/i, 'plant'],
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
