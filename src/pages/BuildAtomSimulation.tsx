
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Info, Zap, Search, Plus, Trash2 } from 'lucide-react';
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

const ORBITAL_RADII = [80, 120, 160, 200];
const ORBITAL_CAPACITY = [2, 8, 18, 32];
const ATOM_CENTER = { x: 400, y: 300 };
const NUCLEUS_RADIUS = 40;
const ATTRACTION_DISTANCE = 60;

const BuildAtomSimulation = () => {
  const navigate = useNavigate();
  const atomAreaRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
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
    proton: 5,
    neutron: 5,
    electron: 5
  });

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
          level
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
      level: lastLevel
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

  // Add particle to container
  const addParticleToContainer = (type: 'proton' | 'neutron' | 'electron') => {
    if (particleCounts[type] <= 0) return;
    
    const containerArea = getContainerArea(type);
    const newParticle: Particle = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: containerArea.x + Math.random() * (containerArea.width - 40),
      y: containerArea.y + Math.random() * (containerArea.height - 40),
      inContainer: true
    };

    const newParticles = [...particles, newParticle];
    setParticles(newParticles);
    setParticleCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
  };

  // Get container area coordinates
  const getContainerArea = (type: 'proton' | 'neutron' | 'electron') => {
    switch (type) {
      case 'proton':
        return { x: 20, y: 20, width: 180, height: 120 };
      case 'neutron':
        return { x: 220, y: 20, width: 180, height: 120 };
      case 'electron':
        return { x: 420, y: 20, width: 180, height: 120 };
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  };

  // Clear all particles
  const clearAllParticles = () => {
    setParticles([]);
    setParticleCounts({ proton: 5, neutron: 5, electron: 5 });
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
          const angle = Math.atan2(y - ATOM_CENTER.y, x - ATOM_CENTER.x);
          const targetRadius = Math.random() * NUCLEUS_RADIUS;
          newX = ATOM_CENTER.x + Math.cos(angle) * targetRadius;
          newY = ATOM_CENTER.y + Math.sin(angle) * targetRadius;
          inNucleus = true;
        }
      } else if (particle.type === 'electron') {
        // Attract to nearest available orbital
        const orbitalPosition = findNextOrbitalPosition(particles.filter(p => p.id !== id));
        if (distanceToCenter <= ORBITAL_RADII[ORBITAL_RADII.length - 1] + ATTRACTION_DISTANCE) {
          newX = orbitalPosition.x;
          newY = orbitalPosition.y;
          orbitalLevel = orbitalPosition.level;
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
        orbitalLevel
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
      const radius = Math.random() * 25 + 10;
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
      const radius = Math.random() * 25 + 10;
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
          orbitalLevel: shell
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
              <Button variant="outline" size="sm" onClick={clearAllParticles} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-1" />
                حذف الكل
              </Button>
              <Button variant="outline" size="sm" onClick={() => setParticles([])}>
                <RotateCcw className="w-4 h-4 mr-1" />
                إعادة تعيين
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Particle Containers */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  أوعية الجسيمات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Proton Container */}
                <div className="bg-red-900/40 p-4 rounded-xl border-2 border-red-500/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-red-300 font-bold text-lg">البروتونات</span>
                    <Badge className="bg-red-600 text-white">{particleCounts.proton}</Badge>
                  </div>
                  <Button
                    onClick={() => addParticleToContainer('proton')}
                    disabled={particleCounts.proton <= 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة بروتون (+)
                  </Button>
                  <div className="text-xs text-gray-300 mt-2">
                    شحنة موجبة (+1) | في النواة
                  </div>
                </div>

                {/* Neutron Container */}
                <div className="bg-gray-900/40 p-4 rounded-xl border-2 border-gray-500/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-300 font-bold text-lg">النيوترونات</span>
                    <Badge className="bg-gray-600 text-white">{particleCounts.neutron}</Badge>
                  </div>
                  <Button
                    onClick={() => addParticleToContainer('neutron')}
                    disabled={particleCounts.neutron <= 0}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة نيوترون (0)
                  </Button>
                  <div className="text-xs text-gray-300 mt-2">
                    متعادلة (0) | في النواة
                  </div>
                </div>

                {/* Electron Container */}
                <div className="bg-blue-900/40 p-4 rounded-xl border-2 border-blue-500/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-300 font-bold text-lg">الإلكترونات</span>
                    <Badge className="bg-blue-600 text-white">{particleCounts.electron}</Badge>
                  </div>
                  <Button
                    onClick={() => addParticleToContainer('electron')}
                    disabled={particleCounts.electron <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة إلكترون (-)
                  </Button>
                  <div className="text-xs text-gray-300 mt-2">
                    شحنة سالبة (-1) | في المدارات
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <CardTitle className="text-purple-300">بناء العناصر (118 عنصر)</CardTitle>
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
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
                  }}
                >
                  {/* Particle Containers at Top */}
                  <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-4">
                    {/* Proton Container */}
                    <div className="bg-red-900/30 border-2 border-red-500/60 rounded-xl p-3 h-32 backdrop-blur-sm">
                      <div className="text-red-300 text-sm font-bold mb-2 text-center">أوعية البروتونات</div>
                      <div className="h-full flex items-center justify-center">
                        <div className="text-red-400 text-xs">اسحب البروتونات من هنا</div>
                      </div>
                    </div>
                    
                    {/* Neutron Container */}
                    <div className="bg-gray-900/30 border-2 border-gray-500/60 rounded-xl p-3 h-32 backdrop-blur-sm">
                      <div className="text-gray-300 text-sm font-bold mb-2 text-center">أوعية النيوترونات</div>
                      <div className="h-full flex items-center justify-center">
                        <div className="text-gray-400 text-xs">اسحب النيوترونات من هنا</div>
                      </div>
                    </div>
                    
                    {/* Electron Container */}
                    <div className="bg-blue-900/30 border-2 border-blue-500/60 rounded-xl p-3 h-32 backdrop-blur-sm">
                      <div className="text-blue-300 text-sm font-bold mb-2 text-center">أوعية الإلكترونات</div>
                      <div className="h-full flex items-center justify-center">
                        <div className="text-blue-400 text-xs">اسحب الإلكترونات من هنا</div>
                      </div>
                    </div>
                  </div>

                  {/* Central Nucleus with glow effect */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div 
                      className="rounded-full border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center backdrop-blur-sm shadow-lg"
                      style={{
                        width: `${NUCLEUS_RADIUS * 2}px`,
                        height: `${NUCLEUS_RADIUS * 2}px`,
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.2)'
                      }}
                    >
                      <span className="text-yellow-300 text-sm font-bold">النواة</span>
                    </div>
                  </div>

                  {/* Electron Orbitals with enhanced styling */}
                  {ORBITAL_RADII.map((radius, index) => (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-blue-400/40 rounded-full"
                      style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        boxShadow: `0 0 ${5 + index * 2}px rgba(59, 130, 246, 0.3)`,
                        background: `radial-gradient(circle, transparent 98%, rgba(59, 130, 246, 0.1) 100%)`
                      }}
                    >
                      {/* Orbital level indicator */}
                      <div 
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full font-bold"
                        style={{ fontSize: '10px' }}
                      >
                        {index + 1}
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
                      onDrag={(_, info) => {
                        updateParticlePosition(
                          particle.id,
                          particle.x + info.delta.x,
                          particle.y + info.delta.y
                        );
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileDrag={{ scale: 1.3 }}
                      animate={{
                        scale: particle.inNucleus || particle.orbitalLevel !== undefined ? [1, 1.1, 1] : 1,
                        boxShadow: particle.inNucleus || particle.orbitalLevel !== undefined 
                          ? `0 0 15px ${getParticleColor(particle.type)}` 
                          : `0 0 5px ${getParticleColor(particle.type)}`
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/70 flex items-center justify-center text-sm font-bold text-white shadow-xl cursor-pointer group"
                        style={{ 
                          backgroundColor: getParticleColor(particle.type),
                          boxShadow: `0 0 10px ${getParticleColor(particle.type)}, inset 0 0 5px rgba(255,255,255,0.3)`
                        }}
                        onClick={() => removeParticle(particle.id)}
                        title={`${getParticleName(particle.type)} - انقر للحذف`}
                      >
                        {particle.type === 'proton' ? 'P+' : 
                         particle.type === 'neutron' ? 'N' : 'e-'}
                        
                        {/* Enhanced Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20">
                          <div className="font-bold">{getParticleName(particle.type)}</div>
                          <div className="text-gray-300">انقر للحذف</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Instructions */}
                  {particles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400 mt-20">
                        <div className="text-4xl mb-6">⚛️</div>
                        <p className="text-xl mb-4 font-bold">ابدأ ببناء ذرتك!</p>
                        <p className="text-sm mb-2">أضف الجسيمات من الأوعية أعلاه</p>
                        <p className="text-sm mb-2">أو ابحث عن عنصر للبناء السريع</p>
                        <p className="text-xs text-gray-500 mt-4">سيتم جذب الجسيمات تلقائياً لمواضعها الصحيحة</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Educational Information */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-4">فيزياء بناء الذرة المتطورة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-red-300 mb-2">البروتونات</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• تحمل شحنة موجبة (+1)</li>
                      <li>• توجد في النواة</li>
                      <li>• تحدد نوع العنصر</li>
                      <li>• جذب تلقائي للنواة</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-300 mb-2">النيوترونات</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• متعادلة الشحنة (0)</li>
                      <li>• توجد في النواة</li>
                      <li>• تؤثر على استقرار الذرة</li>
                      <li>• جذب تلقائي للنواة</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-300 mb-2">الإلكترونات</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• تحمل شحنة سالبة (-1)</li>
                      <li>• تدور في مدارات محددة</li>
                      <li>• جذب تلقائي للمدارات</li>
                      <li>• ترتيب ذكي حسب مستويات الطاقة</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildAtomSimulation;
