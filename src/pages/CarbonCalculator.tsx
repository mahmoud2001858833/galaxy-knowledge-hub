import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Calculator, Zap, Droplets, Car, Plane, TreePine, Sparkles, CheckCircle, ChevronRight, Home, Info, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const CarbonCalculator = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    electricity: '350',
    water: '15',
    carUsage: '800',
    publicTransport: '10',
    flights: '1'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCarbonFootprint = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const electricity = parseFloat(formData.electricity) || 0;
      const water = parseFloat(formData.water) || 0;
      const carUsage = parseFloat(formData.carUsage) || 0;
      const publicTransport = parseFloat(formData.publicTransport) || 0;
      const flights = parseFloat(formData.flights) || 0;

      // Carbon footprint calculations (GHG Protocol coefficients)
      const electricityEmissions = electricity * 12 * 0.475; // kg CO2 per kWh
      const waterEmissions = water * 12 * 0.35; // kg CO2 per cubic meter
      const carEmissions = carUsage * 12 * 0.192; // kg CO2 per km
      const transportEmissions = publicTransport * 52 * 1.5; // kg CO2 per trip
      const flightEmissions = flights * 450; // kg CO2 per flight

      const totalEmissionsKg = electricityEmissions + waterEmissions + carEmissions + transportEmissions + flightEmissions;
      const totalEmissions = totalEmissionsKg / 1000; // Convert to tons
      const treesNeeded = Math.ceil(totalEmissionsKg / 22); // average mature tree absorbs ~22kg CO2/yr

      const breakdown = {
        electricity: electricityEmissions / 1000,
        water: waterEmissions / 1000,
        transportation: (carEmissions + transportEmissions) / 1000,
        flights: flightEmissions / 1000
      };

      setResult({
        total: totalEmissions.toFixed(2),
        treesNeeded,
        breakdown
      });

      setIsCalculating(false);
      toast({
        title: t.common.success || "تم الحساب بنجاح",
        description: `بصمتك الكربونية السنوية التقديرية: ${totalEmissions.toFixed(2)} طن CO₂`,
      });
    }, 600);
  };

  const suggestions = [
    { title: "استبدال الإنارة بـ LED", desc: "يوفر حتى 75% من استهلاك طاقة الإضاءة المنزلية والمدرسية." },
    { title: "النقل التشاركي والمستدام", desc: "استخدام الحافلة المدرسية أو المشي يقلل أكثر من 1.2 طن سنوياً." },
    { title: "ترشيد استهلاك المياه", desc: "تركيب قطع توفير المياه يوفر حتى 40% من استهلاك شبكة التوزيع." },
    { title: "إيقاف وضع الاستعداد للأجهزة", desc: "فصل المقابس غير المستخدمة يقلل الهدر الكهربائي بنسبة 8%." },
    { title: "زراعة الأشجار الحضرية", desc: "الشجرة الواحدة تمتص ما يقارب 22 كجم من ثاني أكسيد الكربون سنوياً." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-slate-100 transition-colors" dir={dir}>
      <SEO 
        title="حاسبة البصمة الكربونية الذكية | منصة المعرفة"
        description="احسب بصمتك الكربونية الشخصية بدقة وفق معايير بروتوكول غازات الاحتباس الحراري الدولي وتعرف على عدد الأشجار للتعويض."
      />
      
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <Link to="/environmental-sustainability" className="hover:text-emerald-600 transition-colors">
                الاستدامة البيئية
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">حاسبة البصمة الكربونية 2.0</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
              }}
              className="h-8 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>العودة للبوابة</span>
            </Button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="container mx-auto px-4 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>معيار GHG Protocol الدولي المعتمد</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              حاسبة البصمة الكربونية الذكية
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              أداة علمية متقدمة لتقدير انبعاثات ثاني أكسيد الكربون السنوية الناتجة عن أنشطتك في الطاقة والتنقل والماء، مع خطة تعويض مقترحة.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7"
            >
              <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        بيانات الاستهلاك الشهري والسنوي
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-1">
                        أدخل تقديراتك التقريبية لحساب إجمالي الانبعاثات بالطن
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFormData({ electricity: '', water: '', carUsage: '', publicTransport: '', flights: '' })}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white gap-1 h-8"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      إعادة تعيين
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  {/* Electricity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                          <Zap className="w-4 h-4" />
                        </div>
                        {t.carbonCalculator?.electricityConsumption || "استهلاك الكهرباء الشهري"}
                      </Label>
                      <span className="text-xs text-slate-400 font-mono">كيلوواط.ساعة / شهر (kWh)</span>
                    </div>
                    <Input
                      type="number"
                      value={formData.electricity}
                      onChange={(e) => handleInputChange('electricity', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:ring-emerald-500 rounded-xl"
                      placeholder="مثال: 350"
                    />
                  </div>

                  {/* Water */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/40">
                          <Droplets className="w-4 h-4" />
                        </div>
                        {t.carbonCalculator?.waterConsumption || "استهلاك المياه الشهري"}
                      </Label>
                      <span className="text-xs text-slate-400 font-mono">متر مكعب / شهر (m³)</span>
                    </div>
                    <Input
                      type="number"
                      value={formData.water}
                      onChange={(e) => handleInputChange('water', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:ring-emerald-500 rounded-xl"
                      placeholder="مثال: 15"
                    />
                  </div>

                  {/* Car */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                          <Car className="w-4 h-4" />
                        </div>
                        {t.carbonCalculator?.carUsage || "المسافة المقطوعة بالسيارة شهرياً"}
                      </Label>
                      <span className="text-xs text-slate-400 font-mono">كم / شهر (km)</span>
                    </div>
                    <Input
                      type="number"
                      value={formData.carUsage}
                      onChange={(e) => handleInputChange('carUsage', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:ring-emerald-500 rounded-xl"
                      placeholder="مثال: 800"
                    />
                  </div>

                  {/* Public Transport */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                          <Car className="w-4 h-4" />
                        </div>
                        {t.carbonCalculator?.publicTransport || "رحلات النقل العام أسبوعياً"}
                      </Label>
                      <span className="text-xs text-slate-400 font-mono">رحلة / أسبوع</span>
                    </div>
                    <Input
                      type="number"
                      value={formData.publicTransport}
                      onChange={(e) => handleInputChange('publicTransport', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:ring-emerald-500 rounded-xl"
                      placeholder="مثال: 10"
                    />
                  </div>

                  {/* Flights */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40">
                          <Plane className="w-4 h-4" />
                        </div>
                        {t.carbonCalculator?.flights || "عدد الرحلات الجوية سنوياً"}
                      </Label>
                      <span className="text-xs text-slate-400 font-mono">رحلة ذهاب وعودة / سنة</span>
                    </div>
                    <Input
                      type="number"
                      value={formData.flights}
                      onChange={(e) => handleInputChange('flights', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base focus:ring-emerald-500 rounded-xl"
                      placeholder="مثال: 1"
                    />
                  </div>

                  <Button
                    onClick={calculateCarbonFootprint}
                    disabled={isCalculating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-xl shadow-sm text-base transition-all mt-4"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        جارٍ الحساب الدقيق...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        {t.carbonCalculator?.calculate || "احسب البصمة الآن"}
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 space-y-6"
            >
              {result ? (
                <Card className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-md rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 bg-white/20 px-3 py-1 rounded-full">
                      النتيجة الإجمالية السنوية
                    </span>
                    <div className="text-5xl font-black mt-3 mb-1">
                      {result.total}
                    </div>
                    <p className="text-emerald-100 text-sm font-medium">طن من مكافئ CO₂ / سنة</p>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Tree Offset Box */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <TreePine className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          تحتاج إلى زراعة {result.treesNeeded} شجرة
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          لمعادلة بصمتك الكربونية السنوية وحماية التوازن البيئي المحلي.
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        تفصيل الانبعاثات حسب المصدر
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              الكهرباء المنزلية
                            </span>
                            <span className="font-mono">{result.breakdown.electricity.toFixed(2)} طن</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (result.breakdown.electricity / (parseFloat(result.total) || 1)) * 100)} 
                            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-amber-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-emerald-500" />
                              المواصلات والتنقل
                            </span>
                            <span className="font-mono">{result.breakdown.transportation.toFixed(2)} طن</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (result.breakdown.transportation / (parseFloat(result.total) || 1)) * 100)} 
                            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5 text-sky-500" />
                              الطيران والسفر
                            </span>
                            <span className="font-mono">{result.breakdown.flights.toFixed(2)} طن</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (result.breakdown.flights / (parseFloat(result.total) || 1)) * 100)} 
                            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                              المياه ومعالجتها
                            </span>
                            <span className="font-mono">{result.breakdown.water.toFixed(2)} طن</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (result.breakdown.water / (parseFloat(result.total) || 1)) * 100)} 
                            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 flex items-center justify-center mb-4">
                    <TreePine className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    النتيجة ستظهر هنا بعد النقر على زر الحساب
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    ستحصل على تفكيك كامل لانبعاثاتك السنوية ومقارنتها بالمتوسط الإقليمي والدولي مع عدد الأشجار المطلوبة للتعويض.
                  </p>
                </Card>
              )}

              {/* Suggestions Card */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 py-4">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    توصيات فورية لتقليص الانبعاثات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {suggestions.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarbonCalculator;