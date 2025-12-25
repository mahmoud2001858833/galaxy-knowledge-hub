import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, RotateCcw, Layers, Thermometer, Zap, Hammer, Atom, FlaskConical, Binary } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  targetOpacity: number;
  element: 'A' | 'B';
}

const MaterialsScienceSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'crystal' | 'alloy' | 'stress' | 'phase'>('crystal');
  const [temperature, setTemperature] = useState(300);
  const [stress, setStress] = useState(0);
  const [composition, setComposition] = useState(50);
  const [time, setTime] = useState(0);
  const [phasePoint, setPhasePoint] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [materialState, setMaterialState] = useState<'solid' | 'liquid' | 'mixed'>('solid');

  // Initialize particles for alloy simulation
  const initializeParticles = useCallback(() => {
    const particles: Particle[] = [];
    const cols = 20;
    const rows = 12;
    const spacing = 25;
    const startX = 80;
    const startY = 100;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isElementB = Math.random() * 100 < composition;
        particles.push({
          x: startX + col * spacing + (row % 2) * (spacing / 2),
          y: startY + row * spacing * 0.866,
          vx: 0,
          vy: 0,
          radius: 10,
          color: isElementB ? '#ef4444' : '#3b82f6',
          opacity: 0,
          targetOpacity: 1,
          element: isElementB ? 'B' : 'A'
        });
      }
    }
    particlesRef.current = particles;
  }, [composition]);

  useEffect(() => {
    if (simulationType === 'alloy') {
      initializeParticles();
    }
  }, [simulationType, initializeParticles]);

  // Update material state based on temperature
  useEffect(() => {
    if (temperature < 500) setMaterialState('solid');
    else if (temperature < 1000) setMaterialState('mixed');
    else setMaterialState('liquid');
  }, [temperature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      // Clear with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#1e1b4b');
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      drawStars(ctx, canvas);

      if (simulationType === 'crystal') {
        drawCrystalStructure(ctx, canvas);
      } else if (simulationType === 'alloy') {
        drawAlloySimulation(ctx, canvas);
      } else if (simulationType === 'stress') {
        drawStressStrainSimulation(ctx, canvas);
      } else if (simulationType === 'phase') {
        drawPhaseDiagram(ctx, canvas);
      }

      if (isPlaying) {
        setTime(prev => prev + 0.02);
      }

      animationId = requestAnimationFrame(animate);
    };

    const drawStars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.456 + time * 0.01) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 789.012 + time * 0.01) * 0.5 + 0.5) * canvas.height;
        const opacity = Math.sin(time * 2 + i) * 0.3 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawCrystalStructure = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const structures = ['BCC', 'FCC', 'HCP'];
      const structureIndex = Math.floor(time / 4) % 3;
      const currentStructure = structures[structureIndex];
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = 90;
      const rotationY = time * 0.3;
      const rotationX = 0.4;

      // 3D rotation helper
      const rotate3D = (x: number, y: number, z: number) => {
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        
        return { x: x1 + centerX, y: y1 + centerY, z: z2 };
      };

      // Draw unit cell edges with glow
      const drawEdge = (p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}) => {
        const opacity = 0.3 + (p1.z + p2.z) / 400;
        ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(147, 197, 253, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      // Draw atom with glow and slow fade-in
      const drawAtom = (x: number, y: number, z: number, color: string, atomSize: number = 18, fadeDelay: number = 0) => {
        const pos = rotate3D(x, y, z);
        const scale = 1 + pos.z / 250;
        const fadeProgress = Math.min(1, Math.max(0, (time - fadeDelay) / 2));
        
        if (fadeProgress <= 0) return;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, atomSize * scale * 2);
        glowGradient.addColorStop(0, color.replace(')', `, ${0.4 * fadeProgress})`).replace('rgb', 'rgba'));
        glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, atomSize * scale * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main atom
        const gradient = ctx.createRadialGradient(pos.x - 3, pos.y - 3, 0, pos.x, pos.y, atomSize * scale);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${fadeProgress})`);
        gradient.addColorStop(0.3, color.replace(')', `, ${fadeProgress})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, `rgba(0,0,0,${0.5 * fadeProgress})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, atomSize * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * fadeProgress})`;
        ctx.beginPath();
        ctx.arc(pos.x - atomSize * scale * 0.3, pos.y - atomSize * scale * 0.3, atomSize * scale * 0.2, 0, Math.PI * 2);
        ctx.fill();
      };

      // Define corners
      const corners = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ].map(([x, y, z]) => rotate3D(x * size, y * size, z * size));

      // Draw edges
      [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a, b]) => {
        drawEdge(corners[a], corners[b]);
      });

      // Draw atoms based on structure with staggered fade-in
      if (currentStructure === 'BCC') {
        [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(([x,y,z], i) => {
          drawAtom(x * size, y * size, z * size, 'rgb(96, 165, 250)', 16, i * 0.15);
        });
        drawAtom(0, 0, 0, 'rgb(248, 113, 113)', 20, 0.8);
      } else if (currentStructure === 'FCC') {
        [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(([x,y,z], i) => {
          drawAtom(x * size, y * size, z * size, 'rgb(96, 165, 250)', 15, i * 0.12);
        });
        [[0,0,-1],[0,0,1],[-1,0,0],[1,0,0],[0,-1,0],[0,1,0]].forEach(([x,y,z], i) => {
          drawAtom(x * size, y * size, z * size, 'rgb(74, 222, 128)', 17, 0.8 + i * 0.1);
        });
      } else {
        const hexRadius = size * 0.75;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          drawAtom(Math.cos(angle) * hexRadius, -size, Math.sin(angle) * hexRadius, 'rgb(96, 165, 250)', 15, i * 0.1);
          drawAtom(Math.cos(angle) * hexRadius, size, Math.sin(angle) * hexRadius, 'rgb(96, 165, 250)', 15, 0.6 + i * 0.1);
        }
        drawAtom(0, -size, 0, 'rgb(96, 165, 250)', 15, 0.3);
        drawAtom(0, size, 0, 'rgb(96, 165, 250)', 15, 0.9);
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 + Math.PI / 6;
          drawAtom(Math.cos(angle) * hexRadius * 0.55, 0, Math.sin(angle) * hexRadius * 0.55, 'rgb(251, 191, 36)', 18, 1.2 + i * 0.15);
        }
      }

      // Title with glow
      ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      const structureNames: Record<string, string> = {
        'BCC': 'BCC - مكعب مركزي الجسم',
        'FCC': 'FCC - مكعب مركزي الوجوه',
        'HCP': 'HCP - سداسي مكتظ'
      };
      ctx.fillText(structureNames[currentStructure], centerX, 45);
      ctx.shadowBlur = 0;

      // Examples
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      const examples: Record<string, string> = {
        'BCC': 'مثال: الحديد، الكروم، التنغستن',
        'FCC': 'مثال: الألمنيوم، النحاس، الذهب',
        'HCP': 'مثال: التيتانيوم، الزنك، المغنيسيوم'
      };
      ctx.fillText(examples[currentStructure], centerX, 75);
    };

    const drawAlloySimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Update and draw particles with slow fade-in
      particlesRef.current.forEach((p, i) => {
        // Slow fade-in effect
        if (p.opacity < p.targetOpacity) {
          p.opacity = Math.min(p.targetOpacity, p.opacity + 0.008);
        }

        // Thermal vibration based on temperature
        const vibrationIntensity = temperature / 200;
        p.vx = (Math.random() - 0.5) * vibrationIntensity;
        p.vy = (Math.random() - 0.5) * vibrationIntensity;

        // State-based behavior
        if (materialState === 'liquid') {
          // More movement in liquid state
          p.vx += (Math.random() - 0.5) * 2;
          p.vy += (Math.random() - 0.5) * 2;
        }

        const displayX = p.x + Math.sin(time * 3 + i * 0.5) * vibrationIntensity;
        const displayY = p.y + Math.cos(time * 3 + i * 0.7) * vibrationIntensity;

        // Draw glow
        const glowGradient = ctx.createRadialGradient(displayX, displayY, 0, displayX, displayY, p.radius * 2.5);
        glowGradient.addColorStop(0, p.element === 'B' ? 
          `rgba(239, 68, 68, ${0.4 * p.opacity})` : 
          `rgba(59, 130, 246, ${0.4 * p.opacity})`);
        glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(displayX, displayY, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw atom
        const gradient = ctx.createRadialGradient(displayX - 2, displayY - 2, 0, displayX, displayY, p.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        gradient.addColorStop(0.4, p.element === 'B' ? 
          `rgba(248, 113, 113, ${p.opacity})` : 
          `rgba(96, 165, 250, ${p.opacity})`);
        gradient.addColorStop(1, p.element === 'B' ? 
          `rgba(185, 28, 28, ${p.opacity})` : 
          `rgba(29, 78, 216, ${p.opacity})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(displayX, displayY, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * p.opacity})`;
        ctx.beginPath();
        ctx.arc(displayX - p.radius * 0.3, displayY - p.radius * 0.3, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });

      // Title
      ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`سبيكة ثنائية - نسبة العنصر B: ${composition}%`, canvas.width / 2, 35);
      ctx.shadowBlur = 0;

      // Material state indicator
      ctx.font = '16px Arial';
      const stateColors = { solid: '#3b82f6', mixed: '#f59e0b', liquid: '#ef4444' };
      const stateNames = { solid: 'صلب', mixed: 'مختلط', liquid: 'سائل' };
      ctx.fillStyle = stateColors[materialState];
      ctx.fillText(`الحالة: ${stateNames[materialState]}`, canvas.width / 2, 60);

      // Legend with better styling
      const legendY = canvas.height - 50;
      
      // Element A
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(80, legendY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(80, legendY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`عنصر A (${100 - composition}%)`, 55, legendY + 5);

      // Element B
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(canvas.width - 80, legendY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(canvas.width - 80, legendY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(`عنصر B (${composition}%)`, canvas.width - 55, legendY + 5);

      // Temperature display
      ctx.textAlign = 'center';
      ctx.fillText(`درجة الحرارة: ${temperature}°C`, canvas.width / 2, legendY + 5);
    };

    const drawStressStrainSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const originalWidth = 220;
      const originalHeight = 100;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 30;

      const strain = stress / 100;
      const currentWidth = originalWidth * (1 + strain * 0.5);
      const currentHeight = originalHeight * (1 - strain * 0.2);

      // Draw sample with gradient and cracks at high stress
      const sampleGradient = ctx.createLinearGradient(centerX - currentWidth / 2, 0, centerX + currentWidth / 2, 0);
      sampleGradient.addColorStop(0, '#4c1d95');
      sampleGradient.addColorStop(0.3, '#6d28d9');
      sampleGradient.addColorStop(0.5, '#7c3aed');
      sampleGradient.addColorStop(0.7, '#6d28d9');
      sampleGradient.addColorStop(1, '#4c1d95');
      
      ctx.fillStyle = sampleGradient;
      ctx.beginPath();
      ctx.roundRect(centerX - currentWidth / 2, centerY - currentHeight / 2, currentWidth, currentHeight, 8);
      ctx.fill();

      // Outer glow
      ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Internal grain structure
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + strain * 0.2})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const grainX = centerX - currentWidth / 2 + (i + 0.5) * (currentWidth / 12);
        const grainDeform = Math.sin(time * 2 + i) * 3 * (strain + 0.1);
        ctx.beginPath();
        ctx.ellipse(grainX + grainDeform, centerY, 12 * (1 + strain * 0.3), 18 * (1 - strain * 0.2), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cracks at high stress
      if (stress > 60) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${(stress - 60) / 40})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const crackX = centerX - currentWidth / 4 + i * (currentWidth / 4);
          ctx.beginPath();
          ctx.moveTo(crackX, centerY - currentHeight / 3);
          ctx.lineTo(crackX + (Math.random() - 0.5) * 20, centerY);
          ctx.lineTo(crackX + (Math.random() - 0.5) * 15, centerY + currentHeight / 3);
          ctx.stroke();
        }
      }

      // Force arrows with glow
      const arrowLength = 80 + stress * 0.5;
      ctx.shadowColor = 'rgba(248, 113, 113, 0.8)';
      ctx.shadowBlur = 15;
      
      // Left arrow
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - currentWidth / 2 - arrowLength, centerY);
      ctx.lineTo(centerX - currentWidth / 2 - 15, centerY);
      ctx.stroke();
      
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.moveTo(centerX - currentWidth / 2 - 10, centerY);
      ctx.lineTo(centerX - currentWidth / 2 - 30, centerY - 12);
      ctx.lineTo(centerX - currentWidth / 2 - 30, centerY + 12);
      ctx.closePath();
      ctx.fill();

      // Right arrow
      ctx.beginPath();
      ctx.moveTo(centerX + currentWidth / 2 + arrowLength, centerY);
      ctx.lineTo(centerX + currentWidth / 2 + 15, centerY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + currentWidth / 2 + 10, centerY);
      ctx.lineTo(centerX + currentWidth / 2 + 30, centerY - 12);
      ctx.lineTo(centerX + currentWidth / 2 + 30, centerY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Stress-strain curve
      const graphX = 50;
      const graphY = canvas.height - 60;
      const graphW = 200;
      const graphH = 130;

      // Graph background
      ctx.fillStyle = 'rgba(30, 27, 75, 0.8)';
      ctx.beginPath();
      ctx.roundRect(graphX - 15, graphY - graphH - 15, graphW + 40, graphH + 45, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Curve with gradient
      const curveGradient = ctx.createLinearGradient(graphX, 0, graphX + graphW, 0);
      curveGradient.addColorStop(0, '#22c55e');
      curveGradient.addColorStop(0.3, '#eab308');
      curveGradient.addColorStop(0.7, '#f97316');
      curveGradient.addColorStop(1, '#ef4444');
      
      ctx.strokeStyle = curveGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      for (let x = 0; x <= graphW; x++) {
        const strainVal = x / graphW;
        let stressVal;
        if (strainVal < 0.3) {
          stressVal = strainVal * 3;
        } else if (strainVal < 0.7) {
          stressVal = 0.9 + (strainVal - 0.3) * 0.2;
        } else {
          stressVal = 0.98 - (strainVal - 0.7) * 0.4;
        }
        ctx.lineTo(graphX + x, graphY - stressVal * graphH);
      }
      ctx.stroke();

      // Current point with glow
      const currentX = graphX + (stress / 100) * graphW;
      let currentStress;
      if (strain < 0.3) currentStress = strain * 3;
      else if (strain < 0.7) currentStress = 0.9 + (strain - 0.3) * 0.2;
      else currentStress = 0.98 - (strain - 0.7) * 0.4;
      
      ctx.shadowColor = 'rgba(248, 113, 113, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(currentX, graphY - currentStress * graphH, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('انفعال (ε)', graphX + graphW / 2, graphY + 18);

      // Info display
      ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`الإجهاد: ${stress} MPa`, canvas.width - 30, 35);
      ctx.fillText(`الانفعال: ${(strain * 100).toFixed(1)}%`, canvas.width - 30, 60);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText('σ = E × ε (قانون هوك)', canvas.width - 30, 85);
      ctx.shadowBlur = 0;

      // Region labels
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('مرن', graphX + graphW * 0.15, graphY - graphH - 5);
      ctx.fillStyle = '#eab308';
      ctx.fillText('لدن', graphX + graphW * 0.5, graphY - graphH - 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('كسر', graphX + graphW * 0.85, graphY - graphH - 5);
    };

    const drawPhaseDiagram = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const graphX = 120;
      const graphY = canvas.height - 80;
      const graphW = canvas.width - 240;
      const graphH = canvas.height - 160;

      // Graph background
      ctx.fillStyle = 'rgba(30, 27, 75, 0.6)';
      ctx.beginPath();
      ctx.roundRect(graphX - 30, graphY - graphH - 30, graphW + 60, graphH + 80, 15);
      ctx.fill();

      // Phase regions with better gradients
      // Liquid region
      const liquidGradient = ctx.createLinearGradient(graphX, graphY - graphH, graphX, graphY - graphH * 0.5);
      liquidGradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
      liquidGradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      ctx.fillStyle = liquidGradient;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH);
      ctx.lineTo(graphX + graphW, graphY - graphH);
      ctx.lineTo(graphX + graphW, graphY - graphH * 0.6);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.35, graphX, graphY - graphH * 0.7);
      ctx.closePath();
      ctx.fill();

      // Solid + Liquid region
      const mixedGradient = ctx.createLinearGradient(graphX, graphY - graphH * 0.6, graphX, graphY - graphH * 0.3);
      mixedGradient.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      mixedGradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
      ctx.fillStyle = mixedGradient;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.7);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.35, graphX + graphW, graphY - graphH * 0.6);
      ctx.lineTo(graphX + graphW, graphY - graphH * 0.3);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.12, graphX, graphY - graphH * 0.4);
      ctx.closePath();
      ctx.fill();

      // Solid region
      const solidGradient = ctx.createLinearGradient(graphX, graphY - graphH * 0.4, graphX, graphY);
      solidGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      solidGradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
      ctx.fillStyle = solidGradient;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.4);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.12, graphX + graphW, graphY - graphH * 0.3);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.lineTo(graphX, graphY);
      ctx.closePath();
      ctx.fill();

      // Liquidus line with glow
      ctx.shadowColor = 'rgba(248, 113, 113, 0.8)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.7);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.35, graphX + graphW, graphY - graphH * 0.6);
      ctx.stroke();

      // Solidus line with glow
      ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
      ctx.strokeStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH * 0.4);
      ctx.quadraticCurveTo(graphX + graphW / 2, graphY - graphH * 0.12, graphX + graphW, graphY - graphH * 0.3);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY - graphH);
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Interactive point
      const pointX = graphX + (phasePoint.x / 100) * graphW;
      const pointY = graphY - (phasePoint.y / 100) * graphH;
      
      // Point glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(pointX, pointY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Point inner
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Drag hint if not dragging
      if (!isDragging) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('اسحب النقطة', pointX, pointY + 28);
      }

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('التركيب (%B)', graphX + graphW / 2, graphY + 30);
      ctx.fillText('0%', graphX, graphY + 25);
      ctx.fillText('100%', graphX + graphW, graphY + 25);

      ctx.save();
      ctx.translate(graphX - 45, graphY - graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('درجة الحرارة (°C)', 0, 0);
      ctx.restore();

      // Phase labels with glow
      ctx.font = 'bold 18px Arial';
      ctx.shadowBlur = 10;
      
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('سائل', graphX + graphW / 2, graphY - graphH * 0.82);
      
      ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
      ctx.fillStyle = '#fcd34d';
      ctx.fillText('سائل + صلب', graphX + graphW / 2, graphY - graphH * 0.42);
      
      ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('صلب', graphX + graphW / 2, graphY - graphH * 0.08);
      ctx.shadowBlur = 0;

      // Current values display
      ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 180, 80, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`التركيب: ${phasePoint.x.toFixed(0)}% B`, 185, 50);
      ctx.fillText(`الحرارة: ${(phasePoint.y * 15).toFixed(0)}°C`, 185, 75);

      // Determine phase at current point
      const normalizedY = phasePoint.y / 100;
      const liquidusY = 0.7 - (Math.abs(phasePoint.x - 50) / 100) * 0.35;
      const solidusY = 0.4 - (Math.abs(phasePoint.x - 50) / 100) * 0.28;
      
      let phase = 'صلب';
      let phaseColor = '#60a5fa';
      if (normalizedY > liquidusY) {
        phase = 'سائل';
        phaseColor = '#f87171';
      } else if (normalizedY > solidusY) {
        phase = 'سائل + صلب';
        phaseColor = '#fbbf24';
      }

      ctx.fillStyle = phaseColor;
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`الطور: ${phase}`, 185, 100);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, temperature, stress, composition, time, phasePoint, isDragging, materialState]);

  // Handle phase diagram interaction
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (simulationType !== 'phase') return;
    setIsDragging(true);
    handleCanvasMouseMove(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || simulationType !== 'phase') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const graphX = 120;
    const graphY = canvas.height - 80;
    const graphW = canvas.width - 240;
    const graphH = canvas.height - 160;

    const newX = Math.max(0, Math.min(100, ((x - graphX) / graphW) * 100));
    const newY = Math.max(0, Math.min(100, ((graphY - y) / graphH) * 100));

    setPhasePoint({ x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const resetSimulation = () => {
    setTime(0);
    setIsPlaying(true);
    setTemperature(300);
    setStress(0);
    setComposition(50);
    setPhasePoint({ x: 50, y: 50 });
    if (simulationType === 'alloy') {
      initializeParticles();
    }
  };

  const simulationTypes = [
    { id: 'crystal', label: 'بلورات', icon: Layers },
    { id: 'alloy', label: 'سبائك', icon: Zap },
    { id: 'stress', label: 'إجهاد', icon: Hammer },
    { id: 'phase', label: 'أطوار', icon: Thermometer }
  ];

  const quizQuestions = [
    {
      question: "ما هو عدد الذرات في الخلية الواحدة لبنية BCC؟",
      options: ["1 ذرة", "2 ذرة", "4 ذرات", "6 ذرات"],
      correctIndex: 1,
      explanation: "بنية BCC تحتوي على ذرة واحدة في المركز و 8 ذرات في الأركان (كل ركن يساهم بـ 1/8)، المجموع = 1 + 8×(1/8) = 2 ذرة"
    },
    {
      question: "ما هي العلاقة بين الإجهاد والانفعال في المنطقة المرنة؟",
      options: ["علاقة تربيعية", "علاقة خطية", "علاقة لوغاريتمية", "لا توجد علاقة"],
      correctIndex: 1,
      explanation: "في المنطقة المرنة، يتبع المعدن قانون هوك حيث σ = E × ε، وهي علاقة خطية"
    },
    {
      question: "ماذا يحدث عند خط السيولة في مخطط الأطوار؟",
      options: ["يبدأ التبلور", "ينتهي التبلور", "يذوب الصلب تماماً", "لا يحدث شيء"],
      correctIndex: 0,
      explanation: "خط السيولة (Liquidus) يمثل بداية التجمد عند التبريد أو نهاية الانصهار عند التسخين"
    },
    {
      question: "أي من التالي يعتبر مثالاً على بنية FCC؟",
      options: ["الحديد", "التيتانيوم", "الألمنيوم", "الكروم"],
      correctIndex: 2,
      explanation: "الألمنيوم والنحاس والذهب كلها معادن ذات بنية FCC (مكعب مركزي الوجوه)"
    },
    {
      question: "ما تأثير زيادة درجة الحرارة على اهتزاز ذرات السبيكة؟",
      options: ["تقل الاهتزازات", "تزيد الاهتزازات", "لا تتأثر", "تتوقف الاهتزازات"],
      correctIndex: 1,
      explanation: "زيادة درجة الحرارة تزيد الطاقة الحركية للذرات مما يزيد من اهتزازاتها"
    }
  ];

  const formulas = [
    { name: "قانون هوك", formula: "σ = E × ε", description: "العلاقة بين الإجهاد والانفعال" },
    { name: "معامل يونغ", formula: "E = σ / ε", description: "مقياس صلابة المادة" },
    { name: "قاعدة الرافعة", formula: "WL = (Cα - C0) / (Cα - CL)", description: "لحساب نسب الأطوار" }
  ];

  const facts = [
    "الألماس هو أصلب مادة طبيعية بسبب بنيته البلورية الفريدة",
    "سبيكة النيتينول تتذكر شكلها الأصلي عند تسخينها",
    "الزجاج ليس صلباً بل سائل فائق اللزوجة",
    "الفولاذ المقاوم للصدأ يحتوي على 10-20% كروم"
  ];

  return (
    <SimulationLayout 
      title="علوم المواد"
      titleGradient="from-purple-400 via-violet-400 to-indigo-400"
      backgroundGradient="from-purple-900/20 via-indigo-900/30 to-violet-900/20"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas Section */}
        <div className="lg:col-span-2">
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 rounded-2xl p-4 border border-purple-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-xl cursor-pointer"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </motion.div>

          {/* Info Section */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <InfoSection 
              formulas={formulas}
              facts={facts}
              explanation="علوم المواد تدرس العلاقة بين البنية الذرية والخصائص الميكانيكية والحرارية للمواد"
            />
          </motion.div>
        </div>

        {/* Controls Section */}
        <div className="space-y-4">
          {/* Simulation Type - Vertical */}
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 rounded-2xl p-4 border border-purple-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <Atom className="h-5 w-5" />
              نوع المحاكاة
            </h3>
            <div className="flex flex-col gap-2">
              {simulationTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={simulationType === type.id ? "default" : "outline"}
                  onClick={() => { setSimulationType(type.id as any); resetSimulation(); }}
                  className={`w-full justify-start gap-2 ${
                    simulationType === type.id 
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 border-purple-400' 
                      : 'border-purple-500/30 hover:border-purple-400/50'
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Parameters */}
          {(simulationType === 'alloy' || simulationType === 'phase') && (
            <motion.div 
              className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 rounded-2xl p-4 border border-purple-500/20 backdrop-blur-sm space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div>
                <label className="text-sm font-medium flex items-center gap-2 text-orange-300">
                  <Thermometer className="h-4 w-4" />
                  درجة الحرارة: {temperature}°C
                </label>
                <Slider
                  value={[temperature]}
                  onValueChange={([v]) => setTemperature(v)}
                  min={0}
                  max={1500}
                  step={10}
                  className="mt-2"
                />
              </div>
              {simulationType === 'alloy' && (
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 text-blue-300">
                    <FlaskConical className="h-4 w-4" />
                    نسبة العنصر B: {composition}%
                  </label>
                  <Slider
                    value={[composition]}
                    onValueChange={([v]) => { setComposition(v); initializeParticles(); }}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </motion.div>
          )}

          {simulationType === 'stress' && (
            <motion.div 
              className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 rounded-2xl p-4 border border-purple-500/20 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-sm font-medium flex items-center gap-2 text-red-300">
                <Hammer className="h-4 w-4" />
                الإجهاد: {stress} MPa
              </label>
              <Slider
                value={[stress]}
                onValueChange={([v]) => setStress(v)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </motion.div>
          )}

          {/* Playback Controls */}
          <motion.div 
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
            >
              {isPlaying ? <Pause className="h-4 w-4 ml-2" /> : <Play className="h-4 w-4 ml-2" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button variant="outline" onClick={resetSimulation} className="border-purple-500/30 hover:border-purple-400/50">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Concepts */}
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 rounded-2xl p-4 border border-purple-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-purple-300">
              <Binary className="h-5 w-5" />
              المفاهيم العلمية
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              {simulationType === 'crystal' && (
                <>
                  <p>• <span className="text-blue-400 font-medium">BCC:</span> مكعب مركزي الجسم - 2 ذرة/خلية</p>
                  <p>• <span className="text-green-400 font-medium">FCC:</span> مكعب مركزي الوجوه - 4 ذرات/خلية</p>
                  <p>• <span className="text-yellow-400 font-medium">HCP:</span> سداسي مكتظ - 6 ذرات/خلية</p>
                </>
              )}
              {simulationType === 'alloy' && (
                <>
                  <p>• السبائك تجمع خصائص عناصر مختلفة</p>
                  <p>• المحلول الصلب البديلي والخلالي</p>
                  <p>• التركيب والحرارة يؤثران على البنية</p>
                </>
              )}
              {simulationType === 'stress' && (
                <>
                  <p>• <span className="text-green-400 font-medium">المرن:</span> تشوه قابل للاسترجاع</p>
                  <p>• <span className="text-yellow-400 font-medium">اللدن:</span> تشوه دائم</p>
                  <p>• <span className="text-red-400 font-medium">الكسر:</span> فشل المادة</p>
                </>
              )}
              {simulationType === 'phase' && (
                <>
                  <p>• <span className="text-red-400 font-medium">خط السيولة:</span> بداية التجمد</p>
                  <p>• <span className="text-blue-400 font-medium">خط الصلابة:</span> نهاية التجمد</p>
                  <p>• اسحب النقطة لاستكشاف الأطوار</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Quiz Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuizSection questions={quizQuestions} title="اختبر معلوماتك" />
          </motion.div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default MaterialsScienceSimulation;