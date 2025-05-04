
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Calculator, Info } from "lucide-react";

const ChemistryCalculations = () => {
  const [activeTab, setActiveTab] = useState("moles");
  const [values, setValues] = useState<Record<string, string>>({
    mass: "",
    molarMass: "",
    moles: "",
    volume: "",
    concentration: "",
    temperature: "",
    pressure: "",
    particles: "",
    avogadro: "6.022e23",
    initialTemp: "",
    finalTemp: "",
    heatCapacity: "",
    deltaH: "",
  });
  const [result, setResult] = useState<{value: string, explanation: string} | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleChange = (key: string, value: string) => {
    setValues({ ...values, [key]: value });
  };
  
  const calculate = () => {
    let calculatedValue = "";
    let explanation = "";
    
    switch (activeTab) {
      case "moles":
        // Calculate moles from mass
        if (values.mass && values.molarMass) {
          const mass = parseFloat(values.mass);
          const molarMass = parseFloat(values.molarMass);
          calculatedValue = (mass / molarMass).toFixed(4);
          explanation = `
            لحساب عدد المولات، استخدمنا العلاقة: عدد المولات = الكتلة ÷ الكتلة المولية
            
            عدد المولات = ${values.mass} جرام ÷ ${values.molarMass} جرام/مول
            عدد المولات = ${calculatedValue} مول
          `;
        }
        // Calculate particles from moles
        else if (values.moles && values.avogadro) {
          const moles = parseFloat(values.moles);
          const avogadro = parseFloat(values.avogadro);
          calculatedValue = (moles * avogadro).toExponential(4);
          explanation = `
            لحساب عدد الجسيمات، نستخدم العلاقة: عدد الجسيمات = عدد المولات × عدد أفوجادرو
            
            عدد الجسيمات = ${values.moles} مول × ${values.avogadro} جسيم/مول
            عدد الجسيمات = ${calculatedValue} جسيم
          `;
        }
        break;
        
      case "thermal":
        // Calculate heat required for temperature change
        if (values.initialTemp && values.finalTemp && values.heatCapacity) {
          const initialTemp = parseFloat(values.initialTemp);
          const finalTemp = parseFloat(values.finalTemp);
          const heatCapacity = parseFloat(values.heatCapacity);
          const deltaT = finalTemp - initialTemp;
          calculatedValue = (heatCapacity * deltaT).toFixed(2);
          explanation = `
            لحساب كمية الحرارة المطلوبة، نستخدم العلاقة: Q = m × c × ΔT
            حيث Q هي كمية الحرارة، m هي الكتلة، c هي السعة الحرارية النوعية، و ΔT هي التغير في درجة الحرارة.
            
            Q = ${heatCapacity} جول/(جرام.كلفن) × (${finalTemp} - ${initialTemp}) كلفن
            Q = ${heatCapacity} × ${deltaT}
            Q = ${calculatedValue} جول
          `;
        }
        // Calculate enthalpy change
        else if (values.deltaH) {
          calculatedValue = values.deltaH;
          explanation = `
            تغير المحتوى الحراري (ΔH) هو مقياس لكمية الحرارة التي يتم امتصاصها أو إطلاقها خلال تفاعل كيميائي.
            
            القيمة المعطاة هي: ${values.deltaH} كيلو جول/مول
            
            إذا كانت القيمة موجبة، فإن التفاعل ماص للحرارة (endothermic).
            إذا كانت القيمة سالبة، فإن التفاعل طارد للحرارة (exothermic).
          `;
        }
        break;
        
      case "concentration":
        // Calculate concentration from moles and volume
        if (values.moles && values.volume) {
          const moles = parseFloat(values.moles);
          const volume = parseFloat(values.volume);
          calculatedValue = (moles / volume).toFixed(4);
          explanation = `
            لحساب التركيز المولاري، نستخدم العلاقة: التركيز = عدد المولات ÷ الحجم (باللتر)
            
            التركيز = ${values.moles} مول ÷ ${values.volume} لتر
            التركيز = ${calculatedValue} مول/لتر
          `;
        }
        break;
        
      case "gas":
        // Calculate gas pressure using PV = nRT
        if (values.moles && values.volume && values.temperature) {
          const moles = parseFloat(values.moles);
          const volume = parseFloat(values.volume);
          const temperature = parseFloat(values.temperature);
          const R = 0.082057; // L·atm/(mol·K)
          calculatedValue = ((moles * R * temperature) / volume).toFixed(4);
          explanation = `
            لحساب الضغط، نستخدم معادلة الغاز المثالي: PV = nRT
            حيث P هو الضغط، V هو الحجم، n هو عدد المولات، R هو ثابت الغاز، و T هي درجة الحرارة المطلقة.
            
            P = (n × R × T) ÷ V
            P = (${values.moles} مول × ${R} لتر·ضغط جوي/(مول·كلفن) × ${values.temperature} كلفن) ÷ ${values.volume} لتر
            P = ${calculatedValue} ضغط جوي
          `;
        }
        break;
    }
    
    setResult({ value: calculatedValue, explanation });
  };
  
  return (
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-cyan-400 mb-6 text-center"
      >
        الحسابات الكيميائية
      </motion.h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 bg-blue-900/30">
          <TabsTrigger value="moles" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            المول والجسيمات
          </TabsTrigger>
          <TabsTrigger value="concentration" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            التركيز
          </TabsTrigger>
          <TabsTrigger value="thermal" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            التغيرات الحرارية
          </TabsTrigger>
          <TabsTrigger value="gas" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            قوانين الغازات
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-6">
          <TabsContent value="moles" className="mt-0">
            <Card className="border-cyan-800/20 bg-blue-950/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">حاسبة المول والجسيمات</CardTitle>
                <CardDescription>حساب عدد المولات والجسيمات والكتلة المولية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">الكتلة (جرام)</label>
                    <Input 
                      type="number" 
                      placeholder="أدخل الكتلة" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.mass}
                      onChange={(e) => handleChange("mass", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">الكتلة المولية (جرام/مول)</label>
                    <Input 
                      type="number" 
                      placeholder="أدخل الكتلة المولية" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.molarMass}
                      onChange={(e) => handleChange("molarMass", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="text-center text-blue-400">أو</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">عدد المولات (مول)</label>
                    <Input 
                      type="number" 
                      placeholder="أدخل عدد المولات" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.moles}
                      onChange={(e) => handleChange("moles", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">عدد أفوجادرو</label>
                    <Input 
                      type="text" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.avogadro}
                      onChange={(e) => handleChange("avogadro", e.target.value)}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700" 
                  onClick={calculate}
                >
                  حساب
                  <Calculator className="mr-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="concentration" className="mt-0">
            <Card className="border-cyan-800/20 bg-blue-950/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">حاسبة التركيز</CardTitle>
                <CardDescription>حساب تركيز المحاليل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">عدد المولات (مول)</label>
                    <Input 
                      type="number" 
                      placeholder="أدخل عدد المولات" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.moles}
                      onChange={(e) => handleChange("moles", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">الحجم (لتر)</label>
                    <Input 
                      type="number" 
                      placeholder="أدخل الحجم" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.volume}
                      onChange={(e) => handleChange("volume", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700" 
                  onClick={calculate}
                >
                  حساب
                  <Calculator className="mr-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="thermal" className="mt-0">
            <Card className="border-cyan-800/20 bg-blue-950/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">حاسبة التغيرات الحرارية</CardTitle>
                <CardDescription>حساب كمية الحرارة والتغير في المحتوى الحراري</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">درجة الحرارة الابتدائية (كلفن)</label>
                    <Input 
                      type="number" 
                      placeholder="درجة الحرارة الابتدائية" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.initialTemp}
                      onChange={(e) => handleChange("initialTemp", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">درجة الحرارة النهائية (كلفن)</label>
                    <Input 
                      type="number" 
                      placeholder="درجة الحرارة النهائية" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.finalTemp}
                      onChange={(e) => handleChange("finalTemp", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">السعة الحرارية (جول/كلفن)</label>
                    <Input 
                      type="number" 
                      placeholder="السعة الحرارية" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.heatCapacity}
                      onChange={(e) => handleChange("heatCapacity", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="text-center text-blue-400">أو</div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">التغير في المحتوى الحراري (كيلو جول/مول)</label>
                    <Input 
                      type="number" 
                      placeholder="أدخل ΔH" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.deltaH}
                      onChange={(e) => handleChange("deltaH", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700" 
                  onClick={calculate}
                >
                  حساب
                  <Calculator className="mr-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="gas" className="mt-0">
            <Card className="border-cyan-800/20 bg-blue-950/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">حاسبة قوانين الغازات</CardTitle>
                <CardDescription>حساب الضغط والحجم ودرجة الحرارة للغازات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">عدد المولات (مول)</label>
                    <Input 
                      type="number" 
                      placeholder="عدد المولات" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.moles}
                      onChange={(e) => handleChange("moles", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">الحجم (لتر)</label>
                    <Input 
                      type="number" 
                      placeholder="الحجم" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.volume}
                      onChange={(e) => handleChange("volume", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-cyan-300">درجة الحرارة (كلفن)</label>
                    <Input 
                      type="number" 
                      placeholder="درجة الحرارة" 
                      className="bg-blue-950/50 border-cyan-900/30"
                      value={values.temperature}
                      onChange={(e) => handleChange("temperature", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700" 
                  onClick={calculate}
                >
                  حساب
                  <Calculator className="mr-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      
      {result && result.value && (
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-cyan-500/30 bg-gradient-to-br from-blue-900/40 to-cyan-900/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">نتيجة الحساب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white text-center py-4">
                {result.value}
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-2 border-cyan-700/30 text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? "إخفاء الشرح" : "عرض كيفية الحساب"}
                <Info className="mr-2 h-4 w-4" />
              </Button>
              
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 bg-blue-950/50 rounded-md text-white/80 whitespace-pre-line text-right"
                >
                  {result.explanation}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ChemistryCalculations;
