import { useState, useCallback, useMemo } from 'react';

export interface ProjectileState {
  // Projectile motion
  angle: number;
  initialVelocity: number;
  height: number;
  gravity: number;
  airResistance: number;
  projectilePosition: { x: number; y: number };
  projectileVelocity: { vx: number; vy: number };
  trajectory: { x: number; y: number; t: number }[];
  isLaunched: boolean;
  time: number;
  
  // Pendulum
  pendulumLength: number;
  pendulumAngle: number;
  pendulumAngularVelocity: number;
  pendulumMass: number;
  pendulumDamping: number;
  pendulumIsRunning: boolean;
  pendulumHistory: { angle: number; energy: number; t: number }[];
  
  // Free fall
  freeFallHeight: number;
  freeFallMass: number;
  freeFallDragCoeff: number;
  freeFallVelocity: number;
  freeFallPosition: number;
  freeFallIsRunning: boolean;
  freeFallHistory: { position: number; velocity: number; t: number }[];
  
  // Environment
  environment: 'earth' | 'moon' | 'mars' | 'jupiter' | 'vacuum';
}

const GRAVITY_VALUES = {
  earth: 9.81,
  moon: 1.62,
  mars: 3.71,
  jupiter: 24.79,
  vacuum: 9.81 // Same as Earth but no air
};

const AIR_DENSITY = {
  earth: 1.225,
  moon: 0,
  mars: 0.02,
  jupiter: 1.326,
  vacuum: 0
};

export const useProjectilePhysics = () => {
  const [state, setState] = useState<ProjectileState>({
    // Projectile
    angle: 45,
    initialVelocity: 50,
    height: 0,
    gravity: 9.81,
    airResistance: 0.1,
    projectilePosition: { x: 0, y: 0 },
    projectileVelocity: { vx: 0, vy: 0 },
    trajectory: [],
    isLaunched: false,
    time: 0,
    
    // Pendulum
    pendulumLength: 2,
    pendulumAngle: 30,
    pendulumAngularVelocity: 0,
    pendulumMass: 1,
    pendulumDamping: 0.01,
    pendulumIsRunning: false,
    pendulumHistory: [],
    
    // Free fall
    freeFallHeight: 100,
    freeFallMass: 1,
    freeFallDragCoeff: 0.47,
    freeFallVelocity: 0,
    freeFallPosition: 0,
    freeFallIsRunning: false,
    freeFallHistory: [],
    
    environment: 'earth'
  });

  // ============ PROJECTILE MOTION ============
  
  // Calculate initial velocity components
  const getInitialVelocityComponents = useCallback((angle: number, velocity: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      vx: velocity * Math.cos(angleRad),
      vy: velocity * Math.sin(angleRad)
    };
  }, []);

  // Calculate maximum height: H = (v₀² sin²θ) / (2g)
  const calculateMaxHeight = useCallback((velocity: number, angle: number, gravity: number, initialHeight: number): number => {
    const angleRad = (angle * Math.PI) / 180;
    const vy = velocity * Math.sin(angleRad);
    return initialHeight + (vy * vy) / (2 * gravity);
  }, []);

  // Calculate range: R = (v₀² sin2θ) / g
  const calculateRange = useCallback((velocity: number, angle: number, gravity: number, initialHeight: number): number => {
    const angleRad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(angleRad);
    const vy = velocity * Math.sin(angleRad);
    
    // Time of flight considering initial height
    const t = (vy + Math.sqrt(vy * vy + 2 * gravity * initialHeight)) / gravity;
    return vx * t;
  }, []);

  // Calculate time of flight
  const calculateTimeOfFlight = useCallback((velocity: number, angle: number, gravity: number, initialHeight: number): number => {
    const angleRad = (angle * Math.PI) / 180;
    const vy = velocity * Math.sin(angleRad);
    return (vy + Math.sqrt(vy * vy + 2 * gravity * initialHeight)) / gravity;
  }, []);

  // Update projectile position (with optional air resistance)
  const updateProjectile = useCallback((dt: number) => {
    setState(prev => {
      if (!prev.isLaunched) return prev;

      const { projectilePosition, projectileVelocity, gravity, airResistance, trajectory, time } = prev;
      
      // Calculate drag force
      const speed = Math.sqrt(projectileVelocity.vx ** 2 + projectileVelocity.vy ** 2);
      const dragX = airResistance * projectileVelocity.vx * speed;
      const dragY = airResistance * projectileVelocity.vy * speed;
      
      // Update velocity
      const newVx = projectileVelocity.vx - dragX * dt;
      const newVy = projectileVelocity.vy - gravity * dt - dragY * dt;
      
      // Update position
      const newX = projectilePosition.x + newVx * dt;
      const newY = projectilePosition.y + newVy * dt;
      const newTime = time + dt;
      
      // Check if projectile hit ground
      if (newY < 0) {
        return { ...prev, isLaunched: false };
      }
      
      return {
        ...prev,
        projectilePosition: { x: newX, y: newY },
        projectileVelocity: { vx: newVx, vy: newVy },
        trajectory: [...trajectory, { x: newX, y: newY, t: newTime }],
        time: newTime
      };
    });
  }, []);

  const launchProjectile = useCallback(() => {
    const { vx, vy } = getInitialVelocityComponents(state.angle, state.initialVelocity);
    setState(prev => ({
      ...prev,
      isLaunched: true,
      projectilePosition: { x: 0, y: prev.height },
      projectileVelocity: { vx, vy },
      trajectory: [{ x: 0, y: prev.height, t: 0 }],
      time: 0
    }));
  }, [state.angle, state.initialVelocity, state.height, getInitialVelocityComponents]);

  const resetProjectile = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLaunched: false,
      projectilePosition: { x: 0, y: prev.height },
      projectileVelocity: { vx: 0, vy: 0 },
      trajectory: [],
      time: 0
    }));
  }, []);

  // ============ PENDULUM ============

  // Pendulum period: T = 2π√(L/g)
  const calculatePendulumPeriod = useCallback((length: number, gravity: number): number => {
    return 2 * Math.PI * Math.sqrt(length / gravity);
  }, []);

  // Pendulum energy
  const calculatePendulumEnergy = useCallback((
    length: number,
    mass: number,
    angle: number,
    angularVelocity: number,
    gravity: number
  ): { kinetic: number; potential: number; total: number } => {
    const angleRad = (angle * Math.PI) / 180;
    const height = length * (1 - Math.cos(angleRad));
    const velocity = length * angularVelocity;
    
    const kinetic = 0.5 * mass * velocity * velocity;
    const potential = mass * gravity * height;
    
    return {
      kinetic,
      potential,
      total: kinetic + potential
    };
  }, []);

  // Update pendulum using angular acceleration: α = -(g/L)sin(θ)
  const updatePendulum = useCallback((dt: number) => {
    setState(prev => {
      if (!prev.pendulumIsRunning) return prev;

      const angleRad = (prev.pendulumAngle * Math.PI) / 180;
      const angularAcceleration = -(prev.gravity / prev.pendulumLength) * Math.sin(angleRad) 
                                   - prev.pendulumDamping * prev.pendulumAngularVelocity;
      
      const newAngularVelocity = prev.pendulumAngularVelocity + angularAcceleration * dt;
      const newAngle = prev.pendulumAngle + (newAngularVelocity * 180 / Math.PI) * dt;
      
      const energy = calculatePendulumEnergy(
        prev.pendulumLength,
        prev.pendulumMass,
        newAngle,
        newAngularVelocity,
        prev.gravity
      );
      
      const newHistory = [...prev.pendulumHistory, {
        angle: newAngle,
        energy: energy.total,
        t: prev.pendulumHistory.length * dt
      }].slice(-500); // Keep last 500 points
      
      return {
        ...prev,
        pendulumAngle: newAngle,
        pendulumAngularVelocity: newAngularVelocity,
        pendulumHistory: newHistory
      };
    });
  }, [calculatePendulumEnergy]);

  const startPendulum = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendulumIsRunning: true,
      pendulumAngularVelocity: 0,
      pendulumHistory: []
    }));
  }, []);

  const stopPendulum = useCallback(() => {
    setState(prev => ({ ...prev, pendulumIsRunning: false }));
  }, []);

  const resetPendulum = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendulumIsRunning: false,
      pendulumAngle: 30,
      pendulumAngularVelocity: 0,
      pendulumHistory: []
    }));
  }, []);

  // ============ FREE FALL ============

  // Terminal velocity: v_t = √(2mg / ρAC_d)
  const calculateTerminalVelocity = useCallback((
    mass: number,
    gravity: number,
    dragCoeff: number,
    airDensity: number,
    crossSectionArea: number = 0.1
  ): number => {
    if (airDensity === 0) return Infinity;
    return Math.sqrt((2 * mass * gravity) / (airDensity * crossSectionArea * dragCoeff));
  }, []);

  // Update free fall with air resistance
  const updateFreeFall = useCallback((dt: number) => {
    setState(prev => {
      if (!prev.freeFallIsRunning) return prev;
      if (prev.freeFallPosition >= prev.freeFallHeight) {
        return { ...prev, freeFallIsRunning: false };
      }

      const airDensity = AIR_DENSITY[prev.environment];
      const crossSectionArea = 0.1; // m²
      
      // Drag force: F_d = 0.5 * ρ * v² * C_d * A
      const dragForce = 0.5 * airDensity * prev.freeFallVelocity ** 2 * prev.freeFallDragCoeff * crossSectionArea;
      const dragAcceleration = dragForce / prev.freeFallMass;
      
      // Net acceleration
      const acceleration = prev.gravity - (prev.freeFallVelocity > 0 ? dragAcceleration : 0);
      
      const newVelocity = prev.freeFallVelocity + acceleration * dt;
      const newPosition = prev.freeFallPosition + newVelocity * dt;
      
      const newHistory = [...prev.freeFallHistory, {
        position: newPosition,
        velocity: newVelocity,
        t: prev.freeFallHistory.length * dt
      }].slice(-500);
      
      return {
        ...prev,
        freeFallVelocity: newVelocity,
        freeFallPosition: Math.min(newPosition, prev.freeFallHeight),
        freeFallHistory: newHistory
      };
    });
  }, []);

  const startFreeFall = useCallback(() => {
    setState(prev => ({
      ...prev,
      freeFallIsRunning: true,
      freeFallPosition: 0,
      freeFallVelocity: 0,
      freeFallHistory: []
    }));
  }, []);

  const stopFreeFall = useCallback(() => {
    setState(prev => ({ ...prev, freeFallIsRunning: false }));
  }, []);

  const resetFreeFall = useCallback(() => {
    setState(prev => ({
      ...prev,
      freeFallIsRunning: false,
      freeFallPosition: 0,
      freeFallVelocity: 0,
      freeFallHistory: []
    }));
  }, []);

  // ============ ENVIRONMENT ============

  const setEnvironment = useCallback((env: ProjectileState['environment']) => {
    setState(prev => ({
      ...prev,
      environment: env,
      gravity: GRAVITY_VALUES[env],
      airResistance: AIR_DENSITY[env] > 0 ? 0.1 : 0
    }));
  }, []);

  // ============ SETTERS ============

  const setAngle = useCallback((angle: number) => {
    setState(prev => ({ ...prev, angle }));
  }, []);

  const setInitialVelocity = useCallback((velocity: number) => {
    setState(prev => ({ ...prev, initialVelocity: velocity }));
  }, []);

  const setHeight = useCallback((height: number) => {
    setState(prev => ({ ...prev, height }));
  }, []);

  const setGravity = useCallback((gravity: number) => {
    setState(prev => ({ ...prev, gravity }));
  }, []);

  const setAirResistance = useCallback((resistance: number) => {
    setState(prev => ({ ...prev, airResistance: resistance }));
  }, []);

  const setPendulumLength = useCallback((length: number) => {
    setState(prev => ({ ...prev, pendulumLength: length }));
  }, []);

  const setPendulumAngle = useCallback((angle: number) => {
    setState(prev => ({ ...prev, pendulumAngle: angle }));
  }, []);

  const setPendulumMass = useCallback((mass: number) => {
    setState(prev => ({ ...prev, pendulumMass: mass }));
  }, []);

  const setPendulumDamping = useCallback((damping: number) => {
    setState(prev => ({ ...prev, pendulumDamping: damping }));
  }, []);

  const setFreeFallHeight = useCallback((height: number) => {
    setState(prev => ({ ...prev, freeFallHeight: height }));
  }, []);

  const setFreeFallMass = useCallback((mass: number) => {
    setState(prev => ({ ...prev, freeFallMass: mass }));
  }, []);

  const setFreeFallDragCoeff = useCallback((coeff: number) => {
    setState(prev => ({ ...prev, freeFallDragCoeff: coeff }));
  }, []);

  // ============ COMPUTED VALUES ============

  const projectileStats = useMemo(() => ({
    maxHeight: calculateMaxHeight(state.initialVelocity, state.angle, state.gravity, state.height),
    range: calculateRange(state.initialVelocity, state.angle, state.gravity, state.height),
    timeOfFlight: calculateTimeOfFlight(state.initialVelocity, state.angle, state.gravity, state.height),
    currentSpeed: Math.sqrt(state.projectileVelocity.vx ** 2 + state.projectileVelocity.vy ** 2)
  }), [state, calculateMaxHeight, calculateRange, calculateTimeOfFlight]);

  const pendulumStats = useMemo(() => {
    const energy = calculatePendulumEnergy(
      state.pendulumLength,
      state.pendulumMass,
      state.pendulumAngle,
      state.pendulumAngularVelocity,
      state.gravity
    );
    return {
      period: calculatePendulumPeriod(state.pendulumLength, state.gravity),
      frequency: 1 / calculatePendulumPeriod(state.pendulumLength, state.gravity),
      ...energy
    };
  }, [state, calculatePendulumPeriod, calculatePendulumEnergy]);

  const freeFallStats = useMemo(() => ({
    terminalVelocity: calculateTerminalVelocity(
      state.freeFallMass,
      state.gravity,
      state.freeFallDragCoeff,
      AIR_DENSITY[state.environment]
    ),
    currentVelocity: state.freeFallVelocity,
    distanceFallen: state.freeFallPosition,
    percentComplete: (state.freeFallPosition / state.freeFallHeight) * 100
  }), [state, calculateTerminalVelocity]);

  return {
    state,
    // Projectile
    launchProjectile,
    resetProjectile,
    updateProjectile,
    projectileStats,
    setAngle,
    setInitialVelocity,
    setHeight,
    setGravity,
    setAirResistance,
    // Pendulum
    startPendulum,
    stopPendulum,
    resetPendulum,
    updatePendulum,
    pendulumStats,
    setPendulumLength,
    setPendulumAngle,
    setPendulumMass,
    setPendulumDamping,
    // Free fall
    startFreeFall,
    stopFreeFall,
    resetFreeFall,
    updateFreeFall,
    freeFallStats,
    setFreeFallHeight,
    setFreeFallMass,
    setFreeFallDragCoeff,
    // Environment
    setEnvironment,
    GRAVITY_VALUES,
    AIR_DENSITY
  };
};
