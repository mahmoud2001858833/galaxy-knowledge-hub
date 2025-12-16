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
  isSimulating: boolean;
  measurements: { voltage: number; current: number; power: number };
}

const COMPONENT_ICONS: Record<string, { draw: (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, isOn?: boolean, value?: number) => void; width: number; height: number }> = {
  battery: {
    width: 60,
    height: 40,
    draw: (ctx, x, y, rotation, isOn, value = 9) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Battery body
      ctx.fillStyle = '#333';
      ctx.fillRect(-25, -15, 50, 30);
      
      // Positive terminal
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(25, -8, 8, 16);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('+', 27, 4);
      
      // Negative terminal
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(-33, -8, 8, 16);
      ctx.fillStyle = '#fff';
      ctx.fillText('-', -31, 4);
      
      // Voltage label
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}V`, 0, 5);
      
      ctx.restore();
    }
  },
  resistor: {
    width: 70,
    height: 30,
    draw: (ctx, x, y, rotation, isOn, value = 100) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Zigzag pattern
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-20, 0);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(-15 + i * 10, i % 2 === 0 ? -8 : 8);
      }
      ctx.lineTo(20, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      
      // Value label
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}Ω`, 0, 20);
      
      // Terminals
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(-30, 0, 5, 0, Math.PI * 2);
      ctx.arc(30, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  },
  led: {
    width: 50,
    height: 40,
    draw: (ctx, x, y, rotation, isOn) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // LED body (triangle)
      ctx.fillStyle = isOn ? '#00ff00' : '#004400';
      ctx.beginPath();
      ctx.moveTo(-15, -12);
      ctx.lineTo(-15, 12);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      
      // Line (cathode)
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, -12);
      ctx.lineTo(10, 12);
      ctx.stroke();
      
      // Glow effect when on
      if (isOn) {
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Terminals
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-20, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(20, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  },
  switch: {
    width: 60,
    height: 30,
    draw: (ctx, x, y, rotation, isOn) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Base line
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(-10, 0);
      ctx.moveTo(10, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();
      
      // Switch lever
      ctx.strokeStyle = isOn ? '#00ff00' : '#ff0000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      if (isOn) {
        ctx.lineTo(10, 0);
      } else {
        ctx.lineTo(5, -15);
      }
      ctx.stroke();
      
      // Terminals
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Status
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isOn ? 'ON' : 'OFF', 0, 20);
      
      ctx.restore();
    }
  },
  bulb: {
    width: 50,
    height: 50,
    draw: (ctx, x, y, rotation, isOn) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Bulb glass
      ctx.fillStyle = isOn ? '#ffff00' : '#444';
      if (isOn) {
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 30;
      }
      ctx.beginPath();
      ctx.arc(0, -5, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Bulb base
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#666';
      ctx.fillRect(-8, 8, 16, 12);
      
      // Filament
      ctx.strokeStyle = isOn ? '#ff8800' : '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.quadraticCurveTo(0, -15, 5, -5);
      ctx.stroke();
      
      // Terminals
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-15, 15, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(15, 15, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  },
  capacitor: {
    width: 50,
    height: 40,
    draw: (ctx, x, y, rotation, isOn, value = 100) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Plates
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-5, 0);
      ctx.moveTo(-5, -12);
      ctx.lineTo(-5, 12);
      ctx.moveTo(5, -12);
      ctx.lineTo(5, 12);
      ctx.moveTo(5, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();
      
      // Value
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}µF`, 0, 25);
      
      // Terminals
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-20, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(20, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  },
  motor: {
    width: 60,
    height: 60,
    draw: (ctx, x, y, rotation, isOn) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Motor body
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Motor label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('M', 0, 5);
      
      // Spinning indicator
      if (isOn) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        const spinAngle = Date.now() / 100;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(spinAngle + i * Math.PI / 2) * 15,
            Math.sin(spinAngle + i * Math.PI / 2) * 15
          );
          ctx.stroke();
        }
      }
      
      // Terminals
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  },
  ammeter: {
    width: 50,
    height: 50,
    draw: (ctx, x, y, rotation, isOn, value = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Meter body
      ctx.fillStyle = '#222';
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('A', 0, 6);
      
      // Reading
      ctx.fillStyle = '#0f0';
      ctx.font = '10px Arial';
      ctx.fillText(`${(value || 0).toFixed(2)}`, 0, -8);
      
      // Terminals
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  },
  voltmeter: {
    width: 50,
    height: 50,
    draw: (ctx, x, y, rotation, isOn, value = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Meter body
      ctx.fillStyle = '#222';
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#f00';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('V', 0, 6);
      
      // Reading
      ctx.fillStyle = '#0f0';
      ctx.font = '10px Arial';
      ctx.fillText(`${(value || 0).toFixed(1)}`, 0, -8);
      
      // Terminals
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
};

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
  isSimulating,
  measurements
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const getTerminalPosition = useCallback((component: CircuitComponent, terminal: 'positive' | 'negative') => {
    const iconData = COMPONENT_ICONS[component.type];
    if (!iconData) return { x: component.x, y: component.y };
    
    const angle = component.rotation * Math.PI / 180;
    const offset = terminal === 'positive' ? -30 : 30;
    
    return {
      x: component.x + Math.cos(angle) * offset,
      y: component.y + Math.sin(angle) * offset
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw wires
    wires.forEach(wire => {
      const startComp = components.find(c => c.id === wire.startComponentId);
      const endComp = components.find(c => c.id === wire.endComponentId);
      
      if (startComp && endComp) {
        const startPos = getTerminalPosition(startComp, wire.startTerminal);
        const endPos = getTerminalPosition(endComp, wire.endTerminal);
        
        ctx.strokeStyle = isSimulating && wire.current ? '#00ff00' : '#888';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        
        // Draw through intermediate points
        wire.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();

        // Draw electron flow animation
        if (isSimulating && wire.current && wire.current > 0) {
          const time = Date.now() / 500;
          const numElectrons = Math.min(Math.floor(wire.current * 3), 10);
          
          for (let i = 0; i < numElectrons; i++) {
            const t = ((time + i / numElectrons) % 1);
            const electronX = startPos.x + (endPos.x - startPos.x) * t;
            const electronY = startPos.y + (endPos.y - startPos.y) * t;
            
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(electronX, electronY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    });

    // Draw wire being drawn
    if (isDrawingWire && wireStart && currentMousePos) {
      const startComp = components.find(c => c.id === wireStart.componentId);
      if (startComp) {
        const startPos = getTerminalPosition(startComp, wireStart.terminal);
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw components
    components.forEach(component => {
      const iconData = COMPONENT_ICONS[component.type];
      if (iconData) {
        // Selection highlight
        if (selectedComponent === component.id) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            component.x - iconData.width / 2 - 5,
            component.y - iconData.height / 2 - 5,
            iconData.width + 10,
            iconData.height + 10
          );
        }
        
        iconData.draw(ctx, component.x, component.y, component.rotation, component.isOn, component.value);
      }
    });

    animationRef.current = requestAnimationFrame(draw);
  }, [components, wires, selectedComponent, isDrawingWire, wireStart, currentMousePos, isSimulating, getTerminalPosition]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a terminal
    for (const component of components) {
      const posPos = getTerminalPosition(component, 'positive');
      const negPos = getTerminalPosition(component, 'negative');
      
      if (Math.hypot(x - posPos.x, y - posPos.y) < 10) {
        onTerminalClick(component.id, 'positive');
        return;
      }
      if (Math.hypot(x - negPos.x, y - negPos.y) < 10) {
        onTerminalClick(component.id, 'negative');
        return;
      }
    }

    // Check if clicking on a component
    for (const component of components) {
      const iconData = COMPONENT_ICONS[component.type];
      if (!iconData) continue;
      
      if (
        x >= component.x - iconData.width / 2 &&
        x <= component.x + iconData.width / 2 &&
        y >= component.y - iconData.height / 2 &&
        y <= component.y + iconData.height / 2
      ) {
        setDragging(component.id);
        setDragOffset({ x: x - component.x, y: y - component.y });
        onComponentSelect(component.id);
        return;
      }
    }

    onComponentSelect(null);
    onCanvasClick(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragging) {
      onComponentMove(dragging, x - dragOffset.x, y - dragOffset.y);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Toggle switch or rotate component
    for (const component of components) {
      const iconData = COMPONENT_ICONS[component.type];
      if (!iconData) continue;
      
      if (
        x >= component.x - iconData.width / 2 &&
        x <= component.x + iconData.width / 2 &&
        y >= component.y - iconData.height / 2 &&
        y <= component.y + iconData.height / 2
      ) {
        if (component.type === 'switch') {
          // Toggle handled externally
        }
        return;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-600 rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Measurements overlay */}
      {isSimulating && (
        <div className="absolute top-2 right-2 bg-black/80 p-3 rounded-lg text-sm">
          <div className="text-green-400">⚡ الجهد: {measurements.voltage.toFixed(2)} V</div>
          <div className="text-yellow-400">⚡ التيار: {measurements.current.toFixed(3)} A</div>
          <div className="text-red-400">⚡ القدرة: {measurements.power.toFixed(3)} W</div>
        </div>
      )}
    </motion.div>
  );
}
