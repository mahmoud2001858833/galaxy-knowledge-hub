
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Camera, Play, Pause, RotateCcw, Settings, Info, Thermometer, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Plotly from 'plotly.js-dist';

const BlackbodyRadiationSimulation = () => {
  const navigate = useNavigate();
  const plotRef = useRef<HTMLDivElement>(null);
  const [temperature, setTemperature] = useState([5778]); // Sun's temperature
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPeakWavelength, setShowPeakWavelength] = useState(true);
  const [showStefanBoltzmann, setShowStefanBoltzmann] = useState(true);
  const [logScale, setLogScale] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('sun');

  const presets = {
    'human': { temp: 310, name: 'جسم الإنسان (37°C)', color: '#ff6b6b' },
    'room': { temp: 293, name: 'درجة حرارة الغرفة (20°C)', color: '#4ecdc4' },
    'ice': { temp: 273, name: 'نقطة تجمد الماء (0°C)', color: '#45b7d1' },
    'sun': { temp: 5778, name: 'سطح الشمس', color: '#f39c12' },
    'incandescent': { temp: 2700, name: 'مصباح متوهج', color: '#e67e22' },
    'candle': { temp: 1000, name: 'شمعة مشتعلة', color: '#d35400' }
  };

  // Planck's law calculation
  const calculatePlanckFunction = (wavelength: number, temp: number) => {
    const h = 6.62607015e-34; // Planck constant
    const c = 299792458; // Speed of light
    const k = 1.380649e-23; // Boltzmann constant
    
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

  // Generate data for plotting
  const generatePlotData = () => {
    const wavelengths = [];
    const intensities = [];
    
    // Generate wavelength range from 100nm to 3000nm
    for (let wl = 100; wl <= 3000; wl += 10) {
      wavelengths.push(wl);
      const intensity = calculatePlanckFunction(wl, temperature[0]);
      intensities.push(logScale ? Math.log10(intensity + 1e-20) : intensity);
    }

    const peakWl = calculatePeakWavelength(temperature[0]);
    const peakIntensity = calculatePlanckFunction(peakWl, temperature[0]);

    return {
      wavelengths,
      intensities,
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

    const peakTrace = showPeakWavelength ? {
      x: [data.peakWl],
      y: [data.peakIntensity],
      type: 'scatter',
      mode: 'markers',
      name: `ذروة الطول الموجي: ${data.peakWl.toFixed(0)} nm`,
      marker: {
        color: '#e74c3c',
        size: 12,
        symbol: 'star'
      }
    } : null;

    const layout = {
      title: {
        text: `منحنى إشعاع الجسم الأسود - درجة الحرارة: ${temperature[0]} K`,
        font: { size: 18, color: '#fff' }
      },
      xaxis: {
        title: 'الطول الموجي (نانومتر)',
        color: '#fff',
        gridcolor: '#444',
        range: [100, 3000]
      },
      yaxis: {
        title: logScale ? 'شدة الإشعاع (لوغاريتمي)' : 'شدة الإشعاع (W⋅sr⁻¹⋅m⁻³)',
        color: '#fff',
        gridcolor: '#444'
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#fff' },
      margin: { t: 80, b: 60, l: 80, r: 40 }
    };

    const traces = peakTrace ? [trace, peakTrace] : [trace];

    Plotly.newPlot(plotRef.current, traces, layout, { responsive: true, displayModeBar: true });
  };

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
  }, [temperature, showPeakWavelength, logScale]);

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
              محاكاة إشعاع الجسم الأسود المتقدمة
            </h1>
            <div className="flex gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-300">
                  <Settings className="w-5 h-5 mr-2" />
                  لوحة التحكم
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
                        className="text-xs"
                      >
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
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      إعادة تعيين
                    </Button>
                  </div>
                </div>

                {/* Display Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">خيارات العرض</label>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">إظهار ذروة الطول الموجي</span>
                    <Switch
                      checked={showPeakWavelength}
                      onCheckedChange={setShowPeakWavelength}
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

                {/* Information Panel */}
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-bold text-blue-300 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    معلومات فيزيائية
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-300">ذروة الطول الموجي:</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {calculatePeakWavelength(temperature[0]).toFixed(0)} nm
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
          </div>

          {/* Main Plot */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[600px]">
              <CardContent className="p-4 h-full">
                <div ref={plotRef} className="w-full h-full" />
              </CardContent>
            </Card>

            {/* Educational Info */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-4">نظرة علمية: إشعاع الجسم الأسود</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-bold text-white mb-2">قانون بلانك</h4>
                    <p className="text-gray-300">يصف توزيع الطاقة الطيفية للإشعاع المنبعث من جسم أسود مثالي</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">قانون فين</h4>
                    <p className="text-gray-300">يحدد الطول الموجي للذروة بناءً على درجة الحرارة: λmax = b/T</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">قانون ستيفان-بولتزمان</h4>
                    <p className="text-gray-300">القدرة الإجمالية المشعة تتناسب مع T⁴</p>
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
