export type SimQuality = 'high' | 'medium' | 'low';

export function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export function detectQuality(): SimQuality {
  if (typeof window === 'undefined') return 'medium';
  const cores = (navigator as any).hardwareConcurrency ?? 4;
  const mem = (navigator as any).deviceMemory ?? 4;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const dpr = window.devicePixelRatio || 1;

  if (isMobile || cores <= 4 || mem <= 3) return 'low';
  if (cores >= 8 && mem >= 8 && dpr <= 2) return 'high';
  return 'medium';
}

export const qualitySettings: Record<
  SimQuality,
  { dpr: [number, number]; shadows: boolean; segments: number; particles: number }
> = {
  high: { dpr: [1, 2], shadows: true, segments: 64, particles: 600 },
  medium: { dpr: [1, 1.5], shadows: true, segments: 32, particles: 300 },
  low: { dpr: [0.75, 1], shadows: false, segments: 16, particles: 120 },
};
