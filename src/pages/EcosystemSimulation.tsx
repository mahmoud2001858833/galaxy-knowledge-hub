import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Sun, Moon, Leaf, Bug, Bird, Skull, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useEcosystemSimulation, Organism } from '@/hooks/useEcosystemSimulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EcosystemSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    organisms,
    isRunning,
    timeElapsed,
    populationHistory,
    ecosystemType,
    environmentFactors,
    setIsRunning,
    reset,
    addOrganism,
    removeOrganism,
    setEcosystemType,
    setEnvironmentFactor,
    getPopulationCounts,
    triggerDisaster
  } = useEcosystemSimulation();

  const populations = getPopulationCounts();

  // Organism icons and colors
  const organismConfig: Record<string, { icon: string; color: string; name: string }> = {
    plant: { icon: '🌿', color: '#22C55E', name: 'نباتات' },
    herbivore: { icon: '🐰', color: '#3B82F6', name: 'آكلات العشب' },
    carnivore: { icon: '🦊', color: '#EF4444', name: 'آكلات اللحوم' },
    apex: { icon: '🦁', color: '#F59E0B', name: 'المفترس الأعلى' },
    decomposer: { icon: '🍄', color: '#8B5CF6', name: 'المحللات' }
  };

  // Draw ecosystem
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background based on ecosystem type
    const bgColors: Record<string, { light: string; dark: string }> = {
      forest: { light: '#D1FAE5', dark: '#064E3B' },
      desert: { light: '#FEF3C7', dark: '#78350F' },
      ocean: { light: '#DBEAFE', dark: '#1E3A8A' },
      grassland: { light: '#ECFCCB', dark: '#365314' }
    };

    const bg = bgColors[ecosystemType] || bgColors.forest;
    ctx.fillStyle = isDarkMode ? bg.dark : bg.light;
    ctx.fillRect(0, 0, width, height);

    // Draw ground/terrain features
    if (ecosystemType === 'forest') {
      // Trees in background
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = isDarkMode ? '#166534' : '#86EFAC';
        ctx.beginPath();
        ctx.moveTo(i * 80 + 40, height - 50);
        ctx.lineTo(i * 80 + 20, height - 120);
        ctx.lineTo(i * 80 + 60, height - 120);
        ctx.fill();
      }
    } else if (ecosystemType === 'desert') {
      // Sand dunes
      ctx.fillStyle = isDarkMode ? '#92400E' : '#FDE68A';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(200, height - 80, 400, height);
      ctx.quadraticCurveTo(600, height - 60, 800, height);
      ctx.fill();
    } else if (ecosystemType === 'ocean') {
      // Waves
      ctx.strokeStyle = isDarkMode ? '#1D4ED8' : '#93C5FD';
      ctx.lineWidth = 2;
      for (let y = 50; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 20) {
          ctx.quadraticCurveTo(x + 10, y - 10, x + 20, y);
        }
        ctx.stroke();
      }
    }

    // Draw organisms
    organisms.forEach(org => {
      const config = organismConfig[org.type];
      ctx.font = `${16 + org.energy / 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, org.x, org.y);

      // Health bar
      const healthWidth = 20;
      const healthHeight = 3;
      ctx.fillStyle = '#374151';
      ctx.fillRect(org.x - healthWidth / 2, org.y - 15, healthWidth, healthHeight);
      ctx.fillStyle = org.energy > 50 ? '#22C55E' : org.energy > 25 ? '#F59E0B' : '#EF4444';
      ctx.fillRect(org.x - healthWidth / 2, org.y - 15, (org.energy / 100) * healthWidth, healthHeight);
    });

  }, [organisms, isDarkMode, ecosystemType]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-green-950 via-gray-900 to-blue-950' : 'bg-gradient-to-br from-green-50 via-white to-blue-50'} transition-colors duration-500`}>
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
            🌍 محاكاة النظام البيئي
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isDarkMode ? 'text-green-400 border-green-400' : ''}>
            الزمن: {Math.floor(timeElapsed)}s
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
          <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-green-500/30' : 'bg-white'}`}>
            <canvas
              ref={canvasRef}
              width={700}
              height={450}
              className="w-full rounded-lg"
            />

            {/* Controls */}
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

              <Button 
                variant="destructive" 
                onClick={() => triggerDisaster('drought')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <AlertTriangle className="w-4 h-4 ml-2" />
                كارثة طبيعية
              </Button>
            </div>

            {/* Ecosystem Type Selection */}
            <div className="mt-4">
              <label className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                نوع البيئة:
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'forest', name: '🌲 غابة' },
                  { id: 'desert', name: '🏜️ صحراء' },
                  { id: 'ocean', name: '🌊 محيط' },
                  { id: 'grassland', name: '🌾 مرج' }
                ].map(eco => (
                  <Button
                    key={eco.id}
                    variant={ecosystemType === eco.id ? 'default' : 'outline'}
                    onClick={() => setEcosystemType(eco.id)}
                    className={ecosystemType !== eco.id && isDarkMode ? 'border-gray-600 text-white' : ''}
                  >
                    {eco.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Population Stats */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {Object.entries(organismConfig).map(([type, config]) => (
                <div
                  key={type}
                  className={`p-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{config.name}</p>
                  <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{populations[type] || 0}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addOrganism(type)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeOrganism(type)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-96"
        >
          <Tabs defaultValue="graph" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="graph">الرسم البياني</TabsTrigger>
              <TabsTrigger value="factors">العوامل</TabsTrigger>
              <TabsTrigger value="info">المعلومات</TabsTrigger>
            </TabsList>

            <TabsContent value="graph">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-green-500/30' : 'bg-white'}`}>
                <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>📈 تغير الأعداد</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={populationHistory.slice(-50)}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                      <XAxis dataKey="time" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="plants" name="نباتات" stroke="#22C55E" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="herbivores" name="آكلات العشب" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="carnivores" name="آكلات اللحوم" stroke="#EF4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="apex" name="المفترس الأعلى" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="factors">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-green-500/30' : 'bg-white'}`}>
                <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>🌡️ العوامل البيئية</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                      ☀️ ضوء الشمس: {environmentFactors.sunlight}%
                    </label>
                    <Slider
                      value={[environmentFactors.sunlight]}
                      onValueChange={([v]) => setEnvironmentFactor('sunlight', v)}
                      min={0}
                      max={100}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                      💧 المياه: {environmentFactors.water}%
                    </label>
                    <Slider
                      value={[environmentFactors.water]}
                      onValueChange={([v]) => setEnvironmentFactor('water', v)}
                      min={0}
                      max={100}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                      🌡️ درجة الحرارة: {environmentFactors.temperature}°C
                    </label>
                    <Slider
                      value={[environmentFactors.temperature]}
                      onValueChange={([v]) => setEnvironmentFactor('temperature', v)}
                      min={-20}
                      max={50}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                      🌱 خصوبة التربة: {environmentFactors.fertility}%
                    </label>
                    <Slider
                      value={[environmentFactors.fertility]}
                      onValueChange={([v]) => setEnvironmentFactor('fertility', v)}
                      min={0}
                      max={100}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-green-500/30 text-white' : 'bg-white'}`}>
                <h3 className="font-bold mb-4">📚 السلسلة الغذائية</h3>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <p className="font-bold text-green-500">🌿 المنتجات (النباتات)</p>
                    <p className="text-sm">تحول طاقة الشمس إلى غذاء عبر البناء الضوئي</p>
                  </div>

                  <div className="text-center">⬇️</div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <p className="font-bold text-blue-500">🐰 المستهلكات الأولية</p>
                    <p className="text-sm">آكلات العشب التي تتغذى على النباتات</p>
                  </div>

                  <div className="text-center">⬇️</div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                    <p className="font-bold text-red-500">🦊 المستهلكات الثانوية</p>
                    <p className="text-sm">آكلات اللحوم التي تتغذى على آكلات العشب</p>
                  </div>

                  <div className="text-center">⬇️</div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <p className="font-bold text-yellow-500">🦁 المفترس الأعلى</p>
                    <p className="text-sm">قمة السلسلة الغذائية بدون مفترسات طبيعية</p>
                  </div>

                  <div className="text-center">⬇️</div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <p className="font-bold text-purple-500">🍄 المحللات</p>
                    <p className="text-sm">تحلل المواد الميتة وتعيد المغذيات للتربة</p>
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

export default EcosystemSimulation;
