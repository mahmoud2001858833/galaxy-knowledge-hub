
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
    const starCount = Math.min(Math.floor((canvas.width * canvas.height) / 3000), 300); // Responsive star density with upper limit
    
    // Create stars
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * 2.5; // Vary star sizes
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: `hsla(${Math.random() * 60 + 200}, 80%, 80%, 1)`, // Blue to cyan hues
        velocity: Math.random() * 0.05 + 0.02,
        alpha: Math.random() * 0.8 + 0.2, // Variable brightness
        alphaChange: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1), // Twinkling effect
      });
    }

    // Create meteors
    let meteors: { x: number; y: number; length: number; speed: number; life: number; totalLife: number }[] = [];
    
    const addMeteor = () => {
      meteors.push({
        x: Math.random() * canvas.width,
        y: 0,
        length: Math.random() * 80 + 50,
        speed: Math.random() * 4 + 8,
        life: 0,
        totalLife: Math.random() * 50 + 80
      });
    };
    
    // Occasionally add a meteor
    setInterval(() => {
      if (Math.random() > 0.7) addMeteor();
    }, 3000);

    // Animation
    const animation = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(12, 20, 39, 0.8)');
      gradient.addColorStop(1, 'rgba(7, 15, 29, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebula
      for (let i = 0; i < 3; i++) {
        const x = canvas.width * [0.2, 0.8, 0.5][i];
        const y = canvas.height * [0.3, 0.7, 0.5][i];
        const radius = canvas.width * [0.2, 0.15, 0.25][i];
        
        const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const colors = [
          ['rgba(50, 100, 180, 0.1)', 'rgba(30, 60, 120, 0.05)', 'rgba(10, 20, 40, 0)'],
          ['rgba(80, 70, 170, 0.08)', 'rgba(50, 40, 100, 0.04)', 'rgba(20, 10, 30, 0)'],
          ['rgba(60, 140, 180, 0.07)', 'rgba(30, 80, 110, 0.03)', 'rgba(10, 30, 50, 0)']
        ][i];
        
        nebulaGradient.addColorStop(0, colors[0]);
        nebulaGradient.addColorStop(0.6, colors[1]);
        nebulaGradient.addColorStop(1, colors[2]);
        
        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw stars
      stars.forEach((star, i) => {
        // Update star position - subtle drift effect
        star.y += star.velocity;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Twinkling effect
        star.alpha += star.alphaChange;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.alphaChange *= -1;
        }
        
        // Draw star - subtle glow effect
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace('1)', `${star.alpha})`);
        ctx.fill();
        
        // Add subtle glow for brighter stars
        if (star.radius > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(
            star.x, star.y, star.radius * 0.5,
            star.x, star.y, star.radius * 3
          );
          glow.addColorStop(0, star.color.replace('1)', '0.3)'));
          glow.addColorStop(1, star.color.replace('1)', '0)'));
          ctx.fillStyle = glow;
          ctx.fill();
        }
      });
      
      // Update and draw meteors
      meteors = meteors.filter(meteor => {
        meteor.life++;
        
        if (meteor.life > meteor.totalLife) return false;
        
        const progress = meteor.life / meteor.totalLife;
        const alpha = progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2;
        
        // Move meteor
        meteor.x += meteor.speed;
        meteor.y += meteor.speed;
        
        // Draw meteor
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.length, meteor.y - meteor.length);
        
        const gradient = ctx.createLinearGradient(
          meteor.x, meteor.y,
          meteor.x - meteor.length, meteor.y - meteor.length
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(30, 110, 200, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
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
