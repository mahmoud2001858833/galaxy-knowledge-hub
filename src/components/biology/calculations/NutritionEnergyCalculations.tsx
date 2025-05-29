
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const NutritionEnergyCalculations = () => {
  const [calorieCalc, setCalorieCalc] = useState({
    carbs: '',
    proteins: '',
    fats: '',
    alcohol: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [atpCalc, setAtpCalc] = useState({
    glucose: '',
    respirationType: 'aerobic',
    result: null as number | null,
    steps: [] as string[]
  });

  const [cellularRespirationCalc, setCellularRespirationCalc] = useState({
    substrate: 'glucose',
    oxygenAvailable: 'yes',
    result: null as any,
    steps: [] as string[]
  });

  const calculateCalories = () => {
    const carbs = parseFloat(calorieCalc.carbs) || 0;
    const proteins = parseFloat(calorieCalc.proteins) || 0;
    const fats = parseFloat(calorieCalc.fats) || 0;
    const alcohol = parseFloat(calorieCalc.alcohol) || 0;
    
    // السعرات الحرارية لكل غرام
    const carbCalories = carbs * 4;    // 4 سعرة/غرام
    const proteinCalories = proteins * 4; // 4 سعرة/غرام
    const fatCalories = fats * 9;      // 9 سعرة/غرام
    const alcoholCalories = alcohol * 7; // 7 سعرة/غرام
    
    const totalCalories = carbCalories + proteinCalories + fatCalories + alcoholCalories;
    
    // النسب المئوية
    const carbPercent = totalCalories > 0 ? (carbCalories / totalCalories) * 100 : 0;
    const proteinPercent = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const fatPercent = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
    const alcoholPercent = totalCalories > 0 ? (alcoholCalories / totalCalories) * 100 : 0;

    const steps = [
      `المعطى: كربوهيدرات = ${carbs}غ، بروتين = ${proteins}غ، دهون = ${fats}غ${alcohol > 0 ? `، كحول = ${alcohol}غ` : ''}`,
      ``,
      `🔥 السعرات الحرارية لكل مجموعة غذائية:`,
      `• الكربوهيدرات: 4 سعرة حرارية/غرام`,
      `• البروتين: 4 سعرة حرارية/غرام`,
      `• الدهون: 9 سعرة حرارية/غرام`,
      alcohol > 0 ? `• الكحول: 7 سعرة حرارية/غرام` : '',
      ``,
      `📊 الحسابات:`,
      `سعرات الكربوهيدرات = ${carbs} × 4 = ${carbCalories} سعرة`,
      `سعرات البروتين = ${proteins} × 4 = ${proteinCalories} سعرة`,
      `سعرات الدهون = ${fats} × 9 = ${fatCalories} سعرة`,
      alcohol > 0 ? `سعرات الكحول = ${alcohol} × 7 = ${alcoholCalories} سعرة` : '',
      ``,
      `إجمالي السعرات = ${totalCalories.toFixed(1)} سعرة حرارية`,
      ``,
      `📈 التوزيع النسبي:`,
      `• كربوهيدرات: ${carbPercent.toFixed(1)}% (الموصى به: 45-65%)`,
      `• بروتين: ${proteinPercent.toFixed(1)}% (الموصى به: 10-35%)`,
      `• دهون: ${fatPercent.toFixed(1)}% (الموصى به: 20-35%)`,
      alcohol > 0 ? `• كحول: ${alcoholPercent.toFixed(1)}%` : '',
      ``,
      `💡 تقييم التوازن الغذائي:`,
      carbPercent >= 45 && carbPercent <= 65 ? '✅ كربوهيدرات متوازنة' : '⚠️ كربوهيدرات غير متوازنة',
      proteinPercent >= 10 && proteinPercent <= 35 ? '✅ بروتين متوازن' : '⚠️ بروتين غير متوازن',
      fatPercent >= 20 && fatPercent <= 35 ? '✅ دهون متوازنة' : '⚠️ دهون غير متوازنة'
    ].filter(step => step !== '');
    
    setCalorieCalc({ ...calorieCalc, result: totalCalories, steps });
  };

  const calculateATP = () => {
    const glucoseMoles = parseFloat(atpCalc.glucose);
    
    if (isNaN(glucoseMoles)) return;
    
    let atpYield = 0;
    let processDescription = '';
    
    if (atpCalc.respirationType === 'aerobic') {
      atpYield = glucoseMoles * 32; // تقريباً 32 ATP لكل جزيء جلوكوز في التنفس الهوائي
      processDescription = 'التنفس الهوائي (مع الأوكسجين)';
    } else {
      atpYield = glucoseMoles * 2; // 2 ATP فقط في التخمر
      processDescription = 'التخمر (بدون أوكسجين)';
    }
    
    const energyKJ = atpYield * 30.5; // كل ATP يحرر حوالي 30.5 kJ من الطاقة

    const steps = [
      `المعطى: عدد جزيئات الجلوكوز = ${glucoseMoles}، نوع التنفس = ${processDescription}`,
      ``,
      `⚡ معادلات التنفس الخلوي:`,
      atpCalc.respirationType === 'aerobic' 
        ? `التنفس الهوائي: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 32 ATP`
        : `التخمر: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2 ATP`,
      ``,
      `🧮 حساب إنتاج ATP:`,
      atpCalc.respirationType === 'aerobic'
        ? `إنتاج ATP = عدد جزيئات الجلوكوز × 32`
        : `إنتاج ATP = عدد جزيئات الجلوكوز × 2`,
      `إنتاج ATP = ${glucoseMoles} × ${atpCalc.respirationType === 'aerobic' ? '32' : '2'} = ${atpYield} جزيء ATP`,
      ``,
      `💥 حساب الطاقة المحررة:`,
      `الطاقة = عدد جزيئات ATP × 30.5 kJ/mol`,
      `الطاقة = ${atpYield} × 30.5 = ${energyKJ.toFixed(1)} kJ`,
      ``,
      `📊 مقارنة الكفاءة:`,
      `• التنفس الهوائي: كفاءة عالية (32 ATP)`,
      `• التخمر: كفاءة منخفضة (2 ATP فقط)`,
      `• نسبة الكفاءة: ${atpCalc.respirationType === 'aerobic' ? '16' : '1'} مرة`,
      ``,
      `🔬 مراحل التنفس الهوائي:`,
      `• التحلل السكري: 2 ATP`,
      `• دورة كريبس: 2 ATP`,
      `• السلسلة التنفسية: 28 ATP`,
      `• المجموع: 32 ATP`,
      atpCalc.respirationType === 'aerobic' ? '✅ كفاءة طاقة عالية' : '⚠️ كفاءة طاقة منخفضة'
    ];
    
    setAtpCalc({ ...atpCalc, result: atpYield, steps });
  };

  const calculateCellularRespiration = () => {
    let equation = '';
    let products = '';
    let efficiency = '';
    let location = '';
    
    if (cellularRespirationCalc.substrate === 'glucose' && cellularRespirationCalc.oxygenAvailable === 'yes') {
      equation = 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 32 ATP';
      products = '6 جزيء CO₂ + 6 جزيء H₂O + 32 جزيء ATP';
      efficiency = 'كفاءة عالية (32 ATP)';
      location = 'السيتوبلازم + الميتوكوندريا';
    } else if (cellularRespirationCalc.substrate === 'glucose' && cellularRespirationCalc.oxygenAvailable === 'no') {
      equation = 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2 ATP';
      products = '2 جزيء إيثانول + 2 جزيء CO₂ + 2 جزيء ATP';
      efficiency = 'كفاءة منخفضة (2 ATP)';
      location = 'السيتوبلازم فقط';
    } else if (cellularRespirationCalc.substrate === 'fats') {
      equation = 'C₁₆H₃₂O₂ + 23O₂ → 16CO₂ + 16H₂O + 129 ATP';
      products = '16 جزيء CO₂ + 16 جزيء H₂O + 129 جزيء ATP';
      efficiency = 'كفاءة عالية جداً (129 ATP)';
      location = 'الميتوكوندريا';
    } else {
      equation = 'البروتين → أحماض أمينية → دورة كريبس + ATP';
      products = 'CO₂ + H₂O + NH₃ + ATP متغير';
      efficiency = 'كفاءة متوسطة';
      location = 'الميتوكوندريا + الكبد';
    }

    const steps = [
      `نوع المادة: ${
        cellularRespirationCalc.substrate === 'glucose' ? 'جلوكوز' :
        cellularRespirationCalc.substrate === 'fats' ? 'دهون' : 'بروتين'
      }، الأوكسجين متوفر: ${cellularRespirationCalc.oxygenAvailable === 'yes' ? 'نعم' : 'لا'}`,
      ``,
      `⚗️ معادلة التفاعل:`,
      equation,
      ``,
      `📦 النواتج:`,
      products,
      ``,
      `⚡ كفاءة الطاقة: ${efficiency}`,
      `📍 مكان التفاعل: ${location}`,
      ``,
      `🔄 مسارات الطاقة:`,
      cellularRespirationCalc.substrate === 'glucose' && cellularRespirationCalc.oxygenAvailable === 'yes' 
        ? [
          `1. التحلل السكري (السيتوبلازم): جلوكوز → 2 بيروفات + 2 ATP`,
          `2. دورة كريبس (الميتوكوندريا): بيروفات → CO₂ + 2 ATP`,
          `3. السلسلة التنفسية (الميتوكوندريا): NADH + FADH₂ → 28 ATP`
        ].join('\n• ')
        : cellularRespirationCalc.substrate === 'glucose' && cellularRespirationCalc.oxygenAvailable === 'no'
        ? `1. التحلل السكري: جلوكوز → 2 بيروفات + 2 ATP\n• 2. التخمر: بيروفات → إيثانول + CO₂`
        : cellularRespirationCalc.substrate === 'fats'
        ? `1. تكسير الدهون: دهون → أحماض دهنية + جليسرول\n• 2. أكسدة بيتا: أحماض دهنية → أسيتيل CoA\n• 3. دورة كريبس: أسيتيل CoA → CO₂ + ATP + NADH\n• 4. السلسلة التنفسية: NADH → ATP`
        : `1. تكسير البروتين: بروتين → أحماض أمينية\n• 2. نزع الأمين: أحماض أمينية → كيتو أحماض + NH₃\n• 3. دورة كريبس: كيتو أحماض → CO₂ + ATP`,
      ``,
      `💡 فوائد حيوية:`,
      cellularRespirationCalc.substrate === 'glucose' ? 'مصدر سريع للطاقة - وقود المخ' :
      cellularRespirationCalc.substrate === 'fats' ? 'مخزن طاقة طويل المدى - أعلى كفاءة' :
      'مصدر طاقة احتياطي - بناء الأنسجة'
    ];
    
    setCellularRespirationCalc({ 
      ...cellularRespirationCalc, 
      result: { equation, products, efficiency, location }, 
      steps 
    });
  };

  return (
    <Tabs defaultValue="calories" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="calories">السعرات الحرارية</TabsTrigger>
        <TabsTrigger value="atp">إنتاج ATP</TabsTrigger>
        <TabsTrigger value="respiration">التنفس الخلوي</TabsTrigger>
      </TabsList>

      <TabsContent value="calories" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب السعرات الحرارية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكربوهيدرات (غرام)</Label>
                <Input
                  type="number"
                  placeholder="كمية الكربوهيدرات"
                  value={calorieCalc.carbs}
                  onChange={(e) => setCalorieCalc({ ...calorieCalc, carbs: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>البروتين (غرام)</Label>
                <Input
                  type="number"
                  placeholder="كمية البروتين"
                  value={calorieCalc.proteins}
                  onChange={(e) => setCalorieCalc({ ...calorieCalc, proteins: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الدهون (غرام)</Label>
                <Input
                  type="number"
                  placeholder="كمية الدهون"
                  value={calorieCalc.fats}
                  onChange={(e) => setCalorieCalc({ ...calorieCalc, fats: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الكحول (غرام) - اختياري</Label>
                <Input
                  type="number"
                  placeholder="كمية الكحول"
                  value={calorieCalc.alcohol}
                  onChange={(e) => setCalorieCalc({ ...calorieCalc, alcohol: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateCalories} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Flame className="w-4 h-4 mr-2" />
              احسب السعرات الحرارية
            </Button>
            
            {calorieCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">إجمالي السعرات: {calorieCalc.result?.toFixed(1)} سعرة حرارية</h4>
                <div className="space-y-1 text-sm">
                  {calorieCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="atp" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب إنتاج ATP</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>عدد جزيئات الجلوكوز</Label>
                <Input
                  type="number"
                  placeholder="عدد الجزيئات"
                  value={atpCalc.glucose}
                  onChange={(e) => setAtpCalc({ ...atpCalc, glucose: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>نوع التنفس</Label>
                <select
                  value={atpCalc.respirationType}
                  onChange={(e) => setAtpCalc({ ...atpCalc, respirationType: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="aerobic">هوائي (مع أوكسجين)</option>
                  <option value="anaerobic">لاهوائي (تخمر)</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateATP} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Zap className="w-4 h-4 mr-2" />
              احسب إنتاج ATP
            </Button>
            
            {atpCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">إنتاج ATP: {atpCalc.result} جزيء</h4>
                <div className="space-y-1 text-sm">
                  {atpCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="respiration" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">معادلات التنفس الخلوي</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع المادة الغذائية</Label>
                <select
                  value={cellularRespirationCalc.substrate}
                  onChange={(e) => setCellularRespirationCalc({ ...cellularRespirationCalc, substrate: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="glucose">جلوكوز</option>
                  <option value="fats">دهون</option>
                  <option value="proteins">بروتين</option>
                </select>
              </div>
              <div>
                <Label>توفر الأوكسجين</Label>
                <select
                  value={cellularRespirationCalc.oxygenAvailable}
                  onChange={(e) => setCellularRespirationCalc({ ...cellularRespirationCalc, oxygenAvailable: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="yes">متوفر</option>
                  <option value="no">غير متوفر</option>
                </select>
              </div>
            </div>
            <Button onClick={calculateCellularRespiration} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              اعرض معادلة التنفس
            </Button>
            
            {cellularRespirationCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">معادلة التنفس الخلوي</h4>
                <div className="space-y-1 text-sm">
                  {cellularRespirationCalc.steps.map((step, index) => (
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

export default NutritionEnergyCalculations;
