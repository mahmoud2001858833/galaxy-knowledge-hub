
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const GrowthMetabolismCalculations = () => {
  const [growthCalc, setGrowthCalc] = useState({
    initialSize: '',
    finalSize: '',
    timeUnit: 'days',
    timePeriod: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [bmrCalc, setBmrCalc] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'sedentary',
    result: null as number | null,
    steps: [] as string[]
  });

  const [gfrCalc, setGfrCalc] = useState({
    creatinine: '',
    age: '',
    weight: '',
    gender: 'male',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateGrowthRate = () => {
    const initial = parseFloat(growthCalc.initialSize);
    const final = parseFloat(growthCalc.finalSize);
    const time = parseFloat(growthCalc.timePeriod);
    
    if (isNaN(initial) || isNaN(final) || isNaN(time) || time === 0) return;
    
    const absoluteGrowth = final - initial;
    const relativeGrowth = ((final - initial) / initial) * 100;
    const growthRate = absoluteGrowth / time;
    const relativeGrowthRate = relativeGrowth / time;

    const steps = [
      `المعطى: الحجم الابتدائي = ${initial}، الحجم النهائي = ${final}، الفترة الزمنية = ${time} ${growthCalc.timeUnit === 'days' ? 'يوم' : growthCalc.timeUnit === 'weeks' ? 'أسبوع' : 'شهر'}`,
      ``,
      `📊 حسابات النمو:`,
      `النمو المطلق = الحجم النهائي - الحجم الابتدائي`,
      `النمو المطلق = ${final} - ${initial} = ${absoluteGrowth}`,
      ``,
      `النمو النسبي = (النمو المطلق ÷ الحجم الابتدائي) × 100`,
      `النمو النسبي = (${absoluteGrowth} ÷ ${initial}) × 100 = ${relativeGrowth.toFixed(2)}%`,
      ``,
      `معدل النمو = النمو المطلق ÷ الفترة الزمنية`,
      `معدل النمو = ${absoluteGrowth} ÷ ${time} = ${growthRate.toFixed(3)} وحدة/${growthCalc.timeUnit === 'days' ? 'يوم' : growthCalc.timeUnit === 'weeks' ? 'أسبوع' : 'شهر'}`,
      ``,
      `معدل النمو النسبي = ${relativeGrowthRate.toFixed(3)}% /${growthCalc.timeUnit === 'days' ? 'يوم' : growthCalc.timeUnit === 'weeks' ? 'أسبوع' : 'شهر'}`,
      ``,
      `🌱 تفسير النتائج:`,
      relativeGrowth > 0 ? '✅ نمو إيجابي' : relativeGrowth < 0 ? '⚠️ انكماش/تراجع' : 'لا يوجد نمو',
      relativeGrowthRate > 10 ? 'معدل نمو سريع' : relativeGrowthRate > 5 ? 'معدل نمو متوسط' : 'معدل نمو بطيء'
    ];
    
    setGrowthCalc({ ...growthCalc, result: growthRate, steps });
  };

  const calculateBMR = () => {
    const weight = parseFloat(bmrCalc.weight);
    const height = parseFloat(bmrCalc.height);
    const age = parseFloat(bmrCalc.age);
    
    if (isNaN(weight) || isNaN(height) || isNaN(age)) return;
    
    // معادلة هاريس-بنديكت المعدلة
    let bmr = 0;
    if (bmrCalc.gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // عوامل النشاط
    const activityFactors = {
      sedentary: 1.2,    // قليل النشاط
      light: 1.375,      // نشاط خفيف
      moderate: 1.55,    // نشاط متوسط
      high: 1.725,       // نشاط عالي
      extreme: 1.9       // نشاط شديد
    };
    
    const activityFactor = activityFactors[bmrCalc.activityLevel];
    const tdee = bmr * activityFactor; // إجمالي الطاقة اليومية

    const steps = [
      `المعطى: الوزن = ${weight} كغ، الطول = ${height} سم، العمر = ${age} سنة، الجنس = ${bmrCalc.gender === 'male' ? 'ذكر' : 'أنثى'}`,
      ``,
      `🔥 معادلة هاريس-بنديكت المعدلة:`,
      bmrCalc.gender === 'male' 
        ? `للرجال: BMR = 88.362 + (13.397 × الوزن) + (4.799 × الطول) - (5.677 × العمر)`
        : `للنساء: BMR = 447.593 + (9.247 × الوزن) + (3.098 × الطول) - (4.330 × العمر)`,
      ``,
      `BMR = ${bmr.toFixed(1)} سعرة حرارية/يوم`,
      ``,
      `⚡ حساب إجمالي الطاقة اليومية (TDEE):`,
      `مستوى النشاط: ${
        bmrCalc.activityLevel === 'sedentary' ? 'قليل النشاط (1.2)' :
        bmrCalc.activityLevel === 'light' ? 'نشاط خفيف (1.375)' :
        bmrCalc.activityLevel === 'moderate' ? 'نشاط متوسط (1.55)' :
        bmrCalc.activityLevel === 'high' ? 'نشاط عالي (1.725)' : 'نشاط شديد (1.9)'
      }`,
      `TDEE = BMR × عامل النشاط`,
      `TDEE = ${bmr.toFixed(1)} × ${activityFactor} = ${tdee.toFixed(1)} سعرة حرارية/يوم`,
      ``,
      `📋 توصيات التغذية:`,
      `• للحفاظ على الوزن: ${tdee.toFixed(0)} سعرة حرارية/يوم`,
      `• لإنقاص الوزن: ${(tdee - 500).toFixed(0)} سعرة حرارية/يوم`,
      `• لزيادة الوزن: ${(tdee + 500).toFixed(0)} سعرة حرارية/يوم`
    ];
    
    setBmrCalc({ ...bmrCalc, result: bmr, steps });
  };

  const calculateGFR = () => {
    const creatinine = parseFloat(gfrCalc.creatinine);
    const age = parseFloat(gfrCalc.age);
    const weight = parseFloat(gfrCalc.weight);
    
    if (isNaN(creatinine) || isNaN(age) || isNaN(weight)) return;
    
    // معادلة Cockcroft-Gault
    let gfr = ((140 - age) * weight) / (72 * creatinine);
    if (gfrCalc.gender === 'female') {
      gfr = gfr * 0.85; // تصحيح للإناث
    }
    
    let interpretation = '';
    let stage = '';
    
    if (gfr >= 90) {
      stage = 'المرحلة 1';
      interpretation = 'وظائف كلى طبيعية أو عالية';
    } else if (gfr >= 60) {
      stage = 'المرحلة 2';
      interpretation = 'انخفاض طفيف في وظائف الكلى';
    } else if (gfr >= 30) {
      stage = 'المرحلة 3';
      interpretation = 'انخفاض متوسط في وظائف الكلى';
    } else if (gfr >= 15) {
      stage = 'المرحلة 4';
      interpretation = 'انخفاض شديد في وظائف الكلى';
    } else {
      stage = 'المرحلة 5';
      interpretation = 'فشل كلوي - يحتاج غسيل كلى';
    }

    const steps = [
      `المعطى: الكرياتينين = ${creatinine} mg/dL، العمر = ${age} سنة، الوزن = ${weight} كغ، الجنس = ${gfrCalc.gender === 'male' ? 'ذكر' : 'أنثى'}`,
      ``,
      `💉 معادلة Cockcroft-Gault:`,
      `GFR = ((140 - العمر) × الوزن) ÷ (72 × الكرياتينين)`,
      gfrCalc.gender === 'female' ? `للإناث: النتيجة × 0.85` : '',
      ``,
      `GFR = ((140 - ${age}) × ${weight}) ÷ (72 × ${creatinine})`,
      `GFR = (${140 - age} × ${weight}) ÷ ${72 * creatinine}`,
      `GFR = ${((140 - age) * weight).toFixed(1)} ÷ ${(72 * creatinine).toFixed(1)}`,
      gfrCalc.gender === 'female' 
        ? `GFR = ${(((140 - age) * weight) / (72 * creatinine)).toFixed(1)} × 0.85 = ${gfr.toFixed(1)} mL/min/1.73m²`
        : `GFR = ${gfr.toFixed(1)} mL/min/1.73m²`,
      ``,
      `🏥 تصنيف وظائف الكلى:`,
      `المرحلة: ${stage}`,
      `التفسير: ${interpretation}`,
      ``,
      `📊 مراحل أمراض الكلى:`,
      `• المرحلة 1: GFR ≥ 90 (طبيعي)`,
      `• المرحلة 2: GFR 60-89 (انخفاض طفيف)`,
      `• المرحلة 3: GFR 30-59 (انخفاض متوسط)`,
      `• المرحلة 4: GFR 15-29 (انخفاض شديد)`,
      `• المرحلة 5: GFR < 15 (فشل كلوي)`,
      gfr >= 60 ? '✅ وظائف كلى جيدة' : '⚠️ يحتاج متابعة طبية'
    ];
    
    setGfrCalc({ ...gfrCalc, result: gfr, steps });
  };

  return (
    <Tabs defaultValue="growth" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="growth">معدل النمو</TabsTrigger>
        <TabsTrigger value="bmr">الأيض الأساسي</TabsTrigger>
        <TabsTrigger value="gfr">تصفية الكلى</TabsTrigger>
      </TabsList>

      <TabsContent value="growth" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب معدل النمو</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الحجم الابتدائي</Label>
                <Input
                  type="number"
                  placeholder="الحجم في البداية"
                  value={growthCalc.initialSize}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, initialSize: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الحجم النهائي</Label>
                <Input
                  type="number"
                  placeholder="الحجم في النهاية"
                  value={growthCalc.finalSize}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, finalSize: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الفترة الزمنية</Label>
                <Input
                  type="number"
                  placeholder="المدة"
                  value={growthCalc.timePeriod}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, timePeriod: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>وحدة الزمن</Label>
                <select
                  value={growthCalc.timeUnit}
                  onChange={(e) => setGrowthCalc({ ...growthCalc, timeUnit: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="days">أيام</option>
                  <option value="weeks">أسابيع</option>
                  <option value="months">شهور</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateGrowthRate} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <TrendingUp className="w-4 h-4 mr-2" />
              احسب معدل النمو
            </Button>
            
            {growthCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">معدل النمو: {growthCalc.result?.toFixed(3)} وحدة/زمن</h4>
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

      <TabsContent value="bmr" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب معدل الأيض الأساسي</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الوزن (كغ)</Label>
                <Input
                  type="number"
                  placeholder="الوزن"
                  value={bmrCalc.weight}
                  onChange={(e) => setBmrCalc({ ...bmrCalc, weight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الطول (سم)</Label>
                <Input
                  type="number"
                  placeholder="الطول"
                  value={bmrCalc.height}
                  onChange={(e) => setBmrCalc({ ...bmrCalc, height: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>العمر (سنة)</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={bmrCalc.age}
                  onChange={(e) => setBmrCalc({ ...bmrCalc, age: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الجنس</Label>
                <select
                  value={bmrCalc.gender}
                  onChange={(e) => setBmrCalc({ ...bmrCalc, gender: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <div>
              <Label>مستوى النشاط</Label>
              <select
                value={bmrCalc.activityLevel}
                onChange={(e) => setBmrCalc({ ...bmrCalc, activityLevel: e.target.value })}
                className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
              >
                <option value="sedentary">قليل النشاط</option>
                <option value="light">نشاط خفيف</option>
                <option value="moderate">نشاط متوسط</option>
                <option value="high">نشاط عالي</option>
                <option value="extreme">نشاط شديد</option>
              </select>
            </div>
            <Button onClick={calculateBMR} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Flame className="w-4 h-4 mr-2" />
              احسب معدل الأيض
            </Button>
            
            {bmrCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">معدل الأيض الأساسي: {bmrCalc.result?.toFixed(1)} سعرة حرارية/يوم</h4>
                <div className="space-y-1 text-sm">
                  {bmrCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gfr" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب معدل تصفية الكلى (GFR)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكرياتينين (mg/dL)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="مستوى الكرياتينين"
                  value={gfrCalc.creatinine}
                  onChange={(e) => setGfrCalc({ ...gfrCalc, creatinine: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>العمر (سنة)</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={gfrCalc.age}
                  onChange={(e) => setGfrCalc({ ...gfrCalc, age: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الوزن (كغ)</Label>
                <Input
                  type="number"
                  placeholder="الوزن"
                  value={gfrCalc.weight}
                  onChange={(e) => setGfrCalc({ ...gfrCalc, weight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الجنس</Label>
                <select
                  value={gfrCalc.gender}
                  onChange={(e) => setGfrCalc({ ...gfrCalc, gender: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateGFR} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب معدل تصفية الكلى
            </Button>
            
            {gfrCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">معدل تصفية الكلى: {gfrCalc.result?.toFixed(1)} mL/min/1.73m²</h4>
                <div className="space-y-1 text-sm">
                  {gfrCalc.steps.map((step, index) => (
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

export default GrowthMetabolismCalculations;
