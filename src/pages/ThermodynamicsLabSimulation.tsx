import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Thermometer, Gauge, Wind, Sun, Moon, Flame, Snowflake, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useThermodynamicsPhysics, GasParticle } from '@/hooks/useThermodynamicsPhysics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ThermodynamicsLabSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('gas');

  const {
    particles,
    isRunning,
    temperature,
    pressure,
    volume,
    carnotStage,
    carnotEfficiency,
    heatTransferMode,
    conductionTemp,
    setIsRunning,
    setTemperature,
    setVolume,
    reset,
    nextCarnotStage,
    setHeatTransferMode,
    calculateIdealGasValues,
    getPVData
  } = useThermodynamicsPhysics();

  const gasValues = calculateIdealGasValues();
  const pvData = getPVData();

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
    const containerWidth = width * (volume / 100);
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
      const px = containerX + (particle.x / 100) * containerWidth;
      const py = containerY + (particle.y / 100) * containerHeight;

      // Particle glow based on speed
      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      const hue = Math.min(60, 240 - speed * 20); // Blue to red
      
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 10;
      
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Velocity vector (optional)
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

  }, [particles, isDarkMode, volume, temperature, activeTab]);

  // Draw Carnot cycle
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

    // Draw PV diagram
    const margin = 60;
    const graphWidth = width - margin * 2;
    const graphHeight = height - margin * 2;

    // Axes
    ctx.strokeStyle = isDarkMode ? '#6B7280' : '#374151';
    ctx.lineWidth = 2;
    
    // Y axis (P)
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();
    
    // X axis (V)
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
    ctx.font = '14px Arial';
    ctx.fillText('P (الضغط)', margin - 10, margin - 10);
    ctx.fillText('V (الحجم)', width - margin - 40, height - margin + 25);

    // Carnot cycle path
    const stages = [
      { name: 'isothermal_expansion', color: '#EF4444', points: [[100, 300], [200, 200], [300, 150]] },
      { name: 'adiabatic_expansion', color: '#22C55E', points: [[300, 150], [350, 200], [400, 280]] },
      { name: 'isothermal_compression', color: '#3B82F6', points: [[400, 280], [300, 350], [200, 380]] },
      { name: 'adiabatic_compression', color: '#F59E0B', points: [[200, 380], [150, 340], [100, 300]] }
    ];

    const stageIndex = ['isothermal_expansion', 'adiabatic_expansion', 'isothermal_compression', 'adiabatic_compression'].indexOf(carnotStage);

    stages.forEach((stage, idx) => {
      ctx.strokeStyle = stage.color;
      ctx.lineWidth = idx <= stageIndex ? 4 : 2;
      ctx.globalAlpha = idx <= stageIndex ? 1 : 0.3;
      
      ctx.beginPath();
      stage.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(margin + point[0] * graphWidth / 500, margin + point[1] * graphHeight / 500);
        else ctx.lineTo(margin + point[0] * graphWidth / 500, margin + point[1] * graphHeight / 500);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Current point indicator
    const currentStage = stages[stageIndex];
    if (currentStage) {
      const lastPoint = currentStage.points[currentStage.points.length - 1];
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = currentStage.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(margin + lastPoint[0] * graphWidth / 500, margin + lastPoint[1] * graphHeight / 500, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Legend
    const legendY = height - 30;
    stages.forEach((stage, idx) => {
      ctx.fillStyle = stage.color;
      ctx.fillRect(margin + idx * 150, legendY, 20, 10);
      ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
      ctx.font = '10px Arial';
      const labels = ['تمدد متساوي الحرارة', 'تمدد أديباتي', 'انضغاط متساوي الحرارة', 'انضغاط أديباتي'];
      ctx.fillText(labels[idx], margin + idx * 150 + 25, legendY + 9);
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
      // Metal bar
      const barWidth = width - 100;
      const barHeight = 60;
      const barX = 50;
      const barY = height / 2 - barHeight / 2;

      // Temperature gradient along bar
      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      gradient.addColorStop(0, '#EF4444');
      gradient.addColorStop(0.5, '#F59E0B');
      gradient.addColorStop(1, '#3B82F6');

      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Heat source
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(barX, barY + barHeight / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', barX, barY + barHeight / 2 + 7);

      // Cold sink
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(barX + barWidth, barY + barHeight / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('❄️', barX + barWidth, barY + barHeight / 2 + 7);

      // Temperature indicators
      conductionTemp.forEach((temp, idx) => {
        const x = barX + (idx / (conductionTemp.length - 1)) * barWidth;
        ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${temp.toFixed(0)}°C`, x, barY + barHeight + 25);
      });

      // Heat flow arrows
      for (let i = 0; i < 5; i++) {
        const x = barX + 60 + i * (barWidth - 100) / 4;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, barY + barHeight / 2);
        ctx.lineTo(x + 30, barY + barHeight / 2);
        ctx.lineTo(x + 25, barY + barHeight / 2 - 5);
        ctx.moveTo(x + 30, barY + barHeight / 2);
        ctx.lineTo(x + 25, barY + barHeight / 2 + 5);
        ctx.stroke();
      }
    } else if (heatTransferMode === 'convection') {
      // Convection cell
      const cellX = width / 2 - 150;
      const cellY = 50;
      const cellWidth = 300;
      const cellHeight = 350;

      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 3;
      ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);

      // Heat source at bottom
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(cellX, cellY + cellHeight, cellWidth, 30);

      // Convection arrows
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      
      // Up arrows (hot)
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

      // Side arrows
      ctx.strokeStyle = '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(cellX + 50, cellY + 50);
      ctx.quadraticCurveTo(cellX + 150, cellY + 30, cellX + 250, cellY + 50);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cellX + 250, cellY + cellHeight - 50);
      ctx.quadraticCurveTo(cellX + 150, cellY + cellHeight - 30, cellX + 50, cellY + cellHeight - 50);
      ctx.stroke();

    } else if (heatTransferMode === 'radiation') {
      // Radiating body
      const sunX = width / 4;
      const sunY = height / 2;
      const sunRadius = 60;

      // Sun glow
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
      sunGradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
      sunGradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.4)');
      sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Sun body
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Radiation waves
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 5; i++) {
        ctx.globalAlpha = 1 - i * 0.15;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius + i * 40, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Earth receiving radiation
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(width * 0.75, sunY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Spectrum
      const spectrumY = height - 80;
      const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
      colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(50 + i * 100, spectrumY, 90, 30);
      });
      ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الطيف الكهرومغناطيسي', width / 2, spectrumY + 50);
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
                      onClick={() => setIsRunning(!isRunning)}
                      className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isRunning ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                      {isRunning ? 'إيقاف' : 'تشغيل'}
                    </Button>
                    <Button variant="outline" onClick={reset} className={isDarkMode ? 'border-gray-600 text-white' : ''}>
                      <RotateCcw className="w-4 h-4 ml-2" />
                      إعادة
                    </Button>
                  </div>
                )}

                {activeTab === 'carnot' && (
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                    <Button onClick={nextCarnotStage} className="bg-purple-600 hover:bg-purple-700">
                      <ArrowRight className="w-4 h-4 ml-2" />
                      المرحلة التالية
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
                        onClick={() => setHeatTransferMode(mode.id as any)}
                        className={heatTransferMode !== mode.id && isDarkMode ? 'border-gray-600 text-white' : ''}
                      >
                        {mode.icon} {mode.name}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Side Panel */}
            <div>
              <TabsContent value="gas" className="mt-0">
                <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-red-500/30' : 'bg-white'}`}>
                  <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>⚙️ المتغيرات</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <Thermometer className="w-4 h-4 text-red-500" />
                        درجة الحرارة: {temperature} K
                      </label>
                      <Slider
                        value={[temperature]}
                        onValueChange={([v]) => setTemperature(v)}
                        min={100}
                        max={600}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <Gauge className="w-4 h-4 text-blue-500" />
                        الحجم: {volume}%
                      </label>
                      <Slider
                        value={[volume]}
                        onValueChange={([v]) => setVolume(v)}
                        min={30}
                        max={100}
                        className="mt-2"
                      />
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>📊 القياسات:</h4>
                      <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <p>الضغط (P): {gasValues.pressure.toFixed(2)} atm</p>
                        <p>الحجم (V): {gasValues.volume.toFixed(2)} L</p>
                        <p>عدد المولات (n): {gasValues.moles}</p>
                        <p>الطاقة الحركية: {gasValues.kineticEnergy.toFixed(2)} J</p>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <p className="font-mono text-center text-lg">PV = nRT</p>
                      <p className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        قانون الغازات المثالية
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="carnot" className="mt-0">
                <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-purple-500/30' : 'bg-white'}`}>
                  <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>🔄 دورة كارنو</h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'isothermal_expansion', name: 'تمدد متساوي الحرارة', color: 'red', desc: 'الغاز يتمدد ويمتص حرارة' },
                      { id: 'adiabatic_expansion', name: 'تمدد أديباتي', color: 'green', desc: 'تمدد معزول حرارياً' },
                      { id: 'isothermal_compression', name: 'انضغاط متساوي الحرارة', color: 'blue', desc: 'الغاز ينضغط ويطرد حرارة' },
                      { id: 'adiabatic_compression', name: 'انضغاط أديباتي', color: 'yellow', desc: 'انضغاط معزول حرارياً' }
                    ].map((stage, idx) => (
                      <div
                        key={stage.id}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          carnotStage === stage.id
                            ? `border-${stage.color}-500 bg-${stage.color}-500/20`
                            : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : ''}`}>
                          {idx + 1}. {stage.name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stage.desc}
                        </p>
                      </div>
                    ))}

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                      <p className="font-mono text-center">η = 1 - T<sub>c</sub>/T<sub>h</sub></p>
                      <p className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        كفاءة محرك كارنو
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="heat" className="mt-0">
                <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-orange-500/30' : 'bg-white'}`}>
                  <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>📚 طرق انتقال الحرارة</h3>
                  
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                      <p className="font-bold text-red-500">🔗 التوصيل</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                        انتقال الحرارة عبر المادة الصلبة من جزيء لآخر
                      </p>
                      <p className="font-mono text-xs mt-1">Q = kA(ΔT/Δx)</p>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                      <p className="font-bold text-orange-500">🔄 الحمل</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                        انتقال الحرارة عبر حركة السوائل والغازات
                      </p>
                      <p className="font-mono text-xs mt-1">Q = hA(T<sub>s</sub> - T<sub>∞</sub>)</p>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                      <p className="font-bold text-yellow-500">☀️ الإشعاع</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                        انتقال الحرارة عبر الموجات الكهرومغناطيسية
                      </p>
                      <p className="font-mono text-xs mt-1">Q = εσAT⁴</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ThermodynamicsLabSimulation;
