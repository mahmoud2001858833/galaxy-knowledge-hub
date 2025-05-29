
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const EnergyCalculations = () => {
  const [kineticCalc, setKineticCalc] = useState({
    mass: '',
    velocity: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [potentialCalc, setPotentialCalc] = useState({
    mass: '',
    height: '',
    gravity: '9.81',
    result: null as number | null,
    steps: [] as string[]
  });

  const [workCalc, setWorkCalc] = useState({
    force: '',
    distance: '',
    angle: '0',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateKineticEnergy = () => {
    const m = parseFloat(kineticCalc.mass);
    const v = parseFloat(kineticCalc.velocity);
    
    if (isNaN(m) || isNaN(v)) return;
    
    const KE = 0.5 * m * v * v;
    const steps = [
      `المعطى: الكتلة = ${m} كغ، السرعة = ${v} م/ث`,
      `القانون المستخدم: الطاقة الحركية = ½ × الكتلة × السرعة²`,
      `KE = ½mv²`,
      `KE = ½ × ${m} × ${v}²`,
      `KE = ½ × ${m} × ${v * v}`,
      `KE = ${0.5 * m} × ${v * v}`,
      `الطاقة الحركية = ${KE.toFixed(2)} جول`
    ];
    
    setKineticCalc({ ...kineticCalc, result: KE, steps });
  };

  const calculatePotentialEnergy = () => {
    const m = parseFloat(potentialCalc.mass);
    const h = parseFloat(potentialCalc.height);
    const g = parseFloat(potentialCalc.gravity);
    
    if (isNaN(m) || isNaN(h) || isNaN(g)) return;
    
    const PE = m * g * h;
    const steps = [
      `المعطى: الكتلة = ${m} كغ، الارتفاع = ${h} م، تسارع الجاذبية = ${g} م/ث²`,
      `القانون المستخدم: الطاقة الجهدية = الكتلة × تسارع الجاذبية × الارتفاع`,
      `PE = mgh`,
      `PE = ${m} × ${g} × ${h}`,
      `الطاقة الجهدية = ${PE.toFixed(2)} جول`
    ];
    
    setPotentialCalc({ ...potentialCalc, result: PE, steps });
  };

  const calculateWork = () => {
    const F = parseFloat(workCalc.force);
    const d = parseFloat(workCalc.distance);
    const theta = parseFloat(workCalc.angle);
    
    if (isNaN(F) || isNaN(d) || isNaN(theta)) return;
    
    const thetaRad = (theta * Math.PI) / 180;
    const W = F * d * Math.cos(thetaRad);
    const steps = [
      `المعطى: القوة = ${F} نيوتن، المسافة = ${d} م، الزاوية = ${theta}°`,
      `القانون المستخدم: الشغل = القوة × المسافة × جتا(الزاوية)`,
      `W = F × d × cos(θ)`,
      `W = ${F} × ${d} × cos(${theta}°)`,
      `W = ${F} × ${d} × ${Math.cos(thetaRad).toFixed(3)}`,
      `الشغل = ${W.toFixed(2)} جول`
    ];
    
    setWorkCalc({ ...workCalc, result: W, steps });
  };

  return (
    <Tabs defaultValue="kinetic" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="kinetic">الطاقة الحركية</TabsTrigger>
        <TabsTrigger value="potential">الطاقة الجهدية</TabsTrigger>
        <TabsTrigger value="work">الشغل</TabsTrigger>
      </TabsList>

      <TabsContent value="kinetic" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الطاقة الحركية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={kineticCalc.mass}
                  onChange={(e) => setKineticCalc({ ...kineticCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>السرعة (م/ث)</Label>
                <Input
                  type="number"
                  placeholder="أدخل السرعة"
                  value={kineticCalc.velocity}
                  onChange={(e) => setKineticCalc({ ...kineticCalc, velocity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateKineticEnergy} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الطاقة الحركية
            </Button>
            
            {kineticCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {kineticCalc.result.toFixed(2)} جول</h4>
                <div className="space-y-1 text-sm">
                  {kineticCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="potential" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الطاقة الجهدية</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={potentialCalc.mass}
                  onChange={(e) => setPotentialCalc({ ...potentialCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الارتفاع (م)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الارتفاع"
                  value={potentialCalc.height}
                  onChange={(e) => setPotentialCalc({ ...potentialCalc, height: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>تسارع الجاذبية (م/ث²)</Label>
                <Input
                  type="number"
                  placeholder="9.81"
                  value={potentialCalc.gravity}
                  onChange={(e) => setPotentialCalc({ ...potentialCalc, gravity: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculatePotentialEnergy} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الطاقة الجهدية
            </Button>
            
            {potentialCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {potentialCalc.result.toFixed(2)} جول</h4>
                <div className="space-y-1 text-sm">
                  {potentialCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="work" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الشغل المبذول</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>القوة (نيوتن)</Label>
                <Input
                  type="number"
                  placeholder="أدخل القوة"
                  value={workCalc.force}
                  onChange={(e) => setWorkCalc({ ...workCalc, force: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>المسافة (م)</Label>
                <Input
                  type="number"
                  placeholder="أدخل المسافة"
                  value={workCalc.distance}
                  onChange={(e) => setWorkCalc({ ...workCalc, distance: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الزاوية (درجة)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={workCalc.angle}
                  onChange={(e) => setWorkCalc({ ...workCalc, angle: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateWork} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الشغل
            </Button>
            
            {workCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {workCalc.result.toFixed(2)} جول</h4>
                <div className="space-y-1 text-sm">
                  {workCalc.steps.map((step, index) => (
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

export default EnergyCalculations;
