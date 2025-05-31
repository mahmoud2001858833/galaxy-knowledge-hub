import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Camera, RotateCcw, Settings, Calculator, Bot, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Plotly from 'plotly.js-dist';

const BlackbodyRadiationSimulation = () => {
  const navigate = useNavigate();
  const plotRef = useRef<HTMLDivElement>(null);
  const [temperature, setTemperature] = useState([5778]); // Sun's temperature
  const [showPeakWavelength, setShowPeakWavelength] = useState(true);
  const [showVisibleSpectrum, setShowVisibleSpectrum] = useState(true);
  const [showIntensityValues, setShowIntensityValues] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('sun');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Calculator states
  const [wavelength, setWavelength] = useState(500);
  const [frequency, setFrequency] = useState(0);
  const [photonEnergy, setPhotonEnergy] = useState(0);

  // AI Assistant states
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('مرحباً! أنا مساعدك الذكي لفهم إشعاع الجسم الأسود. يمكنني الإجابة على أسئلتك حول قوانين بلانك وفين وستيفان-بولتزمان.');

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
      intensities.push(intensity);
      colors.push(getWavelengthColor(wl));
    }

    const peakWl = calculatePeakWavelength(temperature[0]);
    const peakIntensity = calculatePlanckFunction(peakWl, temperature[0]);

    return {
      wavelengths,
      intensities,
      colors,
      peakWl,
      peakIntensity
    };
  };

  // Update plot
  const updatePlot = () => {
    if (!plotRef.current) return;

    const data = generatePlotData();
    
    const traces = [];

    // Visible spectrum background with gradient colors
    if (showVisibleSpectrum) {
      const visibleWavelengths = [];
      const visibleColors = [];
      for (let wl = 380; wl <= 750; wl += 10) {
        visibleWavelengths.push(wl);
        visibleColors.push(getWavelengthColor(wl));
      }
      
      traces.push({
        x: visibleWavelengths,
        y: visibleWavelengths.map(() => Math.max(...data.intensities) * 1.15),
        type: 'bar',
        marker: {
          color: visibleColors,
          line: { width: 0 }
        },
        name: 'الطيف المرئي',
        showlegend: true,
        hovertemplate: 'الطول الموجي: %{x} nm<extra></extra>'
      });
    }

    // Main curve with color segments for visible spectrum
    for (let i = 0; i < data.wavelengths.length - 1; i++) {
      const wl = data.wavelengths[i];
      const color = wl >= 380 && wl <= 750 ? data.colors[i] : '#888888';
      
      traces.push({
        x: [data.wavelengths[i], data.wavelengths[i + 1]],
        y: [data.intensities[i], data.intensities[i + 1]],
        type: 'scatter',
        mode: 'lines',
        line: {
          color: color,
          width: 3
        },
        showlegend: false,
        hovertemplate: `الطول الموجي: %{x} nm<br>الشدة: %{y:.2e}<extra></extra>`
      });
    }

    // Peak wavelength marker
    if (showPeakWavelength) {
      traces.push({
        x: [data.peakWl],
        y: [data.peakIntensity],
        type: 'scatter',
        mode: 'markers+text',
        name: `ذروة الطول الموجي: ${data.peakWl.toFixed(0)} nm`,
        text: ['ذروة'],
        textposition: 'top center',
        marker: {
          color: '#ff0000',
          size: 15,
          symbol: 'star',
          line: { color: '#fff', width: 2 }
        },
        hovertemplate: `ذروة الطول الموجي: ${data.peakWl.toFixed(0)} nm<br>الشدة: ${data.peakIntensity.toExponential(2)}<extra></extra>`
      });
    }

    const layout = {
      title: {
        text: `منحنى إشعاع الجسم الأسود - ${temperature[0]} K (${(temperature[0] - 273.15).toFixed(1)}°C)`,
        font: { size: 18, color: '#fff', family: 'Arial' }
      },
      xaxis: {
        title: {
          text: 'الطول الموجي (نانومتر)',
          font: { size: 14, color: '#fff' }
        },
        color: '#fff',
        gridcolor: '#333',
        range: [100 / zoomLevel, 3000 / zoomLevel],
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#555'
      },
      yaxis: {
        title: {
          text: 'شدة الإشعاع (W⋅sr⁻¹⋅m⁻³)',
          font: { size: 14, color: '#fff' }
        },
        color: '#fff',
        gridcolor: '#333',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#555',
        tickformat: '.2e'
      },
      plot_bgcolor: '#000000',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#fff', family: 'Arial' },
      margin: { t: 70, b: 70, l: 100, r: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(0,0,0,0.7)',
        bordercolor: '#fff',
        borderwidth: 1,
        font: { color: '#fff' }
      }
    };

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

  // Update plot when parameters change
  useEffect(() => {
    updatePlot();
  }, [temperature, showPeakWavelength, showVisibleSpectrum, showIntensityValues, zoomLevel]);

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

  const handleAIQuestion = () => {
    if (!assistantInput.trim()) return;
    
    // Simple response logic for demonstration
    let response = "عذراً، لم أتمكن من فهم سؤالك. يمكنك السؤال عن قوانين بلانك، فين، أو ستيفان-بولتزمان.";
    
    const input = assistantInput.toLowerCase();
    if (input.includes('بلانك')) {
      response = "قانون بلانك يصف توزيع الطاقة الطيفية للإشعاع المنبعث من جسم أسود مثالي. الصيغة هي: E = (8πhc/λ⁵) × 1/(e^(hc/λkT) - 1)";
    } else if (input.includes('فين')) {
      response = `قانون فين ينص على أن الطول الموجي للذروة يتناسب عكسياً مع درجة الحرارة. λmax = b/T حيث b = 2.898×10⁻³ م⋅ك. عند ${temperature[0]} K، الذروة عند ${calculatePeakWavelength(temperature[0]).toFixed(0)} nm`;
    } else if (input.includes('ستيفان') || input.includes('بولتزمان')) {
      response = `قانون ستيفان-بولتزمان ينص على أن القدرة الإجمالية المشعة تتناسب مع القوة الرابعة لدرجة الحرارة. P = σT⁴ حيث σ = 5.67×10⁻⁸ W⋅m⁻²⋅K⁻⁴. عند ${temperature[0]} K، القدرة = ${calculateTotalPower(temperature[0]).toExponential(2)} W/m²`;
    }
    
    setAssistantResponse(response);
    setAssistantInput('');
  };

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
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={takeScreenshot}>
                <Camera className="w-4 h-4 mr-1" />
                لقطة شاشة
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-1" />
                تصدير البيانات
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs defaultValue="graph" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="graph" className="flex items-center gap-2">
              <Waves className="w-4 h-4" />
              التمثيل البياني
            </TabsTrigger>
            <TabsTrigger value="calculations" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              الحسابات
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              المساعد الذكي
            </TabsTrigger>
          </TabsList>

          {/* Graph Tab - New Side-by-side Layout */}
          <TabsContent value="graph">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Control Panel - Left Side */}
              <div className="lg:col-span-1">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-blue-300 mb-4">التحكم في درجة الحرارة</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">
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

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">الإعدادات المسبقة</label>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(presets).slice(0, 4).map(([key, preset]) => (
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
                                {preset.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showPeakWavelength}
                              onCheckedChange={setShowPeakWavelength}
                            />
                            <span className="text-sm text-gray-300">إظهار الذروة</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showVisibleSpectrum}
                              onCheckedChange={setShowVisibleSpectrum}
                            />
                            <span className="text-sm text-gray-300">الطيف المرئي</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showIntensityValues}
                              onCheckedChange={setShowIntensityValues}
                            />
                            <span className="text-sm text-gray-300">قيم الشدة</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 10))}
                            className="flex-1"
                          >
                            تكبير
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 0.1))}
                            className="flex-1"
                          >
                            تصغير
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemperature([5778]);
                            setZoomLevel(1);
                          }}
                          className="w-full"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          إعادة تعيين
                        </Button>

                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-300">الذروة:</span>
                              <Badge variant="outline">{calculatePeakWavelength(temperature[0]).toFixed(0)} nm</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">القدرة الإجمالية:</span>
                              <Badge variant="outline">{calculateTotalPower(temperature[0]).toExponential(1)} W/m²</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graph - Right Side */}
              <div className="lg:col-span-3">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div ref={plotRef} className="w-full h-[600px]" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Calculations Tab */}
          <TabsContent value="calculations">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-green-300">
                  <Calculator className="w-5 h-5 mr-2" />
                  حاسبة الفيزياء المتطورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-300 mb-3">القيم المحسوبة</h4>
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
                        <div className="w-8 h-4 rounded border" style={{ backgroundColor: getWavelengthColor(wavelength) }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-300 mb-3">معلومات إضافية</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">الذروة عند درجة الحرارة:</span>
                        <span className="text-white">{calculatePeakWavelength(temperature[0]).toFixed(0)} nm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">القدرة الإجمالية:</span>
                        <span className="text-white">{calculateTotalPower(temperature[0]).toExponential(2)} W/m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">نوع الإشعاع:</span>
                        <span className="text-white">
                          {wavelength < 380 ? 'فوق بنفسجي' : 
                           wavelength > 750 ? 'تحت أحمر' : 'مرئي'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/30 p-4 rounded-lg">
                  <h4 className="font-bold text-green-300 mb-3">القوانين الفيزيائية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-300 font-medium">قانون بلانك:</span>
                      <p className="text-gray-300 mt-1">E = (8πhc/λ⁵) × 1/(e^(hc/λkT) - 1)</p>
                    </div>
                    <div>
                      <span className="text-green-300 font-medium">قانون فين:</span>
                      <p className="text-gray-300 mt-1">λmax = b/T = 2.898×10⁻³/T</p>
                    </div>
                    <div>
                      <span className="text-green-300 font-medium">قانون ستيفان-بولتزمان:</span>
                      <p className="text-gray-300 mt-1">P = σT⁴ = 5.67×10⁻⁸T⁴</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="assistant">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-300">
                  <Bot className="w-5 h-5 mr-2" />
                  المساعد الذكي للفيزياء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 h-64 overflow-y-auto border border-gray-600">
                  <p className="text-gray-300 text-sm leading-relaxed">{assistantResponse}</p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
                    placeholder="اسأل عن قوانين بلانك، فين، أو ستيفان-بولتزمان..."
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <Button onClick={handleAIQuestion} size="sm">
                    إرسال
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-300 mb-3">أسئلة مقترحة</h4>
                    <div className="space-y-2">
                      {[
                        'ما هو قانون بلانك؟',
                        'كيف يعمل قانون فين؟',
                        'ما هو قانون ستيفان-بولتزمان؟',
                        'لماذا تختلف ألوان النجوم؟'
                      ].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setAssistantInput(question)}
                          className="w-full text-left text-sm text-blue-200 hover:text-blue-100 p-2 rounded bg-blue-800/20 hover:bg-blue-800/40 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-300 mb-3">معلومات سريعة</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-purple-300">درجة الحرارة الحالية:</span> {temperature[0]} K
                      </p>
                      <p className="text-gray-300">
                        <span className="text-purple-300">ذروة الطول الموجي:</span> {calculatePeakWavelength(temperature[0]).toFixed(0)} nm
                      </p>
                      <p className="text-gray-300">
                        <span className="text-purple-300">نوع الذروة:</span> {
                          calculatePeakWavelength(temperature[0]) < 380 ? 'فوق بنفسجي' :
                          calculatePeakWavelength(temperature[0]) > 750 ? 'تحت أحمر' : 'مرئي'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlackbodyRadiationSimulation;
