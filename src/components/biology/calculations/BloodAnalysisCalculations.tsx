
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Droplet, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const BloodAnalysisCalculations = () => {
  const [hemoglobinCalc, setHemoglobinCalc] = useState({
    hemoglobin: '',
    gender: 'male',
    age: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [bloodSugarCalc, setBloodSugarCalc] = useState({
    glucose: '',
    testType: 'fasting',
    result: null as number | null,
    steps: [] as string[]
  });

  const [oxygenSaturationCalc, setOxygenSaturationCalc] = useState({
    spo2: '',
    altitude: '0',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateHemoglobin = () => {
    const hb = parseFloat(hemoglobinCalc.hemoglobin);
    const age = parseFloat(hemoglobinCalc.age);
    
    if (isNaN(hb) || isNaN(age)) return;
    
    let normalRange = '';
    let interpretation = '';
    
    if (hemoglobinCalc.gender === 'male') {
      normalRange = '14-18 g/dL';
      if (hb < 14) interpretation = 'أقل من الطبيعي - قد يشير لفقر الدم';
      else if (hb > 18) interpretation = 'أعلى من الطبيعي - قد يشير لكثرة الكريات الحمراء';
      else interpretation = 'مستوى طبيعي';
    } else {
      normalRange = '12-16 g/dL';
      if (hb < 12) interpretation = 'أقل من الطبيعي - قد يشير لفقر الدم';
      else if (hb > 16) interpretation = 'أعلى من الطبيعي - قد يشير لكثرة الكريات الحمراء';
      else interpretation = 'مستوى طبيعي';
    }

    const steps = [
      `المعطى: الهيموغلوبين = ${hb} g/dL، الجنس = ${hemoglobinCalc.gender === 'male' ? 'ذكر' : 'أنثى'}، العمر = ${age} سنة`,
      ``,
      `المعدل الطبيعي للهيموغلوبين:`,
      `• الذكور: 14-18 g/dL`,
      `• الإناث: 12-16 g/dL`,
      `• الأطفال: 11-13 g/dL`,
      ``,
      `المعدل الطبيعي المطبق: ${normalRange}`,
      `🩸 التفسير: ${interpretation}`,
      ``,
      `📊 وظائف الهيموغلوبين:`,
      `• نقل الأوكسجين من الرئتين للأنسجة`,
      `• نقل ثاني أكسيد الكربون من الأنسجة للرئتين`,
      `• المساعدة في تنظيم pH الدم`,
      hb >= (hemoglobinCalc.gender === 'male' ? 14 : 12) && hb <= (hemoglobinCalc.gender === 'male' ? 18 : 16)
        ? '✅ مستوى هيموغلوبين صحي'
        : '⚠️ يُنصح بمراجعة طبيب'
    ];
    
    setHemoglobinCalc({ ...hemoglobinCalc, result: hb, steps });
  };

  const calculateBloodSugar = () => {
    const glucose = parseFloat(bloodSugarCalc.glucose);
    
    if (isNaN(glucose)) return;
    
    let interpretation = '';
    let normalRange = '';
    let category = '';
    
    if (bloodSugarCalc.testType === 'fasting') {
      normalRange = '70-100 mg/dL';
      if (glucose < 70) {
        category = 'نقص السكر';
        interpretation = 'مستوى منخفض خطير - يحتاج علاج فوري';
      } else if (glucose <= 100) {
        category = 'طبيعي';
        interpretation = 'مستوى سكر طبيعي';
      } else if (glucose <= 125) {
        category = 'ما قبل السكري';
        interpretation = 'مستوى مرتفع - خطر الإصابة بالسكري';
      } else {
        category = 'السكري';
        interpretation = 'مستوى مرتفع - يشير للإصابة بالسكري';
      }
    } else { // random test
      normalRange = 'أقل من 140 mg/dL';
      if (glucose < 140) {
        category = 'طبيعي';
        interpretation = 'مستوى سكر طبيعي';
      } else if (glucose <= 199) {
        category = 'ما قبل السكري';
        interpretation = 'مستوى مرتفع - خطر الإصابة بالسكري';
      } else {
        category = 'السكري';
        interpretation = 'مستوى مرتفع - يشير للإصابة بالسكري';
      }
    }

    const steps = [
      `المعطى: سكر الدم = ${glucose} mg/dL، نوع الفحص = ${bloodSugarCalc.testType === 'fasting' ? 'صيام' : 'عشوائي'}`,
      ``,
      `المعايير الطبية:`,
      bloodSugarCalc.testType === 'fasting' 
        ? `فحص الصيام: طبيعي (70-100)، ما قبل السكري (101-125)، السكري (126+)`
        : `فحص عشوائي: طبيعي (<140)، ما قبل السكري (140-199)، السكري (200+)`,
      ``,
      `المعدل الطبيعي: ${normalRange}`,
      `📊 التصنيف: ${category}`,
      `💡 التفسير: ${interpretation}`,
      ``,
      `📋 نصائح مهمة:`,
      `• فحص منتظم كل 3 أشهر للمصابين بالسكري`,
      `• نمط حياة صحي لمن لديهم ما قبل السكري`,
      `• اتباع نظام غذائي مناسب وممارسة الرياضة`,
      glucose >= 70 && glucose <= 100 && bloodSugarCalc.testType === 'fasting'
        ? '✅ مستوى سكر صحي'
        : glucose < 140 && bloodSugarCalc.testType === 'random'
        ? '✅ مستوى سكر صحي'
        : '⚠️ يحتاج متابعة طبية'
    ];
    
    setBloodSugarCalc({ ...bloodSugarCalc, result: glucose, steps });
  };

  const calculateOxygenSaturation = () => {
    const spo2 = parseFloat(oxygenSaturationCalc.spo2);
    const altitude = parseFloat(oxygenSaturationCalc.altitude);
    
    if (isNaN(spo2)) return;
    
    let interpretation = '';
    let altitudeEffect = '';
    
    // تأثير الارتفاع على مستوى الأوكسجين
    let expectedSpo2 = 95; // المستوى الطبيعي عند مستوى سطح البحر
    if (altitude > 0) {
      expectedSpo2 = 95 - (altitude / 1000) * 2; // انخفاض تقريبي 2% لكل 1000 متر
      altitudeEffect = `المستوى المتوقع على ارتفاع ${altitude}م: ${expectedSpo2.toFixed(1)}%`;
    }
    
    if (spo2 >= 95) {
      interpretation = 'مستوى أوكسجين ممتاز';
    } else if (spo2 >= 90) {
      interpretation = 'مستوى أوكسجين مقبول - مراقبة';
    } else if (spo2 >= 85) {
      interpretation = 'مستوى منخفض - يحتاج أوكسجين إضافي';
    } else {
      interpretation = 'مستوى خطير - علاج طارئ';
    }

    const steps = [
      `المعطى: تشبع الأوكسجين = ${spo2}%، الارتفاع = ${altitude} متر`,
      ``,
      `📊 معايير تشبع الأوكسجين:`,
      `• ممتاز: 95-100%`,
      `• مقبول: 90-94%`,
      `• منخفض: 85-89%`,
      `• خطير: أقل من 85%`,
      ``,
      altitude > 0 ? altitudeEffect : 'المستوى المطلوب عند مستوى سطح البحر: 95-100%',
      `🫁 التفسير: ${interpretation}`,
      ``,
      `💡 عوامل تؤثر على التشبع:`,
      `• أمراض الرئة (الربو، الالتهاب الرئوي)`,
      `• أمراض القلب`,
      `• فقر الدم الشديد`,
      `• التدخين`,
      `• الارتفاع عن سطح البحر`,
      spo2 >= 95 
        ? '✅ مستوى أوكسجين صحي'
        : spo2 >= 90
        ? '⚠️ يحتاج مراقبة'
        : '🚨 يحتاج علاج طبي فوري'
    ];
    
    setOxygenSaturationCalc({ ...oxygenSaturationCalc, result: spo2, steps });
  };

  return (
    <Tabs defaultValue="hemoglobin" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="hemoglobin">الهيموغلوبين</TabsTrigger>
        <TabsTrigger value="glucose">سكر الدم</TabsTrigger>
        <TabsTrigger value="oxygen">تشبع الأوكسجين</TabsTrigger>
      </TabsList>

      <TabsContent value="hemoglobin" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">تحليل الهيموغلوبين</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الهيموغلوبين (g/dL)</Label>
                <Input
                  type="number"
                  placeholder="مستوى الهيموغلوبين"
                  value={hemoglobinCalc.hemoglobin}
                  onChange={(e) => setHemoglobinCalc({ ...hemoglobinCalc, hemoglobin: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>العمر (سنة)</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={hemoglobinCalc.age}
                  onChange={(e) => setHemoglobinCalc({ ...hemoglobinCalc, age: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الجنس</Label>
                <select
                  value={hemoglobinCalc.gender}
                  onChange={(e) => setHemoglobinCalc({ ...hemoglobinCalc, gender: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateHemoglobin} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Droplet className="w-4 h-4 mr-2" />
              تحليل الهيموغلوبين
            </Button>
            
            {hemoglobinCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">مستوى الهيموغلوبين: {hemoglobinCalc.result} g/dL</h4>
                <div className="space-y-1 text-sm">
                  {hemoglobinCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="glucose" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">تحليل سكر الدم</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>سكر الدم (mg/dL)</Label>
                <Input
                  type="number"
                  placeholder="مستوى الجلوكوز"
                  value={bloodSugarCalc.glucose}
                  onChange={(e) => setBloodSugarCalc({ ...bloodSugarCalc, glucose: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>نوع الفحص</Label>
                <select
                  value={bloodSugarCalc.testType}
                  onChange={(e) => setBloodSugarCalc({ ...bloodSugarCalc, testType: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="fasting">فحص الصيام</option>
                  <option value="random">فحص عشوائي</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateBloodSugar} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              تحليل سكر الدم
            </Button>
            
            {bloodSugarCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">سكر الدم: {bloodSugarCalc.result} mg/dL</h4>
                <div className="space-y-1 text-sm">
                  {bloodSugarCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="oxygen" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">تشبع الأوكسجين في الدم</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تشبع الأوكسجين (%)</Label>
                <Input
                  type="number"
                  placeholder="SpO₂"
                  value={oxygenSaturationCalc.spo2}
                  onChange={(e) => setOxygenSaturationCalc({ ...oxygenSaturationCalc, spo2: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الارتفاع (متر)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={oxygenSaturationCalc.altitude}
                  onChange={(e) => setOxygenSaturationCalc({ ...oxygenSaturationCalc, altitude: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateOxygenSaturation} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Activity className="w-4 h-4 mr-2" />
              تحليل تشبع الأوكسجين
            </Button>
            
            {oxygenSaturationCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">تشبع الأوكسجين: {oxygenSaturationCalc.result}%</h4>
                <div className="space-y-1 text-sm">
                  {oxygenSaturationCalc.steps.map((step, index) => (
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

export default BloodAnalysisCalculations;
