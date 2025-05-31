
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Info, Zap, Search, Plus, Trash2, MessageCircle, Move, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { allElements, CompleteElement } from '@/data/all-elements';

interface Particle {
  id: string;
  type: 'proton' | 'neutron' | 'electron';
  x: number;
  y: number;
  isDragging?: boolean;
  inContainer?: boolean;
  inNucleus?: boolean;
  orbitalLevel?: number;
  angle?: number;
}

interface AtomData {
  protons: number;
  neutrons: number;
  electrons: number;
  element: string;
  symbol: string;
  massNumber: number;
  charge: number;
  isStable: boolean;
}

const ORBITAL_RADII = [60, 100, 140, 180];
const ORBITAL_CAPACITY = [2, 8, 18, 32];
const ATOM_CENTER = { x: 400, y: 300 };
const NUCLEUS_RADIUS = 30;
const ATTRACTION_DISTANCE = 80;

const BuildAtomSimulation = () => {
  const navigate = useNavigate();
  const atomAreaRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPosition, setAssistantPosition] = useState({ x: 20, y: 100 });
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [atomData, setAtomData] = useState<AtomData>({
    protons: 0,
    neutrons: 0,
    electrons: 0,
    element: 'غير معروف',
    symbol: '?',
    massNumber: 0,
    charge: 0,
    isStable: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [particleCounts, setParticleCounts] = useState({
    proton: 10,
    neutron: 10,
    electron: 10
  });

  // Animation frame for electron movement
  const animationFrameRef = useRef<number>();

  // Filter elements based on search
  const filteredElements = allElements.filter(element => 
    element.name.includes(searchTerm) || 
    element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate distance between two points
  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Find next available orbital position
  const findNextOrbitalPosition = (particles: Particle[]) => {
    const electronsInOrbitals = particles.filter(p => p.type === 'electron' && !p.inContainer);
    
    for (let level = 0; level < ORBITAL_RADII.length; level++) {
      const electronsInThisLevel = electronsInOrbitals.filter(p => p.orbitalLevel === level).length;
      
      if (electronsInThisLevel < ORBITAL_CAPACITY[level]) {
        const angleStep = (2 * Math.PI) / Math.min(ORBITAL_CAPACITY[level], electronsInThisLevel + 1);
        const angle = electronsInThisLevel * angleStep;
        
        return {
          x: ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[level],
          y: ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[level],
          level,
          angle
        };
      }
    }
    
    // If all orbitals are full, place in the outermost orbital
    const lastLevel = ORBITAL_RADII.length - 1;
    const electronsInLastLevel = electronsInOrbitals.filter(p => p.orbitalLevel === lastLevel).length;
    const angleStep = (2 * Math.PI) / (electronsInLastLevel + 1);
    const angle = electronsInLastLevel * angleStep;
    
    return {
      x: ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[lastLevel],
      y: ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[lastLevel],
      level: lastLevel,
      angle
    };
  };

  // Calculate atom data
  const calculateAtomData = useCallback((particles: Particle[]) => {
    const protons = particles.filter(p => p.type === 'proton' && !p.inContainer).length;
    const neutrons = particles.filter(p => p.type === 'neutron' && !p.inContainer).length;
    const electrons = particles.filter(p => p.type === 'electron' && !p.inContainer).length;

    const element = allElements.find(e => e.atomic_number === protons);
    const massNumber = protons + neutrons;
    const charge = protons - electrons;
    const isStable = element ? Math.abs(neutrons - element.commonNeutrons) <= 2 && Math.abs(charge) <= 1 : false;

    return {
      protons,
      neutrons,
      electrons,
      element: element ? element.name : 'غير معروف',
      symbol: element ? element.symbol : '?',
      massNumber,
      charge,
      isStable
    };
  }, []);

  // Animate electrons in orbit
  const animateElectrons = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined && !particle.isDragging) {
          const newAngle = (particle.angle || 0) + (0.02 / (particle.orbitalLevel + 1));
          const radius = ORBITAL_RADII[particle.orbitalLevel];
          
          return {
            ...particle,
            x: ATOM_CENTER.x + Math.cos(newAngle) * radius,
            y: ATOM_CENTER.y + Math.sin(newAngle) * radius,
            angle: newAngle
          };
        }
        return particle;
      });
    });

    animationFrameRef.current = requestAnimationFrame(animateElectrons);
  }, []);

  // Start/stop electron animation
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateElectrons);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateElectrons]);

  // Add particle from container
  const addParticleFromContainer = (type: 'proton' | 'neutron' | 'electron') => {
    if (particleCounts[type] <= 0) return;
    
    const containerArea = getContainerArea(type);
    const newParticle: Particle = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: containerArea.x + Math.random() * (containerArea.width - 40),
      y: containerArea.y + Math.random() * (containerArea.height - 40),
      inContainer: true
    };

    setParticles(prev => [...prev, newParticle]);
    setParticleCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
  };

  // Get container area coordinates
  const getContainerArea = (type: 'proton' | 'neutron' | 'electron') => {
    switch (type) {
      case 'proton':
        return { x: 50, y: 50, width: 200, height: 100 };
      case 'neutron':
        return { x: 270, y: 50, width: 200, height: 100 };
      case 'electron':
        return { x: 490, y: 50, width: 200, height: 100 };
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  };

  // Clear all particles
  const clearAllParticles = () => {
    setParticles([]);
    setParticleCounts({ proton: 10, neutron: 10, electron: 10 });
    setAtomData({
      protons: 0,
      neutrons: 0,
      electrons: 0,
      element: 'غير معروف',
      symbol: '?',
      massNumber: 0,
      charge: 0,
      isStable: false
    });
  };

  // Remove particle
  const removeParticle = (id: string) => {
    const particle = particles.find(p => p.id === id);
    if (particle) {
      setParticleCounts(prev => ({ ...prev, [particle.type]: prev[particle.type] + 1 }));
    }
    const newParticles = particles.filter(p => p.id !== id);
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Update particle position with magnetic attraction
  const updateParticlePosition = (id: string, x: number, y: number) => {
    const particle = particles.find(p => p.id === id);
    if (!particle) return;

    let newX = x;
    let newY = y;
    let inContainer = false;
    let inNucleus = false;
    let orbitalLevel = undefined;
    let angle = undefined;

    // Check if particle is in container area
    const containerArea = getContainerArea(particle.type);
    if (x >= containerArea.x && x <= containerArea.x + containerArea.width &&
        y >= containerArea.y && y <= containerArea.y + containerArea.height) {
      inContainer = true;
    } else {
      // Apply magnetic attraction for particles in atom area
      const distanceToCenter = calculateDistance(x, y, ATOM_CENTER.x, ATOM_CENTER.y);

      if (particle.type === 'proton' || particle.type === 'neutron') {
        // Attract to nucleus
        if (distanceToCenter <= NUCLEUS_RADIUS + ATTRACTION_DISTANCE) {
          const angleToCenter = Math.atan2(y - ATOM_CENTER.y, x - ATOM_CENTER.x);
          const targetRadius = Math.random() * NUCLEUS_RADIUS * 0.8;
          newX = ATOM_CENTER.x + Math.cos(angleToCenter) * targetRadius;
          newY = ATOM_CENTER.y + Math.sin(angleToCenter) * targetRadius;
          inNucleus = true;
        }
      } else if (particle.type === 'electron') {
        // Attract to nearest available orbital
        const orbitalPosition = findNextOrbitalPosition(particles.filter(p => p.id !== id));
        if (distanceToCenter <= ORBITAL_RADII[ORBITAL_RADII.length - 1] + ATTRACTION_DISTANCE) {
          newX = orbitalPosition.x;
          newY = orbitalPosition.y;
          orbitalLevel = orbitalPosition.level;
          angle = orbitalPosition.angle;
        }
      }
    }

    const newParticles = particles.map(p => 
      p.id === id ? { 
        ...p, 
        x: newX, 
        y: newY, 
        inContainer,
        inNucleus,
        orbitalLevel,
        angle,
        isDragging: false
      } : p
    );
    
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Build specific element
  const buildElement = (elementData: CompleteElement) => {
    clearAllParticles();
    const newParticles: Particle[] = [];
    
    // Add protons to nucleus
    for (let i = 0; i < elementData.atomic_number; i++) {
      const angle = (i / elementData.atomic_number) * 2 * Math.PI;
      const radius = Math.random() * 20 + 5;
      newParticles.push({
        id: `proton-${i}-${Date.now()}`,
        type: 'proton',
        x: ATOM_CENTER.x + Math.cos(angle) * radius,
        y: ATOM_CENTER.y + Math.sin(angle) * radius,
        inContainer: false,
        inNucleus: true
      });
    }
    
    // Add neutrons to nucleus
    for (let i = 0; i < elementData.commonNeutrons; i++) {
      const angle = ((i + elementData.atomic_number) / (elementData.atomic_number + elementData.commonNeutrons)) * 2 * Math.PI;
      const radius = Math.random() * 20 + 5;
      newParticles.push({
        id: `neutron-${i}-${Date.now()}`,
        type: 'neutron',
        x: ATOM_CENTER.x + Math.cos(angle) * radius,
        y: ATOM_CENTER.y + Math.sin(angle) * radius,
        inContainer: false,
        inNucleus: true
      });
    }
    
    // Add electrons in proper shells
    let remainingElectrons = elementData.atomic_number;
    
    for (let shell = 0; shell < ORBITAL_RADII.length && remainingElectrons > 0; shell++) {
      const electronsInThisShell = Math.min(remainingElectrons, ORBITAL_CAPACITY[shell]);
      const angleStep = (2 * Math.PI) / electronsInThisShell;
      
      for (let e = 0; e < electronsInThisShell; e++) {
        const angle = e * angleStep;
        newParticles.push({
          id: `electron-${shell}-${e}-${Date.now()}`,
          type: 'electron',
          x: ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[shell],
          y: ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[shell],
          inContainer: false,
          orbitalLevel: shell,
          angle: angle
        });
      }
      remainingElectrons -= electronsInThisShell;
    }

    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Get particle color
  const getParticleColor = (type: string) => {
    switch (type) {
      case 'proton': return '#ef4444';
      case 'neutron': return '#64748b';
      case 'electron': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Get particle name
  const getParticleName = (type: string) => {
    switch (type) {
      case 'proton': return 'بروتون';
      case 'neutron': return 'نيوترون';
      case 'electron': return 'إلكترون';
      default: return 'جسيم';
    }
  };

  // Gemini AI Assistant
  const queryGeminiAPI = async (question: string) => {
    setIsLoadingResponse(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDR0bf_lLE8A83mionE3IT5gAH3Z8-O-MA`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `أنت مساعد ذكي متخصص في الكيمياء والفيزياء الذرية. أجب على السؤال التالي باللغة العربية بشكل علمي ومبسط: ${question}
                    
                    السياق الحالي:
                    - العنصر: ${atomData.element} (${atomData.symbol})
                    - البروتونات: ${atomData.protons}
                    - النيوترونات: ${atomData.neutrons}
                    - الإلكترونات: ${atomData.electrons}
                    - العدد الكتلي: ${atomData.massNumber}
                    - الشحنة: ${atomData.charge}
                    - حالة الاستقرار: ${atomData.isStable ? 'مستقر' : 'غير مستقر'}
                    `
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setAssistantResponse(data.candidates[0].content.parts[0].text);
      } else {
        setAssistantResponse('عذراً، لم أتمكن من الحصول على إجابة. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error querying Gemini API:', error);
      setAssistantResponse('حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Handle assistant movement
  const handleAssistantDrag = (event: any, info: any) => {
    setAssistantPosition({
      x: assistantPosition.x + info.delta.x,
      y: assistantPosition.y + info.delta.y
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/scientific-simulations')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              العودة للمحاكاة
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              تجربة بناء الذرة التفاعلية المتطورة
            </h1>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAssistant(!showAssistant)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                المساعد الذكي
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllParticles} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-1" />
                حذف الكل
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Atom Information */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  معلومات الذرة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-white mb-2">{atomData.symbol}</div>
                  <div className="text-lg text-gray-300">{atomData.element}</div>
                  <Badge 
                    variant={atomData.isStable ? "default" : "destructive"}
                    className="mt-2"
                  >
                    {atomData.isStable ? 'مستقر' : 'غير مستقر'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">البروتونات:</span>
                    <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-500/30">
                      {atomData.protons}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">النيوترونات:</span>
                    <Badge variant="outline" className="bg-gray-900/30 text-gray-300 border-gray-500/30">
                      {atomData.neutrons}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">الإلكترونات:</span>
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-500/30">
                      {atomData.electrons}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">العدد الكتلي:</span>
                    <Badge variant="outline">{atomData.massNumber}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">الشحنة:</span>
                    <Badge variant={atomData.charge === 0 ? "default" : "destructive"}>
                      {atomData.charge > 0 ? `+${atomData.charge}` : atomData.charge}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Elements Search and Quick Build */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-purple-300">بناء العناصر السريع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="ابحث عن عنصر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600"
                  />
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredElements.slice(0, 20).map((element) => (
                    <button
                      key={element.atomic_number}
                      onClick={() => buildElement(element)}
                      className="w-full text-left text-sm p-2 rounded bg-purple-800/20 hover:bg-purple-800/40 transition-colors border border-purple-500/30"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-purple-300">{element.symbol}</span>
                        <span className="text-xs text-gray-400">#{element.atomic_number}</span>
                      </div>
                      <div className="text-xs text-gray-300">{element.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Atom Building Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[700px]">
              <CardContent className="p-4 h-full">
                <div 
                  ref={atomAreaRef}
                  className="relative w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg border-2 border-dashed border-gray-500/50 overflow-hidden"
                  style={{ 
                    backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                  }}
                >
                  {/* Particle Containers at Top */}
                  <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-4">
                    {/* Proton Container */}
                    <div className="bg-red-900/40 border-2 border-red-500/60 rounded-xl p-3 h-28 backdrop-blur-sm">
                      <div className="text-red-300 text-sm font-bold mb-2 text-center flex items-center justify-between">
                        <span>بروتونات (P+)</span>
                        <Badge className="bg-red-600 text-white text-xs">{particleCounts.proton}</Badge>
                      </div>
                      <Button
                        onClick={() => addParticleFromContainer('proton')}
                        disabled={particleCounts.proton <= 0}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        إضافة
                      </Button>
                    </div>
                    
                    {/* Neutron Container */}
                    <div className="bg-gray-900/40 border-2 border-gray-500/60 rounded-xl p-3 h-28 backdrop-blur-sm">
                      <div className="text-gray-300 text-sm font-bold mb-2 text-center flex items-center justify-between">
                        <span>نيوترونات (n°)</span>
                        <Badge className="bg-gray-600 text-white text-xs">{particleCounts.neutron}</Badge>
                      </div>
                      <Button
                        onClick={() => addParticleFromContainer('neutron')}
                        disabled={particleCounts.neutron <= 0}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        إضافة
                      </Button>
                    </div>
                    
                    {/* Electron Container */}
                    <div className="bg-blue-900/40 border-2 border-blue-500/60 rounded-xl p-3 h-28 backdrop-blur-sm">
                      <div className="text-blue-300 text-sm font-bold mb-2 text-center flex items-center justify-between">
                        <span>إلكترونات (e-)</span>
                        <Badge className="bg-blue-600 text-white text-xs">{particleCounts.electron}</Badge>
                      </div>
                      <Button
                        onClick={() => addParticleFromContainer('electron')}
                        disabled={particleCounts.electron <= 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        إضافة
                      </Button>
                    </div>
                  </div>

                  {/* Central Nucleus */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div 
                      className="rounded-full border-2 border-yellow-400/80 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-2xl"
                      style={{
                        width: `${NUCLEUS_RADIUS * 2}px`,
                        height: `${NUCLEUS_RADIUS * 2}px`,
                        boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.3)'
                      }}
                    >
                      <span className="text-yellow-300 text-xs font-bold">النواة</span>
                    </div>
                  </div>

                  {/* Electron Orbitals */}
                  {ORBITAL_RADII.map((radius, index) => (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-blue-400/50 rounded-full animate-pulse"
                      style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        boxShadow: `0 0 ${8 + index * 3}px rgba(59, 130, 246, 0.4)`,
                        background: `radial-gradient(circle, transparent 98%, rgba(59, 130, 246, 0.15) 100%)`
                      }}
                    >
                      <div 
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg"
                        style={{ fontSize: '10px' }}
                      >
                        مستوى {index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Particles */}
                  {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="absolute cursor-move"
                      style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
                        zIndex: particle.isDragging ? 1000 : 1,
                      }}
                      drag
                      dragMomentum={false}
                      onDragStart={() => {
                        setParticles(prev => prev.map(p => 
                          p.id === particle.id ? { ...p, isDragging: true } : p
                        ));
                      }}
                      onDrag={(_, info) => {
                        updateParticlePosition(
                          particle.id,
                          particle.x + info.delta.x,
                          particle.y + info.delta.y
                        );
                      }}
                      onDragEnd={() => {
                        setParticles(prev => prev.map(p => 
                          p.id === particle.id ? { ...p, isDragging: false } : p
                        ));
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileDrag={{ scale: 1.3 }}
                      animate={{
                        scale: particle.inNucleus || particle.orbitalLevel !== undefined ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center text-xs font-bold text-white shadow-xl cursor-pointer group"
                        style={{ 
                          backgroundColor: getParticleColor(particle.type),
                          boxShadow: `0 0 15px ${getParticleColor(particle.type)}, inset 0 0 8px rgba(255,255,255,0.4)`
                        }}
                        onClick={() => removeParticle(particle.id)}
                        title={`${getParticleName(particle.type)} - انقر للحذف`}
                      >
                        {particle.type === 'proton' ? 'P+' : 
                         particle.type === 'neutron' ? 'n°' : 'e-'}
                        
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20">
                          <div className="font-bold">{getParticleName(particle.type)}</div>
                          <div className="text-gray-300">انقر للحذف</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Instructions */}
                  {particles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center mt-20">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-6">⚛️</div>
                        <p className="text-2xl mb-4 font-bold">ابدأ ببناء ذرتك!</p>
                        <p className="text-sm mb-2">أضف الجسيمات من الأوعية أعلاه</p>
                        <p className="text-sm mb-2">أو ابحث عن عنصر للبناء السريع</p>
                        <p className="text-xs text-gray-500 mt-4">سيتم جذب الجسيمات تلقائياً لمواضعها الصحيحة</p>
                        <p className="text-xs text-gray-500">الإلكترونات ستتحرك في مداراتها بشكل مستمر</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Draggable AI Assistant */}
      {showAssistant && (
        <motion.div
          drag
          dragMomentum={false}
          onDrag={handleAssistantDrag}
          style={{
            position: 'fixed',
            left: assistantPosition.x,
            top: assistantPosition.y,
            zIndex: 1000
          }}
          className="w-96 max-w-[90vw]"
          whileDrag={{ scale: 1.05 }}
        >
          <Card className="bg-purple-900/95 backdrop-blur-sm border-purple-500/50 shadow-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-300 flex items-center text-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  المساعد الذكي للفيزياء الذرية
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-gray-400 cursor-move" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssistant(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="اسأل عن بناء الذرات..."
                  className="flex-1 bg-purple-800/50 border-purple-500/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && assistantQuery.trim()) {
                      queryGeminiAPI(assistantQuery);
                    }
                  }}
                />
                <Button
                  onClick={() => assistantQuery.trim() && queryGeminiAPI(assistantQuery)}
                  disabled={isLoadingResponse || !assistantQuery.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoadingResponse ? '...' : 'سؤال'}
                </Button>
              </div>
              
              {assistantResponse && (
                <div className="bg-purple-800/30 p-3 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                    {assistantResponse}
                  </p>
                </div>
              )}
              
              {!assistantResponse && !isLoadingResponse && (
                <div className="text-center text-purple-300 text-sm">
                  مرحباً! اسألني أي سؤال عن بناء الذرات والفيزياء الذرية
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BuildAtomSimulation;
