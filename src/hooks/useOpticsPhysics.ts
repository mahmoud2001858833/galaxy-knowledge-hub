import { useState, useCallback, useMemo } from 'react';

export interface OpticalElement {
  id: string;
  type: 'convex-lens' | 'concave-lens' | 'plane-mirror' | 'convex-mirror' | 'concave-mirror' | 'prism' | 'light-source';
  x: number;
  y: number;
  focalLength?: number;
  angle?: number;
  width?: number;
  height?: number;
}

export interface LightRay {
  id: string;
  startX: number;
  startY: number;
  angle: number;
  color: string;
  segments: { x1: number; y1: number; x2: number; y2: number }[];
}

export interface OpticsState {
  elements: OpticalElement[];
  rays: LightRay[];
  selectedElement: string | null;
  showGrid: boolean;
  wavelength: number;
  refractiveIndex: number;
}

const SPEED_OF_LIGHT = 299792458;
const REFRACTIVE_INDEX_AIR = 1.0003;
const REFRACTIVE_INDEX_GLASS = 1.52;
const REFRACTIVE_INDEX_WATER = 1.33;

export const useOpticsPhysics = () => {
  const [state, setState] = useState<OpticsState>({
    elements: [],
    rays: [],
    selectedElement: null,
    showGrid: true,
    wavelength: 550,
    refractiveIndex: REFRACTIVE_INDEX_GLASS
  });

  // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
  const calculateRefraction = useCallback((
    incidentAngle: number,
    n1: number,
    n2: number
  ): { refractedAngle: number; totalInternalReflection: boolean } => {
    const sinIncident = Math.sin(incidentAngle);
    const sinRefracted = (n1 / n2) * sinIncident;
    
    if (Math.abs(sinRefracted) > 1) {
      return { refractedAngle: incidentAngle, totalInternalReflection: true };
    }
    
    return { 
      refractedAngle: Math.asin(sinRefracted), 
      totalInternalReflection: false 
    };
  }, []);

  // Mirror reflection: angle of incidence = angle of reflection
  const calculateReflection = useCallback((incidentAngle: number): number => {
    return -incidentAngle;
  }, []);

  // Lens equation: 1/f = 1/do + 1/di
  const calculateLensImage = useCallback((
    objectDistance: number,
    focalLength: number
  ): { imageDistance: number; magnification: number; isReal: boolean; isInverted: boolean } => {
    if (objectDistance === focalLength) {
      return { imageDistance: Infinity, magnification: Infinity, isReal: false, isInverted: false };
    }
    
    const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
    const magnification = -imageDistance / objectDistance;
    
    return {
      imageDistance,
      magnification: Math.abs(magnification),
      isReal: imageDistance > 0,
      isInverted: magnification < 0
    };
  }, []);

  // Curved mirror equation: 1/f = 1/do + 1/di, f = R/2
  const calculateMirrorImage = useCallback((
    objectDistance: number,
    radius: number,
    isConcave: boolean
  ): { imageDistance: number; magnification: number; isReal: boolean; isInverted: boolean } => {
    const focalLength = isConcave ? radius / 2 : -radius / 2;
    return calculateLensImage(objectDistance, focalLength);
  }, [calculateLensImage]);

  // Prism dispersion - different wavelengths refract differently
  const calculatePrismDispersion = useCallback((
    wavelength: number,
    prismAngle: number = 60
  ): { deviation: number; color: string } => {
    // Cauchy's equation approximation for glass
    const A = 1.5046;
    const B = 0.00420;
    const wavelengthMicrons = wavelength / 1000;
    const n = A + B / (wavelengthMicrons * wavelengthMicrons);
    
    // Minimum deviation formula
    const deviation = 2 * Math.asin(n * Math.sin((prismAngle * Math.PI / 180) / 2)) - prismAngle * Math.PI / 180;
    
    // Wavelength to color
    let color = '#ffffff';
    if (wavelength < 450) color = '#8B00FF'; // Violet
    else if (wavelength < 495) color = '#0000FF'; // Blue
    else if (wavelength < 570) color = '#00FF00'; // Green
    else if (wavelength < 590) color = '#FFFF00'; // Yellow
    else if (wavelength < 620) color = '#FF7F00'; // Orange
    else color = '#FF0000'; // Red
    
    return { deviation: deviation * 180 / Math.PI, color };
  }, []);

  // Trace ray through optical system
  const traceRay = useCallback((
    startX: number,
    startY: number,
    angle: number,
    elements: OpticalElement[],
    wavelength: number
  ): LightRay => {
    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    let currentX = startX;
    let currentY = startY;
    let currentAngle = angle;
    const maxSegments = 10;
    const maxDistance = 1000;

    for (let i = 0; i < maxSegments; i++) {
      const endX = currentX + Math.cos(currentAngle * Math.PI / 180) * maxDistance;
      const endY = currentY + Math.sin(currentAngle * Math.PI / 180) * maxDistance;
      
      let closestIntersection: { x: number; y: number; element: OpticalElement; distance: number } | null = null;
      
      // Find closest intersection with any element
      for (const element of elements) {
        if (element.type === 'light-source') continue;
        
        const intersection = findIntersection(currentX, currentY, endX, endY, element);
        if (intersection) {
          const distance = Math.hypot(intersection.x - currentX, intersection.y - currentY);
          if (distance > 0.1 && (!closestIntersection || distance < closestIntersection.distance)) {
            closestIntersection = { ...intersection, element, distance };
          }
        }
      }
      
      if (closestIntersection) {
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: closestIntersection.x,
          y2: closestIntersection.y
        });
        
        // Calculate new angle based on element type
        currentX = closestIntersection.x;
        currentY = closestIntersection.y;
        
        const element = closestIntersection.element;
        if (element.type.includes('mirror')) {
          currentAngle = 180 - currentAngle;
        } else if (element.type.includes('lens')) {
          // Simplified lens refraction
          const focalLength = element.focalLength || 100;
          const distanceFromCenter = currentY - element.y;
          currentAngle = currentAngle - (distanceFromCenter / focalLength) * 10;
        } else if (element.type === 'prism') {
          const { deviation } = calculatePrismDispersion(wavelength);
          currentAngle += deviation;
        }
      } else {
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: Math.min(Math.max(endX, 0), maxDistance),
          y2: Math.min(Math.max(endY, -500), 500)
        });
        break;
      }
    }

    const { color } = calculatePrismDispersion(wavelength);
    return {
      id: `ray-${Date.now()}-${Math.random()}`,
      startX,
      startY,
      angle,
      color,
      segments
    };
  }, [calculatePrismDispersion]);

  const findIntersection = (
    x1: number, y1: number, x2: number, y2: number,
    element: OpticalElement
  ): { x: number; y: number } | null => {
    const elementWidth = element.width || 20;
    const elementHeight = element.height || 100;
    
    // Simplified: treat as vertical line for lenses/mirrors
    if (x1 < element.x && x2 >= element.x) {
      const t = (element.x - x1) / (x2 - x1);
      const y = y1 + t * (y2 - y1);
      if (y >= element.y - elementHeight / 2 && y <= element.y + elementHeight / 2) {
        return { x: element.x, y };
      }
    }
    return null;
  };

  const addElement = useCallback((element: Omit<OpticalElement, 'id'>) => {
    const newElement: OpticalElement = {
      ...element,
      id: `element-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  }, []);

  const removeElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.filter(e => e.id !== id),
      selectedElement: prev.selectedElement === id ? null : prev.selectedElement
    }));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<OpticalElement>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedElement: id }));
  }, []);

  const setWavelength = useCallback((wavelength: number) => {
    setState(prev => ({ ...prev, wavelength }));
  }, []);

  const setRefractiveIndex = useCallback((refractiveIndex: number) => {
    setState(prev => ({ ...prev, refractiveIndex }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const updateRays = useCallback(() => {
    const lightSources = state.elements.filter(e => e.type === 'light-source');
    const newRays: LightRay[] = [];
    
    lightSources.forEach(source => {
      // Create multiple rays at different angles for each source
      for (let angleOffset = -15; angleOffset <= 15; angleOffset += 5) {
        const ray = traceRay(
          source.x,
          source.y,
          (source.angle || 0) + angleOffset,
          state.elements,
          state.wavelength
        );
        newRays.push(ray);
      }
    });
    
    setState(prev => ({ ...prev, rays: newRays }));
  }, [state.elements, state.wavelength, traceRay]);

  const clearAll = useCallback(() => {
    setState({
      elements: [],
      rays: [],
      selectedElement: null,
      showGrid: true,
      wavelength: 550,
      refractiveIndex: REFRACTIVE_INDEX_GLASS
    });
  }, []);

  // Calculated values
  const calculations = useMemo(() => {
    const selectedEl = state.elements.find(e => e.id === state.selectedElement);
    if (!selectedEl) return null;

    if (selectedEl.type === 'convex-lens' || selectedEl.type === 'concave-lens') {
      const focalLength = selectedEl.focalLength || 100;
      return {
        focalLength,
        power: 1 / (focalLength / 1000), // in diopters
        type: selectedEl.type === 'convex-lens' ? 'عدسة محدبة (مجمعة)' : 'عدسة مقعرة (مفرقة)'
      };
    }

    return null;
  }, [state.elements, state.selectedElement]);

  return {
    state,
    calculations,
    addElement,
    removeElement,
    updateElement,
    selectElement,
    setWavelength,
    setRefractiveIndex,
    toggleGrid,
    updateRays,
    clearAll,
    calculateRefraction,
    calculateReflection,
    calculateLensImage,
    calculateMirrorImage,
    calculatePrismDispersion
  };
};
