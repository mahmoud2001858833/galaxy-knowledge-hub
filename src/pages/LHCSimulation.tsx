import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Atom, Sparkles, Volume2, VolumeX, Maximize2, 
  Minimize2, Download, Eye, Zap, Flame, ShieldCheck, Play, Pause, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLHCSimulation } from '@/hooks/useLHCSimulation';
import { LHCChamber3D } from '@/components/lhc/LHCChamber3D';
import { ControlPanel } from '@/components/lhc/ControlPanel';
import { InfoDashboard } from '@/components/lhc/InfoDashboard';
import { EducationalSection } from '@/components/lhc/EducationalSection';
import { ScenariosPanel } from '@/components/lhc/ScenariosPanel';
import { QuizSection } from '@/components/lhc/QuizSection';
import { ExperimentLog } from '@/components/lhc/ExperimentLog';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

const LHCSimulation = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    state,
    realTimeData,
    experimentLog,
    setBeamEnergy,
    setBeamSpeed,
    setParticleType,
    setParticleCount,
    launchBeams,
    stopBeams,
    activateCollision,
    stopCollision,
    logExperiment,
    loadScenario,
  } = useLHCSimulation();

  // Fullscreen & Sound
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Camera presets: tunnel, detector, collision, overview
  const [cameraPreset, setCameraPreset] = useState<'tunnel' | 'detector' | 'collision' | 'overview'>('overview');

  const handleCollision = () => {
    activateCollision();
    labSound.playLaserPulse(800);

    const isHiggsEnergy = state.beamEnergy >= 10000;
    const resultingCount = Math.min(Math.floor(state.beamEnergy / 150) + 20, 120);

    if (isHiggsEnergy) {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      labSound.playSuccessChime();
    }

    setTimeout(() => {
      logExperiment(resultingCount, isHiggsEnergy);
      setTimeout(() => {
        stopCollision();
      }, 2500);
    }, 1500);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Timestamp,BeamEnergy_GeV,BeamSpeed_Ratio,ParticleType,CollisionActive,Luminosity\n';
    const row = `${new Date().toISOString()},${state.beamEnergy},${state.beamSpeed},${state.particleType},${state.collisionActive},${state.luminosity}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lhc_experiment_${Date.now()}.csv`;
    link.click();
    labSound.playSuccessChime();
  };

  // Relativistic Lorentz Factor gamma = 1 / sqrt(1 - v^2/c^2)
  const lorentzGamma = useMemo(() => {
    const v = Math.min(0.9999999, state.beamSpeed);
    return Number((1 / Math.sqrt(1 - v * v)).toFixed(1));
  }, [state.beamSpeed]);

  // HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'energy',
        label: 'طاقة الحزمة (Beam Energy)',
        value: Number((state.beamEnergy / 1000).toFixed(2)),
        unit: 'TeV',
        status: state.beamEnergy >= 13000 ? ('nominal' as const) : ('idle' as const),
        min: 0.45,
        max: 14.0,
      },
      {
        id: 'speed',
        label: 'سرعة الجسيمات بالنسبة للضوء (%c)',
        value: Number((state.beamSpeed * 100).toFixed(4)),
        unit: '% c',
        status: 'nominal' as const,
        min: 50,
        max: 100,
      },
      {
        id: 'gamma',
        label: 'معامل لورنتز النسبي (γ)',
        value: lorentzGamma,
        unit: '',
        status: lorentzGamma > 10 ? ('nominal' as const) : ('idle' as const),
        min: 1,
        max: 8000,
      },
      {
        id: 'luminosity',
        label: 'اللمعان اللحظي (Luminosity)',
        value: state.luminosity,
        unit: '×10³⁴',
        status: 'nominal' as const,
        min: 0,
        max: 5,
      },
    ];
  }, [state.beamEnergy, state.beamSpeed, lorentzGamma, state.luminosity]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'relativistic_speed',
        title: 'التسارع النسبي فائق السرعة (Ultra-Relativistic Speed)',
        description: 'قم بتسريع حزمة البروتونات لتتجاوز 95% من سرعة الضوء c لدخول النطاق النسبي لفيزياء الجسيمات.',
        targetMetric: 'سرعة الحزمة (%c)',
        targetValue: 95.0,
        unit: '%',
        currentValue: state.beamsLaunched ? Number((state.beamSpeed * 100).toFixed(1)) : 0,
        holdTimeRequired: 3,
        tolerance: 5.0,
        isCompleted: false,
        hint: 'أطلق الحزم وارفع سرعة الحزمة في لوحة التحكم إلى أقصى حد.',
      },
      {
        id: 'high_energy_collision',
        title: 'تصادم فائق الطاقة (High-Energy Discovery Mode)',
        description: 'اضبط طاقة الحزمة إلى 13.0 TeV أو أعلى وشغّل التصادم المباشر بين الحزمتين داخل كاشف ATLAS.',
        targetMetric: 'طاقة الحزمة',
        targetValue: 13.0,
        unit: 'TeV',
        currentValue: state.collisionActive ? Number((state.beamEnergy / 1000).toFixed(1)) : 0,
        holdTimeRequired: 2,
        tolerance: 1.0,
        isCompleted: false,
        hint: 'ارفع طاقة الحزمة إلى 13-14 TeV واضغط زر تفعيل التصادم.',
      },
      {
        id: 'higgs_boson_hunt',
        title: 'صيد بوزون هيغز وقنوات الاضمحلال (Higgs Boson Hunt)',
        description: 'حقق تصادماً بطاقة 14 TeV مع حزمة بروتونات مكتملة لكشف مسارات بوزون هيغز النادرة (H → γγ أو H → 4μ).',
        targetMetric: 'طاقة التصادم الأقصى',
        targetValue: 14.0,
        unit: 'TeV',
        currentValue: state.collisionActive && state.beamEnergy >= 13500 ? 14.0 : 0,
        holdTimeRequired: 2,
        tolerance: 0.5,
        isCompleted: false,
        hint: 'اختر السيناريو (اكتشاف بوزون هيغز) أو ارفع الطاقة إلى 14000 GeV مع نوع بروتون.',
      },
    ];
  }, [state.beamSpeed, state.beamsLaunched, state.collisionActive, state.beamEnergy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/scientific-simulations');
              }}
              className="text-slate-400 hover:text-white mb-2 p-0 h-auto font-normal flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              العودة إلى مختبر التجارب العلمية
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Atom className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                  مصادم الهدرونات الكبير ثلاثي الأبعاد (LHC 3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  تسريع الجسيمات النسبية وتصادمات كاشف ATLAS لاكتشاف بوزون هيغز وفيزياء النموذج العياري
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              تصدير البيانات (CSV)
            </Button>
            <Button
              onClick={handleCollision}
              disabled={!state.beamsLaunched || state.collisionActive}
              className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold shadow-lg shadow-rose-500/20"
            >
              <Sparkles className="w-4 h-4 ml-1.5" />
              {state.collisionActive ? 'التصادم جارٍ...' : 'إجراء التصادم الآن'}
            </Button>
          </div>
        </div>

        {/* Live Gauges Top Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طاقة مركز الكتلة (√s)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{(state.beamEnergy / 1000).toFixed(2)} TeV</p>
              <span className="text-[10px] text-slate-500">14 TeV كحد أقصى</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">سرعة الحزمة النسبية</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{(state.beamSpeed * 100).toFixed(4)}% c</p>
              <span className="text-[10px] text-slate-500">يقارب سرعة الضوء</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معامل لورنتز (γ)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{lorentzGamma}</p>
              <span className="text-[10px] text-slate-500">تمدد الزمن النسبي</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حرارة التبريد الفائق</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{state.temperature.toFixed(1)}°C</p>
              <span className="text-[10px] text-slate-500">1.9 K (أبرد من الفضاء)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المجال المغناطيسي الثنائي</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{state.magnetStrength.toFixed(1)} T</p>
              <span className="text-[10px] text-slate-500">مغانط التيتانيوم فائقة التوصيل</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معدل عبور الحزم</span>
              <p className="text-lg font-bold text-rose-400 font-mono">40 MHz</p>
              <span className="text-[10px] text-slate-500">تصادم كل 25 نانو ثانية</span>
            </CardContent>
          </Card>
        </div>

        {/* 3D Visualization and Sidebar Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 3D Canvas Column */}
          <div className="lg:col-span-2 space-y-4" ref={containerRef}>
            <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
              <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  حجرة كاشف التصادمات وأنفاق المصادم ثلاثية الأبعاد (3D LHC Detector)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${state.collisionActive ? 'border-rose-500/50 text-rose-400 bg-rose-500/10 animate-pulse' : state.beamsLaunched ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-400'}`}
                  >
                    {state.collisionActive ? '💥 تصادم نشط وتوليد جسيمات' : state.beamsLaunched ? '✓ الحزم في حالة دوران دوري' : 'جاهز لإطلاق الحزم'}
                  </Badge>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="ملء الشاشة"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-0 h-[500px] bg-slate-950 relative">
                <LHCChamber3D
                  beamsLaunched={state.beamsLaunched}
                  beamSpeed={state.beamSpeed}
                  beamEnergy={state.beamEnergy}
                  collisionActive={state.collisionActive}
                  particleType={state.particleType}
                  cameraPreset={cameraPreset}
                />

                {/* CyberLabHUD overlay */}
                <CyberLabHUD
                  title="مصادم الهدرونات الكبير - كاشف ATLAS"
                  metrics={hudMetrics}
                  waveformMode="pulse"
                  status={state.collisionActive ? 'danger' : state.beamsLaunched ? 'nominal' : 'idle'}
                />

                {/* Camera Angle Presets */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px] z-20">
                  <button
                    onClick={() => setCameraPreset('overview')}
                    className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'overview' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  >
                    المنظور العام
                  </button>
                  <button
                    onClick={() => setCameraPreset('detector')}
                    className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'detector' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  >
                    مقطع الكاشف
                  </button>
                  <button
                    onClick={() => setCameraPreset('tunnel')}
                    className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'tunnel' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  >
                    أنبوب الحزمة
                  </button>
                  <button
                    onClick={() => setCameraPreset('collision')}
                    className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'collision' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  >
                    نقطة التصادم
                  </button>
                </div>

                {/* Live Assistant Hint */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 z-20">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    {state.collisionActive
                      ? '💡 يحدث التصادم عند طاقات تفوق 13 TeV مما يولد كثافة طاقة شبيهة بتلك التي سادت في الجزء الأول من الثانية بعد الانفجار العظيم!'
                      : state.beamsLaunched
                      ? '💡 تدور حزمتان متعاكستان من البروتونات داخل حلقتين مفرغتين بمساعدة 1232 مغناطيساً ثنائي القطب فائق التوصيل.'
                      : '💡 اضغط "إطلاق الحزم" لبدء حقن البروتونات وتسريعها في الحلقات المغناطيسية.'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Cyber Challenge Engine */}
            <LabChallengeEngine challenges={challenges} />

            {/* Real-time Telemetry Dashboard */}
            <InfoDashboard data={realTimeData} />
          </div>

          {/* Control Panel Column & AI CoPilot */}
          <div className="space-y-4">
            <ControlPanel
              beamEnergy={state.beamEnergy}
              beamSpeed={state.beamSpeed}
              particleType={state.particleType}
              particleCount={state.particleCount}
              beamsLaunched={state.beamsLaunched}
              collisionActive={state.collisionActive}
              onBeamEnergyChange={setBeamEnergy}
              onBeamSpeedChange={setBeamSpeed}
              onParticleTypeChange={setParticleType}
              onParticleCountChange={setParticleCount}
              onLaunchBeams={launchBeams}
              onStopBeams={stopBeams}
              onActivateCollision={handleCollision}
            />

            {/* Live AI Lab CoPilot */}
            <LiveAILabCoPilot
              experimentName="مصادم الهدرونات الكبير ومسارات الجسيمات"
              currentMetrics={{
                energyTeV: Number((state.beamEnergy / 1000).toFixed(2)),
                speedRatio: Number((state.beamSpeed * 100).toFixed(3)),
                lorentzGamma,
                particleType: state.particleType,
                beamsLaunched: state.beamsLaunched,
                collisionActive: state.collisionActive,
                luminosity: state.luminosity,
              }}
              hint="قم بزيادة طاقة الحزمة إلى 14 TeV لتوسيع فرص رصد قنوات اضمحلال بوزون هيغز والجسيمات الثقيلة."
            />
          </div>
        </div>

        {/* Educational and Interactive Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EducationalSection />
          <ScenariosPanel onLoadScenario={loadScenario} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuizSection />
          <ExperimentLog logs={experimentLog} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LHCSimulation;
