import { useState, useCallback, useRef, useEffect } from 'react';

export type ComponentType = 
  | 'battery' | 'resistor' | 'capacitor' | 'inductor' | 'led' | 'bulb' 
  | 'switch' | 'ammeter' | 'voltmeter' | 'motor' | 'buzzer' | 'fuse'
  | 'diode' | 'transistor' | 'potentiometer' | 'relay' | 'thermistor'
  | 'photoresistor' | 'speaker' | 'microphone' | 'transformer' | 'ground';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  value: number;
  isOn?: boolean;
  color?: string;
  programmedValue?: number;
  label?: string;
}

export interface Wire {
  id: string;
  points: { x: number; y: number }[];
  startComponentId: string | null;
  endComponentId: string | null;
  color: string;
}

export interface Electron {
  id: string;
  wireId: string;
  position: number;
  speed: number;
}

export interface CircuitMeasurement {
  componentId: string;
  voltage: number;
  current: number;
  power: number;
  resistance: number;
}

export interface CircuitState {
  components: CircuitComponent[];
  wires: Wire[];
  electrons: Electron[];
  measurements: CircuitMeasurement[];
  selectedComponent: string | null;
  selectedWire: string | null;
  isSimulating: boolean;
  isDrawingWire: boolean;
  wireStartPoint: { x: number; y: number; componentId: string } | null;
  currentWirePoints: { x: number; y: number }[];
  shortCircuit: boolean;
  openCircuit: boolean;
  totalVoltage: number;
  totalCurrent: number;
  totalResistance: number;
  totalPower: number;
}

// Component definitions with metadata
export const COMPONENT_DEFINITIONS: Record<ComponentType, {
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  defaultValue: number;
  unit: string;
  category: 'basic' | 'measurement' | 'storage' | 'advanced' | 'input' | 'output';
}> = {
  battery: { name: 'Battery', nameAr: 'بطارية', icon: '🔋', color: '#FFD700', defaultValue: 9, unit: 'V', category: 'basic' },
  resistor: { name: 'Resistor', nameAr: 'مقاومة', icon: 'Ω', color: '#8B4513', defaultValue: 100, unit: 'Ω', category: 'basic' },
  capacitor: { name: 'Capacitor', nameAr: 'مكثف', icon: '⊢⊣', color: '#00BCD4', defaultValue: 100, unit: 'μF', category: 'storage' },
  inductor: { name: 'Inductor', nameAr: 'ملف حث', icon: '∿', color: '#9C27B0', defaultValue: 10, unit: 'mH', category: 'storage' },
  led: { name: 'LED', nameAr: 'LED', icon: '💡', color: '#FF0000', defaultValue: 2, unit: 'V', category: 'output' },
  bulb: { name: 'Bulb', nameAr: 'مصباح', icon: '💡', color: '#FFA500', defaultValue: 60, unit: 'W', category: 'output' },
  switch: { name: 'Switch', nameAr: 'مفتاح', icon: '⏻', color: '#4CAF50', defaultValue: 0, unit: '', category: 'basic' },
  ammeter: { name: 'Ammeter', nameAr: 'أميتر', icon: 'A', color: '#2196F3', defaultValue: 0, unit: 'A', category: 'measurement' },
  voltmeter: { name: 'Voltmeter', nameAr: 'فولتميتر', icon: 'V', color: '#9C27B0', defaultValue: 0, unit: 'V', category: 'measurement' },
  motor: { name: 'DC Motor', nameAr: 'محرك DC', icon: '⚙️', color: '#607D8B', defaultValue: 12, unit: 'V', category: 'output' },
  buzzer: { name: 'Buzzer', nameAr: 'جرس', icon: '🔔', color: '#FF9800', defaultValue: 5, unit: 'V', category: 'output' },
  fuse: { name: 'Fuse', nameAr: 'مصهر', icon: '⚡', color: '#F44336', defaultValue: 1, unit: 'A', category: 'basic' },
  diode: { name: 'Diode', nameAr: 'ديود', icon: '▶|', color: '#3F51B5', defaultValue: 0.7, unit: 'V', category: 'advanced' },
  transistor: { name: 'Transistor', nameAr: 'ترانزستور', icon: 'T', color: '#673AB7', defaultValue: 0.6, unit: 'V', category: 'advanced' },
  potentiometer: { name: 'Potentiometer', nameAr: 'مقاومة متغيرة', icon: '⟲', color: '#795548', defaultValue: 1000, unit: 'Ω', category: 'input' },
  relay: { name: 'Relay', nameAr: 'مرحل', icon: '⎓', color: '#009688', defaultValue: 5, unit: 'V', category: 'advanced' },
  thermistor: { name: 'Thermistor', nameAr: 'ثرمستور', icon: '🌡️', color: '#E91E63', defaultValue: 10000, unit: 'Ω', category: 'input' },
  photoresistor: { name: 'LDR', nameAr: 'مقاومة ضوئية', icon: '☀️', color: '#FFEB3B', defaultValue: 10000, unit: 'Ω', category: 'input' },
  speaker: { name: 'Speaker', nameAr: 'سماعة', icon: '🔊', color: '#455A64', defaultValue: 8, unit: 'Ω', category: 'output' },
  microphone: { name: 'Microphone', nameAr: 'ميكروفون', icon: '🎤', color: '#37474F', defaultValue: 0.1, unit: 'V', category: 'input' },
  transformer: { name: 'Transformer', nameAr: 'محول', icon: '⌂', color: '#616161', defaultValue: 2, unit: ':1', category: 'advanced' },
  ground: { name: 'Ground', nameAr: 'أرضي', icon: '⏚', color: '#212121', defaultValue: 0, unit: '', category: 'basic' },
};

// Preset circuits
export const CIRCUIT_PRESETS = [
  {
    id: 'simple-bulb',
    name: 'مصباح بسيط',
    difficulty: 'beginner',
    components: [
      { type: 'battery' as ComponentType, x: 150, y: 200, value: 9 },
      { type: 'bulb' as ComponentType, x: 400, y: 200, value: 60 },
    ]
  },
  {
    id: 'switch-circuit',
    name: 'دائرة مفتاح',
    difficulty: 'beginner',
    components: [
      { type: 'battery' as ComponentType, x: 150, y: 200, value: 9 },
      { type: 'switch' as ComponentType, x: 280, y: 200, value: 0, isOn: false },
      { type: 'bulb' as ComponentType, x: 420, y: 200, value: 60 },
    ]
  },
  {
    id: 'series-resistors',
    name: 'مقاومات توالي',
    difficulty: 'beginner',
    components: [
      { type: 'battery' as ComponentType, x: 100, y: 200, value: 12 },
      { type: 'resistor' as ComponentType, x: 250, y: 200, value: 100 },
      { type: 'resistor' as ComponentType, x: 400, y: 200, value: 200 },
      { type: 'resistor' as ComponentType, x: 550, y: 200, value: 300 },
    ]
  },
  {
    id: 'parallel-resistors',
    name: 'مقاومات توازي',
    difficulty: 'intermediate',
    components: [
      { type: 'battery' as ComponentType, x: 100, y: 220, value: 12 },
      { type: 'resistor' as ComponentType, x: 350, y: 120, value: 100 },
      { type: 'resistor' as ComponentType, x: 350, y: 220, value: 100 },
      { type: 'resistor' as ComponentType, x: 350, y: 320, value: 100 },
    ]
  },
  {
    id: 'led-circuit',
    name: 'دائرة LED',
    difficulty: 'intermediate',
    components: [
      { type: 'battery' as ComponentType, x: 120, y: 200, value: 9 },
      { type: 'resistor' as ComponentType, x: 280, y: 200, value: 330 },
      { type: 'led' as ComponentType, x: 440, y: 200, value: 2, color: '#FF0000' },
    ]
  },
  {
    id: 'rc-circuit',
    name: 'دائرة RC',
    difficulty: 'intermediate',
    components: [
      { type: 'battery' as ComponentType, x: 100, y: 200, value: 9 },
      { type: 'switch' as ComponentType, x: 220, y: 200, value: 0, isOn: false },
      { type: 'resistor' as ComponentType, x: 350, y: 200, value: 1000 },
      { type: 'capacitor' as ComponentType, x: 500, y: 200, value: 100 },
    ]
  },
  {
    id: 'motor-control',
    name: 'تحكم بالمحرك',
    difficulty: 'advanced',
    components: [
      { type: 'battery' as ComponentType, x: 100, y: 200, value: 12 },
      { type: 'switch' as ComponentType, x: 230, y: 200, value: 0, isOn: true },
      { type: 'potentiometer' as ComponentType, x: 360, y: 200, value: 500 },
      { type: 'motor' as ComponentType, x: 500, y: 200, value: 12 },
    ]
  },
  {
    id: 'measurement-circuit',
    name: 'قياسات متقدمة',
    difficulty: 'advanced',
    components: [
      { type: 'battery' as ComponentType, x: 100, y: 200, value: 9 },
      { type: 'ammeter' as ComponentType, x: 230, y: 200, value: 0 },
      { type: 'resistor' as ComponentType, x: 360, y: 200, value: 100 },
      { type: 'voltmeter' as ComponentType, x: 490, y: 200, value: 0 },
      { type: 'bulb' as ComponentType, x: 600, y: 200, value: 40 },
    ]
  },
  {
    id: 'complex-circuit',
    name: 'دائرة معقدة',
    difficulty: 'expert',
    components: [
      { type: 'battery' as ComponentType, x: 80, y: 200, value: 12 },
      { type: 'fuse' as ComponentType, x: 160, y: 200, value: 1 },
      { type: 'switch' as ComponentType, x: 240, y: 200, value: 0, isOn: true },
      { type: 'resistor' as ComponentType, x: 340, y: 130, value: 100 },
      { type: 'led' as ComponentType, x: 440, y: 130, value: 2, color: '#00FF00' },
      { type: 'resistor' as ComponentType, x: 340, y: 270, value: 220 },
      { type: 'bulb' as ComponentType, x: 440, y: 270, value: 60 },
      { type: 'capacitor' as ComponentType, x: 560, y: 200, value: 100 },
    ]
  },
  {
    id: 'sensor-circuit',
    name: 'دائرة حساسات',
    difficulty: 'expert',
    components: [
      { type: 'battery' as ComponentType, x: 80, y: 200, value: 5 },
      { type: 'photoresistor' as ComponentType, x: 200, y: 140, value: 10000 },
      { type: 'thermistor' as ComponentType, x: 200, y: 260, value: 10000 },
      { type: 'transistor' as ComponentType, x: 350, y: 200, value: 0.6 },
      { type: 'relay' as ComponentType, x: 480, y: 200, value: 5 },
      { type: 'motor' as ComponentType, x: 600, y: 200, value: 12 },
    ]
  },
];

export const useAdvancedCircuit = () => {
  const [state, setState] = useState<CircuitState>({
    components: [],
    wires: [],
    electrons: [],
    measurements: [],
    selectedComponent: null,
    selectedWire: null,
    isSimulating: false,
    isDrawingWire: false,
    wireStartPoint: null,
    currentWirePoints: [],
    shortCircuit: false,
    openCircuit: true,
    totalVoltage: 0,
    totalCurrent: 0,
    totalResistance: 0,
    totalPower: 0,
  });

  const animationRef = useRef<number | null>(null);
  const electronAnimationRef = useRef<number | null>(null);

  // Ohm's Law calculations
  const calculateOhmsLaw = useCallback((voltage: number, resistance: number): number => {
    if (resistance === 0) return Infinity;
    return voltage / resistance;
  }, []);

  // Power calculation
  const calculatePower = useCallback((voltage: number, current: number): number => {
    return voltage * current;
  }, []);

  // Series resistance
  const calculateSeriesResistance = useCallback((resistances: number[]): number => {
    return resistances.reduce((sum, r) => sum + r, 0);
  }, []);

  // Parallel resistance
  const calculateParallelResistance = useCallback((resistances: number[]): number => {
    if (resistances.length === 0) return 0;
    if (resistances.some(r => r === 0)) return 0;
    const sum = resistances.reduce((acc, r) => acc + 1 / r, 0);
    return sum > 0 ? 1 / sum : Infinity;
  }, []);

  // Get component resistance
  const getComponentResistance = useCallback((comp: CircuitComponent): number => {
    switch (comp.type) {
      case 'resistor':
      case 'potentiometer':
      case 'thermistor':
      case 'photoresistor':
        return comp.value;
      case 'bulb':
        return comp.value > 0 ? (240 * 240) / comp.value : 240;
      case 'led':
        return 50; // Forward resistance
      case 'motor':
        return 20;
      case 'speaker':
        return comp.value;
      case 'buzzer':
        return 100;
      case 'switch':
        return comp.isOn ? 0.001 : Infinity;
      case 'fuse':
        return 0.01;
      default:
        return 0;
    }
  }, []);

  // Run simulation
  const runSimulation = useCallback(() => {
    const { components, wires } = state;
    
    // Find batteries
    const batteries = components.filter(c => c.type === 'battery');
    const totalVoltage = batteries.reduce((sum, b) => sum + b.value, 0);
    
    // Check for open switches
    const switches = components.filter(c => c.type === 'switch');
    const hasOpenSwitch = switches.some(s => !s.isOn);
    
    if (hasOpenSwitch || batteries.length === 0) {
      setState(prev => ({
        ...prev,
        isSimulating: true,
        openCircuit: true,
        shortCircuit: false,
        totalVoltage,
        totalCurrent: 0,
        totalResistance: Infinity,
        totalPower: 0,
        measurements: components.map(c => ({
          componentId: c.id,
          voltage: c.type === 'battery' ? c.value : 0,
          current: 0,
          power: 0,
          resistance: getComponentResistance(c)
        }))
      }));
      return;
    }
    
    // Calculate total resistance (simplified series calculation)
    const loadComponents = components.filter(c => 
      !['battery', 'ammeter', 'voltmeter', 'ground'].includes(c.type)
    );
    
    const resistances = loadComponents.map(c => getComponentResistance(c)).filter(r => r < Infinity);
    const totalResistance = calculateSeriesResistance(resistances);
    
    // Check for short circuit
    const shortCircuit = totalResistance < 1 && batteries.length > 0;
    
    // Calculate current
    const totalCurrent = shortCircuit ? 0 : calculateOhmsLaw(totalVoltage, totalResistance);
    const totalPower = calculatePower(totalVoltage, totalCurrent);
    
    // Calculate measurements for each component
    const measurements: CircuitMeasurement[] = components.map(c => {
      const resistance = getComponentResistance(c);
      let voltage = 0;
      let current = shortCircuit ? 0 : totalCurrent;
      
      switch (c.type) {
        case 'battery':
          voltage = c.value;
          current = totalCurrent;
          break;
        case 'ammeter':
          voltage = 0;
          break;
        case 'voltmeter':
          current = 0;
          voltage = totalVoltage;
          break;
        default:
          voltage = current * resistance;
          break;
      }
      
      return {
        componentId: c.id,
        voltage,
        current,
        power: calculatePower(voltage, current),
        resistance
      };
    });
    
    // Generate electrons for animation
    const electrons: Electron[] = [];
    if (!shortCircuit && totalCurrent > 0) {
      wires.forEach((wire, i) => {
        const electronCount = Math.min(Math.floor(totalCurrent * 3), 5);
        for (let j = 0; j < electronCount; j++) {
          electrons.push({
            id: `electron-${wire.id}-${j}`,
            wireId: wire.id,
            position: (j / electronCount),
            speed: totalCurrent * 0.02
          });
        }
      });
    }
    
    setState(prev => ({
      ...prev,
      isSimulating: true,
      shortCircuit,
      openCircuit: false,
      totalVoltage,
      totalCurrent: shortCircuit ? 0 : totalCurrent,
      totalResistance,
      totalPower,
      measurements,
      electrons
    }));
  }, [state, calculateOhmsLaw, calculatePower, calculateSeriesResistance, getComponentResistance]);

  // Animate electrons
  useEffect(() => {
    if (state.isSimulating && state.electrons.length > 0) {
      const animate = () => {
        setState(prev => ({
          ...prev,
          electrons: prev.electrons.map(e => ({
            ...e,
            position: (e.position + e.speed) % 1
          }))
        }));
        electronAnimationRef.current = requestAnimationFrame(animate);
      };
      electronAnimationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (electronAnimationRef.current) {
          cancelAnimationFrame(electronAnimationRef.current);
        }
      };
    }
  }, [state.isSimulating, state.electrons.length > 0]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    if (electronAnimationRef.current) {
      cancelAnimationFrame(electronAnimationRef.current);
    }
    setState(prev => ({
      ...prev,
      isSimulating: false,
      electrons: [],
      measurements: []
    }));
  }, []);

  // Add component
  const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const def = COMPONENT_DEFINITIONS[type];
    const newComponent: CircuitComponent = {
      id: `comp-${Date.now()}`,
      type,
      x,
      y,
      rotation: 0,
      value: def.defaultValue,
      isOn: type === 'switch' ? false : undefined,
      color: type === 'led' ? '#FF0000' : undefined,
    };
    
    setState(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  }, []);

  // Remove component
  const removeComponent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
      wires: prev.wires.filter(w => w.startComponentId !== id && w.endComponentId !== id),
      selectedComponent: prev.selectedComponent === id ? null : prev.selectedComponent
    }));
  }, []);

  // Update component
  const updateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  // Move component
  const moveComponent = useCallback((id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, x, y } : c)
    }));
  }, []);

  // Rotate component
  const rotateComponent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      )
    }));
  }, []);

  // Select component
  const selectComponent = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedComponent: id, selectedWire: null }));
  }, []);

  // Toggle switch
  const toggleSwitch = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === id && c.type === 'switch' ? { ...c, isOn: !c.isOn } : c
      )
    }));
  }, []);

  // Start drawing wire
  const startWire = useCallback((x: number, y: number, componentId: string) => {
    setState(prev => ({
      ...prev,
      isDrawingWire: true,
      wireStartPoint: { x, y, componentId },
      currentWirePoints: [{ x, y }]
    }));
  }, []);

  // Add point to wire
  const addWirePoint = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      currentWirePoints: [...prev.currentWirePoints, { x, y }]
    }));
  }, []);

  // Finish wire
  const finishWire = useCallback((endX: number, endY: number, endComponentId: string | null) => {
    setState(prev => {
      if (!prev.wireStartPoint) return prev;
      
      const newWire: Wire = {
        id: `wire-${Date.now()}`,
        points: [...prev.currentWirePoints, { x: endX, y: endY }],
        startComponentId: prev.wireStartPoint.componentId,
        endComponentId,
        color: '#4CAF50'
      };
      
      return {
        ...prev,
        wires: [...prev.wires, newWire],
        isDrawingWire: false,
        wireStartPoint: null,
        currentWirePoints: []
      };
    });
  }, []);

  // Cancel wire
  const cancelWire = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDrawingWire: false,
      wireStartPoint: null,
      currentWirePoints: []
    }));
  }, []);

  // Remove wire
  const removeWire = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      wires: prev.wires.filter(w => w.id !== id),
      selectedWire: prev.selectedWire === id ? null : prev.selectedWire
    }));
  }, []);

  // Select wire
  const selectWire = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedWire: id, selectedComponent: null }));
  }, []);

  // Load preset
  const loadPreset = useCallback((presetId: string) => {
    const preset = CIRCUIT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    const components: CircuitComponent[] = preset.components.map((c, i) => ({
      id: `comp-preset-${Date.now()}-${i}`,
      type: c.type,
      x: c.x,
      y: c.y,
      rotation: 0,
      value: c.value,
      isOn: c.isOn,
      color: c.color,
    }));
    
    setState(prev => ({
      ...prev,
      components,
      wires: [],
      electrons: [],
      measurements: [],
      selectedComponent: null,
      selectedWire: null,
      isSimulating: false,
      shortCircuit: false,
      openCircuit: true,
      totalVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
    }));
  }, []);

  // Clear circuit
  const clearCircuit = useCallback(() => {
    if (electronAnimationRef.current) {
      cancelAnimationFrame(electronAnimationRef.current);
    }
    setState({
      components: [],
      wires: [],
      electrons: [],
      measurements: [],
      selectedComponent: null,
      selectedWire: null,
      isSimulating: false,
      isDrawingWire: false,
      wireStartPoint: null,
      currentWirePoints: [],
      shortCircuit: false,
      openCircuit: true,
      totalVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
    });
  }, []);

  return {
    state,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    rotateComponent,
    selectComponent,
    toggleSwitch,
    startWire,
    addWirePoint,
    finishWire,
    cancelWire,
    removeWire,
    selectWire,
    runSimulation,
    stopSimulation,
    loadPreset,
    clearCircuit,
    COMPONENT_DEFINITIONS,
    CIRCUIT_PRESETS,
  };
};
