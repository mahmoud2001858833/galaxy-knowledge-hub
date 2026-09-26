import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Shield, 
  ShieldAlert, Activity, Sparkles, Plus, Minus, Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ImmuneSystem3DScene from '@/components/biology/ImmuneSystem3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine from '@/components/simulations/LabChallengeEngine';

const IMMUNE_CHALLENGES = [
  {
    id: 'antibody-neutralization',
    title: 'تحدي تحييد الفيروس بالأجسام المضادة',
    description: 'قم بزيادة عيار الأجسام المضادة (Antibody Titer) إلى 8 أو أكثر لمشاهدة ارتباط مواقع الارتباط (Paratopes) بأشواك الفيروس وشل حركته بالكامل.',
    targetCondition: (params: Record<string, any>) => params.mode === 'adaptive' && params.antibodyCount >= 8,
    hint: 'اختر المناعة التكيفية وارفع عدد الأجسام المضادة إلى 8 على الأقل.'
  },
  {
    id: 'macrophage-engulfment',
    title: 'تحدي البلعمة الفطرية (Phagocytosis)',
    description: 'انتقل للمناعة الفطرية وراقب كيف يمد البلعم الكبير أقدامه الكاذبة المحيطة بالميكروب لابتلاعه وهضمه بواسطة الإنزيمات المحللة.',
    targetCondition: (params: Record<string, any>) => params.mode === 'innate',
    hint: 'اختر وضع المناعة الفطرية من القائمة.'
  },
  {
    id: 'memory-response',
    title: 'تحدي الذاكرة المناعية واللقاحات (Secondary Response)',
    description: 'استكشف وضع الذاكرة المناعية لمعاينة سرعة وتضاعف إنتاج الأجسام المضادة عند تعرض الجسم لنفس الممرض مرة أخرى.',
    targetCondition: (params: Record<string, any>) => params.mode === 'memory',
    hint: 'اختر وضع الذاكرة المناعية.'
  }
];

const ImmuneSystemSimulation: React.FC = () => {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<'innate' | 'adaptive' | 'memory'>('adaptive');
  const [antibodyCount, setAntibodyCount] = useState(6);
  const [time, setTime] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<'system' | 'macrophage' | 'antibody' | 'virus'>('system');

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

  const isNeutralized = mode === 'adaptive' && antibodyCount >= 8;

  const resetSimulation = () => {
    setTime(0);
    setAntibodyCount(6);
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
              <h1 className="text-base sm:text-lg font-black text-rose-400">
                الجهاز المناعي والأجسام المضادة 3D
              </h1>
              <Badge variant="outline" className="border-rose-500/40 text-rose-300 text-[10px] bg-rose-950/30">
                Immunology 3D
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              محاكاة ثلاثية الأبعاد للبلعمة الفطرية، إفراز الأجسام المضادة Y-shaped، والتحييد الفيروسي
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
            شامل
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'macrophage' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('macrophage')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            البلعم
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'antibody' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('antibody')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            الأجسام المضادة
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'virus' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('virus')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            الفيروس
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 h-[55vh] lg:h-auto relative">
          <ImmuneSystem3DScene
            mode={mode}
            antibodyCount={antibodyCount}
            time={time}
            cameraPreset={cameraPreset}
          />

          {/* CyberLabHUD Floating Telemetry */}
          <CyberLabHUD
            title="مؤشرات الاستجابة المناعية"
            metrics={
              mode === 'adaptive' ? [
                { label: 'عيار الأجسام المضادة', value: `${antibodyCount} أذرع IgG`, status: antibodyCount >= 8 ? 'optimal' : 'normal' },
                { label: 'حالة الفيروس', value: isNeutralized ? 'مُحيَّد تماماً' : 'نشط مهاجم', status: isNeutralized ? 'optimal' : 'warning' },
                { label: 'كفاءة التعرف', value: '100% نوعي للأشواك', status: 'optimal' },
                { label: 'الخلايا المفرزة', value: 'خلايا بلازمية B-Cells', status: 'optimal' }
              ] : mode === 'innate' ? [
                { label: 'نشاط البلعم', value: 'بلعمة وتفكيك نشط', status: 'optimal' },
                { label: 'النوعية', value: 'غير متخصصة عامة', status: 'normal' },
                { label: 'زمن الاستجابة', value: 'فوري (دقائق)', status: 'optimal' },
                { label: 'إفراز السيتوكينات', value: 'إشارة استغاثة نشطة', status: 'warning' }
              ] : [
                { label: 'الذاكرة المناعية', value: 'Memory B & T Cells', status: 'optimal' },
                { label: 'سرعة الاستجابة', value: 'أسرع بـ 10 أضعاف', status: 'optimal' },
                { label: 'تركيز الأجسام المضادة', value: 'أعلى وأطول بقاءً', status: 'optimal' },
                { label: 'الحماية المكتسبة', value: 'مناعة قطيع / تطعيم', status: 'optimal' }
              ]
            }
          />
        </div>

        {/* Controls Sidebar */}
        <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-r border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[45vh] lg:max-h-none">
          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">نوع الاستجابة المناعية:</label>
            <Tabs 
              value={mode} 
              onValueChange={(v) => {
                setMode(v as any);
                setTime(0);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                <TabsTrigger value="innate" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5 ml-1" />
                  الفطرية
                </TabsTrigger>
                <TabsTrigger value="adaptive" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <Shield className="w-3.5 h-3.5 ml-1" />
                  التكيفية
                </TabsTrigger>
                <TabsTrigger value="memory" className="text-xs data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
                  <Sparkles className="w-3.5 h-3.5 ml-1" />
                  الذاكرة
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Controls Panel */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">محاكي الهجوم والدفاع</span>
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

            {/* Antibody Count Slider */}
            {mode === 'adaptive' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>عيار الأجسام المضادة (Antibody Concentration):</span>
                  <span className="text-blue-400 font-bold">{antibodyCount} جزيئات</span>
                </div>
                <Slider
                  value={[antibodyCount]}
                  min={1}
                  max={12}
                  step={1}
                  onValueChange={([v]) => setAntibodyCount(v)}
                  className="py-1"
                />
              </div>
            )}

            {/* Immunoglobulin Structure Legend */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">بنية الجسم المضاد (IgG):</span>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <p>• <strong>المنطقة الثابتة (Fc):</strong> ترتبط بمستقبلات الخلايا البلعمية.</p>
                <p>• <strong>المنطقة المتغيرة (Fab):</strong> ترتبط نوعياً بمستضدات الميكروب.</p>
              </div>
            </div>
          </div>

          {/* Live AI Lab CoPilot */}
          <LiveAILabCoPilot
            simName="الجهاز المناعي والأجسام المضادة"
            currentParameters={{
              "المسار المناعي": mode,
              "عدد الأجسام المضادة": `${antibodyCount}`,
              "حالة الفيروس": isNeutralized ? "مُحيَّد" : "نشط"
            }}
            liveHint={
              mode === 'adaptive'
                ? isNeutralized
                  ? "أحسنت! أحاطت الأجسام المضادة بأشواك الفيروس ومنعته من الالتصاق بمستقبلات خلايا الجسم (Neutralization)!"
                  : "زد تركيز الأجسام المضادة لتغطي كافة أشواك الفيروس وتحييده تماماً."
                : mode === 'innate'
                ? "البلعم الكبير يتعرف على الأنماط الجزيئية المرتبطة بمسببات الأمراض (PAMPs) ويبتلعها فوراً!"
                : "الخلايا الذاكرة تحتفظ بالبصمة الجزيئية للممرض لعقود، مما يمنح الجسم مناعة طويلة الأمد."
            }
          />

          {/* Lab Challenge Engine */}
          <LabChallengeEngine
            challenges={IMMUNE_CHALLENGES}
            currentParams={{
              mode,
              antibodyCount
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImmuneSystemSimulation;
