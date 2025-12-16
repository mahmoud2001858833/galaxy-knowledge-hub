import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Trash2, RotateCw, Zap, Info, ArrowLeft,
  Power, ToggleLeft, ToggleRight
} from 'lucide-react';
import CircuitCanvas, { CircuitComponent, Wire } from '@/components/circuit/CircuitCanvas';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

// Component types with icons and properties
const COMPONENT_TYPES = {
  battery: { icon: '🔋', name: 'بطارية', color: '#22C55E', defaultValue: 9, unit: 'V' },
  resistor: { icon: '⚡', name: 'مقاومة', color: '#EF4444', defaultValue: 100, unit: 'Ω' },
  led: { icon: '💡', name: 'LED', color: '#FBBF24', defaultValue: 0, unit: '' },
  bulb: { icon: '💡', name: 'مصباح', color: '#FCD34D', defaultValue: 0, unit: '' },
  switch: { icon: '🔘', name: 'مفتاح', color: '#3B82F6', defaultValue: 0, unit: '' },
  motor: { icon: '⚙️', name: 'محرك', color: '#8B5CF6', defaultValue: 0, unit: '' },
  capacitor: { icon: '📦', name: 'مكثف', color: '#06B6D4', defaultValue: 100, unit: 'µF' },
  ammeter: { icon: '🔢', name: 'أميتر', color: '#F97316', defaultValue: 0, unit: 'mA' },
  voltmeter: { icon: '📊', name: 'فولتميتر', color: '#EC4899', defaultValue: 0, unit: 'V' }
};

// Preset circuits - 10 examples from simple to complex
const CIRCUIT_PRESETS = [
  {
    id: 'simple-light',
    name: '💡 مصباح بسيط',
    difficulty: 'مبتدئ',
    description: 'دائرة بسيطة مع بطارية ومصباح',
    components: [
      { id: 'bat1', type: 'battery', x: 150, y: 250, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 450, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'bulb1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'bulb1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'switch-circuit',
    name: '🔘 دائرة مفتاح',
    difficulty: 'مبتدئ',
    description: 'تحكم بالمصباح عبر المفتاح',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 250, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 280, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 460, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'sw1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative' as const, endComponentId: 'bulb1', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'bulb1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'led-resistor',
    name: '🔴 LED مع مقاومة',
    difficulty: 'مبتدئ',
    description: 'حماية LED بمقاومة',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 250, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 280, y: 250, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'led1', type: 'led', x: 460, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'res1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative' as const, endComponentId: 'led1', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'led1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'series-resistors',
    name: '📊 مقاومات توالي',
    difficulty: 'متوسط',
    description: 'ثلاث مقاومات على التوالي',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 300, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 250, y: 150, rotation: 0, value: 100, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 400, y: 150, rotation: 0, value: 200, connections: { positive: null, negative: null } },
      { id: 'res3', type: 'resistor', x: 550, y: 150, rotation: 0, value: 300, connections: { positive: null, negative: null } },
      { id: 'amm1', type: 'ammeter', x: 400, y: 400, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'res1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative' as const, endComponentId: 'res2', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'res2', startTerminal: 'negative' as const, endComponentId: 'res3', endTerminal: 'positive' as const, points: [] },
      { id: 'w4', startComponentId: 'res3', startTerminal: 'negative' as const, endComponentId: 'amm1', endTerminal: 'positive' as const, points: [] },
      { id: 'w5', startComponentId: 'amm1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'motor-control',
    name: '⚙️ تحكم بمحرك',
    difficulty: 'متوسط',
    description: 'تشغيل محرك بمفتاح',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 300, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 280, y: 150, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'mot1', type: 'motor', x: 460, y: 300, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'sw1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative' as const, endComponentId: 'mot1', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'mot1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'capacitor-charge',
    name: '📦 شحن مكثف',
    difficulty: 'متوسط',
    description: 'دائرة شحن مكثف',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 250, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 280, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'cap1', type: 'capacitor', x: 460, y: 250, rotation: 0, value: 100, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'sw1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative' as const, endComponentId: 'cap1', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'cap1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'voltage-divider',
    name: '📐 مجزئ الجهد',
    difficulty: 'متقدم',
    description: 'تقسيم الجهد بين مقاومتين',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 250, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 300, y: 150, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 300, y: 350, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
      { id: 'volt1', type: 'voltmeter', x: 500, y: 250, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'res1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative' as const, endComponentId: 'res2', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'res1', startTerminal: 'negative' as const, endComponentId: 'volt1', endTerminal: 'positive' as const, points: [] },
      { id: 'w4', startComponentId: 'res2', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
      { id: 'w5', startComponentId: 'volt1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'traffic-light',
    name: '🚦 إشارة مرور',
    difficulty: 'متقدم',
    description: 'ثلاث LEDs مع مقاومات',
    components: [
      { id: 'bat1', type: 'battery', x: 80, y: 250, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 200, y: 100, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'sw2', type: 'switch', x: 200, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'sw3', type: 'switch', x: 200, y: 400, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 380, y: 100, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 380, y: 250, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'res3', type: 'resistor', x: 380, y: 400, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'led1', type: 'led', x: 540, y: 100, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'led2', type: 'led', x: 540, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'led3', type: 'led', x: 540, y: 400, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: []
  },
  {
    id: 'rc-timer',
    name: '⏱️ دائرة RC',
    difficulty: 'متقدم',
    description: 'مؤقت RC بسيط',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 250, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 250, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 400, y: 150, rotation: 0, value: 10000, connections: { positive: null, negative: null } },
      { id: 'cap1', type: 'capacitor', x: 400, y: 350, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
      { id: 'volt1', type: 'voltmeter', x: 550, y: 250, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: []
  },
  {
    id: 'full-measurement',
    name: '📏 قياس كامل',
    difficulty: 'متقدم',
    description: 'دائرة مع أميتر وفولتميتر',
    components: [
      { id: 'bat1', type: 'battery', x: 80, y: 250, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 200, y: 250, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'amm1', type: 'ammeter', x: 340, y: 250, rotation: 0, value: 0, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 480, y: 150, rotation: 0, value: 220, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 480, y: 350, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'volt1', type: 'voltmeter', x: 600, y: 250, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: []
  }
];

export default function CircuitBuilderAdvanced() {
  const navigate = useNavigate();
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [measurements, setMeasurements] = useState({ voltage: 0, current: 0, power: 0 });
  
  // Wire drawing state
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState<{ componentId: string; terminal: 'positive' | 'negative' } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  // Add component to canvas
  const handleAddComponent = useCallback((type: string) => {
    const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
    const newComponent: CircuitComponent = {
      id: uuidv4(),
      type,
      x: 350 + Math.random() * 100 - 50,
      y: 250 + Math.random() * 100 - 50,
      rotation: 0,
      value: config.defaultValue,
      isOn: type === 'battery',
      connections: { positive: null, negative: null }
    };
    setComponents(prev => [...prev, newComponent]);
  }, []);

  // Move component
  const handleComponentMove = useCallback((id: string, x: number, y: number) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, x, y } : c
    ));
  }, []);

  // Select component
  const handleComponentSelect = useCallback((id: string | null) => {
    setSelectedComponent(id);
  }, []);

  // Handle terminal click for wire drawing
  const handleTerminalClick = useCallback((componentId: string, terminal: 'positive' | 'negative') => {
    if (!isDrawingWire) {
      setIsDrawingWire(true);
      setWireStart({ componentId, terminal });
    } else if (wireStart) {
      if (wireStart.componentId !== componentId) {
        const newWire: Wire = {
          id: uuidv4(),
          startComponentId: wireStart.componentId,
          startTerminal: wireStart.terminal,
          endComponentId: componentId,
          endTerminal: terminal,
          points: [],
          current: 0
        };
        setWires(prev => [...prev, newWire]);
      }
      setIsDrawingWire(false);
      setWireStart(null);
      setCurrentMousePos(null);
    }
  }, [isDrawingWire, wireStart]);

  // Handle canvas click
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (isDrawingWire) {
      setCurrentMousePos({ x, y });
    }
  }, [isDrawingWire]);

  // Toggle switch - THE KEY FIX
  const toggleSwitch = useCallback((id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id && c.type === 'switch' ? { ...c, isOn: !c.isOn } : c
    ));
  }, []);

  // Delete selected component
  const deleteSelected = useCallback(() => {
    if (selectedComponent) {
      setWires(prev => prev.filter(w => 
        w.startComponentId !== selectedComponent && w.endComponentId !== selectedComponent
      ));
      setComponents(prev => prev.filter(c => c.id !== selectedComponent));
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  // Rotate selected component
  const rotateSelected = useCallback(() => {
    if (selectedComponent) {
      setComponents(prev => prev.map(c => 
        c.id === selectedComponent ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      ));
    }
  }, [selectedComponent]);

  // Change component value
  const changeComponentValue = useCallback((id: string, value: number) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, value } : c
    ));
  }, []);

  // Run simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    
    const battery = components.find(c => c.type === 'battery');
    if (!battery) {
      setMeasurements({ voltage: 0, current: 0, power: 0 });
      return;
    }

    const switches = components.filter(c => c.type === 'switch');
    const allSwitchesOn = switches.length === 0 || switches.every(s => s.isOn);
    
    if (!allSwitchesOn || wires.length < 2) {
      setMeasurements({ voltage: battery.value || 0, current: 0, power: 0 });
      setComponents(prev => prev.map(c => 
        ['bulb', 'led', 'motor'].includes(c.type) ? { ...c, isOn: false } : c
      ));
      return;
    }

    const resistors = components.filter(c => c.type === 'resistor');
    const totalResistance = resistors.reduce((sum, r) => sum + (r.value || 100), 0) || 10;
    
    const voltage = battery.value || 9;
    const current = voltage / totalResistance;
    const power = voltage * current;

    setMeasurements({ voltage, current, power });
    setWires(prev => prev.map(w => ({ ...w, current })));

    setComponents(prev => prev.map(c => {
      if (['bulb', 'led', 'motor'].includes(c.type)) {
        return { ...c, isOn: true };
      }
      if (c.type === 'ammeter') {
        return { ...c, value: current * 1000 };
      }
      if (c.type === 'voltmeter') {
        return { ...c, value: voltage };
      }
      return c;
    }));
  }, [components, wires]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setMeasurements({ voltage: 0, current: 0, power: 0 });
    setComponents(prev => prev.map(c => 
      ['bulb', 'led', 'motor'].includes(c.type) ? { ...c, isOn: false } : c
    ));
    setWires(prev => prev.map(w => ({ ...w, current: 0 })));
  }, []);

  // Load preset
  const loadPreset = useCallback((presetId: string) => {
    const preset = CIRCUIT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setComponents(preset.components);
      setWires(preset.wires);
      setIsSimulating(false);
      setSelectedComponent(null);
    }
  }, []);

  // Clear circuit
  const clearCircuit = useCallback(() => {
    setComponents([]);
    setWires([]);
    setIsSimulating(false);
    setSelectedComponent(null);
    setMeasurements({ voltage: 0, current: 0, power: 0 });
  }, []);

  // Get selected component details
  const selectedComp = components.find(c => c.id === selectedComponent);
  const selectedConfig = selectedComp ? COMPONENT_TYPES[selectedComp.type as keyof typeof COMPONENT_TYPES] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-4" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-400" />
            معمل بناء الدوائر الكهربائية
          </h1>
        </div>

        {/* Measurements Display */}
        <div className="flex gap-3">
          <Badge className="bg-green-600 text-lg px-4 py-2">
            الجهد: {measurements.voltage.toFixed(1)} V
          </Badge>
          <Badge className="bg-blue-600 text-lg px-4 py-2">
            التيار: {(measurements.current * 1000).toFixed(1)} mA
          </Badge>
          <Badge className="bg-purple-600 text-lg px-4 py-2">
            القدرة: {(measurements.power * 1000).toFixed(1)} mW
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* Component Palette - Organized */}
        <div className="col-span-2">
          <Card className="bg-gray-800/80 border-gray-700 p-4 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-4 text-center">🔧 المكونات</h3>
            
            {/* Power Sources */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">مصادر الطاقة</p>
              <div className="grid grid-cols-2 gap-2">
                {['battery'].map(type => {
                  const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddComponent(type)}
                      className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 border border-gray-600"
                    >
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <p className="text-white text-xs">{config.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">التحكم</p>
              <div className="grid grid-cols-2 gap-2">
                {['switch'].map(type => {
                  const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddComponent(type)}
                      className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 border border-gray-600"
                    >
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <p className="text-white text-xs">{config.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Passive Components */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">مكونات سلبية</p>
              <div className="grid grid-cols-2 gap-2">
                {['resistor', 'capacitor'].map(type => {
                  const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddComponent(type)}
                      className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 border border-gray-600"
                    >
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <p className="text-white text-xs">{config.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Output Devices */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">المخرجات</p>
              <div className="grid grid-cols-2 gap-2">
                {['led', 'bulb', 'motor'].map(type => {
                  const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddComponent(type)}
                      className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 border border-gray-600"
                    >
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <p className="text-white text-xs">{config.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Measurement */}
            <div>
              <p className="text-gray-400 text-xs mb-2">القياس</p>
              <div className="grid grid-cols-2 gap-2">
                {['ammeter', 'voltmeter'].map(type => {
                  const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddComponent(type)}
                      className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 border border-gray-600"
                    >
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <p className="text-white text-xs">{config.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Canvas */}
        <div className="col-span-7">
          <Card className="bg-gray-800/80 border-gray-700 p-4 backdrop-blur-sm h-full">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {isSimulating ? (
                  <Button variant="destructive" onClick={stopSimulation} className="gap-2">
                    <Pause className="w-4 h-4" />
                    إيقاف
                  </Button>
                ) : (
                  <Button onClick={runSimulation} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4" />
                    تشغيل
                  </Button>
                )}
                
                <Button variant="outline" onClick={rotateSelected} disabled={!selectedComponent} className="gap-2">
                  <RotateCw className="w-4 h-4" />
                  تدوير
                </Button>
                
                <Button variant="outline" onClick={deleteSelected} disabled={!selectedComponent} className="gap-2 text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                  حذف
                </Button>

                <Button variant="outline" onClick={clearCircuit} className="gap-2">
                  مسح الكل
                </Button>
              </div>

              {/* Quick Switch Controls - Always Visible */}
              {components.filter(c => c.type === 'switch').length > 0 && (
                <div className="flex items-center gap-2 bg-gray-700/60 rounded-lg px-3 py-2">
                  <Power className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">المفاتيح:</span>
                  {components.filter(c => c.type === 'switch').map((sw, idx) => (
                    <Button
                      key={sw.id}
                      size="sm"
                      onClick={() => toggleSwitch(sw.id)}
                      className={`gap-1 ${sw.isOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {sw.isOn ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Canvas */}
            <CircuitCanvas
              components={components}
              wires={wires}
              selectedComponent={selectedComponent}
              isDrawingWire={isDrawingWire}
              wireStart={wireStart}
              currentMousePos={currentMousePos}
              onComponentMove={handleComponentMove}
              onComponentSelect={handleComponentSelect}
              onTerminalClick={handleTerminalClick}
              onCanvasClick={handleCanvasClick}
              isSimulating={isSimulating}
              measurements={measurements}
            />

            {/* Wire drawing indicator */}
            {isDrawingWire && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <Badge className="bg-yellow-500 text-black animate-pulse">
                  🔌 انقر على طرف آخر لإكمال السلك
                </Badge>
              </motion.div>
            )}

            {/* Selected Component Properties */}
            {selectedComp && selectedConfig && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-gray-700/50 rounded-lg"
              >
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  {selectedConfig.icon} خصائص {selectedConfig.name}
                </h4>
                
                {/* Switch Toggle Control */}
                {selectedComp.type === 'switch' && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300">حالة المفتاح:</span>
                    <Button
                      onClick={() => toggleSwitch(selectedComp.id)}
                      className={`gap-2 ${selectedComp.isOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {selectedComp.isOn ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          مغلق (ON)
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          مفتوح (OFF)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Value control for battery/resistor/capacitor */}
                {['battery', 'resistor', 'capacitor'].includes(selectedComp.type) && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>القيمة:</span>
                      <span>{selectedComp.value} {selectedConfig.unit}</span>
                    </div>
                    <Slider
                      value={[selectedComp.value || 0]}
                      onValueChange={([v]) => changeComponentValue(selectedComp.id, v)}
                      min={selectedComp.type === 'battery' ? 1 : 10}
                      max={selectedComp.type === 'battery' ? 24 : selectedComp.type === 'capacitor' ? 10000 : 10000}
                      step={selectedComp.type === 'battery' ? 0.5 : 10}
                    />
                  </div>
                )}

                {/* Display value for meters */}
                {['ammeter', 'voltmeter'].includes(selectedComp.type) && isSimulating && (
                  <div className="text-2xl font-bold text-center text-green-400">
                    {selectedComp.type === 'ammeter' 
                      ? `${(selectedComp.value || 0).toFixed(2)} mA`
                      : `${(selectedComp.value || 0).toFixed(2)} V`
                    }
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Right Panel - Presets */}
        <div className="col-span-3">
          <Tabs defaultValue="presets" className="h-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="presets">الأمثلة</TabsTrigger>
              <TabsTrigger value="info">المعلومات</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-4">
              <Card className="bg-gray-800/80 border-gray-700 p-4 backdrop-blur-sm max-h-[600px] overflow-y-auto">
                <h3 className="text-white font-bold mb-4">🔧 دوائر جاهزة (10)</h3>
                
                <div className="space-y-3">
                  {CIRCUIT_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadPreset(preset.id)}
                      className="w-full p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-right transition-all"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant={
                          preset.difficulty === 'مبتدئ' ? 'default' :
                          preset.difficulty === 'متوسط' ? 'secondary' : 'destructive'
                        }>
                          {preset.difficulty}
                        </Badge>
                        <span className="text-white font-medium">{preset.name}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{preset.description}</p>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <Card className="bg-gray-800/80 border-gray-700 p-4 backdrop-blur-sm text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  كيفية الاستخدام
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="font-bold text-yellow-400 mb-2">➕ إضافة مكونات</h4>
                    <p className="text-gray-300">انقر على أي مكون من القائمة اليسرى لإضافته</p>
                  </div>

                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="font-bold text-blue-400 mb-2">🔌 رسم الأسلاك</h4>
                    <p className="text-gray-300">انقر على الطرف (+) أو (-) ثم انقر على طرف آخر</p>
                  </div>

                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="font-bold text-green-400 mb-2">🔘 تشغيل المفتاح</h4>
                    <p className="text-gray-300">اختر المفتاح ثم اضغط زر "مغلق/مفتوح" لتبديل حالته</p>
                  </div>

                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="font-bold text-purple-400 mb-2">⚡ قوانين أوم</h4>
                    <p className="text-gray-300">V = I × R</p>
                    <p className="text-gray-300">P = V × I</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
