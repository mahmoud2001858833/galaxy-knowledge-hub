import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Sun, Moon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSolarSystemPhysics, CelestialBody } from '@/hooks/useSolarSystemPhysics';

const SolarSystemSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<CelestialBody | null>(null);
  const [viewScale, setViewScale] = useState(1);

  const {
    state,
    selectBody,
    setTimeScale,
    togglePause,
    toggleOrbits,
    toggleLabels,
    resetSimulation,
    getBodyPosition,
    selectedBodyInfo
  } = useSolarSystemPhysics();

  const planets = state.bodies.filter(b => b.type === 'planet' || b.type === 'dwarf-planet');

  // Planet colors
  const planetColors: Record<string, string> = {
    'عطارد': '#B5B5B5',
    'الزهرة': '#E6C229',
    'الأرض': '#4A90D9',
    'المريخ': '#E27B58',
    'المشتري': '#C9A86C',
    'زحل': '#E4D191',
    'أورانوس': '#7DE3F4',
    'نبتون': '#4B70DD',
    'بلوتو': '#9CA6B5',
    'Mercury': '#B5B5B5',
    'Venus': '#E6C229',
    'Earth': '#4A90D9',
    'Mars': '#E27B58',
    'Jupiter': '#C9A86C',
    'Saturn': '#E4D191',
    'Uranus': '#7DE3F4',
    'Neptune': '#4B70DD',
    'Pluto': '#9CA6B5'
  };

  // Draw solar system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = isDarkMode ? '#0a0a1a' : '#f0f5ff';
    ctx.fillRect(0, 0, width, height);

    // Draw stars in dark mode
    if (isDarkMode) {
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        const opacity = Math.random() * 0.8 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Scale factor for visualization
    const scale = 80 * viewScale * state.distanceScale;

    // Draw orbits
    if (state.showOrbits) {
      planets.forEach(planet => {
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.orbitalRadius * scale, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Draw Sun with glow
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    sunGradient.addColorStop(0, '#FFF5E0');
    sunGradient.addColorStop(0.3, '#FFD93D');
    sunGradient.addColorStop(0.6, '#FF8C00');
    sunGradient.addColorStop(1, '#FF4500');
    
    ctx.shadowColor = '#FFD93D';
    ctx.shadowBlur = 50;
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw planets
    planets.forEach(planet => {
      const pos = getBodyPosition(planet, state.distanceScale);
      const x = centerX + pos.x * scale * 0.001;
      const y = centerY + pos.y * scale * 0.001;

      ctx.shadowColor = planetColors[planet.name] || planetColors[planet.nameAr] || '#ffffff';
      ctx.shadowBlur = 10;

      ctx.fillStyle = planetColors[planet.name] || planetColors[planet.nameAr] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, 8 * state.sizeScale), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Saturn rings
      if (planet.name === 'Saturn' || planet.nameAr === 'زحل') {
        ctx.strokeStyle = '#E4D191';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Planet label
      if (state.showLabels) {
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(planet.nameAr, x, y + 20);
      }
    });

  }, [state, isDarkMode, viewScale, getBodyPosition, planets]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 80 * viewScale * state.distanceScale;

    for (const planet of planets) {
      const pos = getBodyPosition(planet, state.distanceScale);
      const px = centerX + pos.x * scale * 0.001;
      const py = centerY + pos.y * scale * 0.001;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      
      if (dist < 20) {
        setSelectedPlanet(planet);
        selectBody(planet.id);
        return;
      }
    }
    setSelectedPlanet(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-blue-50'} transition-colors duration-500`}>
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
            🌌 محاكاة النظام الشمسي
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isDarkMode ? 'text-yellow-400 border-yellow-400' : ''}>
            <Clock className="w-3 h-3 ml-1" />
            سرعة: {state.timeScale}x
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={isDarkMode ? 'text-white' : 'text-gray-800'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Main Canvas */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1"
        >
          <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white'}`}>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className="w-full rounded-lg cursor-pointer"
              style={{ maxHeight: '60vh' }}
            />

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Button
                onClick={togglePause}
                className={`${!state.isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {!state.isPaused ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                {!state.isPaused ? 'إيقاف' : 'تشغيل'}
              </Button>

              <Button variant="outline" onClick={resetSimulation} className={isDarkMode ? 'border-gray-600 text-white' : ''}>
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setViewScale(Math.max(0.5, viewScale - 0.2))} className={isDarkMode ? 'border-gray-600 text-white' : ''}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className={`text-sm ${isDarkMode ? 'text-white' : ''}`}>{(viewScale * 100).toFixed(0)}%</span>
                <Button variant="outline" size="icon" onClick={() => setViewScale(Math.min(2, viewScale + 0.2))} className={isDarkMode ? 'border-gray-600 text-white' : ''}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Time Speed */}
            <div className="mt-4">
              <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                سرعة الزمن: {state.timeScale}x
              </label>
              <Slider
                value={[state.timeScale]}
                onValueChange={([v]) => setTimeScale(v)}
                min={0.1}
                max={100}
                step={0.1}
                className="mt-2"
              />
            </div>

            {/* Toggle Options */}
            <div className="flex gap-4 mt-4">
              <label className={`flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-white' : ''}`}>
                <input
                  type="checkbox"
                  checked={state.showOrbits}
                  onChange={toggleOrbits}
                  className="rounded"
                />
                إظهار المدارات
              </label>
              <label className={`flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-white' : ''}`}>
                <input
                  type="checkbox"
                  checked={state.showLabels}
                  onChange={toggleLabels}
                  className="rounded"
                />
                إظهار الأسماء
              </label>
            </div>
          </Card>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-96"
        >
          <Tabs defaultValue="planets" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="planets">الكواكب</TabsTrigger>
              <TabsTrigger value="laws">قوانين كيبلر</TabsTrigger>
              <TabsTrigger value="info">معلومات</TabsTrigger>
            </TabsList>

            <TabsContent value="planets">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white'}`}>
                <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>🪐 الكواكب</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {planets.map(planet => (
                    <motion.div
                      key={planet.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedPlanet(planet);
                        selectBody(planet.id);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPlanet?.id === planet.id
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: planetColors[planet.name] || planetColors[planet.nameAr] }}
                        />
                        <div>
                          <p className="font-bold">{planet.nameAr}</p>
                          <p className="text-xs opacity-70">
                            الدور: {planet.orbitalPeriod?.toFixed(1) || 'N/A'} يوم
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected Planet Info */}
                <AnimatePresence>
                  {selectedBodyInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}
                    >
                      <h4 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : ''}`}>
                        {selectedBodyInfo.nameAr}
                      </h4>
                      <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p>📏 نصف القطر: {selectedBodyInfo.radius?.toLocaleString()} كم</p>
                        <p>⚖️ الكتلة: {selectedBodyInfo.mass?.toExponential(2)} كغ</p>
                        <p>📍 البعد عن الشمس: {selectedBodyInfo.orbitalRadius?.toFixed(2)} AU</p>
                        <p>🔄 الدور المداري: {selectedBodyInfo.orbitalPeriod?.toFixed(1)} يوم</p>
                        <p>🌀 السرعة المدارية: {selectedBodyInfo.orbitalVelocity?.toFixed(2)} كم/ث</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </TabsContent>

            <TabsContent value="laws">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-white' : 'bg-white'}`}>
                <h3 className="font-bold mb-4">📐 قوانين كيبلر</h3>
                
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <h4 className="font-bold text-blue-500">القانون الأول: المدارات الإهليلجية</h4>
                    <p className="text-sm mt-1">
                      تدور الكواكب حول الشمس في مدارات إهليلجية (بيضاوية) تقع الشمس في إحدى بؤرتيها
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                    <h4 className="font-bold text-green-500">القانون الثاني: المساحات المتساوية</h4>
                    <p className="text-sm mt-1">
                      الخط الواصل بين الكوكب والشمس يمسح مساحات متساوية في أزمنة متساوية
                    </p>
                    <p className="text-xs mt-2 font-mono bg-black/20 p-2 rounded">
                      dA/dt = ثابت
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                    <h4 className="font-bold text-purple-500">القانون الثالث: العلاقة التوافقية</h4>
                    <p className="text-sm mt-1">
                      مربع الدور المداري يتناسب طردياً مع مكعب نصف المحور الأكبر
                    </p>
                    <p className="text-xs mt-2 font-mono bg-black/20 p-2 rounded">
                      T² = (4π²/GM) × a³
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-white' : 'bg-white'}`}>
                <h3 className="font-bold mb-4">📚 معلومات عن النظام الشمسي</h3>
                
                <div className="space-y-3 text-sm">
                  <p><strong>عمر النظام الشمسي:</strong> ~4.6 مليار سنة</p>
                  <p><strong>عدد الكواكب:</strong> 8 كواكب رئيسية</p>
                  <p><strong>الشمس:</strong> نجم قزم أصفر يحتوي على 99.86% من كتلة النظام</p>
                  <p><strong>حزام الكويكبات:</strong> بين المريخ والمشتري</p>
                  <p><strong>حزام كايبر:</strong> خلف نبتون، يحتوي على بلوتو</p>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} mt-4`}>
                    <p className="text-yellow-500 font-bold">💡 هل تعلم؟</p>
                    <p className="mt-1">
                      الضوء يستغرق حوالي 8 دقائق للوصول من الشمس إلى الأرض!
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default SolarSystemSimulation;