import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, RotateCcw, Info, MessageCircle, Move, X, Zap } from 'lucide-react';
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
  electronConfiguration: string;
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

interface SuggestedElement {
  name: string;
  symbol: string;
  protons: number;
  neutrons: number;
  electrons: number;
  electronConfig: string;
  icon: string;
}

// Enhanced orbital configurations
const ORBITAL_RADII = [100, 160, 220, 280, 340, 400, 460];
const ORBITAL_CAPACITY = [2, 8, 18, 32, 32, 18, 8];
const ELECTRON_SHELL_ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s'];
const ATOM_CENTER = { x: 300, y: 300 };
const NUCLEUS_RADIUS = 80;
const PARTICLE_SIZE = 6;

// Suggested common elements
const SUGGESTED_ELEMENTS: SuggestedElement[] = [
  { name: 'هيدروجين', symbol: 'H', protons: 1, neutrons: 0, electrons: 1, electronConfig: '1s¹', icon: '🟢' },
  { name: 'هيليوم', symbol: 'He', protons: 2, neutrons: 2, electrons: 2, electronConfig: '1s²', icon: '🔵' },
  { name: 'ليثيوم', symbol: 'Li', protons: 3, neutrons: 4, electrons: 3, electronConfig: '[He] 2s¹', icon: '🟡' },
  { name: 'كربون', symbol: 'C', protons: 6, neutrons: 6, electrons: 6, electronConfig: '[He] 2s² 2p²', icon: '⚫' },
  { name: 'نيتروجين', symbol: 'N', protons: 7, neutrons: 7, electrons: 7, electronConfig: '[He] 2s² 2p³', icon: '🔷' },
  { name: 'أكسجين', symbol: 'O', protons: 8, neutrons: 8, electrons: 8, electronConfig: '[He] 2s² 2p⁴', icon: '🔴' },
  { name: 'فلور', symbol: 'F', protons: 9, neutrons: 10, electrons: 9, electronConfig: '[He] 2s² 2p⁵', icon: '🟣' },
  { name: 'نيون', symbol: 'Ne', protons: 10, neutrons: 10, electrons: 10, electronConfig: '[He] 2s² 2p⁶', icon: '🟠' },
  { name: 'صوديوم', symbol: 'Na', protons: 11, neutrons: 12, electrons: 11, electronConfig: '[Ne] 3s¹', icon: '🟨' },
  { name: 'ماغنيسيوم', symbol: 'Mg', protons: 12, neutrons: 12, electrons: 12, electronConfig: '[Ne] 3s²', icon: '🟫' }
];

const BuildAtomSimulation = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPosition, setAssistantPosition] = useState({ x: 20, y: 100 });
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [showElementInfo, setShowElementInfo] = useState(false);
  const [selectedSuggestedElement, setSelectedSuggestedElement] = useState<SuggestedElement | null>(null);
  const [atomData, setAtomData] = useState<AtomData>({
    protons: 0,
    neutrons: 0,
    electrons: 0,
    element: 'غير معروف',
    symbol: '?',
    massNumber: 0,
    charge: 0,
    isStable: false,
    electronConfiguration: ''
  });

  const animationFrameRef = useRef<number>();

  // Generate electron configuration string
  const generateElectronConfiguration = useCallback((electronCount: number) => {
    if (electronCount === 0) return '';
    
    const config: string[] = [];
    let remainingElectrons = electronCount;
    
    const shellCapacities: { [key: string]: number } = {
      '1s': 2, '2s': 2, '2p': 6, '3s': 2, '3p': 6, '4s': 2, '3d': 10,
      '4p': 6, '5s': 2, '4d': 10, '5p': 6, '6s': 2, '4f': 14, '5d': 10, '6p': 6, '7s': 2
    };
    
    for (const shell of ELECTRON_SHELL_ORDER) {
      if (remainingElectrons <= 0) break;
      
      const capacity = shellCapacities[shell] || 0;
      const electronsInShell = Math.min(remainingElectrons, capacity);
      
      if (electronsInShell > 0) {
        config.push(`${shell}${electronsInShell > 1 ? `^${electronsInShell}` : '¹'}`);
        remainingElectrons -= electronsInShell;
      }
    }
    
    return config.join(' ');
  }, []);

  // Calculate atom data with proper electron configuration
  const calculateAtomData = useCallback((particles: Particle[]) => {
    const protons = particles.filter(p => p.type === 'proton').length;
    const neutrons = particles.filter(p => p.type === 'neutron').length;
    const electrons = particles.filter(p => p.type === 'electron').length;

    const element = allElements.find(e => e.atomic_number === protons);
    const massNumber = protons + neutrons;
    const charge = protons - electrons;
    const isStable = element ? Math.abs(neutrons - element.commonNeutrons) <= 2 && Math.abs(charge) <= 1 : false;
    const electronConfiguration = generateElectronConfiguration(electrons);

    return {
      protons,
      neutrons,
      electrons,
      element: element ? element.name : 'غير معروف',
      symbol: element ? element.symbol : '?',
      massNumber,
      charge,
      isStable,
      electronConfiguration
    };
  }, [generateElectronConfiguration]);

  // Get correct orbital level for electron based on filling order
  const getElectronOrbitalLevel = (electronIndex: number) => {
    let electronCount = 0;
    
    // Shell mapping to orbital levels
    const shellToLevel: { [key: string]: number } = {
      '1s': 0, '2s': 1, '2p': 1, '3s': 2, '3p': 2, '4s': 3, '3d': 2,
      '4p': 3, '5s': 4, '4d': 3, '5p': 4, '6s': 5, '4f': 3, '5d': 4, '6p': 5, '7s': 6
    };
    
    const shellCapacities: { [key: string]: number } = {
      '1s': 2, '2s': 2, '2p': 6, '3s': 2, '3p': 6, '4s': 2, '3d': 10,
      '4p': 6, '5s': 2, '4d': 10, '5p': 6, '6s': 2, '4f': 14, '5d': 10, '6p': 6, '7s': 2
    };
    
    for (const shell of ELECTRON_SHELL_ORDER) {
      const capacity = shellCapacities[shell] || 0;
      
      if (electronIndex < electronCount + capacity) {
        return {
          level: shellToLevel[shell] || 0,
          positionInLevel: electronIndex - electronCount
        };
      }
      
      electronCount += capacity;
    }
    
    return { level: 0, positionInLevel: 0 };
  };

  // Animate electrons in orbit with proper speeds
  const animateElectrons = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
          // Slower speed for outer orbitals (more realistic)
          const speedFactor = 0.02 / Math.pow(particle.orbitalLevel + 1, 0.5);
          const newAngle = (particle.angle || 0) + speedFactor;
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

  // Add particle with proper placement
  const addParticle = (type: 'proton' | 'neutron' | 'electron') => {
    const newParticle: Particle = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: 0,
      y: 0
    };

    if (type === 'proton' || type === 'neutron') {
      // Place nucleons in organized pattern within nucleus
      const existingNucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron').length;
      const layer = Math.floor(existingNucleons / 6);
      const positionInLayer = existingNucleons % 6;
      const angleStep = (2 * Math.PI) / Math.max(6, 6 + layer * 2);
      const radius = Math.min(NUCLEUS_RADIUS - 20, 15 + layer * 20);
      const angle = positionInLayer * angleStep + (layer * 0.5);
      
      newParticle.x = ATOM_CENTER.x + Math.cos(angle) * radius;
      newParticle.y = ATOM_CENTER.y + Math.sin(angle) * radius;
    } else if (type === 'electron') {
      // Place electron according to electron configuration rules
      const electronCount = particles.filter(p => p.type === 'electron').length;
      const { level, positionInLevel } = getElectronOrbitalLevel(electronCount);
      
      // Count electrons already in this level
      const electronsInLevel = particles.filter(p => 
        p.type === 'electron' && p.orbitalLevel === level
      ).length;
      
      // Calculate position in orbital
      const totalElectronsInLevel = Math.min(ORBITAL_CAPACITY[level], electronsInLevel + 1);
      const angleStep = (2 * Math.PI) / totalElectronsInLevel;
      const angle = electronsInLevel * angleStep;
      
      newParticle.x = ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[level];
      newParticle.y = ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[level];
      newParticle.orbitalLevel = level;
      newParticle.angle = angle;
    }

    const newParticles = [...particles, newParticle];
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Remove particle with proper reorganization
  const removeParticle = (type: 'proton' | 'neutron' | 'electron') => {
    const particleIndex = particles.findIndex(p => p.type === type);
    if (particleIndex === -1) return;

    let newParticles = particles.filter((_, index) => index !== particleIndex);
    
    // Reorganize electrons if an electron was removed
    if (type === 'electron') {
      const electronsOnly = newParticles.filter(p => p.type === 'electron');
      const otherParticles = newParticles.filter(p => p.type !== 'electron');
      
      // Redistribute electrons according to configuration rules
      const redistributedElectrons = electronsOnly.map((electron, index) => {
        const { level } = getElectronOrbitalLevel(index);
        
        // Count electrons in this level up to current position
        let electronsInLevel = 0;
        for (let i = 0; i < index; i++) {
          const { level: prevLevel } = getElectronOrbitalLevel(i);
          if (prevLevel === level) electronsInLevel++;
        }
        
        const totalInLevel = electronsOnly.filter((_, i) => {
          const { level: l } = getElectronOrbitalLevel(i);
          return l === level;
        }).length;
        
        const angleStep = (2 * Math.PI) / totalInLevel;
        const angle = electronsInLevel * angleStep;
        
        return {
          ...electron,
          x: ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[level],
          y: ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[level],
          orbitalLevel: level,
          angle: angle
        };
      });
      
      newParticles = [...otherParticles, ...redistributedElectrons];
    }
    
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // Build suggested element
  const buildSuggestedElement = (element: SuggestedElement) => {
    setParticles([]);
    
    const newParticles: Particle[] = [];
    
    // Add protons
    for (let i = 0; i < element.protons; i++) {
      const layer = Math.floor(i / 6);
      const positionInLayer = i % 6;
      const angleStep = (2 * Math.PI) / Math.max(6, 6 + layer * 2);
      const radius = Math.min(NUCLEUS_RADIUS - 20, 15 + layer * 20);
      const angle = positionInLayer * angleStep + (layer * 0.5);
      
      newParticles.push({
        id: `proton-${i}`,
        type: 'proton',
        x: ATOM_CENTER.x + Math.cos(angle) * radius,
        y: ATOM_CENTER.y + Math.sin(angle) * radius
      });
    }
    
    // Add neutrons
    for (let i = 0; i < element.neutrons; i++) {
      const totalNucleons = element.protons + i;
      const layer = Math.floor(totalNucleons / 6);
      const positionInLayer = totalNucleons % 6;
      const angleStep = (2 * Math.PI) / Math.max(6, 6 + layer * 2);
      const radius = Math.min(NUCLEUS_RADIUS - 20, 15 + layer * 20);
      const angle = positionInLayer * angleStep + (layer * 0.5);
      
      newParticles.push({
        id: `neutron-${i}`,
        type: 'neutron',
        x: ATOM_CENTER.x + Math.cos(angle) * radius,
        y: ATOM_CENTER.y + Math.sin(angle) * radius
      });
    }
    
    // Add electrons
    for (let i = 0; i < element.electrons; i++) {
      const { level } = getElectronOrbitalLevel(i);
      
      // Count electrons in this level
      let electronsInLevel = 0;
      for (let j = 0; j < i; j++) {
        const { level: prevLevel } = getElectronOrbitalLevel(j);
        if (prevLevel === level) electronsInLevel++;
      }
      
      // Count total electrons that will be in this level
      let totalInLevel = 0;
      for (let j = 0; j < element.electrons; j++) {
        const { level: l } = getElectronOrbitalLevel(j);
        if (l === level) totalInLevel++;
      }
      
      const angleStep = (2 * Math.PI) / totalInLevel;
      const angle = electronsInLevel * angleStep;
      
      newParticles.push({
        id: `electron-${i}`,
        type: 'electron',
        x: ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[level],
        y: ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[level],
        orbitalLevel: level,
        angle: angle
      });
    }
    
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
    setSelectedSuggestedElement(element);
  };

  // Clear all particles
  const clearAll = () => {
    setParticles([]);
    setSelectedSuggestedElement(null);
    setAtomData({
      protons: 0,
      neutrons: 0,
      electrons: 0,
      element: 'غير معروف',
      symbol: '?',
      massNumber: 0,
      charge: 0,
      isStable: false,
      electronConfiguration: ''
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
      category: element.type || 'غير محدد',
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
                    - التوزيع الإلكتروني: ${atomData.electronConfiguration}
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Control Panel and Suggested Elements */}
          <div className="xl:col-span-1 space-y-4">
            {/* Suggested Elements */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  العناصر المقترحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SUGGESTED_ELEMENTS.map((element, index) => (
                  <motion.div
                    key={element.symbol}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => buildSuggestedElement(element)}
                      className={`w-full justify-start text-left p-3 h-auto ${
                        selectedSuggestedElement?.symbol === element.symbol
                          ? 'bg-blue-600 hover:bg-blue-700 border-blue-400'
                          : 'bg-white/5 hover:bg-white/10 border-white/20'
                      }`}
                      variant="outline"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{element.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{element.symbol}</span>
                            <span className="text-sm opacity-90">{element.name}</span>
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {element.protons}p, {element.neutrons}n, {element.electrons}e
                          </div>
                          <div className="text-xs opacity-60 mt-1 font-mono">
                            {element.electronConfig}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

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
                  {atomData.electronConfiguration && (
                    <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="text-xs text-blue-300 mb-1">التوزيع الإلكتروني:</div>
                      <div className="text-sm font-mono text-white">{atomData.electronConfiguration}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Atom Area */}
          <div className="xl:col-span-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[700px]">
              <CardContent className="p-4 h-full">
                <div className="relative w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg border-2 border-dashed border-gray-500/30 overflow-hidden">
                  
                  {/* Central Nucleus */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400/80 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-2xl"
                    style={{
                      width: `${NUCLEUS_RADIUS * 2}px`,
                      height: `${NUCLEUS_RADIUS * 2}px`,
                      boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.4)'
                    }}
                  >
                    <span className="text-yellow-300 text-sm font-bold">النواة</span>
                  </div>

                  {/* Electron Orbitals with enhanced visuals */}
                  {ORBITAL_RADII.map((radius, index) => (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-400/60 rounded-full"
                      style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        boxShadow: `0 0 ${20 + index * 8}px rgba(59, 130, 246, 0.5), inset 0 0 ${15 + index * 5}px rgba(59, 130, 246, 0.2)`,
                        background: `radial-gradient(circle, transparent 95%, rgba(59, 130, 246, 0.15) 100%)`,
                        animation: 'pulse 4s infinite'
                      }}
                    >
                      <div 
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg border border-blue-300/50"
                        style={{ fontSize: '10px' }}
                      >
                        مستوى {index + 1} (سعة: {ORBITAL_CAPACITY[index]})
                      </div>
                    </div>
                  ))}

                  {/* Particles with enhanced visuals */}
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
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <div
                        className="rounded-full border-2 border-white/90 flex items-center justify-center text-xs font-bold text-white shadow-2xl"
                        style={{ 
                          width: `${PARTICLE_SIZE * 3}px`,
                          height: `${PARTICLE_SIZE * 3}px`,
                          backgroundColor: getParticleColor(particle.type),
                          boxShadow: `0 0 20px ${getParticleColor(particle.type)}, inset 0 0 10px rgba(255,255,255,0.5)`,
                          filter: particle.type === 'electron' ? 'drop-shadow(0 0 8px #3b82f6)' : 'none'
                        }}
                      >
                        {particle.type === 'proton' ? 'P+' : 
                         particle.type === 'neutron' ? 'n°' : 'e-'}
                      </div>
                    </motion.div>
                  ))}

                  {/* Educational overlay when atom is empty */}
                  {particles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white/70 max-w-md">
                        <div className="text-6xl mb-4">⚛️</div>
                        <h3 className="text-xl font-bold mb-2">ابدأ ببناء ذرتك!</h3>
                        <p className="text-sm mb-4">
                          اختر عنصراً مقترحاً أو أضف الجسيمات يدوياً باستخدام الأزرار
                        </p>
                        <div className="text-xs opacity-60">
                          💡 ستتم إضافة الجسيمات تلقائياً في أماكنها الصحيحة حسب قواعد الفيزياء الذرية
                        </div>
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
      {showElementInfo && atomData.protons > 0 && (
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
            className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm p-6 rounded-lg border border-purple-500/50 max-w-lg w-full mx-4"
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
                <div className="text-4xl font-bold text-white mb-2">{atomData.symbol}</div>
                <div className="text-lg text-purple-300">{atomData.element}</div>
                <Badge 
                  variant={atomData.isStable ? "default" : "destructive"}
                  className="mt-2"
                >
                  {atomData.isStable ? 'عنصر مستقر' : 'عنصر غير مستقر'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">العدد الذري:</span>
                  <span className="text-white ml-2">{atomData.protons}</span>
                </div>
                <div>
                  <span className="text-gray-300">العدد الكتلي:</span>
                  <span className="text-white ml-2">{atomData.massNumber}</span>
                </div>
                <div>
                  <span className="text-gray-300">البروتونات:</span>
                  <span className="text-red-400 ml-2">{atomData.protons}</span>
                </div>
                <div>
                  <span className="text-gray-300">النيوترونات:</span>
                  <span className="text-gray-400 ml-2">{atomData.neutrons}</span>
                </div>
                <div>
                  <span className="text-gray-300">الإلكترونات:</span>
                  <span className="text-blue-400 ml-2">{atomData.electrons}</span>
                </div>
                <div>
                  <span className="text-gray-300">الشحنة:</span>
                  <span className={`ml-2 ${atomData.charge === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {atomData.charge > 0 ? `+${atomData.charge}` : atomData.charge}
                  </span>
                </div>
              </div>
              
              {atomData.electronConfiguration && (
                <div>
                  <h4 className="text-sm font-bold text-blue-300 mb-2">التوزيع الإلكتروني:</h4>
                  <p className="text-sm text-gray-300 bg-blue-900/20 p-3 rounded font-mono">
                    {atomData.electronConfiguration}
                  </p>
                </div>
              )}
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
