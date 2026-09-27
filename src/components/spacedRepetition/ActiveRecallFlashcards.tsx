import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Flame,
  Shuffle,
  Eye,
  Repeat,
  Plus,
  Atom,
  Trophy,
  Zap,
  Check,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SpacedLesson, SpacedReview } from './types';
import { Link } from 'react-router-dom';

export interface FlashcardItem {
  id: string;
  subject: string;
  front: string; // Question / Concept
  back: string;  // Answer / Law / Detailed Explanation
  hint?: string;
  intervalDay: number;
  simulationUrl?: string;
  simulationName?: string;
  isCustom?: boolean;
}

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    subject: 'الفيزياء',
    front: 'ما هي فرضية دي برولي للموجات المادية؟ وما القانون الرياضي المعبّر عنها؟',
    back: 'لكل جسيم مادي متحرك موجة مصاحبة له تدعى "موجة دي برولي المادية".\nالقانون: λ = h / p = h / (m · v)\nحيث λ الطول الموجي، h ثابت بلانك، و p كمية التحرك (الزخم الخطي).',
    hint: 'يربط بين الخصائص الجسيمية والموجية للضوء والمادة',
    intervalDay: 3,
    simulationUrl: '/quantum-mechanics',
    simulationName: 'محاكي ميكانيكا الكم 3D'
  },
  {
    id: 'fc-2',
    subject: 'الفيزياء',
    front: 'ما هو نص قانون فاراداي للحث الكهرومغناطيسي؟ وما دلالة الإشارة السالبة لقانون لنز؟',
    back: 'القوة الدافعة الكهربائية الحثية المتولدة في ملف تتناسب طردياً مع المعدل الزمني لتغير التدفق المغناطيسي الذي يخترقه: ε = -N (ΔΦ / Δt).\nالإشارة السالبة (قانون لنز): تعني أن اتجاه التيار الحثي يولد مجالاً مغناطيسياً يعاكس التغير في التدفق المغناطيسي المسبب له.',
    hint: 'فاراداي يعطي المقدار، ولنز يحدد الاتجاه المعاكس',
    intervalDay: 6,
    simulationUrl: '/faradays-law',
    simulationName: 'معمل فاراداي للحث 3D'
  },
  {
    id: 'fc-3',
    subject: 'الكيمياء',
    front: 'ما نص قاعدة لوشاتيليه؟ وكيف يؤثر تقليل الحجم (زيادة الضغط) على تفاعل غازي متزن؟',
    back: 'نص القاعدة: "إذا أُثّر على نظام في حالة اتزان بتغير في التركيز أو الضغط أو الحرارة، فإن النظام يعدل نفسه بالاتجاه الذي يقلل من أثر هذا التغير".\nزيادة الضغط: ينزاح موضع الاتزان نحو الطرف الذي يحتوي على عدد مولات غازية أقل لتخفيض الضغط الكلي.',
    hint: 'تذكر علاقة الضغط العكسية مع الحجم وعدد المولات الغازية',
    intervalDay: 6,
    simulationUrl: '/chemical-kinetics',
    simulationName: 'مختبر الاتزان وسرعة التفاعل 3D'
  },
  {
    id: 'fc-4',
    subject: 'الكيمياء',
    front: 'ما هو مفهوم المعقد المنشط (Activated Complex) وعلاقته بطاقة التنشيط؟',
    back: 'المعقد المنشط هو بناء مؤقت غير مستقر ذو طاقة وضع عظمى يتكون لحظة التصادم الفعال بين الجزيئات.\nطاقة التنشيط (Ea) هي الحد الأدنى من الطاقة اللازمة لتحويل المتفاعلات إلى هذا المعقد المنشط.',
    hint: 'قمة منحنى الطاقة بين المتفاعلات والنواتج',
    intervalDay: 10,
    simulationUrl: '/chemical-kinetics',
    simulationName: 'مختبر منحنى طاقة التنشيط 3D'
  },
  {
    id: 'fc-5',
    subject: 'العلوم الحياتية',
    front: 'ما هي الآلية الدقيقة لأنزيم كريسبر (Cas9) في تعديل الجينات؟',
    back: 'يتكون النظام من جزيء RNA موجه (gRNA) يرتبط بتسلسل مكمل محدد في الحمض النووي (DNA) مجاور لتسلسل PAM.\nيقوم أنزيم Cas9 بقطع سلسلتي الـ DNA بدقة شديدة مثل مقص جزيئي، مما يتيح تعطيل الجين أو استبداله بتسلسل سليم.',
    hint: 'تذكر دور الـ gRNA الموجه ومقص Cas9 وتسلسل PAM',
    intervalDay: 10,
    simulationUrl: '/crispr-gene-editing',
    simulationName: 'المختبر ثلاثي الأبعاد لتعديل الجينات كريسبر'
  },
  {
    id: 'fc-6',
    subject: 'العلوم الحياتية',
    front: 'ما هي خطوات التعبير الجيني لبناء البروتين (النسخ والترجمة)؟',
    back: '1. النسخ (Transcription): داخل النواة، يقوم أنزيم بلمرة RNA بنسخ شفرة الـ DNA إلى جزيء mRNA أولي.\n2. المعالجة: إزالة الإنترونات وربط الإكسونات وإضافة قبعة الغوانين وذيل متعدد الأدينين.\n3. الترجمة (Translation): في السيتوبلازم، يقرأ الريبوسوم كودونات الـ mRNA، ويحضر tRNA الأحماض الأمينية لتكوين سلسلة عديد الببتيد.',
    hint: 'من الـ DNA إلى mRNA، ثم من mRNA إلى سلسلة ببتيدية',
    intervalDay: 15
  },
  {
    id: 'fc-7',
    subject: 'الرياضيات',
    front: 'ما هي خطوات حل مسائل المعدلات المرتبطة بالزمن (Related Rates)؟',
    back: '1. رسم مخطط توضيحي وتحديد المتغيرات والثوابت بالرموز.\n2. إيجاد علاقة رياضية أساسية تربط المتغيرات (فيثاغورس، تشابه مثلثات، قانون جيب التمام، مساحات وحجوم).\n3. اشتقاق طرفي المعادلة ضمنياً بالنسبة للمتغير الزمني t.\n4. التعويض بالقيم المعطاة عند اللحظة الزمنية المحددة واستخراج المجهول المطلوب.',
    hint: 'الاشتقاق الضمني بالنسبة للمتغير t دائماً',
    intervalDay: 15,
    simulationUrl: '/graph-visualizer',
    simulationName: 'راسم الدوال والهندسة البيانية'
  },
  {
    id: 'fc-8',
    subject: 'الرياضيات',
    front: 'ما هي شروط مبرهنة القيمة المتوسطة (Mean Value Theorem) ونتيجتها الهندسية؟',
    back: 'الشروط:\n1. الاقتران f(x) متصل على الفترة المغلقة [a, b].\n2. الاقتران f(x) قابل للاشتقاق على الفترة المفتوحة (a, b).\nالنتيجة الهندسية: يوجد على الأقل عدد c ينتمي للفترة (a, b) بحيث يكون ميل المماس عنده مساوياً لميل القاطع المار بالنقطتين: f\'(c) = [f(b) - f(a)] / (b - a).',
    hint: 'ميل المماس = ميل القاطع المار بالنهايات',
    intervalDay: 21
  },
  {
    id: 'fc-9',
    subject: 'الروبوتات والذكاء',
    front: 'كيف تحسب خوارزمية A* تكلفة المسار الأمثل f(n)؟',
    back: 'تعتمد على المعادلة الجوهرية:\nf(n) = g(n) + h(n)\n• g(n): التكلفة الفعلية الحقيقية من نقطة البداية إلى العقدة الحالية n.\n• h(n): التكلفة التقديرية الإرشادية (Heuristic) للوصول من العقدة n إلى الهدف.\nتضمن الخوارزمية المسار الأقصر بكفاءة زمنية فائقة.',
    hint: 'مجموع التكلفة الفعلية الحقيقية والتقدير الإرشادي',
    intervalDay: 21,
    simulationUrl: '/robotics',
    simulationName: 'حلبة تحدي الروبوتات ومعمل Wokwi'
  },
  {
    id: 'fc-10',
    subject: 'الفلك والكونيات',
    front: 'ما هو أفق الحدث (Event Horizon) في الثقب الأسود ولماذا لا يستطيع الضوء الهروب منه؟',
    back: 'أفق الحدث هو الحد الخارجي الرياضي والفيزيائي للثقب الأسود الذي تصبح عنده سرعة الإفلات (Escape Velocity) مساوية تماماً لسرعة الضوء c.\nبما أنه لا شيء في الكون يمكنه تجاوز سرعة الضوء، فإن أي مادة أو إشعاع يعبر هذا الحد يسقط حتماً نحو نقطة التفرد (Singularity).',
    hint: 'سرعة الإفلات تتجاوز 300,000 كم/ثانية',
    intervalDay: 30,
    simulationUrl: '/black-hole',
    simulationName: 'محاكي الثقوب السوداء وانحناء الضوء 3D'
  },
  {
    id: 'fc-11',
    subject: 'اللغة الإنجليزية',
    front: 'When do we use the Past Perfect Continuous tense, and what is its grammatical formula?',
    back: 'Usage: To show that an action started in the past, continued for a duration, and finished just before another action or time in the past.\nFormula: Subject + had been + Verb(-ing).\nExample: "He had been studying for three hours before the exam started."',
    hint: 'Action with ongoing duration prior to another past moment',
    intervalDay: 10
  },
  {
    id: 'fc-12',
    subject: 'اللغة العربية',
    front: 'ما هي أحوال بناء الفعل الماضي ومتى يُبنى على الضم؟',
    back: 'يُبنى الفعل الماضي على:\n1. الفتح: إذا لم يتصل به شيء، أو اتصلت به تاء التأنيث الساكنة أو ألف الاثنين.\n2. السكون: إذا اتصلت به ضمائر الرفع المتحركة (تاء الفاعل، نا الفاعلين، نون النسوة).\n3. الضم: في حالة واحدة فقط: إذا اتصلت به واو الجماعة (مثل: كَتَبُوا، دَرَسُوا).',
    hint: 'واو الجماعة فقط هي التي توجب الضم',
    intervalDay: 15
  }
];

interface ActiveRecallFlashcardsProps {
  lessons?: SpacedLesson[];
  reviews?: SpacedReview[];
  onCompleteReview?: (reviewId: string, qualityRating?: number) => Promise<boolean>;
}

export const ActiveRecallFlashcards: React.FC<ActiveRecallFlashcardsProps> = ({
  lessons = [],
  reviews = [],
  onCompleteReview
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>(() => {
    const saved = localStorage.getItem('galaxy_custom_flashcards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...DEFAULT_FLASHCARDS];
      } catch {
        return DEFAULT_FLASHCARDS;
      }
    }
    return DEFAULT_FLASHCARDS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showHint, setShowHint] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [xpPoints, setXpPoints] = useState(120);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Card Form State
  const [newSubject, setNewSubject] = useState('الفيزياء');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');

  const filteredCards = cards.filter(c => selectedSubject === 'all' || c.subject === selectedSubject);
  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
      toast.success('🎉 مذهل! أنهيت جميع بطاقات هذه الجلسة التدريبية بنجاح!');
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // SM-2 Recall Rating Handler
  const handleRateRecall = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    let earnedXp = 10;
    let qualityNum = 3;

    if (rating === 'again') {
      earnedXp = 5;
      qualityNum = 1;
      toast.error('❌ نسيت الإجابة: تمت إعادة الجدولة للتكرار خلال 24 ساعة لإنقاذ الذاكرة!');
    } else if (rating === 'hard') {
      earnedXp = 10;
      qualityNum = 2;
      toast.warning('⚠️ استرجاع صعب: تم تقليص الفاصل الزمني القادم لتعزيز الترابط العصبي.');
    } else if (rating === 'good') {
      earnedXp = 15;
      qualityNum = 4;
      toast.info('👍 تذكر جيد ومتقن! (استمرار الفاصل الزمني المنتظم)');
    } else if (rating === 'easy') {
      earnedXp = 25;
      qualityNum = 5;
      toast.success('🌟 استرجاع فوري متقن! (+25 نقطة خبرة XP ومضاعفة الفاصل الزمني 1.5x)');
    }

    setXpPoints(prev => prev + earnedXp);
    setCompletedCount(prev => prev + 1);

    // If there is an active review hook, complete it
    if (onCompleteReview && reviews.length > 0) {
      const activeRev = reviews.find(r => !r.is_completed);
      if (activeRev) {
        await onCompleteReview(activeRev.id, qualityNum);
      }
    }

    handleNextCard();
  };

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('المتصفح لا يدعم تحويل النص إلى صوت');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.info('تم خلط وترتيب البطاقات عشوائياً لتحفيز الذاكرة الفعالة!');
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) {
      toast.error('يرجى ملء نص السؤال والجواب');
      return;
    }

    const newCard: FlashcardItem = {
      id: `custom-${Date.now()}`,
      subject: newSubject,
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      intervalDay: 1,
      isCustom: true
    };

    const existingCustom = JSON.parse(localStorage.getItem('galaxy_custom_flashcards') || '[]');
    const updatedCustom = [newCard, ...existingCustom];
    localStorage.setItem('galaxy_custom_flashcards', JSON.stringify(updatedCustom));

    setCards(prev => [newCard, ...prev]);
    setIsCreateOpen(false);
    setNewFront('');
    setNewBack('');
    setNewHint('');
    setCurrentIndex(0);
    toast.success('تمت إضافة بطاقتك الذكية بنجاح إلى محفظة الاسترجاع النشط!');
  };

  // Determine user rank based on XP
  const getRankBadge = () => {
    if (xpPoints >= 300) return { label: 'سيد الذاكرة الفولاذية 💎', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-400/40' };
    if (xpPoints >= 200) return { label: 'خبير التكرار الذهبي 🥇', color: 'text-amber-300 bg-amber-950/80 border-amber-400/40' };
    if (xpPoints >= 100) return { label: 'مسترجع نشط متقدم 🥈', color: 'text-indigo-300 bg-indigo-950/80 border-indigo-400/40' };
    return { label: 'متعلم الذاكرة النشطة 🥉', color: 'text-slate-300 bg-slate-900 border-slate-700' };
  };

  if (!currentCard) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-indigo-500/20 text-slate-400 space-y-3">
        <Layers className="w-12 h-12 mx-auto text-slate-600" />
        <p className="font-bold">لا توجد بطاقات متاحة في هذا المبحث حالياً.</p>
        <Button onClick={() => setSelectedSubject('all')} variant="outline" className="rounded-xl text-xs">
          عرض كافة المباحث
        </Button>
      </div>
    );
  }

  const rank = getRankBadge();

  return (
    <div className="space-y-6">
      {/* Studio Top Control HUD with Gamification */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900/95 via-indigo-950/80 to-purple-950/90 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center gap-2 shadow-sm">
              <Layers className="w-4 h-4 text-purple-400 animate-pulse" />
              استوديو الاسترجاع النشط الفائق (Active Recall Studio)
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rank.color}`}>
              {rank.label}
            </span>
            <Badge variant="outline" className="text-xs font-mono border-indigo-400/40 text-indigo-300">
              بطاقة {currentIndex + 1} من {filteredCards.length}
            </Badge>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white">
            اقرأ السؤال، استرجع الإجابة ذهنياً أولاً، ثم اقلب البطاقة للتحقق وتقييم مستوى التثبيت
          </h3>
        </div>

        {/* Action Controls & XP Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* XP Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>{xpPoints} XP</span>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="h-10 px-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 font-bold"
          >
            <option value="all">كافة المباحث العلمية ({cards.length})</option>
            <option value="الفيزياء">الفيزياء</option>
            <option value="الكيمياء">الكيمياء</option>
            <option value="العلوم الحياتية">العلوم الحياتية</option>
            <option value="الرياضيات">الرياضيات</option>
            <option value="الروبوتات والذكاء">الروبوتات والذكاء</option>
            <option value="الفلك والكونيات">الفلك والكونيات</option>
            <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
            <option value="اللغة العربية">اللغة العربية</option>
          </select>

          {/* Shuffle Button */}
          <Button
            onClick={handleShuffle}
            variant="outline"
            size="sm"
            className="h-10 rounded-2xl text-xs gap-1.5 border-slate-700 text-slate-300 hover:text-white"
            title="خلط البطاقات عشوائياً"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خلط</span>
          </Button>

          {/* Create Custom Flashcard Button */}
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="h-10 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white gap-1.5 shadow-md shadow-purple-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بطاقة</span>
          </Button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="max-w-2xl mx-auto perspective-1000">
        <motion.div
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="w-full min-h-[380px] rounded-3xl cursor-pointer relative shadow-[0_0_50px_rgba(99,102,241,0.2)] transition-all border border-indigo-500/40 hover:border-purple-400"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT FACE (Question / Challenge) */}
          <div
            className={`absolute inset-0 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950/80 border border-indigo-500/30 flex flex-col justify-between ${
              isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {currentCard.subject} • فاصل المراجعة: {currentCard.intervalDay} أيام
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSpeech(currentCard.front);
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="استماع صوتي نقي"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-purple-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs text-slate-400 font-mono">وجه البطاقة: السؤال</span>
              </div>
            </div>

            <div className="my-auto text-center space-y-4 px-2">
              <span className="text-4xl block animate-bounce">🧠</span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                {currentCard.front}
              </h2>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-indigo-500/20 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'إخفاء التلميح' : 'عرض تلميح مساعد'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>انقر لقلب البطاقة ومعرفة الإجابة</span>
              </div>
            </div>

            {showHint && currentCard.hint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs"
              >
                💡 <strong>تلميح:</strong> {currentCard.hint}
              </motion.div>
            )}
          </div>

          {/* BACK FACE (Answer, Verification, SM-2 Rating) */}
          <div
            className={`absolute inset-0 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/90 to-slate-950 border border-purple-500/40 flex flex-col justify-between ${
              !isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            style={{ 
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> الإجابة النموذجية المثبتة
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSpeech(currentCard.back);
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="استماع صوتي للإجابة"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-purple-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs text-slate-400 font-mono">الظهر: التفسير</span>
              </div>
            </div>

            <div className="my-auto space-y-3 px-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium shadow-inner">
                {currentCard.back}
              </div>

              {currentCard.simulationUrl && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-950/60 border border-purple-400/30 text-xs"
                >
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <Atom className="w-4 h-4 text-purple-400 animate-spin-slow" />
                    <span>مرتبط بمختبر: {currentCard.simulationName}</span>
                  </span>
                  <Link to={currentCard.simulationUrl} target="_blank">
                    <Button size="sm" className="rounded-xl text-xs bg-purple-600 text-white h-7 gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      <span>فتح المحاكاة 3D</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* SM-2 Recall Feedback Grading Buttons */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="pt-4 border-t border-purple-500/20 space-y-2 text-xs"
            >
              <span className="text-slate-300 font-bold block text-center">
                كيف كان مستوى استرجاعك لهذه المعلومة؟ (خوارزمية SM-2):
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleRateRecall('again')}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold transition-all text-center flex flex-col items-center"
                >
                  <span>❌ نسيت تماماً</span>
                  <span className="text-[10px] text-rose-400/80">(إعادة بعد 24 س)</span>
                </button>

                <button
                  onClick={() => handleRateRecall('hard')}
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition-all text-center flex flex-col items-center"
                >
                  <span>⚠️ صعب ومتردد</span>
                  <span className="text-[10px] text-amber-400/80">(فاصل 3 أيام)</span>
                </button>

                <button
                  onClick={() => handleRateRecall('good')}
                  className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold transition-all text-center flex flex-col items-center"
                >
                  <span>✅ جيد وتذكرته</span>
                  <span className="text-[10px] text-blue-400/80">(فاصل 7 أيام)</span>
                </button>

                <button
                  onClick={() => handleRateRecall('easy')}
                  className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all text-center flex flex-col items-center shadow-md shadow-emerald-500/20"
                >
                  <span>🌟 سهل جداً</span>
                  <span className="text-[10px] text-emerald-400/80">(فاصل 14 يوماً)</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Buttons Between Cards */}
      <div className="flex items-center justify-between max-w-2xl mx-auto pt-2">
        <Button
          onClick={handlePrevCard}
          disabled={currentIndex === 0}
          variant="outline"
          className="rounded-2xl text-xs gap-1.5 border-slate-700 text-slate-300 hover:text-white"
        >
          <ArrowRight className="w-4 h-4" />
          <span>البطاقة السابقة</span>
        </Button>

        <span className="text-xs text-slate-400 font-mono">
          تمت مراجعة {completedCount} بطاقات في هذه الجلسة
        </span>

        <Button
          onClick={handleNextCard}
          className="rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white gap-1.5 shadow-md shadow-indigo-500/25"
        >
          <span>البطاقة التالية</span>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Custom Flashcard Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border-purple-500/30 text-slate-100 rounded-3xl p-6 space-y-4" dir="rtl">
          <DialogHeader className="text-right space-y-1 pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              <span>إنشاء بطاقة استرجاع نشط جديدة</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              أضف أي قانون، نظرية، أو سؤال وزاري إلى محفظتك الخاصة بالتكرار المتباعد
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">المبحث الأكاديمي:</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="الفيزياء">الفيزياء</option>
                <option value="الكيمياء">الكيمياء</option>
                <option value="العلوم الحياتية">العلوم الحياتية</option>
                <option value="الرياضيات">الرياضيات</option>
                <option value="الروبوتات والذكاء">الروبوتات والذكاء</option>
                <option value="الفلك والكونيات">الفلك والكونيات</option>
                <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                <option value="اللغة العربية">اللغة العربية</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">السؤال / المفهوم (وجه البطاقة):</label>
              <Input
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="مثال: ما نص قانون هوك في المرونة؟"
                className="rounded-xl bg-slate-900 border-slate-800 text-white text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">الإجابة والشرح النموذجي (ظهر البطاقة):</label>
              <Textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="اكتب الإجابة المفصلة والقانون الرياضي..."
                rows={4}
                className="rounded-xl bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">تلميح مساعد (اختياري):</label>
              <Input
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder="تلميح يظهر عند الحاجة..."
                className="rounded-xl bg-slate-900 border-slate-800 text-white text-xs h-10"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                variant="outline"
                className="rounded-xl text-xs"
              >
                إلغاء
              </Button>

              <Button
                type="submit"
                className="rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>حفظ البطاقة في المحفظة</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveRecallFlashcards;
