import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, RotateCcw, Sun, Eye, Sparkles, Waves, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const AdvancedOpticsSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'prism' | 'lens' | 'interference' | 'polarization'>('prism');
  const [prismAngle, setPrismAngle] = useState(60);
  const [focalLength, setFocalLength] = useState(100);
  const [slitDistance, setSlitDistance] = useState(50);
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      // Clear with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0c0a1d');
      bgGradient.addColorStop(0.5, '#1a1035');
      bgGradient.addColorStop(1, '#0c0a1d');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ambient stars
      drawStars(ctx, canvas);

      if (simulationType === 'prism') {
        drawPrismSimulation(ctx, canvas);
      } else if (simulationType === 'lens') {
        drawLensSimulation(ctx, canvas);
      } else if (simulationType === 'interference') {
        drawInterferenceSimulation(ctx, canvas);
      } else if (simulationType === 'polarization') {
        drawPolarizationSimulation(ctx, canvas);
      }

      if (isPlaying) {
        setTime(prev => prev + 0.02);
      }

      animationId = requestAnimationFrame(animate);
    };

    const drawStars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i * 123.456 + time * 0.005) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 789.012 + time * 0.005) * 0.5 + 0.5) * canvas.height;
        const opacity = Math.sin(time * 1.5 + i) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawPrismSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const prismSize = 140;

      // 3D Prism effect
      const angleRad = (prismAngle * Math.PI) / 180;
      const h = prismSize * Math.sin(angleRad / 2);
      const depth = 40;

      // Prism back face (darker)
      ctx.fillStyle = 'rgba(100, 150, 200, 0.15)';
      ctx.beginPath();
      ctx.moveTo(centerX + depth * 0.3, centerY - h - depth * 0.3);
      ctx.lineTo(centerX - prismSize / 2 + depth * 0.3, centerY + h / 2 - depth * 0.3);
      ctx.lineTo(centerX + prismSize / 2 + depth * 0.3, centerY + h / 2 - depth * 0.3);
      ctx.closePath();
      ctx.fill();

      // Prism side faces
      ctx.fillStyle = 'rgba(150, 180, 220, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - h);
      ctx.lineTo(centerX + depth * 0.3, centerY - h - depth * 0.3);
      ctx.lineTo(centerX + prismSize / 2 + depth * 0.3, centerY + h / 2 - depth * 0.3);
      ctx.lineTo(centerX + prismSize / 2, centerY + h / 2);
      ctx.closePath();
      ctx.fill();

      // Prism front face with gradient
      const prismGradient = ctx.createLinearGradient(centerX - prismSize / 2, centerY, centerX + prismSize / 2, centerY);
      prismGradient.addColorStop(0, 'rgba(180, 200, 255, 0.25)');
      prismGradient.addColorStop(0.5, 'rgba(220, 230, 255, 0.35)');
      prismGradient.addColorStop(1, 'rgba(180, 200, 255, 0.25)');
      ctx.fillStyle = prismGradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - h);
      ctx.lineTo(centerX - prismSize / 2, centerY + h / 2);
      ctx.lineTo(centerX + prismSize / 2, centerY + h / 2);
      ctx.closePath();
      ctx.fill();

      // Prism edges with glow
      ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - h);
      ctx.lineTo(centerX - prismSize / 2, centerY + h / 2);
      ctx.lineTo(centerX + prismSize / 2, centerY + h / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Light source with animated glow
      const sourceX = 60;
      const sourceY = centerY - 50;
      const pulseSize = 18 + Math.sin(time * 3) * 3;

      // Outer glow
      const sourceGlow = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, 50);
      sourceGlow.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
      sourceGlow.addColorStop(0.5, 'rgba(255, 255, 100, 0.2)');
      sourceGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
      ctx.fillStyle = sourceGlow;
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Light source center
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffbe0';
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, pulseSize * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Incoming white light beam with glow
      const entryX = centerX - 45;
      const entryY = centerY - h / 4;

      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 20;
      
      // Animated light particles along the beam
      for (let i = 0; i < 8; i++) {
        const progress = ((time * 0.5 + i * 0.125) % 1);
        const px = sourceX + (entryX - sourceX) * progress;
        const py = sourceY + (entryY - sourceY) * progress;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - progress * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main beam
      const beamGradient = ctx.createLinearGradient(sourceX, sourceY, entryX, entryY);
      beamGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
      ctx.strokeStyle = beamGradient;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(entryX, entryY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Spectrum colors with enhanced effects
      const colors = [
        { color: '#ff2020', name: 'أحمر', wavelength: '700nm', angle: 14 + (prismAngle - 60) * 0.1 },
        { color: '#ff8800', name: 'برتقالي', wavelength: '620nm', angle: 17 + (prismAngle - 60) * 0.12 },
        { color: '#ffee00', name: 'أصفر', wavelength: '580nm', angle: 20 + (prismAngle - 60) * 0.14 },
        { color: '#22ff22', name: 'أخضر', wavelength: '530nm', angle: 23 + (prismAngle - 60) * 0.16 },
        { color: '#0088ff', name: 'أزرق', wavelength: '470nm', angle: 26 + (prismAngle - 60) * 0.18 },
        { color: '#4400ff', name: 'نيلي', wavelength: '440nm', angle: 29 + (prismAngle - 60) * 0.2 },
        { color: '#9900ff', name: 'بنفسجي', wavelength: '400nm', angle: 32 + (prismAngle - 60) * 0.22 }
      ];

      const exitX = centerX + 25;
      const exitY = centerY + 10;

      colors.forEach((c, i) => {
        const angleOffset = (c.angle * Math.PI) / 180;
        const rayLength = 220;
        const endX = exitX + Math.cos(angleOffset) * rayLength;
        const endY = exitY + Math.sin(angleOffset) * rayLength;

        // Ray glow
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 15;

        // Animated particles along rays
        for (let j = 0; j < 5; j++) {
          const progress = ((time * 0.4 + j * 0.2 + i * 0.1) % 1);
          const px = exitX + (endX - exitX) * progress;
          const py = exitY + (endY - exitY) * progress;
          ctx.fillStyle = c.color.replace(')', `, ${0.8 - progress * 0.6})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (m, r, g, b) => `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main ray with gradient
        const rayGradient = ctx.createLinearGradient(exitX, exitY, endX, endY);
        rayGradient.addColorStop(0, c.color);
        rayGradient.addColorStop(1, c.color + '80');
        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(exitX, exitY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Labels with background
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '11px Arial';
        const labelWidth = ctx.measureText(`${c.name} ${c.wavelength}`).width;
        ctx.fillRect(endX + 8, endY - 8, labelWidth + 8, 16);
        ctx.fillStyle = c.color;
        ctx.fillText(`${c.name} ${c.wavelength}`, endX + 12, endY + 4);
      });

      ctx.shadowBlur = 0;

      // Info panel
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(canvas.width - 220, 15, 200, 90, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`زاوية المنشور: ${prismAngle}°`, canvas.width - 30, 40);
      ctx.font = '13px Arial';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('n = c / v', canvas.width - 30, 60);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '11px Arial';
      ctx.fillText('معامل الانكسار يختلف حسب', canvas.width - 30, 80);
      ctx.fillText('الطول الموجي للضوء', canvas.width - 30, 95);
    };

    const drawLensSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw optical axis with gradient
      const axisGradient = ctx.createLinearGradient(0, centerY, canvas.width, centerY);
      axisGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      axisGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      axisGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.strokeStyle = axisGradient;
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw lens with 3D effect
      const lensHeight = 180;
      const curvature = lensType === 'convex' ? 30 : -25;

      // Lens glow
      ctx.shadowColor = 'rgba(96, 165, 250, 0.6)';
      ctx.shadowBlur = 25;

      // Lens body with gradient
      const lensGradient = ctx.createLinearGradient(centerX - 20, 0, centerX + 20, 0);
      lensGradient.addColorStop(0, 'rgba(180, 220, 255, 0.15)');
      lensGradient.addColorStop(0.5, 'rgba(220, 240, 255, 0.35)');
      lensGradient.addColorStop(1, 'rgba(180, 220, 255, 0.15)');
      ctx.fillStyle = lensGradient;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight / 2);
      ctx.quadraticCurveTo(centerX + curvature, centerY, centerX, centerY + lensHeight / 2);
      ctx.quadraticCurveTo(centerX - curvature, centerY, centerX, centerY - lensHeight / 2);
      ctx.fill();

      // Lens outline
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight / 2);
      ctx.quadraticCurveTo(centerX + curvature, centerY, centerX, centerY + lensHeight / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight / 2);
      ctx.quadraticCurveTo(centerX - curvature, centerY, centerX, centerY + lensHeight / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Focal points with glow
      const f = lensType === 'convex' ? focalLength : -focalLength;

      [[-1, 'F'], [1, "F'"]].forEach(([dir, label]) => {
        const fx = centerX + (dir as number) * Math.abs(f);
        
        ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(fx, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label as string, fx, centerY + 28);
      });

      // Object (arrow) with glow
      const objectX = centerX - 200;
      const objectHeight = 70;

      ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(objectX, centerY);
      ctx.lineTo(objectX, centerY - objectHeight);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(objectX, centerY - objectHeight - 10);
      ctx.lineTo(objectX - 8, centerY - objectHeight + 5);
      ctx.lineTo(objectX + 8, centerY - objectHeight + 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#22c55e';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('جسم', objectX, centerY + 20);

      // Calculate image using lens equation
      const objectDistance = centerX - objectX;
      const imageDistance = lensType === 'convex' 
        ? (f * objectDistance) / (objectDistance - f)
        : (f * objectDistance) / (objectDistance + Math.abs(f));
      const magnification = -imageDistance / objectDistance;
      const imageHeight = objectHeight * magnification;

      // Draw principal rays with animation
      const rays = [
        { color: '#ef4444', name: 'شعاع موازي' },
        { color: '#22c55e', name: 'شعاع مركزي' },
        { color: '#3b82f6', name: 'شعاع بؤري' }
      ];

      rays.forEach((ray, idx) => {
        ctx.strokeStyle = ray.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = ray.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();

        if (idx === 0) {
          // Parallel ray
          ctx.moveTo(objectX, centerY - objectHeight);
          ctx.lineTo(centerX, centerY - objectHeight);
          if (lensType === 'convex') {
            ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
          } else {
            // For concave lens, ray diverges
            ctx.lineTo(canvas.width, centerY - objectHeight + (objectHeight * 2));
          }
        } else if (idx === 1) {
          // Central ray
          ctx.moveTo(objectX, centerY - objectHeight);
          if (lensType === 'convex') {
            ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
          } else {
            ctx.lineTo(canvas.width, centerY + objectHeight);
          }
        } else {
          // Focal ray
          ctx.moveTo(objectX, centerY - objectHeight);
          ctx.lineTo(centerX, centerY - (objectHeight * f) / (f - objectDistance));
          if (lensType === 'convex') {
            ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
          } else {
            ctx.lineTo(canvas.width, centerY - (objectHeight * f) / (f - objectDistance));
          }
        }
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // Draw image (inverted arrow for convex)
      if (lensType === 'convex' && imageDistance > 0 && imageDistance < 400) {
        ctx.shadowColor = 'rgba(249, 115, 22, 0.8)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + imageDistance, centerY);
        ctx.lineTo(centerX + imageDistance, centerY - imageHeight);
        ctx.stroke();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        const arrowDir = imageHeight > 0 ? -1 : 1;
        ctx.moveTo(centerX + imageDistance, centerY - imageHeight + arrowDir * 10);
        ctx.lineTo(centerX + imageDistance - 8, centerY - imageHeight - arrowDir * 5);
        ctx.lineTo(centerX + imageDistance + 8, centerY - imageHeight - arrowDir * 5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#f97316';
        ctx.font = '12px Arial';
        ctx.fillText('صورة', centerX + imageDistance, centerY + 20);
      }

      // Virtual image for concave lens
      if (lensType === 'concave') {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - objectHeight);
        ctx.lineTo(centerX - Math.abs(imageDistance), centerY - Math.abs(imageHeight) * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText('صورة وهمية', centerX - 80, centerY - 50);
      }

      // Info panel
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(15, 15, 200, 100, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`البعد البؤري: ${focalLength} px`, 200, 40);
      ctx.fillText(`نوع العدسة: ${lensType === 'convex' ? 'محدبة' : 'مقعرة'}`, 200, 60);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '12px Arial';
      ctx.fillText('1/f = 1/do + 1/di', 200, 80);
      ctx.fillText(`التكبير: ${Math.abs(magnification).toFixed(2)}×`, 200, 100);
    };

    const drawInterferenceSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const screenX = canvas.width - 80;
      const centerY = canvas.height / 2;
      
      // Barrier with slits
      ctx.fillStyle = 'rgba(50, 50, 70, 0.95)';
      ctx.fillRect(220, 0, 15, canvas.height);
      
      // Slit openings with glow
      const slitY1 = centerY - slitDistance;
      const slitY2 = centerY + slitDistance;
      
      ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#1a1035';
      ctx.fillRect(220, slitY1 - 8, 15, 16);
      ctx.fillRect(220, slitY2 - 8, 15, 16);
      ctx.shadowBlur = 0;

      // Light source with animated glow
      const sourceGlow = ctx.createRadialGradient(50, centerY, 0, 50, centerY, 60);
      sourceGlow.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
      sourceGlow.addColorStop(0.3, 'rgba(255, 220, 50, 0.5)');
      sourceGlow.addColorStop(1, 'rgba(255, 200, 0, 0)');
      ctx.fillStyle = sourceGlow;
      ctx.beginPath();
      ctx.arc(50, centerY, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(50, centerY, 20 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Incoming waves
      for (let i = 0; i < 6; i++) {
        const radius = ((time * 40 + i * 35) % 180);
        const opacity = 0.6 - radius / 300;
        if (opacity > 0) {
          ctx.strokeStyle = `rgba(255, 255, 100, ${opacity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(50, centerY, radius, -0.4, 0.4);
          ctx.stroke();
        }
      }

      // Waves from slits with interference
      const wavelength = 25;
      for (let i = 0; i < 10; i++) {
        const radius = ((time * 25 + i * 25) % 300);
        const opacity = 0.5 - radius / 600;
        if (opacity > 0 && radius > 0) {
          // Wave from slit 1
          ctx.strokeStyle = `rgba(255, 100, 100, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(235, slitY1, radius, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();

          // Wave from slit 2
          ctx.strokeStyle = `rgba(100, 100, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(235, slitY2, radius, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        }
      }

      // Detection screen with gradient
      const screenGradient = ctx.createLinearGradient(screenX, 0, screenX + 50, 0);
      screenGradient.addColorStop(0, 'rgba(40, 40, 60, 0.9)');
      screenGradient.addColorStop(1, 'rgba(30, 30, 50, 0.8)');
      ctx.fillStyle = screenGradient;
      ctx.fillRect(screenX, 0, 50, canvas.height);

      // Interference pattern with enhanced visualization
      for (let y = 0; y < canvas.height; y++) {
        const d1 = Math.sqrt(Math.pow(screenX - 235, 2) + Math.pow(y - slitY1, 2));
        const d2 = Math.sqrt(Math.pow(screenX - 235, 2) + Math.pow(y - slitY2, 2));
        const pathDiff = Math.abs(d1 - d2);
        const phase = (pathDiff / wavelength) * Math.PI * 2;
        const intensity = Math.pow(Math.cos(phase / 2), 2);
        
        // Colored fringe pattern
        const hue = 50 + intensity * 10;
        ctx.fillStyle = `hsla(${hue}, 100%, ${50 + intensity * 30}%, ${intensity})`;
        ctx.fillRect(screenX, y, 50, 1);
      }

      // Show constructive/destructive interference indicators
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      for (let n = -3; n <= 3; n++) {
        const y = centerY + n * (wavelength * (screenX - 235) / (2 * slitDistance));
        if (y > 30 && y < canvas.height - 30) {
          if (n === 0 || Math.abs(n) === 2) {
            ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
            ctx.fillText(n === 0 ? 'مركزي' : `n=${Math.abs(n)}`, screenX + 55, y + 4);
          }
        }
      }

      // Labels with better styling
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(40, canvas.height - 45, 70, 25, 5);
      ctx.fill();
      ctx.fillStyle = '#fcd34d';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('مصدر ضوء', 75, canvas.height - 27);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(205, 10, 45, 25, 5);
      ctx.fill();
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText('شقين', 227, 27);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(screenX + 5, 10, 40, 25, 5);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.fillText('شاشة', screenX + 25, 27);

      // Info panel
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(15, 15, 180, 85, 10);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`المسافة بين الشقين: ${slitDistance * 2} px`, 180, 38);
      ctx.fillStyle = '#86efac';
      ctx.font = '12px Arial';
      ctx.fillText('التداخل البناء: Δ = nλ', 180, 58);
      ctx.fillStyle = '#f87171';
      ctx.fillText('التداخل الهدام: Δ = (n+½)λ', 180, 78);
    };

    const drawPolarizationSimulation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerY = canvas.height / 2;
      
      // Light source
      const sourceGlow = ctx.createRadialGradient(50, centerY, 0, 50, centerY, 50);
      sourceGlow.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
      sourceGlow.addColorStop(0.5, 'rgba(255, 220, 50, 0.4)');
      sourceGlow.addColorStop(1, 'rgba(255, 200, 0, 0)');
      ctx.fillStyle = sourceGlow;
      ctx.beginPath();
      ctx.arc(50, centerY, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fffbe8';
      ctx.beginPath();
      ctx.arc(50, centerY, 22 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Unpolarized light waves - multiple orientations with particles
      const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#e17055'];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 6 + time * 0.5;
        const amplitude = 25;
        
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2;
        ctx.shadowColor = colors[i];
        ctx.shadowBlur = 8;
        ctx.beginPath();
        
        for (let x = 80; x < 190; x += 3) {
          const y = centerY + Math.sin((x - 80) * 0.12 + time * 3) * amplitude * Math.sin(angle);
          if (x === 80) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Particles along waves
        for (let j = 0; j < 3; j++) {
          const progress = ((time * 0.3 + j * 0.33 + i * 0.1) % 1);
          const px = 80 + progress * 110;
          const py = centerY + Math.sin((px - 80) * 0.12 + time * 3) * amplitude * Math.sin(angle);
          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // First polarizer with 3D effect
      ctx.fillStyle = 'rgba(100, 100, 255, 0.4)';
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(195, centerY - 90, 20, 180, 5);
      ctx.fill();
      ctx.stroke();

      // Polarizer lines (vertical)
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.8)';
      ctx.lineWidth = 2;
      for (let y = centerY - 80; y < centerY + 80; y += 12) {
        ctx.beginPath();
        ctx.moveTo(198, y);
        ctx.lineTo(212, y);
        ctx.stroke();
      }

      // Polarized light (vertical orientation only)
      ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 230; x < 380; x += 3) {
        const y = centerY + Math.sin((x - 230) * 0.1 + time * 3) * 45;
        if (x === 230) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Particles along polarized light
      for (let j = 0; j < 4; j++) {
        const progress = ((time * 0.25 + j * 0.25) % 1);
        const px = 230 + progress * 150;
        const py = centerY + Math.sin((px - 230) * 0.1 + time * 3) * 45;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Second polarizer (analyzer) - rotating with 3D effect
      const analyzerAngle = time * 0.4;
      ctx.save();
      ctx.translate(400, centerY);
      ctx.rotate(analyzerAngle);
      
      ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
      ctx.strokeStyle = 'rgba(252, 165, 165, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-10, -90, 20, 180, 5);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 200, 200, 0.8)';
      for (let y = -80; y < 80; y += 12) {
        ctx.beginPath();
        ctx.moveTo(-7, y);
        ctx.lineTo(7, y);
        ctx.stroke();
      }
      ctx.restore();

      // Light after analyzer
      const transmittedIntensity = Math.pow(Math.cos(analyzerAngle), 2);
      
      if (transmittedIntensity > 0.05) {
        ctx.shadowColor = `rgba(250, 204, 21, ${transmittedIntensity})`;
        ctx.shadowBlur = 15 * transmittedIntensity;
        ctx.strokeStyle = `rgba(250, 204, 21, ${transmittedIntensity})`;
        ctx.lineWidth = 4 * transmittedIntensity;
        ctx.beginPath();
        for (let x = 430; x < 540; x += 3) {
          const amplitude = 45 * transmittedIntensity;
          const y = centerY + Math.sin((x - 430) * 0.1 + time * 3) * amplitude;
          if (x === 430) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Particles
        for (let j = 0; j < 3; j++) {
          const progress = ((time * 0.2 + j * 0.33) % 1);
          const px = 430 + progress * 110;
          const amplitude = 45 * transmittedIntensity;
          const py = centerY + Math.sin((px - 430) * 0.1 + time * 3) * amplitude;
          ctx.fillStyle = `rgba(250, 204, 21, ${transmittedIntensity})`;
          ctx.beginPath();
          ctx.arc(px, py, 3 * transmittedIntensity + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // Detector with dynamic brightness
      const detectorBrightness = transmittedIntensity;
      const detectorGlow = ctx.createRadialGradient(580, centerY, 0, 580, centerY, 40);
      detectorGlow.addColorStop(0, `rgba(255, 255, ${Math.floor(detectorBrightness * 200)}, ${detectorBrightness})`);
      detectorGlow.addColorStop(1, `rgba(255, 200, 0, 0)`);
      ctx.fillStyle = detectorGlow;
      ctx.beginPath();
      ctx.arc(580, centerY, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgb(${Math.floor(detectorBrightness * 255)}, ${Math.floor(detectorBrightness * 255)}, ${Math.floor(detectorBrightness * 50)})`;
      ctx.beginPath();
      ctx.arc(580, centerY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Labels
      const labels = [
        { text: 'ضوء غير مستقطب', x: 135, y: centerY + 110 },
        { text: 'مستقطب', x: 205, y: centerY - 100 },
        { text: 'ضوء مستقطب', x: 305, y: centerY + 75 },
        { text: 'محلل', x: 400, y: centerY - 100 },
        { text: 'كاشف', x: 580, y: centerY + 55 }
      ];

      labels.forEach(label => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        const textWidth = ctx.measureText(label.text).width;
        ctx.beginPath();
        ctx.roundRect(label.x - textWidth / 2 - 5, label.y - 10, textWidth + 10, 20, 3);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label.text, label.x, label.y + 4);
      });

      // Info panel
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(15, 15, 210, 90, 10);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText("I = I₀ cos²θ (قانون مالوس)", 210, 38);
      ctx.fillStyle = '#fcd34d';
      ctx.font = '13px Arial';
      ctx.fillText(`الشدة النافذة: ${(transmittedIntensity * 100).toFixed(0)}%`, 210, 60);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`زاوية المحلل: ${((analyzerAngle * 180 / Math.PI) % 360).toFixed(0)}°`, 210, 82);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, prismAngle, focalLength, slitDistance, lensType, time]);

  const resetSimulation = () => {
    setTime(0);
    setIsPlaying(true);
  };

  const simulationTypes = [
    { id: 'prism', label: 'المنشور', icon: Sparkles },
    { id: 'lens', label: 'العدسات', icon: Eye },
    { id: 'interference', label: 'التداخل', icon: Waves },
    { id: 'polarization', label: 'الاستقطاب', icon: Circle }
  ];

  const quizQuestions = [
    {
      question: "لماذا ينكسر الضوء البنفسجي أكثر من الأحمر في المنشور؟",
      options: ["لأنه أسرع", "لأن معامل انكساره أكبر", "لأن طوله الموجي أطول", "لأنه أكثر سطوعاً"],
      correctIndex: 1,
      explanation: "الضوء البنفسجي له طول موجي أقصر ومعامل انكسار أكبر، لذلك ينحرف بزاوية أكبر"
    },
    {
      question: "ما الذي يحدد نوع الصورة في العدسة المحدبة؟",
      options: ["لون الضوء", "موضع الجسم بالنسبة للبؤرة", "حجم العدسة", "درجة الحرارة"],
      correctIndex: 1,
      explanation: "موضع الجسم بالنسبة للبؤرة يحدد إذا كانت الصورة حقيقية أو وهمية، مكبرة أو مصغرة"
    },
    {
      question: "متى يحدث التداخل البناء في تجربة الشق المزدوج؟",
      options: ["عندما فرق المسار = nλ", "عندما فرق المسار = (n+½)λ", "عندما الشقين متساويين", "عندما المصدر قريب"],
      correctIndex: 0,
      explanation: "التداخل البناء يحدث عندما يكون فرق المسار مضاعفاً صحيحاً للطول الموجي"
    },
    {
      question: "ماذا يحدث لشدة الضوء عندما تكون زاوية المحلل 90°؟",
      options: ["تصبح صفر", "تتضاعف", "تبقى ثابتة", "تزيد قليلاً"],
      correctIndex: 0,
      explanation: "حسب قانون مالوس I = I₀cos²(90°) = 0، الضوء المستقطب لا يمر عبر محلل متعامد"
    },
    {
      question: "ما نوع الصورة التي تكونها العدسة المقعرة؟",
      options: ["حقيقية مقلوبة", "وهمية معتدلة مصغرة", "حقيقية معتدلة", "وهمية مقلوبة"],
      correctIndex: 1,
      explanation: "العدسة المقعرة تكون دائماً صورة وهمية معتدلة مصغرة لأن الأشعة تتفرق"
    }
  ];

  const formulas = [
    { name: "قانون سنل", formula: "n₁ sin θ₁ = n₂ sin θ₂", description: "العلاقة بين زوايا السقوط والانكسار" },
    { name: "معادلة العدسة", formula: "1/f = 1/do + 1/di", description: "العلاقة بين البعد البؤري وبعدي الجسم والصورة" },
    { name: "قانون مالوس", formula: "I = I₀ cos²θ", description: "شدة الضوء المستقطب بعد المحلل" }
  ];

  const facts = [
    "سرعة الضوء في الفراغ تساوي 299,792,458 م/ث بالضبط",
    "عين الإنسان تستطيع تمييز حوالي 10 مليون لون مختلف",
    "قوس قزح يتكون من تشتت ضوء الشمس في قطرات المطر",
    "بعض الحيوانات مثل النحل ترى الضوء فوق البنفسجي"
  ];

  return (
    <SimulationLayout 
      title="البصريات المتقدمة"
      titleGradient="from-yellow-400 via-orange-400 to-red-400"
      backgroundGradient="from-orange-900/20 via-red-900/30 to-yellow-900/20"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas Section */}
        <div className="lg:col-span-2">
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-orange-900/40 rounded-2xl p-4 border border-orange-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-xl"
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
              explanation="البصريات تدرس سلوك الضوء وتفاعله مع المادة، من الانكسار والانعكاس إلى التداخل والاستقطاب"
            />
          </motion.div>
        </div>

        {/* Controls Section */}
        <div className="space-y-4">
          {/* Simulation Type - Vertical */}
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-orange-900/40 rounded-2xl p-4 border border-orange-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-300">
              <Sun className="h-5 w-5" />
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
                      ? 'bg-gradient-to-r from-orange-600 to-yellow-600 border-orange-400' 
                      : 'border-orange-500/30 hover:border-orange-400/50'
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Parameters */}
          {simulationType === 'prism' && (
            <motion.div 
              className="bg-gradient-to-br from-slate-900/80 to-orange-900/40 rounded-2xl p-4 border border-orange-500/20 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-sm font-medium flex items-center gap-2 text-yellow-300">
                <Sparkles className="h-4 w-4" />
                زاوية المنشور: {prismAngle}°
              </label>
              <Slider
                value={[prismAngle]}
                onValueChange={([v]) => setPrismAngle(v)}
                min={30}
                max={90}
                step={1}
                className="mt-2"
              />
            </motion.div>
          )}

          {simulationType === 'lens' && (
            <motion.div 
              className="bg-gradient-to-br from-slate-900/80 to-orange-900/40 rounded-2xl p-4 border border-orange-500/20 backdrop-blur-sm space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div>
                <label className="text-sm font-medium flex items-center gap-2 text-blue-300">
                  <Eye className="h-4 w-4" />
                  البعد البؤري: {focalLength} px
                </label>
                <Slider
                  value={[focalLength]}
                  onValueChange={([v]) => setFocalLength(v)}
                  min={50}
                  max={200}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-purple-300 block mb-2">نوع العدسة</label>
                <div className="flex gap-2">
                  <Button
                    variant={lensType === 'convex' ? "default" : "outline"}
                    onClick={() => setLensType('convex')}
                    className={`flex-1 ${lensType === 'convex' ? 'bg-green-600' : 'border-green-500/30'}`}
                    size="sm"
                  >
                    محدبة
                  </Button>
                  <Button
                    variant={lensType === 'concave' ? "default" : "outline"}
                    onClick={() => setLensType('concave')}
                    className={`flex-1 ${lensType === 'concave' ? 'bg-red-600' : 'border-red-500/30'}`}
                    size="sm"
                  >
                    مقعرة
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {simulationType === 'interference' && (
            <motion.div 
              className="bg-gradient-to-br from-slate-900/80 to-orange-900/40 rounded-2xl p-4 border border-orange-500/20 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-sm font-medium flex items-center gap-2 text-green-300">
                <Waves className="h-4 w-4" />
                المسافة بين الشقين: {slitDistance * 2} px
              </label>
              <Slider
                value={[slitDistance]}
                onValueChange={([v]) => setSlitDistance(v)}
                min={20}
                max={100}
                step={5}
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
              className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500"
            >
              {isPlaying ? <Pause className="h-4 w-4 ml-2" /> : <Play className="h-4 w-4 ml-2" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button variant="outline" onClick={resetSimulation} className="border-orange-500/30 hover:border-orange-400/50">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Concepts */}
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-orange-900/40 rounded-2xl p-4 border border-orange-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-300">
              <Sun className="h-5 w-5" />
              المفاهيم الفيزيائية
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              {simulationType === 'prism' && (
                <>
                  <p>• <span className="text-violet-400 font-medium">التشتت:</span> فصل الضوء إلى ألوانه</p>
                  <p>• معامل الانكسار يعتمد على الطول الموجي</p>
                  <p>• <span className="text-red-400">الأحمر</span> ينكسر أقل من <span className="text-violet-400">البنفسجي</span></p>
                </>
              )}
              {simulationType === 'lens' && (
                <>
                  <p>• <span className="text-green-400 font-medium">المحدبة:</span> تجمع الأشعة في البؤرة</p>
                  <p>• <span className="text-red-400 font-medium">المقعرة:</span> تفرق الأشعة</p>
                  <p>• التكبير = بُعد الصورة / بُعد الجسم</p>
                </>
              )}
              {simulationType === 'interference' && (
                <>
                  <p>• <span className="text-yellow-400 font-medium">تجربة يونغ</span> للشق المزدوج</p>
                  <p>• <span className="text-green-400">بناء</span> عند Δ = nλ</p>
                  <p>• <span className="text-red-400">هدام</span> عند Δ = (n+½)λ</p>
                </>
              )}
              {simulationType === 'polarization' && (
                <>
                  <p>• الضوء غير المستقطب يهتز في كل الاتجاهات</p>
                  <p>• <span className="text-blue-400 font-medium">المستقطب</span> يسمح باتجاه واحد</p>
                  <p>• الشدة تتبع قانون مالوس: I = I₀cos²θ</p>
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

export default AdvancedOpticsSimulation;