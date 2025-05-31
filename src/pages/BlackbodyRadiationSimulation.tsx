
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Eye, Calculator, MessageCircle, Move, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

const BlackbodyRadiationSimulation = () => {
  const navigate = useNavigate();
  const [temperatureCelsius, setTemperatureCelsius] = useState(2500); // Start with 2500°C
  const [showVisibleSpectrum, setShowVisibleSpectrum] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPosition, setAssistantPosition] = useState({ x: 20, y: 100 });
  const [isDraggingAssistant, setIsDraggingAssistant] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  // Convert Celsius to Kelvin
  const temperatureKelvin = temperatureCelsius + 273.15;

  // Physical constants
  const h = 6.626e-34; // Planck constant
  const c = 3e8; // Speed of light
  const k = 1.381e-23; // Boltzmann constant

  // Planck's law function with smoother calculation
  const planckFunction = (wavelength: number, temperature: number) => {
    const lambda = wavelength * 1e-9; // Convert nm to meters
    const numerator = 2 * h * c * c;
    const denominator = Math.pow(lambda, 5) * (Math.exp((h * c) / (lambda * k * temperature)) - 1);
    return numerator / denominator;
  };

  // Wien's displacement law
  const wienDisplacement = useMemo(() => {
    return (2.898e-3 / temperatureKelvin) * 1e9; // in nanometers
  }, [temperatureKelvin]);

  // Generate smooth data for the plot
  const plotData = useMemo(() => {
    const data = [];
    const startWavelength = 100;
    const endWavelength = 3000;
    const steps = 200; // Increased steps for smoother curve
    const stepSize = (endWavelength - startWavelength) / steps;

    for (let i = 0; i <= steps; i++) {
      const wavelength = startWavelength + i * stepSize;
      const intensity = planckFunction(wavelength, temperatureKelvin);
      
      data.push({
        wavelength,
        intensity: intensity / 1e13, // Normalize for display
        color: getWavelengthColor(wavelength)
      });
    }
    return data;
  }, [temperatureKelvin]);

  // Get color based on wavelength
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

  // Smooth temperature update with debouncing
  const [tempDisplayValue, setTempDisplayValue] = useState(temperatureCelsius);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTemperatureChange = (value: number[]) => {
    setTempDisplayValue(value[0]);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setTemperatureCelsius(value[0]);
    }, 50); // Faster update for smoother experience
  };

  // Gemini AI Assistant functions
  const queryGeminiAPI = async (question: string) => {
    setIsLoadingResponse(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDR0bf_lLE8A83mionE3IT5gAH3Z8-O-MA`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `أنت مساعد ذكي متخصص في الفيزياء وإشعاع الجسم الأسود. أجب على السؤال التالي باللغة العربية بشكل علمي ومبسط: ${question}
                    
                    السياق الحالي:
                    - درجة الحرارة: ${temperatureCelsius}°C (${temperatureKelvin.toFixed(1)}K)
                    - طول موجة الذروة: ${wienDisplacement.toFixed(1)} نانومتر
                    `
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setAssistantResponse(data.candidates[0].content.parts[0].text);
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

  // Cleanup timeout on unmount
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
              onClick={() => navigate('/scientific-simulations')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              العودة للمحاكاة
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              محاكاة إشعاع الجسم الأسود المتطورة
            </h1>
            <Button
              onClick={() => setShowAssistant(!showAssistant)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              المساعد الذكي
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Temperature Control Panel - Now side by side with graph */}
          <div className="lg:col-span-1 space-y-6">
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
                    <Label className="text-white font-medium">درجة الحرارة (سيلسيوس)</Label>
                    <Badge variant="outline" className="text-orange-300 border-orange-300">
                      {tempDisplayValue}°C
                    </Badge>
                  </div>
                  <Slider
                    value={[tempDisplayValue]}
                    onValueChange={handleTemperatureChange}
                    min={27}
                    max={6000}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>27°C</span>
                    <span>6000°C</span>
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

                {/* Quick Temperature Presets */}
                <div className="space-y-3">
                  <Label className="text-white">إعدادات سريعة</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'الشمس', temp: 5500 },
                      { name: 'النار', temp: 1200 },
                      { name: 'المصباح', temp: 2700 },
                      { name: 'الليزر الأحمر', temp: 700 }
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempDisplayValue(preset.temp);
                          setTemperatureCelsius(preset.temp);
                        }}
                        className="text-xs"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Graph Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[600px]">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    منحنى بلانك للإشعاع
                  </span>
                  <Badge variant="outline" className="text-blue-300 border-blue-300">
                    T = {temperatureCelsius}°C
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="relative h-full">
                  {/* Enhanced Chart with smooth curves */}
                  <div className="h-full bg-gradient-to-br from-black/80 to-gray-900/80 rounded-lg p-4 border border-gray-600/30">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={plotData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="wavelength" 
                          stroke="white"
                          label={{ value: 'الطول الموجي (نانومتر)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'white' } }}
                          tick={{ fill: 'white', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="white"
                          label={{ value: 'الشدة النسبية', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
                          tick={{ fill: 'white', fontSize: 12 }}
                        />
                        
                        {/* Visible spectrum background */}
                        {showVisibleSpectrum && (
                          <>
                            {/* Violet */}
                            <ReferenceLine x={380} stroke="rgba(148, 0, 211, 0.6)" strokeWidth={8} />
                            <ReferenceLine x={420} stroke="rgba(75, 0, 130, 0.6)" strokeWidth={8} />
                            {/* Blue */}
                            <ReferenceLine x={450} stroke="rgba(0, 0, 255, 0.6)" strokeWidth={8} />
                            <ReferenceLine x={490} stroke="rgba(0, 100, 255, 0.6)" strokeWidth={8} />
                            {/* Green */}
                            <ReferenceLine x={520} stroke="rgba(0, 255, 0, 0.6)" strokeWidth={8} />
                            <ReferenceLine x={560} stroke="rgba(127, 255, 0, 0.6)" strokeWidth={8} />
                            {/* Yellow */}
                            <ReferenceLine x={580} stroke="rgba(255, 255, 0, 0.6)" strokeWidth={8} />
                            <ReferenceLine x={600} stroke="rgba(255, 165, 0, 0.6)" strokeWidth={8} />
                            {/* Red */}
                            <ReferenceLine x={650} stroke="rgba(255, 0, 0, 0.6)" strokeWidth={8} />
                            <ReferenceLine x={750} stroke="rgba(139, 0, 0, 0.6)" strokeWidth={8} />
                          </>
                        )}
                        
                        {/* Peak wavelength indicator */}
                        <ReferenceLine 
                          x={wienDisplacement} 
                          stroke="yellow" 
                          strokeWidth={3} 
                          strokeDasharray="5 5"
                          label={{ value: "ذروة الإشعاع", position: "top", style: { fill: 'yellow', fontWeight: 'bold' } }}
                        />
                        
                        {/* Main curve with enhanced styling */}
                        <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          stroke="url(#gradient)" 
                          strokeWidth={3}
                          dot={false}
                          connectNulls={false}
                        />
                        
                        {/* Gradient definition for the line */}
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff0000" />
                            <stop offset="16.67%" stopColor="#ff8800" />
                            <stop offset="33.33%" stopColor="#ffff00" />
                            <stop offset="50%" stopColor="#00ff00" />
                            <stop offset="66.67%" stopColor="#0088ff" />
                            <stop offset="83.33%" stopColor="#0000ff" />
                            <stop offset="100%" stopColor="#8800ff" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Visible spectrum bar overlay */}
                  {showVisibleSpectrum && (
                    <div className="absolute bottom-16 left-20 right-8 h-6 rounded-md overflow-hidden border border-white/30">
                      <div className="h-full bg-gradient-to-r from-purple-600 via-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-600"></div>
                      <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-2">
                        <span className="text-xs text-white font-bold bg-black/50 px-1 rounded">380nm</span>
                        <span className="text-xs text-white font-bold bg-black/50 px-1 rounded">750nm</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Physics Information */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
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
      </div>

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
