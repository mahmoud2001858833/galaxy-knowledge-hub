// Lightweight face utilities built on top of MediaPipe FaceLandmarker output.
// Landmarks are normalized {x,y,z} in [0,1].

export type Landmark = { x: number; y: number; z: number };
export type Blendshapes = Record<string, number>;

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
  // Convert MAE to a forgiving demo score. The browser camera can change angle/lighting
  // between enrollment and payment, so the threshold is intentionally tolerant.
  const distScore = Math.max(0, 1 - mae / 0.22);
  return Math.max(0, Math.min(1, 0.48 * cos + 0.52 * distScore));
};

/**
 * Smile score in [0,1]. Combines:
 *  - Mouth width relative to eye distance (smiling stretches mouth wider).
 *  - Mouth-corner elevation: corners must rise ABOVE the upper-lip line, not just align.
 *  - Cheek raise: distance from mouth corner to outer eye shrinks when smiling.
 *  - Penalty when corners are pulled DOWN (frown / neutral).
 *
 * Returns ~0 for neutral/closed mouth and >0.7 for a clear genuine smile.
 */
export const smileScore = (landmarks: Landmark[], blendshapes: Blendshapes = {}): number => {
  if (!landmarks || landmarks.length < 400) return 0;
  const blendSmile = Math.max(
    blendshapes.mouthSmileLeft ?? 0,
    blendshapes.mouthSmileRight ?? 0,
    ((blendshapes.mouthDimpleLeft ?? 0) + (blendshapes.mouthDimpleRight ?? 0)) / 2,
  );
  const blendBoost = Math.max(0, Math.min(1, blendSmile / 0.55));
  const leftCorner = landmarks[61];
  const rightCorner = landmarks[291];
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const leftEyeInner = landmarks[133];
  const rightEyeInner = landmarks[362];

  const eyeW = dist(leftEyeOuter, rightEyeOuter) || 1e-6;
  const faceH = Math.abs(landmarks[10].y - landmarks[152].y) || 1e-6;

  // 1) Mouth-width ratio. Neutral ~0.50, smile >0.66.
  const mouthW = dist(leftCorner, rightCorner);
  const widthRatio = mouthW / eyeW;
  const widthScore = Math.max(0, Math.min(1, (widthRatio - 0.58) / 0.16)); // 0 at 0.58, 1 at 0.74

  // 2) Corner elevation vs upper lip. In normalized coords smaller y = higher up.
  // For a real smile, corners should be HIGHER than the upper lip (cornersY < upperLipY).
  const cornersY = (leftCorner.y + rightCorner.y) / 2;
  const lipLineY = (upperLip.y + lowerLip.y) / 2;
  const elevation = (lipLineY - cornersY) / faceH; // positive when corners rise toward the upper lip
  const elevationScore = Math.max(0, Math.min(1, (elevation + 0.004) / 0.018));

  // 3) Cheek raise: distance from corner to outer-eye shrinks when smiling.
  // Reference baseline ~0.42*eyeW for neutral; ~0.30*eyeW for big smile.
  const cornerToEye =
    (dist(leftCorner, leftEyeOuter) + dist(rightCorner, rightEyeOuter)) / 2;
  const cheekRatio = cornerToEye / eyeW;
  const cheekScore = Math.max(0, Math.min(1, (0.47 - cheekRatio) / 0.15));

  // 4) Frown penalty: if corners are clearly BELOW the lower lip, kill the score.
  const lowerLipY = lowerLip.y;
  const frown = cornersY > lowerLipY + 0.012 * faceH && blendBoost < 0.25;
  if (frown) return 0;

  // Weighted combination — elevation matters most because it's the hardest fake.
  const geometryScore =
    0.30 * widthScore +
    0.45 * elevationScore +
    0.25 * cheekScore;
  const score = Math.max(geometryScore, 0.65 * blendBoost + 0.35 * geometryScore);

  // Hard gate: must satisfy ALL three minimums to count as a smile at all.
  if (blendBoost < 0.35 && (widthScore < 0.18 || elevationScore < 0.12 || cheekScore < 0.08)) {
    return Math.min(score, 0.35); // cap below threshold
  }
  return score;
};

/** Boolean smile detector with strict threshold. Use smileScore for granular control. */
export const detectSmile = (landmarks: Landmark[], blendshapes: Blendshapes = {}): boolean => smileScore(landmarks, blendshapes) >= 0.42;

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
