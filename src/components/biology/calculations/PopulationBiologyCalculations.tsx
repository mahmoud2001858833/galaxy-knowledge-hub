
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const PopulationBiologyCalculations = () => {
  const [growthCalc, setGrowthCalc] = useState({
    initialPop: '',
    growthRate: '',
    time: '',
    carryingCapacity: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [mortalityCalc, setMortalityCalc] = useState({
    deaths: '',
    totalPop: '',
    timeUnit: 'year',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculatePopulationGrowth = () => {
    const N0 = parseFloat(growthCalc.initialPop);
    const r = parseFloat(growthCalc.growthRate) / 100; // تحويل إلى نسبة عشرية
    const t = parseFloat(growthCalc.time);
    const K = parseFloat(growthCalc.carryingCapacity);
    
    if (isNaN(N0) || isNaN(r) || isNaN(t)) return;
    
    let finalPop = 0;
    let growthType = '';
    let formula = '';
    
    if (isNaN(K) || K <= 0) {
      // نمو أسي (exponential growth)
      finalPop = N0 * Math.exp(r * t);
      growthType = 'نمو أسي (غير محدود)';
      formula = 'N(t) = N₀ × e^(rt)';
    } else {
      // نمو لوجستي (logistic growth)
      finalPop = K / (1 + ((K - N0) / N0) * Math.exp(-r * t));
      growthType = 'نمو لوجستي (محدود)';
      formula = 'N(t) = K / (1 + ((K-N₀)/N₀) × e^(-rt))';
    }
    
    const growthFactor = finalPop / N0;
    const doublingTime = Math.log(2) / r;

    const steps = [
      `المعطى: العدد الابتدائي = ${N0}، معدل النمو = ${growthCalc.growthRate}%، الزمن = ${t} سنة${K ? `، السعة الاستيعابية = ${K}` : ''}`,
      ``,
      `📈 نوع النمو: ${growthType}`,
      `المعادلة المستخدمة: ${formula}`,
      ``,
      `🧮 الحسابات:`,
      `معدل النمو (r) = ${growthCalc.growthRate}% = ${r.toFixed(4)}`,
      isNaN(K) || K <= 0 
        ? `N(${t}) = ${N0} × e^(${r.toFixed(4)} × ${t})`
        : `N(${t}) = ${K} / (1 + ((${K}-${N0})/${N0}) × e^(${-r.toFixed(4)} × ${t}))`,
      `العدد النهائي = ${finalPop.toFixed(0)} فرد`,
      ``,
      `📊 تحليل النمو:`,
      `عامل النمو = ${growthFactor.toFixed(2)} (زيادة ${((growthFactor - 1) * 100).toFixed(1)}%)`,
      `زمن المضاعفة = ${doublingTime.toFixed(1)} سنة`,
      ``,
      `🌍 العوامل البيئية:`,
      `• الموارد المتاحة (غذاء، ماء، مأوى)`,
      `• الحيوانات المفترسة والأمراض`,
      `• التنافس داخل النوع وبين الأنواع`,
      `• الظروف المناخية والبيئية`,
      K && finalPop / K > 0.9 
        ? '⚠️ اقتراب من السعة الاستيعابية'
        : '✅ نمو ضمن الحدود البيئية'
    ];
    
    setGrowthCalc({ ...growthCalc, result: finalPop, steps });
  };

  const calculateMortality = () => {
    const deaths = parseFloat(mortalityCalc.deaths);
    const population = parseFloat(mortalityCalc.totalPop);
    
    if (isNaN(deaths) || isNaN(population) || population === 0) return;
    
    const mortalityRate = (deaths / population) * 1000; // معدل الوفيات لكل 1000 فرد
    const survivalRate = ((population - deaths) / population) * 100; // معدل البقاء
    
    let interpretation = '';
    if (mortalityRate < 5) {
      interpretation = 'معدل وفيات منخفض - جماعة صحية';
    } else if (mortalityRate < 15) {
      interpretation = 'معدل وفيات متوسط - ضمن المعدل الطبيعي';
    } else if (mortalityRate < 30) {
      interpretation = 'معدل وفيات مرتفع - يحتاج تدخل';
    } else {
      interpretation = 'معدل وفيات عالي جداً - أزمة بيئية';
    }

    const steps = [
      `المعطى: عدد الوفيات = ${deaths}، إجمالي الجماعة = ${population}، الفترة = ${mortalityCalc.timeUnit === 'year' ? 'سنة' : 'شهر'}`,
      ``,
      `💀 حسابات الوفيات:`,
      `معدل الوفيات = (عدد الوفيات ÷ إجمالي الجماعة) × 1000`,
      `معدل الوفيات = (${deaths} ÷ ${population}) × 1000`,
      `معدل الوفيات = ${mortalityRate.toFixed(2)} لكل 1000 فرد/${mortalityCalc.timeUnit === 'year' ? 'سنة' : 'شهر'}`,
      ``,
      `💚 معدل البقاء = ((الجماعة - الوفيات) ÷ الجماعة) × 100`,
      `معدل البقاء = ((${population} - ${deaths}) ÷ ${population}) × 100`,
      `معدل البقاء = ${survivalRate.toFixed(1)}%`,
      ``,
      `📊 التفسير: ${interpretation}`,
      ``,
      `📈 عوامل الوفيات:`,
      `• العوامل الطبيعية (عمر، أمراض)`,
      `• الافتراس والتنافس`,
      `• نقص الموارد (جوع، عطش)`,
      `• الكوارث الطبيعية والتلوث`,
      `• التدخل البشري`,
      ``,
      `🎯 مؤشرات الصحة:`,
      mortalityRate < 15 ? '✅ جماعة مستقرة' : '⚠️ جماعة تحت ضغط بيئي'
    ];
    
    setMortalityCalc({ ...mortalityCalc, result: mortalityRate, steps });
  };

  return (
    <Tabs defaultValue="growth" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="growth">نمو الجماعات</TabsTrigger>
        <TabsTrigger value="mortality">معدل الوفيات</TabsTrigger>
      </TabsList>

      <TabsContent value="growth" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">نمو الجماعات الحيوية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>العدد الابتدائي</Label>
                <Input
                  type="number"
                  placeholder="عدد الأفراد في البداية"
                  value={growthCalc.initialPop}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, initialPop: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>معدل النمو السنوي (%)</Label>
                <Input
                  type="number"
                  placeholder="معدل النمو"
                  value={growthCalc.growthRate}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, growthRate: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الفترة الزمنية (سنة)</Label>
                <Input
                  type="number"
                  placeholder="عدد السنوات"
                  value={growthCalc.time}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, time: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>السعة الاستيعابية (اختياري)</Label>
                <Input
                  type="number"
                  placeholder="الحد الأقصى للبيئة"
                  value={growthCalc.carryingCapacity}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, carryingCapacity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <div className="text-sm text-white/70">
              💡 ترك السعة الاستيعابية فارغاً يعني نمو أسي غير محدود
            </div>
            <Button onClick={calculatePopulationGrowth} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <TrendingUp className="w-4 h-4 mr-2" />
              احسب نمو الجماعة
            </Button>
            
            {growthCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">العدد المتوقع: {growthCalc.result?.toFixed(0)} فرد</h4>
                <div className="space-y-1 text-sm">
                  {growthCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mortality" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب معدل الوفيات</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>عدد الوفيات</Label>
                <Input
                  type="number"
                  placeholder="عدد الأفراد المتوفين"
                  value={mortalityCalc.deaths}
                  onChange={(e) => setMortalityCalc({ ...mortalityCalc, deaths: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>إجمالي الجماعة</Label>
                <Input
                  type="number"
                  placeholder="العدد الكلي"
                  value={mortalityCalc.totalPop}
                  onChange={(e) => setMortalityCalc({ ...mortalityCalc, totalPop: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>وحدة الزمن</Label>
                <select
                  value={mortalityCalc.timeUnit}
                  onChange={(e) => setMortalityCalc({ ...mortalityCalc, timeUnit: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="year">سنة</option>
                  <option value="month">شهر</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateMortality} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Users className="w-4 h-4 mr-2" />
              احسب معدل الوفيات
            </Button>
            
            {mortalityCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">معدل الوفيات: {mortalityCalc.result?.toFixed(2)} لكل 1000 فرد</h4>
                <div className="space-y-1 text-sm">
                  {mortalityCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PopulationBiologyCalculations;
