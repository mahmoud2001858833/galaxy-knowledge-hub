
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Zap, Waves, Atom, Magnet, Eye, Cpu, Thermometer, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import KinematicsCalculations from './calculations/KinematicsCalculations';
import ForceCalculations from './calculations/ForceCalculations';
import EnergyCalculations from './calculations/EnergyCalculations';
import ElectricityCalculations from './calculations/ElectricityCalculations';
import WaveCalculations from './calculations/WaveCalculations';
import ThermodynamicsCalculations from './calculations/ThermodynamicsCalculations';
import OpticsCalculations from './calculations/OpticsCalculations';
import ModernPhysicsCalculations from './calculations/ModernPhysicsCalculations';
import PhysicsCalculatorAI from './PhysicsCalculatorAI';

const PhysicsCalculations = () => {
  const [activeTab, setActiveTab] = useState('kinematics');

  const calculationCategories = [
    {
      id: 'kinematics',
      name: 'الحركة والسرعة',
      icon: Activity,
      description: 'حسابات السرعة والتسارع والحركة',
      component: KinematicsCalculations
    },
    {
      id: 'forces',
      name: 'القوى والديناميكا',
      icon: Zap,
      description: 'قوانين نيوتن والقوى والزخم',
      component: ForceCalculations
    },
    {
      id: 'energy',
      name: 'الطاقة والشغل',
      icon: Cpu,
      description: 'الطاقة الحركية والجهدية والشغل',
      component: EnergyCalculations
    },
    {
      id: 'electricity',
      name: 'الكهرباء والمغناطيسية',
      icon: Magnet,
      description: 'الدوائر الكهربائية والمجالات المغناطيسية',
      component: ElectricityCalculations
    },
    {
      id: 'waves',
      name: 'الموجات والصوت',
      icon: Waves,
      description: 'الموجات والاهتزازات والصوت',
      component: WaveCalculations
    },
    {
      id: 'thermodynamics',
      name: 'الحرارة والغازات',
      icon: Thermometer,
      description: 'الديناميكا الحرارية وقوانين الغازات',
      component: ThermodynamicsCalculations
    },
    {
      id: 'optics',
      name: 'البصريات',
      icon: Eye,
      description: 'العدسات والمرايا والضوء',
      component: OpticsCalculations
    },
    {
      id: 'modern',
      name: 'الفيزياء الحديثة',
      icon: Atom,
      description: 'الفيزياء النووية والكمية',
      component: ModernPhysicsCalculations
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4 text-glow-purple flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-subject-physics-primary" />
          الحسابات الفيزيائية
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          احسب جميع المعادلات الفيزيائية مع شرح مفصل لكل خطوة ومساعد ذكي للإجابة على أسئلتك
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-white/5 p-2 rounded-xl mb-6">
          {calculationCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex flex-col items-center p-3 rounded-lg border border-transparent data-[state=active]:border-subject-physics-primary data-[state=active]:bg-subject-physics-primary/20 transition-all duration-300"
            >
              <category.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {calculationCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <Card className="bg-white/5 border-subject-physics-primary/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-subject-physics-primary">
                      <category.icon className="w-6 h-6" />
                      {category.name}
                    </CardTitle>
                    <p className="text-white/70 text-sm">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <category.component />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-subject-physics-primary/30 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-subject-physics-primary">
                  <Atom className="w-5 h-5" />
                  المساعد الذكي للحسابات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhysicsCalculatorAI />
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default PhysicsCalculations;
