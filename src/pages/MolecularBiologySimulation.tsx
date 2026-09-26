import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Dna, 
  Microscope, Sparkles, Activity, Layers, BookOpen 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MolecularBio3DScene from '@/components/biology/MolecularBio3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine from '@/components/simulations/LabChallengeEngine';

const BIO_CHALLENGES = [
  {
    id: 'dna-replication',
    title: 'تحدي تضاعف الـ DNA وشوكة التضاعف',
    description: 'شغّل محاكاة التضاعف وراقب كيف يفك إنزيم الهيليكاز الحلزون المزدوج بينما يقوم إنزيم البوليميراز ببناء الشريط القائد والشريط المتلكئ.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'replication' && params.speed >= 1.0,
    hint: 'اختر وضع تضاعف DNA واضبط سرعة المحاكاة عند 1x أو أعلى.'
  },
  {
    id: 'mrna-transcription',
    title: 'تحدي النسخ الجيني واستبدال الثايمين باليوراسيل',
    description: 'انتقل لوضع النسخ ولاحظ كيف يقرأ بوليميراز الرنا الشريط القالب لتركيب شريط mRNA أحادي واستبدال قاعدة T بقاعدة U الوردية.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'transcription',
    hint: 'اختر وضع النسخ (Transcription) من القائمة.'
  },
  {
    id: 'ribosome-translation',
    title: 'تحدي ترجمة الكودونات وبناء البروتين',
    description: 'استكشف الترجمة في الريبوسوم، حيث تشفر كل 3 نيوكليوتيدات (كودون) حمضاً أمينياً واحداً يضاف لسلسلة عديد الببتيد المتنامية.',
    targetCondition: (params: Record<string, any>) => params.simulationType === 'translation',
    hint: 'اختر وضع الترجمة (Translation) من القائمة.'
  }
];

const MolecularBiologySimulation: React.FC = () => {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'replication' | 'transcription' | 'translation' | 'pcr'>('replication');
  const [speed, setSpeed] = useState(1.0);
  const [time, setTime] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<'system' | 'fork' | 'ribosome' | 'helix'>('system');

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      if (isPlaying) {
        setTime((prev) => prev + 0.02 * speed);
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  const resetSimulation = () => {
    setTime(0);
    setSpeed(1.0);
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
              <h1 className="text-base sm:text-lg font-black text-cyan-400">
                علم الأحياء الجزيئي والجينات 3D
              </h1>
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px] bg-cyan-950/30">
                Molecular Engine
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              محاكاة ثلاثية الأبعاد لتضاعف DNA، النسخ الجيني mRNA، وترجمة البروتينات في الريبوسوم
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
            عام
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'fork' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('fork')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            الشوكة
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'ribosome' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('ribosome')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            الريبوسوم
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === 'helix' ? 'secondary' : 'ghost'}
            onClick={() => setCameraPreset('helix')}
            className="h-7 text-xs px-2 rounded-lg"
          >
            الحلزون
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 h-[55vh] lg:h-auto relative">
          <MolecularBio3DScene
            simulationType={simulationType}
            time={time}
            speed={speed}
            cameraPreset={cameraPreset}
          />

          {/* CyberLabHUD Floating Telemetry */}
          <CyberLabHUD
            title="مؤشرات الديناميكا الجزيئية"
            metrics={
              simulationType === 'replication' ? [
                { label: 'معدل البلمرة', value: '1,000 bp/sec', status: 'optimal' },
                { label: 'إنزيم فك الالتواء', value: 'DNA Helicase نشط', status: 'optimal' },
                { label: 'دقة النسخ', value: '99.999%', status: 'optimal' },
                { label: 'أجزاء أوكازاكي', value: 'تجميع نشط', status: 'normal' }
              ] : simulationType === 'transcription' ? [
                { label: 'إنزيم النسخ', value: 'RNA Polymerase II', status: 'optimal' },
                { label: 'الشريط الناتج', value: 'mRNA أحادي', status: 'optimal' },
                { label: 'قاعدة اليوراسيل (U)', value: 'نشطة مكملة لـ A', status: 'normal' },
                { label: 'سرعة النسخ', value: '50 nt/sec', status: 'optimal' }
              ] : [
                { label: 'وحدات الريبوسوم', value: '50S + 30S ملتحمة', status: 'optimal' },
                { label: 'كودون البدء', value: 'AUG (ميثيونين)', status: 'optimal' },
                { label: 'طول الببتيد', value: `${Math.floor((time * 3) % 40) + 6} أحماض أمينية`, status: 'normal' },
                { label: 'معدل الترجمة', value: '20 aa/sec', status: 'optimal' }
              ]
            }
          />
        </div>

        {/* Controls Sidebar */}
        <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-r border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[45vh] lg:max-h-none">
          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">العملية الجزيئية:</label>
            <Tabs 
              value={simulationType} 
              onValueChange={(v) => {
                setSimulationType(v as any);
                setTime(0);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl h-auto">
                <TabsTrigger value="replication" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 py-1.5">
                  <Dna className="w-3.5 h-3.5 ml-1" />
                  تضاعف الـ DNA
                </TabsTrigger>
                <TabsTrigger value="transcription" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 py-1.5">
                  <Activity className="w-3.5 h-3.5 ml-1" />
                  النسخ الجيني (mRNA)
                </TabsTrigger>
                <TabsTrigger value="translation" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-1.5">
                  <Layers className="w-3.5 h-3.5 ml-1" />
                  الترجمة والبروتين
                </TabsTrigger>
                <TabsTrigger value="pcr" className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 py-1.5">
                  <Sparkles className="w-3.5 h-3.5 ml-1" />
                  تفاعل PCR المتسلسل
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Speed & Playback */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">محاكي التفاعل الجزيئي</span>
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
                <span>سرعة الإنزيمات والتفاعلات:</span>
                <span className="text-cyan-400 font-bold">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed]}
                min={0.2}
                max={2.5}
                step={0.1}
                onValueChange={([v]) => setSpeed(v)}
                className="py-1"
              />
            </div>

            {/* Base Color Legend */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1.5 font-bold">دليل القواعد النيتروجينية:</span>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-bold text-center">
                <span className="p-1 rounded bg-red-950/70 border border-red-500/50 text-red-300">A أدينين</span>
                <span className="p-1 rounded bg-blue-950/70 border border-blue-500/50 text-blue-300">T ثايمين</span>
                <span className="p-1 rounded bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">G جوانين</span>
                <span className="p-1 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300">C سيتوزين</span>
                <span className="p-1 rounded bg-pink-950/70 border border-pink-500/50 text-pink-300">U يوراسيل</span>
              </div>
            </div>
          </div>

          {/* Live AI Lab CoPilot */}
          <LiveAILabCoPilot
            simName="الأحياء الجزيئية والجينات"
            currentParameters={{
              "العملية": simulationType,
              "السرعة": `${speed.toFixed(1)}x`,
              "حالة البلمرة": isPlaying ? "نشطة" : "متوقفة مؤقتاً"
            }}
            liveHint={
              simulationType === 'replication'
                ? "يتحرك إنزيم الهيليكاز لفك الروابط الهيدروجينية بين القواعد المتتامة (A-T برابطتين، و G-C بثلاث روابط)!"
                : simulationType === 'transcription'
                ? "يقرأ RNA Polymerase الشريط المضاد في الاتجاه 3' إلى 5' لتصنيع mRNA في الاتجاه 5' إلى 3' مستبدلاً T بـ U!"
                : "يرتبط جزيء tRNA الحامل للحمض الأميني بالكودون المطابق على mRNA داخل موقع A في الريبوسوم!"
            }
          />

          {/* Lab Challenge Engine */}
          <LabChallengeEngine
            challenges={BIO_CHALLENGES}
            currentParams={{
              simulationType,
              speed
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MolecularBiologySimulation;
