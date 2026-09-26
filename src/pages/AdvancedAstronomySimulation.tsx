import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Moon, Sun, 
  Globe, Eye, Compass, Sparkles, Orbit, HelpCircle, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AstronomyChamber3D from '@/components/astronomy/AstronomyChamber3D';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine from '@/components/simulations/LabChallengeEngine';

const ASTRONOMY_CHALLENGES = [
  {
    id: 'solar-totality',
    title: 'تحدي الكسوف الكلي للشمس (Solar Totality)',
    description: 'قم بمحاذاة مدار القمر ليمر مباشرة في المنتصف بين الشمس والأرض حتى يلامس مخروط الظل التام (Umbra) سطح كوكب الأرض وتظهر ظاهرة خاتم الماس.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'solar' && params.isTotality,
    hint: 'اختر محاكاة كسوف الشمس، وشغّل المحاكاة حتى تتطابق إحداثيات القمر مع خط الرؤية المباشر بين الشمس والأرض.'
  },
  {
    id: 'blood-moon',
    title: 'تحدي قمر الدم وخسوف القمر التام',
    description: 'اضبط مدار القمر ليدخل بالكامل في منطقة ظل الأرض (Earth Umbra) وراقب كيف يتحول لونه إلى الأحمر النحاسي بسبب تشتت رايلي في الغلاف الجوي.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'lunar' && params.isLunarEclipsed,
    hint: 'اختر خسوف القمر وشاهد القمر وهو يمر خلف الأرض مقابلاً للشمس تماماً.'
  },
  {
    id: 'shadow-cone-analysis',
    title: 'تحدي تحليل مخاريط الظل التام وشبه الظل',
    description: 'قم بتفعيل إظهار مخاريط الظل ثلاثية الأبعاد ورفع شدة إضاءة الشمس لمعاينة الفارق الهندسي بين Umbra و Penumbra.',
    targetCondition: (params: Record<string, any>) => params.showShadows && params.sunIntensity >= 1.2,
    hint: 'فعّل خيار مخاريط الظل وارفع شدة سطوع الشمس إلى أكثر من 1.2.'
  }
];

const AdvancedAstronomySimulation: React.FC = () => {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'solar' | 'lunar' | 'phases' | 'orbits'>('solar');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [sunIntensity, setSunIntensity] = useState(1.0);
  const [showShadows, setShowShadows] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<'system' | 'earth' | 'moon' | 'top'>('system');

  // Animation frame timer
  useEffect(() => {
    let animId: number;
    const update = () => {
      if (isPlaying) {
        setTime((prev) => prev + 0.015 * timeSpeed);
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, timeSpeed]);

  // Derived calculations for HUD metrics
  const isTotality = simulationType === 'solar' && Math.abs((-2 + Math.sin(time * 0.4) * 5) - 1.5) < 0.6;
  const isLunarEclipsed = simulationType === 'lunar' && (Math.cos(time * 0.5) * 6.5 > 4.5 && Math.abs(Math.sin(time * 0.5) * 6.5) < 1.4);

  const alignmentDegree = simulationType === 'solar' 
    ? Math.max(0, 180 - Math.abs((-2 + Math.sin(time * 0.4) * 5) - 1.5) * 35).toFixed(1)
    : simulationType === 'lunar'
    ? Math.max(0, 180 - Math.abs(Math.sin(time * 0.5) * 6.5) * 30).toFixed(1)
    : '142.5';

  const umbraDiameterKm = simulationType === 'solar' ? (isTotality ? 160 : 0) : (isLunarEclipsed ? 9200 : 0);

  const resetSimulation = () => {
    setTime(0);
    setTimeSpeed(1);
    setSunIntensity(1.0);
    setShowShadows(true);
    setShowOrbits(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header bar */}
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
              <h1 className="text-base sm:text-lg font-black text-amber-400">
                الفلك المتقدم: الكسوف والخسوف وأطوار القمر
              </h1>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-[10px] bg-amber-950/30">
                3D WebGL
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              محاكاة ثلاثية الأبعاد لهندسة مخاريط الظل التام (Umbra) وشبه الظل (Penumbra) ومسارات الأجرام السماوية
            </p>
          </div>
        </div>

        {/* Camera Quick Presets */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant={cameraPreset === 'system' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('system')}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            منظومة
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'earth' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('earth')}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            الأرض
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'moon' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('moon')}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            القمر
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'top' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('top')}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            علوي
          </Button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Canvas Scene Area */}
        <div className="flex-1 h-[55vh] lg:h-auto relative">
          <AstronomyChamber3D
            simulationType={simulationType}
            time={time}
            showShadows={showShadows}
            showOrbits={showOrbits}
            sunIntensity={sunIntensity}
            cameraPreset={cameraPreset}
          />

          {/* CyberLabHUD Floating Metrics Overlay */}
          <CyberLabHUD
            title="مؤشرات الرصد الفلكي والجيومتري"
            metrics={[
              { label: 'زاوية المحاذاة (Alignment)', value: `${alignmentDegree}°`, status: Number(alignmentDegree) > 175 ? 'optimal' : 'normal' },
              { label: 'قطر الظل التام (Umbra)', value: `${umbraDiameterKm} km`, status: umbraDiameterKm > 0 ? 'optimal' : 'normal' },
              { label: 'شدة إضاءة الشمس', value: `${(sunIntensity * 100).toFixed(0)}%`, status: 'normal' },
              { label: 'حالة الرصد', value: isTotality ? 'كسوف كلي' : isLunarEclipsed ? 'خسوف كلي' : 'عبور مداري اعتيادي', status: (isTotality || isLunarEclipsed) ? 'warning' : 'normal' }
            ]}
          />
        </div>

        {/* Controls and AI CoPilot Sidebar */}
        <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-r border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[45vh] lg:max-h-none">
          {/* Mode Switcher Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">نوع الظاهرة الفلكية:</label>
            <Tabs 
              value={simulationType} 
              onValueChange={(v) => {
                setSimulationType(v as any);
                setTime(0);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                <TabsTrigger value="solar" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                  <Sun className="w-3.5 h-3.5 ml-1" />
                  كسوف الشمس
                </TabsTrigger>
                <TabsTrigger value="lunar" className="text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
                  <Moon className="w-3.5 h-3.5 ml-1" />
                  خسوف القمر
                </TabsTrigger>
                <TabsTrigger value="phases" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <Orbit className="w-3.5 h-3.5 ml-1" />
                  أطوار القمر
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Playback Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">محاكي الزمن المداري</span>
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

            {/* Speed slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>سرعة المحاكاة الزمنية:</span>
                <span className="text-amber-400 font-bold">{timeSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[timeSpeed]}
                min={0.2}
                max={3}
                step={0.1}
                onValueChange={([v]) => setTimeSpeed(v)}
                className="py-1"
              />
            </div>

            {/* Sun Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>شدة سطوع الهالة الشمسية:</span>
                <span className="text-amber-400 font-bold">{(sunIntensity * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[sunIntensity]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={([v]) => setSunIntensity(v)}
                className="py-1"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                size="sm"
                variant={showShadows ? 'secondary' : 'outline'}
                onClick={() => setShowShadows(!showShadows)}
                className="text-xs h-7 rounded-lg"
              >
                {showShadows ? '✓ مخاريط الظل' : 'مخاريط الظل'}
              </Button>
              <Button
                size="sm"
                variant={showOrbits ? 'secondary' : 'outline'}
                onClick={() => setShowOrbits(!showOrbits)}
                className="text-xs h-7 rounded-lg"
              >
                {showOrbits ? '✓ المسار المداري' : 'المسار المداري'}
              </Button>
            </div>
          </div>

          {/* Live AI Lab CoPilot */}
          <LiveAILabCoPilot
            simName="الفلك المتقدم: الكسوف والخسوف"
            currentParameters={{
              "النوع": simulationType,
              "زاوية المحاذاة": `${alignmentDegree}°`,
              "الكسوف الكلي": isTotality ? "نشط" : "غير نشط",
              "الخسوف القمري": isLunarEclipsed ? "نشط (قمر دموي)" : "غير نشط",
              "قطر الظل": `${umbraDiameterKm} km`
            }}
            liveHint={
              isTotality
                ? "يحدث الكسوف الكلي عندما يحجب القمر قرص الشمس تماماً، مما يتيح رؤية الهالة الشمسية وخاتم الماس!"
                : isLunarEclipsed
                ? "يتحول القمر للون الأحمر الدموي بسبب تشتت رايلي حيث ينحني الضوء الأحمر عبر الغلاف الجوي للأرض ليصل للقمر!"
                : "راقب المسارات المدارية وكيف يؤثر ميلان مدار القمر (حوالي 5 درجات) في ندرة حدوث الكسوف شهرياً."
            }
          />

          {/* Lab Challenge Engine */}
          <LabChallengeEngine
            challenges={ASTRONOMY_CHALLENGES}
            currentParams={{
              simulationType,
              isTotality,
              isLunarEclipsed,
              showShadows,
              sunIntensity
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedAstronomySimulation;
