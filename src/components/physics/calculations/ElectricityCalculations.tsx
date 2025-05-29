
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const ElectricityCalculations = () => {
  const [ohmCalc, setOhmCalc] = useState({
    voltage: '',
    current: '',
    resistance: '',
    calculate: 'voltage',
    result: null as number | null,
    steps: [] as string[]
  });

  const [powerCalc, setPowerCalc] = useState({
    voltage: '',
    current: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [coulombCalc, setCoulombCalc] = useState({
    charge1: '',
    charge2: '',
    distance: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateOhmsLaw = () => {
    const V = parseFloat(ohmCalc.voltage);
    const I = parseFloat(ohmCalc.current);
    const R = parseFloat(ohmCalc.resistance);
    
    let result, steps;
    
    if (ohmCalc.calculate === 'voltage' && !isNaN(I) && !isNaN(R)) {
      result = I * R;
      steps = [
        `المعطى: التيار = ${I} أمبير، المقاومة = ${R} أوم`,
        `القانون المستخدم: قانون أوم - الجهد = التيار × المقاومة`,
        `V = I × R`,
        `V = ${I} × ${R}`,
        `الجهد = ${result.toFixed(2)} فولت`
      ];
    } else if (ohmCalc.calculate === 'current' && !isNaN(V) && !isNaN(R) && R !== 0) {
      result = V / R;
      steps = [
        `المعطى: الجهد = ${V} فولت، المقاومة = ${R} أوم`,
        `القانون المستخدم: قانون أوم - التيار = الجهد ÷ المقاومة`,
        `I = V / R`,
        `I = ${V} / ${R}`,
        `التيار = ${result.toFixed(2)} أمبير`
      ];
    } else if (ohmCalc.calculate === 'resistance' && !isNaN(V) && !isNaN(I) && I !== 0) {
      result = V / I;
      steps = [
        `المعطى: الجهد = ${V} فولت، التيار = ${I} أمبير`,
        `القانون المستخدم: قانون أوم - المقاومة = الجهد ÷ التيار`,
        `R = V / I`,
        `R = ${V} / ${I}`,
        `المقاومة = ${result.toFixed(2)} أوم`
      ];
    }
    
    if (result !== undefined && steps) {
      setOhmCalc({ ...ohmCalc, result, steps });
    }
  };

  const calculatePower = () => {
    const V = parseFloat(powerCalc.voltage);
    const I = parseFloat(powerCalc.current);
    
    if (isNaN(V) || isNaN(I)) return;
    
    const P = V * I;
    const steps = [
      `المعطى: الجهد = ${V} فولت، التيار = ${I} أمبير`,
      `القانون المستخدم: القدرة = الجهد × التيار`,
      `P = V × I`,
      `P = ${V} × ${I}`,
      `القدرة = ${P.toFixed(2)} واط`
    ];
    
    setPowerCalc({ ...powerCalc, result: P, steps });
  };

  const calculateCoulombForce = () => {
    const q1 = parseFloat(coulombCalc.charge1);
    const q2 = parseFloat(coulombCalc.charge2);
    const r = parseFloat(coulombCalc.distance);
    
    if (isNaN(q1) || isNaN(q2) || isNaN(r) || r === 0) return;
    
    const k = 8.99e9; // ثابت كولوم
    const F = (k * Math.abs(q1 * q2)) / (r * r);
    const steps = [
      `المعطى: الشحنة الأولى = ${q1} كولوم، الشحنة الثانية = ${q2} كولوم، المسافة = ${r} م`,
      `ثابت كولوم = 8.99 × 10⁹ N⋅m²/C²`,
      `القانون المستخدم: قانون كولوم - F = k|q₁q₂|/r²`,
      `F = (8.99 × 10⁹ × |${q1} × ${q2}|) / ${r}²`,
      `F = (8.99 × 10⁹ × ${Math.abs(q1 * q2)}) / ${r * r}`,
      `القوة = ${F.toExponential(2)} نيوتن`
    ];
    
    setCoulombCalc({ ...coulombCalc, result: F, steps });
  };

  return (
    <Tabs defaultValue="ohm" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="ohm">قانون أوم</TabsTrigger>
        <TabsTrigger value="power">القدرة الكهربائية</TabsTrigger>
        <TabsTrigger value="coulomb">قانون كولوم</TabsTrigger>
      </TabsList>

      <TabsContent value="ohm" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">قانون أوم</h3>
            <div className="space-y-4">
              <div>
                <Label>احسب:</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="voltage"
                      checked={ohmCalc.calculate === 'voltage'}
                      onChange={(e) => setOhmCalc({ ...ohmCalc, calculate: e.target.value })}
                    />
                    الجهد (V)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="current"
                      checked={ohmCalc.calculate === 'current'}
                      onChange={(e) => setOhmCalc({ ...ohmCalc, calculate: e.target.value })}
                    />
                    التيار (I)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="resistance"
                      checked={ohmCalc.calculate === 'resistance'}
                      onChange={(e) => setOhmCalc({ ...ohmCalc, calculate: e.target.value })}
                    />
                    المقاومة (R)
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>الجهد (فولت)</Label>
                  <Input
                    type="number"
                    placeholder={ohmCalc.calculate === 'voltage' ? 'المطلوب' : 'أدخل الجهد'}
                    value={ohmCalc.voltage}
                    onChange={(e) => setOhmCalc({ ...ohmCalc, voltage: e.target.value })}
                    disabled={ohmCalc.calculate === 'voltage'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>التيار (أمبير)</Label>
                  <Input
                    type="number"
                    placeholder={ohmCalc.calculate === 'current' ? 'المطلوب' : 'أدخل التيار'}
                    value={ohmCalc.current}
                    onChange={(e) => setOhmCalc({ ...ohmCalc, current: e.target.value })}
                    disabled={ohmCalc.calculate === 'current'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>المقاومة (أوم)</Label>
                  <Input
                    type="number"
                    placeholder={ohmCalc.calculate === 'resistance' ? 'المطلوب' : 'أدخل المقاومة'}
                    value={ohmCalc.resistance}
                    onChange={(e) => setOhmCalc({ ...ohmCalc, resistance: e.target.value })}
                    disabled={ohmCalc.calculate === 'resistance'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
            </div>
            <Button onClick={calculateOhmsLaw} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب
            </Button>
            
            {ohmCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">
                  النتيجة: {ohmCalc.result.toFixed(2)} {
                    ohmCalc.calculate === 'voltage' ? 'فولت' : 
                    ohmCalc.calculate === 'current' ? 'أمبير' : 'أوم'
                  }
                </h4>
                <div className="space-y-1 text-sm">
                  {ohmCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="power" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب القدرة الكهربائية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الجهد (فولت)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الجهد"
                  value={powerCalc.voltage}
                  onChange={(e) => setPowerCalc({ ...powerCalc, voltage: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>التيار (أمبير)</Label>
                <Input
                  type="number"
                  placeholder="أدخل التيار"
                  value={powerCalc.current}
                  onChange={(e) => setPowerCalc({ ...powerCalc, current: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculatePower} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب القدرة
            </Button>
            
            {powerCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {powerCalc.result.toFixed(2)} واط</h4>
                <div className="space-y-1 text-sm">
                  {powerCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="coulomb" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">قانون كولوم - القوة الكهروستاتيكية</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الشحنة الأولى (كولوم)</Label>
                <Input
                  type="number"
                  placeholder="q₁"
                  value={coulombCalc.charge1}
                  onChange={(e) => setCoulombCalc({ ...coulombCalc, charge1: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الشحنة الثانية (كولوم)</Label>
                <Input
                  type="number"
                  placeholder="q₂"
                  value={coulombCalc.charge2}
                  onChange={(e) => setCoulombCalc({ ...coulombCalc, charge2: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>المسافة (م)</Label>
                <Input
                  type="number"
                  placeholder="r"
                  value={coulombCalc.distance}
                  onChange={(e) => setCoulombCalc({ ...coulombCalc, distance: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateCoulombForce} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب القوة الكهروستاتيكية
            </Button>
            
            {coulombCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {coulombCalc.result.toExponential(2)} نيوتن</h4>
                <div className="space-y-1 text-sm">
                  {coulombCalc.steps.map((step, index) => (
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

export default ElectricityCalculations;
