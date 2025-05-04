
import React, { useEffect, useRef } from 'react';

const StarField = () => {
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

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Star properties
    const stars: { x: number; y: number; radius: number; color: string; velocity: number; alpha: number; alphaChange: number }[] = [];
    const starCount = Math.min(Math.floor((canvas.width * canvas.height) / 2500), 500); // Increased star density with higher upper limit
    
    // Create stars with more varied sizes and colors
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * 3.5; // Increased max size for stars
      // More color variety - blues, purples, and some whites
      const hue = Math.random() > 0.85 ? 60 : Math.random() * 80 + 180;
      const saturation = Math.random() > 0.7 ? 0 : 80; // Some white stars (0% saturation)
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: `hsla(${hue}, ${saturation}%, 80%, 1)`,
        velocity: Math.random() * 0.05 + 0.02,
        alpha: Math.random() * 0.8 + 0.2, // Variable brightness
        alphaChange: (Math.random() * 0.03 + 0.005) * (Math.random() > 0.5 ? 1 : -1), // Enhanced twinkling effect
      });
    }

    // Create meteors
    let meteors: { x: number; y: number; length: number; speed: number; life: number; totalLife: number }[] = [];
    
    const addMeteor = () => {
      meteors.push({
        x: Math.random() * canvas.width,
        y: 0,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 6 + 8,
        life: 0,
        totalLife: Math.random() * 60 + 80
      });
    };
    
    // More frequently add meteors
    setInterval(() => {
      if (Math.random() > 0.6) addMeteor();
    }, 2000);

    // Animation
    const animation = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient - enhanced colors
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 18, 35, 0.8)'); // Darker blue at top
      gradient.addColorStop(1, 'rgba(5, 12, 25, 0.8)'); // Even darker blue at bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw more nebulas with enhanced colors
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * [0.2, 0.8, 0.5, 0.3, 0.7][i % 5];
        const y = canvas.height * [0.3, 0.7, 0.5, 0.2, 0.8][i % 5];
        const radius = canvas.width * [0.2, 0.15, 0.25, 0.18, 0.22][i % 5];
        
        const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // More varied nebula colors
        const colors = [
          ['rgba(50, 100, 180, 0.12)', 'rgba(30, 60, 120, 0.06)', 'rgba(10, 20, 40, 0)'],
          ['rgba(80, 70, 170, 0.1)', 'rgba(50, 40, 100, 0.05)', 'rgba(20, 10, 30, 0)'],
          ['rgba(60, 140, 180, 0.08)', 'rgba(30, 80, 110, 0.04)', 'rgba(10, 30, 50, 0)'],
          ['rgba(110, 70, 150, 0.09)', 'rgba(70, 40, 100, 0.04)', 'rgba(30, 15, 40, 0)'],
          ['rgba(40, 130, 200, 0.1)', 'rgba(25, 70, 130, 0.05)', 'rgba(10, 25, 60, 0)'],
        ][i % 5];
        
        nebulaGradient.addColorStop(0, colors[0]);
        nebulaGradient.addColorStop(0.6, colors[1]);
        nebulaGradient.addColorStop(1, colors[2]);
        
        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw stars with enhanced effects
      stars.forEach((star, i) => {
        // Update star position - subtle drift effect
        star.y += star.velocity;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Enhanced twinkling effect
        star.alpha += star.alphaChange;
        if (star.alpha > 1 || star.alpha < 0.1) {
          star.alphaChange *= -1;
        }
        
        // Draw star - enhanced glow effect
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace('1)', `${star.alpha})`);
        ctx.fill();
        
        // Enhanced glow for all stars, more visible for brighter ones
        const glowSize = star.radius > 1.5 ? star.radius * 3 : star.radius * 2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(
          star.x, star.y, star.radius * 0.5,
          star.x, star.y, glowSize
        );
        const glowIntensity = star.radius > 1.5 ? 0.4 : 0.2;
        glow.addColorStop(0, star.color.replace('1)', `${glowIntensity * star.alpha})`));
        glow.addColorStop(1, star.color.replace('1)', '0)'));
        ctx.fillStyle = glow;
        ctx.fill();
      });
      
      // Update and draw meteors with enhanced effects
      meteors = meteors.filter(meteor => {
        meteor.life++;
        
        if (meteor.life > meteor.totalLife) return false;
        
        const progress = meteor.life / meteor.totalLife;
        const alpha = progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2;
        
        // Move meteor
        meteor.x += meteor.speed;
        meteor.y += meteor.speed;
        
        // Draw meteor with enhanced trail
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.length, meteor.y - meteor.length);
        
        const gradient = ctx.createLinearGradient(
          meteor.x, meteor.y,
          meteor.x - meteor.length, meteor.y - meteor.length
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.1, `rgba(200, 220, 255, ${alpha * 0.8})`);
        gradient.addColorStop(0.4, `rgba(100, 170, 255, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(30, 110, 200, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3; // Thicker line for more visibility
        ctx.stroke();
        
        // Add a small glow at the head of the meteor
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        return true;
      });

      requestAnimationFrame(animation);
    };

    // Start animation
    animation();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default StarField;
