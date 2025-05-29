
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const OpticsCalculations = () => {
  const [lensCalc, setLensCalc] = useState({
    objectDistance: '',
    imageDistance: '',
    focalLength: '',
    calculate: 'imageDistance',
    result: null as number | null,
    steps: [] as string[]
  });

  const [magnificationCalc, setMagnificationCalc] = useState({
    objectDistance: '',
    imageDistance: '',
    objectHeight: '',
    result: null as { magnification: number; imageHeight: number } | null,
    steps: [] as string[]
  });

  const [refractionCalc, setRefractionCalc] = useState({
    n1: '',
    angle1: '',
    n2: '',
    result: null as number | null,
    steps: [] as string[]
  });

  const calculateLensEquation = () => {
    const do_ = parseFloat(lensCalc.objectDistance);
    const di = parseFloat(lensCalc.imageDistance);
    const f = parseFloat(lensCalc.focalLength);
    
    let result, steps;
    
    if (lensCalc.calculate === 'imageDistance' && !isNaN(do_) && !isNaN(f) && do_ !== 0) {
      result = 1 / (1/f - 1/do_);
      steps = [
        `المعطى: بعد الجسم = ${do_} سم، البعد البؤري = ${f} سم`,
        `القانون المستخدم: معادلة العدسة الرقيقة - 1/f = 1/do + 1/di`,
        `1/di = 1/f - 1/do`,
        `1/di = 1/${f} - 1/${do_}`,
        `1/di = ${(1/f).toFixed(4)} - ${(1/do_).toFixed(4)}`,
        `1/di = ${(1/f - 1/do_).toFixed(4)}`,
        `بعد الصورة = ${result.toFixed(2)} سم`
      ];
    } else if (lensCalc.calculate === 'objectDistance' && !isNaN(di) && !isNaN(f) && di !== 0) {
      result = 1 / (1/f - 1/di);
      steps = [
        `المعطى: بعد الصورة = ${di} سم، البعد البؤري = ${f} سم`,
        `القانون المستخدم: معادلة العدسة الرقيقة - 1/f = 1/do + 1/di`,
        `1/do = 1/f - 1/di`,
        `1/do = 1/${f} - 1/${di}`,
        `1/do = ${(1/f).toFixed(4)} - ${(1/di).toFixed(4)}`,
        `1/do = ${(1/f - 1/di).toFixed(4)}`,
        `بعد الجسم = ${result.toFixed(2)} سم`
      ];
    } else if (lensCalc.calculate === 'focalLength' && !isNaN(do_) && !isNaN(di) && do_ !== 0 && di !== 0) {
      result = 1 / (1/do_ + 1/di);
      steps = [
        `المعطى: بعد الجسم = ${do_} سم، بعد الصورة = ${di} سم`,
        `القانون المستخدم: معادلة العدسة الرقيقة - 1/f = 1/do + 1/di`,
        `1/f = 1/${do_} + 1/${di}`,
        `1/f = ${(1/do_).toFixed(4)} + ${(1/di).toFixed(4)}`,
        `1/f = ${(1/do_ + 1/di).toFixed(4)}`,
        `البعد البؤري = ${result.toFixed(2)} سم`
      ];
    }
    
    if (result !== undefined && steps) {
      setLensCalc({ ...lensCalc, result, steps });
    }
  };

  const calculateMagnification = () => {
    const do_ = parseFloat(magnificationCalc.objectDistance);
    const di = parseFloat(magnificationCalc.imageDistance);
    const ho = parseFloat(magnificationCalc.objectHeight);
    
    if (isNaN(do_) || isNaN(di) || isNaN(ho) || do_ === 0) return;
    
    const m = -di / do_;
    const hi = m * ho;
    const steps = [
      `المعطى: بعد الجسم = ${do_} سم، بعد الصورة = ${di} سم، ارتفاع الجسم = ${ho} سم`,
      `القانون المستخدم: التكبير = -بعد الصورة ÷ بعد الجسم`,
      `m = -di / do`,
      `m = -${di} / ${do_}`,
      `التكبير = ${m.toFixed(2)}`,
      ``,
      `ارتفاع الصورة = التكبير × ارتفاع الجسم`,
      `hi = m × ho`,
      `hi = ${m.toFixed(2)} × ${ho}`,
      `ارتفاع الصورة = ${hi.toFixed(2)} سم`
    ];
    
    setMagnificationCalc({ ...magnificationCalc, result: { magnification: m, imageHeight: hi }, steps });
  };

  const calculateSnellsLaw = () => {
    const n1 = parseFloat(refractionCalc.n1);
    const theta1 = parseFloat(refractionCalc.angle1);
    const n2 = parseFloat(refractionCalc.n2);
    
    if (isNaN(n1) || isNaN(theta1) || isNaN(n2)) return;
    
    const theta1Rad = (theta1 * Math.PI) / 180;
    const sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;
    
    if (Math.abs(sinTheta2) > 1) {
      // انعكاس كلي داخلي
      const criticalAngle = Math.asin(n2 / n1) * (180 / Math.PI);
      const steps = [
        `المعطى: معامل الانكسار الأول = ${n1}، زاوية السقوط = ${theta1}°، معامل الانكسار الثاني = ${n2}`,
        `قانون سنيل: n₁sin(θ₁) = n₂sin(θ₂)`,
        `sin(θ₂) = (n₁ × sin(θ₁)) / n₂`,
        `sin(θ₂) = (${n1} × sin(${theta1}°)) / ${n2}`,
        `sin(θ₂) = ${sinTheta2.toFixed(4)}`,
        ``,
        `⚠️ انعكاس كلي داخلي! sin(θ₂) > 1`,
        `الزاوية الحرجة = arcsin(n₂/n₁) = ${criticalAngle.toFixed(2)}°`
      ];
      setRefractionCalc({ ...refractionCalc, result: null, steps });
      return;
    }
    
    const theta2 = Math.asin(sinTheta2) * (180 / Math.PI);
    const steps = [
      `المعطى: معامل الانكسار الأول = ${n1}، زاوية السقوط = ${theta1}°، معامل الانكسار الثاني = ${n2}`,
      `قانون سنيل: n₁sin(θ₁) = n₂sin(θ₂)`,
      `sin(θ₂) = (n₁ × sin(θ₁)) / n₂`,
      `sin(θ₂) = (${n1} × sin(${theta1}°)) / ${n2}`,
      `sin(θ₂) = (${n1} × ${Math.sin(theta1Rad).toFixed(4)}) / ${n2}`,
      `sin(θ₂) = ${sinTheta2.toFixed(4)}`,
      `θ₂ = arcsin(${sinTheta2.toFixed(4)})`,
      `زاوية الانكسار = ${theta2.toFixed(2)}°`
    ];
    
    setRefractionCalc({ ...refractionCalc, result: theta2, steps });
  };

  return (
    <Tabs defaultValue="lens" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="lens">معادلة العدسة</TabsTrigger>
        <TabsTrigger value="magnification">التكبير</TabsTrigger>
        <TabsTrigger value="refraction">قانون سنيل</TabsTrigger>
      </TabsList>

      <TabsContent value="lens" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">معادلة العدسة الرقيقة</h3>
            <div className="space-y-4">
              <div>
                <Label>احسب:</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="imageDistance"
                      checked={lensCalc.calculate === 'imageDistance'}
                      onChange={(e) => setLensCalc({ ...lensCalc, calculate: e.target.value })}
                    />
                    بعد الصورة
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="objectDistance"
                      checked={lensCalc.calculate === 'objectDistance'}
                      onChange={(e) => setLensCalc({ ...lensCalc, calculate: e.target.value })}
                    />
                    بعد الجسم
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="focalLength"
                      checked={lensCalc.calculate === 'focalLength'}
                      onChange={(e) => setLensCalc({ ...lensCalc, calculate: e.target.value })}
                    />
                    البعد البؤري
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>بعد الجسم (سم)</Label>
                  <Input
                    type="number"
                    placeholder={lensCalc.calculate === 'objectDistance' ? 'المطلوب' : 'do'}
                    value={lensCalc.objectDistance}
                    onChange={(e) => setLensCalc({ ...lensCalc, objectDistance: e.target.value })}
                    disabled={lensCalc.calculate === 'objectDistance'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>بعد الصورة (سم)</Label>
                  <Input
                    type="number"
                    placeholder={lensCalc.calculate === 'imageDistance' ? 'المطلوب' : 'di'}
                    value={lensCalc.imageDistance}
                    onChange={(e) => setLensCalc({ ...lensCalc, imageDistance: e.target.value })}
                    disabled={lensCalc.calculate === 'imageDistance'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label>البعد البؤري (سم)</Label>
                  <Input
                    type="number"
                    placeholder={lensCalc.calculate === 'focalLength' ? 'المطلوب' : 'f'}
                    value={lensCalc.focalLength}
                    onChange={(e) => setLensCalc({ ...lensCalc, focalLength: e.target.value })}
                    disabled={lensCalc.calculate === 'focalLength'}
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
            </div>
            <Button onClick={calculateLensEquation} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب
            </Button>
            
            {lensCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">النتيجة: {lensCalc.result.toFixed(2)} سم</h4>
                <div className="space-y-1 text-sm">
                  {lensCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="magnification" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">حساب التكبير</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>بعد الجسم (سم)</Label>
                <Input
                  type="number"
                  placeholder="do"
                  value={magnificationCalc.objectDistance}
                  onChange={(e) => setMagnificationCalc({ ...magnificationCalc, objectDistance: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>بعد الصورة (سم)</Label>
                <Input
                  type="number"
                  placeholder="di"
                  value={magnificationCalc.imageDistance}
                  onChange={(e) => setMagnificationCalc({ ...magnificationCalc, imageDistance: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>ارتفاع الجسم (سم)</Label>
                <Input
                  type="number"
                  placeholder="ho"
                  value={magnificationCalc.objectHeight}
                  onChange={(e) => setMagnificationCalc({ ...magnificationCalc, objectHeight: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateMagnification} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب التكبير
            </Button>
            
            {magnificationCalc.result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">
                  النتائج: التكبير = {magnificationCalc.result.magnification.toFixed(2)}، ارتفاع الصورة = {magnificationCalc.result.imageHeight.toFixed(2)} سم
                </h4>
                <div className="space-y-1 text-sm">
                  {magnificationCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">• {step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="refraction" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-physics-primary">قانون سنيل للانكسار</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>معامل الانكسار الأول (n₁)</Label>
                <Input
                  type="number"
                  placeholder="مثل: 1 للهواء"
                  value={refractionCalc.n1}
                  onChange={(e) => setRefractionCalc({ ...refractionCalc, n1: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>زاوية السقوط (درجة)</Label>
                <Input
                  type="number"
                  placeholder="θ₁"
                  value={refractionCalc.angle1}
                  onChange={(e) => setRefractionCalc({ ...refractionCalc, angle1: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>معامل الانكسار الثاني (n₂)</Label>
                <Input
                  type="number"
                  placeholder="مثل: 1.33 للماء"
                  value={refractionCalc.n2}
                  onChange={(e) => setRefractionCalc({ ...refractionCalc, n2: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <Button onClick={calculateSnellsLaw} className="w-full bg-subject-physics-primary hover:bg-subject-physics-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              احسب زاوية الانكسار
            </Button>
            
            {refractionCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${
                  refractionCalc.result !== null 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-red-500/20 border-red-500/30'
                }`}
              >
                {refractionCalc.result !== null ? (
                  <h4 className="font-bold text-green-400 mb-2">النتيجة: {refractionCalc.result.toFixed(2)}°</h4>
                ) : (
                  <h4 className="font-bold text-red-400 mb-2">انعكاس كلي داخلي</h4>
                )}
                <div className="space-y-1 text-sm">
                  {refractionCalc.steps.map((step, index) => (
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

export default OpticsCalculations;
