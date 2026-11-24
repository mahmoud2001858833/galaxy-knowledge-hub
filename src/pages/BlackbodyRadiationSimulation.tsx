
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Eye, Calculator, MessageCircle, Move, X, Star, Sun, Lightbulb, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Tooltip,
} from 'recharts';

const BlackbodyRadiationSimulation = () => {
  const navigate = useNavigate();
  const [temperatureCelsius, setTemperatureCelsius] = useState(2500);
  const [showVisibleSpectrum, setShowVisibleSpectrum] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPosition, setAssistantPosition] = useState({ x: 20, y: 100 });
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [activeTab, setActiveTab] = useState('graph');
  const [smartGuidePosition, setSmartGuidePosition] = useState({ x: 50, y: 50 });
  const [showSmartGuide, setShowSmartGuide] = useState(true);

  // Calculation inputs
  const [wavelengthInput, setWavelengthInput] = useState('');
  const [frequencyInput, setFrequencyInput] = useState('');
  const [energyInput, setEnergyInput] = useState('');
  const [levelInput, setLevelInput] = useState('');

  // Convert Celsius to Kelvin
  const temperatureKelvin = temperatureCelsius + 273.15;

  // Physical constants
  const h = 6.626e-34; // Planck constant
  const c = 3e8; // Speed of light
  const k = 1.381e-23; // Boltzmann constant

  // Planck's law function (clamped exponent to avoid Infinity/NaN artifacts at extreme T/λ)
  const planckFunction = (wavelength: number, temperature: number) => {
    const lambda = wavelength * 1e-9;
    const exponent = (h * c) / (lambda * k * Math.max(temperature, 1));
    if (!Number.isFinite(exponent) || exponent > 700) return 0;
    const expMinusOne = Math.exp(exponent) - 1;
    if (expMinusOne <= 0) return 0;
    const numerator = 2 * h * c * c;
    const denominator = Math.pow(lambda, 5) * expMinusOne;
    const val = numerator / denominator;
    return Number.isFinite(val) && val > 0 ? val : 0;
  };

  // Wien's displacement law
  const wienDisplacement = useMemo(() => {
    return (2.898e-3 / temperatureKelvin) * 1e9;
  }, [temperatureKelvin]);

  // Get wavelength color function
  const getWavelengthColor = (wavelength: number) => {
    if (wavelength < 380 || wavelength > 750) return 'rgba(128, 128, 128, 0.5)';
    
    let r = 0, g = 0, b = 0;
    
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0;
      g = (wavelength - 440) / (490 - 440);
      b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0;
      g = 1;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1;
      g = -(wavelength - 645) / (645 - 580);
      b = 0;
    } else if (wavelength >= 645 && wavelength <= 750) {
      r = 1;
      g = 0;
      b = 0;
    }

    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0.8)`;
  };

  // Generate plot data
  const plotData = useMemo(() => {
    const data = [];
    const startWavelength = 100;
    const endWavelength = 3000;
    const steps = 300;
    const stepSize = (endWavelength - startWavelength) / steps;

    for (let i = 0; i <= steps; i++) {
      const wavelength = startWavelength + i * stepSize;
      const intensity = planckFunction(wavelength, temperatureKelvin);
      
      data.push({
        wavelength,
        intensity: intensity / 1e13,
        color: getWavelengthColor(wavelength)
      });
    }
    return data;
  }, [temperatureKelvin]);

  // Smooth temperature update
  const [tempDisplayValue, setTempDisplayValue] = useState(temperatureCelsius);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTemperatureChange = (value: number[]) => {
    setTempDisplayValue(value[0]);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setTemperatureCelsius(value[0]);
    }, 30);
  };

  // Calculation functions
  const calculateFrequency = (wavelength: number) => {
    return (c / (wavelength * 1e-9)) / 1e12; // in THz
  };

  const calculateEnergy = (wavelength: number) => {
    const frequency = c / (wavelength * 1e-9);
    return (h * frequency) / (1.602e-19); // in eV
  };

  const calculateWavelengthFromFreq = (frequency: number) => {
    return (c / (frequency * 1e12)) * 1e9; // in nm
  };

  const calculateWavelengthFromEnergy = (energy: number) => {
    const frequency = (energy * 1.602e-19) / h;
    return (c / frequency) * 1e9; // in nm
  };

  const getColorFromWavelength = (wavelength: number) => {
    if (wavelength < 380) return 'فوق بنفسجي';
    if (wavelength < 450) return 'بنفسجي';
    if (wavelength < 495) return 'أزرق';
    if (wavelength < 570) return 'أخضر';
    if (wavelength < 590) return 'أصفر';
    if (wavelength < 620) return 'برتقالي';
    if (wavelength < 750) return 'أحمر';
    return 'تحت أحمر';
  };

  // Star examples
  const starExamples = [
    { name: 'الشمس', temp: 5500, icon: <Sun className="w-4 h-4" />, color: '#FFA500' },
    { name: 'سيريوس', temp: 9940, icon: <Star className="w-4 h-4" />, color: '#87CEEB' },
    { name: 'بيتلجوز', temp: 3500, icon: <Star className="w-4 h-4" />, color: '#FF4500' },
    { name: 'فيجا', temp: 9602, icon: <Star className="w-4 h-4" />, color: '#00BFFF' },
    { name: 'مصباح LED', temp: 6500, icon: <Lightbulb className="w-4 h-4" />, color: '#FFFFFF' },
    { name: 'شمعة', temp: 1800, icon: <Flame className="w-4 h-4" />, color: '#FF6347' }
  ];

  // Gemini AI Assistant
  const queryGeminiAPI = async (question: string) => {
    setIsLoadingResponse(true);
    try {
      // Goes through the ai-assistant edge function so the Gemini key stays on the server.
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt: `أنت مساعد ذكي متخصص في الفيزياء وإشعاع الجسم الأسود. أجب على السؤال التالي باللغة العربية بشكل علمي ومبسط: ${question}
                    
                    السياق الحالي:
                    - درجة الحرارة: ${temperatureCelsius}°C (${temperatureKelvin.toFixed(1)}K)
                    - طول موجة الذروة: ${wienDisplacement.toFixed(1)} نانومتر
                    `, useGemini: true },
      });

      if (!error && data?.response) {
        setAssistantResponse(data.response);
      } else {
        setAssistantResponse('عذراً، لم أتمكن من الحصول على إجابة. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error querying Gemini API:', error);
      setAssistantResponse('حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Handle assistant movement
  const handleAssistantDrag = (event: any, info: any) => {
    setAssistantPosition({
      x: assistantPosition.x + info.delta.x,
      y: assistantPosition.y + info.delta.y
    });
  };

  // Handle smart guide movement
  const handleSmartGuideDrag = (event: any, info: any) => {
    setSmartGuidePosition({
      x: smartGuidePosition.x + info.delta.x,
      y: smartGuidePosition.y + info.delta.y
    });
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للمحاكاة'}
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              محاكاة إشعاع الجسم الأسود المتطورة
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="graph" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              التمثيل البياني
            </TabsTrigger>
            <TabsTrigger value="calculations" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              الحسابات
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              المساعد الذكي
            </TabsTrigger>
          </TabsList>

          {/* Graph Tab */}
          <TabsContent value="graph" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Temperature Control */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-orange-300 flex items-center">
                      <Thermometer className="w-5 h-5 mr-2" />
                      التحكم في درجة الحرارة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white font-medium">درجة الحرارة (°C)</Label>
                        <Badge variant="outline" className="text-orange-300 border-orange-300">
                          {tempDisplayValue}°C
                        </Badge>
                      </div>
                      <Slider
                        value={[tempDisplayValue]}
                        onValueChange={handleTemperatureChange}
                        min={27}
                        max={10000}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>27°C</span>
                        <span>10000°C</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">درجة الحرارة (كلفن):</span>
                        <span className="text-white font-mono">{temperatureKelvin.toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">طول موجة الذروة:</span>
                        <span className="text-white font-mono">{wienDisplacement.toFixed(1)} nm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">الشدة القصوى:</span>
                        <span className="text-white font-mono">
                          {(plotData.reduce((max, point) => Math.max(max, point.intensity), 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">منطقة الطيف:</span>
                        <span className="text-white">
                          {wienDisplacement < 380 ? 'فوق البنفسجي' : 
                           wienDisplacement > 750 ? 'تحت الأحمر' : 'مرئي'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white">إعدادات العرض</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showSpectrum"
                          checked={showVisibleSpectrum}
                          onChange={(e) => setShowVisibleSpectrum(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="showSpectrum" className="text-sm text-gray-300">
                          إظهار الطيف المرئي
                        </Label>
                      </div>
                    </div>

                    {/* Star Examples */}
                    <div className="space-y-3">
                      <Label className="text-white">أمثلة من النجوم</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {starExamples.map((star) => (
                          <Button
                            key={star.name}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTempDisplayValue(star.temp);
                              setTemperatureCelsius(star.temp);
                            }}
                            className="text-xs flex items-center justify-between w-full"
                            style={{ borderColor: star.color + '60' }}
                          >
                            <span className="flex items-center">
                              <span className="mr-1" style={{ color: star.color }}>{star.icon}</span>
                              {star.name}
                            </span>
                            <span className="text-gray-400">{star.temp}°C</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Graph Area */}
              <div className="lg:col-span-3 space-y-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-200 flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Eye className="w-5 h-5 shrink-0" />
                        منحنى بلانك للإشعاع
                      </span>
                      <Badge variant="outline" className="text-blue-200 border-blue-300/60 bg-blue-950/30">
                        T = {temperatureCelsius}°C ({temperatureKelvin.toFixed(0)} K)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-5 pt-0 space-y-4">
                    {/* Clean seamless chart surface — no harsh black corners or clipping artifacts */}
                    <div className="w-full h-[320px] sm:h-[400px] lg:h-[450px] bg-slate-900/45 rounded-2xl p-2 sm:p-4 border border-white/15 overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={plotData}
                          margin={{ top: 24, right: 18, left: 10, bottom: 26 }}
                        >
                          <defs>
                            <linearGradient id="planckCurveFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34d399" stopOpacity={0.42} />
                              <stop offset="85%" stopColor="#38bdf8" stopOpacity={0.08} />
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="visibleSpectrumBand" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.28} />
                              <stop offset="22%" stopColor="#3b82f6" stopOpacity={0.28} />
                              <stop offset="45%" stopColor="#22c55e" stopOpacity={0.28} />
                              <stop offset="68%" stopColor="#eab308" stopOpacity={0.28} />
                              <stop offset="85%" stopColor="#f97316" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.28} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={true} />

                          <XAxis
                            dataKey="wavelength"
                            type="number"
                            domain={[100, 3000]}
                            ticks={[100, 380, 750, 1200, 1800, 2400, 3000]}
                            stroke="rgba(226,232,240,0.75)"
                            tickLine={{ stroke: 'rgba(226,232,240,0.4)' }}
                            axisLine={{ stroke: 'rgba(226,232,240,0.45)' }}
                            tick={{ fill: '#e2e8f0', fontSize: 11 }}
                            label={{
                              value: 'الطول الموجي (نانومتر)',
                              position: 'insideBottom',
                              offset: -14,
                              style: { textAnchor: 'middle', fill: '#cbd5e1', fontSize: 12, fontWeight: 600 },
                            }}
                          />
                          <YAxis
                            domain={[0, 'auto']}
                            stroke="rgba(226,232,240,0.75)"
                            tickLine={{ stroke: 'rgba(226,232,240,0.4)' }}
                            axisLine={{ stroke: 'rgba(226,232,240,0.45)' }}
                            tick={{ fill: '#e2e8f0', fontSize: 11 }}
                            width={52}
                            label={{
                              value: 'الشدة النسبية',
                              angle: -90,
                              position: 'insideLeft',
                              offset: 4,
                              style: { textAnchor: 'middle', fill: '#cbd5e1', fontSize: 12, fontWeight: 600 },
                            }}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.92)',
                              border: '1px solid rgba(148, 163, 184, 0.25)',
                              borderRadius: '12px',
                              color: '#f8fafc',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [Number(value).toFixed(3), 'الشدة النسبية']}
                            labelFormatter={(label) => `الطول الموجي: ${Math.round(Number(label))} nm`}
                          />

                          {/* True mathematically aligned visible spectrum band inside plot */}
                          {showVisibleSpectrum && (
                            <ReferenceArea
                              x1={380}
                              x2={750}
                              fill="url(#visibleSpectrumBand)"
                              stroke="rgba(255,255,255,0.22)"
                              strokeDasharray="3 3"
                              ifOverflow="hidden"
                            />
                          )}

                          {/* Peak wavelength indicator (only drawn inside visible X domain so no edge bleed) */}
                          {wienDisplacement >= 100 && wienDisplacement <= 3000 && (
                            <ReferenceLine
                              x={wienDisplacement}
                              stroke="#facc15"
                              strokeWidth={2.5}
                              strokeDasharray="5 5"
                              label={{
                                value: `الذروة ${wienDisplacement.toFixed(0)} nm`,
                                position: 'top',
                                fill: '#fde047',
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            />
                          )}

                          {/* Clean anti-aliased Planck curve with gradient fill (no black SVG filter artifacts) */}
                          <Area
                            type="monotone"
                            dataKey="intensity"
                            stroke="#34d399"
                            strokeWidth={3}
                            fill="url(#planckCurveFill)"
                            dot={false}
                            activeDot={{ r: 5, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                            isAnimationActive={false}
                            baseValue={0}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Clean Responsive Visible Spectrum Bar directly beneath chart — zero black edge blocks */}
                    {showVisibleSpectrum && (
                      <div className="rounded-xl bg-slate-900/35 border border-white/15 p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200 font-medium">
                          <span>نطاق الطيف المرئي (380 – 750 نانومتر)</span>
                          <span className="text-amber-300 font-mono">
                            ذروة فين: {wienDisplacement.toFixed(1)} nm ({getColorFromWavelength(wienDisplacement)})
                          </span>
                        </div>
                        <div
                          className="h-4 sm:h-5 w-full rounded-full border border-white/25 overflow-hidden shadow-inner"
                          style={{
                            background:
                              'linear-gradient(90deg, #6d28d9 0%, #4f46e5 14%, #2563eb 28%, #06b6d4 42%, #22c55e 56%, #eab308 72%, #f97316 86%, #ef4444 100%)',
                          }}
                        />
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 px-0.5">
                          <span>380 nm (بنفسجي)</span>
                          <span className="hidden sm:inline">550 nm (أخضر)</span>
                          <span>750 nm (أحمر)</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Physics Information */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-blue-300 mb-3">معلومات فيزيائية مهمة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-bold text-white">قانون بلانك:</h4>
                        <p className="text-gray-300">I(λ,T) = (2hc²/λ⁵) × 1/(e^(hc/λkT) - 1)</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-white">قانون فين:</h4>
                        <p className="text-gray-300">λmax = 2.898×10⁻³ / T</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Calculations Tab */}
          <TabsContent value="calculations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wavelength Calculations */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-blue-300">حسابات الطول الموجي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wavelength">طول الموجة (نانومتر)</Label>
                    <Input
                      id="wavelength"
                      type="number"
                      value={wavelengthInput}
                      onChange={(e) => setWavelengthInput(e.target.value)}
                      placeholder="أدخل طول الموجة..."
                      className="bg-white/10 border-gray-600"
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      const wavelength = parseFloat(wavelengthInput);
                      if (!isNaN(wavelength) && wavelength > 0) {
                        setFrequencyInput(calculateFrequency(wavelength).toFixed(4));
                        setEnergyInput(calculateEnergy(wavelength).toFixed(4));
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    حساب التردد والطاقة
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg">
                    <div>
                      <Label>التردد (تيراهرتز)</Label>
                      <div className="text-white font-mono text-lg bg-black/30 p-2 rounded mt-1 text-center">
                        {frequencyInput || '—'}
                      </div>
                    </div>
                    <div>
                      <Label>الطاقة (إلكترون فولت)</Label>
                      <div className="text-white font-mono text-lg bg-black/30 p-2 rounded mt-1 text-center">
                        {energyInput || '—'}
                      </div>
                    </div>
                    
                    {wavelengthInput && !isNaN(parseFloat(wavelengthInput)) && (
                      <div className="col-span-2">
                        <Label>اللون المقابل</Label>
                        <div 
                          className="text-white font-mono text-lg bg-black/30 p-2 rounded mt-1 text-center"
                          style={{
                            backgroundColor: parseFloat(wavelengthInput) >= 380 && parseFloat(wavelengthInput) <= 750 ? 
                              getWavelengthColor(parseFloat(wavelengthInput)) : 'transparent'
                          }}
                        >
                          {getColorFromWavelength(parseFloat(wavelengthInput))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Energy Level Calculations */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-green-300">حسابات مستويات الطاقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">رقم المستوى الطاقي (n)</Label>
                    <Input
                      id="level"
                      type="number"
                      value={levelInput}
                      onChange={(e) => setLevelInput(e.target.value)}
                      placeholder="أدخل رقم المستوى..."
                      className="bg-white/10 border-gray-600"
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      // Just for showing
                    }}
                    className="bg-green-600 hover:bg-green-700 w-full"
                  >
                    حساب طاقة المستوى
                  </Button>
                  
                  <div className="space-y-4 bg-gradient-to-br from-green-900/30 to-blue-900/30 p-4 rounded-lg">
                    <div>
                      <Label>طاقة المستوى (إلكترون فولت)</Label>
                      <div className="text-white font-mono text-lg bg-black/30 p-2 rounded mt-1 text-center">
                        {levelInput && !isNaN(parseInt(levelInput)) ? 
                          (-13.6 / Math.pow(parseInt(levelInput), 2)).toFixed(3) : '—'}
                      </div>
                    </div>
                    
                    <div>
                      <Label>الطول الموجي للانتقال إلى المستوى n=1 (نانومتر)</Label>
                      <div className="text-white font-mono text-lg bg-black/30 p-2 rounded mt-1 text-center">
                        {levelInput && !isNaN(parseInt(levelInput)) && parseInt(levelInput) > 1 ? 
                          (91.2 / (1 - 1 / Math.pow(parseInt(levelInput), 2))).toFixed(1) : '—'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-purple-300">تطبيقات إشعاع الجسم الأسود</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-4 rounded-lg">
                      <h4 className="text-white font-bold mb-2 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-300" />
                        الفلك والنجوم
                      </h4>
                      <p className="text-gray-300 text-sm">يستخدم لتحديد درجة حرارة النجوم وتصنيفها بناءً على لون وشدة الإشعاع.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 p-4 rounded-lg">
                      <h4 className="text-white font-bold mb-2 flex items-center">
                        <Thermometer className="w-5 h-5 mr-2 text-red-300" />
                        قياس درجات الحرارة
                      </h4>
                      <p className="text-gray-300 text-sm">موازين حرارة بالأشعة تحت الحمراء تعتمد على مبادئ إشعاع الجسم الأسود.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-900/30 to-yellow-900/30 p-4 rounded-lg">
                      <h4 className="text-white font-bold mb-2 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-300" />
                        الإضاءة والتصوير
                      </h4>
                      <p className="text-gray-300 text-sm">تصميم مصادر الإضاءة والكاميرات الحرارية يعتمد على فهم خصائص إشعاع الجسم الأسود.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assistant Tab */}
          <TabsContent value="assistant" className="space-y-6">
            <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  المساعد الذكي للفيزياء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg">
                  <p className="text-white">
                    اسأل أي سؤال عن إشعاع الجسم الأسود، قانون بلانك، قانون فين، أو أي مفهوم فيزيائي متعلق بالإشعاع الحراري والكهرومغناطيسي.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    placeholder="اسأل عن إشعاع الجسم الأسود..."
                    className="flex-1 bg-purple-800/50 border-purple-500/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && assistantQuery.trim()) {
                        queryGeminiAPI(assistantQuery);
                      }
                    }}
                  />
                  <Button
                    onClick={() => assistantQuery.trim() && queryGeminiAPI(assistantQuery)}
                    disabled={isLoadingResponse || !assistantQuery.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoadingResponse ? '...' : 'سؤال'}
                  </Button>
                </div>
                
                {assistantResponse && (
                  <div className="bg-purple-800/30 p-5 rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                      {assistantResponse}
                    </p>
                  </div>
                )}
                
                {!assistantResponse && !isLoadingResponse && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      'ما هو إشعاع الجسم الأسود؟',
                      'اشرح قانون فين',
                      'ما العلاقة بين درجة الحرارة واللون؟',
                      'كيف يتم استخدام إشعاع الجسم الأسود في الفلك؟',
                      'كيف أفسر منحنى بلانك؟',
                      'لماذا ظهور الطيف المستمر مهم في فيزياء الكم؟'
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-xs justify-start text-left bg-purple-900/30 border-purple-500/50 hover:bg-purple-800/50"
                        onClick={() => {
                          setAssistantQuery(question);
                          queryGeminiAPI(question);
                        }}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Draggable Smart Guide Icon */}
      {showSmartGuide && (
        <motion.div
          drag
          dragMomentum={false}
          onDrag={handleSmartGuideDrag}
          style={{
            position: 'fixed',
            left: smartGuidePosition.x,
            top: smartGuidePosition.y,
            zIndex: 1000
          }}
          className="cursor-move"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30"
            onClick={() => setShowAssistant(true)}
            animate={{ boxShadow: ['0 0 0 rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.8)', '0 0 0 rgba(139, 92, 246, 0.5)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      )}

      {/* Draggable AI Assistant */}
      {showAssistant && (
        <motion.div
          drag
          dragMomentum={false}
          onDrag={handleAssistantDrag}
          style={{
            position: 'fixed',
            left: assistantPosition.x,
            top: assistantPosition.y,
            zIndex: 1000
          }}
          className="w-96 max-w-[90vw]"
          whileDrag={{ scale: 1.05 }}
        >
          <Card className="bg-purple-900/95 backdrop-blur-sm border-purple-500/50 shadow-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-300 flex items-center text-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  المساعد الذكي للفيزياء
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-gray-400 cursor-move" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssistant(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="اسأل عن إشعاع الجسم الأسود..."
                  className="flex-1 bg-purple-800/50 border-purple-500/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && assistantQuery.trim()) {
                      queryGeminiAPI(assistantQuery);
                    }
                  }}
                />
                <Button
                  onClick={() => assistantQuery.trim() && queryGeminiAPI(assistantQuery)}
                  disabled={isLoadingResponse || !assistantQuery.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoadingResponse ? '...' : 'سؤال'}
                </Button>
              </div>
              
              {assistantResponse && (
                <div className="bg-purple-800/30 p-3 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                    {assistantResponse}
                  </p>
                </div>
              )}
              
              {!assistantResponse && !isLoadingResponse && (
                <div className="text-center text-purple-300 text-sm">
                  مرحباً! اسألني أي سؤال عن إشعاع الجسم الأسود والفيزياء
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BlackbodyRadiationSimulation;
