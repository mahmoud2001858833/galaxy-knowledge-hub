import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw outer ring glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      const outerGradient = ctx.createRadialGradient(centerX, centerY, radius - 5, centerX, centerY, radius + 15);
      outerGradient.addColorStop(0, 'hsla(180, 100%, 50%, 0)');
      outerGradient.addColorStop(0.5, 'hsla(180, 100%, 50%, 0.3)');
      outerGradient.addColorStop(1, 'hsla(180, 100%, 50%, 0)');
      ctx.strokeStyle = outerGradient;
      ctx.lineWidth = 20;
      ctx.stroke();

      // Draw main ring with 3D effect
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - i * 2, 0, Math.PI * 2);
        const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        gradient.addColorStop(0, 'hsl(180, 100%, 60%)');
        gradient.addColorStop(0.5, 'hsl(200, 100%, 70%)');
        gradient.addColorStop(1, 'hsl(180, 100%, 50%)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6 - i;
        ctx.shadowBlur = 30 - i * 5;
        ctx.shadowColor = 'hsl(180, 100%, 50%)';
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
        { angle: 0, name: 'ATLAS', color: 'hsl(210, 100%, 60%)', color2: 'hsl(210, 100%, 75%)' },
        { angle: Math.PI, name: 'CMS', color: 'hsl(30, 100%, 60%)', color2: 'hsl(30, 100%, 75%)' }
      ];

      detectorPositions.forEach(detector => {
        const x = centerX + Math.cos(detector.angle) * radius;
        const y = centerY + Math.sin(detector.angle) * radius;
        
        // Detector outer glow
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        const detectorGlow = ctx.createRadialGradient(x, y, 0, x, y, 25);
        detectorGlow.addColorStop(0, detector.color + 'cc');
        detectorGlow.addColorStop(1, detector.color + '00');
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

        // Beam 1 (clockwise) - Proton beam with enhanced particles
        for (let i = 0; i < 25; i++) {
          const angle = beam1AngleRef.current - (i * 0.25);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const alpha = 1 - i * 0.04;
          const size = 5 - i * 0.15;
          
          // Particle glow
          ctx.beginPath();
          ctx.arc(x, y, size + 3, 0, Math.PI * 2);
          const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, size + 3);
          particleGlow.addColorStop(0, `hsla(180, 100%, 70%, ${alpha})`);
          particleGlow.addColorStop(1, `hsla(180, 100%, 70%, 0)`);
          ctx.fillStyle = particleGlow;
          ctx.fill();
          
          // Particle core
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          const particleGradient = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, size);
          particleGradient.addColorStop(0, `hsla(180, 100%, 90%, ${alpha})`);
          particleGradient.addColorStop(1, `hsla(180, 100%, 60%, ${alpha})`);
          ctx.fillStyle = particleGradient;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsla(180, 100%, 70%, ${alpha})`;
          ctx.fill();
          
          // Particle trail
          if (i > 0) {
            const prevAngle = beam1AngleRef.current - ((i - 1) * 0.25);
            const prevX = centerX + Math.cos(prevAngle) * radius;
            const prevY = centerY + Math.sin(prevAngle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `hsla(180, 100%, 70%, ${alpha * 0.3})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Beam 2 (counter-clockwise) - Lead ion beam with enhanced particles
        for (let i = 0; i < 25; i++) {
          const angle = beam2AngleRef.current + (i * 0.25);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const alpha = 1 - i * 0.04;
          const size = 6 - i * 0.18;
          
          // Particle glow (larger for lead ions)
          ctx.beginPath();
          ctx.arc(x, y, size + 4, 0, Math.PI * 2);
          const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, size + 4);
          particleGlow.addColorStop(0, `hsla(320, 100%, 70%, ${alpha})`);
          particleGlow.addColorStop(1, `hsla(320, 100%, 70%, 0)`);
          ctx.fillStyle = particleGlow;
          ctx.fill();
          
          // Particle core with metallic look
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          const particleGradient = ctx.createRadialGradient(x - 1.5, y - 1.5, 0, x, y, size);
          particleGradient.addColorStop(0, `hsla(320, 100%, 85%, ${alpha})`);
          particleGradient.addColorStop(0.5, `hsla(320, 100%, 65%, ${alpha})`);
          particleGradient.addColorStop(1, `hsla(320, 100%, 50%, ${alpha})`);
          ctx.fillStyle = particleGradient;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsla(320, 100%, 70%, ${alpha})`;
          ctx.fill();
          
          // Inner highlight
          ctx.beginPath();
          ctx.arc(x - 1, y - 1, size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(320, 100%, 95%, ${alpha * 0.6})`;
          ctx.fill();
          
          // Particle trail
          if (i > 0) {
            const prevAngle = beam2AngleRef.current + ((i - 1) * 0.25);
            const prevX = centerX + Math.cos(prevAngle) * radius;
            const prevY = centerY + Math.sin(prevAngle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `hsla(320, 100%, 70%, ${alpha * 0.3})`;
            ctx.lineWidth = 2.5;
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
        width={500} 
        height={500}
        className="max-w-full"
      />
      
      {collisionActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 2, 4] }}
          transition={{ duration: 1, times: [0, 0.3, 1] }}
          onAnimationComplete={onCollisionComplete}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-white via-yellow-400 to-red-500 blur-xl" />
        </motion.div>
      )}
    </div>
  );
};
