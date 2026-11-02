import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  Zap, 
  Droplets, 
  Car, 
  Plane, 
  Bus, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  TrendingDown,
  Info
} from 'lucide-react';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { SEO } from '@/components/SEO';

interface CarbonResult {
  total: number;
  breakdown: {
    electricity: number;
    water: number;
    transportation: number;
    flights: number;
  };
}

const DEFAULT_SUGGESTIONS = [
  'استبدال المصابيح التقليدية بمصابيح LED موفرة للطاقة لتقليل استهلاك الكهرباء حتى 75%.',
  'إيقاف تشغيل الأجهزة الإلكترونية والشواحن عند عدم الاستخدام لمنع هدر الطاقة الاحتياطية.',
  'تركيب مرشدات استهلاك المياه على صنابير المنزل والدش لتوفير ما يصل إلى 40% من المياه.',
  'الاعتماد على النقل الجماعي أو المشي والمشاركة في ركوب السيارات للمسافات القصيرة.',
  'استخدام أكياس وحاويات تسوق قابلة لإعادة الاستخدام وتقليل المنتجات البلاستيكية أحادية الاستخدام.',
  'زراعة نباتات وأشجار محلية في حديقة المنزل أو المدرسة لامتصاص الكربون وتحسين جودة الهواء.'
];

const CarbonCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    electricity: '',
    water: '',
    carUsage: '',
    publicTransport: '',
    flights: ''
  });
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCarbonFootprint = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const electricity = parseFloat(formData.electricity) || 0;
      const water = parseFloat(formData.water) || 0;
      const carUsage = parseFloat(formData.carUsage) || 0;
      const publicTransport = parseFloat(formData.publicTransport) || 0;
      const flights = parseFloat(formData.flights) || 0;

      // Deterministic client-side emissions calculation
      const electricityCO2 = electricity * 0.0005;
      const waterCO2 = water * 0.0003;
      const carCO2 = carUsage * 0.0002;
      const transportCO2 = publicTransport * 0.0001;
      const flightsCO2 = flights * 0.5;

      const total = electricityCO2 + waterCO2 + carCO2 + transportCO2 + flightsCO2;

      setResult({
        total: parseFloat(total.toFixed(2)),
        breakdown: {
          electricity: parseFloat(electricityCO2.toFixed(2)),
          water: parseFloat(waterCO2.toFixed(2)),
          transportation: parseFloat((carCO2 + transportCO2).toFixed(2)),
          flights: parseFloat(flightsCO2.toFixed(2))
        }
      });
      setIsCalculating(false);
    }, 400);
  };

  const handleReset = () => {
    setFormData({
      electricity: '',
      water: '',
      carUsage: '',
      publicTransport: '',
      flights: ''
    });
    setResult(null);
  };

  return (
    <PageShell>
      <SEO 
        title={`${t.carbonCalculator.title} | ذروة العلم`}
        description={t.carbonCalculator.subtitle}
      />

      <PageHeader
        title={t.carbonCalculator.title}
        description={t.carbonCalculator.subtitle}
        icon={Calculator}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
          { label: t.carbonCalculator.title }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calculator Form */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">بيانات الاستهلاك الشهري والسنوي</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    أدخل تقديراتك لحساب انبعاثات ثاني أكسيد الكربون المكافئة
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  {t.carbonCalculator.electricityConsumption}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.electricity}
                  onChange={(e) => handleInputChange('electricity', e.target.value)}
                  placeholder="مثال: 500 ك.و.س"
                  className="rounded-2xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  {t.carbonCalculator.waterConsumption}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.water}
                  onChange={(e) => handleInputChange('water', e.target.value)}
                  placeholder="مثال: 15 متر مكعب"
                  className="rounded-2xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" />
                  {t.carbonCalculator.carUsage}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.carUsage}
                  onChange={(e) => handleInputChange('carUsage', e.target.value)}
                  placeholder="مثال: 1000 كم"
                  className="rounded-2xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Bus className="w-4 h-4 text-primary" />
                  {t.carbonCalculator.publicTransport}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.publicTransport}
                  onChange={(e) => handleInputChange('publicTransport', e.target.value)}
                  placeholder="مثال: 5 مرات أسبوعياً"
                  className="rounded-2xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Plane className="w-4 h-4 text-primary" />
                  {t.carbonCalculator.flights}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.flights}
                  onChange={(e) => handleInputChange('flights', e.target.value)}
                  placeholder="مثال: 2 رحلة"
                  className="rounded-2xl border-border bg-background"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  onClick={calculateCarbonFootprint}
                  disabled={isCalculating}
                  className="flex-1 rounded-2xl h-12 font-bold shadow-sm"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t.common.loading}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t.carbonCalculator.calculate}
                    </span>
                  )}
                </Button>
                {result && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="rounded-2xl h-12 px-4"
                  >
                    إعادة تعيين
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <p>
              تعتمد الحسابات على معاملات انبعاث معيارية حتمية داخل المتصفح، لتقديم تقدير توعوي تقريبي لبصمتك البيئية ودعم سلوك الترشيد.
            </p>
          </div>
        </div>

        {/* Results & Suggestions */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg font-bold">{t.carbonCalculator.result}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {t.carbonCalculator.totalEmissions}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-4 bg-muted/40 rounded-2xl border border-border">
                    <div className="text-5xl font-black text-primary tracking-tight">
                      {result.total}
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground mt-2">
                      {t.carbonCalculator.tonsCO2}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-card-foreground">
                      {t.carbonCalculator.breakdown}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-2xl bg-background border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">{t.carbonCalculator.electricity}</span>
                        <span className="font-bold text-card-foreground">{result.breakdown.electricity} طن</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-background border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">{t.carbonCalculator.water}</span>
                        <span className="font-bold text-card-foreground">{result.breakdown.water} طن</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-background border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">{t.carbonCalculator.transportation}</span>
                        <span className="font-bold text-card-foreground">{result.breakdown.transportation} طن</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-background border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">{t.carbonCalculator.flightsBreakdown}</span>
                        <span className="font-bold text-card-foreground">{result.breakdown.flights} طن</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mx-auto">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-card-foreground">بانتظار إدخال البيانات</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                أدخل قيم استهلاكك في الحقول المجاورة واضغط على &quot;احسب البصمة الكربونية&quot; لمشاهدة التفصيل والتوصيات.
              </p>
            </div>
          )}

          {/* Recommendations Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t.carbonCalculator.suggestions}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                خطوات عملية مثبتة للحد من الانبعاثات وتوفير تكاليف الطاقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {DEFAULT_SUGGESTIONS.map((suggestion, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-3 leading-relaxed">
                    <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default CarbonCalculator;
