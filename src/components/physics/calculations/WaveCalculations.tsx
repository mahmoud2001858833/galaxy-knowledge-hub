
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const WaveCalculations = () => {
  const [waveSpeedCalc, setWaveSpeedCalc] = useState({
    frequency: '',
    wavelength: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [soundCalc, setSoundCalc] = useState({
    distance: '',
    time: '',
    temperature: '20',
    result: null as number | null,
    steps: [] as string[]
  });

  const [lightCalc, setLightCalc] = useState({
    frequency: '',
    wavelength: '',
    calculate: 'wavelength',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateWaveSpeed = () => {
    const f = parseFloat(waveSpeedCalc.frequency);
    const lambda = parseFloat(waveSpeedCalc.wavelength);
    
    if (isNaN(f) || isNaN(lambda)) return;
    
    const v = f * lambda;
    const steps = [
      `المعطى: التردد = ${f} هرتز، الطول الموجي = ${lambda} م`,
      `القانون المستخدم: سرعة الموجة = التردد × الطول الموجي`,
      `v = f × λ`,
      `v = ${f} × ${lambda}`,
      `سرعة الموجة = ${v.toFixed(2)} م/ث`
    ];
    
    setWaveSpeedCalc({ ...waveSpeedCalc, result: v, steps });
  };

  const calculateSoundSpeed = () => {
    const d = parseFloat(soundCalc.distance);
    const t = parseFloat(soundCalc.time);
    const temp = parseFloat(soundCalc.temperature);
    
    if (isNaN(d) || isNaN(t) || t === 0) return;
    
    const v = d / t;
    const theoreticalSpeed = 331.4 + (0.6 * temp); // سرعة الصوت عند درجة حرارة معينة
    const steps = [
      `المعطى: المسافة = ${d} م، الزمن = ${t} ث، درجة الحرارة = ${temp}°س`,
      `حساب السرعة المقاسة: v = المسافة ÷ الزمن`,
      `v = ${d} / ${t}`,
      `السرعة المقاسة = ${v.toFixed(2)} م/ث`,
      ``,
      `السرعة النظرية للصوت عند ${temp}°س = 331.4 + (0.6 × ${temp})`,
      `السرعة النظرية = ${theoreticalSpeed.toFixed(2)} م/ث`,
      ``,
      `الفرق = ${Math.abs(v - theoreticalSpeed).toFixed(2)} م/ث`
    ];
    
    setSoundCalc({ ...soundCalc, result: v, steps });
  };

  const calculateLight = () => {
    const c = 299792458; // سرعة الضوء م/ث
    
    if (lightCalc.calculate === 'wavelength') {
      const f = parseFloat(lightCalc.frequency);
      if (isNaN(f) || f === 0) return;
      
      const lambda = c / f;
      const steps = [
        `المعطى: التردد = ${f} هرتز`,
        `سرعة الضوء = 299,792,458 م/ث`,
        `القانون المستخدم: الطول الموجي = سرعة الضوء ÷ التردد`,
        `λ = c / f`,
        `λ = 299,792,458 / ${f}`,
        `الطول الموجي = ${lambda.toExponential(2)} م`
      ];
      
      setLightCalc({ ...lightCalc, result: lambda, steps });
    } else {
      const lambda = parseFloat(lightCalc.wavelength);
      if (isNaN(lambda) || lambda === 0) return;
      
      const f = c / lambda;
      const steps = [
        `المعطى: الطول الموجي = ${lambda} م`,
        `سرعة الضوء = 299,792,458 م/ث`,
        `القانون المستخدم: التردد = سرعة الضوء ÷ الطول الموجي`,
        `f = c / λ`,
        `f = 299,792,458 / ${lambda}`,
        `التردد = ${f.toExponential(2)} هرتز`
      ];
      
      setLightCalc({ ...lightCalc, result: f, steps });
    }
  };

  return (
    <Tabs defaultValue="wave" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="wave">سرعة الموجة</TabsTrigger>
        <TabsTrigger value="sound">سرعة الصوت</TabsTrigger>
        <TabsTrigger value="light">موجات الضوء</TabsTrigger>
      </TabsList>

      <TabsContent value="wave" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب سرعة الموجة</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>التردد (هرتز)</Label>
                <Input
                  type="number"
                  placeholder="أدخل التردد"
                  value={waveSpeedCalc.frequency}
                  onChange={(e) => setWaveSpeedCalc({ ...waveSpeedCalc, frequency: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الطول الموجي (م)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الطول الموجي"
                  value={waveSpeedCalc.wavelength}
                  onChange={(e) => setWaveSpeedCalc({ ...waveSpeedCalc, wavelength: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateWaveSpeed} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب سرعة الموجة
            </Button>
            
            {waveSpeedCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {waveSpeedCalc.result.toFixed(2)} م/ث</h4>
                <div className="space-y-1 text-sm">
                  {waveSpeedCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sound" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب سرعة الصوت</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>المسافة (م)</Label>
                <Input
                  type="number"
                  placeholder="أدخل المسافة"
                  value={soundCalc.distance}
                  onChange={(e) => setSoundCalc({ ...soundCalc, distance: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الزمن (ث)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الزمن"
                  value={soundCalc.time}
                  onChange={(e) => setSoundCalc({ ...soundCalc, time: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>درجة الحرارة (°س)</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={soundCalc.temperature}
                  onChange={(e) => setSoundCalc({ ...soundCalc, temperature: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateSoundSpeed} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب سرعة الصوت
            </Button>
            
            {soundCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {soundCalc.result.toFixed(2)} م/ث</h4>
                <div className="space-y-1 text-sm">
                  {soundCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="light" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حسابات موجات الضوء</h3>
            <div className="space-y-4">
              <div>
                <Label>احسب:</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="wavelength"
                      checked={lightCalc.calculate === 'wavelength'}
                      onChange={(e) => setLightCalc({ ...lightCalc, calculate: e.target.value })}
                    />
                    الطول الموجي
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="frequency"
                      checked={lightCalc.calculate === 'frequency'}
                      onChange={(e) => setLightCalc({ ...lightCalc, calculate: e.target.value })}
                    />
                    التردد
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>التردد (هرتز)</Label>
                  <Input
                    type="number"
                    placeholder={lightCalc.calculate === 'frequency' ? 'المطلوب' : 'أدخل التردد'}
                    value={lightCalc.frequency}
                    onChange={(e) => setLightCalc({ ...lightCalc, frequency: e.target.value })}
                    disabled={lightCalc.calculate === 'frequency'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>الطول الموجي (م)</Label>
                  <Input
                    type="number"
                    placeholder={lightCalc.calculate === 'wavelength' ? 'المطلوب' : 'أدخل الطول الموجي'}
                    value={lightCalc.wavelength}
                    onChange={(e) => setLightCalc({ ...lightCalc, wavelength: e.target.value })}
                    disabled={lightCalc.calculate === 'wavelength'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
            </div>
            <Button onClick={calculateLight} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب
            </Button>
            
            {lightCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">
                  النتيجة: {lightCalc.result.toExponential(2)} {lightCalc.calculate === 'wavelength' ? 'م' : 'هرتز'}
                </h4>
                <div className="space-y-1 text-sm">
                  {lightCalc.steps.map((step, index) => (
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

export default WaveCalculations;
