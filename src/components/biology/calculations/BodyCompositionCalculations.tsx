
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Scale, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

const BodyCompositionCalculations = () => {
  const [bmiCalc, setBmiCalc] = useState({
    weight: '',
    height: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [waterCalc, setWaterCalc] = useState({
    weight: '',
    age: '',
    gender: 'male',
    result: null as number | null,
    steps: [] as string[]
  });

  const [tidalVolumeCalc, setTidalVolumeCalc] = useState({
    weight: '',
    age: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateBMI = () => {
    const weight = parseFloat(bmiCalc.weight);
    const height = parseFloat(bmiCalc.height) / 100; // تحويل إلى متر
    
    if (isNaN(weight) || isNaN(height) || height === 0) return;
    
    const bmi = weight / (height * height);
    let category = '';
    let healthRisk = '';
    
    if (bmi < 18.5) {
      category = 'نقص في الوزن';
      healthRisk = 'قد يحتاج زيادة الوزن بشكل صحي';
    } else if (bmi < 25) {
      category = 'وزن طبيعي';
      healthRisk = 'مؤشر صحي ممتاز';
    } else if (bmi < 30) {
      category = 'زيادة في الوزن';
      healthRisk = 'يُنصح بإنقاص الوزن';
    } else {
      category = 'سمنة';
      healthRisk = 'يحتاج متابعة طبية وإنقاص الوزن';
    }

    const steps = [
      `المعطى: الوزن = ${weight} كغ، الطول = ${parseFloat(bmiCalc.height)} سم`,
      `القانون: مؤشر كتلة الجسم = الوزن ÷ (الطول)²`,
      `الطول بالمتر = ${parseFloat(bmiCalc.height)} ÷ 100 = ${height.toFixed(2)} م`,
      `BMI = ${weight} ÷ (${height.toFixed(2)})²`,
      `BMI = ${weight} ÷ ${(height * height).toFixed(3)}`,
      `BMI = ${bmi.toFixed(1)}`,
      ``,
      `📊 التصنيف: ${category}`,
      `💡 التوصية: ${healthRisk}`,
      ``,
      `المعايير الطبية:`,
      `• أقل من 18.5: نقص في الوزن`,
      `• 18.5 - 24.9: وزن طبيعي`,
      `• 25 - 29.9: زيادة في الوزن`,
      `• 30 فأكثر: سمنة`
    ];
    
    setBmiCalc({ ...bmiCalc, result: bmi, steps });
  };

  const calculateWaterPercentage = () => {
    const weight = parseFloat(waterCalc.weight);
    const age = parseFloat(waterCalc.age);
    
    if (isNaN(weight) || isNaN(age)) return;
    
    let waterPercentage = 0;
    
    // معادلة تقدير نسبة الماء حسب العمر والجنس
    if (waterCalc.gender === 'male') {
      waterPercentage = age <= 18 ? 75 : age <= 50 ? 60 : 55;
    } else {
      waterPercentage = age <= 18 ? 70 : age <= 50 ? 55 : 50;
    }
    
    const waterWeight = (weight * waterPercentage) / 100;
    
    const steps = [
      `المعطى: الوزن = ${weight} كغ، العمر = ${age} سنة، الجنس = ${waterCalc.gender === 'male' ? 'ذكر' : 'أنثى'}`,
      ``,
      `نسبة الماء المتوقعة:`,
      waterCalc.gender === 'male' 
        ? `• الذكور: 75% (أقل من 18)، 60% (18-50)، 55% (أكثر من 50)`
        : `• الإناث: 70% (أقل من 18)، 55% (18-50)، 50% (أكثر من 50)`,
      ``,
      `نسبة الماء المقدرة = ${waterPercentage}%`,
      `كمية الماء = الوزن × النسبة`,
      `كمية الماء = ${weight} × ${waterPercentage}% = ${waterWeight.toFixed(1)} كغ`,
      ``,
      `💧 تفسير النتيجة:`,
      waterPercentage >= 60 ? '✅ نسبة ماء صحية' : '⚠️ قد تحتاج شرب المزيد من الماء',
      `📌 يُنصح بشرب 2-3 لتر يومياً`
    ];
    
    setWaterCalc({ ...waterCalc, result: waterPercentage, steps });
  };

  const calculateTidalVolume = () => {
    const weight = parseFloat(tidalVolumeCalc.weight);
    const age = parseFloat(tidalVolumeCalc.age);
    
    if (isNaN(weight) || isNaN(age)) return;
    
    // حساب حجم الهواء التنفسي: 6-8 مل لكل كغ من وزن الجسم
    const tidalVolume = weight * 7; // متوسط 7 مل/كغ
    const minuteVentilation = tidalVolume * 15; // مع معدل تنفس 15 نفس/دقيقة
    
    const steps = [
      `المعطى: الوزن = ${weight} كغ، العمر = ${age} سنة`,
      `القانون: حجم الهواء التنفسي = الوزن × 6-8 مل/كغ`,
      `حجم الهواء التنفسي = ${weight} × 7 = ${tidalVolume} مل`,
      ``,
      `مع معدل تنفس طبيعي (15 نفس/دقيقة):`,
      `التهوية الدقيقية = حجم الهواء × معدل التنفس`,
      `التهوية الدقيقية = ${tidalVolume} × 15 = ${minuteVentilation} مل/دقيقة`,
      `التهوية الدقيقية = ${(minuteVentilation / 1000).toFixed(1)} لتر/دقيقة`,
      ``,
      `📊 المعايير الطبيعية:`,
      `• حجم الهواء التنفسي: 500-800 مل`,
      `• التهوية الدقيقية: 6-8 لتر/دقيقة`,
      tidalVolume >= 500 && tidalVolume <= 800 
        ? '✅ حجم تنفسي طبيعي'
        : '⚠️ قد يحتاج فحص رئوي'
    ];
    
    setTidalVolumeCalc({ ...tidalVolumeCalc, result: tidalVolume, steps });
  };

  return (
    <Tabs defaultValue="bmi" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="bmi">مؤشر كتلة الجسم</TabsTrigger>
        <TabsTrigger value="water">نسبة الماء</TabsTrigger>
        <TabsTrigger value="tidal">حجم التنفس</TabsTrigger>
      </TabsList>

      <TabsContent value="bmi" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب مؤشر كتلة الجسم (BMI)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الوزن (كغ)</Label>
                <Input
                  type="number"
                  placeholder="الوزن بالكيلوغرام"
                  value={bmiCalc.weight}
                  onChange={(e) => setBmiCalc({ ...bmiCalc, weight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الطول (سم)</Label>
                <Input
                  type="number"
                  placeholder="الطول بالسنتيمتر"
                  value={bmiCalc.height}
                  onChange={(e) => setBmiCalc({ ...bmiCalc, height: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateBMI} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Scale className="w-4 h-4 mr-2" />
              احسب مؤشر كتلة الجسم
            </Button>
            
            {bmiCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">BMI = {bmiCalc.result.toFixed(1)}</h4>
                <div className="space-y-1 text-sm">
                  {bmiCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="water" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب نسبة الماء في الجسم</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الوزن (كغ)</Label>
                <Input
                  type="number"
                  placeholder="الوزن"
                  value={waterCalc.weight}
                  onChange={(e) => setWaterCalc({ ...waterCalc, weight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>العمر (سنة)</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={waterCalc.age}
                  onChange={(e) => setWaterCalc({ ...waterCalc, age: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الجنس</Label>
                <select
                  value={waterCalc.gender}
                  onChange={(e) => setWaterCalc({ ...waterCalc, gender: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateWaterPercentage} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Droplet className="w-4 h-4 mr-2" />
              احسب نسبة الماء
            </Button>
            
            {waterCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">نسبة الماء: {waterCalc.result}%</h4>
                <div className="space-y-1 text-sm">
                  {waterCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tidal" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب حجم الهواء التنفسي</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الوزن (كغ)</Label>
                <Input
                  type="number"
                  placeholder="الوزن"
                  value={tidalVolumeCalc.weight}
                  onChange={(e) => setTidalVolumeCalc({ ...tidalVolumeCalc, weight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>العمر (سنة)</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={tidalVolumeCalc.age}
                  onChange={(e) => setTidalVolumeCalc({ ...tidalVolumeCalc, age: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateTidalVolume} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب حجم الهواء التنفسي
            </Button>
            
            {tidalVolumeCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">حجم الهواء التنفسي: {tidalVolumeCalc.result} مل</h4>
                <div className="space-y-1 text-sm">
                  {tidalVolumeCalc.steps.map((step, index) => (
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

export default BodyCompositionCalculations;
