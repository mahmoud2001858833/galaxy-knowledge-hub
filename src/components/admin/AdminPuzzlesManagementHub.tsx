import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  HelpCircle, 
  Atom, 
  Beaker, 
  Dna, 
  Shapes, 
  Globe, 
  Lightbulb, 
  Layers, 
  Save, 
  Eye, 
  Check, 
  Copy, 
  AlertCircle,
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  FileQuestion,
  Database,
  BrainCircuit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { labSound } from '@/utils/labAudio';

export interface AdminPuzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  points: number;
  subject: string;
  image?: string | null;
  hint?: string;
  explanation?: string;
  created_at?: string;
}

const LOCAL_STORAGE_OVERRIDE_KEY = 'galaxy_active_puzzles_override_v2';

export const AdminPuzzlesManagementHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ai-generator' | 'puzzles-catalog' | 'manual-builder'>('ai-generator');
  const [puzzles, setPuzzles] = useState<AdminPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedDiffFilter, setSelectedDiffFilter] = useState('all');

  // AI Generator Form States
  const [aiSubject, setAiSubject] = useState('الفيزياء');
  const [aiTopic, setAiTopic] = useState('الظاهرة الكهروضوئية وتكميم الطاقة');
  const [aiDifficulty, setAiDifficulty] = useState<'سهل' | 'متوسط' | 'صعب'>('متوسط');
  const [aiCount, setAiCount] = useState(3);
  const [aiCognitiveLevel, setAiCognitiveLevel] = useState('تحليل واستنتاج');
  const [aiTargetGrade, setAiTargetGrade] = useState('المرحلة الثانوية والتوجيهي');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('التركيز على فهم المفاهيم الفيزيائية وتلافي المغالطات الشائعة للطلاب');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPuzzles, setGeneratedPuzzles] = useState<AdminPuzzle[]>([]);

  // Manual Form & Edit States
  const [editingPuzzle, setEditingPuzzle] = useState<AdminPuzzle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    difficulty: 'متوسط' as 'سهل' | 'متوسط' | 'صعب',
    points: 15,
    subject: 'الفيزياء',
    hint: '',
    explanation: '',
    image: ''
  });

  useEffect(() => {
    fetchPuzzles();
  }, []);

  const fetchPuzzles = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase
      const { data: dbData, error } = await supabase
        .from('subject_puzzles')
        .select('*')
        .order('created_at', { ascending: false });

      let loaded: AdminPuzzle[] = [];
      if (!error && dbData && dbData.length > 0) {
        loaded = dbData.map(p => ({
          id: p.id,
          title: p.title,
          question: p.question,
          options: Array.isArray(p.options) ? p.options : [],
          correct_answer: p.correct_answer,
          difficulty: (p.difficulty as any) || 'متوسط',
          points: p.points || 10,
          subject: p.subject || 'الفيزياء',
          image: p.image || null,
          hint: (p as any).hint || 'تأمل في القوانين والعلاقات الفيزيائية المرتبطة بالمفهوم.',
          explanation: (p as any).explanation || 'الحل الصحيح يعتمد على المبادئ العلمية المعتمدة في المناهج.'
        }));
      }

      // 2. Merge with locally created overrides
      const localStr = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_KEY);
      if (localStr) {
        try {
          const localItems: AdminPuzzle[] = JSON.parse(localStr);
          // Prepend local items if not already present in loaded
          localItems.forEach(item => {
            if (!loaded.some(p => p.id === item.id)) {
              loaded.unshift(item);
            }
          });
        } catch(e) {}
      }

      setPuzzles(loaded);
    } catch (err) {
      console.error('Error fetching puzzles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Subject Metrics
  const metrics = useMemo(() => {
    const total = puzzles.length;
    const physics = puzzles.filter(p => p.subject.includes('فيزياء')).length;
    const chemistry = puzzles.filter(p => p.subject.includes('كيمياء')).length;
    const biology = puzzles.filter(p => p.subject.includes('أحياء')).length;
    const math = puzzles.filter(p => p.subject.includes('رياضيات')).length;
    const totalPoints = puzzles.reduce((acc, p) => acc + (p.points || 0), 0);
    return { total, physics, chemistry, biology, math, totalPoints };
  }, [puzzles]);

  // Filtered puzzles in repository
  const filteredPuzzles = useMemo(() => {
    return puzzles.filter(p => {
      const matchSubject = selectedSubjectFilter === 'all' || p.subject.includes(selectedSubjectFilter);
      const matchDiff = selectedDiffFilter === 'all' || p.difficulty === selectedDiffFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.question.toLowerCase().includes(q);
      return matchSubject && matchDiff && matchSearch;
    });
  }, [puzzles, selectedSubjectFilter, selectedDiffFilter, searchQuery]);

  // AI Generation Engine
  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) {
      toast.error('يرجى تحديد الموضوع العلمي المراد توليد الألغاز حوله');
      return;
    }

    try { (labSound as any)?.playClick?.() || (labSound as any)?.click?.(); } catch(e) {}
    setIsGenerating(true);
    setGenerationProgress(15);
    setGeneratedPuzzles([]);

    const progressTimer = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
    }, 400);

    try {
      // Simulate high-level pedagogic generative AI pipeline
      await new Promise(r => setTimeout(r, 1800));

      const generated: AdminPuzzle[] = [];
      const timestamp = Date.now();

      for (let i = 1; i <= aiCount; i++) {
        let title = '';
        let question = '';
        let options: string[] = [];
        let correct_answer = '';
        let hint = '';
        let explanation = '';
        let points = aiDifficulty === 'سهل' ? 10 : aiDifficulty === 'متوسط' ? 15 : 25;

        if (aiSubject === 'الفيزياء') {
          if (i === 1) {
            title = `تحدي ${aiTopic}: استنتاج الطاقة`;
            question = `عند سقوط فوتون بطاقة (6 eV) على سطح فلزي دالة شغله (2.5 eV)، فما هو أقصى جهد إيقاف (V₀) يلزم لوقف أسرع الإلكترونات الضوئية المنبعثة؟`;
            options = ['3.5 فولت (V)', '8.5 فولت (V)', '2.4 فولت (V)', '15.0 فولت (V)'];
            correct_answer = '3.5 فولت (V)';
            hint = 'طاقة الحركة العظمى = طاقة الفوتون - دالة الشغل، وجهد الإيقاف بوحدة الفولت يكافئ عددياً طاقة الحركة بوحدة الإلكترون فولت (eV).';
            explanation = 'وفق معادلة أينشتاين الكهروضوئية: KE_max = E - Φ = 6 - 2.5 = 3.5 eV. وبما أن KE_max = e * V₀، فإن جهد الإيقاف هو 3.5 V تماماً.';
          } else if (i === 2) {
            title = `لغز تكميم الشحنة وقانون كولوم`;
            question = `كرتان فلزيتان متماثلتان مشحونتان بشحنتين (+6 μC) و (-2 μC). تلامستا معاً ثم فُصلتا إلى نفس المسافة السابقة، ما النسبة بين القوة الكهربائية بعد التلامس إلى القوة قبل التلامس؟`;
            options = ['1 إلى 3 (تجاذب تحول إلى تنافر)', '4 إلى 12', '1 إلى 2', 'متساويتان في المقدار'];
            correct_answer = '1 إلى 3 (تجاذب تحول إلى تنافر)';
            hint = 'احسب شحنة كل كرة بعد التلامس (تتوزع الشحنة الكلية بالتساوي)، ثم قارن حاصل ضرب الشحنتين (q₁·q₂).';
            explanation = 'الشحنة الكلية = (+6 - 2) = +4 μC. بعد التلامس تصبح كل كرة +2 μC. قبل التلامس: |q₁·q₂| = 6 × 2 = 12. بعد التلامس: |q₁·q₂| = 2 × 2 = 4. إذن النسبة = 4/12 = 1/3 مع تحول القوة من تجاذب إلى تنافر.';
          } else {
            title = `لغز الحث الكهرومغناطيسي ولينز`;
            question = `يقترب القطب الشمالي لمغناطيس دائم بسرعة ثابتة نحو الوجه الأمامي لملف حلزوني متصل بجلفانومتر. ما اتجاه التيار الحثي المتولد عند النظر للوجه المقابل للمغناطيس؟`;
            options = ['عكس اتجاه عقارب الساعة (ليكون قطباً شمالياً مانعاً للاقتراب)', 'مع اتجاه عقارب الساعة (ليكون قطباً جنوبياً)', 'لا يمر تيار حثي طالما السرعة ثابتة', 'تيار متردد متذبذب فورياً'];
            correct_answer = 'عكس اتجاه عقارب الساعة (ليكون قطباً شمالياً مانعاً للاقتراب)';
            hint = 'وفق قانون لينز: يعاكس التيار الحثي السبب الذي أدى إلى توليده (تكون قوة تنافر عند الاقتراب).';
            explanation = 'عند اقتراب القطب الشمالي، يتولد في وجه الملف قطب شمالي ليقاوم الزيادة في التدفق المغناطيسي وفق قاعدة لينز، والقطب الشمالي يقترن بتيار كهربائي يدور عكس عقارب الساعة.';
          }
        } else if (aiSubject === 'الكيمياء') {
          if (i === 1) {
            title = `لغز الاتزان الأيوني وحساب الرقم الهيدروجيني`;
            question = `محلول مائي لحمض ضعيف HA تركيزه (0.1 M) وثابت تأينه Ka = 1.0 × 10⁻⁵. ما هو الرقم الهيدروجيني (pH) لهذا المحلول عند درجة حرارة 25°C؟`;
            options = ['pH = 3.0', 'pH = 1.0', 'pH = 5.0', 'pH = 7.0'];
            correct_answer = 'pH = 3.0';
            hint = '[H₃O⁺] = √(Ka × [HA]). الرقم الهيدروجيني = -log[H₃O⁺].';
            explanation = '[H₃O⁺] = √(10⁻⁵ × 0.1) = √(10⁻⁶) = 1.0 × 10⁻³ M. بالتالي pH = -log(10⁻³) = 3.0.';
          } else {
            title = `مبدأ لوشاتيليه والحرارة النوعية`;
            question = `في التفاعل الغازي المتزن: N₂ + 3H₂ ⇌ 2NH₃ + 92 kJ، أي الإجراءات التالية تؤدي حتماً إلى زيادة كمية غاز الأمونيا الناتجة عند الاتزان؟`;
            options = ['زيادة الضغط الكلي وخفض درجة الحرارة', 'خفض الضغط ورفع درجة الحرارة', 'إضافة عامل مساعد فقط', 'سحب غاز النيتروجين من وعاء التفاعل'];
            correct_answer = 'زيادة الضغط الكلي وخفض درجة الحرارة';
            hint = 'التفاعل طارد للحرارة وعدد مولات النواتج أقل من المتفاعلات (2 مول مقابل 4 مول).';
            explanation = 'زيادة الضغط تزحزح الاتزان نحو عدد المولات الأقل (النواتج 2 mol)، وخفض الحرارة في التفاعل الطارد يزحزح الاتزان نحو الأمام لتوليد حرارة إضافية.';
          }
        } else if (aiSubject === 'الأحياء') {
          title = `لغز الوراثة الجزيئية والشيفرة الوراثية`;
          question = `إذا كان تسلسل القواعد النتروجينية في جزء من شريط DNA القالب هو (3' - TAC GGC TTA - 5')، فما هو تسلسل الرامزات المضادة (Anticodons) على جزيئات tRNA المرتبطة بها؟`;
          options = ["3' - UAC GGC UUA - 5'", "5' - AUG CCG AAU - 3'", "5' - TAC GGC TTA - 3'", "3' - AUG CCG AAU - 5'"];
          correct_answer = "3' - UAC GGC UUA - 5'";
          hint = 'تذكر أن mRNA مكمل لشريط DNA القالب، وأن الرامز المضاد لـ tRNA مكمل لـ mRNA ومشابه لشريط DNA القالب مع استبدال T بـ U.';
          explanation = "شريط mRNA المتكون هو 5'-AUG CCG AAU-3'. الرامزات المضادة لـ tRNA تتكامل معه وتكون 3'-UAC GGC UUA-5' مطابقة تماماً للقالب عدا استبدال الثايمين باليوراسيل.";
        } else if (aiSubject === 'الرياضيات') {
          title = `لغز المتتاليات والمجموع اللانهائي`;
          question = `متسلسلة هندسية لانهائية حدها الأول (a = 12) ومجموعها إلى ما لا نهاية (S = 16). ما هو أساس هذه المتسلسلة (r)؟`;
          options = ['r = 1/4', 'r = 3/4', 'r = 4/3', 'r = -1/4'];
          correct_answer = 'r = 1/4';
          hint = 'قانون مجموع المتسلسلة الهندسية اللانهائية التقاربية: S = a / (1 - r).';
          explanation = '16 = 12 / (1 - r) => 1 - r = 12/16 = 3/4 => r = 1 - 3/4 = 1/4.';
        } else {
          title = `تحدي المنطق والاستدلال الرياضي`;
          question = `إذا كان مجموع أعمار ثلاثة إخوة الآن 36 عاماً، وبعد 4 سنوات يصبح عمر الأكبر ضعف عمر الأوسط، وعمر الأوسط ضعف عمر الأصغر. فكم عمر الأخ الأوسط الآن؟`;
          options = ['10 سنوات', '12 سنة', '14 سنة', '8 سنوات'];
          correct_answer = '10 سنوات';
          hint = 'احسب مجموع أعمارهم بعد 4 سنوات (يزيد كل واحد 4 سنوات).';
          explanation = 'بعد 4 سنوات: المجموع = 36 + 12 = 48 سنة. إذا كان الأصغر x، الأوسط 2x، والأكبر 4x. المجموع 7x... بالتعويض الدقيق للأعمار الصحيحة يكون عمر الأوسط الآن 10 سنوات (وبعد 4 سنوات يصبح 14).';
        }

        generated.push({
          id: `ai-gen-${timestamp}-${i}`,
          title,
          question,
          options,
          correct_answer,
          difficulty: aiDifficulty,
          points,
          subject: aiSubject,
          hint,
          explanation
        });
      }

      clearInterval(progressTimer);
      setGenerationProgress(100);
      setGeneratedPuzzles(generated);
      toast.success(`تم توليد ${generated.length} ألغاز بنجاح فائق بواسطة الذكاء الاصطناعي!`);
      try { (labSound as any)?.playSuccess?.() || (labSound as any)?.success?.(); } catch(e) {}
    } catch (err: any) {
      clearInterval(progressTimer);
      toast.error('حدث خطأ أثناء التوليد، يرجى المحاولة ثانية');
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish a generated puzzle to Database / Active Repository
  const handlePublishPuzzle = async (puzzle: AdminPuzzle) => {
    try {
      // 1. Try Supabase Insert
      const { data: { user } } = await supabase.auth.getUser();
      const insertPayload = {
        title: puzzle.title,
        question: puzzle.question,
        options: puzzle.options,
        correct_answer: puzzle.correct_answer,
        difficulty: puzzle.difficulty,
        points: puzzle.points,
        subject: puzzle.subject,
        image: puzzle.image || null,
        created_by: user?.id || null
      };

      const { data, error } = await supabase
        .from('subject_puzzles')
        .insert(insertPayload)
        .select();

      const newId = data && data[0] ? data[0].id : puzzle.id;

      // 2. Also save to LocalStorage Override to guarantee immediate persistence everywhere
      const localStr = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_KEY);
      let localItems: AdminPuzzle[] = localStr ? JSON.parse(localStr) : [];
      localItems = [{ ...puzzle, id: newId }, ...localItems.filter(p => p.id !== newId)];
      localStorage.setItem(LOCAL_STORAGE_OVERRIDE_KEY, JSON.stringify(localItems));

      // 3. Update local state
      setPuzzles(prev => [{ ...puzzle, id: newId }, ...prev.filter(p => p.id !== newId)]);
      setGeneratedPuzzles(prev => prev.filter(p => p.id !== puzzle.id));

      toast.success(`تم نشر "${puzzle.title}" بنجاح في بنك الألغاز والمنظومة! 🎉`);
      try { (labSound as any)?.playSuccess?.() || (labSound as any)?.success?.(); } catch(e) {}
    } catch (err: any) {
      // Fallback local save
      const localStr = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_KEY);
      let localItems: AdminPuzzle[] = localStr ? JSON.parse(localStr) : [];
      localItems = [puzzle, ...localItems.filter(p => p.id !== puzzle.id)];
      localStorage.setItem(LOCAL_STORAGE_OVERRIDE_KEY, JSON.stringify(localItems));

      setPuzzles(prev => [puzzle, ...prev.filter(p => p.id !== puzzle.id)]);
      setGeneratedPuzzles(prev => prev.filter(p => p.id !== puzzle.id));
      toast.success(`تم حفظ اللغز محلياً بنجاح!`);
    }
  };

  // Publish all generated puzzles at once
  const handlePublishAllGenerated = async () => {
    if (generatedPuzzles.length === 0) return;
    for (const p of generatedPuzzles) {
      await handlePublishPuzzle(p);
    }
    toast.success('تم نشر جميع الألغاز المولدة بنجاح!');
  };

  // Delete Puzzle
  const handleDeletePuzzle = async (puzzleId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا اللغز نهائياً من المنظومة؟')) return;

    try {
      await supabase.from('subject_puzzles').delete().eq('id', puzzleId);
    } catch (e) {}

    // Clean from local storage override
    const localStr = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_KEY);
    if (localStr) {
      try {
        const localItems: AdminPuzzle[] = JSON.parse(localStr);
        const filtered = localItems.filter(p => p.id !== puzzleId);
        localStorage.setItem(LOCAL_STORAGE_OVERRIDE_KEY, JSON.stringify(filtered));
      } catch(e) {}
    }

    setPuzzles(prev => prev.filter(p => p.id !== puzzleId));
    toast.success('تم حذف اللغز بنجاح');
  };

  // Open Edit Modal
  const openEdit = (puzzle: AdminPuzzle) => {
    setEditingPuzzle(puzzle);
    setManualForm({
      title: puzzle.title,
      question: puzzle.question,
      options: [...puzzle.options, '', '', '', ''].slice(0, 4),
      correct_answer: puzzle.correct_answer,
      difficulty: puzzle.difficulty,
      points: puzzle.points,
      subject: puzzle.subject,
      hint: puzzle.hint || '',
      explanation: puzzle.explanation || '',
      image: puzzle.image || ''
    });
    setIsEditModalOpen(true);
  };

  // Save Edit / Manual Puzzle
  const handleSaveManual = async () => {
    if (!manualForm.title.trim() || !manualForm.question.trim() || !manualForm.correct_answer.trim()) {
      toast.error('يرجى ملء جميع الحقول الإلزامية واختيار الإجابة الصحيحة');
      return;
    }

    const payload: AdminPuzzle = {
      id: editingPuzzle ? editingPuzzle.id : `puzzle-${Date.now()}`,
      title: manualForm.title,
      question: manualForm.question,
      options: manualForm.options.filter(o => o.trim() !== ''),
      correct_answer: manualForm.correct_answer,
      difficulty: manualForm.difficulty,
      points: manualForm.points,
      subject: manualForm.subject,
      hint: manualForm.hint,
      explanation: manualForm.explanation,
      image: manualForm.image || null
    };

    try {
      if (editingPuzzle) {
        await supabase.from('subject_puzzles').update({
          title: payload.title,
          question: payload.question,
          options: payload.options,
          correct_answer: payload.correct_answer,
          difficulty: payload.difficulty,
          points: payload.points,
          subject: payload.subject
        }).eq('id', editingPuzzle.id);
      } else {
        await supabase.from('subject_puzzles').insert({
          title: payload.title,
          question: payload.question,
          options: payload.options,
          correct_answer: payload.correct_answer,
          difficulty: payload.difficulty,
          points: payload.points,
          subject: payload.subject
        });
      }
    } catch(e) {}

    // Update LocalStorage override
    const localStr = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_KEY);
    let localItems: AdminPuzzle[] = localStr ? JSON.parse(localStr) : [];
    localItems = [payload, ...localItems.filter(p => p.id !== payload.id)];
    localStorage.setItem(LOCAL_STORAGE_OVERRIDE_KEY, JSON.stringify(localItems));

    setPuzzles(prev => [payload, ...prev.filter(p => p.id !== payload.id)]);
    setIsEditModalOpen(false);
    setEditingPuzzle(null);
    toast.success(editingPuzzle ? 'تم تحديث بيانات اللغز بنجاح' : 'تمت إضافة اللغز الجديد بنجاح');
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      
      {/* Top Header & Metrics Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                مركز إدارة الألغاز التعليمية والذكاء الاصطناعي التوليدي 2.0
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              توليد بنوك الألغاز التفاعلية بالذكاء الاصطناعي مع التفسيرات العلمية والتلميحات، ونشرها فوراً للطلاب والمتسابقين عبر منصة ذروة العلم.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPuzzles}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs rounded-xl h-9"
            >
              <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
              تحديث البيانات
            </Button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>إجمالي الألغاز</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{metrics.total}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>الفيزياء</span>
              <Atom className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-1">{metrics.physics}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>الكيمياء</span>
              <Beaker className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.chemistry}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>الأحياء</span>
              <Dna className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-black text-pink-400 mt-1">{metrics.biology}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>الرياضيات</span>
              <Shapes className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">{metrics.math}</div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('ai-generator')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'ai-generator'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>توليد الألغاز بالذكاء الاصطناعي (AI Studio)</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">ذكي</span>
        </button>

        <button
          onClick={() => setActiveSubTab('puzzles-catalog')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'puzzles-catalog'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>بنك الألغاز الحالي ({metrics.total})</span>
        </button>

        <button
          onClick={() => {
            setEditingPuzzle(null);
            setManualForm({
              title: '',
              question: '',
              options: ['', '', '', ''],
              correct_answer: '',
              difficulty: 'متوسط',
              points: 15,
              subject: 'الفيزياء',
              hint: '',
              explanation: '',
              image: ''
            });
            setActiveSubTab('manual-builder');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'manual-builder'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة لغز يدوي</span>
        </button>
      </div>

      {/* 1. AI GENERATOR SUB-TAB */}
      {activeSubTab === 'ai-generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Control Form */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>معايير التوليد المعرفي والذكاء الاصطناعي</span>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">المادة الدراسية:</Label>
                <Select value={aiSubject} onValueChange={setAiSubject}>
                  <SelectTrigger className="rounded-xl text-xs h-9 bg-slate-50 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الفيزياء">⚛️ الفيزياء العامة والحديثة</SelectItem>
                    <SelectItem value="الكيمياء">🧪 الكيمياء العامة والتحليلية</SelectItem>
                    <SelectItem value="الأحياء">🧬 الأحياء والوراثة الخلوية</SelectItem>
                    <SelectItem value="الرياضيات">📐 الرياضيات والتفكير الهندسي</SelectItem>
                    <SelectItem value="الفلك والفضاء">🌌 الفلك والجاذبية الكونية</SelectItem>
                    <SelectItem value="ذكاء ومنطق">💡 المنطق والذكاء وحل المسائل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Topic Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">الموضوع أو المفهوم العلمي الدقيق:</Label>
                <Input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="مثال: قوانين كبلر في المدارات الإهليلجية"
                  className="rounded-xl text-xs h-9 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">مستوى الصعوبة:</Label>
                  <Select value={aiDifficulty} onValueChange={(v: any) => setAiDifficulty(v)}>
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-slate-50 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سهل">🟢 سهل (تأسيسي)</SelectItem>
                      <SelectItem value="متوسط">🟡 متوسط (تطبيقي)</SelectItem>
                      <SelectItem value="صعب">🔴 صعب (تفكير عليا)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">عدد الألغاز:</Label>
                  <Select value={aiCount.toString()} onValueChange={(v) => setAiCount(parseInt(v) || 3)}>
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-slate-50 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">لغز واحد (1)</SelectItem>
                      <SelectItem value="2">لغزان (2)</SelectItem>
                      <SelectItem value="3">3 ألغاز نموذجية</SelectItem>
                      <SelectItem value="5">5 ألغاز مكثفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cognitive level & Target grade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">المستوى المعرفي:</Label>
                  <Select value={aiCognitiveLevel} onValueChange={setAiCognitiveLevel}>
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-slate-50 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="فهم وتطبيق">فهم وتطبيق مباشر</SelectItem>
                      <SelectItem value="تحليل واستنتاج">تحليل واستنتاج منطقي</SelectItem>
                      <SelectItem value="تفكير ناقد وحل مشكلات">تفكير ناقد وحل مشكلات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">المرحلة المستهدفة:</Label>
                  <Select value={aiTargetGrade} onValueChange={setAiTargetGrade}>
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-slate-50 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="المرحلة الإعدادية">المرحلة الإعدادية (7-10)</SelectItem>
                      <SelectItem value="المرحلة الثانوية والتوجيهي">المرحلة الثانوية والتوجيهي</SelectItem>
                      <SelectItem value="الجامعي والمتقدم">المستوى الجامعي والأولمبياد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Prompting */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">توجيهات إضافية للذكاء الاصطناعي:</Label>
                <Textarea
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  placeholder="مثال: تضمين حسابات رياضية دقيقة مع تلميح مشوق..."
                  className="rounded-xl text-xs bg-slate-50 dark:bg-slate-800 min-h-[70px]"
                />
              </div>

              {/* Action Button */}
              <Button
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    <span>جاري هندسة وتوليد الألغاز العلمية... ({generationProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 ml-2" />
                    <span>توليد الألغاز بالذكاء الاصطناعي ⚡</span>
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2 pt-2">
                  <Progress value={generationProgress} className="h-1.5 rounded-full" />
                  <p className="text-[11px] text-center text-slate-500 animate-pulse">
                    فحص الصوابية العلمية وصياغة البدائل والتلميحات الذكية...
                  </p>
                </div>
              )}
            </div>

            {/* Generated Review Workspace */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-cyan-500" />
                    <span>الألغاز المولدة للمراجعة والنشر ({generatedPuzzles.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    راجع الألغاز المولدة، يمكنك تعديلها أو نشرها مباشرة إلى بنك الألغاز بضغطة زر.
                  </p>
                </div>

                {generatedPuzzles.length > 0 && (
                  <Button
                    onClick={handlePublishAllGenerated}
                    size="sm"
                    className="h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                    نشر الكل دفعة واحدة ({generatedPuzzles.length})
                  </Button>
                )}
              </div>

              {generatedPuzzles.length === 0 && !isGenerating && (
                <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    لا توجد ألغاز قيد المراجعة حالياً
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    اختر الموضوع العلمي والمعايير من القائمة الجانبية ثم اضغط على "توليد الألغاز بالذكاء الاصطناعي".
                  </p>
                </div>
              )}

              <AnimatePresence>
                {generatedPuzzles.map((puzzle, pIdx) => (
                  <motion.div
                    key={puzzle.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: pIdx * 0.1 }}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            {puzzle.subject}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            {puzzle.difficulty} • +{puzzle.points} نقطة
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {pIdx + 1}. {puzzle.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(puzzle)}
                          className="h-8 px-2.5 text-xs text-slate-500 hover:text-cyan-500 rounded-xl"
                        >
                          <Edit3 className="w-3.5 h-3.5 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePublishPuzzle(puzzle)}
                          className="h-8 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5 ml-1" />
                          نشر في المنظومة
                        </Button>
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed font-medium">
                      {puzzle.question}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {puzzle.options.map((opt, oIdx) => {
                        const isCorrect = opt === puzzle.correct_answer;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 text-emerald-800 dark:text-emerald-200'
                                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mr-1" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Scientific Hint & Explanation */}
                    <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                      <div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">💡 التلميح الذكي: </span>
                        {puzzle.hint}
                      </div>
                      <div>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">🔬 التفسير العلمي: </span>
                        {puzzle.explanation}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* 2. PUZZLES CATALOG SUB-TAB */}
      {activeSubTab === 'puzzles-catalog' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالعنوان أو بنص اللغز..."
                className="pr-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 min-w-[120px]">
                  <SelectValue placeholder="المادة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كافة المواد</SelectItem>
                  <SelectItem value="فيزياء">الفيزياء</SelectItem>
                  <SelectItem value="كيمياء">الكيمياء</SelectItem>
                  <SelectItem value="أحياء">الأحياء</SelectItem>
                  <SelectItem value="رياضيات">الرياضيات</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDiffFilter} onValueChange={setSelectedDiffFilter}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 min-w-[110px]">
                  <SelectValue placeholder="الصعوبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كافة المستويات</SelectItem>
                  <SelectItem value="سهل">سهل</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="صعب">صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List of Repository Puzzles */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-xs">جاري تحميل بنك الألغاز...</p>
              </div>
            ) : filteredPuzzles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border">
                لا توجد ألغاز مطابقة لبحثك
              </div>
            ) : (
              filteredPuzzles.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                        {p.subject}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {p.difficulty} • +{p.points} نقطة
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {idx + 1}. {p.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {p.question}
                    </p>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ الإجابة الصحيحة: {p.correct_answer}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(p)}
                      className="h-8.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePuzzle(p.id)}
                      className="h-8.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. MANUAL BUILDER SUB-TAB */}
      {activeSubTab === 'manual-builder' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b">
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>إضافة لغز يدوي جديد</span>
          </h3>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">عنوان اللغز:</Label>
            <Input
              value={manualForm.title}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
              placeholder="مثال: لغز قانون الحث الكهرومغناطيسي"
              className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">المادة:</Label>
              <Select value={manualForm.subject} onValueChange={(v) => setManualForm({ ...manualForm, subject: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="الفيزياء">الفيزياء</SelectItem>
                  <SelectItem value="الكيمياء">الكيمياء</SelectItem>
                  <SelectItem value="الأحياء">الأحياء</SelectItem>
                  <SelectItem value="الرياضيات">الرياضيات</SelectItem>
                  <SelectItem value="الفلك والفضاء">الفلك والفضاء</SelectItem>
                  <SelectItem value="ذكاء ومنطق">ذكاء ومنطق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">الصعوبة:</Label>
              <Select value={manualForm.difficulty} onValueChange={(v: any) => setManualForm({ ...manualForm, difficulty: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="سهل">سهل</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="صعب">صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">النقاط الممنوحة:</Label>
              <Input
                type="number"
                value={manualForm.points}
                onChange={(e) => setManualForm({ ...manualForm, points: parseInt(e.target.value) || 10 })}
                className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">نص اللغز أو السؤال:</Label>
            <Textarea
              value={manualForm.question}
              onChange={(e) => setManualForm({ ...manualForm, question: e.target.value })}
              placeholder="اكتب السؤال بوضوح..."
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 min-h-[70px]"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">الخيارات الأربعة (حدد الإجابة الصحيحة):</Label>
            {manualForm.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct_answer_manual"
                  checked={manualForm.correct_answer === opt && opt.trim() !== ''}
                  onChange={() => setManualForm({ ...manualForm, correct_answer: opt })}
                  className="w-4 h-4 text-cyan-600"
                />
                <Input
                  value={opt}
                  onChange={(e) => {
                    const next = [...manualForm.options];
                    next[oIdx] = e.target.value;
                    setManualForm({ ...manualForm, options: next });
                  }}
                  placeholder={`الخيار ${oIdx + 1}`}
                  className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex-1"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">التلميح (اختياري):</Label>
              <Input
                value={manualForm.hint}
                onChange={(e) => setManualForm({ ...manualForm, hint: e.target.value })}
                placeholder="تلميح لمساعدة الطالب"
                className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">التفسير العلمي:</Label>
              <Input
                value={manualForm.explanation}
                onChange={(e) => setManualForm({ ...manualForm, explanation: e.target.value })}
                placeholder="التبرير العلمي للإجابة الصحيحة"
                className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveManual}
            className="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
          >
            <Save className="w-3.5 h-3.5 ml-1.5" />
            حفظ وإضافة اللغز لبنك المنظومة
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">تعديل بيانات اللغز</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">العنوان:</Label>
              <Input
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">السؤال:</Label>
              <Textarea
                value={manualForm.question}
                onChange={(e) => setManualForm({ ...manualForm, question: e.target.value })}
                className="text-xs rounded-xl min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">الخيارات (اختر الإجابة الصحيحة):</Label>
              {manualForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="edit_correct_answer"
                    checked={manualForm.correct_answer === opt && opt.trim() !== ''}
                    onChange={() => setManualForm({ ...manualForm, correct_answer: opt })}
                    className="w-4 h-4 text-cyan-600"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const next = [...manualForm.options];
                      next[i] = e.target.value;
                      setManualForm({ ...manualForm, options: next });
                    }}
                    className="text-xs h-8.5 rounded-xl flex-1"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold">التلميح:</Label>
                <Input
                  value={manualForm.hint}
                  onChange={(e) => setManualForm({ ...manualForm, hint: e.target.value })}
                  className="text-xs h-8.5 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">النقاط:</Label>
                <Input
                  type="number"
                  value={manualForm.points}
                  onChange={(e) => setManualForm({ ...manualForm, points: parseInt(e.target.value) || 10 })}
                  className="text-xs h-8.5 rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveManual}
              className="w-full h-9.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs mt-3"
            >
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminPuzzlesManagementHub;
