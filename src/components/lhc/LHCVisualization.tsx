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

      // Draw main ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsl(180, 100%, 50%)';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'hsl(180, 100%, 50%)';
      ctx.stroke();

      // Draw magnets
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(280, 100%, 60%)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'hsl(280, 100%, 60%)';
        ctx.fill();
      }

      // Draw detectors
      const detectorPositions = [
        { angle: 0, name: 'ATLAS', color: 'hsl(210, 100%, 60%)' },
        { angle: Math.PI, name: 'CMS', color: 'hsl(30, 100%, 60%)' }
      ];

      detectorPositions.forEach(detector => {
        const x = centerX + Math.cos(detector.angle) * radius;
        const y = centerY + Math.sin(detector.angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = detector.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = detector.color;
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(detector.name, x, y - 25);
      });

      if (beamsLaunched) {
        const speed = beamSpeed * 0.05;
        beam1AngleRef.current += speed;
        beam2AngleRef.current -= speed;

        // Beam 1 (clockwise)
        for (let i = 0; i < 20; i++) {
          const angle = beam1AngleRef.current - (i * 0.3);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(180, 100%, 70%, ${1 - i * 0.05})`;
          ctx.fill();
        }

        // Beam 2 (counter-clockwise)
        for (let i = 0; i < 20; i++) {
          const angle = beam2AngleRef.current + (i * 0.3);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(320, 100%, 70%, ${1 - i * 0.05})`;
          ctx.fill();
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
