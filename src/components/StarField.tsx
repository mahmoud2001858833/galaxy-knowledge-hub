
import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  starCount?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
}

const StarField: React.FC<StarFieldProps> = ({ 
  starCount = 400, 
  speed = 0.5, 
  minSize = 1, 
  maxSize = 3 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Create stars array
    let stars: Array<{
      x: number;
      y: number;
      radius: number;
      brightness: number;
      twinkleSpeed: number;
      twinklePhase: number;
      size: number;
    }> = [];
    
    // Initialize stars
    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const radius = Math.random() * (maxSize - minSize) + minSize;
        const brightness = 0.2 + Math.random() * 0.8;
        const twinkleSpeed = 1 + Math.random() * 3;
        const twinklePhase = Math.random() * Math.PI * 2;
        
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          brightness,
          twinkleSpeed,
          twinklePhase,
          size: radius
        });
      }
    };
    
    // Animate stars
    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        // Calculate current brightness based on twinkling
        const currentBrightness = 
          star.brightness * 
          (0.5 + 0.5 * Math.sin(Date.now() * 0.001 * star.twinkleSpeed + star.twinklePhase));
        
        // Update position
        star.y += speed / (star.radius * 0.5);
        
        // Reset position if star goes off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Draw star
        ctx.beginPath();
        
        // Create gradient for star glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 2
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentBrightness})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw star core
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Handle resize
    const handleResize = () => {
      setCanvasDimensions();
      initStars();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize
    setCanvasDimensions();
    initStars();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starCount, speed, minSize, maxSize]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default StarField;
