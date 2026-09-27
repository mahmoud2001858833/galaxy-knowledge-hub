import React, { useState } from 'react';
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
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SpacedLesson, SpacedReview, SUBJECTS } from './types';

export interface FlashcardItem {
  id: string;
  subject: string;
  front: string; // Question / Concept
  back: string;  // Answer / Law / Detailed Explanation
  hint?: string;
  intervalDay: number;
}

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    subject: 'الفيزياء',
    front: 'ما هي فرضية دي برولي للموجات المادية؟ وما القانون الرياضي المعبّر عنها؟',
    back: 'لكل جسيم مادي متحرك موجة مصاحبة له تدعى "موجة دي برولي المادية".\nالقانون: λ = h / p = h / (m · v)\nحيث λ الطول الموجي، h ثابت بلانك، و p كمية التحرك.',
    hint: 'يربط بين الخصائص الجسيمية والموجية',
    intervalDay: 3
  },
  {
    id: 'fc-2',
    subject: 'الكيمياء',
    front: 'ما نص قاعدة لوشاتيليه؟ وكيف يؤثر تقليل الحجم (زيادة الضغط) على تفاعل غازي متزن؟',
    back: 'نص القاعدة: "إذا أُثّر على نظام في حالة اتزان بتغير في التركيز أو الضغط أو الحرارة، فإن النظام يعدل نفسه بالاتجاه الذي يقلل من أثر هذا التغير".\nزيادة الضغط: ينزاح موضع الاتزان نحو الطرف الذي يحتوي على عدد مولات غازية أقل.',
    hint: 'تذكر علاقة الضغط بعدد المولات الغازية',
    intervalDay: 6
  },
  {
    id: 'fc-3',
    subject: 'العلوم الحياتية',
    front: 'ما هي الآلية الدقيقة لأنزيم كريسبر (Cas9) في تعديل الجينات؟',
    back: 'يتكون النظام من جزيء RNA موجه (gRNA) يرتبط بتسلسل مكمل محدد في الحمض النووي (DNA) مجاور لتسلسل PAM.\nيقوم أنزيم Cas9 بقطع سلسلتي الـ DNA بدقة شديدة مثل مقص جزيئي، مما يتيح تعطيل الجين أو استبداله بتسلسل سليم.',
    hint: 'تذكر دور الـ gRNA الموجه ومقص Cas9',
    intervalDay: 10
  },
  {
    id: 'fc-4',
    subject: 'الرياضيات',
    front: 'ما هي خطوات حل مسائل المعدلات المرتبطة بالزمن (Related Rates)؟',
    back: '1. رسم مخطط توضيحي وتحديد المتغيرات والثوابت بالرموز.\n2. إيجاد علاقة رياضية تربط المتغيرات (فيثاغورس، تشابه مثلثات، قانون جيب التمام).\n3. اشتقاق طرفي المعادلة ضمنياً بالنسبة للزمن t.\n4. التعويض بالقيم المعطاة عند اللحظة الزمنية المحددة واستخراج المجهول.',
    hint: 'الاشتقاق الضمني بالنسبة للمتغير t دائماً',
    intervalDay: 15
  },
  {
    id: 'fc-5',
    subject: 'الروبوتات والذكاء',
    front: 'كيف تحسب خوارزمية A* تكلفة المسار الأمثل f(n)؟',
    back: 'تعتمد على المعادلة الجوهرية:\nf(n) = g(n) + h(n)\n• g(n): التكلفة الفعلية الحقيقية من نقطة البداية إلى العقدة الحالية n.\n• h(n): التكلفة التقديرية الإرشادية (Heuristic) للوصول من العقدة n إلى الهدف.\nتضمن الخوارزمية المسار الأقصر بكفاءة زمنية فائقة.',
    hint: 'مجموع التكلفة الفعلية والتقدير الإرشادي',
    intervalDay: 21
  }
];

interface ActiveRecallFlashcardsProps {
  lessons?: SpacedLesson[];
  reviews?: SpacedReview[];
  onCompleteReview?: (reviewId: string) => Promise<boolean>;
}

export const ActiveRecallFlashcards: React.FC<ActiveRecallFlashcardsProps> = ({
  lessons = [],
  reviews = [],
  onCompleteReview
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>(DEFAULT_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showHint, setShowHint] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
      toast.success('🎉 أحسنت! أنهيت مراجعة جميع البطاقات النشطة لهذا اليوم!');
    }
  };

  const handleRateRecall = (difficulty: 'easy' | 'good' | 'hard') => {
    if (difficulty === 'easy') {
      toast.success('🌟 ممتاز! استرجاع سريع (+ زيادة الفاصل الزمني بمقدار 1.5x)');
    } else if (difficulty === 'good') {
      toast.info('👍 جيد ومتقن! (استمرار الفاصل الزمني المنتظم)');
    } else {
      toast.warning('⚠️ استرجاع صعب! تمت جدولة المراجعة لاحقاً اليوم لترسيخها');
    }

    setCompletedCount(prev => prev + 1);
    handleNextCard();
  };

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
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
    toast.info('تم خلط وترتيب البطاقات عشوائياً لتحفيز الذاكرة!');
  };

  if (!currentCard) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-indigo-500/20 text-slate-400">
        لا توجد بطاقات متاحة في هذا المبحث حالياً.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-400/20 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              استوديو الاسترجاع النشط (Active Recall Flashcards)
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-indigo-400/30 text-indigo-400">
              بطاقة {currentIndex + 1} من {filteredCards.length}
            </Badge>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            اختبر ذاكرتك الحقيقية: اقرأ المفهوم ثم اقلب البطاقة لمطابقة الإجابة
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
          >
            <option value="all">كافة المباحث العلمية</option>
            <option value="الفيزياء">الفيزياء</option>
            <option value="الكيمياء">الكيمياء</option>
            <option value="العلوم الحياتية">العلوم الحياتية</option>
            <option value="الرياضيات">الرياضيات</option>
            <option value="الروبوتات والذكاء">الروبوتات والذكاء</option>
          </select>

          <Button
            onClick={handleShuffle}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1 border-slate-700 text-slate-300 hover:text-white"
            title="خلط البطاقات عشوائياً"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خلط</span>
          </Button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="max-w-2xl mx-auto perspective-1000">
        <motion.div
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full min-h-[340px] rounded-3xl cursor-pointer relative shadow-2xl transition-all border border-indigo-500/30"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT FACE (Question) */}
          <div
            className={`absolute inset-0 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-purple-950/70 border border-indigo-500/30 flex flex-col justify-between ${
              isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                {currentCard.subject} • المراجعة بعد {currentCard.intervalDay} أيام
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSpeech(currentCard.front);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="استماع صوتي"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-purple-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs text-slate-400 font-mono">الوجه: السؤال</span>
              </div>
            </div>

            <div className="my-auto text-center space-y-4">
              <span className="text-3xl block">💡</span>
              <h4 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
                {currentCard.front}
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                (انقر في أي مكان على البطاقة للكشف عن الإجابة النموذجية 🔄)
              </p>
            </div>

            {/* Hint Box */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              {currentCard.hint && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showHint ? `تلميح: ${currentCard.hint}` : 'إظهار تلميح خفيف'}</span>
                </button>
              )}
              <span className="text-slate-500 mr-auto font-mono text-[11px]">Active Recall v2.0</span>
            </div>
          </div>

          {/* BACK FACE (Answer) */}
          <div
            className={`absolute inset-0 p-8 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950/90 border border-purple-500/40 flex flex-col justify-between ${
              !isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                ✓ الإجابة والشرح النموذجي
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSpeech(currentCard.back);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  title="استماع صوتي"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="text-xs text-purple-300 font-mono">الظهر: الحل</span>
              </div>
            </div>

            <div className="my-auto space-y-3">
              <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-100 font-sans bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                {currentCard.back}
              </div>
            </div>

            <div className="text-center pt-2 text-xs text-slate-400">
              كيف كان استرجاعك لهذه المعلومة؟ قيّم أدائك بالأسفل &darr;
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recall Evaluation Rating Bar */}
      <div className="max-w-2xl mx-auto p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="text-center text-xs font-bold text-slate-400">
          قيّم جودة استرجاعك للمعلومة لتكييف فترات التكرار المتباعد:
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => handleRateRecall('hard')}
            variant="outline"
            className="h-12 rounded-2xl border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>صعب / نسيته 🔴</span>
          </Button>

          <Button
            onClick={() => handleRateRecall('good')}
            variant="outline"
            className="h-12 rounded-2xl border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>جيد / متقن 🟡</span>
          </Button>

          <Button
            onClick={() => handleRateRecall('easy')}
            variant="outline"
            className="h-12 rounded-2xl border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>سهل جداً 🟢</span>
          </Button>
        </div>
      </div>

      {/* Bottom Counter & Motivation */}
      <div className="flex items-center justify-between max-w-2xl mx-auto text-xs text-slate-400 pt-2">
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>تمت مراجعة {completedCount} بطاقة في هذه الجلسة</span>
        </span>

        <button
          onClick={handleNextCard}
          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
        >
          <span>تخطي للبطاقة التالية</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
