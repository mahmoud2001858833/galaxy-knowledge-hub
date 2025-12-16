import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Wind, Sun, Moon, Flame, Gauge, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useThermodynamicsPhysics } from '@/hooks/useThermodynamicsPhysics';

const ThermodynamicsLabSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('gas');

  const {
    state,
    gasStats,
    carnotStats,
    toggleGasSimulation,
    setGasTemperature,
    setGasVolume,
    advanceCarnotCycle,
    resetCarnotCycle,
    setHeatTransferMode
  } = useThermodynamicsPhysics();

  const particles = state.particles;
  const temperature = state.temperature;
  const volume = state.volume;
  const pressure = gasStats.pressure;
  const isRunning = state.isSimulating;
  const carnotStage = state.carnot.currentStep;
  const carnotEfficiency = carnotStats.efficiency;
  const heatTransferMode = state.heatTransfer.mode;
  const conductionTemp = state.heatTransfer.temperatures;

  // Draw gas particles
  useEffect(() => {
    if (activeTab !== 'gas') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = isDarkMode ? '#1a1a2e' : '#f0f9ff';
    ctx.fillRect(0, 0, width, height);

    // Container walls
    const containerVolume = (volume / 0.001) * 100;
    const containerWidth = width * (containerVolume / 100);
    const containerX = (width - containerWidth) / 2;
    const containerY = 50;
    const containerHeight = height - 100;

    // Container gradient based on temperature
    const tempGradient = ctx.createLinearGradient(containerX, containerY, containerX, containerY + containerHeight);
    if (temperature > 400) {
      tempGradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      tempGradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
    } else if (temperature < 200) {
      tempGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      tempGradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
    } else {
      tempGradient.addColorStop(0, 'rgba(156, 163, 175, 0.3)');
      tempGradient.addColorStop(1, 'rgba(156, 163, 175, 0.1)');
    }

    ctx.fillStyle = tempGradient;
    ctx.fillRect(containerX, containerY, containerWidth, containerHeight);

    // Container border
    ctx.strokeStyle = isDarkMode ? '#4B5563' : '#9CA3AF';
    ctx.lineWidth = 3;
    ctx.strokeRect(containerX, containerY, containerWidth, containerHeight);

    // Draw piston (movable wall)
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(containerX + containerWidth - 10, containerY, 15, containerHeight);

    // Draw particles
    particles.forEach(particle => {
      const px = containerX + (particle.x / state.containerWidth) * containerWidth;
      const py = containerY + (particle.y / state.containerHeight) * containerHeight;

      // Particle glow based on speed
      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      const hue = Math.min(60, 240 - speed * 20);
      
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 10;
      
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Velocity vector
      if (speed > 2) {
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + particle.vx * 3, py + particle.vy * 3);
        ctx.stroke();
      }
    });

    // Thermometer
    ctx.fillStyle = '#EF4444';
    const thermHeight = (temperature / 600) * 100;
    ctx.fillRect(width - 40, containerY + containerHeight - thermHeight, 15, thermHeight);
    ctx.strokeStyle = '#9CA3AF';
    ctx.strokeRect(width - 40, containerY, 15, containerHeight);

  }, [particles, isDarkMode, volume, temperature, activeTab, state.containerWidth, state.containerHeight]);

  // Draw Carnot cycle - Enhanced
  useEffect(() => {
    if (activeTab !== 'carnot') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = isDarkMode ? '#1a1a2e' : '#f0f9ff';
    ctx.fillRect(0, 0, width, height);

    // Draw engine visualization on left side
    const engineX = 80;
    const engineY = 80;
    const engineW = 180;
    const engineH = 280;

    // Hot reservoir (top)
    const hotGrad = ctx.createLinearGradient(engineX, engineY, engineX, engineY + 60);
    hotGrad.addColorStop(0, '#DC2626');
    hotGrad.addColorStop(1, '#EF4444');
    ctx.fillStyle = hotGrad;
    ctx.fillRect(engineX, engineY, engineW, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 مستودع ساخن Th', engineX + engineW/2, engineY + 35);

    // Engine cylinder
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 3;
    ctx.strokeRect(engineX + 30, engineY + 70, engineW - 60, 140);
    
    // Piston position based on stage
    const pistonPositions = [0.3, 0.6, 0.7, 0.4];
    const pistonY = engineY + 80 + pistonPositions[carnotStage] * 100;
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(engineX + 35, pistonY, engineW - 70, 20);
    
    // Gas particles in cylinder
    ctx.fillStyle = carnotStage < 2 ? '#EF4444' : '#3B82F6';
    for (let i = 0; i < 15; i++) {
      const px = engineX + 50 + Math.random() * (engineW - 100);
      const py = pistonY + 25 + Math.random() * (engineY + 200 - pistonY);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cold reservoir (bottom)
    const coldGrad = ctx.createLinearGradient(engineX, engineY + engineH - 60, engineX, engineY + engineH);
    coldGrad.addColorStop(0, '#3B82F6');
    coldGrad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = coldGrad;
    ctx.fillRect(engineX, engineY + engineH - 60, engineW, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('❄️ مستودع بارد Tc', engineX + engineW/2, engineY + engineH - 25);

    // Heat flow arrows
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    if (carnotStage === 0) {
      // Heat in from hot reservoir
      ctx.beginPath();
      ctx.moveTo(engineX + engineW/2, engineY + 60);
      ctx.lineTo(engineX + engineW/2, engineY + 85);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(engineX + engineW/2 - 8, engineY + 80);
      ctx.lineTo(engineX + engineW/2 + 8, engineY + 80);
      ctx.lineTo(engineX + engineW/2, engineY + 95);
      ctx.fill();
      ctx.fillText('Qh', engineX + engineW/2 + 20, engineY + 75);
    }
    if (carnotStage === 2) {
      // Heat out to cold reservoir
      ctx.beginPath();
      ctx.moveTo(engineX + engineW/2, engineY + engineH - 75);
      ctx.lineTo(engineX + engineW/2, engineY + engineH - 60);
      ctx.stroke();
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(engineX + engineW/2 - 8, engineY + engineH - 65);
      ctx.lineTo(engineX + engineW/2 + 8, engineY + engineH - 65);
      ctx.lineTo(engineX + engineW/2, engineY + engineH - 55);
      ctx.fill();
      ctx.fillText('Qc', engineX + engineW/2 + 20, engineY + engineH - 70);
    }

    // Work output arrow
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(engineX + engineW, engineY + 150);
    ctx.lineTo(engineX + engineW + 40, engineY + 150);
    ctx.stroke();
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(engineX + engineW + 35, engineY + 145);
    ctx.lineTo(engineX + engineW + 35, engineY + 155);
    ctx.lineTo(engineX + engineW + 50, engineY + 150);
    ctx.fill();
    ctx.fillText('W', engineX + engineW + 30, engineY + 135);

    // Draw PV diagram on right side
    const margin = 320;
    const graphWidth = width - margin - 40;
    const graphHeight = height - 120;

    // Axes
    ctx.strokeStyle = isDarkMode ? '#6B7280' : '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, 60);
    ctx.lineTo(margin, height - 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(margin, height - 60);
    ctx.lineTo(width - 20, height - 60);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('P', margin - 10, 70);
    ctx.textAlign = 'center';
    ctx.fillText('V', width - 30, height - 45);

    // Carnot cycle path with curves
    const stages = [
      { name: 'isothermal_expansion', color: '#EF4444', label: 'تمدد متساوي الحرارة' },
      { name: 'adiabatic_expansion', color: '#22C55E', label: 'تمدد أديباتي' },
      { name: 'isothermal_compression', color: '#3B82F6', label: 'انضغاط متساوي الحرارة' },
      { name: 'adiabatic_compression', color: '#F59E0B', label: 'انضغاط أديباتي' }
    ];

    // Draw filled area for work
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(margin + 60, 120);
    ctx.quadraticCurveTo(margin + 150, 100, margin + 200, 150);
    ctx.quadraticCurveTo(margin + 250, 200, margin + 280, 280);
    ctx.quadraticCurveTo(margin + 200, 320, margin + 140, 300);
    ctx.quadraticCurveTo(margin + 80, 250, margin + 60, 120);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw cycle curves
    const curves = [
      { start: [60, 120], cp: [150, 100], end: [200, 150], idx: 0 },
      { start: [200, 150], cp: [250, 200], end: [280, 280], idx: 1 },
      { start: [280, 280], cp: [200, 320], end: [140, 300], idx: 2 },
      { start: [140, 300], cp: [80, 250], end: [60, 120], idx: 3 }
    ];

    curves.forEach((curve, idx) => {
      ctx.strokeStyle = stages[idx].color;
      ctx.lineWidth = idx <= carnotStage ? 5 : 2;
      ctx.globalAlpha = idx <= carnotStage ? 1 : 0.4;
      ctx.beginPath();
      ctx.moveTo(margin + curve.start[0], curve.start[1]);
      ctx.quadraticCurveTo(margin + curve.cp[0], curve.cp[1], margin + curve.end[0], curve.end[1]);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Current point indicator with glow
    const currentCurve = curves[carnotStage];
    if (currentCurve) {
      ctx.shadowColor = stages[carnotStage].color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(margin + currentCurve.end[0], currentCurve.end[1], 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Stage labels
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    stages.forEach((stage, idx) => {
      ctx.fillStyle = stage.color;
      ctx.fillRect(margin + 10, height - 50 + idx * 0, 15, 3);
    });

  }, [carnotStage, isDarkMode, activeTab]);

  // Draw heat transfer
  useEffect(() => {
    if (activeTab !== 'heat') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = isDarkMode ? '#1a1a2e' : '#f0f9ff';
    ctx.fillRect(0, 0, width, height);

    if (heatTransferMode === 'conduction') {
      const barWidth = width - 100;
      const barHeight = 60;
      const barX = 50;
      const barY = height / 2 - barHeight / 2;

      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      gradient.addColorStop(0, '#EF4444');
      gradient.addColorStop(0.5, '#F59E0B');
      gradient.addColorStop(1, '#3B82F6');

      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, barWidth, barHeight);

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(barX, barY + barHeight / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', barX, barY + barHeight / 2 + 7);

      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(barX + barWidth, barY + barHeight / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('❄️', barX + barWidth, barY + barHeight / 2 + 7);

      conductionTemp.forEach((temp, idx) => {
        const x = barX + (idx / (conductionTemp.length - 1)) * barWidth;
        ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${temp.toFixed(0)}°C`, x, barY + barHeight + 25);
      });

    } else if (heatTransferMode === 'convection') {
      const cellX = width / 2 - 150;
      const cellY = 50;
      const cellWidth = 300;
      const cellHeight = 350;

      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 3;
      ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);

      ctx.fillStyle = '#DC2626';
      ctx.fillRect(cellX, cellY + cellHeight, cellWidth, 30);

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      
      for (let i = 0; i < 3; i++) {
        const x = cellX + 50 + i * 100;
        ctx.beginPath();
        ctx.moveTo(x, cellY + cellHeight - 50);
        ctx.lineTo(x, cellY + 50);
        ctx.lineTo(x - 10, cellY + 70);
        ctx.moveTo(x, cellY + 50);
        ctx.lineTo(x + 10, cellY + 70);
        ctx.stroke();
      }

      ctx.strokeStyle = '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(cellX + 50, cellY + 50);
      ctx.quadraticCurveTo(cellX + 150, cellY + 30, cellX + 250, cellY + 50);
      ctx.stroke();

    } else if (heatTransferMode === 'radiation') {
      const sunX = width / 4;
      const sunY = height / 2 - 30;
      const sunRadius = 50;

      // Space background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun glow
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 4);
      sunGradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
      sunGradient.addColorStop(0.2, 'rgba(255, 150, 0, 0.6)');
      sunGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
      sunGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 4, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('☀️', sunX, sunY + 10);

      // Radiation waves
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 6; i++) {
        ctx.globalAlpha = 1 - i * 0.12;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius + i * 35, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      // Earth
      const earthX = width * 0.72;
      const earthGrad = ctx.createRadialGradient(earthX - 10, sunY - 10, 5, earthX, sunY, 35);
      earthGrad.addColorStop(0, '#3B82F6');
      earthGrad.addColorStop(0.5, '#1D4ED8');
      earthGrad.addColorStop(1, '#1E3A8A');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, sunY, 35, 0, Math.PI * 2);
      ctx.fill();
      
      // Continents
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.ellipse(earthX - 10, sunY - 5, 12, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(earthX + 8, sunY + 10, 8, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Arrow from sun to earth
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sunX + sunRadius + 20, sunY);
      ctx.lineTo(earthX - 50, sunY);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(earthX - 55, sunY - 8);
      ctx.lineTo(earthX - 55, sunY + 8);
      ctx.lineTo(earthX - 40, sunY);
      ctx.fill();

      // Electromagnetic spectrum at bottom
      const spectrumY = height - 70;
      const spectrumLabels = ['أشعة غاما', 'أشعة X', 'فوق البنفسجية', 'مرئي', 'تحت الحمراء', 'موجات راديو'];
      const spectrumColors = ['#8B5CF6', '#6366F1', '#3B82F6', 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)', '#EF4444', '#F97316'];
      
      ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الطيف الكهرومغناطيسي', width / 2, spectrumY - 15);
      
      const boxWidth = (width - 80) / 6;
      spectrumLabels.forEach((label, i) => {
        const x = 40 + i * boxWidth;
        if (i === 3) {
          // Visible spectrum - rainbow gradient
          const grad = ctx.createLinearGradient(x, 0, x + boxWidth - 5, 0);
          grad.addColorStop(0, '#FF0000');
          grad.addColorStop(0.17, '#FF7F00');
          grad.addColorStop(0.33, '#FFFF00');
          grad.addColorStop(0.5, '#00FF00');
          grad.addColorStop(0.67, '#0000FF');
          grad.addColorStop(0.83, '#4B0082');
          grad.addColorStop(1, '#9400D3');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = ['#8B5CF6', '#6366F1', '#3B82F6', '', '#EF4444', '#F97316'][i];
        }
        ctx.fillRect(x, spectrumY, boxWidth - 5, 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '9px Arial';
        ctx.fillText(label, x + boxWidth / 2 - 2, spectrumY + 40);
      });
    }

  }, [heatTransferMode, conductionTemp, isDarkMode, activeTab]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-red-950 via-gray-900 to-blue-950' : 'bg-gradient-to-br from-red-50 via-white to-blue-50'} transition-colors duration-500`}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className={isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800'}
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            🔥 مختبر الديناميكا الحرارية
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={isDarkMode ? 'text-white' : 'text-gray-800'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </motion.div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="gas" className="gap-2">
              <Wind className="w-4 h-4" />
              الغازات المثالية
            </TabsTrigger>
            <TabsTrigger value="carnot" className="gap-2">
              <Gauge className="w-4 h-4" />
              محرك كارنو
            </TabsTrigger>
            <TabsTrigger value="heat" className="gap-2">
              <Flame className="w-4 h-4" />
              انتقال الحرارة
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-red-500/30' : 'bg-white'}`}>
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={450}
                  className="w-full rounded-lg"
                />

                {/* Controls based on tab */}
                {activeTab === 'gas' && (
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                    <Button
                      onClick={toggleGasSimulation}
                      className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isRunning ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                      {isRunning ? 'إيقاف' : 'تشغيل'}
                    </Button>
                  </div>
                )}

                {activeTab === 'carnot' && (
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                    <Button onClick={advanceCarnotCycle} className="bg-purple-600 hover:bg-purple-700">
                      <ArrowRight className="w-4 h-4 ml-2" />
                      المرحلة التالية
                    </Button>
                    <Button variant="outline" onClick={resetCarnotCycle} className={isDarkMode ? 'border-gray-600 text-white' : ''}>
                      <RotateCcw className="w-4 h-4 ml-2" />
                      إعادة
                    </Button>
                    <Badge variant="outline" className={isDarkMode ? 'text-yellow-400 border-yellow-400' : ''}>
                      الكفاءة: {(carnotEfficiency * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}

                {activeTab === 'heat' && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    {[
                      { id: 'conduction', name: 'التوصيل', icon: '🔗' },
                      { id: 'convection', name: 'الحمل', icon: '🔄' },
                      { id: 'radiation', name: 'الإشعاع', icon: '☀️' }
                    ].map(mode => (
                      <Button
                        key={mode.id}
                        variant={heatTransferMode === mode.id ? 'default' : 'outline'}
                        onClick={() => setHeatTransferMode(mode.id as 'conduction' | 'convection' | 'radiation')}
                        className={`gap-2 ${isDarkMode && heatTransferMode !== mode.id ? 'border-gray-600 text-white' : ''}`}
                      >
                        {mode.icon} {mode.name}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Control Panel */}
            <div>
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white'}`}>
                {activeTab === 'gas' && (
                  <div className="space-y-6">
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>⚙️ معادلة الغاز المثالي</h3>
                    <p className={`text-center font-mono text-lg ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      PV = nRT
                    </p>

                    <div>
                      <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        🌡️ درجة الحرارة: {temperature} K
                      </label>
                      <Slider
                        value={[temperature]}
                        onValueChange={([v]) => setGasTemperature(v)}
                        min={100}
                        max={600}
                        step={10}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        📦 الحجم: {(volume * 1000).toFixed(1)} L
                      </label>
                      <Slider
                        value={[volume * 1000]}
                        onValueChange={([v]) => setGasVolume(v / 1000)}
                        min={0.3}
                        max={2}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                      <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>📊 القياسات</h4>
                      <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <p>الضغط: {(pressure / 101325).toFixed(2)} atm</p>
                        <p>عدد الجسيمات: {particles.length}</p>
                        <p>الطاقة الحركية: {gasStats.averageKE.toExponential(2)} J</p>
                        <p>سرعة RMS: {gasStats.rmsVelocity.toFixed(2)} m/s</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'carnot' && (
                  <div className="space-y-4">
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>🔄 دورة كارنو</h3>
                    
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                      <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-white' : ''}`}>المراحل:</h4>
                      <div className="space-y-2">
                        {state.carnot.stepNames.map((stage, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm ${
                              idx === carnotStage
                                ? 'bg-purple-600 text-white'
                                : idx < carnotStage
                                ? 'bg-green-600/30 text-green-300'
                                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {idx + 1}. {stage}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        <strong>الكفاءة القصوى:</strong>
                      </p>
                      <p className="font-mono text-center mt-1">
                        η = 1 - T<sub>C</sub>/T<sub>H</sub>
                      </p>
                    </div>

                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                      <p>الشغل المبذول: {carnotStats.workDone.toFixed(2)} J</p>
                      <p>المرحلة الحالية: {carnotStats.stepName}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'heat' && (
                  <div className="space-y-4">
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>🔥 انتقال الحرارة</h3>
                    
                    <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : ''}`}>
                      <div className={`p-3 rounded-lg ${heatTransferMode === 'conduction' ? 'bg-red-600/30' : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h4 className="font-bold">🔗 التوصيل</h4>
                        <p className="text-sm mt-1">انتقال الحرارة عبر المادة الصلبة</p>
                        <p className="text-xs font-mono mt-2">Q = kA(ΔT/Δx)t</p>
                      </div>

                      <div className={`p-3 rounded-lg ${heatTransferMode === 'convection' ? 'bg-orange-600/30' : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h4 className="font-bold">🔄 الحمل</h4>
                        <p className="text-sm mt-1">انتقال الحرارة عبر حركة السائل</p>
                        <p className="text-xs font-mono mt-2">Q = hA(T<sub>s</sub>-T<sub>∞</sub>)</p>
                      </div>

                      <div className={`p-3 rounded-lg ${heatTransferMode === 'radiation' ? 'bg-yellow-600/30' : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h4 className="font-bold">☀️ الإشعاع</h4>
                        <p className="text-sm mt-1">انتقال الحرارة عبر الموجات الكهرومغناطيسية</p>
                        <p className="text-xs font-mono mt-2">Q = εσAT⁴</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ThermodynamicsLabSimulation;