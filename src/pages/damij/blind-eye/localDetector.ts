// On-device object detection using TensorFlow.js + COCO-SSD.
// Loaded lazily so it never blocks initial render.

import type * as cocoSsdNs from '@tensorflow-models/coco-ssd';

export type DetectedObject = {
  label: string;
  score: number;
  x: number; // normalized 0..1 (left)
  y: number; // normalized 0..1 (top)
  w: number; // normalized 0..1
  h: number; // normalized 0..1
};

let modelPromise: Promise<cocoSsdNs.ObjectDetection> | null = null;
let loaded = false;

export function isDetectorLoaded() { return loaded; }

export async function ensureDetector(): Promise<cocoSsdNs.ObjectDetection> {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const [tf, cocoSsd] = await Promise.all([
      import('@tensorflow/tfjs'),
      import('@tensorflow-models/coco-ssd'),
    ]);
    // Prefer WebGL backend on mobile for speed.
    try { await tf.setBackend('webgl'); } catch {}
    await tf.ready();
    const m = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    loaded = true;
    return m;
  })();
  return modelPromise;
}

const HAZARD_LABELS = new Set([
  'person','car','truck','bus','motorcycle','bicycle','dog','cat',
  'chair','bench','potted plant','traffic light','stop sign','fire hydrant',
  'dining table','couch','bed','suitcase','backpack','handbag',
]);

const LABEL_AR: Record<string, string> = {
  person: 'شخص', car: 'سيارة', truck: 'شاحنة', bus: 'حافلة',
  motorcycle: 'دراجة نارية', bicycle: 'دراجة', dog: 'كلب', cat: 'قطة',
  chair: 'كرسي', bench: 'مقعد', 'potted plant': 'نبتة', 'traffic light': 'إشارة',
  'stop sign': 'لافتة قف', 'fire hydrant': 'حنفية', 'dining table': 'طاولة',
  couch: 'أريكة', bed: 'سرير', suitcase: 'حقيبة', backpack: 'حقيبة ظهر',
  handbag: 'حقيبة يد', door: 'باب', wall: 'جدار',
};

export function labelToArabic(en: string): string {
  return LABEL_AR[en] || en;
}

export async function detectFromVideo(
  video: HTMLVideoElement,
  maxObjects = 8,
): Promise<DetectedObject[]> {
  if (!video.videoWidth || !video.videoHeight) return [];
  const model = await ensureDetector();
  const preds = await model.detect(video, maxObjects, 0.45);
  const vw = video.videoWidth, vh = video.videoHeight;
  return preds.map((p) => ({
    label: p.class,
    score: p.score ?? 0,
    x: p.bbox[0] / vw,
    y: p.bbox[1] / vh,
    w: p.bbox[2] / vw,
    h: p.bbox[3] / vh,
  }));
}

/** Critical hazard: large object in the lower-middle of the frame = imminent collision. */
export function detectImmediateHazard(objs: DetectedObject[]): DetectedObject | null {
  let worst: DetectedObject | null = null;
  let worstScore = 0;
  for (const o of objs) {
    if (!HAZARD_LABELS.has(o.label)) continue;
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    // Only the lower 60% of frame and roughly centered (within 25%-75% horizontally).
    if (cy < 0.4) continue;
    if (cx < 0.2 || cx > 0.8) continue;
    // Risk = area * verticality * score.
    const area = o.w * o.h;
    if (area < 0.08) continue; // earlier warning — smaller objects now trigger
    const risk = area * (cy) * (o.score);
    if (risk > worstScore) { worstScore = risk; worst = o; }
  }
  return worst;
}
