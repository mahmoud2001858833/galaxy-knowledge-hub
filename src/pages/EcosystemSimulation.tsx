import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Sun, Moon, AlertTriangle, Volume2, VolumeX, Flame, Droplets, Mountain, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Enhanced organism types with more variety
const ORGANISM_TYPES = {
  // Plants
  plant: { icon: '🌿', color: '#22C55E', name: 'نباتات', type: 'producer', energy: 100, speed: 0 },
  tree: { icon: '🌳', color: '#166534', name: 'أشجار', type: 'producer', energy: 150, speed: 0 },
  cactus: { icon: '🌵', color: '#84CC16', name: 'صبار', type: 'producer', energy: 120, speed: 0 },
  seaweed: { icon: '🌊', color: '#06B6D4', name: 'طحالب', type: 'producer', energy: 80, speed: 0 },
  
  // Herbivores
  rabbit: { icon: '🐰', color: '#F472B6', name: 'أرانب', type: 'herbivore', energy: 80, speed: 3 },
  deer: { icon: '🦌', color: '#92400E', name: 'غزلان', type: 'herbivore', energy: 100, speed: 2.5 },
  
  // Carnivores
  fox: { icon: '🦊', color: '#EA580C', name: 'ثعالب', type: 'carnivore', energy: 90, speed: 4 },
  wolf: { icon: '🐺', color: '#6B7280', name: 'ذئاب', type: 'carnivore', energy: 110, speed: 3.5 },
  lion: { icon: '🦁', color: '#F59E0B', name: 'أسود', type: 'apex', energy: 150, speed: 5 },
  
  // Birds
  bird: { icon: '🐦', color: '#3B82F6', name: 'طيور', type: 'bird', energy: 60, speed: 6 },
  eagle: { icon: '🦅', color: '#78350F', name: 'نسور', type: 'apex_bird', energy: 100, speed: 7 },
  
  // Aquatic
  fish: { icon: '🐟', color: '#0EA5E9', name: 'أسماك', type: 'aquatic', energy: 70, speed: 4 },
  shark: { icon: '🦈', color: '#1E3A8A', name: 'قروش', type: 'apex_aquatic', energy: 130, speed: 5 },
  dolphin: { icon: '🐬', color: '#06B6D4', name: 'دلافين', type: 'aquatic', energy: 100, speed: 6 },
  
  // Humans
  human: { icon: '👨', color: '#F97316', name: 'بشر', type: 'human', energy: 100, speed: 2 },
  
  // Decomposers
  mushroom: { icon: '🍄', color: '#8B5CF6', name: 'فطريات', type: 'decomposer', energy: 50, speed: 0 },
};

// Environment configurations
const ENVIRONMENTS = {
  forest: {
    name: '🌲 غابة',
    bgGradient: 'from-green-900 via-emerald-900 to-green-950',
    groundColor: '#166534',
    defaultOrganisms: ['tree', 'plant', 'rabbit', 'deer', 'fox', 'wolf', 'bird', 'mushroom']
  },
  desert: {
    name: '🏜️ صحراء',
    bgGradient: 'from-amber-800 via-orange-900 to-yellow-900',
    groundColor: '#92400E',
    defaultOrganisms: ['cactus', 'rabbit', 'fox', 'eagle', 'human']
  },
  ocean: {
    name: '🌊 محيط',
    bgGradient: 'from-blue-900 via-cyan-900 to-blue-950',
    groundColor: '#0369A1',
    defaultOrganisms: ['seaweed', 'fish', 'shark', 'dolphin']
  },
  savanna: {
    name: '🦁 سافانا',
    bgGradient: 'from-yellow-700 via-amber-800 to-orange-900',
    groundColor: '#854D0E',
    defaultOrganisms: ['plant', 'deer', 'lion', 'eagle', 'human']
  },
  rainforest: {
    name: '🌴 غابة استوائية',
    bgGradient: 'from-green-800 via-teal-900 to-emerald-950',
    groundColor: '#065F46',
    defaultOrganisms: ['tree', 'plant', 'rabbit', 'fox', 'bird', 'mushroom', 'human']
  },
  arctic: {
    name: '❄️ قطب شمالي',
    bgGradient: 'from-slate-200 via-blue-200 to-cyan-300',
    groundColor: '#E2E8F0',
    defaultOrganisms: ['plant', 'rabbit', 'wolf', 'bird']
  }
};

// Disaster types
const DISASTERS = {
  flood: { 
    name: '🌊 فيضان', 
    icon: <Droplets className="w-5 h-5" />,
    effect: 'يقتل الكائنات الأرضية ويزيد المائية',
    color: 'bg-blue-600'
  },
  volcano: { 
    name: '🌋 بركان', 
    icon: <Flame className="w-5 h-5" />,
    effect: 'يدمر المنطقة ويقتل معظم الكائنات',
    color: 'bg-red-600'
  },
  fire: { 
    name: '🔥 حريق', 
    icon: <Flame className="w-5 h-5" />,
    effect: 'يحرق النباتات والحيوانات البطيئة',
    color: 'bg-orange-600'
  },
  drought: { 
    name: '☀️ جفاف', 
    icon: <Sun className="w-5 h-5" />,
    effect: 'يقلل طاقة جميع الكائنات',
    color: 'bg-yellow-600'
  },
  storm: { 
    name: '🌪️ عاصفة', 
    icon: <Mountain className="w-5 h-5" />,
    effect: 'يؤثر على الطيور والكائنات الصغيرة',
    color: 'bg-gray-600'
  },
  earthquake: {
    name: '💥 زلزال',
    icon: <Mountain className="w-5 h-5" />,
    effect: 'يدمر البنية التحتية ويقتل عشوائياً',
    color: 'bg-amber-700'
  }
};

interface Organism {
  id: string;
  type: string;
  x: number;
  y: number;
  energy: number;
  vx: number;
  vy: number;
  targetX?: number;
  targetY?: number;
}

const EcosystemSimulation = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [environment, setEnvironment] = useState<keyof typeof ENVIRONMENTS>('forest');
  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeDisaster, setActiveDisaster] = useState<string | null>(null);
  const [populationHistory, setPopulationHistory] = useState<any[]>([]);
  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Initialize ecosystem
  const initializeEcosystem = useCallback(() => {
    const envConfig = ENVIRONMENTS[environment];
    const newOrganisms: Organism[] = [];
    
    envConfig.defaultOrganisms.forEach(type => {
      const config = ORGANISM_TYPES[type as keyof typeof ORGANISM_TYPES];
      const count = config.type === 'producer' ? 8 : config.type === 'decomposer' ? 5 : 4;
      
      for (let i = 0; i < count; i++) {
        newOrganisms.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x: Math.random() * 680 + 10,
          y: Math.random() * 420 + 10,
          energy: config.energy,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed
        });
      }
    });
    
    setOrganisms(newOrganisms);
    setTime(0);
    setPopulationHistory([]);
    setActiveDisaster(null);
  }, [environment]);

  useEffect(() => {
    initializeEcosystem();
  }, [environment]);

  // Animation loop
  useEffect(() => {
    if (isPaused) return;

    const animate = () => {
      setOrganisms(prev => {
        return prev.map(org => {
          const config = ORGANISM_TYPES[org.type as keyof typeof ORGANISM_TYPES];
          
          // Update position for mobile organisms
          if (config.speed > 0) {
            let newX = org.x + org.vx * speed;
            let newY = org.y + org.vy * speed;
            let newVx = org.vx;
            let newVy = org.vy;

            // Bounce off walls
            if (newX < 10 || newX > 690) {
              newVx = -newVx;
              newX = Math.max(10, Math.min(690, newX));
            }
            if (newY < 10 || newY > 430) {
              newVy = -newVy;
              newY = Math.max(10, Math.min(430, newY));
            }

            // Random direction change
            if (Math.random() < 0.02) {
              newVx = (Math.random() - 0.5) * config.speed;
              newVy = (Math.random() - 0.5) * config.speed;
            }

            return {
              ...org,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy,
              energy: Math.max(0, org.energy - 0.1 * speed)
            };
          }
          
          return org;
        }).filter(org => org.energy > 0);
      });

      setTime(prev => prev + 0.1 * speed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, speed]);

  // Update population history
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const counts: any = { time: Math.floor(time) };
        Object.keys(ORGANISM_TYPES).forEach(type => {
          counts[type] = organisms.filter(o => o.type === type).length;
        });
        setPopulationHistory(prev => [...prev.slice(-50), counts]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [time, organisms, isPaused]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const envConfig = ENVIRONMENTS[environment];
    
    // Clear and draw background
    ctx.fillStyle = envConfig.groundColor;
    ctx.fillRect(0, 0, 700, 450);

    // Draw environment-specific features
    if (environment === 'ocean') {
      // Draw waves
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      for (let y = 30; y < 450; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 700; x += 20) {
          ctx.quadraticCurveTo(x + 10, y - 10 + Math.sin(time + x * 0.1) * 5, x + 20, y);
        }
        ctx.stroke();
      }
    } else if (environment === 'forest' || environment === 'rainforest') {
      // Draw trees in background
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#0D4220';
        ctx.beginPath();
        ctx.moveTo(i * 90 + 45, 420);
        ctx.lineTo(i * 90 + 25, 350);
        ctx.lineTo(i * 90 + 65, 350);
        ctx.fill();
      }
    } else if (environment === 'desert') {
      // Draw dunes
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.moveTo(0, 450);
      ctx.quadraticCurveTo(175, 350, 350, 450);
      ctx.quadraticCurveTo(525, 380, 700, 450);
      ctx.fill();
    }

    // Draw disaster effects
    if (activeDisaster) {
      ctx.globalAlpha = 0.3;
      if (activeDisaster === 'flood') {
        ctx.fillStyle = '#0EA5E9';
        ctx.fillRect(0, 300, 700, 150);
      } else if (activeDisaster === 'volcano' || activeDisaster === 'fire') {
        ctx.fillStyle = '#EF4444';
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 700, Math.random() * 450, Math.random() * 30 + 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw organisms
    organisms.forEach(org => {
      const config = ORGANISM_TYPES[org.type as keyof typeof ORGANISM_TYPES];
      ctx.font = `${20 + org.energy / 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, org.x, org.y);

      // Energy bar
      const barWidth = 24;
      const barHeight = 4;
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(org.x - barWidth / 2, org.y - 18, barWidth, barHeight);
      ctx.fillStyle = org.energy > 50 ? '#22C55E' : org.energy > 25 ? '#F59E0B' : '#EF4444';
      ctx.fillRect(org.x - barWidth / 2, org.y - 18, (org.energy / config.energy) * barWidth, barHeight);
    });

  }, [organisms, environment, activeDisaster, time]);

  // Apply disaster
  const applyDisaster = (disasterType: string) => {
    setActiveDisaster(disasterType);
    
    setOrganisms(prev => {
      switch (disasterType) {
        case 'flood':
          return prev.filter(org => {
            const config = ORGANISM_TYPES[org.type as keyof typeof ORGANISM_TYPES];
            return config.type.includes('aquatic') || Math.random() > 0.6;
          });
        case 'volcano':
        case 'fire':
          return prev.filter(org => Math.random() > 0.7);
        case 'drought':
          return prev.map(org => ({ ...org, energy: org.energy * 0.5 }));
        case 'storm':
          return prev.filter(org => {
            const config = ORGANISM_TYPES[org.type as keyof typeof ORGANISM_TYPES];
            return config.type !== 'bird' || Math.random() > 0.5;
          });
        case 'earthquake':
          return prev.filter(() => Math.random() > 0.4);
        default:
          return prev;
      }
    });

    setTimeout(() => setActiveDisaster(null), 3000);
  };

  // Add organism
  const addOrganism = (type: string) => {
    const config = ORGANISM_TYPES[type as keyof typeof ORGANISM_TYPES];
    setOrganisms(prev => [...prev, {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.random() * 680 + 10,
      y: Math.random() * 420 + 10,
      energy: config.energy,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed
    }]);
  };

  // Get organism counts by category
  const getOrganismsByCategory = () => {
    const categories: Record<string, { count: number; types: string[] }> = {
      'نباتات': { count: 0, types: ['plant', 'tree', 'cactus', 'seaweed'] },
      'آكلات العشب': { count: 0, types: ['rabbit', 'deer'] },
      'آكلات اللحوم': { count: 0, types: ['fox', 'wolf', 'lion'] },
      'طيور': { count: 0, types: ['bird', 'eagle'] },
      'مائيات': { count: 0, types: ['fish', 'shark', 'dolphin'] },
      'بشر': { count: 0, types: ['human'] },
      'محللات': { count: 0, types: ['mushroom'] }
    };

    organisms.forEach(org => {
      for (const [cat, data] of Object.entries(categories)) {
        if (data.types.includes(org.type)) {
          categories[cat].count++;
          break;
        }
      }
    });

    return categories;
  };

  const categories = getOrganismsByCategory();

  // Chart data
  const chartData = populationHistory.slice(-30).map(d => ({
    time: d.time,
    نباتات: (d.plant || 0) + (d.tree || 0) + (d.cactus || 0) + (d.seaweed || 0),
    آكلات_العشب: (d.rabbit || 0) + (d.deer || 0),
    آكلات_اللحوم: (d.fox || 0) + (d.wolf || 0) + (d.lion || 0),
    طيور: (d.bird || 0) + (d.eagle || 0),
    مائيات: (d.fish || 0) + (d.shark || 0) + (d.dolphin || 0)
  }));

  return (
    <div className={`min-h-screen bg-gradient-to-br ${ENVIRONMENTS[environment].bgGradient} transition-colors duration-500`}>
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
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold text-white">
            🌍 محاكاة النظام البيئي المتقدمة
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400">
            الزمن: {Math.floor(time)}s
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            الكائنات: {organisms.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
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
          <Card className="bg-gray-900/70 border-green-500/30 p-4 backdrop-blur-sm">
            {/* Disaster overlay */}
            <AnimatePresence>
              {activeDisaster && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg"
                >
                  <div className="text-6xl animate-pulse">
                    {activeDisaster === 'flood' && '🌊'}
                    {activeDisaster === 'volcano' && '🌋'}
                    {activeDisaster === 'fire' && '🔥'}
                    {activeDisaster === 'drought' && '☀️'}
                    {activeDisaster === 'storm' && '🌪️'}
                    {activeDisaster === 'earthquake' && '💥'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <canvas
              ref={canvasRef}
              width={700}
              height={450}
              className="w-full rounded-lg"
            />

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <Button
                onClick={() => setIsPaused(!isPaused)}
                className={!isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {!isPaused ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                {!isPaused ? 'إيقاف' : 'تشغيل'}
              </Button>

              <Button variant="outline" onClick={initializeEcosystem} className="border-gray-600 text-white">
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">السرعة:</span>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={0.5}
                  max={5}
                  step={0.5}
                  className="w-32"
                />
                <span className="text-white text-sm w-8">{speed}x</span>
              </div>
            </div>

            {/* Environment Selection */}
            <div className="mt-4">
              <h4 className="text-gray-400 text-sm mb-2">نوع البيئة:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ENVIRONMENTS).map(([key, env]) => (
                  <Button
                    key={key}
                    variant={environment === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEnvironment(key as keyof typeof ENVIRONMENTS)}
                    className={environment !== key ? 'border-gray-600 text-white' : ''}
                  >
                    {env.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Organism Stats */}
            <div className="grid grid-cols-7 gap-2 mt-4">
              {Object.entries(categories).map(([name, data]) => (
                <div key={name} className="p-2 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-400">{name}</p>
                  <p className="text-lg font-bold text-white">{data.count}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => data.types[0] && addOrganism(data.types[0])}
                    >
                      <Plus className="w-3 h-3" />
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
          <Tabs defaultValue="disasters" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="disasters">الكوارث</TabsTrigger>
              <TabsTrigger value="graph">الرسم البياني</TabsTrigger>
              <TabsTrigger value="add">إضافة</TabsTrigger>
            </TabsList>

            <TabsContent value="disasters">
              <Card className="bg-gray-900/70 border-red-500/30 p-4 backdrop-blur-sm">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  الكوارث الطبيعية
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(DISASTERS).map(([key, disaster]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => applyDisaster(key)}
                      className={`p-3 rounded-xl ${disaster.color} text-white text-right`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {disaster.icon}
                        <span className="font-bold">{disaster.name}</span>
                      </div>
                      <p className="text-xs opacity-80">{disaster.effect}</p>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="graph">
              <Card className="bg-gray-900/70 border-green-500/30 p-4 backdrop-blur-sm">
                <h3 className="text-white font-bold mb-4">📈 تغير الأعداد</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="نباتات" stroke="#22C55E" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="آكلات_العشب" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="آكلات_اللحوم" stroke="#EF4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="طيور" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="مائيات" stroke="#06B6D4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="add">
              <Card className="bg-gray-900/70 border-blue-500/30 p-4 backdrop-blur-sm">
                <h3 className="text-white font-bold mb-4">➕ إضافة كائنات</h3>
                <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {Object.entries(ORGANISM_TYPES).map(([type, config]) => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addOrganism(type)}
                      className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <p className="text-white text-xs">{config.name}</p>
                    </motion.button>
                  ))}
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
