import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Sun, Moon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useEcosystemSimulation, SPECIES, ENVIRONMENT_EVENTS } from '@/hooks/useEcosystemSimulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EcosystemSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const {
    state,
    statistics,
    initializeEcosystem,
    addOrganism,
    removeOrganism,
    updateSimulation,
    applyEvent,
    togglePause,
    setSpeed,
    setEnvironment,
    clearAll
  } = useEcosystemSimulation();

  // Organism icons and colors
  const organismConfig: Record<string, { icon: string; color: string; name: string }> = {
    producer: { icon: '🌿', color: '#22C55E', name: 'نباتات' },
    'primary-consumer': { icon: '🐰', color: '#3B82F6', name: 'آكلات العشب' },
    'secondary-consumer': { icon: '🦊', color: '#EF4444', name: 'آكلات اللحوم' },
    'tertiary-consumer': { icon: '🦁', color: '#F59E0B', name: 'المفترس الأعلى' },
    decomposer: { icon: '🍄', color: '#8B5CF6', name: 'المحللات' }
  };

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current) {
        const deltaTime = time - lastTimeRef.current;
        updateSimulation(deltaTime);
      }
      lastTimeRef.current = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    if (!state.isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPaused, updateSimulation]);

  // Initialize on mount
  useEffect(() => {
    initializeEcosystem('balanced');
  }, []);

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

    const bg = bgColors[state.environment] || bgColors.forest;
    ctx.fillStyle = isDarkMode ? bg.dark : bg.light;
    ctx.fillRect(0, 0, width, height);

    // Draw ground/terrain features
    if (state.environment === 'forest') {
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = isDarkMode ? '#166534' : '#86EFAC';
        ctx.beginPath();
        ctx.moveTo(i * 80 + 40, height - 50);
        ctx.lineTo(i * 80 + 20, height - 120);
        ctx.lineTo(i * 80 + 60, height - 120);
        ctx.fill();
      }
    } else if (state.environment === 'desert') {
      ctx.fillStyle = isDarkMode ? '#92400E' : '#FDE68A';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(200, height - 80, 400, height);
      ctx.quadraticCurveTo(600, height - 60, 800, height);
      ctx.fill();
    } else if (state.environment === 'ocean') {
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
    state.organisms.forEach(org => {
      ctx.font = `${16 + org.energy / 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(org.icon, org.x, org.y);

      // Health bar
      const healthWidth = 20;
      const healthHeight = 3;
      ctx.fillStyle = '#374151';
      ctx.fillRect(org.x - healthWidth / 2, org.y - 15, healthWidth, healthHeight);
      ctx.fillStyle = org.energy > 50 ? '#22C55E' : org.energy > 25 ? '#F59E0B' : '#EF4444';
      ctx.fillRect(org.x - healthWidth / 2, org.y - 15, (org.energy / org.maxEnergy) * healthWidth, healthHeight);
    });

  }, [state.organisms, isDarkMode, state.environment]);

  // Population chart data
  const populationChartData = state.populationHistory.slice(-50).map(d => ({
    time: Math.round(d.time),
    plants: d.producers,
    herbivores: d.primaryConsumers,
    carnivores: d.secondaryConsumers,
    apex: d.tertiaryConsumers
  }));

  const handleAddOrganism = (type: string) => {
    const species = SPECIES.find(s => s.type === type);
    if (species) {
      const x = Math.random() * 660 + 20;
      const y = Math.random() * 410 + 20;
      addOrganism(species.id, x, y);
    }
  };

  const handleRemoveOrganism = (type: string) => {
    const organism = state.organisms.find(o => o.type === type);
    if (organism) {
      removeOrganism(organism.id);
    }
  };

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
            الزمن: {Math.floor(state.time)}s
          </Badge>
          <Badge variant={state.balance === 'stable' ? 'default' : 'destructive'}>
            {state.balance === 'stable' ? '⚖️ مستقر' : state.balance === 'unstable' ? '⚠️ غير مستقر' : '💀 انهيار'}
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
                onClick={togglePause}
                className={`${!state.isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {!state.isPaused ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                {!state.isPaused ? 'إيقاف' : 'تشغيل'}
              </Button>

              <Button variant="outline" onClick={clearAll} className={isDarkMode ? 'border-gray-600 text-white' : ''}>
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة
              </Button>

              <Button 
                variant="destructive" 
                onClick={() => applyEvent('drought')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <AlertTriangle className="w-4 h-4 ml-2" />
                كارثة طبيعية
              </Button>
            </div>

            {/* Speed Control */}
            <div className="mt-4">
              <label className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                سرعة المحاكاة: {state.speed}x
              </label>
              <Slider
                value={[state.speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={0.5}
                max={5}
                step={0.5}
                className="w-full"
              />
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
                    variant={state.environment === eco.id ? 'default' : 'outline'}
                    onClick={() => setEnvironment(eco.id as any)}
                    className={state.environment !== eco.id && isDarkMode ? 'border-gray-600 text-white' : ''}
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
                  <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>
                    {state.organisms.filter(o => o.type === type).length}
                  </p>
                  <div className="flex justify-center gap-1 mt-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddOrganism(type)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveOrganism(type)}>
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
              <TabsTrigger value="events">الأحداث</TabsTrigger>
              <TabsTrigger value="info">المعلومات</TabsTrigger>
            </TabsList>

            <TabsContent value="graph">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-green-500/30' : 'bg-white'}`}>
                <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>📈 تغير الأعداد</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={populationChartData}>
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

                {/* Statistics */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>إجمالي الكائنات</p>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{statistics.total}</p>
                  </div>
                  <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>متوسط الطاقة</p>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{Math.round(statistics.averageEnergy)}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-900/50 border-green-500/30' : 'bg-white'}`}>
                <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>🌪️ الأحداث البيئية</h3>
                <div className="space-y-2">
                  {ENVIRONMENT_EVENTS.map(event => (
                    <Button
                      key={event.id}
                      variant="outline"
                      onClick={() => applyEvent(event.id)}
                      className={`w-full justify-start ${isDarkMode ? 'border-gray-600 text-white' : ''}`}
                    >
                      <span className="ml-2">
                        {event.id === 'drought' ? '☀️' : 
                         event.id === 'flood' ? '🌊' : 
                         event.id === 'fire' ? '🔥' : 
                         event.id === 'disease' ? '🦠' : '🌸'}
                      </span>
                      {event.nameAr}
                    </Button>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>سيناريوهات جاهزة</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => initializeEcosystem('balanced')}
                      className={`w-full ${isDarkMode ? 'border-gray-600 text-white' : ''}`}
                    >
                      ⚖️ نظام متوازن
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => initializeEcosystem('producers-heavy')}
                      className={`w-full ${isDarkMode ? 'border-gray-600 text-white' : ''}`}
                    >
                      🌿 وفرة النباتات
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => initializeEcosystem('predators-heavy')}
                      className={`w-full ${isDarkMode ? 'border-gray-600 text-white' : ''}`}
                    >
                      🦁 كثرة المفترسات
                    </Button>
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
