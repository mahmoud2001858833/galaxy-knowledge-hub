import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, Zap, Play, Square, RotateCcw, AlertTriangle, Settings, Trash2, RotateCw, Plug, Download, Info, Box, Layers, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedCircuit, ComponentType, COMPONENT_DEFINITIONS, CIRCUIT_PRESETS } from '@/hooks/useAdvancedCircuit';
import StarField from '@/components/StarField';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

const COMPONENT_CATEGORIES = [
  { id: 'basic', name: 'أساسية', icon: '⚡' },
  { id: 'measurement', name: 'قياس', icon: '📏' },
  { id: 'storage', name: 'تخزين', icon: '🔋' },
  { id: 'advanced', name: 'متقدمة', icon: '🔬' },
  { id: 'input', name: 'إدخال', icon: '🎛️' },
  { id: 'output', name: 'إخراج', icon: '💡' },
];

// 3D Electronic Breadboard Workbench Scene
const ElectronicWorkbench3D: React.FC<{
  components: any[];
  wires: any[];
  isSimulating: boolean;
  totalCurrent: number;
  totalVoltage: number;
  shortCircuit: boolean;
}> = ({ components, wires, isSimulating, totalCurrent, totalVoltage, shortCircuit }) => {
  const electronGroupRef = useRef<THREE.Group>(null);

  // Animate 3D electron flow particles
  useFrame((state, delta) => {
    if (electronGroupRef.current && isSimulating && totalCurrent > 0) {
      electronGroupRef.current.children.forEach((child, i) => {
        child.position.y = 0.08 + Math.sin(state.clock.elapsedTime * 6 + i) * 0.02;
      });
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Wooden Lab Desk Surface */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[14, 0.4, 9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* PCB Breadboard Plate */}
      <mesh position={[0, -0.38, 0]} receiveShadow>
        <boxGeometry args={[11, 0.12, 6.5]} />
        <meshStandardMaterial color="#0f766e" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Gold Edge Connector Traces */}
      <mesh position={[0, -0.31, 3.2]}>
        <boxGeometry args={[10.5, 0.02, 0.1]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.31, -3.2]}>
        <boxGeometry args={[10.5, 0.02, 0.1]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Render 3D Components mapped from 2D Coordinates */}
      {components.map((comp) => {
        // Map [0, 800] -> [-4.5, 4.5], [0, 450] -> [-2.5, 2.5]
        const x3d = ((comp.x - 400) / 400) * 4.5;
        const z3d = ((comp.y - 225) / 225) * 2.5;

        return (
          <group key={comp.id} position={[x3d, -0.3, z3d]}>
            {/* Battery 3D Model */}
            {comp.type === 'battery' && (
              <group>
                <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.35, 0.35, 1.2, 24]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
                </mesh>
                {/* Gold positive terminal */}
                <mesh position={[0.65, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Silver negative terminal */}
                <mesh position={[-0.62, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
                </mesh>
                <Html position={[0, 1.1, 0]} center distanceFactor={12}>
                  <div className="bg-slate-900/90 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 whitespace-nowrap">
                    {comp.value}V
                  </div>
                </Html>
              </group>
            )}

            {/* Resistor 3D Model with Ceramic Bands */}
            {comp.type === 'resistor' && (
              <group>
                <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.22, 0.22, 1.1, 24]} />
                  <meshStandardMaterial color="#d4b483" roughness={0.5} />
                </mesh>
                {/* Color Bands */}
                {[-0.3, -0.1, 0.1, 0.35].map((bx, idx) => (
                  <mesh key={idx} position={[bx, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.23, 0.23, 0.08, 16]} />
                    <meshStandardMaterial
                      color={idx === 0 ? '#b91c1c' : idx === 1 ? '#000000' : idx === 2 ? '#ea580c' : '#fbbf24'}
                      roughness={0.3}
                    />
                  </mesh>
                ))}
                {/* Metal Leads */}
                <mesh position={[-0.7, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
                <mesh position={[0.7, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
                <Html position={[0, 0.8, 0]} center distanceFactor={12}>
                  <div className="bg-slate-900/90 text-yellow-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/50 whitespace-nowrap">
                    {comp.value}Ω
                  </div>
                </Html>
              </group>
            )}

            {/* Incandescent Lightbulb 3D Model */}
            {comp.type === 'bulb' && (
              <group>
                {/* Brass screw socket */}
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[0.25, 0.25, 0.4, 20]} />
                  <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
                </mesh>
                {/* Glass bulb globe */}
                <mesh position={[0, 0.7, 0]}>
                  <sphereGeometry args={[0.45, 24, 24]} />
                  <meshPhysicalMaterial
                    color="#ffffff"
                    transmission={0.9}
                    transparent
                    roughness={0.05}
                    ior={1.5}
                  />
                </mesh>
                {/* Glowing Filament & Point Light */}
                {isSimulating && totalCurrent > 0.01 && (
                  <group>
                    <mesh position={[0, 0.65, 0]}>
                      <sphereGeometry args={[0.12, 16, 16]} />
                      <meshBasicMaterial color="#fef08a" />
                    </mesh>
                    <pointLight position={[0, 0.7, 0]} color="#fef08a" intensity={Math.min(3, totalCurrent * 12)} distance={4} />
                  </group>
                )}
                <Html position={[0, 1.4, 0]} center distanceFactor={12}>
                  <div className="bg-slate-900/90 text-yellow-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/50 whitespace-nowrap">
                    مصباح
                  </div>
                </Html>
              </group>
            )}

            {/* LED Diode 3D Model */}
            {comp.type === 'led' && (
              <group>
                {/* Base rim */}
                <mesh position={[0, 0.15, 0]}>
                  <cylinderGeometry args={[0.22, 0.22, 0.1, 20]} />
                  <meshStandardMaterial color={comp.color || '#ef4444'} roughness={0.2} />
                </mesh>
                {/* Dome */}
                <mesh position={[0, 0.4, 0]}>
                  <sphereGeometry args={[0.2, 20, 20]} />
                  <meshPhysicalMaterial
                    color={comp.color || '#ef4444'}
                    emissive={isSimulating && totalCurrent > 0.001 ? (comp.color || '#ef4444') : '#000000'}
                    emissiveIntensity={isSimulating && totalCurrent > 0.001 ? 2.0 : 0.1}
                    transmission={0.8}
                    transparent
                  />
                </mesh>
                {/* LED Dynamic Glow Light */}
                {isSimulating && totalCurrent > 0.001 && (
                  <pointLight position={[0, 0.4, 0]} color={comp.color || '#ef4444'} intensity={1.5} distance={2.5} />
                )}
                <Html position={[0, 0.9, 0]} center distanceFactor={12}>
                  <div className="bg-slate-900/90 text-rose-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-rose-500/50 whitespace-nowrap">
                    LED
                  </div>
                </Html>
              </group>
            )}

            {/* Switch 3D Model */}
            {comp.type === 'switch' && (
              <group>
                <mesh position={[0, 0.1, 0]}>
                  <boxGeometry args={[0.8, 0.15, 0.4]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
                {/* Pivot posts */}
                <mesh position={[-0.3, 0.25, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} />
                </mesh>
                <mesh position={[0.3, 0.25, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} />
                </mesh>
                {/* Movable knife lever arm */}
                <mesh
                  position={[-0.05, 0.25, 0]}
                  rotation={[0, 0, comp.isOn ? 0 : -Math.PI / 4]}
                >
                  <boxGeometry args={[0.6, 0.05, 0.1]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
                </mesh>
                <Html position={[0, 0.7, 0]} center distanceFactor={12}>
                  <div className={`font-mono text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${comp.isOn ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60' : 'bg-rose-950/90 text-rose-400 border-rose-500/60'}`}>
                    {comp.isOn ? 'مغلق (ON)' : 'مفتوح (OFF)'}
                  </div>
                </Html>
              </group>
            )}

            {/* Capacitor 3D Model */}
            {comp.type === 'capacitor' && (
              <group>
                <mesh position={[0, 0.45, 0]}>
                  <cylinderGeometry args={[0.26, 0.26, 0.8, 24]} />
                  <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Silver stamped top */}
                <mesh position={[0, 0.86, 0]}>
                  <cylinderGeometry args={[0.24, 0.24, 0.02, 24]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
                </mesh>
                <Html position={[0, 1.2, 0]} center distanceFactor={12}>
                  <div className="bg-slate-900/90 text-blue-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-blue-500/50 whitespace-nowrap">
                    {comp.value}μF
                  </div>
                </Html>
              </group>
            )}
          </group>
        );
      })}

      {/* 3D Copper Wiring Traces on PCB */}
      {wires.map((wire, idx) => {
        if (wire.points.length < 2) return null;
        const pts = wire.points.map((p: any) => new THREE.Vector3(((p.x - 400) / 400) * 4.5, -0.31, ((p.y - 225) / 225) * 2.5));
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeom = new THREE.TubeGeometry(curve, 32, 0.04, 8, false);

        return (
          <group key={`wire3d-${idx}`}>
            <mesh geometry={tubeGeom}>
              <meshStandardMaterial color={wire.color || '#3b82f6'} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Animated electron pulses */}
            {isSimulating && totalCurrent > 0.01 && (
              <mesh position={curve.getPoint((Date.now() / 1500 + idx * 0.2) % 1)}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const CircuitBuilderSimulation: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
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
    COMPONENT_DEFINITIONS: compDefs,
    CIRCUIT_PRESETS: presets,
  } = useAdvancedCircuit();

  const [viewMode, setViewMode] = useState<'schematic' | 'workbench3d'>('schematic');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize] = useState({ width: 800, height: 450 });
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Animation loop for 2D electrons
  useEffect(() => {
    const animate = () => {
      setAnimationPhase(prev => (prev + 0.05) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Point to line distance for wire selection
  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    return Math.hypot(px - xx, py - yy);
  };

  // Draw 2D schematic canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
    bgGradient.addColorStop(0, '#0a1628');
    bgGradient.addColorStop(0.5, '#0d1f3c');
    bgGradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Schematic Grid
    ctx.strokeStyle = 'rgba(50, 100, 150, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasSize.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvasSize.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    // Draw wires
    state.wires.forEach(wire => {
      const isSelected = wire.id === state.selectedWire;
      ctx.strokeStyle = isSelected ? '#00ff00' : wire.color;
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (wire.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(wire.points[0].x, wire.points[0].y);
        for (let i = 1; i < wire.points.length; i++) {
          ctx.lineTo(wire.points[i].x, wire.points[i].y);
        }
        ctx.stroke();
      }

      // Draw electron particles along wires
      if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0) {
        const electrons = state.electrons.filter(e => e.wireId === wire.id);
        electrons.forEach(electron => {
          const totalLength = wire.points.reduce((sum, p, i) => {
            if (i === 0) return 0;
            return sum + Math.hypot(p.x - wire.points[i - 1].x, p.y - wire.points[i - 1].y);
          }, 0);
          
          const targetDist = electron.position * totalLength;
          let accDist = 0;
          
          for (let i = 1; i < wire.points.length; i++) {
            const segmentLength = Math.hypot(
              wire.points[i].x - wire.points[i - 1].x,
              wire.points[i].y - wire.points[i - 1].y
            );
            
            if (accDist + segmentLength >= targetDist) {
              const t = (targetDist - accDist) / segmentLength;
              const x = wire.points[i - 1].x + t * (wire.points[i].x - wire.points[i - 1].x);
              const y = wire.points[i - 1].y + t * (wire.points[i].y - wire.points[i - 1].y);
              
              ctx.fillStyle = '#00BFFF';
              ctx.shadowColor = '#00BFFF';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              break;
            }
            accDist += segmentLength;
          }
        });
      }
    });

    // Draw active wire being drawn
    if (state.isDrawingWire && state.currentWirePoints.length > 0) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(state.currentWirePoints[0].x, state.currentWirePoints[0].y);
      for (let i = 1; i < state.currentWirePoints.length; i++) {
        ctx.lineTo(state.currentWirePoints[i].x, state.currentWirePoints[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw components
    state.components.forEach(comp => {
      const def = COMPONENT_DEFINITIONS[comp.type];
      const isSelected = comp.id === state.selectedComponent;
      const measurement = state.measurements.find(m => m.componentId === comp.id);

      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      if (isSelected) {
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
      }

      const bodyGradient = ctx.createLinearGradient(-35, -25, 35, 25);
      bodyGradient.addColorStop(0, isSelected ? '#1a3a1a' : '#1a2a3a');
      bodyGradient.addColorStop(0.5, isSelected ? '#2a4a2a' : '#2a3a4a');
      bodyGradient.addColorStop(1, isSelected ? '#1a3a1a' : '#1a2a3a');
      
      ctx.fillStyle = bodyGradient;
      ctx.strokeStyle = isSelected ? '#00ff00' : def.color;
      ctx.lineWidth = isSelected ? 3 : 2;
      
      ctx.beginPath();
      ctx.roundRect(-35, -25, 70, 50, 10);
      ctx.fill();
      ctx.stroke();

      // Connection terminals
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(-35, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(35, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Component-specific visuals
      ctx.fillStyle = def.color;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      switch (comp.type) {
        case 'battery':
          ctx.fillRect(-15, -15, 6, 30);
          ctx.fillRect(9, -10, 6, 20);
          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.fillText('+', 12, 0);
          ctx.fillText('-', -12, 0);
          break;
        case 'resistor':
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(-15 + i * 8, i % 2 === 0 ? -10 : 10);
          }
          ctx.lineTo(20, 0);
          ctx.stroke();
          break;
        case 'bulb':
          if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0.01) {
            const glowIntensity = Math.min(state.totalCurrent * 50, 30);
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = glowIntensity + Math.sin(animationPhase) * 5;
            ctx.fillStyle = '#FFD700';
          } else {
            ctx.fillStyle = '#666';
          }
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        case 'led':
          const ledColor = comp.color || '#FF0000';
          if (state.isSimulating && !state.shortCircuit && state.totalCurrent > 0.001) {
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = 15 + Math.sin(animationPhase) * 5;
            ctx.fillStyle = ledColor;
          } else {
            ctx.fillStyle = '#333';
          }
          ctx.beginPath();
          ctx.moveTo(-10, -12);
          ctx.lineTo(10, 0);
          ctx.lineTo(-10, 12);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        case 'switch':
          ctx.strokeStyle = comp.isOn ? '#4CAF50' : '#f44336';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-15, 0);
          if (comp.isOn) {
            ctx.lineTo(15, 0);
          } else {
            ctx.lineTo(10, -15);
          }
          ctx.stroke();
          ctx.fillStyle = comp.isOn ? '#4CAF50' : '#f44336';
          ctx.beginPath();
          ctx.arc(20, -15, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          ctx.fillText(def.icon, 0, 0);
          break;
      }

      ctx.fillStyle = '#aaa';
      ctx.font = '10px Arial';
      ctx.fillText(`${comp.value}${def.unit}`, 0, 35);

      if (state.isSimulating && measurement) {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 11px Arial';
        if (comp.type === 'ammeter') {
          ctx.fillText(`${measurement.current.toFixed(3)}A`, 0, -35);
        } else if (comp.type === 'voltmeter') {
          ctx.fillText(`${measurement.voltage.toFixed(2)}V`, 0, -35);
        } else if (measurement.power > 0.001) {
          ctx.fillText(`${measurement.power.toFixed(2)}W`, 0, -35);
        }
      }

      ctx.restore();
    });

    if (state.shortCircuit) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ دائرة قصر - خطر! ⚠️', canvasSize.width / 2, 40);
    }

    if (state.openCircuit && state.components.length > 0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.fillStyle = '#FFA500';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الدائرة مفتوحة - أغلق المفتاح أو أضف مصدر طاقة', canvasSize.width / 2, canvasSize.height - 20);
    }
  }, [state, canvasSize, animationPhase]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedType) {
      addComponent(draggedType, x, y);
      setDraggedType(null);
      return;
    }

    const clickedComp = state.components.find(c => Math.abs(c.x - x) < 40 && Math.abs(c.y - y) < 30);
    if (clickedComp) {
      if (e.shiftKey) {
        startWire(clickedComp.x + 35, clickedComp.y, clickedComp.id);
      } else if (clickedComp.type === 'switch' && e.detail === 2) {
        toggleSwitch(clickedComp.id);
      } else {
        setDraggedComponent(clickedComp.id);
        setDragOffset({ x: x - clickedComp.x, y: y - clickedComp.y });
        selectComponent(clickedComp.id);
      }
    } else if (state.isDrawingWire) {
      const nearComp = state.components.find(c => Math.abs(c.x - x) < 50 && Math.abs(c.y - y) < 40);
      if (nearComp && nearComp.id !== state.wireStartPoint?.componentId) {
        finishWire(nearComp.x - 35, nearComp.y, nearComp.id);
      } else {
        addWirePoint(x, y);
      }
    } else {
      const clickedWire = state.wires.find(w => {
        for (let i = 1; i < w.points.length; i++) {
          const dist = pointToLineDistance(x, y, w.points[i - 1].x, w.points[i - 1].y, w.points[i].x, w.points[i].y);
          if (dist < 10) return true;
        }
        return false;
      });
      if (clickedWire) selectWire(clickedWire.id);
      else {
        selectComponent(null);
        selectWire(null);
      }
    }
  }, [draggedType, state, addComponent, startWire, toggleSwitch, selectComponent, finishWire, addWirePoint, selectWire]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedComponent) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    moveComponent(draggedComponent, Math.max(40, Math.min(canvasSize.width - 40, x)), Math.max(30, Math.min(canvasSize.height - 30, y)));
  }, [draggedComponent, dragOffset, moveComponent, canvasSize]);

  const handleMouseUp = useCallback(() => {
    setDraggedComponent(null);
  }, []);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (state.isDrawingWire) cancelWire();
  }, [state.isDrawingWire, cancelWire]);

  const filteredComponents = Object.entries(COMPONENT_DEFINITIONS).filter(
    ([_, def]) => def.category === selectedCategory
  );
  const selectedComp = state.components.find(c => c.id === state.selectedComponent);

  // HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'current',
        label: 'التيار الكلي للدائرة (I)',
        value: Number(state.totalCurrent.toFixed(3)),
        unit: 'A',
        status: state.shortCircuit ? ('critical' as const) : ('normal' as const),
        min: 0,
        max: 5,
      },
      {
        id: 'voltage',
        label: 'فرق الجهد الكلي (V)',
        value: Number(state.totalVoltage.toFixed(1)),
        unit: 'V',
        status: 'normal' as const,
        min: 0,
        max: 48,
      },
      {
        id: 'resistance',
        label: 'المقاومة المكافئة (R_eq)',
        value: Number(state.totalResistance.toFixed(1)),
        unit: 'Ω',
        status: state.totalResistance < 0.1 && state.totalVoltage > 0 ? ('critical' as const) : ('normal' as const),
        min: 0,
        max: 1000,
      },
      {
        id: 'power',
        label: 'القدرة الكهربائية المستهلكة (P)',
        value: Number(state.totalPower.toFixed(2)),
        unit: 'W',
        status: state.totalPower > 50 ? ('warning' as const) : ('normal' as const),
        min: 0,
        max: 100,
      },
    ];
  }, [state]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'basic_circuit',
        title: 'بناء دائرة أومية مغلقة',
        description: 'قم بتوصيل بطارية ومصباح أو مقاومة واضغط على "تشغيل" لتحقيق تدفق تيار كهربائي مستقر (I > 0.05 A).',
        targetMetric: 'التيار الكلي للدائرة (I)',
        targetValue: 0.1,
        unit: 'A',
        currentValue: state.totalCurrent,
        holdTimeRequired: 3,
        tolerance: 0.08,
        isCompleted: false,
        hint: 'اختر النموذج الجاهز "دائرة بسيطة" أو صِل بطارية بمصباح وأغلق المفتاح ثم اضغط "تشغيل".',
      },
      {
        id: 'led_protection',
        title: 'حماية الدايود الضوئي (LED)',
        description: 'اضبط مقاومة الدائرة ليكون التيار آمناً بين 0.01A و 0.04A لتشغيل الصمام دون احتراقه.',
        targetMetric: 'التيار الكلي للدائرة (I)',
        targetValue: 0.025,
        unit: 'A',
        currentValue: state.totalCurrent,
        holdTimeRequired: 3,
        tolerance: 0.015,
        isCompleted: false,
        hint: 'صِل مقاومة بقيمة ~400Ω على التوالي مع البطارية والـ LED.',
      },
      {
        id: 'target_power',
        title: 'تحقيق قدرة كهربائية مستهدفة',
        description: 'قم بتوصيل عناصر الدائرة بحيث تصل القدرة الكلية المستهلكة P إلى 2.0 Watt أو أكثر.',
        targetMetric: 'القدرة الكهربائية المستهلكة (P)',
        targetValue: 2.0,
        unit: 'W',
        currentValue: state.totalPower,
        holdTimeRequired: 3,
        tolerance: 0.5,
        isCompleted: false,
        hint: 'زد جهد البطارية أو قلل المقاومة المكافئة وفق قانون جول P = V²/R.',
      },
    ];
  }, [state]);

  const quizQuestions = [
    {
      question: 'وفق قانون أوم (V = I × R)، ماذا يحدث للتيار إذا تضاعفت المقاومة مع ثبوت الجهد؟',
      options: ['يتضاعف التيار للضعف', 'ينخفض التيار إلى النصف', 'يبقى ثابتاً', 'يصبح صفراً فوراً'],
      correctIndex: 1,
      explanation: 'العلاقة بين التيار والمقاومة علاقة عكسية؛ فمضاعفة المقاومة تعيق تدفق الإلكترونات وتقلل التيار إلى النصف.',
    },
    {
      question: 'ما سبب حدوث دائرة القصر (Short Circuit) وخطورتها؟',
      options: [
        'انفصال السلك وانعدام التيار',
        'توصيل قطبي البطارية بمسار مقاومته تقترب من الصفر مما يؤدي لتيار هائل وارتفاع شديد في الحرارة',
        'توصيل مصباح زائد في الدائرة',
        'استخدام بطارية ذات جهد منخفض',
      ],
      correctIndex: 1,
      explanation: 'عند انعدام المقاومة، يسري تيار نظري لانهائي I = V/0 مسبباً انصهار الأسلاك وحرائق كهربائية.',
    },
    {
      question: 'كيف تحسب المقاومة المكافئة لمقاومتين متطابقتين موصلتين على التوازي؟',
      options: ['مجموعهما (2R)', 'نصف قيمة إحداهما (R / 2)', 'مربعهما (R²)', 'تساوي الصفر'],
      correctIndex: 1,
      explanation: 'في التوصيل على التوازي، 1/Req = 1/R + 1/R = 2/R، وبالتالي Req = R/2، مما يقلل المقاومة الكلية.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <StarField starCount={150} speed={0.2} />

      <div className="relative z-10">
        <motion.header 
          className="p-4 border-b border-border/50 backdrop-blur-md bg-background/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }} className="gap-2">
              <ArrowLeft size={20} />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
            </Button>
            <div className="flex items-center gap-3">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Zap className="text-yellow-400" size={28} />
              </motion.div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
                معمل بناء الدوائر واللوحات الإلكترونية 3D
              </h1>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <Button
                size="sm"
                variant={viewMode === 'schematic' ? 'default' : 'ghost'}
                onClick={() => setViewMode('schematic')}
                className="h-7 text-xs px-2.5 text-yellow-300"
              >
                مخطط الدائرة
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'workbench3d' ? 'default' : 'ghost'}
                onClick={() => setViewMode('workbench3d')}
                className="h-7 text-xs px-2.5 text-cyan-300"
              >
                لوحة 3D مجسمة
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Canvas / 3D Workbench Area */}
            <div className="xl:col-span-3 space-y-4">
              <Card className="bg-card/80 backdrop-blur-md border-primary/20 overflow-hidden relative">
                <CardContent className="p-0 relative">
                  {viewMode === 'schematic' ? (
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      className="w-full rounded-lg cursor-pointer shadow-2xl block"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onContextMenu={handleRightClick}
                    />
                  ) : (
                    <div className="w-full h-[450px] bg-slate-950 rounded-lg relative overflow-hidden">
                      <Canvas camera={{ position: [0, 4.5, 6], fov: 45 }}>
                        <ambientLight intensity={0.7} />
                        <pointLight position={[10, 10, 10]} intensity={1.2} />
                        <pointLight position={[-10, 8, -5]} intensity={0.6} color="#3b82f6" />
                        <directionalLight position={[0, 8, 4]} intensity={0.8} />

                        <CinematicCameraController preset={cameraPreset} />

                        <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.05}>
                          <ElectronicWorkbench3D
                            components={state.components}
                            wires={state.wires}
                            isSimulating={state.isSimulating}
                            totalCurrent={state.totalCurrent}
                            totalVoltage={state.totalVoltage}
                            shortCircuit={state.shortCircuit}
                          />
                        </Float>

                        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                      </Canvas>

                      {/* 3D Camera Controls */}
                      <div className="absolute top-3 left-3 z-20 flex gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-700/60">
                        <Button size="sm" variant={cameraPreset === 'overview' ? 'default' : 'ghost'} onClick={() => setCameraPreset('overview')} className="h-6 text-[10px] px-2 text-cyan-300">شامل</Button>
                        <Button size="sm" variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'} onClick={() => setCameraPreset('microscopic')} className="h-6 text-[10px] px-2 text-cyan-300">مجهري</Button>
                        <Button size="sm" variant={cameraPreset === 'flow' ? 'default' : 'ghost'} onClick={() => setCameraPreset('flow')} className="h-6 text-[10px] px-2 text-cyan-300">مسار التيار</Button>
                        <Button size="sm" variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'} onClick={() => setCameraPreset('orbit360')} className="h-6 text-[10px] px-2 text-cyan-300">دوران 360°</Button>
                      </div>
                    </div>
                  )}

                  {/* CyberLab HUD Overlay */}
                  <CyberLabHUD
                    metrics={hudMetrics}
                    title="القياسات اللحظية للدائرة الكهربائية"
                    status={state.shortCircuit ? 'critical' : state.isSimulating ? 'active' : 'idle'}
                    oscilloscopeWaveform={state.isSimulating && state.totalCurrent > 0 ? 'sine' : 'flat'}
                    oscilloscopeFrequency={Math.max(1, state.totalCurrent * 5)}
                  />

                  {/* Component Palette in Schematic Mode */}
                  <div className="p-4 border-t border-border/40 bg-slate-950/40">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {COMPONENT_CATEGORIES.map(cat => (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="gap-1 h-8 text-xs"
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {filteredComponents.map(([type, def]) => (
                        <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={draggedType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDraggedType(draggedType === type ? null : type as ComponentType)}
                            className="gap-1 h-8 text-xs"
                            style={{ borderColor: `${def.color}50` }}
                          >
                            <span>{def.icon}</span>
                            {def.nameAr}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gamified Laboratory Challenges */}
              <LabChallengeEngine
                challenges={challenges}
                onChallengeComplete={(c) => {
                  console.log('Challenge completed:', c.title);
                }}
              />
            </div>

            {/* Sidebar Controls & CoPilot */}
            <div className="space-y-4">
              {/* AI Lab CoPilot */}
              <LiveAILabCoPilot
                experimentContext={{
                  title: 'معمل بناء الدوائر واللوحات الإلكترونية',
                  currentStep: state.isSimulating ? 'محاكاة تدفق التيار قيد التشغيل' : 'وضع التصميم والتركيب',
                  userAction: `مراقبة الدائرة الحالية: الجهد ${state.totalVoltage.toFixed(1)}V، التيار ${state.totalCurrent.toFixed(3)}A، المقاومة ${state.totalResistance.toFixed(1)}Ω`,
                  activeMetrics: {
                    componentsCount: state.components.length,
                    totalCurrent: `${state.totalCurrent.toFixed(3)} A`,
                    totalVoltage: `${state.totalVoltage.toFixed(1)} V`,
                    power: `${state.totalPower.toFixed(2)} W`,
                    shortCircuit: state.shortCircuit ? 'دائرة قصر خطيرة!' : 'آمن',
                  }
                }}
                suggestions={[
                  'كيف أستطيع تطبيق قانون كيرشوف للتيار (KCL) عند نقطة التفرع؟',
                  'ما الفرق الجوهري بين توصيل البطاريات على التوالي وتوصيلها على التوازي؟',
                  'كيف أحسب قيمة مقاومة الحماية المناسبة لدايود LED أزرق يعمل على 12V؟',
                  'اشرح سلوك المكثف في دائرة التيار المستمر DC عند الغلق المفاجئ.',
                ]}
              />

              {/* Simulation Run / Pause / Clear Controls */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings size={16} className="text-primary" />
                    التحكم بالمحاكاة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    {!state.isSimulating ? (
                      <Button onClick={runSimulation} className="flex-1 bg-green-600 hover:bg-green-700 h-9 text-xs">
                        <Play size={14} className="mr-1" />
                        تشغيل التيار
                      </Button>
                    ) : (
                      <Button onClick={stopSimulation} variant="destructive" className="flex-1 h-9 text-xs">
                        <Square size={14} className="mr-1" />
                        إيقاف
                      </Button>
                    )}
                    <Button onClick={clearCircuit} variant="outline" className="flex-1 h-9 text-xs">
                      <Trash2 size={14} className="mr-1" />
                      مسح الكل
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Circuit Presets */}
              <Card className="bg-card/80 backdrop-blur-md border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">دوائر جاهزة للتجربة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-44">
                    <div className="space-y-1.5">
                      {presets.map(preset => (
                        <Button
                          key={preset.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between text-xs h-8"
                          onClick={() => loadPreset(preset.id)}
                        >
                          <span>{preset.name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {preset.difficulty === 'beginner' && 'مبتدئ'}
                            {preset.difficulty === 'intermediate' && 'متوسط'}
                            {preset.difficulty === 'advanced' && 'متقدم'}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Selected Component Properties */}
              {selectedComp && (
                <Card className="bg-card/80 backdrop-blur-md border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">خصائص العنصر المحدد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className="w-full justify-center" style={{ backgroundColor: COMPONENT_DEFINITIONS[selectedComp.type].color }}>
                      {COMPONENT_DEFINITIONS[selectedComp.type].nameAr}
                    </Badge>

                    <div>
                      <label className="text-xs text-muted-foreground">
                        القيمة ({COMPONENT_DEFINITIONS[selectedComp.type].unit})
                      </label>
                      <Slider
                        value={[selectedComp.value]}
                        onValueChange={([v]) => updateComponent(selectedComp.id, { value: v })}
                        min={selectedComp.type === 'battery' ? 1 : 1}
                        max={selectedComp.type === 'battery' ? 24 : 10000}
                        className="mt-2"
                      />
                      <div className="text-center text-sm font-bold mt-1 text-cyan-300">
                        {selectedComp.value} {COMPONENT_DEFINITIONS[selectedComp.type].unit}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => rotateComponent(selectedComp.id)} className="flex-1 h-8 text-xs">
                        <RotateCw size={14} className="mr-1" />
                        تدوير
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeComponent(selectedComp.id)} className="flex-1 h-8 text-xs">
                        <Trash2 size={14} className="mr-1" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scientific Laws & Quiz */}
              <InfoSection
                formulas={[
                  { name: 'قانون أوم', formula: 'V = I × R', description: 'الجهد يساوي حاصل ضرب شدة التيار في المقاومة' },
                  { name: 'القدرة الكهربائية (جول)', formula: 'P = I × V = I²R', description: 'الطاقة المستهلكة في وحدة الزمن' },
                  { name: 'مقاومات التوالي', formula: 'R_eq = R₁ + R₂ + ...', description: 'تجمع المقاومات على خط واحد' },
                  { name: 'مقاومات التوازي', formula: '1/R_eq = 1/R₁ + 1/R₂', description: 'المقاومة المكافئة تقل في التفرع' },
                ]}
                facts={[
                  'سرعة انسياق الإلكترونات الفعلية داخل سلك النحاس بطيئة جداً (أقل من 1 ملم/ثانية)، لكن الإشارة الكهرومغناطيسية تنتشر بسرعة تقارب سرعة الضوء!',
                  'قانون كيرشوف الأول (KCL) مبني على مبدأ حفظ الشحنة الكهربائية.',
                ]}
              />

              <QuizSection questions={quizQuestions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilderSimulation;
