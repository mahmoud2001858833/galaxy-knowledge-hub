
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Info, Zap, Download, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Particle {
  id: string;
  type: 'proton' | 'neutron' | 'electron';
  x: number;
  y: number;
  isDragging?: boolean;
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

  // بيانات العناصر
  const elements = [
    { protons: 1, symbol: 'H', name: 'هيدروجين', commonNeutrons: 0 },
    { protons: 2, symbol: 'He', name: 'هيليوم', commonNeutrons: 2 },
    { protons: 3, symbol: 'Li', name: 'ليثيوم', commonNeutrons: 4 },
    { protons: 4, symbol: 'Be', name: 'بيريليوم', commonNeutrons: 5 },
    { protons: 5, symbol: 'B', name: 'بورون', commonNeutrons: 6 },
    { protons: 6, symbol: 'C', name: 'كربون', commonNeutrons: 6 },
    { protons: 7, symbol: 'N', name: 'نيتروجين', commonNeutrons: 7 },
    { protons: 8, symbol: 'O', name: 'أكسجين', commonNeutrons: 8 },
    { protons: 9, symbol: 'F', name: 'فلور', commonNeutrons: 10 },
    { protons: 10, symbol: 'Ne', name: 'نيون', commonNeutrons: 10 }
  ];

  // حساب بيانات الذرة
  const calculateAtomData = useCallback((particles: Particle[]) => {
    const protons = particles.filter(p => p.type === 'proton').length;
    const neutrons = particles.filter(p => p.type === 'neutron').length;
    const electrons = particles.filter(p => p.type === 'electron').length;

    const element = elements.find(e => e.protons === protons);
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

  // إضافة جسيم جديد
  const addParticle = (type: 'proton' | 'neutron' | 'electron') => {
    const newParticle: Particle = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: Math.random() * 100 + 50,
      y: Math.random() * 100 + 50,
    };

    const newParticles = [...particles, newParticle];
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // إزالة جسيم
  const removeParticle = (id: string) => {
    const newParticles = particles.filter(p => p.id !== id);
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // تحديث موقع الجسيم
  const updateParticlePosition = (id: string, x: number, y: number) => {
    const newParticles = particles.map(p => 
      p.id === id ? { ...p, x, y } : p
    );
    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // إعادة تعيين الذرة
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

  // بناء ذرة عنصر معين
  const buildElement = (elementData: typeof elements[0]) => {
    const newParticles: Particle[] = [];
    
    // إضافة البروتونات
    for (let i = 0; i < elementData.protons; i++) {
      newParticles.push({
        id: `proton-${i}-${Date.now()}`,
        type: 'proton',
        x: 400 + (Math.random() - 0.5) * 40,
        y: 300 + (Math.random() - 0.5) * 40,
      });
    }
    
    // إضافة النيوترونات
    for (let i = 0; i < elementData.commonNeutrons; i++) {
      newParticles.push({
        id: `neutron-${i}-${Date.now()}`,
        type: 'neutron',
        x: 400 + (Math.random() - 0.5) * 40,
        y: 300 + (Math.random() - 0.5) * 40,
      });
    }
    
    // إضافة الإلكترونات
    for (let i = 0; i < elementData.protons; i++) {
      const angle = (i / elementData.protons) * 2 * Math.PI;
      const radius = 150 + (i % 2) * 30;
      newParticles.push({
        id: `electron-${i}-${Date.now()}`,
        type: 'electron',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
      });
    }

    setParticles(newParticles);
    setAtomData(calculateAtomData(newParticles));
  };

  // الحصول على لون الجسيم
  const getParticleColor = (type: string) => {
    switch (type) {
      case 'proton': return '#ef4444'; // أحمر
      case 'neutron': return '#64748b'; // رمادي
      case 'electron': return '#3b82f6'; // أزرق
      default: return '#6b7280';
    }
  };

  // الحصول على اسم الجسيم
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
              تجربة بناء الذرة التفاعلية
            </h1>
            
            <div className="flex items-center gap-2">
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
            {/* Particle Tools */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  أدوات الجسيمات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => addParticle('proton')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  + إضافة بروتون
                </Button>
                <Button
                  onClick={() => addParticle('neutron')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  + إضافة نيوترون
                </Button>
                <Button
                  onClick={() => addParticle('electron')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  + إضافة إلكترون
                </Button>
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

            {/* Quick Build Elements */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-purple-300">بناء سريع للعناصر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {elements.slice(0, 8).map((element) => (
                    <Button
                      key={element.protons}
                      onClick={() => buildElement(element)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {element.symbol}
                      <br />
                      {element.name}
                    </Button>
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
                  {/* النواة المركزية */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 rounded-full border-2 border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center">
                      <span className="text-yellow-300 text-sm font-medium">النواة</span>
                    </div>
                  </div>

                  {/* مدارات الإلكترونات */}
                  {[1, 2, 3].map((orbit) => (
                    <div
                      key={orbit}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-blue-400/30 rounded-full"
                      style={{
                        width: `${orbit * 100 + 100}px`,
                        height: `${orbit * 100 + 100}px`,
                      }}
                    />
                  ))}

                  {/* الجسيمات */}
                  {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="absolute cursor-move"
                      style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
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
                      whileDrag={{ scale: 1.3, zIndex: 1000 }}
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
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {getParticleName(particle.type)}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* تعليمات */}
                  {particles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-2xl mb-4">⚛️</div>
                        <p className="text-lg mb-2">ابدأ ببناء ذرتك!</p>
                        <p className="text-sm">استخدم الأدوات على اليسار لإضافة الجسيمات</p>
                        <p className="text-sm">أو اختر عنصراً للبناء السريع</p>
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
