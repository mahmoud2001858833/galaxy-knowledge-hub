
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Heart, Activity, Droplet, Dna, TrendingUp, Brain, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';
import VitalSignsCalculations from './calculations/VitalSignsCalculations';
import BodyCompositionCalculations from './calculations/BodyCompositionCalculations';
import BloodAnalysisCalculations from './calculations/BloodAnalysisCalculations';
import GeneticsCalculations from './calculations/GeneticsCalculations';
import GrowthMetabolismCalculations from './calculations/GrowthMetabolismCalculations';
import BiochemistryCalculations from './calculations/BiochemistryCalculations';
import PopulationBiologyCalculations from './calculations/PopulationBiologyCalculations';
import NutritionEnergyCalculations from './calculations/NutritionEnergyCalculations';
import BiologyCalculatorAI from './BiologyCalculatorAI';

const BiologyCalculations = () => {
  const [activeTab, setActiveTab] = useState('vitals');

  const calculationCategories = [
    {
      id: 'vitals',
      name: 'العلامات الحيوية',
      icon: Heart,
      description: 'حساب معدل التنفس ونبض القلب والضغط',
      component: VitalSignsCalculations
    },
    {
      id: 'body',
      name: 'تركيب الجسم',
      icon: Activity,
      description: 'مؤشر كتلة الجسم ونسبة الماء والدهون',
      component: BodyCompositionCalculations
    },
    {
      id: 'blood',
      name: 'تحليل الدم',
      icon: Droplet,
      description: 'مكونات الدم والهيموغلوبين والأوكسجين',
      component: BloodAnalysisCalculations
    },
    {
      id: 'genetics',
      name: 'الوراثة',
      icon: Dna,
      description: 'مربع بونت والاحتماليات الوراثية',
      component: GeneticsCalculations
    },
    {
      id: 'growth',
      name: 'النمو والأيض',
      icon: TrendingUp,
      description: 'معدل النمو والتمثيل الغذائي',
      component: GrowthMetabolismCalculations
    },
    {
      id: 'biochem',
      name: 'الكيمياء الحيوية',
      icon: Brain,
      description: 'تركيز الإنزيمات والهرمونات',
      component: BiochemistryCalculations
    },
    {
      id: 'population',
      name: 'علم الأحياء السكاني',
      icon: TrendingUp,
      description: 'نمو الجماعات ومعدلات البقاء',
      component: PopulationBiologyCalculations
    },
    {
      id: 'nutrition',
      name: 'التغذية والطاقة',
      icon: Microscope,
      description: 'السعرات الحرارية وإنتاج الطاقة',
      component: NutritionEnergyCalculations
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4 text-glow-green flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-subject-biology-primary" />
          الحسابات الحيوية
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          احسب جميع المؤشرات الحيوية والطبية مع شرح مفصل لكل خطوة ومساعد ذكي للإجابة على أسئلتك
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-white/5 p-2 rounded-xl mb-6">
          {calculationCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex flex-col items-center p-3 rounded-lg border border-transparent data-[state=active]:border-subject-biology-primary data-[state=active]:bg-subject-biology-primary/20 transition-all duration-300"
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
                <Card className="bg-white/5 border-subject-biology-primary/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-subject-biology-primary">
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
            <Card className="bg-white/5 border-subject-biology-primary/30 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-subject-biology-primary">
                  <Brain className="w-5 h-5" />
                  المساعد الذكي للحسابات الحيوية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BiologyCalculatorAI />
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default BiologyCalculations;
