import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Info, Zap, Flame, ShieldAlert, RotateCcw, 
  Play, Pause, Award, HelpCircle, Activity, Thermometer,
  Radio, Sparkles, Volume2, VolumeX, Maximize2, Minimize2,
  Download, Eye, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { NuclearChamber3D, NuclearMode } from '@/components/nuclear/NuclearChamber3D';
import { EnergyDisplay } from '@/components/nuclear/EnergyDisplay';
import { NuclearQuiz } from '@/components/nuclear/NuclearQuiz';
import { EDUCATIONAL_CONTENT } from '@/data/nuclear-data';

const NuclearReactionsSimulation = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'fission' | 'fusion' | 'reactor' | 'energy' | 'quiz'>('fission');

  // Audio & Fullscreen
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera preset
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'core' | 'nucleus' | 'tokamak'>('overview');

  // --- FISSION STATE ---
  const [fissionStage, setFissionStage] = useState<'idle' | 'neutron_fired' | 'excited' | 'split' | 'fragments'>('idle');
  const [fissionCount, setFissionCount] = useState(0);

  // --- FUSION STATE ---
  const [plasmaTempMillionK, setPlasmaTempMillionK] = useState(100);
  const [magneticFieldTesla, setMagneticFieldTesla] = useState(5.4);
  const [isFusing, setIsFusing] = useState(false);

  // --- REACTOR CORE STATE ---
  const [controlRodPosition, setControlRodPosition] = useState(50); // 0% = out, 100% = full in
  const [coolantFlow, setCoolantFlow] = useState(75); // %
  const [thermalPowerMW, setThermalPowerMW] = useState(1000);
  const [coreTempC, setCoreTempC] = useState(315);
  const [isScrammed, setIsScrammed] = useState(false);

  // Criticality factor calculation
  // At 50% rods -> kEff = 1.00
  const kEff = useMemo(() => {
    if (isScrammed) return 0.65;
    return Number((1.35 - (controlRodPosition / 100) * 0.70).toFixed(3));
  }, [controlRodPosition, isScrammed]);

  // Reactor physics simulation tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeTab === 'reactor') {
        setThermalPowerMW((prev) => {
          if (isScrammed) {
            return Math.max(15, prev * 0.85); // Decay heat
          }
          let target = 1000 * Math.pow(kEff, 3);
          if (kEff > 1.0) {
            target = prev * (1 + (kEff - 1.0) * 0.35);
          } else if (kEff < 1.0) {
            target = Math.max(20, prev * (1 - (1.0 - kEff) * 0.25));
          }
          return Math.min(3200, Math.max(10, Math.round(target)));
        });

        setCoreTempC((prev) => {
          const equilibriumTemp = 280 + (thermalPowerMW / 1000) * 120 - (coolantFlow - 70) * 1.5;
          const delta = (equilibriumTemp - prev) * 0.1;
          return Number(Math.min(950, Math.max(25, prev + delta)).toFixed(1));
        });
      }
    }, 400);

    return () => clearInterval(timer);
  }, [activeTab, kEff, isScrammed, thermalPowerMW, coolantFlow]);

  // Firing neutron trigger in Fission
  const handleFireNeutron = () => {
    if (fissionStage !== 'idle') return;
    labSound.playLaserPulse(400);
    setFissionStage('neutron_fired');

    setTimeout(() => {
      setFissionStage('excited');
      labSound.playLaserPulse(700);
    }, 700);

    setTimeout(() => {
      setFissionStage('split');
      labSound.playSuccessChime();
      setFissionCount((c) => c + 1);
    }, 1600);

    setTimeout(() => {
      setFissionStage('fragments');
    }, 2400);
  };

  const handleResetFission = () => {
    setFissionStage('idle');
    labSound.playLaserPulse(300);
  };

  // Toggle fusion trigger
  const handleToggleFusion = () => {
    const willFuse = !isFusing;
    setIsFusing(willFuse);
    if (willFuse) {
      labSound.playSuccessChime();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Emergency SCRAM trigger
  const handleSCRAM = () => {
    setIsScrammed(true);
    setControlRodPosition(100);
    labSound.playLaserPulse(200);
  };

  const handleResetSCRAM = () => {
    setIsScrammed(false);
    setControlRodPosition(50);
    labSound.playLaserPulse(400);
  };

  // HUD Metrics
  const hudMetrics = useMemo(() => {
    if (activeTab === 'reactor') {
      return [
        {
          id: 'power',
          label: 'القدرة الحرارية (Thermal Power)',
          value: thermalPowerMW,
          unit: 'MWth',
          status: coreTempC > 650 ? ('warning' as const) : ('nominal' as const),
          min: 0,
          max: 3000,
        },
        {
          id: 'temp',
          label: 'حرارة قلب المفاعل (Core Temp)',
          value: coreTempC,
          unit: '°C',
          status: coreTempC > 600 ? ('danger' as const) : ('nominal' as const),
          min: 200,
          max: 800,
        },
        {
          id: 'keff',
          label: 'معامل التضاعف الحرج (k_eff)',
          value: kEff,
          unit: '',
          status: Math.abs(kEff - 1.0) < 0.03 ? ('nominal' as const) : ('warning' as const),
          min: 0.7,
          max: 1.3,
        },
        {
          id: 'rods',
          label: 'إدخال قضبان التحكم',
          value: controlRodPosition,
          unit: '%',
          status: 'idle' as const,
          min: 0,
          max: 100,
        },
      ];
    }
    if (activeTab === 'fusion') {
      return [
        {
          id: 'temp',
          label: 'حرارة البلازما (Plasma Temp)',
          value: plasmaTempMillionK,
          unit: 'M K',
          status: plasmaTempMillionK >= 100 ? ('nominal' as const) : ('warning' as const),
          min: 10,
          max: 250,
        },
        {
          id: 'bfield',
          label: 'المجال المغناطيسي الحاصر',
          value: magneticFieldTesla,
          unit: 'T',
          status: 'nominal' as const,
          min: 1.0,
          max: 10.0,
        },
        {
          id: 'fusion_power',
          label: 'طاقة التفاعل المنطلقة (Q)',
          value: isFusing ? 17.6 : 0,
          unit: 'MeV',
          status: isFusing ? ('nominal' as const) : ('idle' as const),
          min: 0,
          max: 20,
        },
      ];
    }
    // Fission default
    return [
      {
        id: 'energy',
        label: 'طاقة الانشطار لكل نواة',
        value: fissionStage === 'split' || fissionStage === 'fragments' ? 200 : 0,
        unit: 'MeV',
        status: fissionStage === 'split' ? ('nominal' as const) : ('idle' as const),
        min: 0,
        max: 220,
      },
      {
        id: 'neutrons',
        label: 'النيوترونات الفورية المنبعثة',
        value: fissionStage === 'split' || fissionStage === 'fragments' ? 3 : 0,
        unit: 'neutrons',
        status: 'nominal' as const,
        min: 0,
        max: 3,
      },
      {
        id: 'fissions_total',
        label: 'إجمالي الانشطارات المنفذة',
        value: fissionCount,
        unit: 'events',
        status: 'nominal' as const,
        min: 0,
        max: 20,
      },
    ];
  }, [activeTab, thermalPowerMW, coreTempC, kEff, controlRodPosition, plasmaTempMillionK, magneticFieldTesla, isFusing, fissionStage, fissionCount]);

  // Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'critical_core',
        title: 'تحقيق الحالة الحرجة المستقرة (Critical Reactor k=1.00)',
        description: 'اضبط قضبان التحكم (Cadmium Rods) ليصل معامل التضاعف k_eff إلى 1.00 تماماً لتحقيق توازن مستقر لإنتاج الطاقة.',
        targetMetric: 'معامل التضاعف k_eff',
        targetValue: 1.00,
        unit: '',
        currentValue: kEff,
        holdTimeRequired: 3,
        tolerance: 0.02,
        isCompleted: false,
        hint: 'حرك منزلق قضبان التحكم بالقرب من 50% وتجنب الإدخال المفرط أو السحب الكامل.',
      },
      {
        id: 'stable_power',
        title: 'توليد طاقة كهربائية مستقرة (1000 MWth)',
        description: 'حافظ على قدرة المفاعل الحرارية حول 1000 ميجاواط مع الحفاظ على درجة حرارة القلب تحت 600°C.',
        targetMetric: 'القدرة الحرارية',
        targetValue: 1000,
        unit: 'MWth',
        currentValue: thermalPowerMW,
        holdTimeRequired: 4,
        tolerance: 150,
        isCompleted: false,
        hint: 'عندما ترتفع القدرة، اضبط تدفق سائل التبريد واضبط قضبان التحكم لإيقاف صعود التفاعل.',
      },
      {
        id: 'fusion_ignition',
        title: 'إشعال الاندماج النووي للبلازما (Fusion Ignition)',
        description: 'ارفع حرارة بلازما الديوتيريوم والتريتيوم فوق 100 مليون كلفن وشغّل تفاعل الاندماج النووي لإنتاج جسيمات ألفا 17.6 MeV.',
        targetMetric: 'حرارة البلازما',
        targetValue: 120,
        unit: 'M K',
        currentValue: isFusing ? plasmaTempMillionK : 0,
        holdTimeRequired: 2,
        tolerance: 30,
        isCompleted: false,
        hint: 'انتقل لتبويب الاندماج، ارفع درجة الحرارة فوق 100M K واضغط على زر بدء التفاعل.',
      },
    ];
  }, [kEff, thermalPowerMW, isFusing, plasmaTempMillionK]);

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
    const headers = 'Timestamp,Tab,ThermalPower_MW,CoreTemp_C,kEff,ControlRods_Percent,PlasmaTemp_MK,IsFusing\n';
    const row = `${new Date().toISOString()},${activeTab},${thermalPowerMW},${coreTempC},${kEff},${controlRodPosition},${plasmaTempMillionK},${isFusing}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nuclear_sim_data_${activeTab}.csv`;
    link.click();
    labSound.playSuccessChime();
  };

  // Convert tab to NuclearMode for 3D Chamber
  const chamberMode: NuclearMode =
    activeTab === 'fusion' ? 'fusion' : activeTab === 'reactor' ? 'reactor' : 'fission';

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
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة إلى مختبر التجارب العلمية
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                  مختبر الفيزياء النووية والمفاعلات ثلاثي الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  انشطار اليورانيوم، اندماج البلازما المغناطيسية، والتحكم بحرجية قلب المفاعل الذري
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
            {activeTab === 'reactor' && (
              <Button
                variant={isScrammed ? 'default' : 'destructive'}
                size="sm"
                onClick={isScrammed ? handleResetSCRAM : handleSCRAM}
                className="font-bold flex items-center gap-1 shadow-lg shadow-red-500/20"
              >
                <ShieldAlert className="w-4 h-4" />
                {isScrammed ? 'إلغاء الإيقاف الطارئ (Reset SCRAM)' : 'إيقاف طوارئ فوري (SCRAM)'}
              </Button>
            )}
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طاقة التفاعل (E = mc²)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">
                {activeTab === 'fusion' ? (isFusing ? '17.6 MeV' : '0.0 MeV') : '200.0 MeV'}
              </p>
              <span className="text-[10px] text-slate-500">نقص الكتلة المتكافئ</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معامل الحرجية (k_eff)</span>
              <p className={`text-lg font-bold font-mono ${Math.abs(kEff - 1.0) < 0.03 ? 'text-emerald-400' : kEff > 1 ? 'text-amber-400' : 'text-sky-400'}`}>
                {kEff.toFixed(3)}
              </p>
              <span className="text-[10px] text-slate-500">
                {kEff === 1.0 ? 'حرج مستقر (Critical)' : kEff > 1 ? 'فوق حرج (Supercritical)' : 'تحت حرج (Subcritical)'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">القدرة الحرارية الناتجة</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{thermalPowerMW} MWth</p>
              <span className="text-[10px] text-slate-500">طاقة بخار التوربينات</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حرارة قلب المفاعل / البلازما</span>
              <p className={`text-lg font-bold font-mono ${coreTempC > 650 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {activeTab === 'fusion' ? `${plasmaTempMillionK} M K` : `${coreTempC} °C`}
              </p>
              <span className="text-[10px] text-slate-500">
                {coreTempC > 650 ? 'تحذير ارتفاع حرارة!' : 'ضمن الحدود الآمنة'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة تشيرينكوف الزرقاء</span>
              <p className="text-xs font-bold text-sky-400 mt-1">✓ إشعاع تشيرينكوف نشط</p>
              <span className="text-[10px] text-slate-500">سرعة جسيمات {'>'} سرعة الضوء بالماء</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-1">
            <TabsTrigger value="fission" className="flex items-center gap-1.5 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Radio className="w-4 h-4" />
              انشطار الذرة (²³⁵U)
            </TabsTrigger>
            <TabsTrigger value="fusion" className="flex items-center gap-1.5 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Flame className="w-4 h-4" />
              اندماج التوكاماك (D-T)
            </TabsTrigger>
            <TabsTrigger value="reactor" className="flex items-center gap-1.5 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Zap className="w-4 h-4" />
              قلب المفاعل والتحكم
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-1.5 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Activity className="w-4 h-4" />
              مقارنة الطاقة النووية
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-1.5 data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* 3D Visualization Tab (Fission, Fusion, or Reactor) */}
          {(activeTab === 'fission' || activeTab === 'fusion' || activeTab === 'reactor') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D Canvas Column */}
              <div className="lg:col-span-2 space-y-4" ref={containerRef}>
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      {activeTab === 'fission' && 'الغرفة النووية ثلاثية الأبعاد: انشطار اليورانيوم-235'}
                      {activeTab === 'fusion' && 'مفاعل الاندماج الحلقي توكاماك ثلاثي الأبعاد (Tokamak 3D)'}
                      {activeTab === 'reactor' && 'مصفوفة حزمة الوقود وقضبان التحكم في قلب المفاعل'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                        {activeTab === 'fission' && 'حساب كتل ويغنر-ويلر'}
                        {activeTab === 'fusion' && 'حصر مغناطيسي حلقي'}
                        {activeTab === 'reactor' && `الحرجية k=${kEff.toFixed(2)}`}
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
                  <CardContent className="p-0 h-[480px] bg-slate-950 relative">
                    <NuclearChamber3D
                      mode={chamberMode}
                      fissionStage={fissionStage}
                      plasmaTempMillionK={plasmaTempMillionK}
                      magneticFieldTesla={magneticFieldTesla}
                      isFusing={isFusing}
                      controlRodPosition={controlRodPosition}
                      coreTempC={coreTempC}
                      kEff={kEff}
                      cameraPreset={cameraPreset}
                    />

                    {/* CyberLabHUD overlay */}
                    <CyberLabHUD
                      title={
                        activeTab === 'fission'
                          ? 'مختبر الانشطار النووي'
                          : activeTab === 'fusion'
                          ? 'مفاعل الاندماج البلازمي'
                          : 'غرفة تحكم قلب المفاعل'
                      }
                      metrics={hudMetrics}
                      waveformMode="pulse"
                      status={coreTempC > 650 ? 'danger' : isScrammed ? 'warning' : 'nominal'}
                    />

                    {/* Camera Angle Presets */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px] z-20">
                      <button
                        onClick={() => setCameraPreset('overview')}
                        className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'overview' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                      >
                        المنظور العام
                      </button>
                      <button
                        onClick={() => setCameraPreset('nucleus')}
                        className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'nucleus' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                      >
                        النواة الكمومية
                      </button>
                      <button
                        onClick={() => setCameraPreset('core')}
                        className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'core' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                      >
                        قلب الحزمة
                      </button>
                      <button
                        onClick={() => setCameraPreset('tokamak')}
                        className={`px-2 py-1 rounded-lg transition-all ${cameraPreset === 'tokamak' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                      >
                        التوكاماك
                      </button>
                    </div>

                    {/* Live Assistant Hint */}
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 z-20">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        {activeTab === 'fission' &&
                          '💡 يمتص اليورانيوم-235 نيوتروناً حرارياً بطيئاً ليصبح يورانيوم-236 غير مستقر، فيهتز وينشطر إلى باريوم-141 وكريبتون-92 مع إطلاق 3 نيوترونات سريعة و 200 MeV طاقة.'}
                        {activeTab === 'fusion' &&
                          '💡 يحاكي الاندماج قلب النجوم: يندمج الديوتيريوم والتريتيوم عند درجات حرارة تفوق 100 مليون كلفن لإنتاج الهيليوم-4 ونيوترون طاقة عالي 14.1 MeV بدون نفايات طويلة الأمد.'}
                        {activeTab === 'reactor' &&
                          '💡 قضبان الكادميوم تمتص النيوترونات الفائضة. عندما تكون عند 50% يكون معامل الحرجية k=1.00 وتستقر القدرة عند 1000 ميجاواط.'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cyber Challenges Engine */}
                <LabChallengeEngine challenges={challenges} />
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                {/* Specific controls per active tab */}
                {activeTab === 'fission' && (
                  <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                    <CardHeader className="py-3 px-4 border-b border-slate-800">
                      <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400" />
                        التحكم في قاذف النيوترونات والانشطار
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        أطلق نيوتروناً بطيئاً (Thermal Neutron) نحو نواة اليورانيوم ²³⁵U لمراقبة تفكك النواة عبر نموذج قطرة السائل وظهور النوى الوليدة.
                      </p>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleFireNeutron}
                          disabled={fissionStage !== 'idle'}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 shadow-lg shadow-emerald-500/20"
                        >
                          <Play className="w-4 h-4 ml-1.5" />
                          إطلاق النيوترون (Fire Neutron)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleResetFission}
                          disabled={fissionStage === 'idle'}
                          className="border-slate-700 bg-slate-800 text-slate-300"
                        >
                          <RotateCcw className="w-4 h-4 ml-1" />
                          إعادة
                        </Button>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>معادلة الانشطار:</span>
                          <span className="font-mono text-emerald-400 font-bold">¹n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3¹n</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>طاقة الربط النووي المنطلقة:</span>
                          <span className="font-mono text-amber-400 font-bold">200 MeV (3.2 × 10⁻¹¹ J)</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>نواة المركب الوسيط:</span>
                          <span className="font-mono text-sky-400 font-bold">²³⁶U* (T½ ≈ 10⁻¹² s)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'fusion' && (
                  <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                    <CardHeader className="py-3 px-4 border-b border-slate-800">
                      <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-purple-400" />
                        التحكم في بلازما التوكاماك
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Plasma Temp Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300">درجة حرارة البلازما (Plasma Temperature)</label>
                          <span className="text-xs font-mono font-bold text-purple-400">{plasmaTempMillionK} Million K</span>
                        </div>
                        <Slider
                          value={[plasmaTempMillionK]}
                          min={20}
                          max={250}
                          step={5}
                          onValueChange={(v) => setPlasmaTempMillionK(v[0])}
                          className="py-1"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>20M K</span>
                          <span>عتبة الاشتعال 100M K</span>
                          <span>250M K (ITER)</span>
                        </div>
                      </div>

                      {/* Magnetic Field Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300">شدة المجال المغناطيسي الحاصر (B-Field)</label>
                          <span className="text-xs font-mono font-bold text-sky-400">{magneticFieldTesla.toFixed(1)} Tesla</span>
                        </div>
                        <Slider
                          value={[magneticFieldTesla]}
                          min={2.0}
                          max={10.0}
                          step={0.2}
                          onValueChange={(v) => setMagneticFieldTesla(v[0])}
                          className="py-1"
                        />
                      </div>

                      <Button
                        onClick={handleToggleFusion}
                        className={`w-full font-bold py-2.5 shadow-lg transition-all ${
                          isFusing
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20'
                        }`}
                      >
                        <Flame className="w-4 h-4 ml-1.5" />
                        {isFusing ? 'إيقاف تفاعل الاندماج' : 'إشعال تفاعل الاندماج D-T'}
                      </Button>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>معادلة الاندماج:</span>
                          <span className="font-mono text-purple-400 font-bold">²H + ³H → ⁴He + ¹n + 17.6 MeV</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>معيار لوسون (Lawson Criterion):</span>
                          <span className="font-mono text-emerald-400 font-bold">{isFusing ? 'محقق nτT > 3×10²¹' : 'غير محقق'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'reactor' && (
                  <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                    <CardHeader className="py-3 px-4 border-b border-slate-800">
                      <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        لوحة تحكم مشغل المفاعل (Reactor Operator)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Control Rods Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300">إدخال قضبان التحكم (Cadmium Rods)</label>
                          <span className="text-xs font-mono font-bold text-amber-400">{controlRodPosition}%</span>
                        </div>
                        <Slider
                          value={[controlRodPosition]}
                          min={0}
                          max={100}
                          step={1}
                          disabled={isScrammed}
                          onValueChange={(v) => setControlRodPosition(v[0])}
                          className="py-1"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>0% (مسحوبة بالكامل - زيادة التفاعل)</span>
                          <span>50% (حرج كفء)</span>
                          <span>100% (إدخال كامل)</span>
                        </div>
                      </div>

                      {/* Coolant Pump Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300">مضخات سائل التبريد (Coolant Flow)</label>
                          <span className="text-xs font-mono font-bold text-cyan-400">{coolantFlow}%</span>
                        </div>
                        <Slider
                          value={[coolantFlow]}
                          min={20}
                          max={100}
                          step={5}
                          onValueChange={(v) => setCoolantFlow(v[0])}
                          className="py-1"
                        />
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>حالة الحرجية:</span>
                          <span className={`font-mono font-bold ${Math.abs(kEff - 1.0) < 0.03 ? 'text-emerald-400' : kEff > 1 ? 'text-amber-400' : 'text-sky-400'}`}>
                            k = {kEff.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>حالة نظام الأمان SCRAM:</span>
                          <span className={`font-mono font-bold ${isScrammed ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isScrammed ? 'تم إسقاط القضبان طارئاً' : 'جاهز للعمل (ARMED)'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Live AI Lab CoPilot */}
                <LiveAILabCoPilot
                  experimentName="الفيزياء النووية ومفاعلات الطاقة"
                  currentMetrics={{
                    mode: activeTab,
                    kEff,
                    thermalPowerMW,
                    coreTempC,
                    plasmaTempMillionK,
                    isFusing,
                    controlRodPosition,
                  }}
                  hint={
                    activeTab === 'reactor'
                      ? 'حاول الحفاظ على k_eff مساوياً لـ 1.000 للوصول إلى طاقة مستقرة دون التسبب في فرط حراري.'
                      : activeTab === 'fusion'
                      ? 'ارفع درجة حرارة البلازما وتأكد من استقرار المجال المغناطيسي لتحقيق اندماج D-T.'
                      : 'أطلق نيوتروناً حرارياً وشاهد مراحل تفكك النواة عبر نموذج قطرة السائل.'
                  }
                />
              </div>
            </div>
          )}

          {/* TAB 4: Energy Comparison */}
          {activeTab === 'energy' && (
            <div className="space-y-6">
              <EnergyDisplay />
            </div>
          )}

          {/* TAB 5: Quiz */}
          {activeTab === 'quiz' && (
            <Card className="bg-slate-900/90 border-slate-800 p-8 shadow-xl">
              <NuclearQuiz />
            </Card>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default NuclearReactionsSimulation;
