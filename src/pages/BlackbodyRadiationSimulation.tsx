
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Camera, Play, Pause, RotateCcw, Settings, Info, Thermometer, Zap, ZoomIn, ZoomOut, Bot, Calculator, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import * as Plotly from 'plotly.js-dist';

const BlackbodyRadiationSimulation = () => {
  const navigate = useNavigate();
  const plotRef = useRef<HTMLDivElement>(null);
  const [temperature, setTemperature] = useState([5778]); // Sun's temperature
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPeakWavelength, setShowPeakWavelength] = useState(true);
  const [showVisibleSpectrum, setShowVisibleSpectrum] = useState(true);
  const [logScale, setLogScale] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('sun');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Calculator states
  const [wavelength, setWavelength] = useState(500);
  const [frequency, setFrequency] = useState(0);
  const [photonEnergy, setPhotonEnergy] = useState(0);

  const presets = {
    'human': { temp: 310, name: 'جسم الإنسان (37°C)', color: '#ff6b6b' },
    'room': { temp: 293, name: 'درجة حرارة الغرفة (20°C)', color: '#4ecdc4' },
    'ice': { temp: 273, name: 'نقطة تجمد الماء (0°C)', color: '#45b7d1' },
    'sun': { temp: 5778, name: 'سطح الشمس', color: '#f39c12' },
    'incandescent': { temp: 2700, name: 'مصباح متوهج', color: '#e67e22' },
    'candle': { temp: 1000, name: 'شمعة مشتعلة', color: '#d35400' },
    'star_hot': { temp: 10000, name: 'نجم ساخن', color: '#3498db' },
    'star_cool': { temp: 3000, name: 'نجم بارد', color: '#e74c3c' }
  };

  // Physical constants
  const h = 6.62607015e-34; // Planck constant
  const c = 299792458; // Speed of light
  const k = 1.380649e-23; // Boltzmann constant

  // Planck's law calculation
  const calculatePlanckFunction = (wavelength: number, temp: number) => {
    const wl = wavelength * 1e-9; // Convert nm to meters
    const exponential = Math.exp((h * c) / (wl * k * temp)) - 1;
    
    if (exponential === 0) return 0;
    
    return (2 * h * c * c) / (Math.pow(wl, 5) * exponential);
  };

  // Wien's displacement law
  const calculatePeakWavelength = (temp: number) => {
    const b = 2.897771955e-3; // Wien displacement constant
    return (b / temp) * 1e9; // Convert to nanometers
  };

  // Stefan-Boltzmann law
  const calculateTotalPower = (temp: number) => {
    const sigma = 5.670374419e-8; // Stefan-Boltzmann constant
    return sigma * Math.pow(temp, 4);
  };

  // Calculate frequency from wavelength
  const calculateFrequency = (wl: number) => {
    return c / (wl * 1e-9); // Hz
  };

  // Calculate photon energy
  const calculatePhotonEnergy = (wl: number) => {
    const freq = calculateFrequency(wl);
    return h * freq / 1.602176634e-19; // Convert to eV
  };

  // Get wavelength color
  const getWavelengthColor = (wavelength: number) => {
    if (wavelength < 380 || wavelength > 750) return 'rgba(128, 128, 128, 0.3)';
    
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
    
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  };

  // Generate data for plotting
  const generatePlotData = () => {
    const wavelengths = [];
    const intensities = [];
    const colors = [];
    
    // Generate wavelength range from 100nm to 3000nm
    for (let wl = 100; wl <= 3000; wl += 5) {
      wavelengths.push(wl);
      const intensity = calculatePlanckFunction(wl, temperature[0]);
      intensities.push(logScale ? Math.log10(intensity + 1e-20) : intensity);
      colors.push(getWavelengthColor(wl));
    }

    const peakWl = calculatePeakWavelength(temperature[0]);
    const peakIntensity = calculatePlanckFunction(peakWl, temperature[0]);

    return {
      wavelengths,
      intensities,
      colors,
      peakWl,
      peakIntensity: logScale ? Math.log10(peakIntensity + 1e-20) : peakIntensity
    };
  };

  // Update plot
  const updatePlot = () => {
    if (!plotRef.current) return;

    const data = generatePlotData();
    
    const trace = {
      x: data.wavelengths,
      y: data.intensities,
      type: 'scatter',
      mode: 'lines',
      name: `T = ${temperature[0]} K`,
      line: {
        color: presets[selectedPreset as keyof typeof presets]?.color || '#3498db',
        width: 3
      }
    };

    // Visible spectrum background
    const visibleSpectrumTrace = showVisibleSpectrum ? {
      x: [380, 380, 750, 750, 380],
      y: [Math.min(...data.intensities), Math.max(...data.intensities), Math.max(...data.intensities), Math.min(...data.intensities), Math.min(...data.intensities)],
      fill: 'toself',
      fillcolor: 'rgba(255, 255, 255, 0.1)',
      line: { color: 'rgba(255, 255, 255, 0.3)', width: 1 },
      name: 'الطيف المرئي',
      type: 'scatter',
      mode: 'lines'
    } : null;

    const peakTrace = showPeakWavelength ? {
      x: [data.peakWl],
      y: [data.peakIntensity],
      type: 'scatter',
      mode: 'markers',
      name: `ذروة الطول الموجي: ${data.peakWl.toFixed(0)} nm`,
      marker: {
        color: '#e74c3c',
        size: 15,
        symbol: 'star',
        line: { color: '#fff', width: 2 }
      }
    } : null;

    const layout = {
      title: {
        text: `منحنى إشعاع الجسم الأسود - درجة الحرارة: ${temperature[0]} K`,
        font: { size: 20, color: '#fff', family: 'Arial' }
      },
      xaxis: {
        title: {
          text: 'الطول الموجي (نانومتر)',
          font: { size: 16, color: '#fff' }
        },
        color: '#fff',
        gridcolor: '#444',
        range: [100 / zoomLevel, 3000 / zoomLevel],
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#666'
      },
      yaxis: {
        title: {
          text: logScale ? 'شدة الإشعاع (لوغاريتمي)' : 'شدة الإشعاع (W⋅sr⁻¹⋅m⁻³)',
          font: { size: 16, color: '#fff' }
        },
        color: '#fff',
        gridcolor: '#444',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#666'
      },
      plot_bgcolor: 'rgba(0,0,0,0.1)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#fff', family: 'Arial' },
      margin: { t: 80, b: 80, l: 100, r: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(0,0,0,0.5)',
        bordercolor: '#fff',
        borderwidth: 1
      }
    };

    const traces = [trace];
    if (visibleSpectrumTrace) traces.unshift(visibleSpectrumTrace);
    if (peakTrace) traces.push(peakTrace);

    Plotly.newPlot(plotRef.current, traces, layout, { 
      responsive: true, 
      displayModeBar: true,
      modeBarButtonsToAdd: ['pan2d', 'select2d', 'lasso2d']
    });
  };

  // Calculator functions
  useEffect(() => {
    const freq = calculateFrequency(wavelength);
    const energy = calculatePhotonEnergy(wavelength);
    setFrequency(freq);
    setPhotonEnergy(energy);
  }, [wavelength]);

  // Animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        setTemperature(prev => {
          const newTemp = prev[0] + (Math.random() - 0.5) * 100;
          return [Math.max(273, Math.min(10000, newTemp))];
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Update plot when parameters change
  useEffect(() => {
    updatePlot();
  }, [temperature, showPeakWavelength, showVisibleSpectrum, logScale, zoomLevel]);

  // Screenshot function
  const takeScreenshot = () => {
    if (plotRef.current) {
      Plotly.toImage(plotRef.current, { format: 'png', width: 1200, height: 800 })
        .then((url) => {
          const link = document.createElement('a');
          link.download = `blackbody_radiation_${temperature[0]}K.png`;
          link.href = url;
          link.click();
        });
    }
  };

  // Export data function
  const exportData = () => {
    const data = generatePlotData();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Wavelength(nm),Intensity\n" +
      data.wavelengths.map((wl, i) => `${wl},${data.intensities[i]}`).join("\n");
    
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `blackbody_data_${temperature[0]}K.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Enhanced Header with Toolbar */}
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
            
            {/* Advanced Toolbar */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 10))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 0.1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCalculator(!showCalculator)}>
                <Calculator className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAIAssistant(!showAIAssistant)}>
                <Bot className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={takeScreenshot}>
                <Camera className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Control Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-300">
                  <Settings className="w-5 h-5 mr-2" />
                  لوحة التحكم المتطورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Temperature Control */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block flex items-center">
                    <Thermometer className="w-4 h-4 mr-1" />
                    درجة الحرارة: {temperature[0]} K ({(temperature[0] - 273.15).toFixed(1)}°C)
                  </label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={273}
                    max={10000}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Zoom Control */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">مستوى التكبير: {zoomLevel.toFixed(1)}x</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 10))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.1))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoomLevel(1)}>
                      إعادة تعيين
                    </Button>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">الإعدادات المسبقة</label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(presets).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant={selectedPreset === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedPreset(key);
                          setTemperature([preset.temp]);
                        }}
                        className="text-xs justify-start"
                      >
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: preset.color }}></div>
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Animation Controls */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">التحكم في الحركة</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAnimating(!isAnimating)}
                    >
                      {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isAnimating ? 'إيقاف' : 'تشغيل'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAnimating(false);
                        setTemperature([5778]);
                        setZoomLevel(1);
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      إعادة تعيين
                    </Button>
                  </div>
                </div>

                {/* Enhanced Display Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">خيارات العرض المتطورة</label>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">إظهار ذروة الطول الموجي</span>
                    <Switch
                      checked={showPeakWavelength}
                      onCheckedChange={setShowPeakWavelength}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">إظهار الطيف المرئي</span>
                    <Switch
                      checked={showVisibleSpectrum}
                      onCheckedChange={setShowVisibleSpectrum}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">المقياس اللوغاريتمي</span>
                    <Switch
                      checked={logScale}
                      onCheckedChange={setLogScale}
                    />
                  </div>
                </div>

                {/* Enhanced Information Panel */}
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-bold text-blue-300 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    معلومات فيزيائية متقدمة
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-300">ذروة الطول الموجي:</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {calculatePeakWavelength(temperature[0]).toFixed(0)} nm
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-300">التردد عند الذروة:</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {(calculateFrequency(calculatePeakWavelength(temperature[0])) / 1e12).toFixed(2)} THz
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-300">القدرة الإجمالية:</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {calculateTotalPower(temperature[0]).toExponential(2)} W/m²
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physics Calculator */}
            {showCalculator && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-300">
                    <Calculator className="w-5 h-5 mr-2" />
                    حاسبة الفيزياء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      الطول الموجي (nm): {wavelength}
                    </label>
                    <Slider
                      value={[wavelength]}
                      onValueChange={(value) => setWavelength(value[0])}
                      min={100}
                      max={3000}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">التردد:</span>
                      <span className="text-white">{(frequency / 1e12).toFixed(2)} THz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">طاقة الفوتون:</span>
                      <span className="text-white">{photonEnergy.toFixed(3)} eV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">اللون:</span>
                      <div className="w-6 h-4 rounded border" style={{ backgroundColor: getWavelengthColor(wavelength) }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Main Plot */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[700px]">
              <CardContent className="p-4 h-full">
                <div ref={plotRef} className="w-full h-full" />
              </CardContent>
            </Card>

            {/* Visible Spectrum Bar */}
            {showVisibleSpectrum && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Waves className="w-5 h-5 mr-2" />
                    الطيف المرئي (380-750 nm)
                  </h3>
                  <div className="h-12 rounded-lg overflow-hidden flex">
                    {Array.from({ length: 370 }, (_, i) => {
                      const wl = 380 + i;
                      return (
                        <div
                          key={wl}
                          className="flex-1 h-full cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: getWavelengthColor(wl) }}
                          title={`${wl} nm`}
                          onClick={() => setWavelength(wl)}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-2">
                    <span>بنفسجي (380nm)</span>
                    <span>أزرق (450nm)</span>
                    <span>أخضر (550nm)</span>
                    <span>أصفر (580nm)</span>
                    <span>أحمر (700nm)</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Assistant */}
            {showAIAssistant && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-300">
                    <Bot className="w-5 h-5 mr-2" />
                    المساعد الذكي للفيزياء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 h-32 overflow-y-auto">
                    <p className="text-gray-300 text-sm">
                      مرحباً! أنا مساعدك الذكي لفهم إشعاع الجسم الأسود. يمكنني الإجابة على أسئلتك حول:
                      <br />• قانون بلانك وتوزيع الطاقة
                      <br />• قانون فين وإزاحة الذروة  
                      <br />• قانون ستيفان-بولتزمان
                      <br />• علاقة الطول الموجي بالتردد والطاقة
                      <br />• تطبيقات عملية في الحياة
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اسأل عن أي موضوع في الفيزياء..."
                      className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                    />
                    <Button size="sm">
                      إرسال
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Educational Info */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-4">المفاهيم الفيزيائية الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      قانون بلانك
                    </h4>
                    <p className="text-gray-300">يصف توزيع الطاقة الطيفية للإشعاع المنبعث من جسم أسود مثالي عند درجة حرارة معينة</p>
                    <div className="mt-2 text-xs text-blue-300">
                      E = (8πhc/λ⁵) × 1/(e^(hc/λkT) - 1)
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <Thermometer className="w-4 h-4 mr-1" />
                      قانون فين
                    </h4>
                    <p className="text-gray-300">يحدد الطول الموجي للذروة بناءً على درجة الحرارة</p>
                    <div className="mt-2 text-xs text-green-300">
                      λmax = b/T = 2.898×10⁻³/T
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <Waves className="w-4 h-4 mr-1" />
                      قانون ستيفان-بولتزمان
                    </h4>
                    <p className="text-gray-300">القدرة الإجمالية المشعة تتناسب مع القوة الرابعة لدرجة الحرارة</p>
                    <div className="mt-2 text-xs text-red-300">
                      P = σT⁴ = 5.67×10⁻⁸T⁴
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackbodyRadiationSimulation;
