import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, BarChart3, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CalculationModule, { ModuleData } from '@/components/carbon-calculator/CalculationModule';
import { calculationModules } from '@/components/carbon-calculator/modules';

const CarbonCalculator = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    electricity: '',
    water: '',
    carUsage: '',
    publicTransport: '',
    flights: ''
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

      // Carbon footprint calculations (simplified)
      const electricityEmissions = electricity * 12 * 0.5; // 0.5 kg CO2 per kWh
      const waterEmissions = water * 12 * 0.3; // 0.3 kg CO2 per cubic meter
      const carEmissions = carUsage * 12 * 0.2; // 0.2 kg CO2 per km
      const transportEmissions = publicTransport * 52 * 2; // 2 kg CO2 per trip
      const flightEmissions = flights * 500; // 500 kg CO2 per flight

      const totalEmissions = (electricityEmissions + waterEmissions + carEmissions + transportEmissions + flightEmissions) / 1000; // Convert to tons

      const breakdown = {
        electricity: electricityEmissions / 1000,
        water: waterEmissions / 1000,
        transportation: (carEmissions + transportEmissions) / 1000,
        flights: flightEmissions / 1000
      };

      setResult({
        total: totalEmissions.toFixed(2),
        breakdown
      });

      setIsCalculating(false);
      toast({
        title: t.common.success,
        description: "تم حساب البصمة الكربونية بنجاح",
      });
    }, 2000);
  };


  const suggestions = [
    "استخدم المصابيح الموفرة للطاقة (LED)",
    "قلل من استخدام السيارة واستخدم المواصلات العامة",
    "أطفئ الأجهزة الكهربائية عند عدم الاستخدام",
    "استخدم الطاقة المتجددة إن أمكن",
    "قلل من السفر بالطائرة",
    "استخدم الماء بحكمة وتجنب الهدر",
    "ازرع الأشجار لامتصاص ثاني أكسيد الكربون",
    "استخدم أكياس قابلة لإعادة الاستخدام"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-green-950 to-cyan-950 p-4" dir={dir}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/environmental-sustainability')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.environmental.backToMain}
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-green-400">
              {t.carbonCalculator.title}
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            {t.carbonCalculator.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {t.carbonCalculator.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t.carbonCalculator.electricityConsumption}
                  </Label>
                  <Input
                    type="number"
                    value={formData.electricity}
                    onChange={(e) => handleInputChange('electricity', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: 500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    {t.carbonCalculator.waterConsumption}
                  </Label>
                  <Input
                    type="number"
                    value={formData.water}
                    onChange={(e) => handleInputChange('water', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: 15"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    {t.carbonCalculator.carUsage}
                  </Label>
                  <Input
                    type="number"
                    value={formData.carUsage}
                    onChange={(e) => handleInputChange('carUsage', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: 1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    {t.carbonCalculator.publicTransport}
                  </Label>
                  <Input
                    type="number"
                    value={formData.publicTransport}
                    onChange={(e) => handleInputChange('publicTransport', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    {t.carbonCalculator.flights}
                  </Label>
                  <Input
                    type="number"
                    value={formData.flights}
                    onChange={(e) => handleInputChange('flights', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: 2"
                  />
                </div>

                <Button
                  onClick={calculateCarbonFootprint}
                  disabled={isCalculating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCalculating ? t.common.loading : t.carbonCalculator.calculate}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results and AI Assistant */}
          <div className="space-y-6">
            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">{t.carbonCalculator.result}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-green-400 mb-2">
                        {result.total}
                      </div>
                      <div className="text-white/70">{t.carbonCalculator.tonsCO2}</div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">{t.carbonCalculator.breakdown}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-white/80">
                          <span>{t.carbonCalculator.electricity}</span>
                          <span>{result.breakdown.electricity.toFixed(2)} طن</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>{t.carbonCalculator.water}</span>
                          <span>{result.breakdown.water.toFixed(2)} طن</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>{t.carbonCalculator.transportation}</span>
                          <span>{result.breakdown.transportation.toFixed(2)} طن</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>{t.carbonCalculator.flightsBreakdown}</span>
                          <span>{result.breakdown.flights.toFixed(2)} طن</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">{t.carbonCalculator.suggestions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCalculator;