import { useState, useCallback, useEffect } from 'react';

export interface SimulationState {
  beamEnergy: number;
  beamSpeed: number;
  particleType: 'proton' | 'lead-ion';
  particleCount: number;
  beamsLaunched: boolean;
  collisionActive: boolean;
  temperature: number;
  magnetStrength: number;
  luminosity: number;
}

export interface RealTimeData {
  instantEnergy: string;
  speedRatio: string;
  particleCount: string;
  collisionRate: string;
  higgsEventProbability: string;
  cryogenicsTemp: string;
  magnetStrength: string;
  luminosity: string;
}

export interface ExperimentLog {
  id: string;
  timestamp: Date;
  energy: number;
  particleType: string;
  resultingParticles: number;
  rareEventDetected: boolean;
  scenario?: string;
}

export const useLHCSimulation = () => {
  const [state, setState] = useState<SimulationState>({
    beamEnergy: 450,
    beamSpeed: 0.7,
    particleType: 'proton',
    particleCount: 100,
    beamsLaunched: false,
    collisionActive: false,
    temperature: -271.3,
    magnetStrength: 8.3,
    luminosity: 2
  });

  const [experimentLog, setExperimentLog] = useState<ExperimentLog[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    instantEnergy: '0.45 TeV',
    speedRatio: '70.0% c',
    particleCount: '1.0×10¹¹',
    collisionRate: '0',
    higgsEventProbability: '0%',
    cryogenicsTemp: '-271.3°C',
    magnetStrength: '8.3 T',
    luminosity: '2.0×10³⁴ cm⁻²s⁻¹'
  });

  const updateRealTimeData = useCallback(() => {
    const energyTeV = state.beamEnergy / 1000;
    const speedPercent = (state.beamSpeed * 100).toFixed(7);
    const particleCountScientific = (state.particleCount * 1e9).toExponential(1);
    
    const collisionRate = state.collisionActive 
      ? `${Math.floor(Math.random() * 10 + 35)} مليون/ث`
      : '0';
    
    const higgsProb = state.beamEnergy >= 10000 
      ? '0.00000001%' 
      : '0%';

    setRealTimeData({
      instantEnergy: `${energyTeV.toFixed(2)} TeV`,
      speedRatio: `${speedPercent}% c`,
      particleCount: `${particleCountScientific} جسيم/حزمة`,
      collisionRate,
      higgsEventProbability: higgsProb,
      cryogenicsTemp: `${state.temperature.toFixed(1)}°C`,
      magnetStrength: `${state.magnetStrength.toFixed(1)} T`,
      luminosity: `${state.luminosity.toFixed(1)}×10³⁴ cm⁻²s⁻¹`
    });
  }, [state]);

  useEffect(() => {
    updateRealTimeData();
  }, [state, updateRealTimeData]);

  const setBeamEnergy = useCallback((energy: number) => {
    setState(prev => ({ ...prev, beamEnergy: energy }));
  }, []);

  const setBeamSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, beamSpeed: speed }));
  }, []);

  const setParticleType = useCallback((type: 'proton' | 'lead-ion') => {
    setState(prev => ({ ...prev, particleType: type }));
  }, []);

  const setParticleCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, particleCount: count }));
  }, []);

  const launchBeams = useCallback(() => {
    setState(prev => ({ ...prev, beamsLaunched: true }));
  }, []);

  const stopBeams = useCallback(() => {
    setState(prev => ({ ...prev, beamsLaunched: false, collisionActive: false }));
  }, []);

  const activateCollision = useCallback(() => {
    if (state.beamsLaunched) {
      setState(prev => ({ ...prev, collisionActive: true }));
    }
  }, [state.beamsLaunched]);

  const stopCollision = useCallback(() => {
    setState(prev => ({ ...prev, collisionActive: false }));
  }, []);

  const logExperiment = useCallback((
    resultingParticles: number, 
    rareEventDetected: boolean,
    scenario?: string
  ) => {
    const newLog: ExperimentLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      energy: state.beamEnergy,
      particleType: state.particleType,
      resultingParticles,
      rareEventDetected,
      scenario
    };

    setExperimentLog(prev => [newLog, ...prev].slice(0, 10));
  }, [state.beamEnergy, state.particleType]);

  const loadScenario = useCallback((scenario: {
    beamEnergy: number;
    beamSpeed: number;
    particleType: 'proton' | 'lead-ion';
    particleCount: number;
  }) => {
    setState(prev => ({
      ...prev,
      ...scenario,
      beamsLaunched: false,
      collisionActive: false
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      beamEnergy: 450,
      beamSpeed: 0.7,
      particleType: 'proton',
      particleCount: 100,
      beamsLaunched: false,
      collisionActive: false,
      temperature: -271.3,
      magnetStrength: 8.3,
      luminosity: 2
    });
  }, []);

  return {
    state,
    realTimeData,
    experimentLog,
    setBeamEnergy,
    setBeamSpeed,
    setParticleType,
    setParticleCount,
    launchBeams,
    stopBeams,
    activateCollision,
    stopCollision,
    logExperiment,
    loadScenario,
    reset
  };
};
