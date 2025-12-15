import { useState, useCallback, useMemo } from 'react';

export type ComponentType = 'battery' | 'resistor' | 'capacitor' | 'inductor' | 'led' | 'bulb' | 'switch' | 'ammeter' | 'voltmeter' | 'wire' | 'motor';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  value: number; // Voltage for battery, resistance for resistor, etc.
  isOn?: boolean; // For switches
  connections: string[]; // IDs of connected components
}

export interface Wire {
  id: string;
  startComponentId: string;
  startTerminal: 'positive' | 'negative';
  endComponentId: string;
  endTerminal: 'positive' | 'negative';
  points: { x: number; y: number }[];
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
  measurements: CircuitMeasurement[];
  selectedComponent: string | null;
  isSimulating: boolean;
  shortCircuit: boolean;
  totalVoltage: number;
  totalCurrent: number;
  totalResistance: number;
}

export const useCircuitSimulation = () => {
  const [state, setState] = useState<CircuitState>({
    components: [],
    wires: [],
    measurements: [],
    selectedComponent: null,
    isSimulating: false,
    shortCircuit: false,
    totalVoltage: 0,
    totalCurrent: 0,
    totalResistance: 0
  });

  // Ohm's Law: V = IR
  const calculateOhmsLaw = useCallback((voltage: number, resistance: number): number => {
    if (resistance === 0) return Infinity;
    return voltage / resistance;
  }, []);

  // Power: P = IV = I²R = V²/R
  const calculatePower = useCallback((voltage: number, current: number): number => {
    return voltage * current;
  }, []);

  // Series resistance: R_total = R1 + R2 + ... + Rn
  const calculateSeriesResistance = useCallback((resistances: number[]): number => {
    return resistances.reduce((sum, r) => sum + r, 0);
  }, []);

  // Parallel resistance: 1/R_total = 1/R1 + 1/R2 + ... + 1/Rn
  const calculateParallelResistance = useCallback((resistances: number[]): number => {
    if (resistances.length === 0) return 0;
    if (resistances.some(r => r === 0)) return 0;
    const sum = resistances.reduce((acc, r) => acc + 1 / r, 0);
    return 1 / sum;
  }, []);

  // Kirchhoff's Current Law: Sum of currents at a node = 0
  const verifyKCL = useCallback((nodeCurrents: number[]): boolean => {
    const sum = nodeCurrents.reduce((acc, i) => acc + i, 0);
    return Math.abs(sum) < 0.001; // Allow small floating point errors
  }, []);

  // Kirchhoff's Voltage Law: Sum of voltages in a loop = 0
  const verifyKVL = useCallback((loopVoltages: number[]): boolean => {
    const sum = loopVoltages.reduce((acc, v) => acc + v, 0);
    return Math.abs(sum) < 0.001;
  }, []);

  // Capacitor: Q = CV, Energy = 0.5 * C * V²
  const calculateCapacitor = useCallback((capacitance: number, voltage: number): { charge: number; energy: number } => {
    return {
      charge: capacitance * voltage,
      energy: 0.5 * capacitance * voltage * voltage
    };
  }, []);

  // Inductor: V = L * (di/dt), Energy = 0.5 * L * I²
  const calculateInductor = useCallback((inductance: number, current: number): { energy: number } => {
    return {
      energy: 0.5 * inductance * current * current
    };
  }, []);

  const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const defaultValues: Record<ComponentType, number> = {
      battery: 9,
      resistor: 100,
      capacitor: 0.001,
      inductor: 0.01,
      led: 2,
      bulb: 60,
      switch: 0,
      ammeter: 0,
      voltmeter: 0,
      wire: 0,
      motor: 12
    };

    const newComponent: CircuitComponent = {
      id: `component-${Date.now()}`,
      type,
      x,
      y,
      rotation: 0,
      value: defaultValues[type],
      isOn: type === 'switch' ? false : undefined,
      connections: []
    };

    setState(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  }, []);

  const removeComponent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
      wires: prev.wires.filter(w => w.startComponentId !== id && w.endComponentId !== id),
      selectedComponent: prev.selectedComponent === id ? null : prev.selectedComponent
    }));
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  const selectComponent = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedComponent: id }));
  }, []);

  const toggleSwitch = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === id && c.type === 'switch' ? { ...c, isOn: !c.isOn } : c
      )
    }));
  }, []);

  const addWire = useCallback((
    startComponentId: string,
    startTerminal: 'positive' | 'negative',
    endComponentId: string,
    endTerminal: 'positive' | 'negative'
  ) => {
    const newWire: Wire = {
      id: `wire-${Date.now()}`,
      startComponentId,
      startTerminal,
      endComponentId,
      endTerminal,
      points: []
    };

    setState(prev => ({
      ...prev,
      wires: [...prev.wires, newWire],
      components: prev.components.map(c => {
        if (c.id === startComponentId || c.id === endComponentId) {
          return { ...c, connections: [...c.connections, newWire.id] };
        }
        return c;
      })
    }));
  }, []);

  const removeWire = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      wires: prev.wires.filter(w => w.id !== id),
      components: prev.components.map(c => ({
        ...c,
        connections: c.connections.filter(conn => conn !== id)
      }))
    }));
  }, []);

  // Simulate the circuit
  const runSimulation = useCallback(() => {
    const { components, wires } = state;
    
    // Find batteries (voltage sources)
    const batteries = components.filter(c => c.type === 'battery');
    const totalVoltage = batteries.reduce((sum, b) => sum + b.value, 0);
    
    // Find resistors and calculate total resistance
    const resistors = components.filter(c => c.type === 'resistor');
    const bulbs = components.filter(c => c.type === 'bulb');
    
    // Check for switches - if any switch is off, circuit is open
    const switches = components.filter(c => c.type === 'switch');
    const circuitOpen = switches.some(s => !s.isOn);
    
    if (circuitOpen) {
      setState(prev => ({
        ...prev,
        isSimulating: true,
        shortCircuit: false,
        totalVoltage,
        totalCurrent: 0,
        totalResistance: Infinity,
        measurements: components.map(c => ({
          componentId: c.id,
          voltage: c.type === 'battery' ? c.value : 0,
          current: 0,
          power: 0,
          resistance: c.type === 'resistor' ? c.value : (c.type === 'bulb' ? 240 : 0)
        }))
      }));
      return;
    }
    
    // Calculate total resistance (simplified: assume series)
    const resistorValues = resistors.map(r => r.value);
    const bulbResistances = bulbs.map(b => (b.value > 0 ? 240 * 240 / b.value : 240)); // P = V²/R
    const allResistances = [...resistorValues, ...bulbResistances];
    
    const totalResistance = allResistances.length > 0 
      ? calculateSeriesResistance(allResistances)
      : 0.001; // Small resistance to prevent division by zero
    
    // Check for short circuit
    const shortCircuit = totalResistance < 0.1 && batteries.length > 0;
    
    // Calculate current using Ohm's Law
    const totalCurrent = shortCircuit ? 999 : calculateOhmsLaw(totalVoltage, totalResistance);
    
    // Calculate measurements for each component
    const measurements: CircuitMeasurement[] = components.map(c => {
      let voltage = 0;
      let current = shortCircuit ? 0 : totalCurrent;
      let resistance = 0;
      
      switch (c.type) {
        case 'battery':
          voltage = c.value;
          break;
        case 'resistor':
          resistance = c.value;
          voltage = current * resistance;
          break;
        case 'bulb':
          resistance = c.value > 0 ? 240 * 240 / c.value : 240;
          voltage = current * resistance;
          break;
        case 'led':
          voltage = c.value;
          break;
        case 'ammeter':
          voltage = 0;
          break;
        case 'voltmeter':
          current = 0;
          voltage = totalVoltage;
          break;
        default:
          break;
      }
      
      const power = calculatePower(voltage, current);
      
      return {
        componentId: c.id,
        voltage,
        current,
        power,
        resistance
      };
    });
    
    setState(prev => ({
      ...prev,
      isSimulating: true,
      shortCircuit,
      totalVoltage,
      totalCurrent: shortCircuit ? 0 : totalCurrent,
      totalResistance,
      measurements
    }));
  }, [state, calculateOhmsLaw, calculatePower, calculateSeriesResistance]);

  const stopSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSimulating: false,
      measurements: []
    }));
  }, []);

  const clearCircuit = useCallback(() => {
    setState({
      components: [],
      wires: [],
      measurements: [],
      selectedComponent: null,
      isSimulating: false,
      shortCircuit: false,
      totalVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0
    });
  }, []);

  const loadPreset = useCallback((preset: 'series' | 'parallel' | 'complex') => {
    let newComponents: CircuitComponent[] = [];
    let newWires: Wire[] = [];

    if (preset === 'series') {
      newComponents = [
        { id: 'bat1', type: 'battery', x: 100, y: 200, rotation: 0, value: 9, connections: [] },
        { id: 'res1', type: 'resistor', x: 250, y: 200, rotation: 0, value: 100, connections: [] },
        { id: 'res2', type: 'resistor', x: 400, y: 200, rotation: 0, value: 200, connections: [] },
        { id: 'bulb1', type: 'bulb', x: 550, y: 200, rotation: 0, value: 60, connections: [] }
      ];
    } else if (preset === 'parallel') {
      newComponents = [
        { id: 'bat1', type: 'battery', x: 100, y: 250, rotation: 0, value: 12, connections: [] },
        { id: 'res1', type: 'resistor', x: 300, y: 150, rotation: 0, value: 100, connections: [] },
        { id: 'res2', type: 'resistor', x: 300, y: 250, rotation: 0, value: 100, connections: [] },
        { id: 'res3', type: 'resistor', x: 300, y: 350, rotation: 0, value: 100, connections: [] }
      ];
    } else {
      newComponents = [
        { id: 'bat1', type: 'battery', x: 100, y: 200, rotation: 0, value: 12, connections: [] },
        { id: 'sw1', type: 'switch', x: 200, y: 200, rotation: 0, value: 0, isOn: true, connections: [] },
        { id: 'res1', type: 'resistor', x: 350, y: 150, rotation: 0, value: 100, connections: [] },
        { id: 'led1', type: 'led', x: 350, y: 250, rotation: 0, value: 2, connections: [] },
        { id: 'bulb1', type: 'bulb', x: 500, y: 200, rotation: 0, value: 40, connections: [] },
        { id: 'amm1', type: 'ammeter', x: 600, y: 200, rotation: 0, value: 0, connections: [] }
      ];
    }

    setState({
      components: newComponents,
      wires: newWires,
      measurements: [],
      selectedComponent: null,
      isSimulating: false,
      shortCircuit: false,
      totalVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0
    });
  }, []);

  // Get component info for display
  const getComponentInfo = useMemo(() => {
    return (type: ComponentType) => {
      const info: Record<ComponentType, { name: string; unit: string; symbol: string }> = {
        battery: { name: 'بطارية', unit: 'V', symbol: '⚡' },
        resistor: { name: 'مقاومة', unit: 'Ω', symbol: 'Ω' },
        capacitor: { name: 'مكثف', unit: 'F', symbol: '⊢⊣' },
        inductor: { name: 'ملف', unit: 'H', symbol: '∿' },
        led: { name: 'LED', unit: 'V', symbol: '💡' },
        bulb: { name: 'مصباح', unit: 'W', symbol: '💡' },
        switch: { name: 'مفتاح', unit: '', symbol: '⏻' },
        ammeter: { name: 'أميتر', unit: 'A', symbol: 'A' },
        voltmeter: { name: 'فولتميتر', unit: 'V', symbol: 'V' },
        wire: { name: 'سلك', unit: '', symbol: '—' },
        motor: { name: 'محرك', unit: 'V', symbol: '⚙' }
      };
      return info[type];
    };
  }, []);

  return {
    state,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    toggleSwitch,
    addWire,
    removeWire,
    runSimulation,
    stopSimulation,
    clearCircuit,
    loadPreset,
    getComponentInfo,
    calculateOhmsLaw,
    calculatePower,
    calculateSeriesResistance,
    calculateParallelResistance,
    calculateCapacitor,
    calculateInductor,
    verifyKCL,
    verifyKVL
  };
};
