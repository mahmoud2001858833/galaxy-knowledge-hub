
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const ThermodynamicsCalculations = () => {
  const [gasLawCalc, setGasLawCalc] = useState({
    pressure: '',
    volume: '',
    temperature: '',
    moles: '',
    calculate: 'pressure',
    result: null as number | null,
    steps: [] as string[]
  });

  const [heatCalc, setHeatCalc] = useState({
    mass: '',
    specificHeat: '',
    deltaT: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const [efficiencyCalc, setEfficiencyCalc] = useState({
    workOutput: '',
    heatInput: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateIdealGasLaw = () => {
    const R = 8.314; // ثابت الغازات العام
    const P = parseFloat(gasLawCalc.pressure);
    const V = parseFloat(gasLawCalc.volume);
    const T = parseFloat(gasLawCalc.temperature);
    const n = parseFloat(gasLawCalc.moles);
    
    let result, steps;
    
    if (gasLawCalc.calculate === 'pressure' && !isNaN(V) && !isNaN(T) && !isNaN(n) && V !== 0) {
      result = (n * R * T) / V;
      steps = [
        `المعطى: الحجم = ${V} م³، درجة الحرارة = ${T} كلفن، عدد المولات = ${n} مول`,
        `ثابت الغازات العام R = 8.314 J/mol⋅K`,
        `القانون المستخدم: قانون الغازات المثالية - PV = nRT`,
        `P = nRT / V`,
        `P = (${n} × 8.314 × ${T}) / ${V}`,
        `P = ${(n * R * T).toFixed(2)} / ${V}`,
        `الضغط = ${result.toFixed(2)} باسكال`
      ];
    } else if (gasLawCalc.calculate === 'volume' && !isNaN(P) && !isNaN(T) && !isNaN(n) && P !== 0) {
      result = (n * R * T) / P;
      steps = [
        `المعطى: الضغط = ${P} باسكال، درجة الحرارة = ${T} كلفن، عدد المولات = ${n} مول`,
        `ثابت الغازات العام R = 8.314 J/mol⋅K`,
        `القانون المستخدم: قانون الغازات المثالية - PV = nRT`,
        `V = nRT / P`,
        `V = (${n} × 8.314 × ${T}) / ${P}`,
        `V = ${(n * R * T).toFixed(2)} / ${P}`,
        `الحجم = ${result.toFixed(2)} م³`
      ];
    } else if (gasLawCalc.calculate === 'temperature' && !isNaN(P) && !isNaN(V) && !isNaN(n) && n !== 0) {
      result = (P * V) / (n * R);
      steps = [
        `المعطى: الضغط = ${P} باسكال، الحجم = ${V} م³، عدد المولات = ${n} مول`,
        `ثابت الغازات العام R = 8.314 J/mol⋅K`,
        `القانون المستخدم: قانون الغازات المثالية - PV = nRT`,
        `T = PV / (nR)`,
        `T = (${P} × ${V}) / (${n} × 8.314)`,
        `T = ${(P * V).toFixed(2)} / ${(n * R).toFixed(2)}`,
        `درجة الحرارة = ${result.toFixed(2)} كلفن`
      ];
    }
    
    if (result !== undefined && steps) {
      setGasLawCalc({ ...gasLawCalc, result, steps });
    }
  };

  const calculateHeat = () => {
    const m = parseFloat(heatCalc.mass);
    const c = parseFloat(heatCalc.specificHeat);
    const deltaT = parseFloat(heatCalc.deltaT);
    
    if (isNaN(m) || isNaN(c) || isNaN(deltaT)) return;
    
    const Q = m * c * deltaT;
    const steps = [
      `المعطى: الكتلة = ${m} كغ، الحرارة النوعية = ${c} J/kg⋅K، التغير في درجة الحرارة = ${deltaT} K`,
      `القانون المستخدم: الحرارة = الكتلة × الحرارة النوعية × التغير في درجة الحرارة`,
      `Q = mcΔT`,
      `Q = ${m} × ${c} × ${deltaT}`,
      `الحرارة = ${Q.toFixed(2)} جول`
    ];
    
    setHeatCalc({ ...heatCalc, result: Q, steps });
  };

  const calculateEfficiency = () => {
    const W = parseFloat(efficiencyCalc.workOutput);
    const Q = parseFloat(efficiencyCalc.heatInput);
    
    if (isNaN(W) || isNaN(Q) || Q === 0) return;
    
    const efficiency = (W / Q) * 100;
    const steps = [
      `المعطى: الشغل الناتج = ${W} جول، الحرارة الداخلة = ${Q} جول`,
      `القانون المستخدم: الكفاءة = (الشغل الناتج ÷ الحرارة الداخلة) × 100%`,
      `η = (W / Q) × 100%`,
      `η = (${W} / ${Q}) × 100%`,
      `η = ${(W / Q).toFixed(3)} × 100%`,
      `الكفاءة = ${efficiency.toFixed(2)}%`
    ];
    
    setEfficiencyCalc({ ...efficiencyCalc, result: efficiency, steps });
  };

  return (
    <Tabs defaultValue="gaslaw" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="gaslaw">قانون الغازات</TabsTrigger>
        <TabsTrigger value="heat">الحرارة</TabsTrigger>
        <TabsTrigger value="efficiency">الكفاءة الحرارية</TabsTrigger>
      </TabsList>

      <TabsContent value="gaslaw" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">قانون الغازات المثالية</h3>
            <div className="space-y-4">
              <div>
                <Label>احسب:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="pressure"
                      checked={gasLawCalc.calculate === 'pressure'}
                      onChange={(e) => setGasLawCalc({ ...gasLawCalc, calculate: e.target.value })}
                    />
                    الضغط (P)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="volume"
                      checked={gasLawCalc.calculate === 'volume'}
                      onChange={(e) => setGasLawCalc({ ...gasLawCalc, calculate: e.target.value })}
                    />
                    الحجم (V)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="temperature"
                      checked={gasLawCalc.calculate === 'temperature'}
                      onChange={(e) => setGasLawCalc({ ...gasLawCalc, calculate: e.target.value })}
                    />
                    درجة الحرارة (T)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="moles"
                      checked={gasLawCalc.calculate === 'moles'}
                      onChange={(e) => setGasLawCalc({ ...gasLawCalc, calculate: e.target.value })}
                    />
                    عدد المولات (n)
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الضغط (باسكال)</Label>
                  <Input
                    type="number"
                    placeholder={gasLawCalc.calculate === 'pressure' ? 'المطلوب' : 'أدخل الضغط'}
                    value={gasLawCalc.pressure}
                    onChange={(e) => setGasLawCalc({ ...gasLawCalc, pressure: e.target.value })}
                    disabled={gasLawCalc.calculate === 'pressure'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>الحجم (م³)</Label>
                  <Input
                    type="number"
                    placeholder={gasLawCalc.calculate === 'volume' ? 'المطلوب' : 'أدخل الحجم'}
                    value={gasLawCalc.volume}
                    onChange={(e) => setGasLawCalc({ ...gasLawCalc, volume: e.target.value })}
                    disabled={gasLawCalc.calculate === 'volume'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>درجة الحرارة (كلفن)</Label>
                  <Input
                    type="number"
                    placeholder={gasLawCalc.calculate === 'temperature' ? 'المطلوب' : 'أدخل درجة الحرارة'}
                    value={gasLawCalc.temperature}
                    onChange={(e) => setGasLawCalc({ ...gasLawCalc, temperature: e.target.value })}
                    disabled={gasLawCalc.calculate === 'temperature'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>عدد المولات (مول)</Label>
                  <Input
                    type="number"
                    placeholder={gasLawCalc.calculate === 'moles' ? 'المطلوب' : 'أدخل عدد المولات'}
                    value={gasLawCalc.moles}
                    onChange={(e) => setGasLawCalc({ ...gasLawCalc, moles: e.target.value })}
                    disabled={gasLawCalc.calculate === 'moles'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
            </div>
            <Button onClick={calculateIdealGasLaw} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب
            </Button>
            
            {gasLawCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">
                  النتيجة: {gasLawCalc.result.toFixed(2)} {
                    gasLawCalc.calculate === 'pressure' ? 'باسكال' : 
                    gasLawCalc.calculate === 'volume' ? 'م³' : 
                    gasLawCalc.calculate === 'temperature' ? 'كلفن' : 'مول'
                  }
                </h4>
                <div className="space-y-1 text-sm">
                  {gasLawCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="heat" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الحرارة</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الكتلة (كغ)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الكتلة"
                  value={heatCalc.mass}
                  onChange={(e) => setHeatCalc({ ...heatCalc, mass: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الحرارة النوعية (J/kg⋅K)</Label>
                <Input
                  type="number"
                  placeholder="مثل: 4186 للماء"
                  value={heatCalc.specificHeat}
                  onChange={(e) => setHeatCalc({ ...heatCalc, specificHeat: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>التغير في درجة الحرارة (K)</Label>
                <Input
                  type="number"
                  placeholder="ΔT"
                  value={heatCalc.deltaT}
                  onChange={(e) => setHeatCalc({ ...heatCalc, deltaT: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateHeat} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الحرارة
            </Button>
            
            {heatCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {heatCalc.result.toFixed(2)} جول</h4>
                <div className="space-y-1 text-sm">
                  {heatCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="efficiency" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب الكفاءة الحرارية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الشغل الناتج (جول)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الشغل الناتج"
                  value={efficiencyCalc.workOutput}
                  onChange={(e) => setEfficiencyCalc({ ...efficiencyCalc, workOutput: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الحرارة الداخلة (جول)</Label>
                <Input
                  type="number"
                  placeholder="أدخل الحرارة الداخلة"
                  value={efficiencyCalc.heatInput}
                  onChange={(e) => setEfficiencyCalc({ ...efficiencyCalc, heatInput: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateEfficiency} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب الكفاءة
            </Button>
            
            {efficiencyCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {efficiencyCalc.result.toFixed(2)}%</h4>
                <div className="space-y-1 text-sm">
                  {efficiencyCalc.steps.map((step, index) => (
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

export default ThermodynamicsCalculations;
