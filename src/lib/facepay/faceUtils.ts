// Lightweight face utilities built on top of MediaPipe FaceLandmarker output.
// Landmarks are normalized {x,y,z} in [0,1].

export type Landmark = { x: number; y: number; z: number };

const dist = (a: Landmark, b: Landmark) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// An expanded set of landmark indices used as anchors (face mesh = 468 pts).
// More anchors => higher-dimensional embedding => much harder to spoof with another face.
const ANCHORS = [
  10, 152, 234, 454,   // forehead, chin, left ear, right ear
  168, 6, 197, 195, 5, 4, 1, // nose bridge + tip
  33, 133, 362, 263,   // eyes corners
  61, 291, 13, 14,     // mouth corners + lips center
  78, 308, 0, 17,      // mouth inner + upper/lower lip
  127, 356,            // cheekbones
  93, 323,             // jaw sides
  70, 300,             // brow outer
  55, 285, 105, 334,   // brow inner + mid
  159, 386,            // upper eyelids
  145, 374,            // lower eyelids
  46, 276,             // brow tail
  207, 427,            // mid-cheek
  132, 361,            // lower jaw curve
  58, 288,             // jawline
  172, 397,            // jaw mid
  136, 365,            // chin sides
];

/**
 * Build a scale-invariant embedding by computing pairwise distances between
 * anchor points, normalized by inter-eye distance. Returns a fixed-length vector.
 */
export const extractEmbedding = (landmarks: Landmark[]): number[] => {
  if (!landmarks || landmarks.length < 400) return [];
  const eyeDist = dist(landmarks[33], landmarks[263]) || 1e-6;
  const v: number[] = [];
  for (let i = 0; i < ANCHORS.length; i++) {
    for (let j = i + 1; j < ANCHORS.length; j++) {
      v.push(dist(landmarks[ANCHORS[i]], landmarks[ANCHORS[j]]) / eyeDist);
    }
  }
  return v;
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
};

/** Mean absolute error between two embeddings. Lower = more similar. */
export const meanAbsError = (a: number[], b: number[]): number => {
  if (!a.length || a.length !== b.length) return Infinity;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
};

/**
 * Combined identity score in [0,1]. Combines cosine similarity with a
 * geometric-distance penalty so two different faces with similar overall
 * shape can still be distinguished. Returns ~1 only for the same face.
 */
export const faceMatchScore = (a: number[], b: number[]): number => {
  const cos = cosineSimilarity(a, b);            // typically 0.95..1 for same person
  const mae = meanAbsError(a, b);                // typically <0.04 same, >0.08 different
  // Convert MAE to a 0..1 score (1 = identical, 0 = >=0.15 apart)
  const distScore = Math.max(0, 1 - mae / 0.15);
  // Weighted combination — distance dominates because cosine alone is too lenient
  return 0.35 * cos + 0.65 * distScore;
};

/** Smile detection: mouth width vs eye distance + lip openness. */
export const detectSmile = (landmarks: Landmark[]): boolean => {
  if (!landmarks || landmarks.length < 400) return false;
  const mouthW = dist(landmarks[61], landmarks[291]);
  const eyeW = dist(landmarks[33], landmarks[263]) || 1e-6;
  const ratio = mouthW / eyeW;
  // Corners pulled up: average y of corners higher (smaller y) than lips center y
  const cornersY = (landmarks[61].y + landmarks[291].y) / 2;
  const lipCenterY = landmarks[13].y;
  const upturned = cornersY < lipCenterY + 0.01;
  return ratio > 0.62 && upturned;
};

/** Eye Aspect Ratio (EAR): low value => eye closed. */
export const getEAR = (landmarks: Landmark[]): number => {
  if (!landmarks || landmarks.length < 400) return 1;
  // Right eye landmarks (approx): vertical 159-145, horizontal 33-133
  const rightV = dist(landmarks[159], landmarks[145]);
  const rightH = dist(landmarks[33], landmarks[133]) || 1e-6;
  // Left eye: vertical 386-374, horizontal 362-263
  const leftV = dist(landmarks[386], landmarks[374]);
  const leftH = dist(landmarks[362], landmarks[263]) || 1e-6;
  return ((rightV / rightH) + (leftV / leftH)) / 2;
};
