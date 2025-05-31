
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Info, Zap, Search, Plus } from 'lucide-react';
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

  // Filter elements based on search
  const filteredElements = allElements.filter(element => 
    element.name.includes(searchTerm) || 
    element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Organize particles in proper positions
  const organizeParticles = () => {
    const newParticles = particles.map(particle => {
      if (particle.inContainer) return particle;

      if (particle.type === 'proton' || particle.type === 'neutron') {
        // Place in nucleus
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 30;
        return {
          ...particle,
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius
        };
      } else {
        // Place electrons in orbital shells
        const electronCount = particles.filter(p => p.type === 'electron' && !p.inContainer).length;
        const shellRadii = [80, 120, 160, 200];
        const electronsPerShell = [2, 8, 18, 32];
        
        let currentElectron = 0;
        for (let shell = 0; shell < shellRadii.length; shell++) {
          const maxInShell = electronsPerShell[shell];
          if (currentElectron < electronCount) {
            const electronInShell = Math.min(electronCount - currentElectron, maxInShell);
            const angleStep = (2 * Math.PI) / electronInShell;
            const angle = (currentElectron % electronInShell) * angleStep;
            
            if (particle.id === particles.filter(p => p.type === 'electron' && !p.inContainer)[currentElectron]?.id) {
              return {
                ...particle,
                x: 400 + Math.cos(angle) * shellRadii[shell],
                y: 300 + Math.sin(angle) * shellRadii[shell]
              };
            }
            currentElectron++;
          }
        }
      }
      return particle;
    });

    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Remove particle
  const removeParticle = (id: string) => {
    const newParticles = particles.filter(p => p.id !== id);
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Update particle position
  const updateParticlePosition = (id: string, x: number, y: number) => {
    const particle = particles.find(p => p.id === id);
    if (!particle) return;

    // Check if particle is being moved out of container
    const isInAtomArea = x > 50 && x < 750 && y > 160 && y < 600;
    const wasInContainer = particle.inContainer;
    const nowInContainer = !isInAtomArea;

    const newParticles = particles.map(p => 
      p.id === id ? { ...p, x, y, inContainer: nowInContainer } : p
    );
    
    setParticles(newParticles);
    
    // Only recalculate if container status changed
    if (wasInContainer !== nowInContainer) {
      setAtomData(calculateAtomData(newParticles));
    }
  };

  // Reset atom
  const resetAtom = () => {
    setParticles([]);
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

  // Build specific element
  const buildElement = (elementData: CompleteElement) => {
    const newParticles: Particle[] = [];
    
    // Add protons to nucleus
    for (let i = 0; i < elementData.atomic_number; i++) {
      const angle = (i / elementData.atomic_number) * 2 * Math.PI;
      const radius = Math.random() * 25 + 10;
      newParticles.push({
        id: `proton-${i}-${Date.now()}`,
        type: 'proton',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        inContainer: false
      });
    }
    
    // Add neutrons to nucleus
    for (let i = 0; i < elementData.commonNeutrons; i++) {
      const angle = ((i + elementData.atomic_number) / (elementData.atomic_number + elementData.commonNeutrons)) * 2 * Math.PI;
      const radius = Math.random() * 25 + 10;
      newParticles.push({
        id: `neutron-${i}-${Date.now()}`,
        type: 'neutron',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        inContainer: false
      });
    }
    
    // Add electrons in proper shells
    const shellRadii = [80, 120, 160, 200];
    const electronsPerShell = [2, 8, 18, 32];
    let remainingElectrons = elementData.atomic_number;
    
    for (let shell = 0; shell < shellRadii.length && remainingElectrons > 0; shell++) {
      const electronsInThisShell = Math.min(remainingElectrons, electronsPerShell[shell]);
      const angleStep = (2 * Math.PI) / electronsInThisShell;
      
      for (let e = 0; e < electronsInThisShell; e++) {
        const angle = e * angleStep;
        newParticles.push({
          id: `electron-${shell}-${e}-${Date.now()}`,
          type: 'electron',
          x: 400 + Math.cos(angle) * shellRadii[shell],
          y: 300 + Math.sin(angle) * shellRadii[shell],
          inContainer: false
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
              <Button variant="outline" size="sm" onClick={organizeParticles}>
                تنظيم الجسيمات
              </Button>
              <Button variant="outline" size="sm" onClick={resetAtom}>
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
                <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-300 font-medium">البروتونات</span>
                    <Button
                      onClick={() => addParticleToContainer('proton')}
                      size="sm"
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-300">
                    شحنة موجبة (+1) | في النواة
                  </div>
                </div>

                {/* Neutron Container */}
                <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 font-medium">النيوترونات</span>
                    <Button
                      onClick={() => addParticleToContainer('neutron')}
                      size="sm"
                      variant="outline"
                      className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-300">
                    متعادلة (0) | في النواة
                  </div>
                </div>

                {/* Electron Container */}
                <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-300 font-medium">الإلكترونات</span>
                    <Button
                      onClick={() => addParticleToContainer('electron')}
                      size="sm"
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-300">
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
                  style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)' }}
                >
                  {/* Particle Containers at Top */}
                  <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-4">
                    {/* Proton Container */}
                    <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-2 h-32">
                      <div className="text-red-300 text-xs font-medium mb-1 text-center">البروتونات</div>
                    </div>
                    
                    {/* Neutron Container */}
                    <div className="bg-gray-900/20 border-2 border-gray-500/50 rounded-lg p-2 h-32">
                      <div className="text-gray-300 text-xs font-medium mb-1 text-center">النيوترونات</div>
                    </div>
                    
                    {/* Electron Container */}
                    <div className="bg-blue-900/20 border-2 border-blue-500/50 rounded-lg p-2 h-32">
                      <div className="text-blue-300 text-xs font-medium mb-1 text-center">الإلكترونات</div>
                    </div>
                  </div>

                  {/* Central Nucleus */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 rounded-full border-2 border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center">
                      <span className="text-yellow-300 text-sm font-medium">النواة</span>
                    </div>
                  </div>

                  {/* Electron Orbitals */}
                  {[1, 2, 3, 4].map((orbit) => (
                    <div
                      key={orbit}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-blue-400/30 rounded-full"
                      style={{
                        width: `${orbit * 80 + 100}px`,
                        height: `${orbit * 80 + 100}px`,
                      }}
                    />
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
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-pointer group"
                        style={{ backgroundColor: getParticleColor(particle.type) }}
                        onClick={() => removeParticle(particle.id)}
                        title={`${getParticleName(particle.type)} - انقر للحذف`}
                      >
                        {particle.type === 'proton' ? 'P' : 
                         particle.type === 'neutron' ? 'N' : 'e'}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {getParticleName(particle.type)}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Instructions */}
                  {particles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400 mt-20">
                        <div className="text-2xl mb-4">⚛️</div>
                        <p className="text-lg mb-2">ابدأ ببناء ذرتك!</p>
                        <p className="text-sm">أضف الجسيمات من الأوعية أعلاه</p>
                        <p className="text-sm">أو ابحث عن عنصر للبناء السريع</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Educational Information */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-4">حقائق عن بناء الذرة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-red-300 mb-2">البروتونات</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• تحمل شحنة موجبة (+1)</li>
                      <li>• توجد في النواة</li>
                      <li>• تحدد نوع العنصر</li>
                      <li>• كتلتها = 1 وحدة كتلة ذرية</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-300 mb-2">النيوترونات</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• متعادلة الشحنة (0)</li>
                      <li>• توجد في النواة</li>
                      <li>• تؤثر على استقرار الذرة</li>
                      <li>• كتلتها = 1 وحدة كتلة ذرية</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-300 mb-2">الإلكترونات</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• تحمل شحنة سالبة (-1)</li>
                      <li>• تدور حول النواة</li>
                      <li>• تحدد الخصائص الكيميائية</li>
                      <li>• كتلتها ≈ 0 وحدة كتلة ذرية</li>
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
