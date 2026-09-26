import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, Wifi, Lightbulb, Sun, Activity, Zap, Compass, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarField from '@/components/StarField';
import WaveVisualization from '@/components/electromagnetic/WaveVisualization';
import SpectrumDisplay from '@/components/electromagnetic/SpectrumDisplay';
import WaveProperties from '@/components/electromagnetic/WaveProperties';
import WaveApplications from '@/components/electromagnetic/WaveApplications';
import WaveQuiz from '@/components/electromagnetic/WaveQuiz';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

export const ElectromagneticWavesSimulation: React.FC = () => {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState(550); // THz (Green visible light)
  const [amplitude, setAmplitude] = useState(1);
  const [waveType, setWaveType] = useState<'radio' | 'microwave' | 'infrared' | 'visible' | 'ultraviolet' | 'xray' | 'gamma'>('visible');
  const [polarization, setPolarization] = useState<'linear' | 'circular'>('linear');

  // Calculate wavelength from frequency (λ = c / f)
  const speedOfLight = 299792458; // m/s
  const wavelength = useMemo(() => {
    return (speedOfLight / (Math.max(0.0001, frequency) * 1e12)) * 1e9; // in nm
  }, [frequency]);

  // Photon energy in eV: E = h * f
  const photonEnergyEV = useMemo(() => {
    return (4.1357e-15 * frequency * 1e12); // eV
  }, [frequency]);

  const waveTypes = [
    { id: 'radio', name: 'موجات الراديو', icon: Radio, frequency: '< 3 GHz', color: 'from-red-600 to-orange-600', range: [0.001, 1] },
    { id: 'microwave', name: 'الموجات الميكروية', icon: Wifi, frequency: '3 - 300 GHz', color: 'from-orange-600 to-yellow-600', range: [1, 300] },
    { id: 'infrared', name: 'الأشعة تحت الحمراء', icon: Lightbulb, frequency: '300 GHz - 430 THz', color: 'from-yellow-600 to-green-600', range: [300, 430000] },
    { id: 'visible', name: 'الضوء المرئي', icon: Sun, frequency: '430 - 770 THz', color: 'from-green-500 via-blue-500 to-purple-500', range: [430000, 770000] },
    { id: 'ultraviolet', name: 'الأشعة فوق البنفسجية', icon: Activity, frequency: '770 THz - 30 PHz', color: 'from-purple-600 to-violet-600', range: [770000, 30000000] },
    { id: 'xray', name: 'الأشعة السينية', icon: Zap, frequency: '30 PHz - 30 EHz', color: 'from-violet-600 to-blue-900', range: [30000000, 30000000000] },
    { id: 'gamma', name: 'أشعة غاما', icon: Zap, frequency: '> 30 EHz', color: 'from-blue-900 to-black', range: [30000000000, 100000000000] }
  ];

  const handleWaveTypeChange = (type: typeof waveType) => {
    setWaveType(type);
    const selectedWave = waveTypes.find(w => w.id === type);
    if (selectedWave) {
      if (type === 'visible') setFrequency(550);
      else if (type === 'radio') setFrequency(0.1);
      else if (type === 'microwave') setFrequency(2.4);
      else if (type === 'infrared') setFrequency(100);
      else if (type === 'ultraviolet') setFrequency(1500);
      else if (type === 'xray') setFrequency(50000);
      else setFrequency(95000);
    }
  };

  // CyberLab HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'frequency',
        label: 'تردد الموجة (Frequency)',
        value: Number(frequency.toFixed(2)),
        unit: 'THz',
        status: 'normal' as const,
        min: 0.01,
        max: 100000,
      },
      {
        id: 'wavelength',
        label: 'الطول الموجي (λ)',
        value: Number(wavelength.toFixed(1)),
        unit: 'nm',
        status: 'normal' as const,
        min: 1,
        max: 10000,
      },
      {
        id: 'energy',
        label: 'طاقة الفوتون (E = hf)',
        value: Number(photonEnergyEV.toFixed(3)),
        unit: 'eV',
        status: photonEnergyEV > 100 ? ('critical' as const) : ('normal' as const),
        min: 0,
        max: 500,
      },
      {
        id: 'polarization',
        label: 'نوع الاستقطاب',
        value: polarization === 'linear' ? 1 : 2,
        unit: polarization === 'linear' ? 'خطي' : 'دائري',
        status: 'normal' as const,
        min: 1,
        max: 2,
      },
    ];
  }, [frequency, wavelength, photonEnergyEV, polarization]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'visible_light_window',
        title: 'معايرة نافذة الضوء المرئي',
        description: 'اضبط تردد الموجة ليكون بدقة ضمن نطاق الطيف المرئي للعين البشرية (بين 430 THz و 770 THz).',
        targetMetric: 'تردد الموجة (Frequency)',
        targetValue: 550,
        unit: 'THz',
        currentValue: frequency,
        holdTimeRequired: 3,
        tolerance: 80,
        isCompleted: false,
        hint: 'اختر نوع الموجة "الضوء المرئي" أو حرك شريط التردد ليقترب من 550 THz (اللون الأخضر).',
      },
      {
        id: 'high_energy_photons',
        title: 'توليد فوتونات عالية الطاقة (X-Rays)',
        description: 'انتقل للأشعة السينية أو أشعة غاما للحصول على طاقة فوتون كهرومغناطيسي تتجاوز 100 eV.',
        targetMetric: 'طاقة الفوتون (E = hf)',
        targetValue: 120,
        unit: 'eV',
        currentValue: photonEnergyEV,
        holdTimeRequired: 2,
        tolerance: 30,
        isCompleted: false,
        hint: 'اختر نوع الموجة "الأشعة السينية (X-ray)" لرفع التردد والطاقة.',
      },
      {
        id: 'circular_polarization',
        title: 'الاستقطاب الدائري لموجات ماكسويل',
        description: 'قم بتفعيل نمط الاستقطاب الدائري لمشاهدة دوران مجالي E و B الحلزوني مع انتشار الموجة.',
        targetMetric: 'نوع الاستقطاب',
        targetValue: 2,
        unit: 'mode',
        currentValue: polarization === 'circular' ? 2 : 1,
        holdTimeRequired: 3,
        tolerance: 0.1,
        isCompleted: false,
        hint: 'اضغط على زر "الاستقطاب الدائري" في لوحة التحكم.',
      },
    ];
  }, [frequency, photonEnergyEV, polarization]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <StarField starCount={150} speed={0.2} />

      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          className="p-6 border-b border-border/50 backdrop-blur-md bg-background/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
              className="gap-2"
            >
              <ArrowLeft size={20} />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
            </Button>
            <div className="flex items-center gap-3">
              <Activity className="text-primary" size={32} />
              <div className="text-right">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  مختبر الموجات الكهرومغناطيسية وماكسويل 3D
                </h1>
                <p className="text-sm text-muted-foreground">3D Electromagnetic Wave & Maxwell Dynamics</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="visualization" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="visualization">المحاكاة 3D</TabsTrigger>
              <TabsTrigger value="spectrum">الطيف الكامل</TabsTrigger>
              <TabsTrigger value="applications">التطبيقات العملية</TabsTrigger>
              <TabsTrigger value="quiz">الاختبار العلمي</TabsTrigger>
            </TabsList>

            {/* Visualization Tab */}
            <TabsContent value="visualization" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Wave Display */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
                    <WaveVisualization 
                      frequency={frequency} 
                      amplitude={amplitude}
                      waveType={waveType}
                      polarization={polarization}
                    />

                    {/* CyberLab HUD Overlay */}
                    <CyberLabHUD
                      metrics={hudMetrics}
                      title={`موجة ماكسويل المستعرضة • ${waveType}`}
                      status="active"
                      oscilloscopeWaveform="sine"
                      oscilloscopeFrequency={frequency > 1000 ? 8 : 3}
                    />
                  </div>

                  {/* Gamified Laboratory Challenges */}
                  <LabChallengeEngine
                    challenges={challenges}
                    onChallengeComplete={(c) => {
                      console.log('Challenge completed:', c.title);
                    }}
                  />
                </div>

                {/* Controls & CoPilot */}
                <div className="space-y-4">
                  {/* AI Lab CoPilot */}
                  <LiveAILabCoPilot
                    experimentContext={{
                      title: 'الموجات الكهرومغناطيسية وماكسويل',
                      currentStep: `الموجة المختارة: ${waveType}`,
                      userAction: `فحص الحقلين المتعامدين E و B عند التردد ${frequency.toFixed(2)} THz والطول الموجي ${wavelength.toFixed(1)} nm`,
                      activeMetrics: {
                        waveType: waveType,
                        frequency: `${frequency.toFixed(2)} THz`,
                        wavelength: `${wavelength.toFixed(1)} nm`,
                        photonEnergy: `${photonEnergyEV.toFixed(3)} eV`,
                        polarization: polarization,
                      }
                    }}
                    suggestions={[
                      'كيف اشتق ماكسويل سرعة الضوء c من ثابت العازلية وثابت النفاذية؟',
                      'ما هو متجه بوينتنج (Poynting Vector) وماذا يمثل فيزيائياً؟',
                      'ما الفرق بين الاستقطاب الخطي والاستقطاب الدائري للضوء؟',
                      'كيف ترتبط طاقة الفوتون بتردد الموجة وفق معادلة بلانك؟',
                    ]}
                  />

                  {/* Wave Controls */}
                  <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-foreground">التحكم في الموجة</h3>
                        {/* Polarization Toggle */}
                        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                          <Button
                            size="sm"
                            variant={polarization === 'linear' ? 'default' : 'ghost'}
                            onClick={() => setPolarization('linear')}
                            className="h-6 text-[10px] px-2 text-cyan-300"
                          >
                            خطي
                          </Button>
                          <Button
                            size="sm"
                            variant={polarization === 'circular' ? 'default' : 'ghost'}
                            onClick={() => setPolarization('circular')}
                            className="h-6 text-[10px] px-2 text-purple-300"
                          >
                            دائري
                          </Button>
                        </div>
                      </div>

                      {/* Frequency Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-medium text-foreground">التردد (f):</label>
                          <span className="text-primary font-mono text-xs font-bold">{frequency.toFixed(2)} THz</span>
                        </div>
                        <Slider
                          value={[frequency]}
                          onValueChange={([value]) => setFrequency(value)}
                          min={0.1}
                          max={10000}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Amplitude Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-medium text-foreground">سعة الموجة (A):</label>
                          <span className="text-primary font-mono text-xs">{amplitude.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[amplitude]}
                          onValueChange={([value]) => setAmplitude(value)}
                          min={0.2}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wave Properties Summary */}
                  <WaveProperties 
                    frequency={frequency}
                    wavelength={wavelength}
                    amplitude={amplitude}
                    waveType={waveType}
                  />
                </div>
              </div>

              {/* Wave Type Selector Cards */}
              <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">اختر نطاق الطيف الكهرومغناطيسي:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {waveTypes.map((wave) => (
                      <button
                        key={wave.id}
                        onClick={() => handleWaveTypeChange(wave.id as typeof waveType)}
                        className={`p-3 rounded-lg border transition-all text-center ${
                          waveType === wave.id
                            ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-md shadow-cyan-900/30'
                            : 'border-border bg-background/50 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <wave.icon className={`mx-auto mb-1.5 ${waveType === wave.id ? 'text-cyan-400' : 'text-muted-foreground'}`} size={20} />
                        <p className="text-xs font-semibold">{wave.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{wave.frequency}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spectrum Tab */}
            <TabsContent value="spectrum">
              <SpectrumDisplay currentFrequency={frequency} onFrequencyChange={setFrequency} />
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <WaveApplications waveType={waveType} />
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz">
              <WaveQuiz />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ElectromagneticWavesSimulation;
