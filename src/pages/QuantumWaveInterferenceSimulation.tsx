import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Atom, Waves, Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Sparkles, BookOpen, Layers, 
  Target, CheckCircle2, AlertCircle, RefreshCw, Eye, Lightbulb, 
  Compass, Share2, Award, Zap, HelpCircle, Activity, ArrowRight,
  ExternalLink, Sliders, ShieldCheck, Cpu, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';
import { CyberLabHUD, HUDMetric } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';

// Quantum Physical Constants
const PLANCK_H = 6.62607015e-34; // J·s
const ELECTRON_MASS = 9.1093837e-31; // kg
const NEUTRON_MASS = 1.674927498e-27; // kg
const HELIUM_MASS = 6.6464764e-27; // kg (He-4)
const SPEED_OF_LIGHT = 299792458; // m/s
const EV_TO_JOULE = 1.602176634e-19; // J/eV

interface ParticlePreset {
  id: 'photon' | 'electron' | 'neutron' | 'helium';
  nameAr: string;
  nameEn: string;
  symbol: string;
  massKg: number;
  typicalWavelengthNm: number;
  typicalEnergyEV: number;
  color: string;
  badgeColor: string;
  description: string;
  historicalNote: string;
}

const PARTICLE_PRESETS: ParticlePreset[] = [
  {
    id: 'photon',
    nameAr: 'فوتونات الضوء (Photons)',
    nameEn: 'Light Photons',
    symbol: 'γ',
    massKg: 0,
    typicalWavelengthNm: 500, // 500 nm (Green)
    typicalEnergyEV: 2.48,
    color: '#22c55e',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
    description: 'كمّات الضوء عديمة الكتلة السكونية؛ تسلك سلوكاً موجياً كهرومغناطيسياً وجسيمياً كوانتياً (تأثير أينشتاين 1905).',
    historicalNote: 'تجربة توماس يونغ الأصلية عام 1801 وتأكيد أينشتاين لطبيعة الفوتون 1905.'
  },
  {
    id: 'electron',
    nameAr: 'إلكترونات دي برولي (Electrons)',
    nameEn: 'de Broglie Electrons',
    symbol: 'e⁻',
    massKg: ELECTRON_MASS,
    typicalWavelengthNm: 0.05, // 50 pm (0.05 nm)
    typicalEnergyEV: 150,
    color: '#06b6d4',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40',
    description: 'جسيمات دون ذرية سالبة الشحنة؛ تحقق فرضية دي برولي وتظهر نمط تداخل موجي فائق الوضوح حتى عند إطلاق إلكترون واحد كل مرة!',
    historicalNote: 'إثبات دافيسون وجيرمر عام 1927، وتجربة شق تونومورا المزدوج 1989.'
  },
  {
    id: 'neutron',
    nameAr: 'نيوترونات حرارية (Neutrons)',
    nameEn: 'Thermal Neutrons',
    symbol: 'n⁰',
    massKg: NEUTRON_MASS,
    typicalWavelengthNm: 0.18, // 1.8 Å
    typicalEnergyEV: 0.025,
    color: '#a855f7',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
    description: 'جسيمات نووية متعادلة كتلتها تعادل نحو 1836 ضعف كتلة الإلكترون؛ تُستخدم في فحص البنى البلورية وتشتت النيوترونات الكمية.',
    historicalNote: 'تداخل النيوترونات عبر التداخل الميكانيكي في مقاييس التداخل السيليكونية (Rauch 1974).'
  },
  {
    id: 'helium',
    nameAr: 'ذرات هيليوم-4 كاملة (He-4 Atoms)',
    nameEn: 'Helium-4 Atoms',
    symbol: '⁴He',
    massKg: HELIUM_MASS,
    typicalWavelengthNm: 0.08,
    typicalEnergyEV: 0.015,
    color: '#f59e0b',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
    description: 'ذرات مركبة متكاملة (نواة مع إلكترونين). يثبت هذا الاختبار أن الخصائص الموجية تنطبق على الذرات والجزيئات المركبة وليس الجسيمات البسيطة فقط!',
    historicalNote: 'حيود ذرات الهيليوم والجزيئات الحيوية الكبيرة (زيلينغر ومجموعة فيينا 1999).'
  }
];

const QuantumWaveInterferenceSimulation: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [activeScreen, setActiveScreen] = useState<'all' | '1' | '2' | '3'>('all');
  const [selectedParticle, setSelectedParticle] = useState<ParticlePreset>(PARTICLE_PRESETS[1]); // Default: Electrons
  const [isWhichWayDetectorOn, setIsWhichWayDetectorOn] = useState(false);
  const [slitDistanceUm, setSlitDistanceUm] = useState(120); // µm
  const [screenDistanceM, setScreenDistanceM] = useState(1.2); // meters
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'challenges' | 'quiz' | 'co-pilot'>('simulation');
  const [iframeKey, setIframeKey] = useState(0);

  // Challenges tracking
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Sound effects
  const playSoundEffect = (type: 'click' | 'success' | 'alert' | 'reset') => {
    if (isMuted) return;
    try {
      if (type === 'click') labSound.playClick();
      else if (type === 'success') labSound.playSuccess();
      else if (type === 'alert') labSound.playAlert();
      else if (type === 'reset') labSound.playReset();
    } catch {
      // Audio fallback silent
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
    playSoundEffect('click');
  };

  // Reload simulation iframe
  const handleReloadSimulation = () => {
    setIframeKey(prev => prev + 1);
    playSoundEffect('reset');
  };

  // Computed Quantum Physical Telemetry
  const quantumTelemetry = useMemo(() => {
    const p = selectedParticle;
    // de Broglie wavelength λ in meters
    const lambdaM = p.typicalWavelengthNm * 1e-9;
    
    // Momentum: p = h / λ
    const momentum = PLANCK_H / lambdaM;
    const momentumEvC = (momentum * SPEED_OF_LIGHT) / EV_TO_JOULE;
    
    // Fringe spacing: Δy = (λ * L) / d
    const dMeters = slitDistanceUm * 1e-6;
    const fringeSpacingMm = ((lambdaM * screenDistanceM) / dMeters) * 1e3;

    // Interference visibility: collapses if Which-Way Detector is on
    const visibilityPercent = isWhichWayDetectorOn ? 0 : 96;
    const coherenceState = isWhichWayDetectorOn 
      ? 'انهيار الدالة الموجية (موجات غير مترابطة)' 
      : 'تراكب كمي متماسك (Coherent Superposition)';

    return {
      lambdaNm: p.typicalWavelengthNm,
      momentumKgMs: momentum.toExponential(3),
      momentumEvC: momentumEvC.toFixed(1),
      energyEV: p.typicalEnergyEV,
      fringeSpacingMm: fringeSpacingMm.toFixed(3),
      visibilityPercent,
      coherenceState
    };
  }, [selectedParticle, slitDistanceUm, screenDistanceM, isWhichWayDetectorOn]);

  // HUD Metrics for CyberLabHUD
  const hudMetrics: HUDMetric[] = useMemo(() => [
    {
      id: 'particle',
      label: 'نوع الجسيم الكمي',
      value: selectedParticle.symbol,
      unit: selectedParticle.nameAr.split(' ')[0],
      color: 'text-cyan-400',
      icon: <Atom className="w-4 h-4 text-cyan-400" />
    },
    {
      id: 'wavelength',
      label: 'طول موجة دي برولي (λ)',
      value: quantumTelemetry.lambdaNm < 1 ? quantumTelemetry.lambdaNm.toFixed(3) : quantumTelemetry.lambdaNm,
      unit: 'nm',
      color: 'text-emerald-400',
      icon: <Waves className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'momentum',
      label: 'الزخم الكمي (p = h/λ)',
      value: quantumTelemetry.momentumEvC,
      unit: 'eV/c',
      color: 'text-purple-400',
      icon: <Zap className="w-4 h-4 text-purple-400" />
    },
    {
      id: 'energy',
      label: 'الطاقة الحركية (Ek)',
      value: quantumTelemetry.energyEV,
      unit: 'eV',
      color: 'text-amber-400',
      icon: <Gauge className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'fringe',
      label: 'تباعد أهداب التداخل (Δy)',
      value: isWhichWayDetectorOn ? '0 (معدوم)' : quantumTelemetry.fringeSpacingMm,
      unit: isWhichWayDetectorOn ? '' : 'mm',
      color: isWhichWayDetectorOn ? 'text-red-400' : 'text-blue-400',
      icon: <Target className="w-4 h-4 text-blue-400" />
    },
    {
      id: 'coherence',
      label: 'درجة تماسك التداخل',
      value: `${quantumTelemetry.visibilityPercent}%`,
      unit: isWhichWayDetectorOn ? 'مراقب' : 'تراكب',
      color: isWhichWayDetectorOn ? 'text-rose-400' : 'text-teal-400',
      progressPercent: quantumTelemetry.visibilityPercent,
      icon: <Eye className="w-4 h-4 text-teal-400" />
    }
  ], [selectedParticle, quantumTelemetry, isWhichWayDetectorOn]);

  // Export CSV Telemetry Log
  const handleExportCSV = () => {
    playSoundEffect('click');
    const headers = ['Particle', 'Mass_kg', 'Wavelength_nm', 'Momentum_eV_c', 'Energy_eV', 'Slit_Dist_um', 'Screen_Dist_m', 'Fringe_Spacing_mm', 'Which_Way_Detector', 'Coherence_State'];
    const row = [
      selectedParticle.nameEn,
      selectedParticle.massKg.toExponential(4),
      quantumTelemetry.lambdaNm,
      quantumTelemetry.momentumEvC,
      quantumTelemetry.energyEV,
      slitDistanceUm,
      screenDistanceM,
      isWhichWayDetectorOn ? '0.000' : quantumTelemetry.fringeSpacingMm,
      isWhichWayDetectorOn ? 'ENABLED' : 'DISABLED',
      quantumTelemetry.coherenceState
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      headers.join(',') + '\n' + 
      row.join(',') + '\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quantum_interference_${selectedParticle.id}_telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Challenges list
  const challenges = [
    {
      id: 'single_particle_duality',
      title: 'إثبات ازدواجية الجسيم والموجة بالطلقات المفردة',
      description: 'انتقل إلى نمط الجسيمات المفردة (Single Particles) للإلكترونات وراقب الشاشة الحساسة؛ تأكد من فهم كيف تبدأ كنقاط مفردة عشوائية ثم تتراكم لتشكل نمط التداخل.',
      hint: 'اختر الإلكترون ثم نمط Single Particles واضغط على زر الإطلاق لرؤية تراكب الومضات الفوسفورية.'
    },
    {
      id: 'mass_wavelength_comparison',
      title: 'مقارنة طول موجة دي برولي بين الإلكترون وذرة الهيليوم',
      description: 'لاحظ كيف تختلف مسافات تباعد أهداب التداخل عندما تزداد كتلة الجسيم بأكثر من 7300 ضعف عند الانتقال من الإلكترون إلى ذرة الهيليوم-4.',
      hint: 'وفقاً لعلاقة دي برولي λ = h/p، الكتلة الأكبر تعني زخماً أكبر وبالتالي طول موجة أقصر وتباعد أهداب أضيق.'
    },
    {
      id: 'which_way_collapse',
      title: 'لغز القياس وانهيار دالة الموجة (Which-Way Effect)',
      description: 'جرّب تشغيل كاشف المسار (Which-Way Detector) لمعرفة من أي شق يمر الجسيم، ولاحظ اختفاء أهداب التداخل فوراً وتحول النمط إلى توزيع كلاسيكي.',
      hint: 'معرفة المسار الذي سلكه الجسيم تلغي تراكب الحالات الكمية (Bohr Complementarity).'
    }
  ];

  // Quiz Questions
  const quizQuestions = [
    {
      question: 'وفقاً لعلاقة لويس دي برولي (λ = h / p)، ماذا يحدث لطول الموجة المصاحبة لجسيم إذا تضاعفت كتلته أو سرعته؟',
      options: [
        'يتضاعف طول الموجة إلى الضعف (2x)',
        'ينخفض طول الموجة إلى النصف (1/2)',
        'يبقى طول الموجة ثابتاً لأن الخصائص الموجية لا تتأثر بالكتلة',
        'يتحول الجسيم إلى موجة كهرومغناطيسية ضوئية نقية'
      ],
      correct: 1,
      explanation: 'العلاقة عكسية: λ = h / (m · v). زيادة الكتلة أو السرعة تزيد الزخم p في المقام، مما يقلل طول موجة دي برولي إلى النصف.'
    },
    {
      question: 'في تجربة الشق المزدوج للجسيمات المفردة (إلكترون واحد في كل مرة)، كيف ينشأ نمط التداخل على شاشة الكشف؟',
      options: [
        'نتيجة تصادم الإلكترونات ببعضها البعض في الهواء أثناء الطيران',
        'لأن كل إلكترون ينقسم إلى نصفين ماديين حقيقيين يمر كل نصف بشق ثم يتحدان ثانية',
        'يتداخل كل إلكترون مع نفسه كموجة احتمالية تصف سعة عبوره لكلا الشقين معاً وفق دالة الموجة ψ',
        'بسبب انعكاس الإلكترونات عن حواف الشاشة المعدنية'
      ],
      correct: 2,
      explanation: 'في ميكانيكا الكم، تصف دالة الموجة ψ سعة احتمال عبور الإلكترون لكلا الشقين بتراكب كمي متزامن، فيتداخل الإلكترون مع ذاته حتى ينهار على الشاشة عند نقطة محددة باحتمال |ψ|².'
    },
    {
      question: 'ماذا يحدث تجريبياً لنمط التداخل عند وضع كاشف حساس (Detector) على أحد الشقين لمعرفة أي شق عبره الإلكترون؟',
      options: [
        'يزداد نمط التداخل وضوحاً وتصبح الأهداب أكثر إشراقاً',
        'يختفي نمط التداخل تماماً ويتحول إلى حزمتين كلاسيكيتين تماثلان الجسيمات الصلبة التقليدية',
        'تنعكس أهداب التداخل فتتحول الأهداب المظلمة إلى مضيئة',
        'تتسارع الإلكترونات إلى سرعة تفوق سرعة الضوء'
      ],
      correct: 1,
      explanation: 'هذا جوهر مبدأ التكاملية لنيلز بور ومسألة القياس الكمي: كشف المسار يدمر التماسك الكمي (Decoherence) ويؤدي لانهيار دالة الموجة، فتزول حدود التداخل بين المسارين.'
    },
    {
      question: 'لماذا لا نلاحظ تداخل الموجات الكمية في حياتنا اليومية عند مرور كرات التنس أو السيارات من الأبواب؟',
      options: [
        'لأن ميكانيكا الكم لا تنطبق أبداً على الأجسام في كوكب الأرض',
        'لأن كرات التنس والسيارات تمتلك زخماً هائلاً يجعل طول موجة دي برولي بالغ الصغر (10⁻³⁴ m) ولا يمكن رصده مقارنة بأبعاد الأبواب',
        'لأن الجاذبية الأرضية تمتص جميع الموجات الكمية للأجسام المرئية',
        'لأن الضوء المرئي يلغي موجات المادة الكبيرة'
      ],
      correct: 1,
      explanation: 'نظراً لأن ثابت بلانك h صغير جداً (6.63 × 10⁻³⁴)، فإن كتلة كرة التنس الكبيرة تجعل λ في رتبة 10⁻³⁴ متراً، وهي أصغر بترليونات المرات من أي شق أو ذرة، فتسلك سلوكاً كلاسيكياً حتمياً.'
    }
  ];

  const handleSelectQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    playSoundEffect('click');
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === quizQuestions.length) {
      playSoundEffect('success');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      playSoundEffect('alert');
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    playSoundEffect('reset');
  };

  // Build iframe URL based on activeScreen
  const iframeSrc = useMemo(() => {
    const base = '/simulations/quantum-wave-interference.html';
    if (activeScreen === 'all') return base;
    return `${base}?screens=${activeScreen}`;
  }, [activeScreen]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        
        {/* Top Breadcrumb & Return Action */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <button 
              onClick={() => navigate('/experiments')}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <span>المختبرات العلمية 3D</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-medium">الفيزياء الكمية</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium">تداخل الموجات الكمية وازدواجية المادة</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/experiments')}
            className="border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 text-xs flex items-center gap-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
            <span>العودة لدليل التجارب</span>
          </Button>
        </div>

        {/* Header Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 sm:p-6 mb-6 backdrop-blur-xl shadow-2xl shadow-cyan-950/40 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 px-3 py-0.5 text-xs font-semibold">
                  مختبر ميكانيكا الكم الفائق 2.0
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 px-3 py-0.5 text-xs">
                  معتمد دولياً PhET™ Interactive
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-0.5 text-xs">
                  مبدأ دي برولي: λ = h / p
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                تداخل الموجات الكمية <span className="text-cyan-400">وازدواجية الموجة والجسيم</span>
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
                استكشف أعظم ألغاز ميكانيكا الكم: كيف تسلك الفوتونات، الإلكترونات، النيوترونات، وذرات الهيليوم سلوك الأمواج الكهرومغناطيسية وتتداخل مع ذاتها عند عبور شقي يونغ، وكيف يؤدي رصد مسار الجسيم إلى انهيار فوري لدالة الموجة!
              </p>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-2 flex-wrap lg:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsMuted(!isMuted);
                  playSoundEffect('click');
                }}
                className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
                title={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-cyan-300 text-xs rounded-xl flex items-center gap-1.5"
                title="تصدير بيانات القياسات والزخم إلى ملف CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReloadSimulation}
                className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
                title="إعادة تحميل المحاكي وتصفير التجربة"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>إعادة ضبط</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-200 text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-950/30"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Live CyberLabHUD Telemetry */}
        <div className="mb-6">
          <CyberLabHUD
            title="نظام القياس والمراقبة الكمية اللحظي (Quantum Telemetry HUD)"
            statusBadge="COHERENCE ACTIVE"
            metrics={hudMetrics}
            showWaveform={true}
            waveformColor={selectedParticle.color}
            waveformSpeed={1.2}
          />
        </div>

        {/* Quick Particle Presets Navigation Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {PARTICLE_PRESETS.map((preset) => {
            const isSelected = selectedParticle.id === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedParticle(preset);
                  playSoundEffect('click');
                }}
                className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/50 text-white' 
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl font-bold font-mono text-cyan-300">{preset.symbol}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${preset.badgeColor}`}>
                    {preset.typicalWavelengthNm < 1 ? `${preset.typicalWavelengthNm * 1000} pm` : `${preset.typicalWavelengthNm} nm`}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-white">{preset.nameAr}</h4>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{preset.nameEn}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Main Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(val: any) => {
          setActiveTab(val);
          playSoundEffect('click');
        }} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
            <TabsList className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              <TabsTrigger value="simulation" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">
                <Atom className="w-3.5 h-3.5 ml-1.5" />
                المختبر التفاعلي الكامل
              </TabsTrigger>
              <TabsTrigger value="theory" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 ml-1.5" />
                الأساس النظري والرياضي
              </TabsTrigger>
              <TabsTrigger value="challenges" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">
                <Award className="w-3.5 h-3.5 ml-1.5" />
                مهام التحدي الكمي
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">
                <HelpCircle className="w-3.5 h-3.5 ml-1.5" />
                اختبار الفهم المعملي
              </TabsTrigger>
              <TabsTrigger value="co-pilot" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                المرشد الذكي AI
              </TabsTrigger>
            </TabsList>

            {/* Quick Screen Preset Selector within Simulation Tab */}
            {activeTab === 'simulation' && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                <span className="text-[11px] text-slate-400 px-2 font-medium">الشاشة:</span>
                <button
                  onClick={() => { setActiveScreen('all'); playSoundEffect('click'); }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activeScreen === 'all' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => { setActiveScreen('1'); playSoundEffect('click'); }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activeScreen === '1' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  1. الشامل
                </button>
                <button
                  onClick={() => { setActiveScreen('2'); playSoundEffect('click'); }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activeScreen === '2' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  2. الكثافة العالية
                </button>
                <button
                  onClick={() => { setActiveScreen('3'); playSoundEffect('click'); }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activeScreen === '3' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  3. الجسيمات المفردة
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: INTERACTIVE SIMULATION */}
          <TabsContent value="simulation" className="space-y-6 m-0">
            {/* Simulation Cyber-Frame Container */}
            <div 
              ref={containerRef}
              className={`relative rounded-2xl bg-black border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-950/40 transition-all ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full'
              }`}
            >
              {/* Corner Cyber Brackets */}
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20" />
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-20" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-20" />

              {/* Sub-header inside Frame */}
              <div className="bg-slate-950/90 border-b border-cyan-500/20 px-4 py-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono text-cyan-300 font-semibold">
                    PHET ENGINE // QUANTUM WAVE INTERFERENCE // STATUS: LIVE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    الجسيم المحدد حالياً: <strong className="text-cyan-300">{selectedParticle.nameAr}</strong>
                  </span>
                  <button 
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-cyan-300 text-slate-400 transition-colors"
                    title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Embedded PhET Simulation Iframe */}
              <div className="relative w-full bg-black" style={{ height: isFullscreen ? 'calc(100vh - 40px)' : '680px' }}>
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={iframeSrc}
                  title="Quantum Wave Interference Simulation"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              {/* Bottom Quick Status & Guide Bar */}
              <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    المسافة بين الشقين: <strong className="text-slate-200 font-mono">{slitDistanceUm} µm</strong>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    المسافة إلى الشاشة: <strong className="text-slate-200 font-mono">{screenDistanceM} m</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-cyan-300 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isWhichWayDetectorOn}
                      onChange={(e) => {
                        setIsWhichWayDetectorOn(e.target.checked);
                        playSoundEffect('click');
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="font-medium">محاكاة كاشف المسار (Which-Way Detector)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Guided Lab Scenarios */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                سيناريوهات معملية جاهزة للاستكشاف والتحليل
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 transition-all rounded-xl">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">سيناريو 1</span>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">فوتونات</Badge>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-100">تجربة يونغ الكلاسيكية للضوء</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-slate-300 space-y-2">
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      أطلق حزمة ضوئية متماسكة وراقب تشكل الأهداب المضيئة والمظلمة بفعل فرق المسار بين الموجتين.
                    </p>
                    <div className="bg-slate-950/60 p-2 rounded text-[10px] font-mono text-cyan-300">
                      Δy = (λ · L) / d ≈ {((500e-9 * screenDistanceM) / (slitDistanceUm * 1e-6) * 1e3).toFixed(2)} mm
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 transition-all rounded-xl">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">سيناريو 2</span>
                      <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">إلكترونات</Badge>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-100">تداخل الإلكترونات المفردة</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-slate-300 space-y-2">
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      أطلق إلكتروناً واحداً كل ثانية. لاحظ وصول كل إلكترون كنقطة دقيقة، ومع تراكم مئات النقاط ينبثق نمط التداخل!
                    </p>
                    <div className="bg-slate-950/60 p-2 rounded text-[10px] font-mono text-cyan-300">
                      P(x) = |ψ₁(x) + ψ₂(x)|²
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 transition-all rounded-xl">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">سيناريو 3</span>
                      <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">نيوترونات وهيثليوم</Badge>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-100">أمواج المادة للجسيمات الثقيلة</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-slate-300 space-y-2">
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      بسبب زيادة الكتلة، تصبح أطوال موجات دي برولي في نطاق البيكومتر، وتتقارب الأهداب بشدة مما يتطلب شقوقاً بالغة الضيق.
                    </p>
                    <div className="bg-slate-950/60 p-2 rounded text-[10px] font-mono text-cyan-300">
                      λ_neutron ≈ 0.18 nm (1.8 Å)
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 transition-all rounded-xl">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">سيناريو 4</span>
                      <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-400">كاشف المسار</Badge>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-100">لغز الملاحظة والانهيار الموجي</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-slate-300 space-y-2">
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      شغّل كاشف المسار: بمجرد حصولنا على معلومة "من أي شق مر الجسيم"، تختفي ظاهرة التداخل كلياً فوراً!
                    </p>
                    <div className="bg-slate-950/60 p-2 rounded text-[10px] font-mono text-rose-300">
                      |ψ₁|² + |ψ₂|² (بدون حد التداخل)
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: THEORETICAL FOUNDATION */}
          <TabsContent value="theory" className="space-y-6 m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Equations & Math */}
              <div className="lg:col-span-2 space-y-5">
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-cyan-300 mb-3 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    معادلات ميكانيكا الكم الحاكمة لتجربة التداخل
                  </h3>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-cyan-400">1. علاقة لويس دي برولي للموجات المادية (1924)</span>
                        <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300 font-mono">λ = h / p</Badge>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        تنص الفرضية على أن كل جسيم ذي كتلة <em>m</em> وسرعة <em>v</em> يمتلك خصائص موجية مصاحبة بطول موجي يتناسب عكسياً مع كتلته وزخمه:
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-lg text-center font-mono text-cyan-300 text-sm">
                        λ = \frac&#123;h&#125;&#123;p&#125; = \frac&#123;h&#125;&#123;m \cdot v&#125; = \frac&#123;h&#125;&#123;\sqrt&#123;2mE_k&#125;&#125;
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-purple-400">2. مبدأ التراكب وقاعدة ماكس بورن الاحتمالية</span>
                        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300 font-mono">P(x) = |ψ|²</Badge>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        عند فتح كلا الشقين بدون كاشف، تكون دالة الموجة الكلية تراكباً خطياً لدالتي الشقين (ψ = ψ₁ + ψ₂). كثافة احتمال وصول الجسيم لنقطة x على الشاشة هي:
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-lg text-center font-mono text-purple-300 text-sm">
                        P(x) = |\psi_1(x) + \psi_2(x)|^2 = |\psi_1|^2 + |\psi_2|^2 + 2\,\text&#123;Re&#125;(\psi_1^* \psi_2)
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        الحد الأخير <code className="text-cyan-300">2 Re(ψ₁* ψ₂)</code> هو "حد التداخل الكمي". إذا وضعنا كاشفاً لمعرفة المسار، ينهار هذا الحد ويصبح الاحتمال مجرد جمع كلاسيكي: <code className="text-rose-400">|ψ₁|² + |ψ₂|²</code>!
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-emerald-400">3. تباعد أهداب التداخل على الشاشة الكاشفة</span>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono">Δy = (λ · L) / d</Badge>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        حيث <em>d</em> هي المسافة الفاصلة بين الشقين، و <em>L</em> هي المسافة بين حاجز الشقين وشاشة الاستقبال، و <em>λ</em> هو طول موجة دي برولي.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-amber-400">4. مبدأ عدم اليقين لهايزنبرغ والتكاملية</span>
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300 font-mono">Δx · Δp ≥ ℏ/2</Badge>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        لا يمكن تحديد موضع عبور الجسيم بدقة (Δx &lt; d) دون إحداث اضطراب غير قابل للتنبؤ في زخمه الأفقي (Δp_x)، وهو ما يكفي لتشويه طور الموجة ومسح نمط التداخل بالكامل.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Historical & Educational Insight */}
              <div className="space-y-5">
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    المحطات التاريخية الفاصلة
                  </h3>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="border-r-2 border-cyan-500 pr-3">
                      <span className="text-cyan-400 font-bold block">1801 — توماس يونغ:</span>
                      تجربة الشق المزدوج بالضوء وإثبات الطبيعة الموجية للضوء ضد نظرية نيوتن الجسيمية.
                    </div>
                    <div className="border-r-2 border-purple-500 pr-3">
                      <span className="text-purple-400 font-bold block">1924 — لويس دي برولي:</span>
                      أطروحة الدكتوراه الجريئة: إذا كان للضوء طبيعة جسيمية، فللمادة جسيمات ذات طبيعة موجية! نال عنها نوبل 1929.
                    </div>
                    <div className="border-r-2 border-emerald-500 pr-3">
                      <span className="text-emerald-400 font-bold block">1927 — دافيسون وجيرمر:</span>
                      أول حيود تجريبي للإلكترونات على بلورات النيكل مؤكداً صحة صيغة دي برولي عملياً.
                    </div>
                    <div className="border-r-2 border-amber-500 pr-3">
                      <span className="text-amber-400 font-bold block">1989 — أكيرا تونومورا (هيتاشي):</span>
                      تسجيل التداخل لإلكترون مفرد كل مرة، حيث سُميت هذه التجربة في استطلاع عالمي "أجمل تجربة في تاريخ الفيزياء".
                    </div>
                  </div>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    التطبيقات التكنولوجية المعاصرة
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    <li><strong className="text-cyan-300">المجهر الإلكتروني (TEM/SEM):</strong> دقة تصوير دون نانومترية بفضل صغر λ للإلكترونات.</li>
                    <li><strong className="text-purple-300">مطيافية تشتت النيوترونات:</strong> كشف التركيب المغناطيسي للمواد الفائقة التوصيل.</li>
                    <li><strong className="text-emerald-300">الحواسيب الكمية:</strong> استغلال تراكب الحالات الكمية لتسريع المعالجة الأسية.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: LAB CHALLENGES */}
          <TabsContent value="challenges" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {challenges.map((c, idx) => {
                const isDone = completedChallenges[c.id];
                return (
                  <Card key={c.id} className="bg-slate-900/80 border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                          مهمة #{idx + 1}
                        </Badge>
                        {isDone ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> مكتملة
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                            قيد التنفيذ
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 mb-2">{c.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{c.description}</p>
                      
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-cyan-300/90 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>تلميح معملي:</strong> {c.hint}</span>
                      </div>
                    </div>

                    <Button
                      variant={isDone ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => {
                        setCompletedChallenges(prev => ({ ...prev, [c.id]: !isDone }));
                        if (!isDone) {
                          playSoundEffect('success');
                          confetti({ particleCount: 50, spread: 60 });
                        } else {
                          playSoundEffect('click');
                        }
                      }}
                      className={`mt-4 w-full text-xs rounded-xl ${
                        isDone ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      {isDone ? 'إلغاء التأكيد' : 'تأكيد إنجاز المهمة في المحاكي'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 4: COMPREHENSION QUIZ */}
          <TabsContent value="quiz" className="space-y-6 m-0">
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    اختبار الكفاءة والماجستير الكمي (Quantum Mastery Quiz)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    أجب عن الأسئلة الفيزيائية العميقة للتحقق من استيعابك لقوانين التداخل الكمي وازدواجية المادة.
                  </p>
                </div>

                {quizSubmitted && (
                  <div className="flex items-center gap-3">
                    <Badge className={`px-3 py-1 text-sm font-bold ${quizScore === quizQuestions.length ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                      الدرجة: {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleResetQuiz} className="text-xs border-slate-700">
                      إعادة الاختبار
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx];
                  const isCorrect = selectedOpt === q.correct;

                  return (
                    <div key={qIdx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200">{q.question}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mr-7">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (optIdx === q.correct) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-cyan-950/60 border-cyan-400 text-cyan-200';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                              className={`p-3 text-right text-xs rounded-xl border transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correct && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className={`mr-7 p-3 rounded-lg text-xs leading-relaxed ${isCorrect ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'}`}>
                          <strong className="block mb-1">{isCorrect ? '✓ إجابة ممتازة وصحيحة!' : '✗ إجابة غير دقيقة:'}</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-2 rounded-xl text-xs"
                  >
                    تصحيح الاختبار ورصد النتيجة
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB 5: AI QUANTUM CO-PILOT */}
          <TabsContent value="co-pilot" className="space-y-6 m-0">
            <LiveAILabCoPilot
              simName="تداخل الموجات الكمية وازدواجية الموجة والجسيم"
              subject="physics"
              currentParameters={{
                'الجسيم المحدد': selectedParticle.nameAr,
                'طول موجة دي برولي (λ)': `${quantumTelemetry.lambdaNm} nm`,
                'الزخم الكمي': `${quantumTelemetry.momentumEvC} eV/c`,
                'تباعد أهداب التداخل': `${quantumTelemetry.fringeSpacingMm} mm`,
                'كاشف المسار': isWhichWayDetectorOn ? 'مفعل (انهيار موجي)' : 'معطل (تراكب كمي)',
                'المسافة بين الشقين d': `${slitDistanceUm} µm`,
                'المسافة للشاشة L': `${screenDistanceM} m`
              }}
              liveHint="جرّب سؤال المرشد: لماذا يؤدي مجرد معرفة أي شق عبره الإلكترون إلى اختفاء نمط التداخل بالكامل؟"
              defaultAnalysis="النظام يعمل حالياً في نظام التراكب الكمي الخطي المتماسك لدالتي الشقين. تتصرف الجسيمات المنبعثة كموجات احتمالية ذات أطوال موجية مادية وفق معادلة دي برولي، وتتداخل مع ذاتها عند شاشة الكشف الفوسفورية لتنتج هدباً دورية مضيئة ومظلمة."
            />
          </TabsContent>
        </Tabs>

      </main>

      <Footer />
    </div>
  );
};

export default QuantumWaveInterferenceSimulation;
