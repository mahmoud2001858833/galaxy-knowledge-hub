import { useState, useCallback, useMemo } from 'react';

export interface GasParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
}

export interface CarnotCycleState {
  currentStep: 0 | 1 | 2 | 3;
  stepNames: string[];
  pressure: number;
  volume: number;
  temperature: number;
  entropy: number;
  isRunning: boolean;
  hotReservoirTemp: number;
  coldReservoirTemp: number;
  cycleHistory: { pressure: number; volume: number; step: number }[];
}

export interface HeatTransferState {
  mode: 'conduction' | 'convection' | 'radiation';
  temperatures: number[]; // Array of temperatures along the medium
  time: number;
  isRunning: boolean;
  conductivity: number;
  sourceTemp: number;
  ambientTemp: number;
}

export interface ThermodynamicsState {
  // Ideal Gas
  particles: GasParticle[];
  containerWidth: number;
  containerHeight: number;
  pressure: number;
  volume: number;
  temperature: number;
  moles: number;
  isSimulating: boolean;
  
  // Carnot Cycle
  carnot: CarnotCycleState;
  
  // Heat Transfer
  heatTransfer: HeatTransferState;
}

// Gas constant R = 8.314 J/(mol·K)
const R = 8.314;
// Boltzmann constant k = 1.380649 × 10^-23 J/K
const k = 1.380649e-23;

export const useThermodynamicsPhysics = () => {
  const [state, setState] = useState<ThermodynamicsState>({
    // Ideal Gas
    particles: [],
    containerWidth: 400,
    containerHeight: 300,
    pressure: 101325, // Pa (1 atm)
    volume: 0.001, // m³
    temperature: 300, // K
    moles: 0.04,
    isSimulating: false,
    
    // Carnot Cycle
    carnot: {
      currentStep: 0,
      stepNames: ['التمدد الإيزوثرمي', 'التمدد الأديباتي', 'الانضغاط الإيزوثرمي', 'الانضغاط الأديباتي'],
      pressure: 200000,
      volume: 0.001,
      temperature: 600,
      entropy: 0,
      isRunning: false,
      hotReservoirTemp: 600,
      coldReservoirTemp: 300,
      cycleHistory: []
    },
    
    // Heat Transfer
    heatTransfer: {
      mode: 'conduction',
      temperatures: Array(20).fill(20),
      time: 0,
      isRunning: false,
      conductivity: 200, // W/(m·K) for copper
      sourceTemp: 100,
      ambientTemp: 20
    }
  });

  // ============ IDEAL GAS LAW ============
  // PV = nRT

  const calculatePressure = useCallback((n: number, V: number, T: number): number => {
    return (n * R * T) / V;
  }, []);

  const calculateVolume = useCallback((n: number, P: number, T: number): number => {
    return (n * R * T) / P;
  }, []);

  const calculateTemperature = useCallback((P: number, V: number, n: number): number => {
    return (P * V) / (n * R);
  }, []);

  const calculateMoles = useCallback((P: number, V: number, T: number): number => {
    return (P * V) / (R * T);
  }, []);

  // Average kinetic energy: KE_avg = (3/2)kT
  const calculateAverageKE = useCallback((T: number): number => {
    return (3 / 2) * k * T;
  }, []);

  // RMS velocity: v_rms = √(3RT/M) where M is molar mass
  const calculateRMSVelocity = useCallback((T: number, molarMass: number = 0.028): number => {
    return Math.sqrt((3 * R * T) / molarMass);
  }, []);

  // Initialize particles
  const initializeParticles = useCallback((count: number, temperature: number) => {
    const { containerWidth, containerHeight } = state;
    const particles: GasParticle[] = [];
    const avgSpeed = Math.sqrt((3 * k * temperature) / (4.65e-26)); // Approximate for N2

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = avgSpeed * (0.5 + Math.random());
      
      particles.push({
        id: `particle-${i}`,
        x: 20 + Math.random() * (containerWidth - 40),
        y: 20 + Math.random() * (containerHeight - 40),
        vx: Math.cos(angle) * speed * 0.00001, // Scale for visualization
        vy: Math.sin(angle) * speed * 0.00001,
        mass: 4.65e-26, // N2 molecule mass
        radius: 5,
        color: `hsl(${200 + Math.random() * 60}, 70%, 50%)`
      });
    }

    setState(prev => ({ ...prev, particles }));
  }, [state.containerWidth, state.containerHeight]);

  // Update gas simulation
  const updateGasSimulation = useCallback((deltaTime: number) => {
    setState(prev => {
      if (!prev.isSimulating) return prev;

      const dt = deltaTime / 16; // Normalize to ~60fps
      const { containerWidth, containerHeight } = prev;

      const updatedParticles = prev.particles.map(p => {
        let newX = p.x + p.vx * dt;
        let newY = p.y + p.vy * dt;
        let newVx = p.vx;
        let newVy = p.vy;

        // Wall collisions
        if (newX <= p.radius || newX >= containerWidth - p.radius) {
          newVx = -newVx * 0.99; // Slight energy loss
          newX = Math.max(p.radius, Math.min(containerWidth - p.radius, newX));
        }
        if (newY <= p.radius || newY >= containerHeight - p.radius) {
          newVy = -newVy * 0.99;
          newY = Math.max(p.radius, Math.min(containerHeight - p.radius, newY));
        }

        return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
      });

      // Simple pressure calculation from wall collisions
      const wallHits = updatedParticles.filter(p => 
        p.x <= p.radius + 5 || p.x >= containerWidth - p.radius - 5 ||
        p.y <= p.radius + 5 || p.y >= containerHeight - p.radius - 5
      ).length;

      const pressureFactor = wallHits / updatedParticles.length;

      return {
        ...prev,
        particles: updatedParticles,
        pressure: prev.pressure * (1 + pressureFactor * 0.01)
      };
    });
  }, []);

  // Change temperature (affects particle velocities)
  const setGasTemperature = useCallback((T: number) => {
    const scaleFactor = Math.sqrt(T / state.temperature);
    
    setState(prev => ({
      ...prev,
      temperature: T,
      particles: prev.particles.map(p => ({
        ...p,
        vx: p.vx * scaleFactor,
        vy: p.vy * scaleFactor
      })),
      pressure: calculatePressure(prev.moles, prev.volume, T)
    }));
  }, [state.temperature, calculatePressure]);

  // Change volume (resize container)
  const setGasVolume = useCallback((V: number) => {
    const scaleFactor = Math.sqrt(V / state.volume);
    
    setState(prev => ({
      ...prev,
      volume: V,
      containerWidth: prev.containerWidth * scaleFactor,
      containerHeight: prev.containerHeight * scaleFactor,
      pressure: calculatePressure(prev.moles, V, prev.temperature)
    }));
  }, [state.volume, calculatePressure]);

  // ============ CARNOT CYCLE ============

  // Carnot efficiency: η = 1 - T_c/T_h
  const calculateCarnotEfficiency = useCallback((Th: number, Tc: number): number => {
    return 1 - (Tc / Th);
  }, []);

  // Work done in isothermal process: W = nRT ln(V2/V1)
  const calculateIsothermalWork = useCallback((n: number, T: number, V1: number, V2: number): number => {
    return n * R * T * Math.log(V2 / V1);
  }, []);

  // For adiabatic process: TV^(γ-1) = constant, where γ = Cp/Cv = 1.4 for diatomic gas
  const gamma = 1.4;

  const advanceCarnotCycle = useCallback(() => {
    setState(prev => {
      const { carnot } = prev;
      const nextStep = ((carnot.currentStep + 1) % 4) as 0 | 1 | 2 | 3;
      
      let newPressure = carnot.pressure;
      let newVolume = carnot.volume;
      let newTemperature = carnot.temperature;

      switch (nextStep) {
        case 0: // Isothermal expansion at T_h
          newTemperature = carnot.hotReservoirTemp;
          newVolume = carnot.volume * 1.5;
          newPressure = (prev.moles * R * newTemperature) / newVolume;
          break;
        case 1: // Adiabatic expansion
          newVolume = carnot.volume * 1.3;
          newTemperature = carnot.temperature * Math.pow(carnot.volume / newVolume, gamma - 1);
          newPressure = (prev.moles * R * newTemperature) / newVolume;
          break;
        case 2: // Isothermal compression at T_c
          newTemperature = carnot.coldReservoirTemp;
          newVolume = carnot.volume * 0.7;
          newPressure = (prev.moles * R * newTemperature) / newVolume;
          break;
        case 3: // Adiabatic compression
          newVolume = carnot.volume * 0.8;
          newTemperature = carnot.temperature * Math.pow(carnot.volume / newVolume, gamma - 1);
          newPressure = (prev.moles * R * newTemperature) / newVolume;
          break;
      }

      return {
        ...prev,
        carnot: {
          ...carnot,
          currentStep: nextStep,
          pressure: newPressure,
          volume: newVolume,
          temperature: newTemperature,
          cycleHistory: [...carnot.cycleHistory, { pressure: newPressure, volume: newVolume, step: nextStep }].slice(-100)
        }
      };
    });
  }, []);

  const startCarnotCycle = useCallback(() => {
    setState(prev => ({
      ...prev,
      carnot: { ...prev.carnot, isRunning: true }
    }));
  }, []);

  const stopCarnotCycle = useCallback(() => {
    setState(prev => ({
      ...prev,
      carnot: { ...prev.carnot, isRunning: false }
    }));
  }, []);

  const resetCarnotCycle = useCallback(() => {
    setState(prev => ({
      ...prev,
      carnot: {
        ...prev.carnot,
        currentStep: 0,
        pressure: 200000,
        volume: 0.001,
        temperature: prev.carnot.hotReservoirTemp,
        isRunning: false,
        cycleHistory: []
      }
    }));
  }, []);

  const setCarnotTemperatures = useCallback((hot: number, cold: number) => {
    setState(prev => ({
      ...prev,
      carnot: {
        ...prev.carnot,
        hotReservoirTemp: hot,
        coldReservoirTemp: cold
      }
    }));
  }, []);

  // ============ HEAT TRANSFER ============

  // Fourier's Law: q = -k * dT/dx
  const updateHeatTransfer = useCallback((deltaTime: number) => {
    setState(prev => {
      if (!prev.heatTransfer.isRunning) return prev;

      const { mode, temperatures, conductivity, sourceTemp, ambientTemp } = prev.heatTransfer;
      const dt = deltaTime / 1000; // Convert to seconds
      const dx = 0.01; // 1 cm segments
      const alpha = conductivity / (8900 * 385); // Thermal diffusivity for copper

      let newTemperatures = [...temperatures];

      switch (mode) {
        case 'conduction': {
          // 1D heat equation: dT/dt = α * d²T/dx²
          for (let i = 1; i < newTemperatures.length - 1; i++) {
            const d2T = (newTemperatures[i + 1] - 2 * newTemperatures[i] + newTemperatures[i - 1]) / (dx * dx);
            newTemperatures[i] += alpha * d2T * dt * 1000; // Scale for visualization
          }
          // Boundary conditions
          newTemperatures[0] = sourceTemp;
          newTemperatures[newTemperatures.length - 1] = ambientTemp;
          break;
        }
        case 'convection': {
          // Simplified convection with mixing
          const convectionRate = 0.1;
          for (let i = 1; i < newTemperatures.length - 1; i++) {
            const diff = (newTemperatures[i - 1] + newTemperatures[i + 1]) / 2 - newTemperatures[i];
            newTemperatures[i] += diff * convectionRate * dt * 100;
          }
          newTemperatures[0] = sourceTemp;
          break;
        }
        case 'radiation': {
          // Stefan-Boltzmann: P = εσAT⁴
          const sigma = 5.67e-8;
          for (let i = 0; i < newTemperatures.length; i++) {
            const T = newTemperatures[i] + 273.15; // Convert to Kelvin
            const T_ambient = ambientTemp + 273.15;
            const radiativeLoss = sigma * (Math.pow(T, 4) - Math.pow(T_ambient, 4)) * 0.0001;
            newTemperatures[i] -= radiativeLoss * dt * 10;
          }
          newTemperatures[0] = sourceTemp;
          break;
        }
      }

      return {
        ...prev,
        heatTransfer: {
          ...prev.heatTransfer,
          temperatures: newTemperatures,
          time: prev.heatTransfer.time + dt
        }
      };
    });
  }, []);

  const setHeatTransferMode = useCallback((mode: HeatTransferState['mode']) => {
    setState(prev => ({
      ...prev,
      heatTransfer: {
        ...prev.heatTransfer,
        mode,
        temperatures: Array(20).fill(prev.heatTransfer.ambientTemp),
        time: 0
      }
    }));
  }, []);

  const startHeatTransfer = useCallback(() => {
    setState(prev => ({
      ...prev,
      heatTransfer: { ...prev.heatTransfer, isRunning: true }
    }));
  }, []);

  const stopHeatTransfer = useCallback(() => {
    setState(prev => ({
      ...prev,
      heatTransfer: { ...prev.heatTransfer, isRunning: false }
    }));
  }, []);

  const resetHeatTransfer = useCallback(() => {
    setState(prev => ({
      ...prev,
      heatTransfer: {
        ...prev.heatTransfer,
        temperatures: Array(20).fill(prev.heatTransfer.ambientTemp),
        time: 0,
        isRunning: false
      }
    }));
  }, []);

  const setHeatTransferParams = useCallback((params: Partial<HeatTransferState>) => {
    setState(prev => ({
      ...prev,
      heatTransfer: { ...prev.heatTransfer, ...params }
    }));
  }, []);

  // Toggle gas simulation
  const toggleGasSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isSimulating: !prev.isSimulating }));
  }, []);

  // Computed values
  const gasStats = useMemo(() => ({
    averageKE: calculateAverageKE(state.temperature),
    rmsVelocity: calculateRMSVelocity(state.temperature),
    pressure: state.pressure,
    volume: state.volume,
    temperature: state.temperature,
    particleCount: state.particles.length
  }), [state, calculateAverageKE, calculateRMSVelocity]);

  const carnotStats = useMemo(() => ({
    efficiency: calculateCarnotEfficiency(state.carnot.hotReservoirTemp, state.carnot.coldReservoirTemp),
    currentStep: state.carnot.currentStep,
    stepName: state.carnot.stepNames[state.carnot.currentStep],
    workDone: state.carnot.cycleHistory.length > 1 
      ? state.carnot.cycleHistory.reduce((sum, point, i, arr) => {
          if (i === 0) return 0;
          return sum + (point.pressure + arr[i-1].pressure) / 2 * (point.volume - arr[i-1].volume);
        }, 0)
      : 0
  }), [state.carnot, calculateCarnotEfficiency]);

  return {
    state,
    gasStats,
    carnotStats,
    // Ideal Gas
    initializeParticles,
    updateGasSimulation,
    toggleGasSimulation,
    setGasTemperature,
    setGasVolume,
    calculatePressure,
    calculateVolume,
    calculateTemperature,
    calculateMoles,
    calculateAverageKE,
    calculateRMSVelocity,
    // Carnot
    advanceCarnotCycle,
    startCarnotCycle,
    stopCarnotCycle,
    resetCarnotCycle,
    setCarnotTemperatures,
    calculateCarnotEfficiency,
    // Heat Transfer
    updateHeatTransfer,
    setHeatTransferMode,
    startHeatTransfer,
    stopHeatTransfer,
    resetHeatTransfer,
    setHeatTransferParams
  };
};
