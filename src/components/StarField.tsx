
import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  starCount?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
}

const StarField: React.FC<StarFieldProps> = ({ 
  starCount = 200, 
  speed = 0.3, 
  minSize = 1, 
  maxSize = 2.5 
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
    }> = [];
    
    // Initialize stars - optimized for performance
    const initStars = () => {
      stars = [];
      
      // تقليل عدد النجوم بشكل كبير على الموبايل
      const isMobile = window.innerWidth < 768;
      const finalStarCount = isMobile ? 50 : starCount; // 50 نجمة فقط على الموبايل
      
      for (let i = 0; i < finalStarCount; i++) {
        const radius = Math.random() * (maxSize - minSize) + minSize;
        const brightness = 0.2 + Math.random() * 0.8;
        const twinkleSpeed = 0.3 + Math.random() * 1.5;
        const twinklePhase = Math.random() * Math.PI * 2;
        
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          brightness,
          twinkleSpeed,
          twinklePhase
        });
      }
    };
    
    // Animate stars - optimized for performance
    let animationFrameId: number;
    let lastFrameTime = 0;
    // Lower FPS for better performance on lower-end devices
    const isMobile = window.innerWidth < 768;
    const fps = isMobile ? 15 : 30; // FPS أقل على الموبايل
    const fpsInterval = 1000 / fps;
    const actualSpeed = isMobile ? 0 : speed;
    
    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Throttle frame rate for performance
      if (currentTime - lastFrameTime < fpsInterval) return;
      lastFrameTime = currentTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars with optimized rendering
      stars.forEach(star => {
        // Simplified twinkling calculation
        const currentBrightness = 
          star.brightness * 
          (0.5 + 0.5 * Math.sin(Date.now() * 0.0005 * star.twinkleSpeed + star.twinklePhase));
        
        // Update position - slower for less CPU usage (إيقاف الحركة على الهاتف)
        star.y += actualSpeed / (star.radius * 0.7);
        
        // Reset position if star goes off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Simple star rendering for better performance
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Only draw glow effect for larger stars and on higher-end devices
        if (star.radius > maxSize * 0.8 && window.devicePixelRatio > 1) {
          // Create gradient for star glow - simplified for performance
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 1.3
          );
          
          gradient.addColorStop(0, `rgba(255, 255, 255, ${currentBrightness * 0.7})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, star.radius * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };
    
    // Handle resize with debouncing for performance
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        setCanvasDimensions();
        initStars();
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize
    setCanvasDimensions();
    initStars();
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
    };
  }, [starCount, speed, minSize, maxSize]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default StarField;
