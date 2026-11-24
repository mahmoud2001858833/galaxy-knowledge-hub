import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export interface CircuitComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  value?: number;
  isOn?: boolean;
  color?: string;
  label?: string;
  voltageAcross?: number;
  currentThrough?: number;
  chargePercent?: number;
  connections: { positive: string | null; negative: string | null };
}

export interface Wire {
  id: string;
  startComponentId: string;
  startTerminal: 'positive' | 'negative';
  endComponentId: string;
  endTerminal: 'positive' | 'negative';
  points: { x: number; y: number }[];
  current?: number;
}

interface CircuitCanvasProps {
  components: CircuitComponent[];
  wires: Wire[];
  selectedComponent: string | null;
  isDrawingWire: boolean;
  wireStart: { componentId: string; terminal: 'positive' | 'negative' } | null;
  currentMousePos: { x: number; y: number } | null;
  onComponentMove: (id: string, x: number, y: number) => void;
  onComponentSelect: (id: string | null) => void;
  onTerminalClick: (componentId: string, terminal: 'positive' | 'negative') => void;
  onCanvasClick: (x: number, y: number) => void;
  onCanvasMouseMove?: (x: number, y: number) => void;
  onSwitchToggle?: (id: string) => void;
  isSimulating: boolean;
  measurements: { voltage: number; current: number; power: number };
}

interface ComponentIconSpec {
  width: number;
  height: number;
  terminals: {
    positive: { x: number; y: number };
    negative: { x: number; y: number };
  };
  draw: (ctx: CanvasRenderingContext2D, comp: CircuitComponent, isSimulating: boolean) => void;
}

function getOffLedColor(hexColor: string): string {
  const normalized = hexColor.toLowerCase();
  if (normalized === '#ef4444' || normalized === '#ff0000') return '#5c1818';
  if (normalized === '#facc15' || normalized === '#eab308') return '#5e4b10';
  return '#144524';
}

const COMPONENT_ICONS: Record<string, ComponentIconSpec> = {
  battery: {
    width: 68,
    height: 44,
    terminals: { positive: { x: 30, y: 0 }, negative: { x: -30, y: 0 } },
    draw: (ctx, comp) => {
      const value = comp.value ?? 9;
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Battery body
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-25, -16, 50, 32);
      ctx.strokeRect(-25, -16, 50, 32);

      // Positive terminal (+ on right)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(25, -9, 10, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('+', 30, 4);

      // Negative terminal (- on left)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-35, -9, 10, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('-', -30, 4);

      // Voltage label
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}V`, 0, 5);

      ctx.restore();
    },
  },
  resistor: {
    width: 72,
    height: 36,
    terminals: { positive: { x: -30, y: 0 }, negative: { x: 30, y: 0 } },
    draw: (ctx, comp) => {
      const value = comp.value ?? 100;
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      ctx.strokeStyle = '#e5b887';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-20, 0);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(-15 + i * 10, i % 2 === 0 ? -9 : 9);
      }
      ctx.lineTo(20, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();

      // Value label
      const label = value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}kΩ` : `${value}Ω`;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, 22);

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-30, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(30, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },
  led: {
    width: 54,
    height: 48,
    terminals: { positive: { x: -22, y: 0 }, negative: { x: 22, y: 0 } },
    draw: (ctx, comp) => {
      const activeColor = comp.color || '#22c55e';
      const offColor = getOffLedColor(activeColor);
      const isOn = Boolean(comp.isOn);

      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Glow halo when ON
      if (isOn) {
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
        grad.addColorStop(0, activeColor);
        grad.addColorStop(0.5, `${activeColor}88`);
        grad.addColorStop(1, `${activeColor}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      // LED housing circle
      ctx.fillStyle = isOn ? activeColor : offColor;
      ctx.strokeStyle = isOn ? '#ffffff' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Diode triangle inside
      ctx.fillStyle = isOn ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.moveTo(-7, -7);
      ctx.lineTo(-7, 7);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fill();

      // Cathode bar
      ctx.strokeStyle = isOn ? '#ffffff' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, -7);
      ctx.lineTo(6, 7);
      ctx.stroke();

      // Leads & Terminals
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-14, 0);
      ctx.moveTo(14, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-22, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(22, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      if (comp.label) {
        ctx.fillStyle = isOn ? activeColor : '#cbd5e1';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(comp.label, 0, 27);
      }

      ctx.restore();
    },
  },
  switch: {
    width: 64,
    height: 44,
    terminals: { positive: { x: -25, y: 0 }, negative: { x: 25, y: 0 } },
    draw: (ctx, comp) => {
      const isOn = Boolean(comp.isOn);
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Base contacts
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(-11, 0);
      ctx.moveTo(11, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();

      // Pivot dots
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(-11, 0, 3.5, 0, Math.PI * 2);
      ctx.arc(11, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Switch lever
      ctx.strokeStyle = isOn ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      if (isOn) {
        ctx.lineTo(11, 0);
      } else {
        ctx.lineTo(8, -16);
      }
      ctx.stroke();

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(25, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Status & optional label
      ctx.fillStyle = isOn ? '#4ade80' : '#f87171';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(comp.label ? `${comp.label} (${isOn ? 'ON' : 'OFF'})` : isOn ? 'ON' : 'OFF', 0, 21);

      ctx.restore();
    },
  },
  bulb: {
    width: 56,
    height: 58,
    terminals: { positive: { x: -16, y: 16 }, negative: { x: 16, y: 16 } },
    draw: (ctx, comp) => {
      const isOn = Boolean(comp.isOn);
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      if (isOn) {
        const grad = ctx.createRadialGradient(0, -5, 2, 0, -5, 34);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.45)');
        grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, -5, 34, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bulb glass
      ctx.fillStyle = isOn ? '#fde047' : '#3f3f46';
      ctx.strokeStyle = isOn ? '#facc15' : '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -5, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bulb base
      ctx.fillStyle = '#71717a';
      ctx.fillRect(-8, 9, 16, 11);

      // Filament
      ctx.strokeStyle = isOn ? '#ea580c' : '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -3);
      ctx.quadraticCurveTo(0, -16, 6, -3);
      ctx.stroke();

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-16, 16, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(16, 16, 5, 0, Math.PI * 2);
      ctx.fill();

      if (comp.voltageAcross && Math.abs(comp.voltageAcross) > 0.05) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.abs(comp.voltageAcross).toFixed(2)}V`, 0, 32);
      }

      ctx.restore();
    },
  },
  capacitor: {
    width: 60,
    height: 54,
    terminals: { positive: { x: -22, y: 0 }, negative: { x: 22, y: 0 } },
    draw: (ctx, comp, isSimulating) => {
      const value = comp.value ?? 100;
      const chargePct = Math.max(0, Math.min(100, comp.chargePercent ?? 0));
      const vCap = Math.abs(comp.voltageAcross ?? 0);

      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Charge field glow between plates when charged
      if (chargePct > 2) {
        ctx.fillStyle = `rgba(34, 211, 238, ${0.15 + (chargePct / 100) * 0.45})`;
        ctx.fillRect(-5, -13, 10, 26);
      }

      // Plates
      ctx.strokeStyle = chargePct > 10 ? '#22d3ee' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-6, 0);
      ctx.moveTo(-6, -14);
      ctx.lineTo(-6, 14);
      ctx.moveTo(6, -14);
      ctx.lineTo(6, 14);
      ctx.moveTo(6, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();

      // Value label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}µF`, 0, -19);

      // Live charge progress bar & voltage readout
      if (isSimulating || chargePct > 0.5) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-20, 17, 40, 6);
        ctx.fillStyle = chargePct >= 95 ? '#22c55e' : '#06b6d4';
        ctx.fillRect(-20, 17, (40 * chargePct) / 100, 6);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(-20, 17, 40, 6);

        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`${vCap.toFixed(2)}V (${Math.round(chargePct)}%)`, 0, 34);
      }

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-22, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(22, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },
  motor: {
    width: 60,
    height: 60,
    terminals: { positive: { x: -26, y: 0 }, negative: { x: 26, y: 0 } },
    draw: (ctx, comp) => {
      const isOn = Boolean(comp.isOn);
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Motor body
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = isOn ? '#a855f7' : '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spinning blades when ON
      if (isOn) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        const spinAngle = Date.now() / 80;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(spinAngle + (i * Math.PI) / 2) * 16,
            Math.sin(spinAngle + (i * Math.PI) / 2) * 16,
          );
          ctx.stroke();
        }
      }

      // Motor label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('M', 0, 5);

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-26, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(26, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },
  ammeter: {
    width: 64,
    height: 56,
    terminals: { positive: { x: -28, y: 0 }, negative: { x: 28, y: 0 } },
    draw: (ctx, comp) => {
      const readingMa = comp.value ?? 0;
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Meter body
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('A', 0, -5);

      // Reading
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${readingMa.toFixed(1)}mA`, 0, 11);

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-28, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(28, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },
  voltmeter: {
    width: 64,
    height: 56,
    terminals: { positive: { x: -28, y: 0 }, negative: { x: 28, y: 0 } },
    draw: (ctx, comp) => {
      const readingV = comp.value ?? 0;
      ctx.save();
      ctx.translate(comp.x, comp.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      // Meter body
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('V', 0, -5);

      // Reading
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${readingV.toFixed(2)}V`, 0, 11);

      // Terminals
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-28, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(28, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },
};

function samplePolyline(pts: Array<{ x: number; y: number }>, t: number): { x: number; y: number } {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return pts[0];

  const segLengths: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segLengths.push(len);
    totalLen += len;
  }
  if (totalLen <= 0.001) return pts[0];

  let target = Math.max(0, Math.min(1, t)) * totalLen;
  for (let i = 0; i < segLengths.length; i++) {
    if (target <= segLengths[i] || i === segLengths.length - 1) {
      const localT = segLengths[i] > 0.001 ? target / segLengths[i] : 0;
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * localT,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * localT,
      };
    }
    target -= segLengths[i];
  }
  return pts[pts.length - 1];
}

export default function CircuitCanvas({
  components,
  wires,
  selectedComponent,
  isDrawingWire,
  wireStart,
  currentMousePos,
  onComponentMove,
  onComponentSelect,
  onTerminalClick,
  onCanvasClick,
  onCanvasMouseMove,
  onSwitchToggle,
  isSimulating,
  measurements,
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  const getTerminalPosition = useCallback((component: CircuitComponent, terminal: 'positive' | 'negative') => {
    const iconData = COMPONENT_ICONS[component.type];
    if (!iconData) return { x: component.x, y: component.y };

    const local = iconData.terminals[terminal];
    const angle = (component.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      x: component.x + local.x * cos - local.y * sin,
      y: component.y + local.x * sin + local.y * cos,
    };
  }, []);

  const getScaledPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid in a single batched path
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 25) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    const compById = new Map(components.map((c) => [c.id, c]));

    // Draw wires
    wires.forEach((wire) => {
      const startComp = compById.get(wire.startComponentId);
      const endComp = compById.get(wire.endComponentId);
      if (!startComp || !endComp) return;

      const startPos = getTerminalPosition(startComp, wire.startTerminal);
      const endPos = getTerminalPosition(endComp, wire.endTerminal);
      const poly = [startPos, ...(wire.points || []), endPos];

      const isVoltmeterProbe = startComp.type === 'voltmeter' || endComp.type === 'voltmeter';
      const signedCurrent = wire.current ?? 0;
      const absCurrent = Math.abs(signedCurrent);
      const hasFlow = isSimulating && absCurrent > 1e-4;

      if (isVoltmeterProbe) {
        ctx.strokeStyle = isSimulating ? '#f472b6' : '#9d4edd';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = hasFlow ? '#22c55e' : '#64748b';
        ctx.lineWidth = hasFlow ? 3.5 : 2.5;
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i].x, poly[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Animate moving charges along actual polyline path & signed direction
      if (hasFlow && !isVoltmeterProbe) {
        const speed = Math.max(0.25, Math.min(2.2, 0.35 + absCurrent * 8));
        const time = (Date.now() / 1000) * speed;
        const numElectrons = Math.max(2, Math.min(7, Math.round(2 + absCurrent * 25)));
        const direction = signedCurrent >= 0 ? 1 : -1;

        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < numElectrons; i++) {
          let t = (time + i / numElectrons) % 1;
          if (direction < 0) t = 1 - t;
          const pt = samplePolyline(poly, t);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw wire preview while user is connecting terminals
    if (isDrawingWire && wireStart && currentMousePos) {
      const startComp = compById.get(wireStart.componentId);
      if (startComp) {
        const startPos = getTerminalPosition(startComp, wireStart.terminal);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw components
    components.forEach((component) => {
      const iconData = COMPONENT_ICONS[component.type];
      if (!iconData) return;

      if (selectedComponent === component.id) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(
          component.x - iconData.width / 2 - 6,
          component.y - iconData.height / 2 - 6,
          iconData.width + 12,
          iconData.height + 12,
        );
        ctx.setLineDash([]);
      }

      iconData.draw(ctx, component, isSimulating);
    });
  }, [components, wires, selectedComponent, isDrawingWire, wireStart, currentMousePos, isSimulating, getTerminalPosition]);

  // Run rAF only while animating live simulation; otherwise render on demand
  useEffect(() => {
    const needsLoop =
      isSimulating &&
      (wires.some((w) => Math.abs(w.current ?? 0) > 1e-4) ||
        components.some((c) => c.type === 'motor' && c.isOn));

    drawFrame();

    if (!needsLoop) return;

    let lastTime = 0;
    const loop = (now: number) => {
      if (!document.hidden && now - lastTime >= 30) {
        drawFrame();
        lastTime = now;
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [drawFrame, isSimulating, wires, components]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getScaledPoint(e);
    if (!pt) return;

    // Check if clicking on a terminal first (generous 12px hit radius)
    for (const component of components) {
      const posPos = getTerminalPosition(component, 'positive');
      const negPos = getTerminalPosition(component, 'negative');

      if (Math.hypot(pt.x - posPos.x, pt.y - posPos.y) < 12) {
        onTerminalClick(component.id, 'positive');
        return;
      }
      if (Math.hypot(pt.x - negPos.x, pt.y - negPos.y) < 12) {
        onTerminalClick(component.id, 'negative');
        return;
      }
    }

    // Check if clicking on a component body
    for (const component of components) {
      const iconData = COMPONENT_ICONS[component.type];
      if (!iconData) continue;

      if (
        pt.x >= component.x - iconData.width / 2 &&
        pt.x <= component.x + iconData.width / 2 &&
        pt.y >= component.y - iconData.height / 2 &&
        pt.y <= component.y + iconData.height / 2
      ) {
        setDragging(component.id);
        setDragOffset({ x: pt.x - component.x, y: pt.y - component.y });
        onComponentSelect(component.id);
        return;
      }
    }

    onComponentSelect(null);
    onCanvasClick(pt.x, pt.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getScaledPoint(e);
    if (!pt) return;

    if (dragging) {
      const canvas = canvasRef.current;
      const clampedX = canvas ? Math.max(40, Math.min(canvas.width - 40, pt.x - dragOffset.x)) : pt.x - dragOffset.x;
      const clampedY = canvas ? Math.max(40, Math.min(canvas.height - 40, pt.y - dragOffset.y)) : pt.y - dragOffset.y;
      onComponentMove(dragging, clampedX, clampedY);
    } else if (isDrawingWire && onCanvasMouseMove) {
      onCanvasMouseMove(pt.x, pt.y);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getScaledPoint(e);
    if (!pt) return;

    for (const component of components) {
      const iconData = COMPONENT_ICONS[component.type];
      if (!iconData) continue;

      if (
        pt.x >= component.x - iconData.width / 2 &&
        pt.x <= component.x + iconData.width / 2 &&
        pt.y >= component.y - iconData.height / 2 &&
        pt.y <= component.y + iconData.height / 2
      ) {
        if (component.type === 'switch' && onSwitchToggle) {
          onSwitchToggle(component.id);
        }
        return;
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={520}
        className="w-full h-auto border border-slate-700 rounded-lg cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />

      {/* Live measurements overlay */}
      {isSimulating && (
        <div
          data-preserve-dark
          className="absolute top-3 right-3 p-3 rounded-lg text-xs sm:text-sm border border-white/15 space-y-1 pointer-events-none"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <div style={{ color: '#4ade80' }} className="font-mono font-bold">
            ⚡ الجهد: {measurements.voltage.toFixed(2)} V
          </div>
          <div style={{ color: '#facc15' }} className="font-mono font-bold">
            ⚡ التيار: {(measurements.current * 1000).toFixed(2)} mA
          </div>
          <div style={{ color: '#f472b6' }} className="font-mono font-bold">
            ⚡ القدرة: {(measurements.power * 1000).toFixed(1)} mW
          </div>
        </div>
      )}
    </motion.div>
  );
}
