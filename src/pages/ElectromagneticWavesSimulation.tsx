import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, Wifi, Lightbulb, Sun, Activity, Zap } from 'lucide-react';
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

const ElectromagneticWavesSimulation = () => {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState(500); // THz
  const [amplitude, setAmplitude] = useState(1);
  const [waveType, setWaveType] = useState<'radio' | 'microwave' | 'infrared' | 'visible' | 'ultraviolet' | 'xray' | 'gamma'>('visible');

  // Calculate wavelength from frequency (λ = c / f)
  const speedOfLight = 299792458; // m/s
  const wavelength = (speedOfLight / (frequency * 1e12)) * 1e9; // Convert to nm

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
      const midFreq = (selectedWave.range[0] + selectedWave.range[1]) / 2;
      setFrequency(midFreq);
    }
  };

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
                <h1 className="text-2xl font-bold text-foreground">الموجات الكهرومغناطيسية</h1>
                <p className="text-sm text-muted-foreground">Electromagnetic Waves</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="visualization" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="visualization">المحاكاة</TabsTrigger>
              <TabsTrigger value="spectrum">الطيف</TabsTrigger>
              <TabsTrigger value="applications">التطبيقات</TabsTrigger>
              <TabsTrigger value="quiz">الاختبار</TabsTrigger>
            </TabsList>

            {/* Visualization Tab */}
            <TabsContent value="visualization" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wave Display */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
                      <CardContent className="p-6">
                        <WaveVisualization 
                          frequency={frequency} 
                          amplitude={amplitude}
                          waveType={waveType}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
                      <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-bold text-foreground">التحكم في الموجة</h3>

                        {/* Frequency Control */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-foreground">التردد</label>
                            <span className="text-primary font-mono text-sm">{frequency.toFixed(2)} THz</span>
                          </div>
                          <Slider
                            value={[frequency]}
                            onValueChange={([value]) => setFrequency(value)}
                            min={0.001}
                            max={100000}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        {/* Wavelength Display */}
                        <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground">الطول الموجي</span>
                            <span className="text-primary font-mono font-bold">{wavelength.toFixed(2)} nm</span>
                          </div>
                        </div>

                        {/* Amplitude Control */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-foreground">السعة</label>
                            <span className="text-primary font-mono text-sm">{amplitude.toFixed(2)}</span>
                          </div>
                          <Slider
                            value={[amplitude]}
                            onValueChange={([value]) => setAmplitude(value)}
                            min={0.1}
                            max={2}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Wave Properties */}
                  <WaveProperties 
                    frequency={frequency}
                    wavelength={wavelength}
                    amplitude={amplitude}
                    waveType={waveType}
                  />
                </div>
              </div>

              {/* Wave Type Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">نوع الموجة</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {waveTypes.map((wave) => (
                        <motion.button
                          key={wave.id}
                          onClick={() => handleWaveTypeChange(wave.id as typeof waveType)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            waveType === wave.id
                              ? 'border-primary bg-primary/20'
                              : 'border-border bg-background/50 hover:border-primary/50'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <wave.icon className={`mx-auto mb-2 ${waveType === wave.id ? 'text-primary' : 'text-muted-foreground'}`} size={24} />
                          <p className="text-xs font-semibold text-foreground text-center">{wave.name}</p>
                          <p className="text-[10px] text-muted-foreground text-center mt-1">{wave.frequency}</p>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
