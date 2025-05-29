
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const ModernPhysicsCalculations = () => {
  const [einsteinCalc, setEinsteinCalc] = useState({
    mass: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [photoelectricCalc, setPhotoelectricCalc] = useState({
    frequency: '',
    workFunction: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [radioactiveCalc, setRadioactiveCalc] = useState({
    initialAmount: '',
    halfLife: '',
    time: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateMassEnergy = () => {
    const m = parseFloat(einsteinCalc.mass);
    
    if (isNaN(m)) return;
    
    const c = 299792458; // سرعة الضوء م/ث
    const E = m * c * c;
    const steps = [
      `المعطى: الكتلة = ${m} كغ`,
      `سرعة الضوء = 299,792,458 م/ث`,
      `القانون المستخدم: معادلة أينشتاين للكتلة والطاقة - E = mc²`,
      `E = ${m} × (299,792,458)²`,
      `E = ${m} × ${(c * c).toExponential(2)}`,
      `الطاقة = ${E.toExponential(2)} جول`
    ];
    
    setEinsteinCalc({ ...einsteinCalc, result: E, steps });
  };

  const calculatePhotoelectric = () => {
    const f = parseFloat(photoelectricCalc.frequency);
    const phi = parseFloat(photoelectricCalc.workFunction);
    
    if (isNaN(f) || isNaN(phi)) return;
    
    const h = 6.626e-34; // ثابت بلانك
    const photonEnergy = h * f;
    const kineticEnergy = photonEnergy - phi;
    
    const steps = [
      `المعطى: التردد = ${f} هرتز، دالة الشغل = ${phi} جول`,
      `ثابت بلانك = 6.626 × 10⁻³⁴ J⋅s`,
      `القانون المستخدم: معادلة أينشتاين للتأثير الكهروضوئي`,
      `طاقة الفوتون = h × f`,
      `طاقة الفوتون = 6.626 × 10⁻³⁴ × ${f}`,
      `طاقة الفوتون = ${photonEnergy.toExponential(2)} جول`,
      ``,
      `الطاقة الحركية للإلكترون = طاقة الفوتون - دالة الشغل`,
      `KE = ${photonEnergy.toExponential(2)} - ${phi}`,
      kineticEnergy >= 0 
        ? `الطاقة الحركية = ${kineticEnergy.toExponential(2)} جول`
        : `⚠️ لا يحدث تأثير كهروضوئي! طاقة الفوتون أقل من دالة الشغل`
    ];
    
    setPhotoelectricCalc({ ...photoelectricCalc, result: kineticEnergy >= 0 ? kineticEnergy : null, steps });
  };

  const calculateRadioactiveDecay = () => {
    const N0 = parseFloat(radioactiveCalc.initialAmount);
    const t_half = parseFloat(radioactiveCalc.halfLife);
    const t = parseFloat(radioactiveCalc.time);
    
    if (isNaN(N0) || isNaN(t_half) || isNaN(t) || t_half === 0) return;
    
    const lambda = Math.ln(2) / t_half; // ثابت التحلل
    const N = N0 * Math.exp(-lambda * t);
    const percentageRemaining = (N / N0) * 100;
    const percentageDecayed = 100 - percentageRemaining;
    
    const steps = [
      `المعطى: الكمية الابتدائية = ${N0}، عمر النصف = ${t_half} سنة، الزمن = ${t} سنة`,
      `القانون المستخدم: قانون التحلل الإشعاعي - N = N₀e^(-λt)`,
      `ثابت التحلل λ = ln(2) / t₁/₂`,
      `λ = 0.693 / ${t_half}`,
      `λ = ${lambda.toFixed(6)} سنة⁻¹`,
      ``,
      `N = ${N0} × e^(-${lambda.toFixed(6)} × ${t})`,
      `N = ${N0} × e^(-${(lambda * t).toFixed(3)})`,
      `N = ${N0} × ${Math.exp(-lambda * t).toFixed(6)}`,
      `الكمية المتبقية = ${N.toFixed(2)}`,
      ``,
      `النسبة المتبقية = ${percentageRemaining.toFixed(2)}%`,
      `النسبة المتحللة = ${percentageDecayed.toFixed(2)}%`
    ];
    
    setRadioactiveCalc({ ...radioactiveCalc, result: N, steps });
  };

  return (
    <Tabs defaultValue="einstein" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="einstein">معادلة أينشتاين</TabsTrigger>
        <TabsTrigger value="photoelectric">التأثير الكهروضوئي</TabsTrigger>
        <TabsTrigger value="radioactive">التحلل الإشعاعي</TabsTrigger>
      </TabsList>

      <TabsContent value="einstein" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">معادلة أينشتاين للكتلة والطاقة</h3>
            <div className="space-y-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={einsteinCalc.mass}
                  onChange={(e) => setEinsteinCalc({ ...einsteinCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateMassEnergy} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الطاقة (E = mc²)
            </Button>
            
            {einsteinCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {einsteinCalc.result.toExponential(2)} جول</h4>
                <div className="space-y-1 text-sm">
                  {einsteinCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="photoelectric" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">التأثير الكهروضوئي</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تردد الضوء (هرتز)</Label>
                <Input
                  type="number"
                  placeholder="f"
                  value={photoelectricCalc.frequency}
                  onChange={(e) => setPhotoelectricCalc({ ...photoelectricCalc, frequency: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>دالة الشغل (جول)</Label>
                <Input
                  type="number"
                  placeholder="φ"
                  value={photoelectricCalc.workFunction}
                  onChange={(e) => setPhotoelectricCalc({ ...photoelectricCalc, workFunction: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculatePhotoelectric} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الطاقة الحركية للإلكترون
            </Button>
            
            {photoelectricCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${
                  photoelectricCalc.result !== null 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-red-500/20 border-red-500/30'
                }`}
              >
                {photoelectricCalc.result !== null ? (
                  <h4 className="font-bold text-green-400 mb-2">النتيجة: {photoelectricCalc.result.toExponential(2)} جول</h4>
                ) : (
                  <h4 className="font-bold text-red-400 mb-2">لا يحدث تأثير كهروضوئي</h4>
                )}
                <div className="space-y-1 text-sm">
                  {photoelectricCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="radioactive" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">قانون التحلل الإشعاعي</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الكمية الابتدائية</Label>
                <Input
                  type="number"
                  placeholder="N₀"
                  value={radioactiveCalc.initialAmount}
                  onChange={(e) => setRadioactiveCalc({ ...radioactiveCalc, initialAmount: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>عمر النصف (سنة)</Label>
                <Input
                  type="number"
                  placeholder="t₁/₂"
                  value={radioactiveCalc.halfLife}
                  onChange={(e) => setRadioactiveCalc({ ...radioactiveCalc, halfLife: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الزمن (سنة)</Label>
                <Input
                  type="number"
                  placeholder="t"
                  value={radioactiveCalc.time}
                  onChange={(e) => setRadioactiveCalc({ ...radioactiveCalc, time: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateRadioactiveDecay} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الكمية المتبقية
            </Button>
            
            {radioactiveCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {radioactiveCalc.result.toFixed(2)}</h4>
                <div className="space-y-1 text-sm">
                  {radioactiveCalc.steps.map((step, index) => (
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

export default ModernPhysicsCalculations;
