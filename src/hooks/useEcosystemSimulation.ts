import { useState, useCallback, useMemo } from 'react';

export type OrganismType = 'producer' | 'primary-consumer' | 'secondary-consumer' | 'tertiary-consumer' | 'decomposer';

export interface Organism {
  id: string;
  species: string;
  speciesAr: string;
  type: OrganismType;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  age: number;
  maxAge: number;
  reproductionRate: number;
  speed: number;
  size: number;
  color: string;
  icon: string;
  isAlive: boolean;
  preyTypes: OrganismType[];
}

export interface Species {
  id: string;
  name: string;
  nameAr: string;
  type: OrganismType;
  color: string;
  icon: string;
  initialEnergy: number;
  maxEnergy: number;
  maxAge: number;
  reproductionRate: number;
  speed: number;
  size: number;
  preyTypes: OrganismType[];
}

export interface EnvironmentEvent {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  effect: (organisms: Organism[]) => Organism[];
}

export interface PopulationData {
  time: number;
  producers: number;
  primaryConsumers: number;
  secondaryConsumers: number;
  tertiaryConsumers: number;
  decomposers: number;
  total: number;
}

export interface EcosystemState {
  organisms: Organism[];
  populationHistory: PopulationData[];
  environment: 'forest' | 'desert' | 'ocean' | 'grassland';
  isPaused: boolean;
  speed: number;
  time: number;
  width: number;
  height: number;
  showFoodChain: boolean;
  selectedOrganism: string | null;
  balance: 'stable' | 'unstable' | 'collapse';
}

// Predefined species
export const SPECIES: Species[] = [
  // Producers
  { id: 'grass', name: 'Grass', nameAr: 'عشب', type: 'producer', color: '#4CAF50', icon: '🌿', initialEnergy: 50, maxEnergy: 100, maxAge: 200, reproductionRate: 0.1, speed: 0, size: 10, preyTypes: [] },
  { id: 'tree', name: 'Tree', nameAr: 'شجرة', type: 'producer', color: '#2E7D32', icon: '🌳', initialEnergy: 200, maxEnergy: 500, maxAge: 1000, reproductionRate: 0.02, speed: 0, size: 30, preyTypes: [] },
  { id: 'algae', name: 'Algae', nameAr: 'طحالب', type: 'producer', color: '#81C784', icon: '🌱', initialEnergy: 30, maxEnergy: 50, maxAge: 100, reproductionRate: 0.15, speed: 0, size: 5, preyTypes: [] },
  
  // Primary Consumers
  { id: 'rabbit', name: 'Rabbit', nameAr: 'أرنب', type: 'primary-consumer', color: '#BDBDBD', icon: '🐰', initialEnergy: 80, maxEnergy: 150, maxAge: 300, reproductionRate: 0.08, speed: 3, size: 15, preyTypes: ['producer'] },
  { id: 'deer', name: 'Deer', nameAr: 'غزال', type: 'primary-consumer', color: '#8D6E63', icon: '🦌', initialEnergy: 150, maxEnergy: 300, maxAge: 500, reproductionRate: 0.04, speed: 4, size: 25, preyTypes: ['producer'] },
  { id: 'butterfly', name: 'Butterfly', nameAr: 'فراشة', type: 'primary-consumer', color: '#E91E63', icon: '🦋', initialEnergy: 30, maxEnergy: 50, maxAge: 100, reproductionRate: 0.1, speed: 2, size: 8, preyTypes: ['producer'] },
  
  // Secondary Consumers
  { id: 'fox', name: 'Fox', nameAr: 'ثعلب', type: 'secondary-consumer', color: '#FF5722', icon: '🦊', initialEnergy: 120, maxEnergy: 250, maxAge: 400, reproductionRate: 0.03, speed: 5, size: 20, preyTypes: ['primary-consumer'] },
  { id: 'snake', name: 'Snake', nameAr: 'أفعى', type: 'secondary-consumer', color: '#795548', icon: '🐍', initialEnergy: 80, maxEnergy: 150, maxAge: 350, reproductionRate: 0.04, speed: 3, size: 15, preyTypes: ['primary-consumer'] },
  { id: 'owl', name: 'Owl', nameAr: 'بومة', type: 'secondary-consumer', color: '#5D4037', icon: '🦉', initialEnergy: 100, maxEnergy: 200, maxAge: 450, reproductionRate: 0.03, speed: 6, size: 18, preyTypes: ['primary-consumer'] },
  
  // Tertiary Consumers
  { id: 'lion', name: 'Lion', nameAr: 'أسد', type: 'tertiary-consumer', color: '#FFC107', icon: '🦁', initialEnergy: 200, maxEnergy: 400, maxAge: 600, reproductionRate: 0.02, speed: 6, size: 35, preyTypes: ['primary-consumer', 'secondary-consumer'] },
  { id: 'eagle', name: 'Eagle', nameAr: 'نسر', type: 'tertiary-consumer', color: '#3E2723', icon: '🦅', initialEnergy: 150, maxEnergy: 300, maxAge: 500, reproductionRate: 0.02, speed: 8, size: 25, preyTypes: ['primary-consumer', 'secondary-consumer'] },
  { id: 'wolf', name: 'Wolf', nameAr: 'ذئب', type: 'tertiary-consumer', color: '#607D8B', icon: '🐺', initialEnergy: 180, maxEnergy: 350, maxAge: 550, reproductionRate: 0.025, speed: 7, size: 30, preyTypes: ['primary-consumer', 'secondary-consumer'] },
  
  // Decomposers
  { id: 'mushroom', name: 'Mushroom', nameAr: 'فطر', type: 'decomposer', color: '#9E9E9E', icon: '🍄', initialEnergy: 40, maxEnergy: 80, maxAge: 150, reproductionRate: 0.12, speed: 0, size: 8, preyTypes: [] },
  { id: 'bacteria', name: 'Bacteria', nameAr: 'بكتيريا', type: 'decomposer', color: '#FFEB3B', icon: '🦠', initialEnergy: 20, maxEnergy: 40, maxAge: 50, reproductionRate: 0.2, speed: 0, size: 3, preyTypes: [] }
];

// Environment events
export const ENVIRONMENT_EVENTS: EnvironmentEvent[] = [
  {
    id: 'drought',
    name: 'Drought',
    nameAr: 'جفاف',
    description: 'نقص حاد في المياه يؤثر على النباتات',
    effect: (organisms) => organisms.map(o => ({
      ...o,
      energy: o.type === 'producer' ? o.energy * 0.5 : o.energy * 0.8
    }))
  },
  {
    id: 'flood',
    name: 'Flood',
    nameAr: 'فيضان',
    description: 'فيضان يقتل بعض الكائنات البطيئة',
    effect: (organisms) => organisms.map(o => ({
      ...o,
      isAlive: o.speed > 2 || Math.random() > 0.3 ? o.isAlive : false
    }))
  },
  {
    id: 'fire',
    name: 'Fire',
    nameAr: 'حريق',
    description: 'حريق يدمر النباتات ويخيف الحيوانات',
    effect: (organisms) => organisms.map(o => ({
      ...o,
      isAlive: o.type === 'producer' ? Math.random() > 0.7 : o.isAlive,
      energy: o.type !== 'producer' ? o.energy * 0.7 : o.energy
    }))
  },
  {
    id: 'disease',
    name: 'Disease',
    nameAr: 'مرض',
    description: 'انتشار مرض في نوع معين',
    effect: (organisms) => {
      const targetType = ['primary-consumer', 'secondary-consumer'][Math.floor(Math.random() * 2)];
      return organisms.map(o => ({
        ...o,
        energy: o.type === targetType ? o.energy * 0.6 : o.energy,
        isAlive: o.type === targetType ? Math.random() > 0.4 : o.isAlive
      }));
    }
  },
  {
    id: 'abundance',
    name: 'Abundance',
    nameAr: 'وفرة',
    description: 'موسم وفير يزيد من طاقة جميع الكائنات',
    effect: (organisms) => organisms.map(o => ({
      ...o,
      energy: Math.min(o.maxEnergy, o.energy * 1.3)
    }))
  }
];

const createOrganism = (species: Species, x: number, y: number): Organism => ({
  id: `${species.id}-${Date.now()}-${Math.random()}`,
  species: species.id,
  speciesAr: species.nameAr,
  type: species.type,
  x,
  y,
  energy: species.initialEnergy,
  maxEnergy: species.maxEnergy,
  age: 0,
  maxAge: species.maxAge,
  reproductionRate: species.reproductionRate,
  speed: species.speed,
  size: species.size,
  color: species.color,
  icon: species.icon,
  isAlive: true,
  preyTypes: species.preyTypes
});

export const useEcosystemSimulation = () => {
  const [state, setState] = useState<EcosystemState>({
    organisms: [],
    populationHistory: [],
    environment: 'forest',
    isPaused: true,
    speed: 1,
    time: 0,
    width: 800,
    height: 500,
    showFoodChain: true,
    selectedOrganism: null,
    balance: 'stable'
  });

  // Initialize ecosystem with default organisms
  const initializeEcosystem = useCallback((preset?: 'balanced' | 'producers-heavy' | 'predators-heavy') => {
    const { width, height } = state;
    const newOrganisms: Organism[] = [];

    let config = {
      grass: 20,
      tree: 5,
      rabbit: 10,
      deer: 5,
      fox: 4,
      owl: 3,
      lion: 2,
      mushroom: 8,
      bacteria: 10
    };

    if (preset === 'producers-heavy') {
      config = { ...config, grass: 40, tree: 10, rabbit: 5, fox: 2, lion: 1 };
    } else if (preset === 'predators-heavy') {
      config = { ...config, grass: 10, rabbit: 15, fox: 8, lion: 5 };
    }

    Object.entries(config).forEach(([speciesId, count]) => {
      const species = SPECIES.find(s => s.id === speciesId);
      if (species) {
        for (let i = 0; i < count; i++) {
          const x = Math.random() * (width - 40) + 20;
          const y = Math.random() * (height - 40) + 20;
          newOrganisms.push(createOrganism(species, x, y));
        }
      }
    });

    setState(prev => ({
      ...prev,
      organisms: newOrganisms,
      populationHistory: [],
      time: 0,
      balance: 'stable'
    }));
  }, [state.width, state.height]);

  // Add organism manually
  const addOrganism = useCallback((speciesId: string, x: number, y: number) => {
    const species = SPECIES.find(s => s.id === speciesId);
    if (!species) return;

    setState(prev => ({
      ...prev,
      organisms: [...prev.organisms, createOrganism(species, x, y)]
    }));
  }, []);

  // Remove organism
  const removeOrganism = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      organisms: prev.organisms.filter(o => o.id !== id)
    }));
  }, []);

  // Update simulation
  const updateSimulation = useCallback((deltaTime: number) => {
    setState(prev => {
      if (prev.isPaused) return prev;

      const dt = deltaTime * prev.speed / 1000;
      let organisms = [...prev.organisms];

      // Update each organism
      organisms = organisms.map(org => {
        if (!org.isAlive) return org;

        let newOrg = { ...org };

        // Age
        newOrg.age += dt;
        if (newOrg.age >= newOrg.maxAge) {
          newOrg.isAlive = false;
          return newOrg;
        }

        // Energy consumption
        if (org.type !== 'producer') {
          newOrg.energy -= dt * (org.speed + 1);
          if (newOrg.energy <= 0) {
            newOrg.isAlive = false;
            return newOrg;
          }
        } else {
          // Producers gain energy from sun
          newOrg.energy = Math.min(newOrg.maxEnergy, newOrg.energy + dt * 2);
        }

        // Movement for non-producers
        if (org.speed > 0) {
          const angle = Math.random() * 2 * Math.PI;
          newOrg.x = Math.max(20, Math.min(prev.width - 20, newOrg.x + Math.cos(angle) * org.speed * dt * 10));
          newOrg.y = Math.max(20, Math.min(prev.height - 20, newOrg.y + Math.sin(angle) * org.speed * dt * 10));
        }

        return newOrg;
      });

      // Predation
      organisms = organisms.map(predator => {
        if (!predator.isAlive || predator.preyTypes.length === 0) return predator;

        const prey = organisms.find(p => 
          p.isAlive && 
          predator.preyTypes.includes(p.type) &&
          Math.hypot(predator.x - p.x, predator.y - p.y) < (predator.size + p.size)
        );

        if (prey) {
          prey.isAlive = false;
          return {
            ...predator,
            energy: Math.min(predator.maxEnergy, predator.energy + prey.energy * 0.5)
          };
        }

        return predator;
      });

      // Reproduction
      const newOrganisms: Organism[] = [];
      organisms.forEach(org => {
        if (org.isAlive && org.energy > org.maxEnergy * 0.6 && Math.random() < org.reproductionRate * dt) {
          const species = SPECIES.find(s => s.id === org.species);
          if (species) {
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 50;
            newOrganisms.push(createOrganism(
              species,
              Math.max(20, Math.min(prev.width - 20, org.x + offsetX)),
              Math.max(20, Math.min(prev.height - 20, org.y + offsetY))
            ));
            org.energy *= 0.6;
          }
        }
      });

      organisms = [...organisms.filter(o => o.isAlive), ...newOrganisms];

      // Update population history
      const newTime = prev.time + dt;
      const populationData: PopulationData = {
        time: newTime,
        producers: organisms.filter(o => o.type === 'producer').length,
        primaryConsumers: organisms.filter(o => o.type === 'primary-consumer').length,
        secondaryConsumers: organisms.filter(o => o.type === 'secondary-consumer').length,
        tertiaryConsumers: organisms.filter(o => o.type === 'tertiary-consumer').length,
        decomposers: organisms.filter(o => o.type === 'decomposer').length,
        total: organisms.length
      };

      const newHistory = [...prev.populationHistory, populationData].slice(-200);

      // Check balance
      let balance: 'stable' | 'unstable' | 'collapse' = 'stable';
      if (populationData.producers === 0 || populationData.total < 10) {
        balance = 'collapse';
      } else if (populationData.tertiaryConsumers > populationData.primaryConsumers) {
        balance = 'unstable';
      }

      return {
        ...prev,
        organisms,
        populationHistory: newHistory,
        time: newTime,
        balance
      };
    });
  }, []);

  // Apply environment event
  const applyEvent = useCallback((eventId: string) => {
    const event = ENVIRONMENT_EVENTS.find(e => e.id === eventId);
    if (!event) return;

    setState(prev => ({
      ...prev,
      organisms: event.effect(prev.organisms)
    }));
  }, []);

  // Controls
  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const setEnvironment = useCallback((environment: EcosystemState['environment']) => {
    setState(prev => ({ ...prev, environment }));
  }, []);

  const toggleFoodChain = useCallback(() => {
    setState(prev => ({ ...prev, showFoodChain: !prev.showFoodChain }));
  }, []);

  const selectOrganism = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedOrganism: id }));
  }, []);

  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      organisms: [],
      populationHistory: [],
      time: 0,
      balance: 'stable'
    }));
  }, []);

  // Computed statistics
  const statistics = useMemo(() => {
    const { organisms, populationHistory } = state;
    
    const byType = {
      producers: organisms.filter(o => o.type === 'producer').length,
      primaryConsumers: organisms.filter(o => o.type === 'primary-consumer').length,
      secondaryConsumers: organisms.filter(o => o.type === 'secondary-consumer').length,
      tertiaryConsumers: organisms.filter(o => o.type === 'tertiary-consumer').length,
      decomposers: organisms.filter(o => o.type === 'decomposer').length
    };

    const bySpecies: Record<string, number> = {};
    organisms.forEach(o => {
      bySpecies[o.species] = (bySpecies[o.species] || 0) + 1;
    });

    const averageEnergy = organisms.length > 0
      ? organisms.reduce((sum, o) => sum + o.energy, 0) / organisms.length
      : 0;

    const averageAge = organisms.length > 0
      ? organisms.reduce((sum, o) => sum + o.age, 0) / organisms.length
      : 0;

    return {
      total: organisms.length,
      byType,
      bySpecies,
      averageEnergy,
      averageAge,
      history: populationHistory
    };
  }, [state.organisms, state.populationHistory]);

  return {
    state,
    statistics,
    initializeEcosystem,
    addOrganism,
    removeOrganism,
    updateSimulation,
    applyEvent,
    togglePause,
    setSpeed,
    setEnvironment,
    toggleFoodChain,
    selectOrganism,
    clearAll,
    SPECIES,
    ENVIRONMENT_EVENTS
  };
};
