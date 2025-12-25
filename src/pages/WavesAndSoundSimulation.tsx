import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Waves, Radio, Settings, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarField from '@/components/StarField';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const WavesAndSoundSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [simulationType, setSimulationType] = useState<'wave' | 'doppler' | 'interference'>('wave');
  const [dopplerSpeed, setDopplerSpeed] = useState(30);
  const [time, setTime] = useState(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  const speedOfSound = 343;
  const wavelength = speedOfSound / frequency;

  const quizQuestions = [
    {
      question: 'ما هي العلاقة بين التردد والطول الموجي؟',
      options: ['طردية', 'عكسية', 'لا توجد علاقة', 'متساوية'],
      correctIndex: 1,
      explanation: 'العلاقة عكسية: كلما زاد التردد قل الطول الموجي والعكس صحيح (λ = v/f)'
    },
    {
      question: 'ماذا يحدث للتردد المسموع عندما يقترب مصدر الصوت؟',
      options: ['يقل', 'يزداد', 'يبقى ثابتاً', 'يختفي'],
      correctIndex: 1,
      explanation: 'هذا هو تأثير دوبلر: عند اقتراب المصدر تنضغط الموجات فيزداد التردد المسموع'
    },
    {
      question: 'ما نوع التداخل الذي ينتج عنه زيادة في السعة؟',
      options: ['هدام', 'بناء', 'محايد', 'عشوائي'],
      correctIndex: 1,
      explanation: 'التداخل البناء يحدث عندما تتوافق القمم مع القمم فتزداد السعة'
    }
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
      gainNode.gain.value = 0.1;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Enhanced background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#0a1628');
      bgGradient.addColorStop(1, '#1a2a4a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Enhanced grid
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
        // Enhanced wave with glow effect
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

        // Enhanced particles with trails
        for (let x = 50; x < width; x += 80) {
          const phase = (x / 100) * (frequency / 100) - time * 3;
          let y = centerY;
          switch (waveType) {
            case 'sine': y = centerY + amplitude * Math.sin(phase); break;
            case 'square': y = centerY + amplitude * Math.sign(Math.sin(phase)); break;
            case 'triangle': y = centerY + amplitude * (2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1); break;
            case 'sawtooth': y = centerY + amplitude * (2 * ((phase / (2 * Math.PI)) % 1) - 1); break;
          }

          // Particle glow
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
          particleGradient.addColorStop(0, '#fbbf24');
          particleGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.fillStyle = particleGradient;
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Wave info display
        const waveNames: Record<string, string> = {
          sine: 'الموجة الجيبية',
          square: 'الموجة المربعة',
          triangle: 'الموجة المثلثية',
          sawtooth: 'الموجة المنشارية'
        };

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(waveNames[waveType], width / 2, 35);

        // Wavelength indicator with enhanced styling
        const waveWidth = 100 / (frequency / 440);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(100, centerY - amplitude - 25);
        ctx.lineTo(100, centerY + amplitude + 25);
        ctx.moveTo(100 + waveWidth, centerY - amplitude - 25);
        ctx.lineTo(100 + waveWidth, centerY + amplitude + 25);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(100, centerY - amplitude - 15);
        ctx.lineTo(100 + waveWidth, centerY - amplitude - 15);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('λ', 100 + waveWidth / 2, centerY - amplitude - 30);

      } else if (simulationType === 'doppler') {
        const sourceX = width / 2 + Math.sin(time) * 200;
        const sourceY = centerY;

        // Enhanced ambulance
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(sourceX - 45, sourceY - 25, 90, 50, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚑', sourceX, sourceY + 8);

        // Enhanced sound waves
        const velocity = Math.cos(time) * dopplerSpeed;
        for (let i = 1; i <= 10; i++) {
          const baseRadius = i * 35 + (time * 50) % 35;
          const frontRadius = baseRadius - velocity * i * 0.5;
          const backRadius = baseRadius + velocity * i * 0.5;
          const opacity = Math.max(0, 1 - i / 10);

          ctx.strokeStyle = `rgba(239, 68, 68, ${opacity * 0.6})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(sourceX + velocity * 3, sourceY, Math.max(10, frontRadius), -Math.PI / 2, Math.PI / 2);
          ctx.stroke();

          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.6})`;
          ctx.beginPath();
          ctx.arc(sourceX - velocity * 3, sourceY, Math.max(10, backRadius), Math.PI / 2, -Math.PI / 2);
          ctx.stroke();
        }

        // Observer with glow
        const observerGradient = ctx.createRadialGradient(100, centerY, 0, 100, centerY, 30);
        observerGradient.addColorStop(0, '#22c55e');
        observerGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = observerGradient;
        ctx.beginPath();
        ctx.arc(100, centerY, 30, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(100, centerY, 20, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', 100, centerY + 8);

        // Enhanced info display
        const observerFreq = frequency * (speedOfSound / (speedOfSound - velocity));
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(width / 2 - 150, height - 80, 300, 60);
        
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('تأثير دوبلر', width / 2, 35);
        ctx.font = '16px Arial';
        ctx.fillText(`التردد الأصلي: ${frequency} Hz`, width / 2, height - 55);
        ctx.fillStyle = velocity > 0 ? '#ef4444' : '#3b82f6';
        ctx.fillText(`التردد المُلاحظ: ${observerFreq.toFixed(0)} Hz`, width / 2, height - 30);

      } else if (simulationType === 'interference') {
        const source1X = width / 3;
        const source2X = (2 * width) / 3;
        const sourceY = height / 2;

        // Enhanced sources with glow
        const source1Gradient = ctx.createRadialGradient(source1X, sourceY, 0, source1X, sourceY, 25);
        source1Gradient.addColorStop(0, '#ef4444');
        source1Gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = source1Gradient;
        ctx.beginPath();
        ctx.arc(source1X, sourceY, 25, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(source1X, sourceY, 12, 0, 2 * Math.PI);
        ctx.fill();

        const source2Gradient = ctx.createRadialGradient(source2X, sourceY, 0, source2X, sourceY, 25);
        source2Gradient.addColorStop(0, '#3b82f6');
        source2Gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = source2Gradient;
        ctx.beginPath();
        ctx.arc(source2X, sourceY, 25, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(source2X, sourceY, 12, 0, 2 * Math.PI);
        ctx.fill();

        // Enhanced interference pattern
        const resolution = 3;
        for (let x = 0; x < width; x += resolution) {
          for (let y = 0; y < height; y += resolution) {
            const d1 = Math.sqrt((x - source1X) ** 2 + (y - sourceY) ** 2);
            const d2 = Math.sqrt((x - source2X) ** 2 + (y - sourceY) ** 2);
            const wave1 = Math.sin(d1 / 20 - time * 3);
            const wave2 = Math.sin(d2 / 20 - time * 3);
            const combined = (wave1 + wave2) / 2;
            const intensity = Math.abs(combined);
            const hue = combined > 0 ? 120 : 0;
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${intensity * 0.6})`;
            ctx.fillRect(x, y, resolution, resolution);
          }
        }

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('تداخل الموجات', width / 2, 35);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, height - 40, width, 40);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#22c55e';
        ctx.fillText('🟢 تداخل بنّاء (تعزيز)', 150, height - 15);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('🔴 تداخل هدّام (إلغاء)', width - 150, height - 15);
      }

      setTime(prev => prev + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, frequency, amplitude, waveType, simulationType, dopplerSpeed, time]);

  const resetSimulation = () => {
    setTime(0);
    setFrequency(440);
    setAmplitude(50);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      <StarField />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Button variant="ghost" onClick={() => navigate('/scientific-simulations')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          العودة
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          🔊 مختبر الموجات والصوت
        </h1>
        <div className="w-24" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SimulationCard color="blue" delay={0.1}>
            <canvas ref={canvasRef} width={800} height={450} className="w-full rounded-lg" />
            <SimulationControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={resetSimulation}
              primaryColor="blue"
            >
              <Button
                onClick={toggleSound}
                className={isSoundPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                <Volume2 className="w-5 h-5 mr-2" />
                {isSoundPlaying ? 'إيقاف' : 'تشغيل'} الصوت
              </Button>
            </SimulationControls>
          </SimulationCard>

          <SimulationCard title="المعادلات الفيزيائية" icon={Lightbulb} color="green" delay={0.2}>
            <InfoSection
              formulas={[
                { name: 'معادلة الموجة', formula: 'v = f × λ' },
                { name: 'تأثير دوبلر', formula: "f' = f × (v ± vo) / (v ∓ vs)" },
                { name: 'شرط التداخل البناء', formula: 'Δx = n × λ' },
                { name: 'شرط التداخل الهدام', formula: 'Δx = (n + 0.5) × λ' }
              ]}
              facts={[
                'سرعة الصوت في الهواء عند 20°C هي 343 م/ث',
                'الأذن البشرية تسمع ترددات من 20 Hz إلى 20,000 Hz',
                'الموجات فوق الصوتية تُستخدم في التصوير الطبي'
              ]}
            />
          </SimulationCard>
        </div>

        <div className="space-y-4">
          <SimulationCard title="لوحة التحكم" icon={Settings} color="blue" delay={0.15}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
                <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                  <TabsList className="grid grid-cols-3 bg-slate-700">
                    <TabsTrigger value="wave" className="text-xs">موجة</TabsTrigger>
                    <TabsTrigger value="doppler" className="text-xs">دوبلر</TabsTrigger>
                    <TabsTrigger value="interference" className="text-xs">تداخل</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {simulationType === 'wave' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">شكل الموجة</label>
                    <Tabs value={waveType} onValueChange={(v) => setWaveType(v as any)}>
                      <TabsList className="grid grid-cols-2 bg-slate-700">
                        <TabsTrigger value="sine" className="text-xs">جيبية</TabsTrigger>
                        <TabsTrigger value="square" className="text-xs">مربعة</TabsTrigger>
                      </TabsList>
                      <TabsList className="grid grid-cols-2 bg-slate-700 mt-1">
                        <TabsTrigger value="triangle" className="text-xs">مثلثية</TabsTrigger>
                        <TabsTrigger value="sawtooth" className="text-xs">منشارية</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">السعة: {amplitude} px</label>
                    <Slider value={[amplitude]} onValueChange={(v) => setAmplitude(v[0])} min={10} max={100} step={1} />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-2">التردد: {frequency} Hz</label>
                <Slider value={[frequency]} onValueChange={(v) => setFrequency(v[0])} min={100} max={2000} step={10} />
              </div>

              {simulationType === 'doppler' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">سرعة المصدر: {dopplerSpeed} m/s</label>
                  <Slider value={[dopplerSpeed]} onValueChange={(v) => setDopplerSpeed(v[0])} min={5} max={100} step={1} />
                </div>
              )}
            </div>
          </SimulationCard>

          <SimulationCard title="القياسات" icon={Waves} color="green" delay={0.2}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-400">التردد:</span>
                <span className="text-green-300 font-bold">{frequency} Hz</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-400">الطول الموجي:</span>
                <span className="text-blue-300 font-bold">{wavelength.toFixed(3)} m</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-400">سرعة الصوت:</span>
                <span className="text-purple-300 font-bold">{speedOfSound} m/s</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-400">الدورة:</span>
                <span className="text-yellow-300 font-bold">{(1000 / frequency).toFixed(2)} ms</span>
              </div>
            </div>
          </SimulationCard>

          <SimulationCard title="اختبر معلوماتك" icon={HelpCircle} color="yellow" delay={0.25}>
            <QuizSection questions={quizQuestions} />
          </SimulationCard>
        </div>
      </div>
    </div>
  );
};

export default WavesAndSoundSimulation;
