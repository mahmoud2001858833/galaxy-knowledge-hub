
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const ForceCalculations = () => {
  const [forceCalc, setForceCalc] = useState({
    mass: '',
    acceleration: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [weightCalc, setWeightCalc] = useState({
    mass: '',
    gravity: '9.81',
    result: null as number | null,
    steps: [] as string[]
  });

  const [momentumCalc, setMomentumCalc] = useState({
    mass: '',
    velocity: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateForce = () => {
    const m = parseFloat(forceCalc.mass);
    const a = parseFloat(forceCalc.acceleration);
    
    if (isNaN(m) || isNaN(a)) return;
    
    const F = m * a;
    const steps = [
      `المعطى: الكتلة = ${m} كغ، التسارع = ${a} م/ث²`,
      `القانون المستخدم: القوة = الكتلة × التسارع (قانون نيوتن الثاني)`,
      `F = m × a`,
      `F = ${m} × ${a}`,
      `القوة = ${F.toFixed(2)} نيوتن`
    ];
    
    setForceCalc({ ...forceCalc, result: F, steps });
  };

  const calculateWeight = () => {
    const m = parseFloat(weightCalc.mass);
    const g = parseFloat(weightCalc.gravity);
    
    if (isNaN(m) || isNaN(g)) return;
    
    const W = m * g;
    const steps = [
      `المعطى: الكتلة = ${m} كغ، تسارع الجاذبية = ${g} م/ث²`,
      `القانون المستخدم: الوزن = الكتلة × تسارع الجاذبية`,
      `W = m × g`,
      `W = ${m} × ${g}`,
      `الوزن = ${W.toFixed(2)} نيوتن`
    ];
    
    setWeightCalc({ ...weightCalc, result: W, steps });
  };

  const calculateMomentum = () => {
    const m = parseFloat(momentumCalc.mass);
    const v = parseFloat(momentumCalc.velocity);
    
    if (isNaN(m) || isNaN(v)) return;
    
    const p = m * v;
    const steps = [
      `المعطى: الكتلة = ${m} كغ، السرعة = ${v} م/ث`,
      `القانون المستخدم: الزخم = الكتلة × السرعة`,
      `p = m × v`,
      `p = ${m} × ${v}`,
      `الزخم = ${p.toFixed(2)} كغ⋅م/ث`
    ];
    
    setMomentumCalc({ ...momentumCalc, result: p, steps });
  };

  return (
    <Tabs defaultValue="force" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="force">القوة</TabsTrigger>
        <TabsTrigger value="weight">الوزن</TabsTrigger>
        <TabsTrigger value="momentum">الزخم</TabsTrigger>
      </TabsList>

      <TabsContent value="force" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب القوة (قانون نيوتن الثاني)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={forceCalc.mass}
                  onChange={(e) => setForceCalc({ ...forceCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>التسارع (م/ث²)</Label>
                <Input
                  type="number"
                  placeholder="أدخل التسارع"
                  value={forceCalc.acceleration}
                  onChange={(e) => setForceCalc({ ...forceCalc, acceleration: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateForce} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب القوة
            </Button>
            
            {forceCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {forceCalc.result.toFixed(2)} نيوتن</h4>
                <div className="space-y-1 text-sm">
                  {forceCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="weight" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الوزن</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={weightCalc.mass}
                  onChange={(e) => setWeightCalc({ ...weightCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>تسارع الجاذبية (م/ث²)</Label>
                <Input
                  type="number"
                  placeholder="9.81"
                  value={weightCalc.gravity}
                  onChange={(e) => setWeightCalc({ ...weightCalc, gravity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateWeight} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الوزن
            </Button>
            
            {weightCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {weightCalc.result.toFixed(2)} نيوتن</h4>
                <div className="space-y-1 text-sm">
                  {weightCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="momentum" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الزخم</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={momentumCalc.mass}
                  onChange={(e) => setMomentumCalc({ ...momentumCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>السرعة (م/ث)</Label>
                <Input
                  type="number"
                  placeholder="أدخل السرعة"
                  value={momentumCalc.velocity}
                  onChange={(e) => setMomentumCalc({ ...momentumCalc, velocity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateMomentum} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الزخم
            </Button>
            
            {momentumCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {momentumCalc.result.toFixed(2)} كغ⋅م/ث</h4>
                <div className="space-y-1 text-sm">
                  {momentumCalc.steps.map((step, index) => (
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

export default ForceCalculations;
