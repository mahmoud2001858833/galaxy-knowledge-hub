import { useState, useCallback, useMemo, useRef } from 'react';

export interface OpticalElement {
  id: string;
  type: 'light-source' | 'convex-lens' | 'concave-lens' | 'plane-mirror' | 'convex-mirror' | 'concave-mirror' | 'prism';
  x: number;
  y: number;
  rotation: number;
  focalLength: number;
  width: number;
  height: number;
  refractiveIndex: number;
}

export interface LightRay {
  id: string;
  segments: RaySegment[];
  wavelength: number;
  color: string;
  intensity: number;
}

export interface RaySegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface OpticsState {
  elements: OpticalElement[];
  rays: LightRay[];
  selectedElement: string | null;
  isDragging: boolean;
  showGrid: boolean;
  showDispersion: boolean;
  rayCount: number;
  lightSourceIntensity: number;
}

export const MAX_LIGHT_SOURCES = 4;
export const MAX_TOTAL_ELEMENTS = 18;
export const MAX_TOTAL_RAYS = 140;
const MAX_BOUNCES = 6;

// Spectral colors for dispersion
export const SPECTRUM_COLORS = [
  { wavelength: 380, color: '#8B00FF', name: 'بنفسجي' },
  { wavelength: 420, color: '#4B0082', name: 'نيلي' },
  { wavelength: 470, color: '#0077FF', name: 'أزرق' },
  { wavelength: 530, color: '#00E676', name: 'أخضر' },
  { wavelength: 580, color: '#FFD600', name: 'أصفر' },
  { wavelength: 610, color: '#FF7F00', name: 'برتقالي' },
  { wavelength: 680, color: '#FF2E2E', name: 'أحمر' },
] as const;

const calculateRefraction = (
  incidentAngle: number,
  n1: number,
  n2: number,
): { angle: number; totalInternalReflection: boolean } => {
  const sinRefracted = (n1 / n2) * Math.sin(incidentAngle);
  if (Math.abs(sinRefracted) > 1) {
    return { angle: Math.PI - incidentAngle, totalInternalReflection: true };
  }
  return { angle: Math.asin(sinRefracted), totalInternalReflection: false };
};

const getCauchyRefractiveIndex = (wavelength: number, baseIndex: number): number => {
  const A = baseIndex - 0.01;
  const B = 0.0042;
  const wavelengthMicrons = wavelength / 1000;
  return A + B / (wavelengthMicrons * wavelengthMicrons);
};

const wavelengthToColor = (wavelength: number): string => {
  for (let i = 0; i < SPECTRUM_COLORS.length - 1; i++) {
    if (wavelength >= SPECTRUM_COLORS[i].wavelength && wavelength < SPECTRUM_COLORS[i + 1].wavelength) {
      return SPECTRUM_COLORS[i].color;
    }
  }
  return SPECTRUM_COLORS[SPECTRUM_COLORS.length - 1].color;
};

const findIntersection = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  element: OpticalElement,
): { x: number; y: number; normal: number } | null => {
  const dx = x2 - x1;
  if (Math.abs(dx) < 1e-6) return null;
  const dy = y2 - y1;

  const elementX = element.x;
  const halfH = element.height / 2;

  if ((x1 < elementX && x2 > elementX) || (x1 > elementX && x2 < elementX)) {
    const t = (elementX - x1) / dx;
    if (t <= 0.0001 || t > 1) return null;
    const intersectY = y1 + t * dy;

    if (intersectY >= element.y - halfH && intersectY <= element.y + halfH) {
      let normal = 0;

      if (element.type === 'convex-lens' || element.type === 'concave-lens') {
        const relativeY = (intersectY - element.y) / halfH;
        normal = element.type === 'convex-lens' ? Math.atan(relativeY * 0.3) : Math.atan(-relativeY * 0.3);
      } else if (element.type.includes('mirror')) {
        if (element.type === 'concave-mirror') {
          const relativeY = (intersectY - element.y) / halfH;
          normal = Math.PI + Math.atan(relativeY * 0.3);
        } else if (element.type === 'convex-mirror') {
          const relativeY = (intersectY - element.y) / halfH;
          normal = Math.atan(-relativeY * 0.3);
        } else {
          normal = dx > 0 ? Math.PI : 0;
        }
      } else if (element.type === 'prism') {
        normal = intersectY - element.y < 0 ? Math.PI / 6 : -Math.PI / 6;
      }

      return { x: elementX, y: intersectY, normal };
    }
  }

  return null;
};

const traceRay = (
  startX: number,
  startY: number,
  angleRad: number,
  wavelength: number,
  nonSourceElements: OpticalElement[],
  maxBounces: number = MAX_BOUNCES,
): RaySegment[] => {
  const segments: RaySegment[] = [];
  let currentX = startX;
  let currentY = startY;
  let currentAngle = angleRad;
  let lastHitId: string | null = null;
  const color = wavelengthToColor(wavelength);

  for (let bounce = 0; bounce < maxBounces; bounce++) {
    const rayLength = 1500;
    const endX = currentX + Math.cos(currentAngle) * rayLength;
    const endY = currentY + Math.sin(currentAngle) * rayLength;

    let closestIntersection: { x: number; y: number; normal: number; element: OpticalElement; distSq: number } | null = null;

    for (let i = 0; i < nonSourceElements.length; i++) {
      const element = nonSourceElements[i];
      if (element.id === lastHitId) continue;

      const intersection = findIntersection(currentX, currentY, endX, endY, element);
      if (intersection) {
        const ddx = intersection.x - currentX;
        const ddy = intersection.y - currentY;
        const distSq = ddx * ddx + ddy * ddy;
        if (distSq > 4 && (!closestIntersection || distSq < closestIntersection.distSq)) {
          closestIntersection = { ...intersection, element, distSq };
        }
      }
    }

    if (closestIntersection) {
      segments.push({
        x1: currentX,
        y1: currentY,
        x2: closestIntersection.x,
        y2: closestIntersection.y,
        color,
      });

      currentX = closestIntersection.x;
      currentY = closestIntersection.y;
      const element = closestIntersection.element;
      lastHitId = element.id;
      const incidentAngle = currentAngle - closestIntersection.normal;

      if (element.type.includes('mirror')) {
        currentAngle = 2 * closestIntersection.normal - currentAngle + Math.PI;
      } else if (element.type.includes('lens')) {
        const n2 = getCauchyRefractiveIndex(wavelength, element.refractiveIndex);
        const { totalInternalReflection } = calculateRefraction(incidentAngle, 1.0, n2);
        if (totalInternalReflection) {
          currentAngle = 2 * closestIntersection.normal - currentAngle + Math.PI;
        } else {
          const safeFocal = Math.abs(element.focalLength) < 10 ? 10 : Math.abs(element.focalLength);
          const distanceFromAxis = closestIntersection.y - element.y;
          const bendAngle = (distanceFromAxis / safeFocal) * 0.5;
          currentAngle = element.type === 'convex-lens' ? currentAngle - bendAngle : currentAngle + bendAngle;
        }
      } else if (element.type === 'prism') {
        const n2 = getCauchyRefractiveIndex(wavelength, 1.52);
        const deviation = (n2 - 1) * (Math.PI / 3);
        currentAngle = currentAngle + deviation * (wavelength / 550 - 1) * 2;
      }
    } else {
      const finalX = Math.max(-50, Math.min(endX, 1150));
      const finalY = Math.max(-50, Math.min(endY, 600));
      segments.push({ x1: currentX, y1: currentY, x2: finalX, y2: finalY, color });
      break;
    }
  }

  return segments;
};

export const useAdvancedOptics = () => {
  const [coreState, setCoreState] = useState<Omit<OpticsState, 'rays'>>({
    elements: [
      { id: 'light-init', type: 'light-source', x: 880, y: 250, rotation: 0, width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
      { id: 'lens-init', type: 'convex-lens', x: 500, y: 250, rotation: 0, width: 20, height: 150, focalLength: 130, refractiveIndex: 1.52 },
    ],
    selectedElement: null,
    isDragging: false,
    showGrid: true,
    showDispersion: true,
    rayCount: 5,
    lightSourceIntensity: 1,
  });

  // Compute rays purely via useMemo with a strict global ray cap so adding light sources NEVER freezes the device
  const rays = useMemo<LightRay[]>(() => {
    const lightSources = coreState.elements.filter((e) => e.type === 'light-source');
    if (lightSources.length === 0) return [];
    const nonSourceElements = coreState.elements.filter((e) => e.type !== 'light-source');

    const newRays: LightRay[] = [];
    const colorsPerRay = coreState.showDispersion ? SPECTRUM_COLORS.length : 1;
    // Dynamically scale per-source ray count to always stay safely within MAX_TOTAL_RAYS
    const maxRaysPerSource = Math.max(1, Math.floor(MAX_TOTAL_RAYS / (lightSources.length * colorsPerRay)));
    const effectiveRayCount = Math.min(coreState.rayCount, maxRaysPerSource);

    for (let sIdx = 0; sIdx < lightSources.length; sIdx++) {
      const source = lightSources[sIdx];
      const baseAngle = Math.PI + (source.rotation * Math.PI) / 180;

      if (coreState.showDispersion) {
        for (let i = 0; i < SPECTRUM_COLORS.length; i++) {
          const spectrum = SPECTRUM_COLORS[i];
          for (let j = 0; j < effectiveRayCount; j++) {
            const offset = j - (effectiveRayCount - 1) / 2;
            const spreadAngle = offset * 0.03;
            const segments = traceRay(
              source.x,
              source.y + offset * 8,
              baseAngle + spreadAngle,
              spectrum.wavelength,
              nonSourceElements,
            );
            newRays.push({
              id: `ray-${source.id}-${i}-${j}`,
              segments,
              wavelength: spectrum.wavelength,
              color: spectrum.color,
              intensity: coreState.lightSourceIntensity,
            });
          }
        }
      } else {
        for (let j = 0; j < effectiveRayCount; j++) {
          const offset = j - (effectiveRayCount - 1) / 2;
          const spreadAngle = offset * 0.03;
          const segments = traceRay(
            source.x,
            source.y + offset * 10,
            baseAngle + spreadAngle,
            550,
            nonSourceElements,
          );
          newRays.push({
            id: `ray-${source.id}-${j}`,
            segments,
            wavelength: 550,
            color: '#FFD700',
            intensity: coreState.lightSourceIntensity,
          });
        }
      }
    }

    return newRays;
  }, [coreState.elements, coreState.rayCount, coreState.showDispersion, coreState.lightSourceIntensity]);

  const state: OpticsState = useMemo(() => ({ ...coreState, rays }), [coreState, rays]);

  const elementsRef = useRef<OpticalElement[]>(coreState.elements);
  elementsRef.current = coreState.elements;

  const addElement = useCallback((type: OpticalElement['type'], x: number, y: number): { ok: boolean; reason?: string } => {
    const currentElements = elementsRef.current;
    if (currentElements.length >= MAX_TOTAL_ELEMENTS) {
      return {
        ok: false,
        reason: `الحد الأقصى الآمن هو ${MAX_TOTAL_ELEMENTS} عنصراً على اللوحة للحفاظ على سرعة الجهاز.`,
      };
    }
    if (type === 'light-source') {
      const currentSources = currentElements.filter((e) => e.type === 'light-source').length;
      if (currentSources >= MAX_LIGHT_SOURCES) {
        return {
          ok: false,
          reason: `الحد الأقصى الآمن هو ${MAX_LIGHT_SOURCES} مصادر ضوء لضمان سلاسة الأداء دون بطء.`,
        };
      }
    }

    setCoreState((prev) => {
      if (prev.elements.length >= MAX_TOTAL_ELEMENTS) return prev;
      if (type === 'light-source' && prev.elements.filter((e) => e.type === 'light-source').length >= MAX_LIGHT_SOURCES) {
        return prev;
      }

      const defaults: Record<OpticalElement['type'], { width: number; height: number; focalLength: number; refractiveIndex: number }> = {
        'light-source': { width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
        'convex-lens': { width: 20, height: 120, focalLength: 150, refractiveIndex: 1.52 },
        'concave-lens': { width: 20, height: 120, focalLength: -150, refractiveIndex: 1.52 },
        'plane-mirror': { width: 10, height: 120, focalLength: Infinity, refractiveIndex: 1 },
        'convex-mirror': { width: 20, height: 120, focalLength: -100, refractiveIndex: 1 },
        'concave-mirror': { width: 20, height: 120, focalLength: 100, refractiveIndex: 1 },
        'prism': { width: 80, height: 80, focalLength: 0, refractiveIndex: 1.52 },
      };

      // Stagger new elements slightly so multiple light sources or lenses don't stack invisibly
      const sameTypeCount = prev.elements.filter((e) => e.type === type).length;
      const offsetY = sameTypeCount === 0 ? 0 : (sameTypeCount % 2 === 1 ? -1 : 1) * Math.ceil(sameTypeCount / 2) * 55;
      const safeY = Math.max(70, Math.min(430, y + offsetY));

      const newElement: OpticalElement = {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        x,
        y: safeY,
        rotation: 0,
        ...defaults[type],
      };

      return { ...prev, elements: [...prev.elements, newElement], selectedElement: newElement.id };
    });
    return { ok: true };
  }, []);

  const removeElement = useCallback((id: string) => {
    setCoreState((prev) => ({
      ...prev,
      elements: prev.elements.filter((e) => e.id !== id),
      selectedElement: prev.selectedElement === id ? null : prev.selectedElement,
    }));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<OpticalElement>) => {
    setCoreState((prev) => ({
      ...prev,
      elements: prev.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setCoreState((prev) => ({ ...prev, selectedElement: id }));
  }, []);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    setCoreState((prev) => ({
      ...prev,
      elements: prev.elements.map((e) => (e.id === id ? { ...e, x, y } : e)),
    }));
  }, []);

  const toggleGrid = useCallback(() => {
    setCoreState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleDispersion = useCallback(() => {
    setCoreState((prev) => ({ ...prev, showDispersion: !prev.showDispersion }));
  }, []);

  const setRayCount = useCallback((count: number) => {
    const clamped = Math.max(1, Math.min(12, Math.round(count)));
    setCoreState((prev) => ({ ...prev, rayCount: clamped }));
  }, []);

  const clearAll = useCallback(() => {
    setCoreState({
      elements: [],
      selectedElement: null,
      isDragging: false,
      showGrid: true,
      showDispersion: true,
      rayCount: 5,
      lightSourceIntensity: 1,
    });
  }, []);

  const loadPreset = useCallback((preset: 'refraction' | 'prism-rainbow' | 'lens-focus' | 'mirror-reflection') => {
    let elements: OpticalElement[] = [];
    switch (preset) {
      case 'refraction':
        elements = [
          { id: 'light-1', type: 'light-source', x: 900, y: 250, rotation: 0, width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
          { id: 'lens-1', type: 'convex-lens', x: 500, y: 250, rotation: 0, width: 20, height: 150, focalLength: 120, refractiveIndex: 1.52 },
        ];
        break;
      case 'prism-rainbow':
        elements = [
          { id: 'light-1', type: 'light-source', x: 900, y: 250, rotation: 0, width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
          { id: 'prism-1', type: 'prism', x: 550, y: 250, rotation: 0, width: 80, height: 80, focalLength: 0, refractiveIndex: 1.52 },
        ];
        break;
      case 'lens-focus':
        elements = [
          { id: 'light-1', type: 'light-source', x: 950, y: 250, rotation: 0, width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
          { id: 'lens-1', type: 'convex-lens', x: 600, y: 250, rotation: 0, width: 20, height: 150, focalLength: 100, refractiveIndex: 1.52 },
          { id: 'lens-2', type: 'concave-lens', x: 350, y: 250, rotation: 0, width: 20, height: 150, focalLength: -100, refractiveIndex: 1.52 },
        ];
        break;
      case 'mirror-reflection':
        elements = [
          { id: 'light-1', type: 'light-source', x: 900, y: 200, rotation: 0, width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
          { id: 'mirror-1', type: 'concave-mirror', x: 450, y: 250, rotation: 0, width: 20, height: 150, focalLength: 100, refractiveIndex: 1 },
        ];
        break;
    }
    setCoreState((prev) => ({ ...prev, elements, selectedElement: null }));
  }, []);

  const generateRays = useCallback(() => {
    // Kept for backwards API compatibility; rays are computed automatically via useMemo
  }, []);

  return {
    state,
    addElement,
    removeElement,
    updateElement,
    selectElement,
    moveElement,
    toggleGrid,
    toggleDispersion,
    setRayCount,
    clearAll,
    loadPreset,
    generateRays,
    SPECTRUM_COLORS,
  };
};
