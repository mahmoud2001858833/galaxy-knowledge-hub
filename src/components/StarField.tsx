
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
      size: number;
    }> = [];
    
    // Initialize stars
    const initStars = () => {
      stars = [];
      // Adjust star count based on screen size for performance
      const finalStarCount = window.innerWidth < 768 ? Math.min(starCount, 150) : starCount;
      
      for (let i = 0; i < finalStarCount; i++) {
        const radius = Math.random() * (maxSize - minSize) + minSize;
        const brightness = 0.2 + Math.random() * 0.8;
        const twinkleSpeed = 0.5 + Math.random() * 2; // Reduced for performance
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
    let lastFrameTime = 0;
    const fps = 30; // Limit FPS for better performance
    const fpsInterval = 1000 / fps;
    
    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Throttle frame rate for performance
      if (currentTime - lastFrameTime < fpsInterval) return;
      lastFrameTime = currentTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        // Calculate current brightness based on twinkling
        const currentBrightness = 
          star.brightness * 
          (0.5 + 0.5 * Math.sin(Date.now() * 0.0008 * star.twinkleSpeed + star.twinklePhase));
        
        // Update position
        star.y += speed / (star.radius * 0.5);
        
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
        
        // Only draw glow effect for larger stars
        if (star.radius > maxSize * 0.7) {
          // Create gradient for star glow
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 1.5
          );
          
          gradient.addColorStop(0, `rgba(255, 255, 255, ${currentBrightness * 0.8})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
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
    animationFrameId = requestAnimationFrame(animate);
    
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
      style={{ opacity: 0.6 }}
    />
  );
};

export default StarField;
