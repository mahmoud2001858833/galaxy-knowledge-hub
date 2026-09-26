import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Sun, 
  Zap, Sparkles, Activity, Layers, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Bioenergetics3DScene from '@/components/biology/Bioenergetics3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine from '@/components/simulations/LabChallengeEngine';

const BIOENERGETICS_CHALLENGES = [
  {
    id: 'high-light-photosynthesis',
    title: 'تحدي ذروة البناء الضوئي وسيل الفوتونات',
    description: 'قم برفع شدة الضوء إلى أكثر من 85% لملاحظة التدفق العالي للفوتونات نحو أقراص الثايلاكويد ومضاعفة معدل تحلل الماء وإنتاج الأكسجين والجلوكوز.',
    targetCondition: (params: Record<string, any>) => params.mode === 'photosynthesis' && params.lightIntensity >= 85,
    hint: 'اختر وضع البناء الضوئي وارفع شريط شدة الضوء فوق 85%.'
  },
  {
    id: 'atp-synthase-power',
    title: 'تحدي محرك ATP Synthase والتنفس الخلوي',
    description: 'انتقل لوضع التنفس الخلوي وشاهد كيف يعمل التدرج الكهروكيميائي للبروتونات على تدوير محرك ATP سينثيز لإنتاج 36 إلى 38 جزيء ATP لكل جزيء جلوكوز.',
    targetCondition: (params: Record<string, any>) => params.mode === 'respiration',
    hint: 'اختر وضع التنفس الخلوي في الميتوكوندريا.'
  },
  {
    id: 'symbiotic-cycle',
    title: 'تحدي الدورة البيولوجية العالمية المتكاملة',
    description: 'فعّل وضع الدورة المشتركة لمعاينة التبادل الغازي والحيوي بين البلاستيدات الخضراء والميتوكوندريا.',
    targetCondition: (params: Record<string, any>) => params.mode === 'cycle',
    hint: 'اختر وضع الدورة المشتركة (Cycle).'
  }
];

const PhotosynthesisRespirationSimulation: React.FC = () => {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<'photosynthesis' | 'respiration' | 'cycle'>('photosynthesis');
  const [lightIntensity, setLightIntensity] = useState(75);
  const [time, setTime] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<'system' | 'chloroplast' | 'mitochondria' | 'membrane'>('system');

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      if (isPlaying) {
        setTime((prev) => prev + 0.02);
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Derived bioenergetics metrics
  const glucoseRate = ((lightIntensity / 100) * 1.8).toFixed(2);
  const o2Rate = ((lightIntensity / 100) * 6.0).toFixed(1);
  const atpOutput = mode === 'respiration' ? 36 : Math.round((lightIntensity / 100) * 18);

  const resetSimulation = () => {
    setTime(0);
    setLightIntensity(75);
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
              <h1 className="text-base sm:text-lg font-black text-emerald-400">
                البناء الضوئي والتنفس الخلوي 3D
              </h1>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-[10px] bg-emerald-950/30">
                Bioenergetics 3D
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              محاكاة ثلاثية الأبعاد لتحولات الطاقة الحيوية في البلاستيدة الخضراء والميتوكوندريا ومحرك ATP Synthase
            </p>
          </div>
        </div>

        {/* Camera Presets */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant={cameraPreset === 'system' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('system')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            منظومة
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'chloroplast' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('chloroplast')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            بلاستيدة
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'mitochondria' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('mitochondria')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            ميتوكوندريا
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'membrane' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('membrane')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            غشاء
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 h-[55vh] lg:h-auto relative">
          <Bioenergetics3DScene
            mode={mode}
            lightIntensity={lightIntensity}
            time={time}
            speed={1.0}
            cameraPreset={cameraPreset}
          />

          {/* CyberLabHUD Floating Telemetry */}
          <CyberLabHUD
            title="مؤشرات الطاقة الحيوية والأيض"
            metrics={
              mode === 'photosynthesis' ? [
                { label: 'شدة الضوء', value: `${lightIntensity}%`, status: lightIntensity > 80 ? 'optimal' : 'normal' },
                { label: 'إنتاج الجلوكوز', value: `${glucoseRate} mmol/h`, status: 'optimal' },
                { label: 'انبعاث الأكسجين O₂', value: `${o2Rate} mL/min`, status: 'optimal' },
                { label: 'حالة الثايلاكويد', value: 'تثبيت كالفن نشط', status: 'optimal' }
              ] : mode === 'respiration' ? [
                { label: 'إنتاج الطاقة (ATP)', value: `${atpOutput} ATP / glucose`, status: 'optimal' },
                { label: 'محرك ATP Synthase', value: 'دوران 6000 RPM', status: 'optimal' },
                { label: 'سلسلة نقل الإلكترون', value: 'تدرج بروتوني مستقر', status: 'optimal' },
                { label: 'استهلاك O₂', value: 'أكسدة فسفورية تامة', status: 'optimal' }
              ] : [
                { label: 'حالة التوازن الحيوي', value: 'دورة كربون متزنة', status: 'optimal' },
                { label: 'صافي الطاقة', value: 'موجب ومستقر', status: 'optimal' },
                { label: 'التبادل الغازي', value: 'O₂ ⟷ CO₂ مستمر', status: 'optimal' },
                { label: 'الكفاءة الحيوية', value: '94.2%', status: 'optimal' }
              ]
            }
          />
        </div>

        {/* Controls Sidebar */}
        <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-r border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[45vh] lg:max-h-none">
          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">المسار الكيميائي الحيوي:</label>
            <Tabs 
              value={mode} 
              onValueChange={(v) => {
                setMode(v as any);
                setTime(0);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                <TabsTrigger value="photosynthesis" className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                  <Sun className="w-3.5 h-3.5 ml-1" />
                  البناء الضوئي
                </TabsTrigger>
                <TabsTrigger value="respiration" className="text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300">
                  <Zap className="w-3.5 h-3.5 ml-1" />
                  التنفس الخلوي
                </TabsTrigger>
                <TabsTrigger value="cycle" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <RefreshCw className="w-3.5 h-3.5 ml-1" />
                  الدورة الحيوية
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Controls Panel */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">محاكي التفاعل الخلوي</span>
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

            {/* Light Intensity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>شدة الإشعاع الضوئي (Light Intensity):</span>
                <span className="text-emerald-400 font-bold">{lightIntensity}%</span>
              </div>
              <Slider
                value={[lightIntensity]}
                min={10}
                max={100}
                step={5}
                onValueChange={([v]) => setLightIntensity(v)}
                className="py-1"
              />
            </div>

            {/* Chemical Equation Card */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">المعادلة الكيميائية الشاملة:</span>
              <div className="font-mono text-[11px] text-emerald-300 direction-ltr text-center py-0.5">
                {mode === 'photosynthesis' 
                  ? '6CO₂ + 6H₂O + ضوء ⟶ C₆H₁₂O₆ + 6O₂'
                  : mode === 'respiration'
                  ? 'C₆H₁₂O₆ + 6O₂ ⟶ 6CO₂ + 6H₂O + 38 ATP'
                  : 'دورة الطاقة المتبادلة (شمسية ⟵ كيميائية)'
                }
              </div>
            </div>
          </div>

          {/* Live AI Lab CoPilot */}
          <LiveAILabCoPilot
            simName="البناء الضوئي والتنفس الخلوي"
            currentParameters={{
              "المسار": mode,
              "شدة الضوء": `${lightIntensity}%`,
              "إنتاج ATP": `${atpOutput} جزيء`,
              "الجلوكوز": `${glucoseRate} mmol/h`
            }}
            liveHint={
              mode === 'photosynthesis'
                ? "يمتص الكلوروفيل في أغشية الثايلاكويد فوتونات الضوء الأزرق والأحمر ويعكس الأخضر، مما يولد NADPH و ATP لحلقة كالفن!"
                : mode === 'respiration'
                ? "تعمل سلسلة نقل الإلكترون على ضخ البروتونات (H+) إلى الحيز بين الغشائين لتشغيل توربين ATP Synthase الدوار!"
                : "تعتمد الحياة على الأرض على هذا التكافل: فالنباتات تزود الكائنات بالأكسجين والغذاء، بينما تعيد الكائنات CO2 للنباتات."
            }
          />

          {/* Lab Challenge Engine */}
          <LabChallengeEngine
            challenges={BIOENERGETICS_CHALLENGES}
            currentParams={{
              mode,
              lightIntensity
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PhotosynthesisRespirationSimulation;
