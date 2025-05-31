
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, RotateCcw, Info, MessageCircle, Move, X } from 'lucide-react';
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

interface ElementInfo {
  name: string;
  symbol: string;
  atomicNumber: number;
  period: number;
  group: number;
  category: string;
  electronicConfiguration: string;
  uses: string[];
  properties: string[];
}

const ORBITAL_RADII = [80, 120, 160, 200];
const ORBITAL_CAPACITY = [2, 8, 18, 32];
const ATOM_CENTER = { x: 300, y: 300 };
const NUCLEUS_RADIUS = 50;
const PARTICLE_SIZE = 8;

const BuildAtomSimulation = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPosition, setAssistantPosition] = useState({ x: 20, y: 100 });
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [showElementInfo, setShowElementInfo] = useState(false);
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

  const animationFrameRef = useRef<number>();

  // Calculate atom data
  const calculateAtomData = useCallback((particles: Particle[]) => {
    const protons = particles.filter(p => p.type === 'proton').length;
    const neutrons = particles.filter(p => p.type === 'neutron').length;
    const electrons = particles.filter(p => p.type === 'electron').length;

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
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
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

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateElectrons);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateElectrons]);

  // Add particle function
  const addParticle = (type: 'proton' | 'neutron' | 'electron') => {
    const newParticle: Particle = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: 0,
      y: 0
    };

    if (type === 'proton' || type === 'neutron') {
      // Position in nucleus
      const existingNucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron').length;
      const angle = (existingNucleons / (existingNucleons + 1)) * 2 * Math.PI;
      const radius = Math.random() * (NUCLEUS_RADIUS - 10) + 5;
      newParticle.x = ATOM_CENTER.x + Math.cos(angle) * radius;
      newParticle.y = ATOM_CENTER.y + Math.sin(angle) * radius;
    } else if (type === 'electron') {
      // Position in next available orbital
      const electrons = particles.filter(p => p.type === 'electron');
      let targetLevel = 0;
      let electronsInLevel = 0;

      for (let level = 0; level < ORBITAL_RADII.length; level++) {
        electronsInLevel = electrons.filter(e => e.orbitalLevel === level).length;
        if (electronsInLevel < ORBITAL_CAPACITY[level]) {
          targetLevel = level;
          break;
        }
      }

      const angleStep = (2 * Math.PI) / Math.min(ORBITAL_CAPACITY[targetLevel], electronsInLevel + 1);
      const angle = electronsInLevel * angleStep;
      
      newParticle.x = ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[targetLevel];
      newParticle.y = ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[targetLevel];
      newParticle.orbitalLevel = targetLevel;
      newParticle.angle = angle;
    }

    const newParticles = [...particles, newParticle];
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Remove particle function
  const removeParticle = (type: 'proton' | 'neutron' | 'electron') => {
    const particleIndex = particles.findIndex(p => p.type === type);
    if (particleIndex === -1) return;

    const newParticles = particles.filter((_, index) => index !== particleIndex);
    
    // Reorganize electrons after removal
    if (type === 'electron') {
      const electronsOnly = newParticles.filter(p => p.type === 'electron');
      let electronIndex = 0;
      
      for (let level = 0; level < ORBITAL_RADII.length; level++) {
        const electronsInThisLevel = Math.min(
          electronsOnly.length - electronIndex,
          ORBITAL_CAPACITY[level]
        );
        
        for (let e = 0; e < electronsInThisLevel; e++) {
          const angleStep = (2 * Math.PI) / electronsInThisLevel;
          const angle = e * angleStep;
          
          if (electronsOnly[electronIndex]) {
            electronsOnly[electronIndex].x = ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[level];
            electronsOnly[electronIndex].y = ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[level];
            electronsOnly[electronIndex].orbitalLevel = level;
            electronsOnly[electronIndex].angle = angle;
            electronIndex++;
          }
        }
      }
    }
    
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Clear all particles
  const clearAll = () => {
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

  // Get particle color
  const getParticleColor = (type: string) => {
    switch (type) {
      case 'proton': return '#ef4444';
      case 'neutron': return '#64748b';
      case 'electron': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Get element information
  const getElementInfo = (): ElementInfo | null => {
    const element = allElements.find(e => e.atomic_number === atomData.protons);
    if (!element) return null;

    return {
      name: element.name,
      symbol: element.symbol,
      atomicNumber: element.atomic_number,
      period: Math.ceil(element.atomic_number / 18) || 1,
      group: element.atomic_number <= 2 ? element.atomic_number : 
             element.atomic_number <= 10 ? element.atomic_number - 2 :
             element.atomic_number <= 18 ? element.atomic_number - 10 : 1,
      category: element.category || 'غير محدد',
      electronicConfiguration: element.electron_configuration || 'غير محدد',
      uses: ['استخدامات متنوعة في الصناعة', 'تطبيقات في الطب', 'استخدامات في التكنولوجيا'],
      properties: ['خصائص فيزيائية فريدة', 'خصائص كيميائية مميزة', 'تفاعلات خاصة']
    };
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

  const elementInfo = getElementInfo();

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
              <Button variant="outline" size="sm" onClick={clearAll} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="w-4 h-4 mr-1" />
                مسح الكل
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Particle Controls */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  إضافة الجسيمات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Protons */}
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-red-300 font-bold">البروتونات (P+)</span>
                    <Badge className="bg-red-600 text-white">{atomData.protons}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => addParticle('proton')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      إضافة
                    </Button>
                    <Button 
                      onClick={() => removeParticle('proton')}
                      disabled={atomData.protons === 0}
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      حذف
                    </Button>
                  </div>
                </div>

                {/* Neutrons */}
                <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-500/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-bold">النيوترونات (n°)</span>
                    <Badge className="bg-gray-600 text-white">{atomData.neutrons}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => addParticle('neutron')}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      إضافة
                    </Button>
                    <Button 
                      onClick={() => removeParticle('neutron')}
                      disabled={atomData.neutrons === 0}
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      حذف
                    </Button>
                  </div>
                </div>

                {/* Electrons */}
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-300 font-bold">الإلكترونات (e-)</span>
                    <Badge className="bg-blue-600 text-white">{atomData.electrons}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => addParticle('electron')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      إضافة
                    </Button>
                    <Button 
                      onClick={() => removeParticle('electron')}
                      disabled={atomData.electrons === 0}
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Atom Information */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  معلومات الذرة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center mb-4">
                  <motion.div 
                    className="text-6xl font-bold text-white mb-2 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setShowElementInfo(!showElementInfo)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {atomData.symbol}
                  </motion.div>
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
                    <span className="text-gray-300">العدد الذري:</span>
                    <Badge variant="outline">{atomData.protons}</Badge>
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
          </div>

          {/* Main Atom Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[600px]">
              <CardContent className="p-4 h-full">
                <div className="relative w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg border-2 border-dashed border-gray-500/30 overflow-hidden">
                  
                  {/* Central Nucleus */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400/80 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-2xl"
                    style={{
                      width: `${NUCLEUS_RADIUS * 2}px`,
                      height: `${NUCLEUS_RADIUS * 2}px`,
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <span className="text-yellow-300 text-sm font-bold">النواة</span>
                  </div>

                  {/* Electron Orbitals */}
                  {ORBITAL_RADII.map((radius, index) => (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-blue-400/40 rounded-full animate-pulse"
                      style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        boxShadow: `0 0 ${8 + index * 3}px rgba(59, 130, 246, 0.3)`,
                        background: `radial-gradient(circle, transparent 98%, rgba(59, 130, 246, 0.1) 100%)`
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
                      className="absolute"
                      style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <div
                        className="rounded-full border-2 border-white/80 flex items-center justify-center text-xs font-bold text-white shadow-xl"
                        style={{ 
                          width: `${PARTICLE_SIZE * 2}px`,
                          height: `${PARTICLE_SIZE * 2}px`,
                          backgroundColor: getParticleColor(particle.type),
                          boxShadow: `0 0 10px ${getParticleColor(particle.type)}, inset 0 0 5px rgba(255,255,255,0.4)`
                        }}
                      >
                        {particle.type === 'proton' ? 'P+' : 
                         particle.type === 'neutron' ? 'n°' : 'e-'}
                      </div>
                    </motion.div>
                  ))}

                  {/* Instructions */}
                  {particles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-6">⚛️</div>
                        <p className="text-2xl mb-4 font-bold">ابدأ ببناء ذرتك!</p>
                        <p className="text-sm mb-2">استخدم أزرار الإضافة في اللوحة الجانبية</p>
                        <p className="text-sm mb-2">ستتم إضافة الجسيمات تلقائياً في أماكنها الصحيحة</p>
                        <p className="text-xs text-gray-500 mt-4">انقر على رمز العنصر لعرض معلومات مفصلة</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Element Information Modal */}
      {showElementInfo && elementInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowElementInfo(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm p-6 rounded-lg border border-purple-500/50 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300">معلومات العنصر</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowElementInfo(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{elementInfo.symbol}</div>
                <div className="text-lg text-purple-300">{elementInfo.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">العدد الذري:</span>
                  <span className="text-white ml-2">{elementInfo.atomicNumber}</span>
                </div>
                <div>
                  <span className="text-gray-300">الدورة:</span>
                  <span className="text-white ml-2">{elementInfo.period}</span>
                </div>
                <div>
                  <span className="text-gray-300">المجموعة:</span>
                  <span className="text-white ml-2">{elementInfo.group}</span>
                </div>
                <div>
                  <span className="text-gray-300">الفئة:</span>
                  <span className="text-white ml-2">{elementInfo.category}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-blue-300 mb-2">التوزيع الإلكتروني:</h4>
                <p className="text-xs text-gray-300 bg-blue-900/20 p-2 rounded">
                  {elementInfo.electronicConfiguration}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-green-300 mb-2">الاستخدامات:</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  {elementInfo.uses.map((use, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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
