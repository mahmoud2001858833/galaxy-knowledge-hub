
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const KinematicsCalculations = () => {
  const [velocityCalc, setVelocityCalc] = useState({
    distance: '',
    time: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [accelerationCalc, setAccelerationCalc] = useState({
    initialVelocity: '',
    finalVelocity: '',
    time: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [freeFallCalc, setFreeFallCalc] = useState({
    height: '',
    time: '',
    calculateWhat: 'time',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateVelocity = () => {
    const d = parseFloat(velocityCalc.distance);
    const t = parseFloat(velocityCalc.time);
    
    if (isNaN(d) || isNaN(t) || t === 0) return;
    
    const v = d / t;
    const steps = [
      `المعطى: المسافة = ${d} م، الزمن = ${t} ث`,
      `القانون المستخدم: السرعة = المسافة ÷ الزمن`,
      `V = d / t`,
      `V = ${d} / ${t}`,
      `السرعة = ${v.toFixed(2)} م/ث`
    ];
    
    setVelocityCalc({ ...velocityCalc, result: v, steps });
  };

  const calculateAcceleration = () => {
    const v0 = parseFloat(accelerationCalc.initialVelocity);
    const v = parseFloat(accelerationCalc.finalVelocity);
    const t = parseFloat(accelerationCalc.time);
    
    if (isNaN(v0) || isNaN(v) || isNaN(t) || t === 0) return;
    
    const a = (v - v0) / t;
    const steps = [
      `المعطى: السرعة الابتدائية = ${v0} م/ث، السرعة النهائية = ${v} م/ث، الزمن = ${t} ث`,
      `القانون المستخدم: التسارع = (السرعة النهائية - السرعة الابتدائية) ÷ الزمن`,
      `a = (v - v₀) / t`,
      `a = (${v} - ${v0}) / ${t}`,
      `a = ${(v - v0).toFixed(2)} / ${t}`,
      `التسارع = ${a.toFixed(2)} م/ث²`
    ];
    
    setAccelerationCalc({ ...accelerationCalc, result: a, steps });
  };

  const calculateFreeFall = () => {
    const h = parseFloat(freeFallCalc.height);
    const g = 9.81;
    
    if (isNaN(h)) return;
    
    if (freeFallCalc.calculateWhat === 'time') {
      const t = Math.sqrt(2 * h / g);
      const steps = [
        `المعطى: الارتفاع = ${h} م`,
        `تسارع الجاذبية = 9.81 م/ث²`,
        `القانون المستخدم: h = ½gt²`,
        `${h} = ½ × 9.81 × t²`,
        `t² = (2 × ${h}) / 9.81`,
        `t² = ${(2 * h / g).toFixed(2)}`,
        `t = √${(2 * h / g).toFixed(2)}`,
        `الزمن = ${t.toFixed(2)} ثانية`
      ];
      setFreeFallCalc({ ...freeFallCalc, result: t, steps });
    } else {
      const v = Math.sqrt(2 * g * h);
      const steps = [
        `المعطى: الارتفاع = ${h} م`,
        `تسارع الجاذبية = 9.81 م/ث²`,
        `القانون المستخدم: v² = 2gh`,
        `v² = 2 × 9.81 × ${h}`,
        `v² = ${(2 * g * h).toFixed(2)}`,
        `v = √${(2 * g * h).toFixed(2)}`,
        `السرعة النهائية = ${v.toFixed(2)} م/ث`
      ];
      setFreeFallCalc({ ...freeFallCalc, result: v, steps });
    }
  };

  return (
    <Tabs defaultValue="velocity" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="velocity">السرعة</TabsTrigger>
        <TabsTrigger value="acceleration">التسارع</TabsTrigger>
        <TabsTrigger value="freefall">السقوط الحر</TabsTrigger>
      </TabsList>

      <TabsContent value="velocity" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب السرعة المتوسطة</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المسافة (م)</Label>
                <Input
                  type="number"
                  placeholder="أدخل المسافة"
                  value={velocityCalc.distance}
                  onChange={(e) => setVelocityCalc({ ...velocityCalc, distance: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الزمن (ث)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الزمن"
                  value={velocityCalc.time}
                  onChange={(e) => setVelocityCalc({ ...velocityCalc, time: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateVelocity} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب السرعة
            </Button>
            
            {velocityCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {velocityCalc.result.toFixed(2)} م/ث</h4>
                <div className="space-y-1 text-sm">
                  {velocityCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="acceleration" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب التسارع</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>السرعة الابتدائية (م/ث)</Label>
                <Input
                  type="number"
                  placeholder="v₀"
                  value={accelerationCalc.initialVelocity}
                  onChange={(e) => setAccelerationCalc({ ...accelerationCalc, initialVelocity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>السرعة النهائية (م/ث)</Label>
                <Input
                  type="number"
                  placeholder="v"
                  value={accelerationCalc.finalVelocity}
                  onChange={(e) => setAccelerationCalc({ ...accelerationCalc, finalVelocity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الزمن (ث)</Label>
                <Input
                  type="number"
                  placeholder="t"
                  value={accelerationCalc.time}
                  onChange={(e) => setAccelerationCalc({ ...accelerationCalc, time: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateAcceleration} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب التسارع
            </Button>
            
            {accelerationCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {accelerationCalc.result.toFixed(2)} م/ث²</h4>
                <div className="space-y-1 text-sm">
                  {accelerationCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="freefall" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حسابات السقوط الحر</h3>
            <div className="space-y-4">
              <div>
                <Label>الارتفاع (م)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الارتفاع"
                  value={freeFallCalc.height}
                  onChange={(e) => setFreeFallCalc({ ...freeFallCalc, height: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>احسب:</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="time"
                      checked={freeFallCalc.calculateWhat === 'time'}
                      onChange={(e) => setFreeFallCalc({ ...freeFallCalc, calculateWhat: e.target.value })}
                    />
                    زمن السقوط
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="velocity"
                      checked={freeFallCalc.calculateWhat === 'velocity'}
                      onChange={(e) => setFreeFallCalc({ ...freeFallCalc, calculateWhat: e.target.value })}
                    />
                    السرعة النهائية
                  </label>
                </div>
              </div>
            </div>
            <Button onClick={calculateFreeFall} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب
            </Button>
            
            {freeFallCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">
                  النتيجة: {freeFallCalc.result.toFixed(2)} {freeFallCalc.calculateWhat === 'time' ? 'ثانية' : 'م/ث'}
                </h4>
                <div className="space-y-1 text-sm">
                  {freeFallCalc.steps.map((step, index) => (
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

export default KinematicsCalculations;
