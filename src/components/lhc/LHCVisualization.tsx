import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LHCVisualizationProps {
  beamsLaunched: boolean;
  beamSpeed: number;
  collisionActive: boolean;
  onCollisionComplete?: () => void;
}

export const LHCVisualization = ({ 
  beamsLaunched, 
  beamSpeed,
  collisionActive,
  onCollisionComplete
}: LHCVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const beam1AngleRef = useRef(0);
  const beam2AngleRef = useRef(Math.PI);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [temperature, setTemperature] = useState(0);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play launch sound
  const playLaunchSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // Play collision sound
  const playCollisionSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const noiseNode = ctx.createBufferSource();
    
    // Create white noise for explosion effect
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseNode.buffer = buffer;
    
    oscillator.connect(gainNode);
    noiseNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    noiseNode.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    noiseNode.stop(ctx.currentTime + 0.5);
  };

  // Temperature effect
  useEffect(() => {
    if (collisionActive) {
      playCollisionSound();
      let temp = 0;
      const interval = setInterval(() => {
        temp += 1000;
        setTemperature(temp);
        if (temp >= 100000) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      setTemperature(0);
    }
  }, [collisionActive]);

  useEffect(() => {
    if (beamsLaunched) {
      playLaunchSound();
    }
  }, [beamsLaunched]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 220; // Increased radius
    const time = Date.now() * 0.001;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw multiple colored ring glows with animation
      const colors = [
        { h: 180, s: 100, l: 50 },
        { h: 280, s: 100, l: 60 },
        { h: 320, s: 100, l: 55 },
        { h: 60, s: 100, l: 50 },
        { h: 120, s: 100, l: 45 }
      ];
      
      colors.forEach((color, i) => {
        const offset = Math.sin(time + i) * 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 15 + offset, 0, Math.PI * 2);
        const outerGradient = ctx.createRadialGradient(
          centerX, centerY, radius - 5, 
          centerX, centerY, radius + 20 + offset
        );
        outerGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
        outerGradient.addColorStop(0.5, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${0.4 + Math.sin(time * 2 + i) * 0.2})`);
        outerGradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
        ctx.strokeStyle = outerGradient;
        ctx.lineWidth = 25;
        ctx.stroke();
      });

      // Draw main ring with enhanced 3D effect and multiple colors
      const ringColors = [
        { start: 0, color: 'hsl(180, 100%, 60%)' },
        { start: 0.2, color: 'hsl(280, 100%, 65%)' },
        { start: 0.4, color: 'hsl(320, 100%, 60%)' },
        { start: 0.6, color: 'hsl(60, 100%, 55%)' },
        { start: 0.8, color: 'hsl(120, 100%, 50%)' },
        { start: 1, color: 'hsl(180, 100%, 60%)' }
      ];
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - i * 3, 0, Math.PI * 2);
        const gradient = ctx.createLinearGradient(
          centerX - radius, 
          centerY - radius, 
          centerX + radius, 
          centerY + radius
        );
        ringColors.forEach(rc => {
          gradient.addColorStop(rc.start, rc.color);
        });
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10 - i;
        ctx.shadowBlur = 40 - i * 5;
        ctx.shadowColor = ringColors[i % ringColors.length].color;
        ctx.stroke();
      }

      // Draw inner ring glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
      const innerGradient = ctx.createRadialGradient(centerX, centerY, radius - 20, centerX, centerY, radius - 5);
      innerGradient.addColorStop(0, 'hsla(180, 100%, 50%, 0)');
      innerGradient.addColorStop(1, 'hsla(180, 100%, 50%, 0.2)');
      ctx.strokeStyle = innerGradient;
      ctx.lineWidth = 15;
      ctx.stroke();

      // Draw magnets with improved design
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Magnet outer glow
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        const magnetGlow = ctx.createRadialGradient(x, y, 0, x, y, 14);
        magnetGlow.addColorStop(0, 'hsla(280, 100%, 70%, 0.8)');
        magnetGlow.addColorStop(1, 'hsla(280, 100%, 60%, 0)');
        ctx.fillStyle = magnetGlow;
        ctx.fill();
        
        // Magnet core
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        const magnetGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 10);
        magnetGradient.addColorStop(0, 'hsl(280, 100%, 75%)');
        magnetGradient.addColorStop(1, 'hsl(280, 100%, 55%)');
        ctx.fillStyle = magnetGradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'hsl(280, 100%, 60%)';
        ctx.fill();
        
        // Magnet inner highlight
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(280, 100%, 90%, 0.6)';
        ctx.fill();
      }

      // Draw detectors with enhanced design
      const detectorPositions = [
        { angle: 0, name: 'ATLAS', color: 'hsl(210, 100%, 60%)', color2: 'hsl(210, 100%, 75%)', alpha: 0.8 },
        { angle: Math.PI, name: 'CMS', color: 'hsl(30, 100%, 60%)', color2: 'hsl(30, 100%, 75%)', alpha: 0.8 }
      ];

      detectorPositions.forEach(detector => {
        const x = centerX + Math.cos(detector.angle) * radius;
        const y = centerY + Math.sin(detector.angle) * radius;
        
        // Detector outer glow
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        const detectorGlow = ctx.createRadialGradient(x, y, 0, x, y, 25);
        detectorGlow.addColorStop(0, detector.color.replace('hsl', 'hsla').replace(')', `, ${detector.alpha})`));
        detectorGlow.addColorStop(1, detector.color.replace('hsl', 'hsla').replace(')', ', 0)'));
        ctx.fillStyle = detectorGlow;
        ctx.fill();
        
        // Detector main body
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        const detectorGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 18);
        detectorGradient.addColorStop(0, detector.color2);
        detectorGradient.addColorStop(1, detector.color);
        ctx.fillStyle = detectorGradient;
        ctx.shadowBlur = 30;
        ctx.shadowColor = detector.color;
        ctx.fill();
        
        // Detector center
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = detector.color2;
        ctx.fill();
        
        // Detector label
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'black';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(detector.name, x, y - 30);
      });

      if (beamsLaunched) {
        const speed = beamSpeed * 0.05;
        beam1AngleRef.current += speed;
        beam2AngleRef.current -= speed;

        // Beam 1 (clockwise) - Proton beam with enhanced particles (MUCH LARGER)
        for (let i = 0; i < 30; i++) {
          const angle = beam1AngleRef.current - (i * 0.2);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const alpha = 1 - i * 0.033;
          const size = 12 - i * 0.35; // Much larger particles
          
          // Particle outer glow (much larger)
          ctx.beginPath();
          ctx.arc(x, y, size + 8, 0, Math.PI * 2);
          const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, size + 8);
          particleGlow.addColorStop(0, `hsla(180, 100%, 80%, ${alpha})`);
          particleGlow.addColorStop(0.5, `hsla(180, 100%, 70%, ${alpha * 0.6})`);
          particleGlow.addColorStop(1, `hsla(180, 100%, 70%, 0)`);
          ctx.fillStyle = particleGlow;
          ctx.fill();
          
          // Particle core with metallic look
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          const particleGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, size);
          particleGradient.addColorStop(0, `hsla(180, 100%, 95%, ${alpha})`);
          particleGradient.addColorStop(0.5, `hsla(180, 100%, 70%, ${alpha})`);
          particleGradient.addColorStop(1, `hsla(180, 100%, 50%, ${alpha})`);
          ctx.fillStyle = particleGradient;
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsla(180, 100%, 80%, ${alpha})`;
          ctx.fill();
          
          // Inner highlight
          ctx.beginPath();
          ctx.arc(x - 2, y - 2, size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(180, 100%, 100%, ${alpha * 0.8})`;
          ctx.fill();
          
          // Particle trail (wider and more visible)
          if (i > 0) {
            const prevAngle = beam1AngleRef.current - ((i - 1) * 0.2);
            const prevX = centerX + Math.cos(prevAngle) * radius;
            const prevY = centerY + Math.sin(prevAngle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `hsla(180, 100%, 70%, ${alpha * 0.5})`;
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }

        // Beam 2 (counter-clockwise) - Lead ion beam with enhanced particles (MUCH LARGER)
        for (let i = 0; i < 30; i++) {
          const angle = beam2AngleRef.current + (i * 0.2);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const alpha = 1 - i * 0.033;
          const size = 14 - i * 0.4; // Even larger for lead ions
          
          // Particle outer glow (much larger for lead ions)
          ctx.beginPath();
          ctx.arc(x, y, size + 10, 0, Math.PI * 2);
          const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, size + 10);
          particleGlow.addColorStop(0, `hsla(320, 100%, 80%, ${alpha})`);
          particleGlow.addColorStop(0.5, `hsla(320, 100%, 70%, ${alpha * 0.7})`);
          particleGlow.addColorStop(1, `hsla(320, 100%, 70%, 0)`);
          ctx.fillStyle = particleGlow;
          ctx.fill();
          
          // Particle core with enhanced metallic look
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          const particleGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, size);
          particleGradient.addColorStop(0, `hsla(320, 100%, 95%, ${alpha})`);
          particleGradient.addColorStop(0.3, `hsla(320, 100%, 75%, ${alpha})`);
          particleGradient.addColorStop(0.7, `hsla(320, 100%, 60%, ${alpha})`);
          particleGradient.addColorStop(1, `hsla(320, 100%, 45%, ${alpha})`);
          ctx.fillStyle = particleGradient;
          ctx.shadowBlur = 25;
          ctx.shadowColor = `hsla(320, 100%, 80%, ${alpha})`;
          ctx.fill();
          
          // Inner highlight (more prominent)
          ctx.beginPath();
          ctx.arc(x - 2.5, y - 2.5, size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(320, 100%, 100%, ${alpha * 0.9})`;
          ctx.fill();
          
          // Particle trail (wider and more visible)
          if (i > 0) {
            const prevAngle = beam2AngleRef.current + ((i - 1) * 0.2);
            const prevX = centerX + Math.cos(prevAngle) * radius;
            const prevY = centerY + Math.sin(prevAngle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `hsla(320, 100%, 70%, ${alpha * 0.5})`;
            ctx.lineWidth = 5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beamsLaunched, beamSpeed]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={700} 
        height={700}
        className="max-w-full"
      />
      
      {/* Temperature display */}
      {collisionActive && temperature > 0 && (
        <motion.div
          className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          🔥 {temperature.toLocaleString()}°C
        </motion.div>
      )}
      
      {collisionActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.8, 0], scale: [0, 1.5, 3, 5] }}
          transition={{ duration: 1.5, times: [0, 0.2, 0.6, 1] }}
          onAnimationComplete={onCollisionComplete}
        >
          <div className="w-64 h-64 rounded-full bg-gradient-to-r from-white via-yellow-300 via-orange-400 to-red-600 blur-2xl animate-pulse" />
        </motion.div>
      )}
    </div>
  );
};
