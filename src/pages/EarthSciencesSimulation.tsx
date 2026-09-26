import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Globe, Mountain, 
  Flame, Activity, Compass, Layers, ShieldAlert, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EarthSciences3DScene from '@/components/earth/EarthSciences3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine from '@/components/simulations/LabChallengeEngine';

const EARTH_CHALLENGES = [
  {
    id: 'major-earthquake',
    title: 'تحدي زلزال مدمر (فوق 7.5 ريختر)',
    description: 'قم بزيادة قوة الزلزال إلى أكثر من 7.5 درجة على مقياس ريختر، وراقب سعة الموجات الزلزالية السطحية واهتزاز المباني.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'earthquake' && params.magnitude >= 7.5,
    hint: 'اختر وضع الزلزال وارفع شريط الشدة (المقياس) فوق 7.5 درجة.'
  },
  {
    id: 'volcano-chamber',
    title: 'تحدي ثوران الصهارة والمقذوفات البركانية',
    description: 'انتقل لوضع البركان ولاحظ كيف تصعد الصهارة عالية اللزوجة من غرفة الصهارة الجوفية إلى الفوهة المركزية لتطلق سحابة الرماد.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'volcano',
    hint: 'اختر وضع البراكين من قائمة الأوضاع.'
  },
  {
    id: 'subduction-zone',
    title: 'تحدي نطاق الانغراز التكتوني (Subduction)',
    description: 'استكشف اصطدام الصفيحة المحيطية الأكثر كثافة بالصفيحة القارية وغوصها في الوشاح، مما يولد صهارة بركانية وزلازل عميقة.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'plates',
    hint: 'اختر وضع الصفائح التكتونية وشاهد الصفيحة المحيطية وهي تغوص بزاوية مائلة.'
  }
];

const EarthSciencesSimulation: React.FC = () => {
  const navigate = useNavigate();
  const seismographRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'earthquake' | 'volcano' | 'plates' | 'rocks'>('earthquake');
  const [magnitude, setMagnitude] = useState(6.2);
  const [time, setTime] = useState(0);
  const [showWaveforms, setShowWaveforms] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<'front' | 'top' | 'cross-section' | 'hypocenter'>('front');

  // Animation Loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      if (isPlaying) {
        setTime((prev) => prev + 0.03);
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Seismograph 2D live trace recorder
  useEffect(() => {
    const canvas = seismographRef.current;
    if (!canvas || simulationType !== 'earthquake') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw baseline
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw seismic waveform
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const midY = canvas.height / 2;
    for (let x = 0; x < canvas.width; x++) {
      const freq = (time * 15 + x * 0.1);
      const amp = (magnitude / 9) * 22;
      const noise = Math.sin(freq * 0.4) * Math.cos(freq * 0.7) * amp;
      const y = midY + noise;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [time, magnitude, simulationType]);

  // Derived seismic physics metrics
  // Energy E = 10^(4.8 + 1.5 * M) Joules
  const energyJoules = Math.pow(10, 4.8 + 1.5 * magnitude);
  const energyTJ = (energyJoules / 1e12).toExponential(2);
  const pWaveSpeed = 6.2; // km/s
  const sWaveSpeed = 3.6; // km/s

  const resetSimulation = () => {
    setTime(0);
    setMagnitude(6.0);
    setShowWaveforms(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header Bar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/scientific-simulations')}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-amber-500">
                علوم الأرض والجيولوجيا التفاعلية 3D
              </h1>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-[10px] bg-amber-950/30">
                Three.js Geophysics
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              محاكاة ثلاثية الأبعاد لموجات الزلازل، حجرة الصهارة البركانية، وحركة الصفائح التكتونية
            </p>
          </div>
        </div>

        {/* Camera Quick Presets */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant={cameraPreset === 'front' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('front')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            أمامي
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'cross-section' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('cross-section')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            مقطع
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'hypocenter' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('hypocenter')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            البؤرة
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'top' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('top')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            علوي
          </Button>
        </div>
      </div>

      {/* Main Simulation Layout */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 h-[55vh] lg:h-auto relative">
          <EarthSciences3DScene
            simulationType={simulationType}
            magnitude={magnitude}
            time={time}
            showWaveforms={showWaveforms}
            cutawayView={true}
            cameraPreset={cameraPreset}
          />

          {/* CyberLabHUD Floating Physical Telemetry */}
          <CyberLabHUD
            title="مؤشرات الرصد الجيوفيزيائي"
            metrics={
              simulationType === 'earthquake' ? [
                { label: 'شدة ريختر (Richter)', value: `${magnitude.toFixed(1)} M`, status: magnitude > 7.0 ? 'warning' : 'optimal' },
                { label: 'الطاقة المحررة', value: `${energyTJ} TJ`, status: 'normal' },
                { label: 'سرعة موجات P', value: `${pWaveSpeed} km/s`, status: 'optimal' },
                { label: 'سرعة موجات S', value: `${sWaveSpeed} km/s`, status: 'normal' }
              ] : simulationType === 'volcano' ? [
                { label: 'درجة حرارة الصهارة', value: '1150 °C', status: 'warning' },
                { label: 'الضغط الجوفي', value: '420 MPa', status: 'optimal' },
                { label: 'نوع الثوران', value: 'بيليه/طبقي', status: 'normal' },
                { label: 'ارتفاع عمود الرماد', value: '8.4 km', status: 'warning' }
              ] : [
                { label: 'معدل الانغراز', value: '7.2 cm/year', status: 'optimal' },
                { label: 'زاوية الغوص', value: '45°', status: 'normal' },
                { label: 'عمق الانصهار', value: '120 km', status: 'warning' },
                { label: 'حالة الصفيحة', value: 'انغراز محيطي نشط', status: 'optimal' }
              ]
            }
          />
        </div>

        {/* Sidebar Controls and Lab Instruments */}
        <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-r border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[45vh] lg:max-h-none">
          {/* Simulation Type Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">الظاهرة الجيولوجية:</label>
            <Tabs 
              value={simulationType} 
              onValueChange={(v) => {
                setSimulationType(v as any);
                setTime(0);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl h-auto">
                <TabsTrigger value="earthquake" className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 py-1.5">
                  <Activity className="w-3.5 h-3.5 ml-1" />
                  الزلزال والموجات
                </TabsTrigger>
                <TabsTrigger value="volcano" className="text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300 py-1.5">
                  <Flame className="w-3.5 h-3.5 ml-1" />
                  البركان والصهارة
                </TabsTrigger>
                <TabsTrigger value="plates" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 py-1.5">
                  <Layers className="w-3.5 h-3.5 ml-1" />
                  الصفائح التكتونية
                </TabsTrigger>
                <TabsTrigger value="rocks" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-1.5">
                  <Mountain className="w-3.5 h-3.5 ml-1" />
                  دورة الصخور
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Interactive Parameters Panel */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">محاكي الحركة الجيوفيزيائية</span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8 px-3 rounded-lg border-slate-700 bg-slate-900 text-xs flex items-center gap-1"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetSimulation}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Earthquake Magnitude Slider */}
            {simulationType === 'earthquake' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>قوة الزلزال بمقياس ريختر (Magnitude):</span>
                  <span className="text-emerald-400 font-bold">{magnitude.toFixed(1)} M</span>
                </div>
                <Slider
                  value={[magnitude]}
                  min={3.0}
                  max={9.0}
                  step={0.1}
                  onValueChange={([v]) => setMagnitude(v)}
                  className="py-1"
                />
              </div>
            )}

            {/* Live Seismograph Output */}
            {simulationType === 'earthquake' && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>جهاز رصد الزلازل (Seismograph Live Trace):</span>
                  <span className="text-emerald-400 font-mono text-[10px]">مستشعر سطحي</span>
                </div>
                <canvas
                  ref={seismographRef}
                  width={320}
                  height={65}
                  className="w-full h-16 rounded-xl border border-slate-800 bg-slate-950"
                />
              </div>
            )}

            {/* Waveform Toggle */}
            {simulationType === 'earthquake' && (
              <div className="pt-1">
                <Button
                  size="sm"
                  variant={showWaveforms ? 'secondary' : 'outline'}
                  onClick={() => setShowWaveforms(!showWaveforms)}
                  className="w-full text-xs h-7 rounded-lg"
                >
                  {showWaveforms ? '✓ إظهار جبهات الموجات P و S' : 'إظهار جبهات الموجات P و S'}
                </Button>
              </div>
            )}
          </div>

          {/* Live AI Lab CoPilot */}
          <LiveAILabCoPilot
            simName="علوم الأرض والجيولوجيا"
            currentParameters={{
              "النمط": simulationType,
              "درجة ريختر": `${magnitude.toFixed(1)} M`,
              "الطاقة": `${energyTJ} TJ`,
              "سرعة P": `${pWaveSpeed} km/s`,
              "سرعة S": `${sWaveSpeed} km/s`
            }}
            liveHint={
              simulationType === 'earthquake'
                ? `الموجات الأولية P موجات تضاغطية تنتقل في السوائل والصلب بسرعة ${pWaveSpeed} km/s، تليها موجات القص S بسرعة ${sWaveSpeed} km/s!`
                : simulationType === 'volcano'
                ? "تتولد الصهارة من انصهار صخور الوشاح وترتفع بسبب انخفاض كثافتها مقارنة بالصخور المحيطة بها!"
                : "انغراز الصفيحة المحيطية الأكثر كثافة تحت القارية يسبب حفر الأخاديد البحرية وسلاسل الجبال البركانية."
            }
          />

          {/* Lab Challenge Engine */}
          <LabChallengeEngine
            challenges={EARTH_CHALLENGES}
            currentParams={{
              simulationType,
              magnitude,
              showWaveforms
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EarthSciencesSimulation;
