import { useState, useCallback, useMemo } from 'react';

export interface CelestialBody {
  id: string;
  name: string;
  nameAr: string;
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon' | 'asteroid';
  mass: number; // kg
  radius: number; // km
  orbitalRadius: number; // AU (Astronomical Units)
  orbitalPeriod: number; // Earth days
  rotationPeriod: number; // Earth hours
  eccentricity: number;
  inclination: number; // degrees
  axialTilt: number; // degrees
  surfaceTemperature: number; // K
  moons: number;
  hasRings: boolean;
  color: string;
  texture?: string;
  description: string;
  facts: string[];
  currentAngle: number; // Current orbital position in radians
  currentRotation: number; // Current rotation angle
}

export interface SolarSystemState {
  bodies: CelestialBody[];
  selectedBody: string | null;
  timeScale: number; // Days per second
  isPaused: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showGrid: boolean;
  cameraTarget: string;
  viewMode: '3d' | 'top' | 'side';
  distanceScale: number;
  sizeScale: number;
  elapsedDays: number;
}

// Astronomical constants
const AU_TO_KM = 149597870.7;
const G = 6.67430e-11; // Gravitational constant

// Solar System data
const SOLAR_SYSTEM_DATA: Omit<CelestialBody, 'currentAngle' | 'currentRotation'>[] = [
  {
    id: 'sun',
    name: 'Sun',
    nameAr: 'الشمس',
    type: 'star',
    mass: 1.989e30,
    radius: 696340,
    orbitalRadius: 0,
    orbitalPeriod: 0,
    rotationPeriod: 609.12,
    eccentricity: 0,
    inclination: 0,
    axialTilt: 7.25,
    surfaceTemperature: 5778,
    moons: 0,
    hasRings: false,
    color: '#FDB813',
    description: 'الشمس هي النجم المركزي في نظامنا الشمسي، وهي كرة ضخمة من الغاز الساخن تحتوي على 99.86% من كتلة النظام الشمسي.',
    facts: [
      'عمر الشمس حوالي 4.6 مليار سنة',
      'يمكن أن تتسع الشمس لمليون كرة أرضية',
      'الضوء من الشمس يستغرق 8 دقائق للوصول إلينا',
      'درجة حرارة نواة الشمس تصل إلى 15 مليون درجة مئوية'
    ]
  },
  {
    id: 'mercury',
    name: 'Mercury',
    nameAr: 'عطارد',
    type: 'planet',
    mass: 3.301e23,
    radius: 2439.7,
    orbitalRadius: 0.387,
    orbitalPeriod: 87.97,
    rotationPeriod: 1407.6,
    eccentricity: 0.2056,
    inclination: 7.0,
    axialTilt: 0.034,
    surfaceTemperature: 440,
    moons: 0,
    hasRings: false,
    color: '#B7B8B9',
    description: 'عطارد هو أصغر كوكب في النظام الشمسي وأقربه إلى الشمس. سطحه مليء بالفوهات.',
    facts: [
      'اليوم على عطارد أطول من سنته',
      'لا يوجد له غلاف جوي حقيقي',
      'تتراوح درجة حرارته بين -180 و 430 درجة مئوية',
      'أسرع كوكب في مداره حول الشمس'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    nameAr: 'الزهرة',
    type: 'planet',
    mass: 4.867e24,
    radius: 6051.8,
    orbitalRadius: 0.723,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832.5, // Negative = retrograde rotation
    eccentricity: 0.0068,
    inclination: 3.39,
    axialTilt: 177.4,
    surfaceTemperature: 737,
    moons: 0,
    hasRings: false,
    color: '#E6E6AA',
    description: 'الزهرة هي توأم الأرض في الحجم لكنها أشد الكواكب حرارة بسبب غلافها الجوي الكثيف.',
    facts: [
      'يدور عكس اتجاه دوران معظم الكواكب',
      'أسخن كوكب في المجموعة الشمسية',
      'غلافه الجوي 96% ثاني أكسيد الكربون',
      'يُسمى نجمة الصباح أو المساء'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    nameAr: 'الأرض',
    type: 'planet',
    mass: 5.972e24,
    radius: 6371,
    orbitalRadius: 1.0,
    orbitalPeriod: 365.25,
    rotationPeriod: 23.93,
    eccentricity: 0.0167,
    inclination: 0,
    axialTilt: 23.44,
    surfaceTemperature: 288,
    moons: 1,
    hasRings: false,
    color: '#6B93D6',
    description: 'الأرض هي الكوكب الوحيد المعروف الذي يحتضن الحياة، بفضل وجود الماء السائل والغلاف الجوي.',
    facts: [
      'الكوكب الوحيد الذي لا يحمل اسم إله',
      '71% من سطحه مغطى بالماء',
      'أكثر الكواكب الصخرية كثافة',
      'محمي بحقل مغناطيسي قوي'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    nameAr: 'المريخ',
    type: 'planet',
    mass: 6.39e23,
    radius: 3389.5,
    orbitalRadius: 1.524,
    orbitalPeriod: 687,
    rotationPeriod: 24.62,
    eccentricity: 0.0934,
    inclination: 1.85,
    axialTilt: 25.19,
    surfaceTemperature: 210,
    moons: 2,
    hasRings: false,
    color: '#C1440E',
    description: 'المريخ هو الكوكب الأحمر، ويُعتبر الهدف الأول لاستكشاف الإنسان خارج الأرض.',
    facts: [
      'يحتوي على أعلى جبل في المجموعة الشمسية (أوليمبوس مونس)',
      'لديه قمران صغيران: فوبوس وديموس',
      'يوجد ماء متجمد على قطبيه',
      'جاذبيته 38% من جاذبية الأرض'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    nameAr: 'المشتري',
    type: 'planet',
    mass: 1.898e27,
    radius: 69911,
    orbitalRadius: 5.203,
    orbitalPeriod: 4333,
    rotationPeriod: 9.93,
    eccentricity: 0.0489,
    inclination: 1.31,
    axialTilt: 3.13,
    surfaceTemperature: 165,
    moons: 95,
    hasRings: true,
    color: '#D8CA9D',
    description: 'المشتري هو أكبر كوكب في المجموعة الشمسية، وهو عملاق غازي ضخم.',
    facts: [
      'البقعة الحمراء الكبرى عاصفة مستمرة منذ 400 سنة',
      'يمتلك أقوى حقل مغناطيسي بين الكواكب',
      'كتلته ضعف كتلة جميع الكواكب الأخرى مجتمعة',
      'له 95 قمراً معروفاً'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    nameAr: 'زحل',
    type: 'planet',
    mass: 5.683e26,
    radius: 58232,
    orbitalRadius: 9.537,
    orbitalPeriod: 10759,
    rotationPeriod: 10.66,
    eccentricity: 0.0565,
    inclination: 2.49,
    axialTilt: 26.73,
    surfaceTemperature: 134,
    moons: 146,
    hasRings: true,
    color: '#F4D59E',
    description: 'زحل مشهور بحلقاته الجميلة المكونة من الجليد والصخور، وهو ثاني أكبر كوكب.',
    facts: [
      'حلقاته تمتد لمئات الآلاف من الكيلومترات',
      'كثافته أقل من الماء (سيطفو لو وُضع في ماء)',
      'له 146 قمراً معروفاً',
      'قمره تيتان له غلاف جوي كثيف'
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    nameAr: 'أورانوس',
    type: 'planet',
    mass: 8.681e25,
    radius: 25362,
    orbitalRadius: 19.19,
    orbitalPeriod: 30687,
    rotationPeriod: -17.24,
    eccentricity: 0.0472,
    inclination: 0.77,
    axialTilt: 97.77,
    surfaceTemperature: 76,
    moons: 28,
    hasRings: true,
    color: '#D1E7E7',
    description: 'أورانوس يدور على جانبه، مما يجعله فريداً بين الكواكب. لونه الأزرق ناتج عن الميثان.',
    facts: [
      'يدور على جانبه بميل 98 درجة',
      'أبرد غلاف جوي في المجموعة الشمسية',
      'اكتُشف عام 1781 بواسطة ويليام هيرشل',
      'يحتاج 84 سنة أرضية لإكمال دورة حول الشمس'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    nameAr: 'نبتون',
    type: 'planet',
    mass: 1.024e26,
    radius: 24622,
    orbitalRadius: 30.07,
    orbitalPeriod: 60190,
    rotationPeriod: 16.11,
    eccentricity: 0.0086,
    inclination: 1.77,
    axialTilt: 28.32,
    surfaceTemperature: 72,
    moons: 16,
    hasRings: true,
    color: '#5B5DDF',
    description: 'نبتون هو أبعد الكواكب عن الشمس، ويتميز برياح أسرع من أي كوكب آخر.',
    facts: [
      'أسرع رياح في المجموعة الشمسية (2100 كم/ساعة)',
      'اكتُشف عام 1846 بالحسابات الرياضية',
      'سنته تعادل 165 سنة أرضية',
      'له 16 قمراً معروفاً'
    ]
  },
  {
    id: 'pluto',
    name: 'Pluto',
    nameAr: 'بلوتو',
    type: 'dwarf-planet',
    mass: 1.303e22,
    radius: 1188.3,
    orbitalRadius: 39.48,
    orbitalPeriod: 90560,
    rotationPeriod: 153.3,
    eccentricity: 0.2488,
    inclination: 17.16,
    axialTilt: 122.53,
    surfaceTemperature: 44,
    moons: 5,
    hasRings: false,
    color: '#D4B8A0',
    description: 'بلوتو كان يُعتبر الكوكب التاسع حتى 2006، والآن يُصنف ككوكب قزم.',
    facts: [
      'أُعيد تصنيفه ككوكب قزم عام 2006',
      'سنته تعادل 248 سنة أرضية',
      'له خمسة أقمار معروفة',
      'زارته مركبة نيو هورايزونز عام 2015'
    ]
  }
];

export const useSolarSystemPhysics = () => {
  const [state, setState] = useState<SolarSystemState>({
    bodies: SOLAR_SYSTEM_DATA.map(body => ({
      ...body,
      currentAngle: Math.random() * 2 * Math.PI,
      currentRotation: 0
    })),
    selectedBody: null,
    timeScale: 1,
    isPaused: true,
    showOrbits: true,
    showLabels: true,
    showGrid: false,
    cameraTarget: 'sun',
    viewMode: '3d',
    distanceScale: 1,
    sizeScale: 1,
    elapsedDays: 0
  });

  // Kepler's Third Law: T² ∝ a³
  const calculateOrbitalPeriod = useCallback((semiMajorAxis: number, centralMass: number = 1.989e30): number => {
    const a = semiMajorAxis * AU_TO_KM * 1000; // Convert to meters
    return 2 * Math.PI * Math.sqrt((a ** 3) / (G * centralMass)) / 86400; // Return in days
  }, []);

  // Calculate orbital velocity: v = √(GM/r)
  const calculateOrbitalVelocity = useCallback((distance: number, centralMass: number = 1.989e30): number => {
    const r = distance * AU_TO_KM * 1000; // Convert to meters
    return Math.sqrt(G * centralMass / r) / 1000; // Return in km/s
  }, []);

  // Calculate escape velocity: v_e = √(2GM/r)
  const calculateEscapeVelocity = useCallback((mass: number, radius: number): number => {
    const r = radius * 1000; // Convert to meters
    return Math.sqrt(2 * G * mass / r) / 1000; // Return in km/s
  }, []);

  // Calculate surface gravity: g = GM/r²
  const calculateSurfaceGravity = useCallback((mass: number, radius: number): number => {
    const r = radius * 1000; // Convert to meters
    return G * mass / (r ** 2);
  }, []);

  // Update positions based on orbital mechanics
  const updatePositions = useCallback((deltaTime: number) => {
    setState(prev => {
      if (prev.isPaused) return prev;

      const daysPassed = deltaTime * prev.timeScale / 1000;
      
      const updatedBodies = prev.bodies.map(body => {
        if (body.type === 'star') return body;

        // Angular velocity (radians per day)
        const angularVelocity = body.orbitalPeriod > 0 
          ? (2 * Math.PI) / body.orbitalPeriod 
          : 0;
        
        // Update orbital angle
        const newAngle = body.currentAngle + angularVelocity * daysPassed;
        
        // Rotation (radians per day)
        const rotationVelocity = body.rotationPeriod !== 0 
          ? (2 * Math.PI * 24) / Math.abs(body.rotationPeriod)
          : 0;
        const newRotation = body.currentRotation + rotationVelocity * daysPassed;
        
        return {
          ...body,
          currentAngle: newAngle % (2 * Math.PI),
          currentRotation: newRotation % (2 * Math.PI)
        };
      });

      return {
        ...prev,
        bodies: updatedBodies,
        elapsedDays: prev.elapsedDays + daysPassed
      };
    });
  }, []);

  // Get body position in 3D space (considering elliptical orbit)
  const getBodyPosition = useCallback((body: CelestialBody, scale: number = 1): { x: number; y: number; z: number } => {
    if (body.type === 'star') return { x: 0, y: 0, z: 0 };

    const a = body.orbitalRadius * scale; // Semi-major axis
    const e = body.eccentricity; // Eccentricity
    const angle = body.currentAngle;
    const inclination = (body.inclination * Math.PI) / 180;

    // Distance from focus (Sun) using polar equation of ellipse
    const r = a * (1 - e * e) / (1 + e * Math.cos(angle));

    // Position in orbital plane
    const x = r * Math.cos(angle);
    const yPlane = r * Math.sin(angle);

    // Apply inclination
    const y = yPlane * Math.cos(inclination);
    const z = yPlane * Math.sin(inclination);

    return { x, y, z };
  }, []);

  // Control functions
  const selectBody = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedBody: id }));
  }, []);

  const setTimeScale = useCallback((scale: number) => {
    setState(prev => ({ ...prev, timeScale: scale }));
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const toggleOrbits = useCallback(() => {
    setState(prev => ({ ...prev, showOrbits: !prev.showOrbits }));
  }, []);

  const toggleLabels = useCallback(() => {
    setState(prev => ({ ...prev, showLabels: !prev.showLabels }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const setCameraTarget = useCallback((target: string) => {
    setState(prev => ({ ...prev, cameraTarget: target }));
  }, []);

  const setViewMode = useCallback((mode: '3d' | 'top' | 'side') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setDistanceScale = useCallback((scale: number) => {
    setState(prev => ({ ...prev, distanceScale: scale }));
  }, []);

  const setSizeScale = useCallback((scale: number) => {
    setState(prev => ({ ...prev, sizeScale: scale }));
  }, []);

  const resetSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      bodies: SOLAR_SYSTEM_DATA.map(body => ({
        ...body,
        currentAngle: Math.random() * 2 * Math.PI,
        currentRotation: 0
      })),
      elapsedDays: 0,
      isPaused: true
    }));
  }, []);

  // Computed values for selected body
  const selectedBodyInfo = useMemo(() => {
    if (!state.selectedBody) return null;
    
    const body = state.bodies.find(b => b.id === state.selectedBody);
    if (!body) return null;

    return {
      ...body,
      orbitalVelocity: body.orbitalRadius > 0 
        ? calculateOrbitalVelocity(body.orbitalRadius) 
        : 0,
      escapeVelocity: calculateEscapeVelocity(body.mass, body.radius),
      surfaceGravity: calculateSurfaceGravity(body.mass, body.radius),
      position: getBodyPosition(body, state.distanceScale)
    };
  }, [state.selectedBody, state.bodies, state.distanceScale, calculateOrbitalVelocity, calculateEscapeVelocity, calculateSurfaceGravity, getBodyPosition]);

  // Compare two bodies
  const compareBodies = useCallback((id1: string, id2: string) => {
    const body1 = state.bodies.find(b => b.id === id1);
    const body2 = state.bodies.find(b => b.id === id2);
    
    if (!body1 || !body2) return null;

    return {
      massRatio: body1.mass / body2.mass,
      radiusRatio: body1.radius / body2.radius,
      distanceRatio: body1.orbitalRadius / (body2.orbitalRadius || 1),
      periodRatio: body1.orbitalPeriod / (body2.orbitalPeriod || 1),
      tempDiff: body1.surfaceTemperature - body2.surfaceTemperature
    };
  }, [state.bodies]);

  return {
    state,
    selectedBodyInfo,
    updatePositions,
    getBodyPosition,
    selectBody,
    setTimeScale,
    togglePause,
    toggleOrbits,
    toggleLabels,
    toggleGrid,
    setCameraTarget,
    setViewMode,
    setDistanceScale,
    setSizeScale,
    resetSimulation,
    compareBodies,
    calculateOrbitalPeriod,
    calculateOrbitalVelocity,
    calculateEscapeVelocity,
    calculateSurfaceGravity
  };
};
