import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Magnet, Compass, Settings, Info, BookOpen } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { SimulationLayout, SimulationCard, SimulationControls, InfoSection, QuizSection } from '@/components/simulations';

const ElectromagnetismLabSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [current, setCurrent] = useState(5);
  const [wireType, setWireType] = useState<'straight' | 'loop' | 'solenoid' | 'motor'>('straight');
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [time, setTime] = useState(0);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(0);
  const [motorAngle, setMotorAngle] = useState(0);

  const mu0 = 4 * Math.PI * 1e-7;

  const calculateMagneticField = useCallback((x: number, y: number, wireX: number, wireY: number): { bx: number; by: number } => {
    const dx = x - wireX;
    const dy = y - wireY;
    const r = Math.sqrt(dx * dx + dy * dy);
    
    if (r < 10) return { bx: 0, by: 0 };
    
    const B = (mu0 * current) / (2 * Math.PI * r) * 1e6;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    
    return {
      bx: B * Math.cos(angle),
      by: B * Math.sin(angle)
    };
  }, [current]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#1e1b4b');
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Animated grid
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.05 + 0.02 * Math.sin(time)})`;
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (wireType === 'straight') {
        drawStraightWire(ctx, centerX, centerY, width, height);
      } else if (wireType === 'loop') {
        drawLoopWire(ctx, centerX, centerY, width, height);
      } else if (wireType === 'solenoid') {
        drawSolenoid(ctx, centerX, centerY, width, height);
      } else if (wireType === 'motor') {
        drawMotor(ctx, centerX, centerY, width, height);
      }

      // Draw compass needles
      if (showCompass && wireType !== 'motor') {
        drawCompasses(ctx, centerX, centerY);
      }

      setTime(prev => prev + 0.02);
      if (wireType === 'motor') {
        setMotorAngle(prev => prev + current * 0.05);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    const drawStraightWire = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) => {
      // Wire glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60);
      glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(centerX - 60, 0, 120, height);

      // Wire
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      // Wire highlight
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 2, 0);
      ctx.lineTo(centerX - 2, height);
      ctx.stroke();

      // Animated current arrows
      for (let i = 0; i < 5; i++) {
        const arrowY = ((time * 100 + i * 100) % height);
        ctx.save();
        ctx.translate(centerX, arrowY);
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.moveTo(-12, 15);
        ctx.lineTo(0, 0);
        ctx.lineTo(12, 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Magnetic field circles with particles
      if (showFieldLines) {
        for (let r = 50; r <= 200; r += 40) {
          const intensity = Math.max(0.2, 1 - r / 250);
          
          // Field line
          ctx.strokeStyle = `rgba(147, 51, 234, ${intensity * 0.8})`;
          ctx.lineWidth = 2 + intensity;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated direction arrows
          if (showParticles) {
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 3) {
              const arrowAngle = angle + time * (current > 0 ? 1 : -1);
              const ax = centerX + r * Math.cos(arrowAngle);
              const ay = centerY + r * Math.sin(arrowAngle);
              
              ctx.save();
              ctx.translate(ax, ay);
              ctx.rotate(arrowAngle + Math.PI / 2);
              
              // Glowing particle
              const particleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
              particleGradient.addColorStop(0, `rgba(167, 139, 250, ${intensity})`);
              particleGradient.addColorStop(1, 'transparent');
              ctx.fillStyle = particleGradient;
              ctx.fillRect(-12, -12, 24, 24);
              
              ctx.fillStyle = `rgba(167, 139, 250, ${intensity})`;
              ctx.beginPath();
              ctx.moveTo(0, -10);
              ctx.lineTo(7, 7);
              ctx.lineTo(-7, 7);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }

      // Calculate field strength at specific point
      const field = calculateMagneticField(centerX + 100, centerY, centerX, centerY);
      setMagneticFieldStrength(Math.sqrt(field.bx * field.bx + field.by * field.by));

      // Labels
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('سلك يحمل تياراً كهربائياً', centerX, 35);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('B ∝ I/r', centerX, height - 25);

      // Right-hand rule indicator
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.beginPath();
      ctx.arc(80, 80, 50, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px Arial';
      ctx.fillText('👆', 80, 75);
      ctx.fillText('قاعدة اليد اليمنى', 80, 100);
    };

    const drawLoopWire = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) => {
      const loopRadius = 100;

      // Glow effect
      const glowGradient = ctx.createRadialGradient(centerX, centerY, loopRadius - 20, centerX, centerY, loopRadius + 40);
      glowGradient.addColorStop(0, 'transparent');
      glowGradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, loopRadius + 40, 0, 2 * Math.PI);
      ctx.fill();

      // Wire loop
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, loopRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // Highlight
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, loopRadius - 2, 0, 2 * Math.PI);
      ctx.stroke();

      // Animated current arrows on loop
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI + time;
        const ax = centerX + loopRadius * Math.cos(angle);
        const ay = centerY + loopRadius * Math.sin(angle);
        
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(6, 6);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Field lines through center
      if (showFieldLines) {
        const fieldStrength = current * 0.5;
        
        for (let offset = -40; offset <= 40; offset += 20) {
          ctx.strokeStyle = `rgba(147, 51, 234, ${0.7 - Math.abs(offset) / 100})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          for (let t = -200; t <= 200; t += 5) {
            const spread = Math.abs(t) / 200;
            const x = centerX + offset * (1 + spread * 0.8);
            const y = centerY + t;
            
            if (t === -200) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Arrows
          if (showParticles) {
            const arrowT = ((time * 50) % 300) - 150;
            const spread = Math.abs(arrowT) / 200;
            const arrowX = centerX + offset * (1 + spread * 0.8);
            const arrowY = centerY + arrowT;
            
            ctx.fillStyle = '#a78bfa';
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - 8);
            ctx.lineTo(arrowX + 6, arrowY + 8);
            ctx.lineTo(arrowX - 6, arrowY + 8);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Central field indicator
      ctx.fillStyle = 'rgba(147, 51, 234, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('B', centerX, centerY + 8);

      // Labels
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ملف دائري', centerX, 35);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('B = μ₀I/2r', centerX, height - 25);
    };

    const drawSolenoid = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) => {
      const numLoops = 10;
      const loopSpacing = 35;
      const loopRadius = 60;
      const startX = centerX - (numLoops * loopSpacing) / 2;

      // Solenoid body glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
      ctx.fillRect(startX - 20, centerY - loopRadius - 20, numLoops * loopSpacing + 40, loopRadius * 2 + 40);

      // Draw loops
      for (let i = 0; i < numLoops; i++) {
        const loopX = startX + i * loopSpacing;
        const phase = (i / numLoops) * Math.PI * 2;
        
        // 3D effect - back part
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(loopX, centerY, 15, loopRadius, 0, 0, Math.PI);
        ctx.stroke();
        
        // Front part
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(loopX, centerY, 15, loopRadius, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // Connecting wires
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, centerY - loopRadius);
      ctx.lineTo(startX + (numLoops - 1) * loopSpacing, centerY - loopRadius);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(startX, centerY + loopRadius);
      ctx.lineTo(startX + (numLoops - 1) * loopSpacing, centerY + loopRadius);
      ctx.stroke();

      // Magnetic field inside
      if (showFieldLines) {
        for (let offset = -35; offset <= 35; offset += 17) {
          ctx.strokeStyle = 'rgba(147, 51, 234, 0.9)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(startX - 80, centerY + offset);
          ctx.lineTo(startX + numLoops * loopSpacing + 80, centerY + offset);
          ctx.stroke();

          // Animated arrows
          if (showParticles) {
            const arrowX = startX + ((time * 80) % (numLoops * loopSpacing + 100));
            ctx.save();
            ctx.translate(arrowX, centerY + offset);
            ctx.fillStyle = '#a78bfa';
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-6, -8);
            ctx.lineTo(-6, 8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }

        // External field (curved)
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)';
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(startX + numLoops * loopSpacing + 60, centerY + i * 20);
          ctx.bezierCurveTo(
            width - 50, centerY + i * 60,
            50, centerY + i * 60,
            startX - 60, centerY + i * 20
          );
          ctx.stroke();
        }
      }

      // N and S poles
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('N', startX + numLoops * loopSpacing + 60, centerY + 10);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('S', startX - 60, centerY + 10);

      // Labels
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ملف لولبي (سولينويد)', centerX, 35);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('B = μ₀nI', centerX, height - 25);
    };

    const drawMotor = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) => {
      // Motor housing
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Magnets
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(centerX - 160, centerY - 50, 30, 100);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(centerX + 130, centerY - 50, 30, 100);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('N', centerX - 145, centerY + 8);
      ctx.fillText('S', centerX + 145, centerY + 8);

      // Rotating coil
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(motorAngle);
      
      // Coil
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.strokeRect(-80, -40, 160, 80);
      
      // Coil sides with current direction
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(-80, 0, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⊙', -80, 5);
      
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(80, 0, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.fillText('⊗', 80, 5);
      
      ctx.restore();

      // Axis
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.fill();

      // Commutator
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 170, 25, 0, Math.PI);
      ctx.fill();

      // Brushes
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(centerX - 35, centerY + 160, 15, 30);
      ctx.fillRect(centerX + 20, centerY + 160, 15, 30);

      // Force arrows
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(motorAngle);
      
      // Force on left side (up)
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-80, 0);
      ctx.lineTo(-80, -60);
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(-80, -70);
      ctx.lineTo(-90, -50);
      ctx.lineTo(-70, -50);
      ctx.closePath();
      ctx.fill();
      
      // Force on right side (down)
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(80, 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(80, 70);
      ctx.lineTo(70, 50);
      ctx.lineTo(90, 50);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();

      // Labels
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('المحرك الكهربائي', centerX, 35);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('F = BIL', centerX, height - 25);

      // RPM indicator
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${Math.floor(current * 60)} RPM`, centerX, height - 50);
    };

    const drawCompasses = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      const compassPositions = [
        { x: centerX - 180, y: centerY - 120 },
        { x: centerX + 180, y: centerY - 120 },
        { x: centerX - 180, y: centerY + 120 },
        { x: centerX + 180, y: centerY + 120 },
      ];

      compassPositions.forEach(pos => {
        const field = calculateMagneticField(pos.x, pos.y, centerX, centerY);
        const angle = Math.atan2(field.by, field.bx);

        // Compass background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
        ctx.fill();
        
        // Compass ring
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cardinal directions
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', pos.x, pos.y - 20);
        ctx.fillText('S', pos.x, pos.y + 25);
        ctx.fillText('E', pos.x + 22, pos.y + 4);
        ctx.fillText('W', pos.x - 22, pos.y + 4);

        // Needle with smooth animation
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        
        // North needle (red)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-4, -5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        
        // South needle (white)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(4, -5);
        ctx.lineTo(4, 5);
        ctx.closePath();
        ctx.fill();
        
        // Center pin
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
      });
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, current, wireType, showFieldLines, showCompass, showParticles, calculateMagneticField, time, motorAngle]);

  const resetSimulation = () => {
    setTime(0);
    setCurrent(5);
    setMotorAngle(0);
    setIsPlaying(true);
  };

  const quizQuestions = [
    {
      question: 'ما هو اتجاه المجال المغناطيسي حول سلك يحمل تياراً كهربائياً؟',
      options: ['خطوط مستقيمة', 'دوائر متحدة المركز', 'حلزوني', 'عشوائي'],
      correctIndex: 1,
      explanation: 'المجال المغناطيسي حول سلك مستقيم يشكل دوائر متحدة المركز حول السلك، ويُحدد اتجاهها بقاعدة اليد اليمنى.'
    },
    {
      question: 'كيف تتغير شدة المجال المغناطيسي مع زيادة المسافة عن السلك؟',
      options: ['تزداد', 'تنقص', 'تبقى ثابتة', 'تتذبذب'],
      correctIndex: 1,
      explanation: 'شدة المجال المغناطيسي تتناسب عكسياً مع المسافة (B ∝ 1/r)، أي أنها تنقص كلما ابتعدنا عن السلك.'
    },
    {
      question: 'ما الذي يميز السولينويد عن الملف الدائري؟',
      options: ['لا يولد مجالاً مغناطيسياً', 'المجال منتظم داخله', 'يحتاج تياراً أكبر', 'المجال خارجي فقط'],
      correctIndex: 1,
      explanation: 'السولينويد يولد مجالاً مغناطيسياً منتظماً وقوياً داخله، مشابهاً للمغناطيس ذي القطبين.'
    },
    {
      question: 'في المحرك الكهربائي، ما الذي يسبب دوران الملف؟',
      options: ['الجاذبية', 'القوة المغناطيسية على التيار', 'الحرارة', 'الضغط'],
      correctIndex: 1,
      explanation: 'القوة المغناطيسية (F = BIL) تؤثر على السلك الحامل للتيار في المجال المغناطيسي، مما يسبب دوران الملف.'
    },
  ];

  const getExplanation = () => {
    switch(wireType) {
      case 'straight':
        return 'المجال المغناطيسي حول سلك مستقيم يشكل دوائر متحدة المركز. يتناسب المجال طردياً مع التيار وعكسياً مع المسافة. استخدم قاعدة اليد اليمنى لتحديد الاتجاه.';
      case 'loop':
        return 'الملف الدائري يولد مجالاً مغناطيسياً يمر عبر مركزه. كلما زاد عدد اللفات، زادت شدة المجال. يُستخدم في المحركات والمولدات.';
      case 'solenoid':
        return 'السولينويد يولد مجالاً مغناطيسياً قوياً ومنتظماً داخله، مشابهاً للمغناطيس الطبيعي. يُستخدم في الكهرومغناطيسات والمرحلات الكهربائية.';
      case 'motor':
        return 'المحرك الكهربائي يحول الطاقة الكهربائية إلى طاقة حركية. القوة المغناطيسية على السلك الحامل للتيار تسبب دوران الملف.';
      default:
        return '';
    }
  };

  return (
    <SimulationLayout
      title="مختبر الكهرومغناطيسية"
      titleGradient="from-purple-400 to-blue-400"
      backgroundGradient="from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <SimulationCard color="purple">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-lg"
            />
            
            <SimulationControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={resetSimulation}
              primaryColor="purple"
            />
          </SimulationCard>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          <SimulationCard title="لوحة التحكم" icon={Settings} color="purple" delay={0.1}>
            {/* Wire Type Selection */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
              <Tabs value={wireType} onValueChange={(v) => setWireType(v as any)}>
                <TabsList className="grid grid-cols-2 bg-slate-700/50 gap-1 p-1">
                  <TabsTrigger value="straight" className="text-xs data-[state=active]:bg-purple-600">سلك مستقيم</TabsTrigger>
                  <TabsTrigger value="loop" className="text-xs data-[state=active]:bg-purple-600">ملف دائري</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-2 bg-slate-700/50 gap-1 p-1 mt-1">
                  <TabsTrigger value="solenoid" className="text-xs data-[state=active]:bg-purple-600">سولينويد</TabsTrigger>
                  <TabsTrigger value="motor" className="text-xs data-[state=active]:bg-purple-600">محرك كهربائي</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Current Control */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                شدة التيار: <span className="text-yellow-400 font-mono">{current.toFixed(1)} A</span>
              </label>
              <Slider
                value={[current]}
                onValueChange={(v) => setCurrent(v[0])}
                min={0.5}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                <span className="text-sm text-slate-300">خطوط المجال</span>
                <Switch checked={showFieldLines} onCheckedChange={setShowFieldLines} />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                <span className="text-sm text-slate-300">البوصلات</span>
                <Switch checked={showCompass} onCheckedChange={setShowCompass} />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                <span className="text-sm text-slate-300">الجسيمات المتحركة</span>
                <Switch checked={showParticles} onCheckedChange={setShowParticles} />
              </label>
            </div>
          </SimulationCard>

          {/* Info Card */}
          <SimulationCard title="المعلومات" icon={Info} color="blue" delay={0.2}>
            <InfoSection
              data={[
                { label: 'شدة المجال', value: magneticFieldStrength.toFixed(4), unit: 'μT', color: 'text-purple-300' },
                { label: 'التيار', value: current, unit: 'A', color: 'text-yellow-300' },
              ]}
              explanation={getExplanation()}
              formulas={[
                { name: 'سلك مستقيم', formula: 'B = μ₀I / 2πr' },
                { name: 'ملف دائري', formula: 'B = μ₀I / 2r' },
                { name: 'سولينويد', formula: 'B = μ₀nI' },
              ]}
              facts={[
                'μ₀ (نفاذية الفراغ) = 4π × 10⁻⁷ T·m/A',
                'اكتشف أورستد العلاقة بين الكهرباء والمغناطيسية عام 1820',
                'المحرك الكهربائي اخترعه مايكل فاراداي عام 1821',
                'أقوى مغناطيس كهربائي في العالم يولد مجالاً بقوة 45.5 تسلا',
              ]}
            />
          </SimulationCard>

          {/* Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <QuizSection questions={quizQuestions} />
          </motion.div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ElectromagnetismLabSimulation;
