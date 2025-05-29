
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const VitalSignsCalculations = () => {
  const [respirationCalc, setRespirationCalc] = useState({
    breathsPerMinute: '',
    activity: 'rest',
    result: null as number | null,
    steps: [] as string[]
  });

  const [heartRateCalc, setHeartRateCalc] = useState({
    age: '',
    currentRate: '',
    activity: 'rest',
    result: null as number | null,
    steps: [] as string[]
  });

  const [cardiacOutputCalc, setCardiacOutputCalc] = useState({
    heartRate: '',
    strokeVolume: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateRespiration = () => {
    const rate = parseFloat(respirationCalc.breathsPerMinute);
    if (isNaN(rate)) return;

    let interpretation = '';
    let normalRange = '';
    
    if (respirationCalc.activity === 'rest') {
      normalRange = '12-20 نفس/دقيقة';
      if (rate < 12) interpretation = 'أقل من الطبيعي (بطء التنفس)';
      else if (rate > 20) interpretation = 'أعلى من الطبيعي (سرعة التنفس)';
      else interpretation = 'معدل طبيعي';
    } else {
      normalRange = '20-40 نفس/دقيقة';
      if (rate < 20) interpretation = 'أقل من المتوقع أثناء المجهود';
      else if (rate > 40) interpretation = 'مرتفع جداً - قد يحتاج استراحة';
      else interpretation = 'معدل طبيعي أثناء المجهود';
    }

    const steps = [
      `المعطى: معدل التنفس = ${rate} نفس/دقيقة`,
      `حالة النشاط: ${respirationCalc.activity === 'rest' ? 'راحة' : 'مجهود'}`,
      `المعدل الطبيعي: ${normalRange}`,
      `التفسير: ${interpretation}`,
      ``,
      `📊 التقييم الصحي:`,
      rate >= 12 && rate <= 20 && respirationCalc.activity === 'rest' 
        ? '✅ معدل التنفس في المستوى الطبيعي'
        : rate >= 20 && rate <= 40 && respirationCalc.activity === 'exercise'
        ? '✅ معدل التنفس مناسب للمجهود'
        : '⚠️ يُنصح بمراجعة طبيب'
    ];

    setRespirationCalc({ ...respirationCalc, result: rate, steps });
  };

  const calculateHeartRate = () => {
    const age = parseFloat(heartRateCalc.age);
    const currentRate = parseFloat(heartRateCalc.currentRate);
    if (isNaN(age) || isNaN(currentRate)) return;

    const maxHeartRate = 220 - age;
    const targetZoneMin = Math.round(maxHeartRate * 0.5);
    const targetZoneMax = Math.round(maxHeartRate * 0.85);

    let interpretation = '';
    if (heartRateCalc.activity === 'rest') {
      if (currentRate < 60) interpretation = 'بطء القلب (أقل من الطبيعي)';
      else if (currentRate > 100) interpretation = 'تسارع القلب (أعلى من الطبيعي)';
      else interpretation = 'معدل طبيعي';
    } else {
      if (currentRate < targetZoneMin) interpretation = 'أقل من المنطقة المستهدفة';
      else if (currentRate > maxHeartRate) interpretation = 'أعلى من الحد الأقصى الآمن';
      else if (currentRate >= targetZoneMin && currentRate <= targetZoneMax) interpretation = 'في المنطقة المستهدفة للتمرين';
      else interpretation = 'أعلى من المنطقة المستهدفة';
    }

    const steps = [
      `المعطى: العمر = ${age} سنة، النبض الحالي = ${currentRate} نبضة/دقيقة`,
      `الحد الأقصى للنبض = 220 - العمر`,
      `الحد الأقصى = 220 - ${age} = ${maxHeartRate} نبضة/دقيقة`,
      ``,
      `المنطقة المستهدفة للتمرين:`,
      `الحد الأدنى (50%) = ${maxHeartRate} × 0.5 = ${targetZoneMin} نبضة/دقيقة`,
      `الحد الأعلى (85%) = ${maxHeartRate} × 0.85 = ${targetZoneMax} نبضة/دقيقة`,
      ``,
      `🎯 التفسير: ${interpretation}`,
      heartRateCalc.activity === 'rest' && currentRate >= 60 && currentRate <= 100
        ? '✅ نبض طبيعي أثناء الراحة'
        : heartRateCalc.activity === 'exercise' && currentRate >= targetZoneMin && currentRate <= targetZoneMax
        ? '✅ نبض مثالي للتمرين'
        : '⚠️ قد يحتاج متابعة طبية'
    ];

    setHeartRateCalc({ ...heartRateCalc, result: maxHeartRate, steps });
  };

  const calculateCardiacOutput = () => {
    const hr = parseFloat(cardiacOutputCalc.heartRate);
    const sv = parseFloat(cardiacOutputCalc.strokeVolume);
    if (isNaN(hr) || isNaN(sv)) return;

    const cardiacOutput = (hr * sv) / 1000; // تحويل إلى لتر/دقيقة
    
    const steps = [
      `المعطى: معدل القلب = ${hr} نبضة/دقيقة، حجم الضربة = ${sv} مل`,
      `القانون: الناتج القلبي = معدل القلب × حجم الضربة`,
      `الناتج القلبي = ${hr} × ${sv} = ${hr * sv} مل/دقيقة`,
      `الناتج القلبي = ${cardiacOutput.toFixed(1)} لتر/دقيقة`,
      ``,
      `📊 المعدل الطبيعي: 4-8 لتر/دقيقة`,
      cardiacOutput >= 4 && cardiacOutput <= 8 
        ? '✅ ناتج قلبي طبيعي'
        : cardiacOutput < 4 
        ? '⚠️ ناتج قلبي منخفض'
        : '⚠️ ناتج قلبي مرتفع'
    ];

    setCardiacOutputCalc({ ...cardiacOutputCalc, result: cardiacOutput, steps });
  };

  return (
    <Tabs defaultValue="respiration" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="respiration">معدل التنفس</TabsTrigger>
        <TabsTrigger value="heartrate">نبض القلب</TabsTrigger>
        <TabsTrigger value="cardiac">الناتج القلبي</TabsTrigger>
      </TabsList>

      <TabsContent value="respiration" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب معدل التنفس</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>عدد الأنفاس في الدقيقة</Label>
                <Input
                  type="number"
                  placeholder="عدد الأنفاس"
                  value={respirationCalc.breathsPerMinute}
                  onChange={(e) => setRespirationCalc({ ...respirationCalc, breathsPerMinute: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>حالة النشاط</Label>
                <select
                  value={respirationCalc.activity}
                  onChange={(e) => setRespirationCalc({ ...respirationCalc, activity: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="rest">راحة</option>
                  <option value="exercise">مجهود</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateRespiration} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              تحليل معدل التنفس
            </Button>
            
            {respirationCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">تحليل معدل التنفس</h4>
                <div className="space-y-1 text-sm">
                  {respirationCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="heartrate" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب معدل ضربات القلب</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>العمر (سنة)</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={heartRateCalc.age}
                  onChange={(e) => setHeartRateCalc({ ...heartRateCalc, age: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>النبض الحالي</Label>
                <Input
                  type="number"
                  placeholder="نبضة/دقيقة"
                  value={heartRateCalc.currentRate}
                  onChange={(e) => setHeartRateCalc({ ...heartRateCalc, currentRate: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>حالة النشاط</Label>
                <select
                  value={heartRateCalc.activity}
                  onChange={(e) => setHeartRateCalc({ ...heartRateCalc, activity: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="rest">راحة</option>
                  <option value="exercise">تمرين</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateHeartRate} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Heart className="w-4 h-4 mr-2" />
              تحليل معدل القلب
            </Button>
            
            {heartRateCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">تحليل معدل القلب</h4>
                <div className="space-y-1 text-sm">
                  {heartRateCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cardiac" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب الناتج القلبي</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>معدل القلب (نبضة/دقيقة)</Label>
                <Input
                  type="number"
                  placeholder="معدل القلب"
                  value={cardiacOutputCalc.heartRate}
                  onChange={(e) => setCardiacOutputCalc({ ...cardiacOutputCalc, heartRate: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>حجم الضربة (مل)</Label>
                <Input
                  type="number"
                  placeholder="حجم الضربة"
                  value={cardiacOutputCalc.strokeVolume}
                  onChange={(e) => setCardiacOutputCalc({ ...cardiacOutputCalc, strokeVolume: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateCardiacOutput} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Activity className="w-4 h-4 mr-2" />
              احسب الناتج القلبي
            </Button>
            
            {cardiacOutputCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">الناتج القلبي: {cardiacOutputCalc.result?.toFixed(1)} لتر/دقيقة</h4>
                <div className="space-y-1 text-sm">
                  {cardiacOutputCalc.steps.map((step, index) => (
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

export default VitalSignsCalculations;
