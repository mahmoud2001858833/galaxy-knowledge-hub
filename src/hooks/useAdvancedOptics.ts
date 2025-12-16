import { useState, useCallback, useRef, useEffect } from 'react';

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

// Spectral colors for dispersion
const SPECTRUM_COLORS = [
  { wavelength: 380, color: '#8B00FF', name: 'بنفسجي' },
  { wavelength: 420, color: '#4B0082', name: 'نيلي' },
  { wavelength: 470, color: '#0000FF', name: 'أزرق' },
  { wavelength: 530, color: '#00FF00', name: 'أخضر' },
  { wavelength: 580, color: '#FFFF00', name: 'أصفر' },
  { wavelength: 610, color: '#FF7F00', name: 'برتقالي' },
  { wavelength: 680, color: '#FF0000', name: 'أحمر' },
];

export const useAdvancedOptics = () => {
  const [state, setState] = useState<OpticsState>({
    elements: [],
    rays: [],
    selectedElement: null,
    isDragging: false,
    showGrid: true,
    showDispersion: true,
    rayCount: 7,
    lightSourceIntensity: 1,
  });

  const animationRef = useRef<number | null>(null);

  // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
  const calculateRefraction = useCallback((
    incidentAngle: number,
    n1: number,
    n2: number
  ): { angle: number; totalInternalReflection: boolean } => {
    const sinIncident = Math.sin(incidentAngle);
    const sinRefracted = (n1 / n2) * sinIncident;
    
    if (Math.abs(sinRefracted) > 1) {
      // Total internal reflection
      return { angle: Math.PI - incidentAngle, totalInternalReflection: true };
    }
    
    return { 
      angle: Math.asin(sinRefracted), 
      totalInternalReflection: false 
    };
  }, []);

  // Cauchy's equation for wavelength-dependent refractive index
  const getCauchyRefractiveIndex = useCallback((wavelength: number, baseIndex: number): number => {
    // Cauchy coefficients for crown glass
    const A = baseIndex - 0.01;
    const B = 0.0042;
    const wavelengthMicrons = wavelength / 1000;
    return A + B / (wavelengthMicrons * wavelengthMicrons);
  }, []);

  // Get color from wavelength
  const wavelengthToColor = useCallback((wavelength: number): string => {
    for (let i = 0; i < SPECTRUM_COLORS.length - 1; i++) {
      if (wavelength >= SPECTRUM_COLORS[i].wavelength && wavelength < SPECTRUM_COLORS[i + 1].wavelength) {
        return SPECTRUM_COLORS[i].color;
      }
    }
    return SPECTRUM_COLORS[SPECTRUM_COLORS.length - 1].color;
  }, []);

  // Find intersection with element
  const findIntersection = useCallback((
    x1: number, y1: number, x2: number, y2: number,
    element: OpticalElement
  ): { x: number; y: number; normal: number } | null => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Treat element as vertical surface for simplicity
    const elementX = element.x;
    const elementTop = element.y - element.height / 2;
    const elementBottom = element.y + element.height / 2;
    
    // Check if ray crosses element's x position
    if ((x1 < elementX && x2 > elementX) || (x1 > elementX && x2 < elementX)) {
      const t = (elementX - x1) / dx;
      const intersectY = y1 + t * dy;
      
      if (intersectY >= elementTop && intersectY <= elementBottom) {
        let normal = 0; // Normal angle in radians
        
        if (element.type === 'convex-lens' || element.type === 'concave-lens') {
          // Curved lens - normal depends on position
          const relativeY = (intersectY - element.y) / (element.height / 2);
          if (element.type === 'convex-lens') {
            normal = Math.atan(relativeY * 0.3);
          } else {
            normal = Math.atan(-relativeY * 0.3);
          }
        } else if (element.type.includes('mirror')) {
          if (element.type === 'concave-mirror') {
            const relativeY = (intersectY - element.y) / (element.height / 2);
            normal = Math.PI + Math.atan(relativeY * 0.3);
          } else if (element.type === 'convex-mirror') {
            const relativeY = (intersectY - element.y) / (element.height / 2);
            normal = Math.atan(-relativeY * 0.3);
          } else {
            normal = dx > 0 ? Math.PI : 0;
          }
        } else if (element.type === 'prism') {
          // Prism has angled surfaces
          const relativeY = intersectY - element.y;
          if (relativeY < 0) {
            normal = Math.PI / 6; // 30 degrees for top surface
          } else {
            normal = -Math.PI / 6; // -30 degrees for bottom surface
          }
        }
        
        return { x: elementX, y: intersectY, normal };
      }
    }
    
    return null;
  }, []);

  // Trace a single ray through the optical system
  const traceRay = useCallback((
    startX: number,
    startY: number,
    angleRad: number,
    wavelength: number,
    elements: OpticalElement[],
    maxBounces: number = 10
  ): RaySegment[] => {
    const segments: RaySegment[] = [];
    let currentX = startX;
    let currentY = startY;
    let currentAngle = angleRad;
    const color = wavelengthToColor(wavelength);
    
    for (let bounce = 0; bounce < maxBounces; bounce++) {
      // Calculate ray endpoint
      const rayLength = 1500;
      const endX = currentX + Math.cos(currentAngle) * rayLength;
      const endY = currentY + Math.sin(currentAngle) * rayLength;
      
      // Find closest intersection
      let closestIntersection: { x: number; y: number; normal: number; element: OpticalElement; distance: number } | null = null;
      
      for (const element of elements) {
        if (element.type === 'light-source') continue;
        
        const intersection = findIntersection(currentX, currentY, endX, endY, element);
        if (intersection) {
          const distance = Math.hypot(intersection.x - currentX, intersection.y - currentY);
          if (distance > 1 && (!closestIntersection || distance < closestIntersection.distance)) {
            closestIntersection = { ...intersection, element, distance };
          }
        }
      }
      
      if (closestIntersection) {
        // Add segment to intersection
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: closestIntersection.x,
          y2: closestIntersection.y,
          color
        });
        
        currentX = closestIntersection.x;
        currentY = closestIntersection.y;
        
        const element = closestIntersection.element;
        const incidentAngle = currentAngle - closestIntersection.normal;
        
        if (element.type.includes('mirror')) {
          // Reflection
          currentAngle = 2 * closestIntersection.normal - currentAngle + Math.PI;
        } else if (element.type.includes('lens')) {
          // Refraction through lens
          const n1 = 1.0; // Air
          const n2 = getCauchyRefractiveIndex(wavelength, element.refractiveIndex);
          const { angle, totalInternalReflection } = calculateRefraction(incidentAngle, n1, n2);
          
          if (totalInternalReflection) {
            currentAngle = 2 * closestIntersection.normal - currentAngle + Math.PI;
          } else {
            // Lens bending based on focal length
            const distanceFromAxis = closestIntersection.y - element.y;
            const bendAngle = (distanceFromAxis / element.focalLength) * 0.5;
            
            if (element.type === 'convex-lens') {
              currentAngle = currentAngle - bendAngle;
            } else {
              currentAngle = currentAngle + bendAngle;
            }
          }
        } else if (element.type === 'prism') {
          // Prism dispersion
          const n1 = 1.0;
          const n2 = getCauchyRefractiveIndex(wavelength, 1.52);
          const { angle } = calculateRefraction(incidentAngle, n1, n2);
          
          // Deviation depends on wavelength (dispersion)
          const deviation = (n2 - 1) * (Math.PI / 3); // 60 degree prism
          currentAngle = currentAngle + deviation * (wavelength / 550 - 1) * 2;
        }
      } else {
        // No intersection - ray continues to edge
        const finalX = Math.max(0, Math.min(endX, 1200));
        const finalY = Math.max(0, Math.min(endY, 600));
        
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: finalX,
          y2: finalY,
          color
        });
        break;
      }
    }
    
    return segments;
  }, [wavelengthToColor, findIntersection, calculateRefraction, getCauchyRefractiveIndex]);

  // Generate all rays from light sources
  const generateRays = useCallback(() => {
    const newRays: LightRay[] = [];
    const lightSources = state.elements.filter(e => e.type === 'light-source');
    
    lightSources.forEach(source => {
      if (state.showDispersion) {
        // Generate rainbow spectrum
        SPECTRUM_COLORS.forEach((spectrum, i) => {
          for (let j = 0; j < state.rayCount; j++) {
            const spreadAngle = (j - state.rayCount / 2) * 0.03;
            const baseAngle = Math.PI; // Point left
            const angle = baseAngle + spreadAngle;
            
            const segments = traceRay(
              source.x,
              source.y + (j - state.rayCount / 2) * 8,
              angle,
              spectrum.wavelength,
              state.elements
            );
            
            newRays.push({
              id: `ray-${source.id}-${i}-${j}`,
              segments,
              wavelength: spectrum.wavelength,
              color: spectrum.color,
              intensity: state.lightSourceIntensity
            });
          }
        });
      } else {
        // Single color rays
        for (let j = 0; j < state.rayCount; j++) {
          const spreadAngle = (j - state.rayCount / 2) * 0.03;
          const baseAngle = Math.PI;
          const angle = baseAngle + spreadAngle;
          
          const segments = traceRay(
            source.x,
            source.y + (j - state.rayCount / 2) * 10,
            angle,
            550,
            state.elements
          );
          
          newRays.push({
            id: `ray-${source.id}-${j}`,
            segments,
            wavelength: 550,
            color: '#FFD700',
            intensity: state.lightSourceIntensity
          });
        }
      }
    });
    
    setState(prev => ({ ...prev, rays: newRays }));
  }, [state.elements, state.rayCount, state.showDispersion, state.lightSourceIntensity, traceRay]);

  // Update rays when elements change
  useEffect(() => {
    generateRays();
  }, [state.elements, state.showDispersion, state.rayCount]);

  // Add element
  const addElement = useCallback((type: OpticalElement['type'], x: number, y: number) => {
    const defaults: Record<OpticalElement['type'], { width: number; height: number; focalLength: number; refractiveIndex: number }> = {
      'light-source': { width: 30, height: 30, focalLength: 0, refractiveIndex: 1 },
      'convex-lens': { width: 20, height: 120, focalLength: 150, refractiveIndex: 1.52 },
      'concave-lens': { width: 20, height: 120, focalLength: -150, refractiveIndex: 1.52 },
      'plane-mirror': { width: 10, height: 120, focalLength: Infinity, refractiveIndex: 1 },
      'convex-mirror': { width: 20, height: 120, focalLength: -100, refractiveIndex: 1 },
      'concave-mirror': { width: 20, height: 120, focalLength: 100, refractiveIndex: 1 },
      'prism': { width: 80, height: 80, focalLength: 0, refractiveIndex: 1.52 },
    };
    
    const newElement: OpticalElement = {
      id: `el-${Date.now()}`,
      type,
      x,
      y,
      rotation: 0,
      ...defaults[type]
    };
    
    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  }, []);

  // Remove element
  const removeElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.filter(e => e.id !== id),
      selectedElement: prev.selectedElement === id ? null : prev.selectedElement
    }));
  }, []);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<OpticalElement>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  // Select element
  const selectElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedElement: id }));
  }, []);

  // Move element (drag)
  const moveElement = useCallback((id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(e => e.id === id ? { ...e, x, y } : e)
    }));
  }, []);

  // Toggle grid
  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  // Toggle dispersion
  const toggleDispersion = useCallback(() => {
    setState(prev => ({ ...prev, showDispersion: !prev.showDispersion }));
  }, []);

  // Set ray count
  const setRayCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, rayCount: count }));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setState({
      elements: [],
      rays: [],
      selectedElement: null,
      isDragging: false,
      showGrid: true,
      showDispersion: true,
      rayCount: 7,
      lightSourceIntensity: 1,
    });
  }, []);

  // Load preset configuration
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
    
    setState(prev => ({
      ...prev,
      elements,
      rays: [],
      selectedElement: null
    }));
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
    SPECTRUM_COLORS
  };
};
