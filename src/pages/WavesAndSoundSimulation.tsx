import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Waves, Radio, Settings, Lightbulb, HelpCircle, Eye, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarField from '@/components/StarField';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import AcousticChamber3D from '@/components/acoustics/AcousticChamber3D';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

const acousticChallenges: Challenge[] = [
  {
    id: 'concert_pitch',
    title: 'نغمة الحفلات القياسية A440',
    description: 'اضبط التردد تماماً على 440 Hz (النغمة المرجعية لا = 440 هرتز في علم الصوتيات) واثبت 3 ثوانٍ.',
    targetMetric: 'التردد f',
    targetValue: 440,
    unit: 'Hz',
    holdDuration: 3,
    check: (m) => Math.abs((m.frequency ?? 0) - 440) <= 5,
  },
  {
    id: 'high_speed_doppler',
    title: 'تأثير دوبلر السريع (High-Speed Doppler)',
    description: 'انتقل لنمط دوبلر وارفع سرعة المصدر الصوتي إلى ≥ 60 m/s لمشاهدة انضغاط جبهات الموجات واثبت 3 ثوانٍ.',
    targetMetric: 'سرعة المصدر',
    targetValue: 60,
    unit: 'm/s',
    holdDuration: 3,
    check: (m) => m.simulationType === 'doppler' && (m.dopplerSpeed ?? 0) >= 60,
  },
  {
    id: 'acoustic_interference',
    title: 'تداخل الموجات الصوتية الفراغي',
    description: 'انتقل لنمط التداخل وشاهد تراكب قمم وقيعان الموجات الصوتية الناتجة عن مصدرين متشاكهين لمدة 3 ثوانٍ.',
    targetMetric: 'نمط التداخل',
    targetValue: 1,
    unit: 'حالة',
    holdDuration: 3,
    check: (m) => m.simulationType === 'interference',
  },
];

const WavesAndSoundSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const animationRef = useRef<number>();

  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [simulationType, setSimulationType] = useState<'wave' | 'doppler' | 'interference'>('wave');
  const [dopplerSpeed, setDopplerSpeed] = useState(30);
  const [time, setTime] = useState(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  const speedOfSound = 343;
  const wavelength = speedOfSound / frequency;
  const observedDopplerFreq = Math.round(frequency * (speedOfSound / Math.max(1, speedOfSound - dopplerSpeed)));

  const quizQuestions = [
    {
      question: 'ما هي العلاقة بين التردد والطول الموجي؟',
      options: ['طردية', 'عكسية', 'لا توجد علاقة', 'متساوية'],
      correctIndex: 1,
      explanation: 'العلاقة عكسية: كلما زاد التردد قل الطول الموجي والعكس صحيح (λ = v/f).',
    },
    {
      question: 'ماذا يحدث للتردد المسموع عندما يقترب مصدر الصوت من الراصد؟',
      options: ['يقل', 'يزداد (طبقة أعلى حدة)', 'يبقى ثابتاً', 'يختفي تماماً'],
      correctIndex: 1,
      explanation: 'هذا هو تأثير دوبلر: عند اقتراب المصدر تنضغط جبهات الموجات فيزداد التردد المسموع.',
    },
    {
      question: 'ما نوع التداخل الذي ينتج عنه تضاعف في سعة الموجة وضخامة الصوت؟',
      options: ['هدام', 'بناء', 'محايد', 'عشوائي'],
      correctIndex: 1,
      explanation: 'التداخل البناء يحدث عندما تلتقي قمة مع قمة في نفس الطور، فتتضاعف السعة الصوتية.',
    },
  ];

  const toggleSound = useCallback(() => {
    if (isSoundPlaying) {
      oscillatorRef.current?.stop();
      oscillatorRef.current = null;
      setIsSoundPlaying(false);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.type = waveType;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.08;
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.start();
      oscillatorRef.current = oscillator;
      setIsSoundPlaying(true);
    }
  }, [isSoundPlaying, frequency, waveType]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
      oscillatorRef.current.type = waveType;
    }
  }, [frequency, waveType]);

  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  // 2D Canvas Animation Fallback
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#0a1628');
      bgGradient.addColorStop(1, '#1a2a4a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (simulationType === 'wave') {
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const phase = (x / 100) * (frequency / 100) - time * 3;
          let y = centerY;
          switch (waveType) {
            case 'sine': y = centerY + amplitude * Math.sin(phase); break;
            case 'square': y = centerY + amplitude * Math.sign(Math.sin(phase)); break;
            case 'triangle': y = centerY + amplitude * (2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1); break;
            case 'sawtooth': y = centerY + amplitude * (2 * ((phase / (2 * Math.PI)) % 1) - 1); break;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (simulationType === 'doppler') {
        const sourceX = width / 2 + Math.sin(time) * 200;
        const sourceY = centerY;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(sourceX - 35, sourceY - 20, 70, 40, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚑', sourceX, sourceY + 7);
      } else if (simulationType === 'interference') {
        const source1X = width * 0.35;
        const source2X = width * 0.65;
        const sourceY = centerY;
        const resolution = 4;
        for (let x = 0; x < width; x += resolution) {
          for (let y = 0; y < height; y += resolution) {
            const d1 = Math.sqrt((x - source1X) ** 2 + (y - sourceY) ** 2);
            const d2 = Math.sqrt((x - source2X) ** 2 + (y - sourceY) ** 2);
            const wave1 = Math.sin(d1 / 20 - time * 3);
            const wave2 = Math.sin(d2 / 20 - time * 3);
            const combined = (wave1 + wave2) / 2;
            const intensity = Math.abs(combined);
            const hue = combined > 0 ? 120 : 200;
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${intensity * 0.5})`;
            ctx.fillRect(x, y, resolution, resolution);
          }
        }
      }

      setTime((prev) => prev + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [viewMode, isPlaying, frequency, amplitude, waveType, simulationType, dopplerSpeed, time]);

  const resetSimulation = () => {
    setTime(0);
    setFrequency(440);
    setAmplitude(50);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
      <StarField />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => {
            const isGJU = sessionStorage.getItem('gju_mode') === 'true';
            navigate(isGJU ? '/gju-competition' : '/scientific-simulations');
          }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 ml-2" />
          {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة إلى التجارب'}
        </Button>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
          🔊 مختبر الموجات والصوت ثلاثي الأبعاد (3D Acoustics Lab)
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="text-xs border-slate-700 bg-slate-900/80 text-slate-200"
          >
            {viewMode === '3d' ? <Eye className="w-3.5 h-3.5 ml-1 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 ml-1 text-indigo-400" />}
            {viewMode === '3d' ? '3D Arena' : '2D Canvas'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SimulationCard color="blue" delay={0.1}>
            <div className="bg-slate-950 rounded-xl overflow-hidden relative">
              {viewMode === '3d' ? (
                <div className="h-[460px] relative">
                  <Canvas camera={{ position: [0, 2.5, 7.5], fov: 45 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 15, 10]} intensity={1.2} />
                    <directionalLight position={[-10, 5, -5]} intensity={0.4} color="#38bdf8" />
                    <AcousticChamber3D
                      simulationType={simulationType}
                      frequency={frequency}
                      amplitude={amplitude}
                      waveType={waveType}
                      dopplerSpeed={dopplerSpeed}
                      isPlaying={isPlaying}
                    />
                    <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={15} />
                  </Canvas>

                  {/* CyberLab HUD */}
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <CyberLabHUD
                      metrics={
                        simulationType === 'wave'
                          ? [
                              { label: 'التردد f', value: frequency, unit: 'Hz', color: '#10b981' },
                              { label: 'الطول الموجي λ', value: Number(wavelength.toFixed(3)), unit: 'm', color: '#38bdf8' },
                              { label: 'سرعة الصوت v', value: speedOfSound, unit: 'm/s', color: '#f59e0b' },
                              { label: 'زمن الدورة T', value: Number((1000 / frequency).toFixed(2)), unit: 'ms', color: '#8b5cf6' },
                            ]
                          : simulationType === 'doppler'
                          ? [
                              { label: 'التردد الأصلي', value: frequency, unit: 'Hz', color: '#38bdf8' },
                              { label: 'التردد المرصود', value: observedDopplerFreq, unit: 'Hz', color: '#ef4444' },
                              { label: 'سرعة المصدر', value: dopplerSpeed, unit: 'm/s', color: '#f59e0b' },
                              { label: 'رقم ماخ Mach', value: Number((dopplerSpeed / speedOfSound).toFixed(2)), color: '#ec4899' },
                            ]
                          : [
                              { label: 'التردد f', value: frequency, unit: 'Hz', color: '#10b981' },
                              { label: 'سعة التراكب', value: `${amplitude * 2}%`, color: '#38bdf8' },
                              { label: 'التداخل', value: 'بناء + هدام', color: '#f59e0b' },
                            ]
                      }
                      status={isPlaying ? 'ACTIVE' : 'IDLE'}
                      waveformData={[
                        (frequency / 30) % 35,
                        (amplitude / 3) % 30,
                        simulationType === 'doppler' ? dopplerSpeed % 25 : 20,
                        25,
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <canvas ref={canvasRef} width={800} height={450} className="w-full rounded-lg" />
              )}
            </div>

            <SimulationControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={resetSimulation}
              primaryColor="blue"
            >
              <Button
                onClick={toggleSound}
                className={isSoundPlaying ? 'bg-red-600 hover:bg-red-700 text-xs' : 'bg-green-600 hover:bg-green-700 text-xs'}
              >
                <Volume2 className="w-4 h-4 ml-1.5" />
                {isSoundPlaying ? 'إيقاف النغمة الصوتية' : 'تشغيل المولد الصوتي (Synthesizer)'}
              </Button>
            </SimulationControls>
          </SimulationCard>

          {/* Gamified Challenge Engine */}
          <LabChallengeEngine
            challenges={acousticChallenges}
            currentMetrics={{
              simulationType: simulationType,
              frequency: frequency,
              dopplerSpeed: dopplerSpeed,
              wavelength: wavelength,
            }}
          />

          {/* Theory Section */}
          <SimulationCard title="المعادلات الفيزيائية والنظرية" icon={Lightbulb} color="green" delay={0.2}>
            <InfoSection
              formulas={[
                { name: 'معادلة انتشار الموجة', formula: 'v = f × λ', description: 'سرعة الموجة تساوي التردد مضروباً بالطول الموجي' },
                { name: 'تأثير دوبلر الصوتي', formula: "f' = f × (v ± vo) / (v ∓ vs)", description: 'انزياح التردد الناتج عن حركة المصدر أو الراصد' },
                { name: 'شرط التداخل البناء', formula: 'Δx = n × λ (n = 0,1,2,...)', description: 'تراكب قمة مع قمة بنفس الطور يضاعف الشدة الصوتية' },
                { name: 'شرط التداخل الهدام', formula: 'Δx = (n + 0.5) × λ', description: 'تراكب قمة مع قاع بطور معاكس يُلغي الصوت تماماً' },
              ]}
              facts={[
                'سرعة الصوت في الهواء الجاف عند درجة 20°C تبلغ 343 م/ث',
                'الأذن البشرية السليمة تلتقط ترددات تتراوح بين 20 Hz و 20,000 Hz',
                'الموجات فوق الصوتية (Ultrasound) تُستخدم في التشخيص الطبي وتفتيت الحصى',
              ]}
            />
          </SimulationCard>
        </div>

        {/* Sidebar Controls & AI CoPilot */}
        <div className="space-y-4">
          <SimulationCard title="لوحة التحكم والتوليد" icon={Settings} color="blue" delay={0.15}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">نوع المحاكاة</label>
                <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); labSound.playLaserPulse(400); }}>
                  <TabsList className="grid grid-cols-3 bg-slate-800">
                    <TabsTrigger value="wave" className="text-xs">موجة صوتية</TabsTrigger>
                    <TabsTrigger value="doppler" className="text-xs">تأثير دوبلر</TabsTrigger>
                    <TabsTrigger value="interference" className="text-xs">تداخل صوتي</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {simulationType === 'wave' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">شكل الموجة الصوتية</label>
                    <Tabs value={waveType} onValueChange={(v) => setWaveType(v as any)}>
                      <TabsList className="grid grid-cols-2 bg-slate-800">
                        <TabsTrigger value="sine" className="text-xs">جيبية (Sine)</TabsTrigger>
                        <TabsTrigger value="square" className="text-xs">مربعة (Square)</TabsTrigger>
                      </TabsList>
                      <TabsList className="grid grid-cols-2 bg-slate-800 mt-1">
                        <TabsTrigger value="triangle" className="text-xs">مثلثية (Triangle)</TabsTrigger>
                        <TabsTrigger value="sawtooth" className="text-xs">منشارية (Sawtooth)</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>السعة الصوتية (Amplitude)</span>
                      <span className="font-mono text-cyan-400">{amplitude}%</span>
                    </div>
                    <Slider value={[amplitude]} onValueChange={(v) => setAmplitude(v[0])} min={10} max={100} step={1} />
                  </div>
                </>
              )}

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>التردد الصوتي (Frequency f)</span>
                  <span className="font-mono text-emerald-400">{frequency} Hz</span>
                </div>
                <Slider value={[frequency]} onValueChange={(v) => setFrequency(v[0])} min={100} max={2000} step={10} />
              </div>

              {simulationType === 'doppler' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>سرعة المصدر (Source Velocity vs)</span>
                    <span className="font-mono text-amber-400">{dopplerSpeed} m/s</span>
                  </div>
                  <Slider value={[dopplerSpeed]} onValueChange={(v) => setDopplerSpeed(v[0])} min={5} max={100} step={1} />
                </div>
              )}
            </div>
          </SimulationCard>

          {/* AI Lab CoPilot */}
          <LiveAILabCoPilot
            experimentName="الموجات والصوتيات"
            currentMetrics={{
              simulationType: simulationType,
              frequency: frequency,
              wavelength: Number(wavelength.toFixed(3)),
              waveType: waveType,
              dopplerSpeed: simulationType === 'doppler' ? dopplerSpeed : undefined,
              observedDopplerFreq: simulationType === 'doppler' ? observedDopplerFreq : undefined,
            }}
            hint={
              simulationType === 'wave'
                ? `الطول الموجي λ = ${wavelength.toFixed(2)} متر. عند زيادة التردد تقترب جزيئات الهواء المضغوطة من بعضها.`
                : simulationType === 'doppler'
                ? `الراصد في اتجاه حركة المصدر يستقبل تردداً مرتفعاً (${observedDopplerFreq} Hz)، بينما الراصد الخلفي يستقبل تردداً منخفضاً.`
                : 'تراكب موجتين صوتيتين من مصدرين متجاورين يُحدث مناطق هدوء تام (عقد تداخل هدام) ومناطق مضاعفة الصوت (بطون تداخل بناء).'
            }
          />

          <SimulationCard title="اختبر معلوماتك" icon={HelpCircle} color="yellow" delay={0.25}>
            <QuizSection questions={quizQuestions} />
          </SimulationCard>
        </div>
      </div>
    </div>
  );
};

export default WavesAndSoundSimulation;
