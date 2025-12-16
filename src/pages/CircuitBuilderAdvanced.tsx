import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, Trash2, RotateCw, Save, 
  Download, Upload, Zap, Settings, Info
} from 'lucide-react';
import CircuitCanvas, { CircuitComponent, Wire } from '@/components/circuit/CircuitCanvas';
import ComponentPalette from '@/components/circuit/ComponentPalette';
import { v4 as uuidv4 } from 'uuid';

// Preset circuits
const CIRCUIT_PRESETS = [
  {
    id: 'simple-light',
    name: 'مصباح بسيط',
    difficulty: 'مبتدئ',
    components: [
      { id: 'bat1', type: 'battery', x: 150, y: 300, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 400, y: 300, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'bulb1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'bulb1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'switch-circuit',
    name: 'دائرة مفتاح',
    difficulty: 'مبتدئ',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 300, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 250, y: 300, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 400, y: 300, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'sw1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative' as const, endComponentId: 'bulb1', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'bulb1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'led-resistor',
    name: 'LED مع مقاومة',
    difficulty: 'متوسط',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 300, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 250, y: 300, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'led1', type: 'led', x: 400, y: 300, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'res1', endTerminal: 'positive' as const, points: [] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative' as const, endComponentId: 'led1', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'led1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [] },
    ]
  },
  {
    id: 'series-resistors',
    name: 'مقاومات على التوالي',
    difficulty: 'متوسط',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 300, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 250, y: 200, rotation: 0, value: 100, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 400, y: 200, rotation: 0, value: 200, connections: { positive: null, negative: null } },
      { id: 'res3', type: 'resistor', x: 550, y: 200, rotation: 0, value: 300, connections: { positive: null, negative: null } },
      { id: 'amm1', type: 'ammeter', x: 400, y: 400, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'res1', endTerminal: 'positive' as const, points: [{ x: 100, y: 200 }] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative' as const, endComponentId: 'res2', endTerminal: 'positive' as const, points: [] },
      { id: 'w3', startComponentId: 'res2', startTerminal: 'negative' as const, endComponentId: 'res3', endTerminal: 'positive' as const, points: [] },
      { id: 'w4', startComponentId: 'res3', startTerminal: 'negative' as const, endComponentId: 'amm1', endTerminal: 'positive' as const, points: [{ x: 550, y: 400 }] },
      { id: 'w5', startComponentId: 'amm1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [{ x: 100, y: 400 }] },
    ]
  },
  {
    id: 'motor-control',
    name: 'التحكم بمحرك',
    difficulty: 'متقدم',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 300, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 250, y: 200, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'mot1', type: 'motor', x: 400, y: 300, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'amm1', type: 'ammeter', x: 550, y: 300, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive' as const, endComponentId: 'sw1', endTerminal: 'positive' as const, points: [{ x: 100, y: 200 }] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative' as const, endComponentId: 'mot1', endTerminal: 'positive' as const, points: [{ x: 400, y: 200 }] },
      { id: 'w3', startComponentId: 'mot1', startTerminal: 'negative' as const, endComponentId: 'amm1', endTerminal: 'positive' as const, points: [] },
      { id: 'w4', startComponentId: 'amm1', startTerminal: 'negative' as const, endComponentId: 'bat1', endTerminal: 'negative' as const, points: [{ x: 550, y: 400 }, { x: 100, y: 400 }] },
    ]
  }
];

export default function CircuitBuilderAdvanced() {
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
    const newComponent: CircuitComponent = {
      id: uuidv4(),
      type,
      x: 400 + Math.random() * 100 - 50,
      y: 300 + Math.random() * 100 - 50,
      rotation: 0,
      value: type === 'battery' ? 9 : type === 'resistor' ? 100 : type === 'capacitor' ? 100 : undefined,
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
      // Start drawing wire
      setIsDrawingWire(true);
      setWireStart({ componentId, terminal });
    } else if (wireStart) {
      // Finish drawing wire
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

  // Handle canvas click (for adding wire points or canceling)
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (isDrawingWire) {
      setCurrentMousePos({ x, y });
    }
  }, [isDrawingWire]);

  // Toggle switch
  const toggleSwitch = useCallback((id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id && c.type === 'switch' ? { ...c, isOn: !c.isOn } : c
    ));
  }, []);

  // Delete selected component
  const deleteSelected = useCallback(() => {
    if (selectedComponent) {
      // Remove wires connected to this component
      setWires(prev => prev.filter(w => 
        w.startComponentId !== selectedComponent && w.endComponentId !== selectedComponent
      ));
      // Remove component
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

  // Run simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    
    // Simple circuit analysis
    const battery = components.find(c => c.type === 'battery');
    if (!battery) {
      setMeasurements({ voltage: 0, current: 0, power: 0 });
      return;
    }

    // Check if circuit is closed (all switches on)
    const switches = components.filter(c => c.type === 'switch');
    const allSwitchesOn = switches.every(s => s.isOn);
    
    if (!allSwitchesOn || wires.length < 2) {
      setMeasurements({ voltage: battery.value || 0, current: 0, power: 0 });
      
      // Turn off all lights
      setComponents(prev => prev.map(c => 
        ['bulb', 'led', 'motor'].includes(c.type) ? { ...c, isOn: false } : c
      ));
      return;
    }

    // Calculate total resistance
    const resistors = components.filter(c => c.type === 'resistor');
    const totalResistance = resistors.reduce((sum, r) => sum + (r.value || 100), 0) || 10;
    
    const voltage = battery.value || 9;
    const current = voltage / totalResistance;
    const power = voltage * current;

    setMeasurements({ voltage, current, power });

    // Update wire currents
    setWires(prev => prev.map(w => ({ ...w, current })));

    // Turn on lights and motors
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
    
    // Turn off all
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-400" />
          معمل بناء الدوائر الكهربائية المتقدم
        </h1>
        <p className="text-gray-400">اسحب المكونات وارسم الأسلاك لبناء دوائر كهربائية</p>
      </motion.div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Component Palette */}
        <div className="col-span-2">
          <ComponentPalette onAddComponent={handleAddComponent} />
        </div>

        {/* Main Canvas */}
        <div className="col-span-7">
          <Card className="bg-gray-800/50 border-gray-700 p-4 h-full">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
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
                
                <Button 
                  variant="outline" 
                  onClick={rotateSelected}
                  disabled={!selectedComponent}
                  className="gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  تدوير
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={deleteSelected}
                  disabled={!selectedComponent}
                  className="gap-2 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCircuit} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  مسح الكل
                </Button>
              </div>
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-500 text-black animate-pulse">
                  🔌 انقر على طرف آخر لإكمال السلك أو ESC للإلغاء
                </Badge>
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel - Presets & Info */}
        <div className="col-span-3">
          <Tabs defaultValue="presets" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">الأمثلة</TabsTrigger>
              <TabsTrigger value="info">المعلومات</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-4">
              <Card className="bg-gray-900/90 border-gray-700 p-4">
                <h3 className="text-white font-bold mb-4">🔧 دوائر جاهزة</h3>
                
                <div className="space-y-3">
                  {CIRCUIT_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadPreset(preset.id)}
                      className="w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-right transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <Badge variant={
                          preset.difficulty === 'مبتدئ' ? 'default' :
                          preset.difficulty === 'متوسط' ? 'secondary' : 'destructive'
                        }>
                          {preset.difficulty}
                        </Badge>
                        <span className="text-white font-medium">{preset.name}</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {preset.components.length} مكونات • {preset.wires.length} أسلاك
                      </p>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <Card className="bg-gray-900/90 border-gray-700 p-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  قوانين الكهرباء
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-yellow-400 font-semibold mb-1">قانون أوم</h4>
                    <p className="text-gray-300">V = I × R</p>
                    <p className="text-gray-400 text-xs">الجهد = التيار × المقاومة</p>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-1">القدرة الكهربائية</h4>
                    <p className="text-gray-300">P = V × I</p>
                    <p className="text-gray-400 text-xs">القدرة = الجهد × التيار</p>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-blue-400 font-semibold mb-1">مقاومات التوالي</h4>
                    <p className="text-gray-300">Rt = R1 + R2 + R3</p>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-1">مقاومات التوازي</h4>
                    <p className="text-gray-300">1/Rt = 1/R1 + 1/R2</p>
                  </div>
                </div>

                {/* Current measurements */}
                {isSimulating && (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-2">📊 القياسات الحالية</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">الجهد:</span>
                        <span className="text-white">{measurements.voltage.toFixed(2)} V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">التيار:</span>
                        <span className="text-white">{(measurements.current * 1000).toFixed(2)} mA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">القدرة:</span>
                        <span className="text-white">{(measurements.power * 1000).toFixed(2)} mW</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
