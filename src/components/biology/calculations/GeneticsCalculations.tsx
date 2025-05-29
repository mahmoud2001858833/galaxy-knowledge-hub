
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Dna } from 'lucide-react';
import { motion } from 'framer-motion';

const GeneticsCalculations = () => {
  const [punnettCalc, setPunnettCalc] = useState({
    parent1: '',
    parent2: '',
    trait: 'dominant',
    result: null as any,
    steps: [] as string[]
  });

  const [hardyWeinbergCalc, setHardyWeinbergCalc] = useState({
    p: '',
    q: '',
    result: null as any,
    steps: [] as string[]
  });

  const calculatePunnettSquare = () => {
    const p1 = punnettCalc.parent1.toUpperCase();
    const p2 = punnettCalc.parent2.toUpperCase();
    
    if (p1.length !== 2 || p2.length !== 2) return;
    
    // إنشاء الأمشاج
    const gametes1 = [p1[0], p1[1]];
    const gametes2 = [p2[0], p2[1]];
    
    // مربع بونت
    const offspring = [];
    const genotypes: {[key: string]: number} = {};
    
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        let genotype = gametes1[i] + gametes2[j];
        // ترتيب الأليلات (الكبير قبل الصغير)
        if (genotype[1] > genotype[0]) {
          genotype = genotype[1] + genotype[0];
        }
        offspring.push(genotype);
        genotypes[genotype] = (genotypes[genotype] || 0) + 1;
      }
    }
    
    // حساب النسب
    const genotypeRatios: {[key: string]: string} = {};
    const phenotypeRatios: {[key: string]: number} = {};
    
    for (const [genotype, count] of Object.entries(genotypes)) {
      const percentage = (count / 4) * 100;
      genotypeRatios[genotype] = `${count}/4 (${percentage}%)`;
      
      // تحديد الطراز الظاهري
      let phenotype = '';
      if (punnettCalc.trait === 'dominant') {
        phenotype = genotype.includes(genotype[0].toUpperCase()) ? 'سائد' : 'متنحي';
      } else {
        phenotype = genotype === genotype.toUpperCase() ? 'سائد متماثل' : 
                   genotype === genotype.toLowerCase() ? 'متنحي متماثل' : 'خليط';
      }
      
      phenotypeRatios[phenotype] = (phenotypeRatios[phenotype] || 0) + count;
    }
    
    // تحويل نسب الطراز الظاهري إلى نسب مئوية
    const phenotypeRatiosFormatted: {[key: string]: string} = {};
    for (const [phenotype, count] of Object.entries(phenotypeRatios)) {
      const percentage = (count / 4) * 100;
      phenotypeRatiosFormatted[phenotype] = `${count}/4 (${percentage}%)`;
    }

    const steps = [
      `الوالد الأول: ${p1} → أمشاج: ${gametes1.join(', ')}`,
      `الوالد الثاني: ${p2} → أمشاج: ${gametes2.join(', ')}`,
      ``,
      `🧬 مربع بونت:`,
      `${gametes1[0]}${gametes2[0]} | ${gametes1[0]}${gametes2[1]}`,
      `${gametes1[1]}${gametes2[0]} | ${gametes1[1]}${gametes2[1]}`,
      ``,
      `📊 النسب الوراثية (الطراز الجيني):`,
      ...Object.entries(genotypeRatios).map(([genotype, ratio]) => `${genotype}: ${ratio}`),
      ``,
      `👁️ النسب الظاهرية (الطراز الظاهري):`,
      ...Object.entries(phenotypeRatiosFormatted).map(([phenotype, ratio]) => `${phenotype}: ${ratio}`),
      ``,
      `📝 قوانين مندل:`,
      `• قانون الانعزال: كل صفة تتحكم فيها زوج من الأليلات`,
      `• الأليل السائد يظهر في الطراز الظاهري حتى لو كان واحد فقط`,
      `• الأليل المتنحي يظهر فقط إذا كان الزوجان متنحيان`
    ];
    
    setPunnettCalc({ ...punnettCalc, result: { genotypeRatios, phenotypeRatios: phenotypeRatiosFormatted }, steps });
  };

  const calculateHardyWeinberg = () => {
    const p = parseFloat(hardyWeinbergCalc.p);
    const q = parseFloat(hardyWeinbergCalc.q);
    
    if (isNaN(p) || isNaN(q)) return;
    
    // التحقق من أن p + q = 1
    const sum = p + q;
    if (Math.abs(sum - 1) > 0.01) {
      const steps = [`⚠️ خطأ: يجب أن يكون p + q = 1`];
      setHardyWeinbergCalc({ ...hardyWeinbergCalc, result: null, steps });
      return;
    }
    
    // حساب ترددات الطراز الجيني
    const AA = p * p; // متماثل سائد
    const Aa = 2 * p * q; // خليط
    const aa = q * q; // متماثل متنحي
    
    // حساب ترددات الطراز الظاهري (بافتراض السيادة التامة)
    const dominant = AA + Aa; // سائد
    const recessive = aa; // متنحي

    const steps = [
      `المعطى: تردد الأليل السائد (p) = ${p}، تردد الأليل المتنحي (q) = ${q}`,
      `التحقق: p + q = ${p} + ${q} = ${sum.toFixed(3)} ✓`,
      ``,
      `🧮 معادلة هاردي-واينبرغ: p² + 2pq + q² = 1`,
      ``,
      `📊 ترددات الطراز الجيني:`,
      `AA (متماثل سائد) = p² = ${p}² = ${AA.toFixed(4)} (${(AA * 100).toFixed(1)}%)`,
      `Aa (خليط) = 2pq = 2 × ${p} × ${q} = ${Aa.toFixed(4)} (${(Aa * 100).toFixed(1)}%)`,
      `aa (متماثل متنحي) = q² = ${q}² = ${aa.toFixed(4)} (${(aa * 100).toFixed(1)}%)`,
      ``,
      `👁️ ترددات الطراز الظاهري:`,
      `السائد (AA + Aa) = ${dominant.toFixed(4)} (${(dominant * 100).toFixed(1)}%)`,
      `المتنحي (aa) = ${recessive.toFixed(4)} (${(recessive * 100).toFixed(1)}%)`,
      ``,
      `📝 شروط توازن هاردي-واينبرغ:`,
      `• عدم وجود طفرات`,
      `• عدم وجود انتقاء طبيعي`,
      `• عدم وجود هجرة`,
      `• تزاوج عشوائي`,
      `• حجم جماعة كبير`
    ];
    
    setHardyWeinbergCalc({ 
      ...hardyWeinbergCalc, 
      result: { AA, Aa, aa, dominant, recessive }, 
      steps 
    });
  };

  return (
    <Tabs defaultValue="punnett" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="punnett">مربع بونت</TabsTrigger>
        <TabsTrigger value="hardy">هاردي-واينبرغ</TabsTrigger>
      </TabsList>

      <TabsContent value="punnett" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">مربع بونت للوراثة</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الطراز الجيني للوالد الأول</Label>
                <Input
                  type="text"
                  placeholder="مثل: Aa"
                  maxLength={2}
                  value={punnettCalc.parent1}
                  onChange={(e) => setPunnettCalc({ ...punnettCalc, parent1: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>الطراز الجيني للوالد الثاني</Label>
                <Input
                  type="text"
                  placeholder="مثل: Aa"
                  maxLength={2}
                  value={punnettCalc.parent2}
                  onChange={(e) => setPunnettCalc({ ...punnettCalc, parent2: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>نوع الصفة</Label>
                <select
                  value={punnettCalc.trait}
                  onChange={(e) => setPunnettCalc({ ...punnettCalc, trait: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value="dominant">سيادة تامة</option>
                  <option value="codominant">سيادة مشتركة</option>
                </select>
              </div>
            </div>
            <Button onClick={calculatePunnettSquare} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Dna className="w-4 h-4 mr-2" />
              إنشاء مربع بونت
            </Button>
            
            {punnettCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">نتائج مربع بونت</h4>
                <div className="space-y-1 text-sm">
                  {punnettCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">{step}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hardy" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-subject-biology-primary">توازن هاردي-واينبرغ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تردد الأليل السائد (p)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.7"
                  value={hardyWeinbergCalc.p}
                  onChange={(e) => setHardyWeinbergCalc({ ...hardyWeinbergCalc, p: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>تردد الأليل المتنحي (q)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.3"
                  value={hardyWeinbergCalc.q}
                  onChange={(e) => setHardyWeinbergCalc({ ...hardyWeinbergCalc, q: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>
            <div className="text-sm text-white/70">
              📝 ملاحظة: يجب أن يكون p + q = 1
            </div>
            <Button onClick={calculateHardyWeinberg} className="w-full bg-subject-biology-primary hover:bg-subject-biology-secondary">
              <Calculator className="w-4 h-4 mr-2" />
              حساب توازن هاردي-واينبرغ
            </Button>
            
            {hardyWeinbergCalc.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              >
                <h4 className="font-bold text-green-400 mb-2">نتائج توازن هاردي-واينبرغ</h4>
                <div className="space-y-1 text-sm">
                  {hardyWeinbergCalc.steps.map((step, index) => (
                    <div key={index} className="text-white/80">{step}</div>
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

export default GeneticsCalculations;
