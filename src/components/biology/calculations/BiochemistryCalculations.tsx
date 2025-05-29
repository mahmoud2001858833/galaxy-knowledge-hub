
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Brain, TestTube } from 'lucide-react';
import { motion } from 'framer-motion';

const BiochemistryCalculations = () => {
  const [enzymeCalc, setEnzymeCalc] = useState({
    substrateConc: '',
    reactionTime: '',
    productFormed: '',
    enzymeAmount: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [concentrationCalc, setConcentrationCalc] = useState({
    mass: '',
    volume: '',
    molecularWeight: '',
    result: null as any,
    steps: [] as string[]
  });

  const calculateEnzymeActivity = () => {
    const substrate = parseFloat(enzymeCalc.substrateConc);
    const time = parseFloat(enzymeCalc.reactionTime);
    const product = parseFloat(enzymeCalc.productFormed);
    const enzyme = parseFloat(enzymeCalc.enzymeAmount);
    
    if (isNaN(substrate) || isNaN(time) || isNaN(product) || isNaN(enzyme) || time === 0 || enzyme === 0) return;
    
    // حساب النشاط الإنزيمي
    const activity = product / (time * enzyme); // وحدات النشاط/مغ إنزيم
    const specificActivity = activity; // النشاط النوعي
    const turnoverNumber = (product / time) / (enzyme / 1000); // عدد الدوران
    
    // كفاءة التحويل
    const conversionEfficiency = (product / substrate) * 100;

    const steps = [
      `المعطى: تركيز المادة الأساس = ${substrate} mM، الزمن = ${time} دقيقة، المنتج = ${product} mM، كمية الإنزيم = ${enzyme} مغ`,
      ``,
      `🧪 حسابات النشاط الإنزيمي:`,
      `النشاط الإنزيمي = المنتج المتكون ÷ (الزمن × كمية الإنزيم)`,
      `النشاط الإنزيمي = ${product} ÷ (${time} × ${enzyme})`,
      `النشاط الإنزيمي = ${activity.toFixed(4)} وحدة/مغ إنزيم`,
      ``,
      `عدد الدوران (Turnover Number):`,
      `عدد الدوران = (المنتج ÷ الزمن) ÷ (الإنزيم بالمول)`,
      `عدد الدوران = ${turnoverNumber.toFixed(2)} ثانية⁻¹`,
      ``,
      `كفاءة التحويل = (المنتج ÷ المادة الأساس) × 100`,
      `كفاءة التحويل = ${conversionEfficiency.toFixed(1)}%`,
      ``,
      `📊 تفسير النتائج:`,
      activity > 1 ? '✅ نشاط إنزيمي عالي' : activity > 0.1 ? '⚠️ نشاط إنزيمي متوسط' : '❌ نشاط إنزيمي منخفض',
      conversionEfficiency > 80 ? 'كفاءة تحويل ممتازة' : conversionEfficiency > 50 ? 'كفاءة تحويل جيدة' : 'كفاءة تحويل منخفضة',
      ``,
      `💡 العوامل المؤثرة:`,
      `• درجة الحرارة والرقم الهيدروجيني`,
      `• تركيز المادة الأساس والمثبطات`,
      `• وجود العوامل المساعدة والمعادن`
    ];
    
    setEnzymeCalc({ ...enzymeCalc, result: activity, steps });
  };

  const calculateConcentration = () => {
    const mass = parseFloat(concentrationCalc.mass);
    const volume = parseFloat(concentrationCalc.volume);
    const mw = parseFloat(concentrationCalc.molecularWeight);
    
    if (isNaN(mass) || isNaN(volume) || volume === 0) return;
    
    // التركيز بالغرام/لتر
    const massConcentration = (mass / volume) * 1000; // mg/L إلى g/L
    
    let molarConcentration = null;
    if (!isNaN(mw) && mw > 0) {
      // التركيز المولاري (مول/لتر)
      molarConcentration = (mass / mw) / (volume / 1000); // M
    }

    const steps = [
      `المعطى: الكتلة = ${mass} مغ، الحجم = ${volume} مل${mw ? `، الوزن الجزيئي = ${mw} g/mol` : ''}`,
      ``,
      `📏 حسابات التركيز:`,
      `التركيز الكتلي = (الكتلة ÷ الحجم) × 1000`,
      `التركيز الكتلي = (${mass} ÷ ${volume}) × 1000 = ${massConcentration.toFixed(2)} mg/L`,
      `التركيز الكتلي = ${(massConcentration / 1000).toFixed(4)} g/L`,
      ``,
      molarConcentration !== null ? [
        `التركيز المولاري = (الكتلة بالغرام ÷ الوزن الجزيئي) ÷ (الحجم باللتر)`,
        `التركيز المولاري = (${(mass/1000).toFixed(4)} ÷ ${mw}) ÷ ${(volume/1000).toFixed(3)}`,
        `التركيز المولاري = ${molarConcentration.toFixed(6)} M`,
        `التركيز المولاري = ${(molarConcentration * 1000).toFixed(3)} mM`,
        `التركيز المولاري = ${(molarConcentration * 1000000).toFixed(1)} μM`
      ].join('\n• ') : 'للحصول على التركيز المولاري، أدخل الوزن الجزيئي',
      ``,
      `📋 وحدات التركيز الشائعة:`,
      `• mg/L (ميليغرام/لتر)`,
      `• g/L (غرام/لتر)`,
      `• M (مولاري - مول/لتر)`,
      `• mM (مليمولاري)`,
      `• μM (ميكرومولاري)`,
      `• ppm (جزء في المليون)`
    ];
    
    setConcentrationCalc({ 
      ...concentrationCalc, 
      result: { massConcentration, molarConcentration }, 
      steps 
    });
  };

  return (
    <Tabs defaultValue="enzyme" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="enzyme">النشاط الإنزيمي</TabsTrigger>
        <TabsTrigger value="concentration">التركيز</TabsTrigger>
      </TabsList>

      <TabsContent value="enzyme" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب النشاط الإنزيمي</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تركيز المادة الأساس (mM)</Label>
                <Input
                  type="number"
                  placeholder="تركيز Substrate"
                  value={enzymeCalc.substrateConc}
                  onChange={(e) => setEnzymeCalc({ ...enzymeCalc, substrateConc: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>زمن التفاعل (دقيقة)</Label>
                <Input
                  type="number"
                  placeholder="الزمن"
                  value={enzymeCalc.reactionTime}
                  onChange={(e) => setEnzymeCalc({ ...enzymeCalc, reactionTime: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>المنتج المتكون (mM)</Label>
                <Input
                  type="number"
                  placeholder="تركيز Product"
                  value={enzymeCalc.productFormed}
                  onChange={(e) => setEnzymeCalc({ ...enzymeCalc, productFormed: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>كمية الإنزيم (مغ)</Label>
                <Input
                  type="number"
                  placeholder="كمية الإنزيم"
                  value={enzymeCalc.enzymeAmount}
                  onChange={(e) => setEnzymeCalc({ ...enzymeCalc, enzymeAmount: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateEnzymeActivity} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Brain className="w-4 h-4 mr-2" />
              احسب النشاط الإنزيمي
            </Button>
            
            {enzymeCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النشاط الإنزيمي: {enzymeCalc.result?.toFixed(4)} وحدة/مغ</h4>
                <div className="space-y-1 text-sm">
                  {enzymeCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="concentration" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">حساب التركيز</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الكتلة (مغ)</Label>
                <Input
                  type="number"
                  placeholder="الكتلة"
                  value={concentrationCalc.mass}
                  onChange={(e) => setConcentrationCalc({ ...concentrationCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الحجم (مل)</Label>
                <Input
                  type="number"
                  placeholder="الحجم"
                  value={concentrationCalc.volume}
                  onChange={(e) => setConcentrationCalc({ ...concentrationCalc, volume: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الوزن الجزيئي (g/mol) - اختياري</Label>
                <Input
                  type="number"
                  placeholder="MW"
                  value={concentrationCalc.molecularWeight}
                  onChange={(e) => setConcentrationCalc({ ...concentrationCalc, molecularWeight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateConcentration} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <TestTube className="w-4 h-4 mr-2" />
              احسب التركيز
            </Button>
            
            {concentrationCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">
                  التركيز: {concentrationCalc.result?.massConcentration?.toFixed(2)} mg/L
                  {concentrationCalc.result?.molarConcentration && 
                    ` | ${(concentrationCalc.result.molarConcentration * 1000).toFixed(3)} mM`}
                </h4>
                <div className="space-y-1 text-sm">
                  {concentrationCalc.steps.map((step, index) => (
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

export default BiochemistryCalculations;
