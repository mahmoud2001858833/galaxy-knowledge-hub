import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Trash2,
  RotateCw,
  Zap,
  Info,
  ArrowLeft,
  Power,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import CircuitCanvas, { CircuitComponent, Wire } from '@/components/circuit/CircuitCanvas';
import { solveCircuit } from '@/utils/circuitSolver';
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
  voltmeter: { icon: '📊', name: 'فولتميتر', color: '#EC4899', defaultValue: 0, unit: 'V' },
};

interface CircuitPreset {
  id: string;
  name: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  description: string;
  components: CircuitComponent[];
  wires: Wire[];
}

// Preset circuits - 10 complete, wired, physically accurate examples from beginner to advanced
const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'simple-light',
    name: '💡 مصباح بسيط',
    difficulty: 'مبتدئ',
    description: 'دائرة بسيطة مع بطارية ومصباح',
    components: [
      { id: 'bat1', type: 'battery', x: 140, y: 260, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 470, y: 154, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'bulb1', endTerminal: 'positive', points: [{ x: 200, y: 260 }, { x: 200, y: 170 }] },
      { id: 'w2', startComponentId: 'bulb1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 580, y: 170 }, { x: 580, y: 370 }, { x: 80, y: 370 }, { x: 80, y: 260 }] },
    ],
  },
  {
    id: 'switch-circuit',
    name: '🔘 دائرة مفتاح',
    difficulty: 'مبتدئ',
    description: 'تحكم بالمصباح عبر المفتاح',
    components: [
      { id: 'bat1', type: 'battery', x: 120, y: 260, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 310, y: 160, rotation: 0, isOn: true, label: 'تحكم', connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 530, y: 144, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw1', endTerminal: 'positive', points: [{ x: 180, y: 260 }, { x: 180, y: 160 }] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative', endComponentId: 'bulb1', endTerminal: 'positive', points: [] },
      { id: 'w3', startComponentId: 'bulb1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 640, y: 160 }, { x: 640, y: 380 }, { x: 70, y: 380 }, { x: 70, y: 260 }] },
    ],
  },
  {
    id: 'led-resistor',
    name: '🔴 LED مع مقاومة',
    difficulty: 'مبتدئ',
    description: 'حماية LED بمقاومة 330Ω (تيار 20 mA)',
    components: [
      { id: 'bat1', type: 'battery', x: 120, y: 260, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 320, y: 160, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'led1', type: 'led', x: 530, y: 160, rotation: 0, isOn: false, color: '#ef4444', label: 'LED أحمر', connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'res1', endTerminal: 'positive', points: [{ x: 180, y: 260 }, { x: 180, y: 160 }] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'led1', endTerminal: 'positive', points: [] },
      { id: 'w3', startComponentId: 'led1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 630, y: 160 }, { x: 630, y: 380 }, { x: 70, y: 380 }, { x: 70, y: 260 }] },
    ],
  },
  {
    id: 'series-resistors',
    name: '📊 مقاومات توالي',
    difficulty: 'متوسط',
    description: 'ثلاث مقاومات على التوالي (600Ω) مع أميتر (20 mA)',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 280, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'amm1', type: 'ammeter', x: 220, y: 150, rotation: 0, value: 0, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 360, y: 150, rotation: 0, value: 100, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 500, y: 150, rotation: 0, value: 200, connections: { positive: null, negative: null } },
      { id: 'res3', type: 'resistor', x: 640, y: 150, rotation: 0, value: 300, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'amm1', endTerminal: 'positive', points: [{ x: 155, y: 280 }, { x: 155, y: 150 }] },
      { id: 'w2', startComponentId: 'amm1', startTerminal: 'negative', endComponentId: 'res1', endTerminal: 'positive', points: [] },
      { id: 'w3', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'res2', endTerminal: 'positive', points: [] },
      { id: 'w4', startComponentId: 'res2', startTerminal: 'negative', endComponentId: 'res3', endTerminal: 'positive', points: [] },
      { id: 'w5', startComponentId: 'res3', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 725, y: 150 }, { x: 725, y: 410 }, { x: 55, y: 410 }, { x: 55, y: 280 }] },
    ],
  },
  {
    id: 'motor-control',
    name: '⚙️ تحكم بمحرك',
    difficulty: 'متوسط',
    description: 'تشغيل وإيقاف محرك DC بمفتاح',
    components: [
      { id: 'bat1', type: 'battery', x: 120, y: 260, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 310, y: 160, rotation: 0, isOn: true, label: 'محرك', connections: { positive: null, negative: null } },
      { id: 'mot1', type: 'motor', x: 530, y: 160, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw1', endTerminal: 'positive', points: [{ x: 180, y: 260 }, { x: 180, y: 160 }] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative', endComponentId: 'mot1', endTerminal: 'positive', points: [] },
      { id: 'w3', startComponentId: 'mot1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 640, y: 160 }, { x: 640, y: 380 }, { x: 70, y: 380 }, { x: 70, y: 260 }] },
    ],
  },
  {
    id: 'capacitor-charge',
    name: '📦 شحن مكثف',
    difficulty: 'متوسط',
    description: 'شحن مكثف عبر مقاومة ومفتاح مع مراقبة نسبة الشحن',
    components: [
      { id: 'bat1', type: 'battery', x: 110, y: 260, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 250, y: 160, rotation: 0, isOn: true, label: 'شحن', connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 410, y: 160, rotation: 0, value: 2200, connections: { positive: null, negative: null } },
      { id: 'cap1', type: 'capacitor', x: 580, y: 160, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw1', endTerminal: 'positive', points: [{ x: 165, y: 260 }, { x: 165, y: 160 }] },
      { id: 'w2', startComponentId: 'sw1', startTerminal: 'negative', endComponentId: 'res1', endTerminal: 'positive', points: [] },
      { id: 'w3', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'cap1', endTerminal: 'positive', points: [] },
      { id: 'w4', startComponentId: 'cap1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 675, y: 160 }, { x: 675, y: 390 }, { x: 60, y: 390 }, { x: 60, y: 260 }] },
    ],
  },
  {
    id: 'voltage-divider',
    name: '📐 مجزئ الجهد',
    difficulty: 'متقدم',
    description: 'تقسيم جهد 12V بالتساوي بين مقاومتين (الفولتميتر يقرأ 6.00V)',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 270, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 290, y: 140, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 520, y: 140, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
      { id: 'volt1', type: 'voltmeter', x: 520, y: 310, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'w1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'res1', endTerminal: 'positive', points: [{ x: 160, y: 270 }, { x: 160, y: 140 }] },
      { id: 'w2', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'res2', endTerminal: 'positive', points: [] },
      { id: 'w3', startComponentId: 'res2', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 660, y: 140 }, { x: 660, y: 430 }, { x: 55, y: 430 }, { x: 55, y: 270 }] },
      { id: 'w4', startComponentId: 'res2', startTerminal: 'positive', endComponentId: 'volt1', endTerminal: 'positive', points: [{ x: 455, y: 140 }, { x: 455, y: 310 }] },
      { id: 'w5', startComponentId: 'volt1', startTerminal: 'negative', endComponentId: 'res2', endTerminal: 'negative', points: [{ x: 585, y: 310 }, { x: 585, y: 140 }] },
    ],
  },
  {
    id: 'traffic-light',
    name: '🚦 إشارة مرور',
    difficulty: 'متقدم',
    description: '3 أفرع متوازية مستقلة (أحمر / أصفر / أخضر) مع مفاتيح ومقاومات حماية',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 255, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 255, y: 100, rotation: 0, isOn: true, label: 'أحمر', connections: { positive: null, negative: null } },
      { id: 'sw2', type: 'switch', x: 255, y: 255, rotation: 0, isOn: false, label: 'أصفر', connections: { positive: null, negative: null } },
      { id: 'sw3', type: 'switch', x: 255, y: 410, rotation: 0, isOn: false, label: 'أخضر', connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 425, y: 100, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'res2', type: 'resistor', x: 425, y: 255, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'res3', type: 'resistor', x: 425, y: 410, rotation: 0, value: 330, connections: { positive: null, negative: null } },
      { id: 'led1', type: 'led', x: 590, y: 100, rotation: 0, isOn: false, color: '#ef4444', label: 'أحمر', connections: { positive: null, negative: null } },
      { id: 'led2', type: 'led', x: 590, y: 255, rotation: 0, isOn: false, color: '#facc15', label: 'أصفر', connections: { positive: null, negative: null } },
      { id: 'led3', type: 'led', x: 590, y: 410, rotation: 0, isOn: false, color: '#22c55e', label: 'أخضر', connections: { positive: null, negative: null } },
    ],
    wires: [
      // Positive bus from battery to each independent branch switch
      { id: 'tl-p1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw1', endTerminal: 'positive', points: [{ x: 175, y: 255 }, { x: 175, y: 100 }] },
      { id: 'tl-p2', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw2', endTerminal: 'positive', points: [] },
      { id: 'tl-p3', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw3', endTerminal: 'positive', points: [{ x: 175, y: 255 }, { x: 175, y: 410 }] },
      // Red branch
      { id: 'tl-1a', startComponentId: 'sw1', startTerminal: 'negative', endComponentId: 'res1', endTerminal: 'positive', points: [] },
      { id: 'tl-1b', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'led1', endTerminal: 'positive', points: [] },
      { id: 'tl-1c', startComponentId: 'led1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 700, y: 100 }, { x: 700, y: 482 }, { x: 48, y: 482 }, { x: 48, y: 255 }] },
      // Yellow branch
      { id: 'tl-2a', startComponentId: 'sw2', startTerminal: 'negative', endComponentId: 'res2', endTerminal: 'positive', points: [] },
      { id: 'tl-2b', startComponentId: 'res2', startTerminal: 'negative', endComponentId: 'led2', endTerminal: 'positive', points: [] },
      { id: 'tl-2c', startComponentId: 'led2', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 720, y: 255 }, { x: 720, y: 482 }, { x: 48, y: 482 }, { x: 48, y: 255 }] },
      // Green branch
      { id: 'tl-3a', startComponentId: 'sw3', startTerminal: 'negative', endComponentId: 'res3', endTerminal: 'positive', points: [] },
      { id: 'tl-3b', startComponentId: 'res3', startTerminal: 'negative', endComponentId: 'led3', endTerminal: 'positive', points: [] },
      { id: 'tl-3c', startComponentId: 'led3', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 680, y: 410 }, { x: 680, y: 482 }, { x: 48, y: 482 }, { x: 48, y: 255 }] },
    ],
  },
  {
    id: 'rc-timer',
    name: '⏱️ دائرة RC',
    difficulty: 'متقدم',
    description: 'مؤقت شحن RC حقيقي (τ = R × C = 10s) مع فولتميتر حي على المكثف',
    components: [
      { id: 'bat1', type: 'battery', x: 100, y: 260, rotation: 0, value: 9, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 240, y: 140, rotation: 0, isOn: true, label: 'شحن', connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 410, y: 140, rotation: 0, value: 10000, connections: { positive: null, negative: null } },
      { id: 'cap1', type: 'capacitor', x: 580, y: 140, rotation: 0, value: 1000, connections: { positive: null, negative: null } },
      { id: 'volt1', type: 'voltmeter', x: 580, y: 315, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'rc-1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw1', endTerminal: 'positive', points: [{ x: 160, y: 260 }, { x: 160, y: 140 }] },
      { id: 'rc-2', startComponentId: 'sw1', startTerminal: 'negative', endComponentId: 'res1', endTerminal: 'positive', points: [] },
      { id: 'rc-3', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'cap1', endTerminal: 'positive', points: [] },
      { id: 'rc-4', startComponentId: 'cap1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 710, y: 140 }, { x: 710, y: 440 }, { x: 55, y: 440 }, { x: 55, y: 260 }] },
      // Voltmeter probes across capacitor plates
      { id: 'rc-v1', startComponentId: 'cap1', startTerminal: 'positive', endComponentId: 'volt1', endTerminal: 'positive', points: [{ x: 510, y: 140 }, { x: 510, y: 315 }] },
      { id: 'rc-v2', startComponentId: 'volt1', startTerminal: 'negative', endComponentId: 'cap1', endTerminal: 'negative', points: [{ x: 650, y: 315 }, { x: 650, y: 140 }] },
    ],
  },
  {
    id: 'full-measurement',
    name: '📏 قياس كامل',
    difficulty: 'متقدم',
    description: 'أميتر توالي (37.5 mA) ومقاومة ومصباح وفولتميتر توازي (3.75 V)',
    components: [
      { id: 'bat1', type: 'battery', x: 95, y: 270, rotation: 0, value: 12, isOn: true, connections: { positive: null, negative: null } },
      { id: 'sw1', type: 'switch', x: 205, y: 140, rotation: 0, isOn: true, label: 'رئيسي', connections: { positive: null, negative: null } },
      { id: 'amm1', type: 'ammeter', x: 340, y: 140, rotation: 0, value: 0, connections: { positive: null, negative: null } },
      { id: 'res1', type: 'resistor', x: 480, y: 140, rotation: 0, value: 220, connections: { positive: null, negative: null } },
      { id: 'bulb1', type: 'bulb', x: 625, y: 124, rotation: 0, isOn: false, connections: { positive: null, negative: null } },
      { id: 'volt1', type: 'voltmeter', x: 625, y: 315, rotation: 0, value: 0, connections: { positive: null, negative: null } },
    ],
    wires: [
      { id: 'fm-1', startComponentId: 'bat1', startTerminal: 'positive', endComponentId: 'sw1', endTerminal: 'positive', points: [{ x: 148, y: 270 }, { x: 148, y: 140 }] },
      { id: 'fm-2', startComponentId: 'sw1', startTerminal: 'negative', endComponentId: 'amm1', endTerminal: 'positive', points: [] },
      { id: 'fm-3', startComponentId: 'amm1', startTerminal: 'negative', endComponentId: 'res1', endTerminal: 'positive', points: [] },
      { id: 'fm-4', startComponentId: 'res1', startTerminal: 'negative', endComponentId: 'bulb1', endTerminal: 'positive', points: [] },
      { id: 'fm-5', startComponentId: 'bulb1', startTerminal: 'negative', endComponentId: 'bat1', endTerminal: 'negative', points: [{ x: 725, y: 140 }, { x: 725, y: 445 }, { x: 52, y: 445 }, { x: 52, y: 270 }] },
      // Voltmeter probes in parallel directly across bulb1
      { id: 'fm-v1', startComponentId: 'bulb1', startTerminal: 'positive', endComponentId: 'volt1', endTerminal: 'positive', points: [{ x: 560, y: 140 }, { x: 560, y: 315 }] },
      { id: 'fm-v2', startComponentId: 'volt1', startTerminal: 'negative', endComponentId: 'bulb1', endTerminal: 'negative', points: [{ x: 690, y: 315 }, { x: 690, y: 140 }] },
    ],
  },
];

export default function CircuitBuilderAdvanced() {
  const navigate = useNavigate();
  const [components, setComponents] = useState<CircuitComponent[]>(() =>
    CIRCUIT_PRESETS[0].components.map((c) => ({ ...c, connections: { ...c.connections } })),
  );
  const [wires, setWires] = useState<Wire[]>(() =>
    CIRCUIT_PRESETS[0].wires.map((w) => ({ ...w, points: [...w.points] })),
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(CIRCUIT_PRESETS[0].id);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [measurements, setMeasurements] = useState({ voltage: 0, current: 0, power: 0 });
  const [isShortCircuit, setIsShortCircuit] = useState(false);
  const [rcElapsedSec, setRcElapsedSec] = useState(0);

  // Wire drawing state
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState<{ componentId: string; terminal: 'positive' | 'negative' } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  // Refs for clean transient RC stepping without stale closures
  const componentsRef = useRef<CircuitComponent[]>(components);
  componentsRef.current = components;
  const wiresRef = useRef<Wire[]>(wires);
  wiresRef.current = wires;
  const capacitorVoltagesRef = useRef<Record<string, number>>({});

  // Apply one MNA circuit solve step (dt in seconds)
  const applyCircuitStep = useCallback((dt: number, advanceTime: boolean) => {
    const curComponents = componentsRef.current;
    const curWires = wiresRef.current;

    const solution = solveCircuit(curComponents, curWires, capacitorVoltagesRef.current, dt);
    capacitorVoltagesRef.current = solution.capacitorVoltages;

    setMeasurements({
      voltage: solution.totalVoltage,
      current: solution.totalCurrent,
      power: solution.totalPower,
    });
    setIsShortCircuit(solution.isShortCircuit);

    if (advanceTime && solution.hasActiveCapacitor) {
      setRcElapsedSec((prev) => prev + dt);
    }

    setWires((prev) =>
      prev.map((w) => ({
        ...w,
        current: solution.wireCurrents[w.id] ?? 0,
      })),
    );

    setComponents((prev) =>
      prev.map((c) => {
        const res = solution.componentResults[c.id];
        if (!res) return c;

        if (c.type === 'bulb' || c.type === 'led' || c.type === 'motor') {
          return {
            ...c,
            isOn: res.isActive,
            voltageAcross: res.voltage,
            currentThrough: res.current,
          };
        }
        if (c.type === 'ammeter') {
          return {
            ...c,
            value: res.displayValue ?? 0,
            currentThrough: res.current,
            voltageAcross: res.voltage,
          };
        }
        if (c.type === 'voltmeter') {
          return {
            ...c,
            value: res.displayValue ?? 0,
            voltageAcross: res.voltage,
            currentThrough: res.current,
          };
        }
        if (c.type === 'capacitor') {
          return {
            ...c,
            voltageAcross: res.voltage,
            currentThrough: res.current,
            chargePercent: res.chargePercent ?? 0,
          };
        }
        return {
          ...c,
          voltageAcross: res.voltage,
          currentThrough: res.current,
        };
      }),
    );
  }, []);

  // Re-solve immediately whenever topology, switches, or component values change during active simulation
  const topologySignature = useMemo(() => {
    const compSig = components
      .map((c) => {
        const keyVal = c.type === 'ammeter' || c.type === 'voltmeter' ? '' : String(c.value ?? '');
        const keySw = c.type === 'switch' ? String(Boolean(c.isOn)) : '';
        return `${c.id}:${c.type}:${keyVal}:${keySw}`;
      })
      .join('|');
    const wireSig = wires
      .map((w) => `${w.id}:${w.startComponentId}.${w.startTerminal}-${w.endComponentId}.${w.endTerminal}`)
      .join('|');
    return `${compSig}#${wireSig}`;
  }, [components, wires]);

  const hasCapacitor = useMemo(() => components.some((c) => c.type === 'capacitor'), [components]);

  useEffect(() => {
    if (!isSimulating) return;
    // Instant solve for DC circuits or first tick for RC circuits
    applyCircuitStep(0.05, false);
  }, [isSimulating, topologySignature, applyCircuitStep]);

  // Continuous real-time RC transient solver loop whenever a capacitor is in the circuit
  useEffect(() => {
    if (!isSimulating || !hasCapacitor) return;
    const STEP_MS = 50;
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        applyCircuitStep(STEP_MS / 1000, true);
      }
    }, STEP_MS);

    return () => window.clearInterval(interval);
  }, [isSimulating, hasCapacitor, applyCircuitStep]);

  // Add component to canvas
  const handleAddComponent = useCallback((type: string) => {
    const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
    const newComponent: CircuitComponent = {
      id: uuidv4(),
      type,
      x: 360 + Math.round((Math.random() - 0.5) * 100),
      y: 240 + Math.round((Math.random() - 0.5) * 100),
      rotation: 0,
      value: config.defaultValue,
      isOn: type === 'battery' || type === 'switch',
      color: type === 'led' ? '#22c55e' : undefined,
      connections: { positive: null, negative: null },
    };
    setActivePresetId(null);
    setComponents((prev) => [...prev, newComponent]);
  }, []);

  // Move component
  const handleComponentMove = useCallback((id: string, x: number, y: number) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)));
  }, []);

  // Select component
  const handleComponentSelect = useCallback((id: string | null) => {
    setSelectedComponent(id);
  }, []);

  // Handle terminal click for wire drawing
  const handleTerminalClick = useCallback(
    (componentId: string, terminal: 'positive' | 'negative') => {
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
            current: 0,
          };
          setWires((prev) => [...prev, newWire]);
        }
        setIsDrawingWire(false);
        setWireStart(null);
        setCurrentMousePos(null);
      }
    },
    [isDrawingWire, wireStart],
  );

  // Handle canvas click (cancel wire drawing if user clicks empty space)
  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (isDrawingWire) {
        setIsDrawingWire(false);
        setWireStart(null);
        setCurrentMousePos(null);
      } else {
        setCurrentMousePos({ x, y });
      }
    },
    [isDrawingWire],
  );

  const handleCanvasMouseMove = useCallback(
    (x: number, y: number) => {
      if (isDrawingWire) {
        setCurrentMousePos({ x, y });
      }
    },
    [isDrawingWire],
  );

  // Toggle switch (works both before and live during simulation!)
  const toggleSwitch = useCallback((id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id && c.type === 'switch' ? { ...c, isOn: !c.isOn } : c)),
    );
  }, []);

  // Delete selected component
  const deleteSelected = useCallback(() => {
    if (selectedComponent) {
      setWires((prev) =>
        prev.filter((w) => w.startComponentId !== selectedComponent && w.endComponentId !== selectedComponent),
      );
      setComponents((prev) => prev.filter((c) => c.id !== selectedComponent));
      delete capacitorVoltagesRef.current[selectedComponent];
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  // Rotate selected component
  const rotateSelected = useCallback(() => {
    if (selectedComponent) {
      setComponents((prev) =>
        prev.map((c) => (c.id === selectedComponent ? { ...c, rotation: (c.rotation + 90) % 360 } : c)),
      );
    }
  }, [selectedComponent]);

  // Change component value
  const changeComponentValue = useCallback((id: string, value: number) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, value } : c)));
  }, []);

  // Discharge all capacitors cleanly (restarts RC curve from 0V)
  const dischargeCapacitors = useCallback(() => {
    capacitorVoltagesRef.current = {};
    setRcElapsedSec(0);
    setComponents((prev) =>
      prev.map((c) =>
        c.type === 'capacitor'
          ? { ...c, chargePercent: 0, voltageAcross: 0, currentThrough: 0 }
          : c.type === 'voltmeter'
            ? { ...c, value: 0 }
            : c,
      ),
    );
    if (isSimulating) {
      window.setTimeout(() => applyCircuitStep(0.05, false), 0);
    }
  }, [isSimulating, applyCircuitStep]);

  // Run simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
  }, []);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    capacitorVoltagesRef.current = {};
    setRcElapsedSec(0);
    setIsShortCircuit(false);
    setMeasurements({ voltage: 0, current: 0, power: 0 });
    setComponents((prev) =>
      prev.map((c) => {
        if (['bulb', 'led', 'motor'].includes(c.type)) {
          return { ...c, isOn: false, voltageAcross: 0, currentThrough: 0 };
        }
        if (['ammeter', 'voltmeter'].includes(c.type)) {
          return { ...c, value: 0, voltageAcross: 0, currentThrough: 0 };
        }
        if (c.type === 'capacitor') {
          return { ...c, chargePercent: 0, voltageAcross: 0, currentThrough: 0 };
        }
        return { ...c, voltageAcross: 0, currentThrough: 0 };
      }),
    );
    setWires((prev) => prev.map((w) => ({ ...w, current: 0 })));
  }, []);

  // Load preset & immediately activate live simulation so measurements work right away
  const loadPreset = useCallback((presetId: string) => {
    const preset = CIRCUIT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    capacitorVoltagesRef.current = {};
    setRcElapsedSec(0);
    setIsShortCircuit(false);
    setIsDrawingWire(false);
    setWireStart(null);
    setSelectedComponent(null);
    setActivePresetId(preset.id);

    const clonedComponents = preset.components.map((c) => ({
      ...c,
      connections: { ...c.connections },
    }));
    const clonedWires = preset.wires.map((w) => ({
      ...w,
      points: w.points.map((pt) => ({ ...pt })),
      current: 0,
    }));

    componentsRef.current = clonedComponents;
    wiresRef.current = clonedWires;
    setComponents(clonedComponents);
    setWires(clonedWires);
    setIsSimulating(true);
  }, []);

  // Clear circuit
  const clearCircuit = useCallback(() => {
    capacitorVoltagesRef.current = {};
    setRcElapsedSec(0);
    setIsShortCircuit(false);
    setComponents([]);
    setWires([]);
    setActivePresetId(null);
    setIsSimulating(false);
    setSelectedComponent(null);
    setMeasurements({ voltage: 0, current: 0, power: 0 });
  }, []);

  // Compute RC time constant info when resistors + capacitors exist
  const rcStats = useMemo(() => {
    const cap = components.find((c) => c.type === 'capacitor');
    if (!cap) return null;
    const totalR = components
      .filter((c) => c.type === 'resistor')
      .reduce((sum, r) => sum + (r.value || 0), 0);
    const capF = (cap.value || 100) * 1e-6;
    const tau = totalR > 0 ? totalR * capF : 0;
    return {
      tau,
      voltage: Math.abs(cap.voltageAcross ?? 0),
      chargePercent: cap.chargePercent ?? 0,
    };
  }, [components]);

  const selectedComp = components.find((c) => c.id === selectedComponent);
  const selectedConfig = selectedComp
    ? COMPONENT_TYPES[selectedComp.type as keyof typeof COMPONENT_TYPES]
    : null;
  const switchesList = components.filter((c) => c.type === 'switch');

  return (
    <div
      data-preserve-dark
      className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 text-white"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            style={{ color: '#f8fafc', backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-400" />
            معمل بناء الدوائر الكهربائية المتقدم
          </h1>
        </div>

        {/* High-contrast Measurements Display (safe in Light & Dark modes) */}
        <div className="flex flex-wrap gap-2">
          <Badge
            className="text-sm sm:text-base px-3.5 py-1.5 font-mono font-bold border-0"
            style={{ backgroundColor: '#15803d', color: '#ffffff' }}
          >
            الجهد: {measurements.voltage.toFixed(2)} V
          </Badge>
          <Badge
            className="text-sm sm:text-base px-3.5 py-1.5 font-mono font-bold border-0"
            style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}
          >
            التيار: {(measurements.current * 1000).toFixed(2)} mA
          </Badge>
          <Badge
            className="text-sm sm:text-base px-3.5 py-1.5 font-mono font-bold border-0"
            style={{ backgroundColor: '#6d28d9', color: '#ffffff' }}
          >
            القدرة: {(measurements.power * 1000).toFixed(1)} mW
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Component Palette */}
        <div className="lg:col-span-2">
          <Card
            className="border-slate-700 p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.88)', color: '#f8fafc' }}
          >
            <h3 className="text-white font-bold mb-4 text-center">🔧 المكونات</h3>

            {[
              { label: 'مصادر الطاقة', types: ['battery'] },
              { label: 'التحكم', types: ['switch'] },
              { label: 'مكونات سلبية', types: ['resistor', 'capacitor'] },
              { label: 'المخرجات', types: ['led', 'bulb', 'motor'] },
              { label: 'أجهزة القياس', types: ['ammeter', 'voltmeter'] },
            ].map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <p className="text-slate-300 text-xs mb-2">{group.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.types.map((type) => {
                    const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES];
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAddComponent(type)}
                        className="p-2.5 rounded-lg border border-slate-600 hover:border-sky-400 transition-colors"
                        style={{ backgroundColor: 'rgba(51, 65, 85, 0.72)' }}
                      >
                        <div className="text-xl mb-1">{config.icon}</div>
                        <p className="text-white text-xs font-medium">{config.name}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-7">
          <Card
            className="border-slate-700 p-4 backdrop-blur-sm h-full"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.88)', color: '#f8fafc' }}
          >
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {isSimulating ? (
                  <Button
                    onClick={stopSimulation}
                    className="gap-2 font-bold border-0"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                  >
                    <Pause className="w-4 h-4" />
                    إيقاف
                  </Button>
                ) : (
                  <Button
                    onClick={runSimulation}
                    className="gap-2 font-bold border-0"
                    style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                  >
                    <Play className="w-4 h-4" />
                    تشغيل
                  </Button>
                )}

                {hasCapacitor && (
                  <Button
                    variant="outline"
                    onClick={dischargeCapacitors}
                    className="gap-1.5 border-cyan-500/60"
                    style={{ backgroundColor: 'rgba(8, 145, 178, 0.25)', color: '#67e8f9' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    تفريغ المكثف
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={rotateSelected}
                  disabled={!selectedComponent}
                  className="gap-1.5 border-slate-600"
                  style={{ backgroundColor: 'rgba(51, 65, 85, 0.7)', color: '#f8fafc' }}
                >
                  <RotateCw className="w-4 h-4" />
                  تدوير
                </Button>

                <Button
                  variant="outline"
                  onClick={deleteSelected}
                  disabled={!selectedComponent}
                  className="gap-1.5 border-red-500/40"
                  style={{ backgroundColor: 'rgba(127, 29, 29, 0.35)', color: '#fca5a5' }}
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </Button>

                <Button
                  variant="outline"
                  onClick={clearCircuit}
                  className="gap-1.5 border-slate-600"
                  style={{ backgroundColor: 'rgba(51, 65, 85, 0.7)', color: '#f8fafc' }}
                >
                  مسح الكل
                </Button>
              </div>

              {/* Quick Switch Controls - Always Visible with Arabic Branch Labels */}
              {switchesList.length > 0 && (
                <div
                  className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-1.5 border border-slate-600"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
                >
                  <Power className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-xs font-semibold">المفاتيح:</span>
                  {switchesList.map((sw, idx) => (
                    <Button
                      key={sw.id}
                      size="sm"
                      onClick={() => toggleSwitch(sw.id)}
                      className="gap-1 h-7 px-2.5 text-xs font-bold border-0"
                      style={{
                        backgroundColor: sw.isOn ? '#16a34a' : '#dc2626',
                        color: '#ffffff',
                      }}
                    >
                      {sw.isOn ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {sw.label || idx + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Short-circuit warning banner */}
            {isShortCircuit && isSimulating && (
              <div
                className="mb-3 px-3 py-2 rounded-lg border border-red-500 flex items-center gap-2 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(153, 27, 27, 0.45)', color: '#fecaca' }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                تحذير: تم رصد قصر كهربائي (Short Circuit) في الدائرة — أضف مقاومة لحماية البطارية!
              </div>
            )}

            {/* Live RC Timer telemetry bar */}
            {rcStats && (
              <div
                className="mb-3 px-3 py-2 rounded-lg border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm"
                style={{ backgroundColor: 'rgba(8, 51, 68, 0.55)', color: '#cffafe' }}
              >
                <span className="font-semibold">
                  ⏱️ ثابت الزمن τ = R×C:{' '}
                  <span className="font-mono text-cyan-300 font-bold">{rcStats.tau.toFixed(1)} s</span>
                </span>
                <span>
                  الزمن المنقضي:{' '}
                  <span className="font-mono text-yellow-300 font-bold">{rcElapsedSec.toFixed(1)} s</span>
                </span>
                <span>
                  شحن المكثف:{' '}
                  <span className="font-mono text-emerald-300 font-bold">
                    {rcStats.voltage.toFixed(2)} V ({Math.round(rcStats.chargePercent)}%)
                  </span>
                </span>
              </div>
            )}

            {/* Interactive Circuit Canvas */}
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
              onCanvasMouseMove={handleCanvasMouseMove}
              onSwitchToggle={toggleSwitch}
              isSimulating={isSimulating}
              measurements={measurements}
            />

            {/* Wire drawing indicator */}
            {isDrawingWire && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center"
              >
                <Badge
                  className="animate-pulse font-bold"
                  style={{ backgroundColor: '#eab308', color: '#0f172a' }}
                >
                  🔌 انقر على طرف مكوّن آخر لإكمال السلك (أو انقر على المساحة الفارغة للإلغاء)
                </Badge>
              </motion.div>
            )}

            {/* Selected Component Properties */}
            {selectedComp && selectedConfig && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-lg border border-slate-600"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    {selectedConfig.icon} خصائص {selectedConfig.name}
                    {selectedComp.label ? ` (${selectedComp.label})` : ''}
                  </h4>
                  {isSimulating && (
                    <div className="flex gap-3 text-xs font-mono">
                      <span className="text-emerald-400">
                        V = {Math.abs(selectedComp.voltageAcross ?? 0).toFixed(2)} V
                      </span>
                      <span className="text-sky-400">
                        I = {(Math.abs(selectedComp.currentThrough ?? 0) * 1000).toFixed(2)} mA
                      </span>
                    </div>
                  )}
                </div>

                {/* Switch Toggle Control */}
                {selectedComp.type === 'switch' && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-300 text-sm">حالة المفتاح (أو انقر نقراً مزدوجاً عليه):</span>
                    <Button
                      onClick={() => toggleSwitch(selectedComp.id)}
                      className="gap-2 font-bold border-0"
                      style={{
                        backgroundColor: selectedComp.isOn ? '#16a34a' : '#dc2626',
                        color: '#ffffff',
                      }}
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

                {/* Value control for battery / resistor / capacitor */}
                {['battery', 'resistor', 'capacitor'].includes(selectedComp.type) && (
                  <div>
                    <div className="flex justify-between text-sm text-slate-300 mb-2">
                      <span>القيمة:</span>
                      <span className="font-mono font-bold text-yellow-300">
                        {selectedComp.value} {selectedConfig.unit}
                      </span>
                    </div>
                    <Slider
                      value={[selectedComp.value || 0]}
                      onValueChange={([v]) => changeComponentValue(selectedComp.id, v)}
                      min={selectedComp.type === 'battery' ? 1 : 10}
                      max={selectedComp.type === 'battery' ? 24 : 10000}
                      step={selectedComp.type === 'battery' ? 0.5 : 10}
                    />
                  </div>
                )}

                {/* Live reading for meters */}
                {['ammeter', 'voltmeter'].includes(selectedComp.type) && (
                  <div className="text-2xl font-bold font-mono text-center text-emerald-400 pt-1">
                    {selectedComp.type === 'ammeter'
                      ? `${(selectedComp.value || 0).toFixed(2)} mA`
                      : `${(selectedComp.value || 0).toFixed(2)} V`}
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Right Panel - Presets & Guide */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="presets" className="h-full">
            <TabsList
              className="grid w-full grid-cols-2 border border-slate-700"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
            >
              <TabsTrigger value="presets" className="text-slate-100 data-[state=active]:bg-sky-600 data-[state=active]:text-white">
                الأمثلة (10)
              </TabsTrigger>
              <TabsTrigger value="info" className="text-slate-100 data-[state=active]:bg-sky-600 data-[state=active]:text-white">
                المعلومات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-3">
              <Card
                className="border-slate-700 p-3.5 backdrop-blur-sm max-h-[640px] overflow-y-auto"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.88)', color: '#f8fafc' }}
              >
                <h3 className="text-white font-bold mb-3">🔧 دوائر جاهزة (10)</h3>

                <div className="space-y-2.5">
                  {CIRCUIT_PRESETS.map((preset) => {
                    const isActive = activePresetId === preset.id;
                    const badgeStyle =
                      preset.difficulty === 'مبتدئ'
                        ? { backgroundColor: '#16a34a', color: '#ffffff' }
                        : preset.difficulty === 'متوسط'
                          ? { backgroundColor: '#0284c7', color: '#ffffff' }
                          : { backgroundColor: '#dc2626', color: '#ffffff' };

                    return (
                      <motion.button
                        key={preset.id}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => loadPreset(preset.id)}
                        className="w-full p-3 rounded-lg border text-right transition-all"
                        style={{
                          backgroundColor: isActive ? 'rgba(14, 116, 144, 0.42)' : 'rgba(51, 65, 85, 0.62)',
                          borderColor: isActive ? '#38bdf8' : 'rgba(100, 116, 139, 0.6)',
                        }}
                      >
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <Badge className="border-0 text-[11px] font-bold" style={badgeStyle}>
                            {preset.difficulty}
                          </Badge>
                          <span className="text-white font-semibold text-sm">{preset.name}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{preset.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-3">
              <Card
                className="border-slate-700 p-4 backdrop-blur-sm text-white"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.88)' }}
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-sky-400" />
                  كيفية الاستخدام
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(51, 65, 85, 0.65)' }}>
                    <h4 className="font-bold text-yellow-400 mb-1">➕ إضافة مكونات</h4>
                    <p className="text-slate-200 text-xs">انقر على أي مكون من القائمة لإضافته ثم اسحبه على اللوحة.</p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(51, 65, 85, 0.65)' }}>
                    <h4 className="font-bold text-sky-400 mb-1">🔌 رسم الأسلاك</h4>
                    <p className="text-slate-200 text-xs">انقر على الطرف الأحمر (+) أو الأزرق (-) ثم انقر على طرف مكوّن آخر.</p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(51, 65, 85, 0.65)' }}>
                    <h4 className="font-bold text-emerald-400 mb-1">🔘 تشغيل المفاتيح</h4>
                    <p className="text-slate-200 text-xs">استخدم أزرار «المفاتيح» أعلى اللوحة أو انقر نقراً مزدوجاً على أي مفتاح لتبديل حالته فوراً.</p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(51, 65, 85, 0.65)' }}>
                    <h4 className="font-bold text-purple-400 mb-1">⚡ القوانين المعتمدة في المحرك</h4>
                    <p className="text-slate-200 text-xs font-mono">V = I × R &nbsp;|&nbsp; P = V × I</p>
                    <p className="text-slate-200 text-xs font-mono mt-1">V_C(t) = V₀(1 − e^(−t / RC))</p>
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
