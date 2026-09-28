import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  Copy, 
  Check, 
  BookmarkPlus, 
  Lightbulb, 
  Castle, 
  KeyRound, 
  Eye, 
  ArrowRight,
  BookOpen,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PresetConcept {
  id: string;
  subject: string;
  name: string;
  formula: string;
  description: string;
  techniques: {
    palace: {
      room: string;
      scene: string;
      cue: string;
    };
    acrostic: {
      phrase: string;
      breakdown: string;
    };
    analogy: {
      metaphor: string;
      explanation: string;
    };
  };
}

const PRESET_CONCEPTS: PresetConcept[] = [
  {
    id: 'coulomb',
    subject: 'الفيزياء',
    name: 'قانون كولوم للقوة الكهرومغناطيسية',
    formula: 'F = k · (|q₁ · q₂|) / r²',
    description: 'القوة الكهربائية المتبادلة بين شحنتين نقطيتين تتناسب طردياً مع حاصل ضرب الشحنتين وعكسياً مع مربع المسافة بينهما.',
    techniques: {
      palace: {
        room: 'مدخل القصر الذهبي',
        scene: 'تفتح باب القصر فتجد حارسين مغناطيسيين (q₁ و q₂) يتعانقان بشدة كلما زاد وزنهما (ضرب الشحنتين)، لكن عند محاولة إبعادهما، يظهر بساط سحري مربع (r²) يقلل التصاقهما أضعافاً مضاعفة!',
        cue: 'القوة (F) تسكن عند الباب = ثابت الحارس (k) مضروباً في الحارسين مقسوماً على البساط المربع.'
      },
      acrostic: {
        phrase: '«فارس كرم قطف قطتين على رصيفين مربعين»',
        breakdown: 'فارس (F) = كرم (k) × قطف (q₁) × قطتين (q₂) ÷ رصيفين مربعين (r²)'
      },
      analogy: {
        metaphor: 'ضوء كشاف مسرحي في قاعة مظلمة',
        explanation: 'مثل سطوع ضوء الكشاف الذي يضعف مع مربع المسافة بسبب تشتت الفوتونات، كذلك القوة الكهربائية تتشتت عبر سطح كرة مساحتها 4πr².'
      }
    }
  },
  {
    id: 'bernoulli',
    subject: 'الفيزياء',
    name: 'مبدأ ومعادلة برنولي للموائع',
    formula: 'P + ½ρv² + ρgh = ثابت',
    description: 'مجموع الضغط وطاقة الحركة لوحدة الحجوم وطاقة الوضع لوحدة الحجوم لمائع مثالي يبقى ثابتاً على طول خط انسياب.',
    techniques: {
      palace: {
        room: 'شلال الحديقة المائية',
        scene: 'خرطوم مياه سريع جداً؛ كلما ضيقت فتحته (زادت السرعة v²)، انخفض ضغط الجدران الجانبي (P يقل)! والماء الهابط من علو المرتفع (ρgh) يتحول فوراً لسرعة جارفة.',
        cue: 'السرعة العالية تخلق ضغطاً منخفضاً، وهو سر طيران الطائرات وانجذاب السيارات السريعة لبعضها.'
      },
      acrostic: {
        phrase: '«ضغطك ينخفض عندما تركض بسرعة بين قطرات المطر»',
        breakdown: 'الضغط (P) + نصف الكثافة في مربع السرعة (½ρv²) + الارتفاع الكثافي (ρgh) = طاقة محفوظة.'
      },
      analogy: {
        metaphor: 'جناح الصقر أثناء الانقضاض',
        explanation: 'الهواء فوق جناح الطائرة المنحني يقطع مسافة أطول فيجري أسرع، فينخفض ضغطه، بينما الهواء السفلي أبطأ وضغطه أعلى فيرفع الطائرة للأعلى.'
      }
    }
  },
  {
    id: 'photoelectric',
    subject: 'الفيزياء الحديثة',
    name: 'معادلة أينشتاين للظاهرة الكهروضوئية',
    formula: 'E_photon = h·ν = φ + KE_max',
    description: 'طاقة الفوتون الساقط تستهلك أولاً في تحرير الإلكترون من سطح الفلز (دالة الشغل φ) والفائض يتحول لطاقة حركية عظمى.',
    techniques: {
      palace: {
        room: 'بوابة التذاكر المغناطيسية',
        scene: 'تصل محطة قطار وممعك عملة ذهبية (طاقة الفوتون h·ν). البواب يقتطع رسوم الدخول الثابتة (دالة الشغل φ)، وما تبقى في محفظتك هو سرعة ركضك داخل المحطة (KE_max)!',
        cue: 'إذا كانت نقودك أقل من تذكرة البوابة، لن يمر أي إلكترون مهما انتظرت لساعات!'
      },
      acrostic: {
        phrase: '«حزمة نور تدفع تذكرة العبور وتطلق سرعة الطيران»',
        breakdown: 'طاقة الفوتون (E = hν) = دالة الشغل (φ) + الطاقة الحركية (KE).'
      },
      analogy: {
        metaphor: 'شراء تذكرة مدينة الألعاب مع الحلوى المتبقية',
        explanation: 'الفوتون يعطي كل طاقته لإلكترون واحد فقط دفعة واحدة (كل شيء أو لا شيء).'
      }
    }
  },
  {
    id: 'redox',
    subject: 'الكيمياء',
    name: 'تفاعلات التأكسد والاختزال والنشاط الكيميائي',
    formula: 'OIL RIG (Oxidation Is Loss, Reduction Is Gain)',
    description: 'التأكسد فقدان إلكترونات وزيادة في عدد التأكسد، بينما الاختزال كسب إلكترونات ونقصان في عدد التأكسد.',
    techniques: {
      palace: {
        room: 'برج المراقبة في القصر',
        scene: 'شعلة نار تصعد للأعلى في البرج وترمي شحناتها السلبية (إلكترونات) نحو الأرض فتتأكسد وتصعد؛ بينما حفرة مائية في الأسفل تبتلع وتكسب تلك الإلكترونات فتختزل.',
        cue: 'الأعلى = تأكسد (زيادة عدد التأكسد وفقد)، الأسفل = اختزال (نقصان عدد وكسب).'
      },
      acrostic: {
        phrase: '«تأكسد تفقد تتألق، اختزل تكتسب تنخفض»',
        breakdown: 'تأكسد: زيادة شحنة موجبة وفقد إلكترونات | اختزال: نقصان شحنة موجبة وكسب إلكترونات.'
      },
      analogy: {
        metaphor: 'تبادل العملات في السوق المالي',
        explanation: 'لا يمكن لتاجر أن يربح عملة إلا إذا خسرها تاجر آخر في نفس اللحظة بالتمام.'
      }
    }
  },
  {
    id: 'dna_replication',
    subject: 'العلوم الحياتية',
    name: 'إنزيمات تضاعف الحمض النووي DNA',
    formula: 'Helicase → Primase → DNA Polymerase III → Ligase',
    description: 'سلسلة الإنزيمات الحيوية المنظمة لبناء نسختين متطابقتين من الشريط الحلزوني المزدوج.',
    techniques: {
      palace: {
        room: 'مكتبة المخطوطات الملكية',
        scene: 'مقص سحري ذكي (Helicase) يفك حبال المخطوطة، ثم يضع الرسام علامة بداية ملونة (Primase)، ثم يأتي البنّاء العملاق (DNA Polymerase) يصف الطوب بسرعة فائقة، وأخيراً يدهن الخياط الصمغ النهائي (Ligase) لربط الفواصل.',
        cue: 'فك الحبال (هليكيز) -> وضع البداية (برايميز) -> البناء الرئيسي (بوليميريز) -> اللحام النهائي (لايغيز).'
      },
      acrostic: {
        phrase: '«هل بنى بوليس لندن؟»',
        breakdown: 'هل (Helicase) -> بنى (Primase) -> بوليس (Polymerase) -> لندن (Ligase)'
      },
      analogy: {
        metaphor: 'سحاب سترة شتوية يتم فتحه وخياطته فوراً خلف الرأس',
        explanation: 'الشريط الرائد يُبنى بسلاسة بينما الشريط المتأخر يُبنى كقطع أوكازاكي ملحومة لاحقاً.'
      }
    }
  }
];

export const MnemonicsGenerator: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<PresetConcept>(PRESET_CONCEPTS[0]);
  const [activeTechnique, setActiveTechnique] = useState<'palace' | 'acrostic' | 'analogy'>('palace');
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('تم نسخ الشيفرة الذهنية إلى الحافظة!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToFlashcards = () => {
    try {
      const existing = localStorage.getItem('galaxy_custom_flashcards');
      const cards = existing ? JSON.parse(existing) : [];

      let contentBack = '';
      if (activeTechnique === 'palace') {
        contentBack = `🏰 قصر الذاكرة:\nالغرفة: ${selectedConcept.techniques.palace.room}\nالمشهد: ${selectedConcept.techniques.palace.scene}\nالشيفرة: ${selectedConcept.techniques.palace.cue}\n\nالقانون: ${selectedConcept.formula}`;
      } else if (activeTechnique === 'acrostic') {
        contentBack = `🔑 العبارة التذكيرية: ${selectedConcept.techniques.acrostic.phrase}\nالتفسير: ${selectedConcept.techniques.acrostic.breakdown}\n\nالقانون: ${selectedConcept.formula}`;
      } else {
        contentBack = `👁️ التشبيه الفائق: ${selectedConcept.techniques.analogy.metaphor}\nالتوضيح: ${selectedConcept.techniques.analogy.explanation}\n\nالقانون: ${selectedConcept.formula}`;
      }

      const newCard = {
        id: `mnemonic_${Date.now()}`,
        subject: selectedConcept.subject,
        front: `كيف تتذكر قانون/مفهوم: ${selectedConcept.name}؟`,
        back: contentBack,
        hint: `الصيغة الرياضية: ${selectedConcept.formula}`,
        difficulty: 'medium',
        interval: 1,
        repetition: 0,
        efactor: 2.5,
        dueDate: new Date().toISOString(),
        lastReviewed: null,
      };

      cards.push(newCard);
      localStorage.setItem('galaxy_custom_flashcards', JSON.stringify(cards));
      toast.success(`تمت إضافة بطاقة الشيفرة الذهنية لـ (${selectedConcept.name}) إلى محفظتك!`);
    } catch {
      toast.error('تعذر حفظ البطاقة في التخزين المحلي.');
    }
  };

  const handleCustomGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGeneratingCustom(true);
    setTimeout(() => {
      setIsGeneratingCustom(false);
      const generated: PresetConcept = {
        id: `custom_${Date.now()}`,
        subject: 'مفهوم مخصص',
        name: customPrompt,
        formula: 'مفهوم أكاديمي مشفر بالذكاء',
        description: `شيفرة ذهنية مخصصة مولدة بالذكاء الاصطناعي لمفهوم: "${customPrompt}"`,
        techniques: {
          palace: {
            room: 'قاعة العرش في قصر الذاكرة',
            scene: `تخيل تمثالاً ضخماً في منتصف القاعة يجسد (${customPrompt})، محاطاً بأضواء نيون ثلاثية الأبعاد تنبض بالخطوات الرئيسية والتفرعات.`,
            cue: `اربط البداية بمدخل القاعة والنهاية بالخروج من النافذة البلورية.`
          },
          acrostic: {
            phrase: `«كل فكرة تبدأ بشرارة إبداع وتركيز عميق لتثبيت (${customPrompt})»`,
            breakdown: 'الحروف الأولى تمثل العناصر الجوهرية والترتيب الزمني للمفهوم.'
          },
          analogy: {
            metaphor: 'نظام التروس المسننة في الساعة السويسرية',
            explanation: `كل جزء في (${customPrompt}) يدير الجزء التالي تماماً كحركة التروس المترابطة بدقة متناهية.`
          }
        }
      };

      setSelectedConcept(generated);
      setCustomPrompt('');
      toast.success('تم توليد الشيفرة الذهنية بنجاح!');
    }, 600);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                مولد الشيفرات الذهنية وقصور الذاكرة (AI Mnemonics Engine)
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              حوّل القوانين والمعادلات المعقدة التي تنساها دائماً إلى مشاهد بصرية وقصور ذاكرة لا تُنسى مدى الحياة
            </p>
          </div>

          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs px-3 py-1 font-mono">
            Method of Loci + Neuro-Acrostics
          </Badge>
        </div>
      </div>

      {/* Preset Concept Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-bold block">
          اختر قانوناً أو مفهوماً وزارياً شائع النسيان:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-nowrap scrollbar-thin">
          {PRESET_CONCEPTS.map((concept) => (
            <button
              key={concept.id}
              onClick={() => setSelectedConcept(concept)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                selectedConcept.id === concept.id
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className="opacity-70 text-[10px] ml-1.5">[{concept.subject}]</span>
              <span>{concept.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Concept Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-cyan-500/30 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-cyan-400 font-mono">[{selectedConcept.subject}]</span>
              <h3 className="text-lg sm:text-xl font-black text-white">{selectedConcept.name}</h3>
            </div>
            <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-sm inline-block">
              {selectedConcept.formula}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveToFlashcards}
              className="rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>إضافة لمحفظة البطاقات</span>
            </Button>
          </div>
        </div>

        {/* Technique Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => setActiveTechnique('palace')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTechnique === 'palace'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Castle className="w-4 h-4" />
            <span>قصر الذاكرة المكاني</span>
          </button>

          <button
            onClick={() => setActiveTechnique('acrostic')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTechnique === 'acrostic'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>العبارة والشيفرة التذكيرية</span>
          </button>

          <button
            onClick={() => setActiveTechnique('analogy')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTechnique === 'analogy'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>التشبيه البصري الفائق</span>
          </button>
        </div>

        {/* Technique Content Display */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          {activeTechnique === 'palace' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Castle className="w-4 h-4" />
                  مكان المشهد في قصر الذاكرة: {selectedConcept.techniques.palace.room}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(selectedConcept.techniques.palace.scene)}
                  className="text-xs text-slate-400 hover:text-white h-7 gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  نسخ المشهد
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed">
                {selectedConcept.techniques.palace.scene}
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300">
                💡 <strong>رابط التثبيت العصبي:</strong> {selectedConcept.techniques.palace.cue}
              </div>
            </motion.div>
          )}

          {activeTechnique === 'acrostic' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  الجملة التذكيرية السريعة
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(selectedConcept.techniques.acrostic.phrase)}
                  className="text-xs text-slate-400 hover:text-white h-7 gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  نسخ الجملة
                </Button>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-base sm:text-lg font-black text-amber-300">
                  {selectedConcept.techniques.acrostic.phrase}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                🔍 <strong>تفكيك الرموز والمعادلة:</strong> {selectedConcept.techniques.acrostic.breakdown}
              </div>
            </motion.div>
          )}

          {activeTechnique === 'analogy' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  التشبيه الحي الواقعي
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(selectedConcept.techniques.analogy.explanation)}
                  className="text-xs text-slate-400 hover:text-white h-7 gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  نسخ التشبيه
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold text-sm">
                🎯 {selectedConcept.techniques.analogy.metaphor}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedConcept.techniques.analogy.explanation}
              </div>
            </motion.div>
          )}
        </div>

        {/* Custom Concept Prompt Generator */}
        <form onSubmit={handleCustomGenerate} className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-xs text-slate-300 font-bold block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>هل لديك معادلة أو مفهوم آخر تريد تشفيره بقصر الذاكرة؟</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="اكتب اسم القانون أو النظرية (مثال: قانون سنيل في الانكسار، نظرية رابطة التكافؤ...)"
              className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl"
            />
            <Button
              type="submit"
              disabled={isGeneratingCustom || !customPrompt.trim()}
              className="rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 gap-1.5 shrink-0"
            >
              {isGeneratingCustom ? (
                <span>جاري التوليد...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>توليد الشيفرة</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MnemonicsGenerator;
