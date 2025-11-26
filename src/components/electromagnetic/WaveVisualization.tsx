import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveVisualizationProps {
  frequency: number;
  amplitude: number;
  waveType: string;
}

export const WaveVisualization = ({ frequency, amplitude, waveType }: WaveVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animationRef = useRef<number>();

  const getWaveColor = (type: string) => {
    switch (type) {
      case 'radio': return { main: 'hsl(0, 100%, 60%)', glow: 'hsl(0, 100%, 50%)' };
      case 'microwave': return { main: 'hsl(30, 100%, 60%)', glow: 'hsl(30, 100%, 50%)' };
      case 'infrared': return { main: 'hsl(50, 100%, 60%)', glow: 'hsl(50, 100%, 50%)' };
      case 'visible': return { main: 'hsl(200, 100%, 60%)', glow: 'hsl(200, 100%, 50%)' };
      case 'ultraviolet': return { main: 'hsl(270, 100%, 60%)', glow: 'hsl(270, 100%, 50%)' };
      case 'xray': return { main: 'hsl(240, 100%, 60%)', glow: 'hsl(240, 100%, 50%)' };
      case 'gamma': return { main: 'hsl(280, 100%, 60%)', glow: 'hsl(280, 100%, 50%)' };
      default: return { main: 'hsl(200, 100%, 60%)', glow: 'hsl(200, 100%, 50%)' };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const colors = getWaveColor(waveType);
      timeRef.current += 0.02;

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw Electric Field (E) - Main wave
      ctx.beginPath();
      ctx.strokeStyle = colors.main;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = colors.glow;

      for (let x = 0; x < width; x++) {
        const scaledFreq = frequency / 100;
        const y = centerY + Math.sin((x * scaledFreq * 0.02) - timeRef.current) * amplitude * 60;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw glow effect
      ctx.beginPath();
      ctx.strokeStyle = colors.glow + '60';
      ctx.lineWidth = 8;
      ctx.shadowBlur = 25;
      
      for (let x = 0; x < width; x++) {
        const scaledFreq = frequency / 100;
        const y = centerY + Math.sin((x * scaledFreq * 0.02) - timeRef.current) * amplitude * 60;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw Magnetic Field (B) - Perpendicular wave
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.strokeStyle = 'hsl(120, 100%, 60%)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'hsl(120, 100%, 50%)';

      for (let x = 0; x < width; x++) {
        const scaledFreq = frequency / 100;
        const y = centerY + Math.cos((x * scaledFreq * 0.02) - timeRef.current) * amplitude * 40;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Draw wave properties labels
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('E (مجال كهربائي)', 20, 30);
      ctx.fillStyle = 'hsl(120, 100%, 60%)';
      ctx.fillText('B (مجال مغناطيسي)', 20, 50);

      // Draw wavelength indicator
      const scaledFreq = frequency / 100;
      const wavelengthPx = (2 * Math.PI) / (scaledFreq * 0.02);
      
      if (wavelengthPx < width && wavelengthPx > 20) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const y1 = centerY + Math.sin(-timeRef.current) * amplitude * 60;
        const y2 = centerY + Math.sin((wavelengthPx * scaledFreq * 0.02) - timeRef.current) * amplitude * 60;
        
        ctx.beginPath();
        ctx.moveTo(0, y1);
        ctx.lineTo(wavelengthPx, y1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, y1);
        ctx.lineTo(0, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(wavelengthPx, y2);
        ctx.lineTo(wavelengthPx, centerY);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('λ', wavelengthPx / 2 - 10, centerY - 10);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequency, amplitude, waveType]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full rounded-lg bg-gray-900/50"
      />
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">السرعة: c = 3×10⁸ m/s</p>
      </div>
    </motion.div>
  );
};

export default WaveVisualization;
