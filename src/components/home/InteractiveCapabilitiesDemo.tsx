import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Atom, 
  Zap, 
  Sliders, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  Award,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const InteractiveCapabilitiesDemo: React.FC = () => {
  const navigate = useNavigate();

  // Wave Simulator State
  const [frequency, setFrequency] = useState<number>(3.5); // PHz (10^15 Hz)
  const [amplitude, setAmplitude] = useState<number>(45); // px
  const [damping, setDamping] = useState<number>(0.02);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Question Generator State
  const [bloomLevel, setBloomLevel] = useState<'remember' | 'apply' | 'analyze' | 'create'>('apply');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physical calculations
  const SPEED_OF_LIGHT = 3.0e8; // m/s
  const PLANCK_CONSTANT_EV = 4.135667e-15; // eV·s
  const freqHz = frequency * 1.0e15; // Hz
  const wavelengthNm = Math.round((SPEED_OF_LIGHT / freqHz) * 1.0e9);
  const photonEnergyEv = (PLANCK_CONSTANT_EV * freqHz).toFixed(2);

  let spectralType = 'ضوء مرئي (Visible Light)';
  if (wavelengthNm < 380 && wavelengthNm >= 10) {
    spectralType = 'أشعة فوق بنفسجية (Ultraviolet - UV)';
  } else if (wavelengthNm < 10) {
    spectralType = 'أشعة سينية (X-Ray)';
  } else if (wavelengthNm > 750) {
    spectralType = 'أشعة تحت حمراء (Infrared)';
  }

  // Wave Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const midY = canvas.height / 2;

      // Coordinate Grid Lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      
      // Horizontal center axis
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(canvas.width, midY);
      ctx.stroke();

      // Vertical grid
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Sinusoidal Electromagnetic Wave
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;

      for (let x = 0; x < canvas.width; x++) {
        const decay = Math.exp(-damping * (x / 50));
        const k = (2 * Math.PI) / (Math.max(30, 200 - frequency * 15));
        const y = midY - amplitude * decay * Math.sin(k * x - time);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw Photons / Energy Nodes
      for (let x = 30; x < canvas.width; x += 90) {
        const decay = Math.exp(-damping * (x / 50));
        const k = (2 * Math.PI) / (Math.max(30, 200 - frequency * 15));
        const y = midY - amplitude * decay * Math.sin(k * x - time);

        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!isPaused) {
        time += frequency * 0.03;
      }

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [frequency, amplitude, damping, isPaused]);

  const bloomQuestions = {
    remember: {
      levelName: 'المستوى 1: التذكر والاسترجاع (Remembering)',
      question: 'عرّف ظاهرة التأثير الكهروضوئي (Photoelectric Effect) واذكر المعادلة الأساسية لطاقة حركة الإلكترونات المتحررة.',
      answerSnippet: 'انبعاث إلكترونات من سطح فلز عند سقوط إشعاع بتردد يساوي أو يتجاوز تردد العتبة: KE_max = h·f - Φ'
    },
    apply: {
      levelName: 'المستوى 2: التطبيق الحسابي (Applying)',
      question: `احسب الطاقة الحركية العظمى للإلكترونات المتحررة إذا سقط ضوء طاقة فوتونه ${photonEnergyEv} eV على فلز اقتران شغله Φ = 2.30 eV.`,
      answerSnippet: `KE_max = ${photonEnergyEv} - 2.30 = ${(Math.max(0, parseFloat(photonEnergyEv) - 2.30)).toFixed(2)} eV`
    },
    analyze: {
      levelName: 'المستوى 3: التحليل والاستنتاج (Analyzing)',
      question: 'لماذا لا تؤدي زيادة شدة الضوء الساقط بتردد أقل من تردد العتبة إلى انبعاث أي إلكترونات مهما طال زمن التعريض؟',
      answerSnippet: 'لأن انتقال الطاقة يتم بكمات محددة (فوتون-إلكترون واحد لواحد)، والشدة تزيد عدد الفوتونات وليس طاقة الفوتون الفردي.'
    },
    create: {
      levelName: 'المستوى 4: التقويم والابتكار (Creating & Evaluating)',
      question: 'صمم خلية كهروضوئية ذكية لحساب شدة الأشعة فوق البنفسجية في المدن الذكية واقترح آلية لمعايرة التيار الناتج رقمياً.',
      answerSnippet: 'دمج مهبط مغلف بالسيزيوم مع مضخم تيار عملياتي (Op-Amp) وتحويل الإشارة التناظرية ADC لقراءات ميكرو-أمبير فورية.'
    }
  };

  const currentBloom = bloomQuestions[bloomLevel];

  return (
    <section 
      id="demos-section"
      className="py-20 sm:py-28 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>المختبرات والتجارب الحية التفاعلية</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          جرب قدرات المحاكاة مباشرة على الصفحة
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
          يمكنك اختبار محرك الفيزياء وحسابات الطاقة وتوليد التقييمات الذكية فوراً دون مغادرة هذه الصفحة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Live Wave Physics Simulator */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                محاكي انتشار الموجات الكهرومغناطيسية وحساب طاقة الفوتون
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-700">
              PHYSICS ENGINE
            </Badge>
          </div>

          {/* Live Wave Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={540}
              height={220}
              className="w-full max-w-[540px] h-auto"
            />
            {/* Spectral Readout Badge */}
            <div className="absolute top-3 end-3 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
              النطاق: <span className="text-blue-600 dark:text-blue-400 font-bold">{spectralType}</span>
            </div>
          </div>

          {/* Telemetry Output Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">التردد (f)</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">{frequency.toFixed(1)} PHz</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الطول الموجي (λ)</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">{wavelengthNm} nm</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">طاقة الفوتون (E)</span>
              <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">{photonEnergyEv} eV</span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">التردد الموجي Frequency</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{frequency} × 10¹⁵ Hz</span>
              </div>
              <Slider
                value={[frequency]}
                min={1.0}
                max={9.0}
                step={0.1}
                onValueChange={(vals) => setFrequency(vals[0])}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">السعة الموجية Amplitude</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{amplitude} px</span>
              </div>
              <Slider
                value={[amplitude]}
                min={15}
                max={65}
                step={1}
                onValueChange={(vals) => setAmplitude(vals[0])}
              />
            </div>
          </div>

          {/* Direct CTA */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              محاكاة فيزيائية مبنية على قوانين ماكسويل وبلانك
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/electromagnetic-waves')}
              className="text-xs font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            >
              <span>مختبر الكهرومغناطيسية الكامل</span>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            </Button>
          </div>
        </div>

        {/* Right Side: Bloom Taxonomy Assessment Generator Preview */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-5 text-right">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                توليد التقييمات وفق تصنيف بلوم (Bloom's Taxonomy)
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-700">
              AI ASSESSMENT
            </Badge>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            يولّد محرك الذكاء الاصطناعي أسئلة امتحانية متدرجة الصعوبة تدعم المعلمين والطلبة في قياس الاستيعاب الحقيقي للمفاهيم:
          </p>

          {/* Bloom Level Tabs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setBloomLevel('remember')}
              className={`p-2.5 rounded-xl font-bold transition-all text-center border ${
                bloomLevel === 'remember'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              1. التذكر والاسترجاع
            </button>
            <button
              onClick={() => setBloomLevel('apply')}
              className={`p-2.5 rounded-xl font-bold transition-all text-center border ${
                bloomLevel === 'apply'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              2. التطبيق والحل
            </button>
            <button
              onClick={() => setBloomLevel('analyze')}
              className={`p-2.5 rounded-xl font-bold transition-all text-center border ${
                bloomLevel === 'analyze'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              3. التحليل والاستنتاج
            </button>
            <button
              onClick={() => setBloomLevel('create')}
              className={`p-2.5 rounded-xl font-bold transition-all text-center border ${
                bloomLevel === 'create'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              4. الابتكار والتقويم
            </button>
          </div>

          {/* Generated Question Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
              {currentBloom.levelName}
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentBloom.question}
            </p>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">نموذج الإجابة النموذجية:</span>
              <span className="text-emerald-700 dark:text-emerald-400">{currentBloom.answerSnippet}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/exam-generator')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-sm"
          >
            <span>دخول استوديو توليد الامتحانات الورقية والإلكترونية المتكامل</span>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          </Button>
        </div>

      </div>
    </section>
  );
};

export default InteractiveCapabilitiesDemo;
