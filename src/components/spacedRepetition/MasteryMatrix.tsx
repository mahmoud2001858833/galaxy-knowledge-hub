import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Atom, 
  FlaskConical, 
  Dna, 
  Calculator, 
  Cpu, 
  BookMarked, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  Target,
  BarChart2,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface MasteryDomain {
  id: string;
  name: string;
  icon: any;
  color: string;
  badge: string;
  totalTopics: number;
  masteredTopics: number;
  retentionScore: number;
  lastReviewDate: string;
  nextOptimalReview: string;
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  keyTopics: { title: string; retention: number; status: 'stellar' | 'good' | 'needs_review' }[];
}

const DOMAINS: MasteryDomain[] = [
  {
    id: 'physics',
    name: 'الفيزياء المتقدمة (Physics)',
    icon: Atom,
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400',
    badge: 'توجيهي علمي + دولي',
    totalTopics: 18,
    masteredTopics: 16,
    retentionScore: 95.4,
    lastReviewDate: 'اليوم، 10:30 ص',
    nextOptimalReview: 'بعد 3 أيام (+3d)',
    difficultyBreakdown: { easy: 5, medium: 8, hard: 5 },
    keyTopics: [
      { title: 'الزخم الخطي والتصادمات ثنائية البعد', retention: 98, status: 'stellar' },
      { title: 'المجال المغناطيسي وقاعدة اليد اليمنى', retention: 94, status: 'stellar' },
      { title: 'الحث الكهرومغناطيسي وقانون فاراداي ولينز', retention: 91, status: 'good' },
      { title: 'فيزياء الكم والظاهرة الكهروضوئية', retention: 96, status: 'stellar' },
      { title: 'النموذج النووي وطاقة الربط لكل نيوكليون', retention: 84, status: 'needs_review' },
    ]
  },
  {
    id: 'chemistry',
    name: 'الكيمياء العامة والعضوية (Chemistry)',
    icon: FlaskConical,
    color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-400',
    badge: 'منهاج وزاري معتمد',
    totalTopics: 16,
    masteredTopics: 14,
    retentionScore: 92.8,
    lastReviewDate: 'أمس، 04:15 م',
    nextOptimalReview: 'غداً (+1d)',
    difficultyBreakdown: { easy: 4, medium: 7, hard: 5 },
    keyTopics: [
      { title: 'سرعة التفاعل ورتب التفاعل الكيميائي', retention: 93, status: 'stellar' },
      { title: 'الاتزان الكيميائي ومبدأ لوشاتيليه', retention: 95, status: 'stellar' },
      { title: 'محاليل الحموض والقواعد ومحاليل التخفيف', retention: 89, status: 'good' },
      { title: 'الخلايا الجلفانية وجهد الخلية المعياري', retention: 92, status: 'stellar' },
      { title: 'المركبات العضوية وتفاعلات الاستبدال والإضافة', retention: 82, status: 'needs_review' },
    ]
  },
  {
    id: 'biology',
    name: 'العلوم الحياتية والوراثة (Biology)',
    icon: Dna,
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-400',
    badge: 'علم الوراثة والبيولوجيا الخلوية',
    totalTopics: 14,
    masteredTopics: 13,
    retentionScore: 96.2,
    lastReviewDate: 'قبل يومين',
    nextOptimalReview: 'بعد 6 أيام (+6d)',
    difficultyBreakdown: { easy: 6, medium: 5, hard: 3 },
    keyTopics: [
      { title: 'تضاعف الحمض النووي DNA وإنزيم بلمرة DNA', retention: 99, status: 'stellar' },
      { title: 'التنفس الخلوي ودورة كريبس وسلسلة نقل الإلكترون', retention: 94, status: 'stellar' },
      { title: 'الوراثة المندلية ومخططات السلالة الجينية', retention: 96, status: 'stellar' },
      { title: 'السيادة المشتركة والجينات المرتبطة بالجنس', retention: 91, status: 'good' },
      { title: 'التكنولوجيا الحيوية وهندسة الجينات', retention: 97, status: 'stellar' },
    ]
  },
  {
    id: 'math',
    name: 'الرياضيات المتقدمة (Calculus & Vectors)',
    icon: Calculator,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    badge: 'التحليل الرياضي والتفاضل',
    totalTopics: 20,
    masteredTopics: 17,
    retentionScore: 90.5,
    lastReviewDate: 'اليوم، 08:00 ص',
    nextOptimalReview: 'اليوم مساءً',
    difficultyBreakdown: { easy: 4, medium: 9, hard: 7 },
    keyTopics: [
      { title: 'قواعد الاشتقاق والاشتقاق الضمني', retention: 97, status: 'stellar' },
      { title: 'المعدلات المرتبطة بالزمن وتطبيقات القيم القصوى', retention: 86, status: 'good' },
      { title: 'التكامل بالتعويض وبالأجزاء والكسور الجزئية', retention: 88, status: 'good' },
      { title: 'حساب المساحات والحجوم الدورانية', retention: 92, status: 'stellar' },
      { title: 'المتجهات في الفضاء ثلاثي الأبعاد والضرب القياسي', retention: 79, status: 'needs_review' },
    ]
  },
  {
    id: 'cs',
    name: 'علم الحاسوب والذكاء الاصطناعي (CS & AI)',
    icon: Cpu,
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400',
    badge: 'خوارزميات وهياكل بيانات',
    totalTopics: 12,
    masteredTopics: 12,
    retentionScore: 97.8,
    lastReviewDate: 'أمس، 02:00 م',
    nextOptimalReview: 'بعد 10 أيام (+10d)',
    difficultyBreakdown: { easy: 5, medium: 5, hard: 2 },
    keyTopics: [
      { title: 'البحث في الأشجار الثنائية Binary Search Trees', retention: 99, status: 'stellar' },
      { title: 'خوارزميات الترتيب السريع والدمج Quick & Merge Sort', retention: 96, status: 'stellar' },
      { title: 'أنظمة التشفير بمفتاح عام RSA وتشفير الهاش', retention: 95, status: 'stellar' },
      { title: 'مبادئ الشبكات العصبية والانحدار الخطي', retention: 98, status: 'stellar' },
    ]
  },
  {
    id: 'languages',
    name: 'البلاغة وقواعد اللغات (Languages & Logic)',
    icon: BookMarked,
    color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40 text-sky-400',
    badge: 'اللغة العربية والإنجليزية',
    totalTopics: 15,
    masteredTopics: 14,
    retentionScore: 93.6,
    lastReviewDate: 'قبل 3 أيام',
    nextOptimalReview: 'بعد 5 أيام (+5d)',
    difficultyBreakdown: { easy: 6, medium: 6, hard: 3 },
    keyTopics: [
      { title: 'علم البديع: الجناس والطباق والمقابلة', retention: 95, status: 'stellar' },
      { title: 'الإعلال والإبدال وأوزان المشتقات', retention: 88, status: 'good' },
      { title: 'قواعد النحو المتقدمة: البدل والاستثناء والتمييز', retention: 92, status: 'stellar' },
      { title: 'English Conditionals & Reported Speech', retention: 97, status: 'stellar' },
    ]
  },
];

interface MasteryMatrixProps {
  onSelectTopicForReview?: (topicName: string, subject: string) => void;
}

export const MasteryMatrix: React.FC<MasteryMatrixProps> = ({ onSelectTopicForReview }) => {
  const [selectedDomain, setSelectedDomain] = useState<MasteryDomain>(DOMAINS[0]);
  const [filterQuery, setFilterQuery] = useState('');

  const handleStartDomainReview = (domain: MasteryDomain) => {
    toast.success(`تم تجهيز مراجعة مركزة لمبحث: ${domain.name} بأعلى دقة SM-2!`);
    if (onSelectTopicForReview && domain.keyTopics[0]) {
      onSelectTopicForReview(domain.keyTopics[0].title, domain.name);
    }
  };

  const filteredDomains = DOMAINS.filter(d => 
    d.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    d.keyTopics.some(t => t.title.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const averageOverallScore = (
    DOMAINS.reduce((acc, curr) => acc + curr.retentionScore, 0) / DOMAINS.length
  ).toFixed(1);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                مصفوفة الإتقان الأكاديمي الشاملة (Academic Mastery Matrix)
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              تحليل عميق لمستوى نضج الذاكرة طويلة المدى لكل مبحث وزاري وعلمي، مع قياس دقيق لمقاومة النسيان
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-2xl text-center min-w-[120px]">
              <span className="text-[11px] text-cyan-300 block font-semibold">معدل الإتقان العام</span>
              <span className="text-2xl font-black text-cyan-400">{averageOverallScore}%</span>
            </div>
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-center min-w-[120px]">
              <span className="text-[11px] text-emerald-300 block font-semibold">مواضيع قيد التثبيت</span>
              <span className="text-2xl font-black text-emerald-400">95 موضوعاً</span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selectedDomain.id === domain.id;

          return (
            <motion.div
              key={domain.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedDomain(domain)}
              className={`p-5 rounded-3xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${domain.color} bg-slate-950/60`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{domain.name}</h3>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 mt-0.5">
                      {domain.badge}
                    </Badge>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-cyan-400">{domain.retentionScore}%</span>
                  <span className="text-[10px] text-slate-500 block">ثبات الذاكرة</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>تم إتقان {domain.masteredTopics} من أصل {domain.totalTopics} درساً</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {Math.round((domain.masteredTopics / domain.totalTopics) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(domain.masteredTopics / domain.totalTopics) * 100} 
                  className="h-2 bg-slate-800"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">المراجعة المثالية: <strong className="text-slate-300">{domain.nextOptimalReview}</strong></span>
                <span className="text-cyan-400 text-xs font-semibold flex items-center gap-1 group-hover:underline">
                  التفاصيل
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Domain Deep-Dive Workspace */}
      {selectedDomain && (
        <motion.div
          key={selectedDomain.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-cyan-500/30 space-y-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-3.5 rounded-2xl border ${selectedDomain.color} bg-slate-950`}>
                {React.createElement(selectedDomain.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">{selectedDomain.name}</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs">
                    {selectedDomain.retentionScore}% استبقاء
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  آخر جلسة مراجعة مكتملة: {selectedDomain.lastReviewDate} • موعد التكرار المحسوب: {selectedDomain.nextOptimalReview}
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleStartDomainReview(selectedDomain)}
              className="rounded-2xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/25 px-5"
            >
              <Target className="w-4 h-4" />
              <span>بدء مراجعة مركزة لهذه الوحدة</span>
            </Button>
          </div>

          {/* Topics List with Retention Heat */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>المفاهيم والدروس المحورية في هذا المبحث</span>
              <span>درجة مناعة الذاكرة ضد النسيان (Retention Rate)</span>
            </div>

            <div className="grid gap-2.5">
              {selectedDomain.keyTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {topic.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 sm:w-36 hidden sm:block">
                      <Progress 
                        value={topic.retention} 
                        className={`h-2 ${
                          topic.retention >= 95 
                            ? 'bg-emerald-950' 
                            : topic.retention >= 88 
                            ? 'bg-cyan-950' 
                            : 'bg-amber-950'
                        }`}
                      />
                    </div>
                    
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      topic.retention >= 95
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : topic.retention >= 88
                        ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}>
                      {topic.retention}%
                    </span>

                    {topic.status === 'stellar' ? (
                      <span className="text-[11px] text-emerald-400 hidden md:flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        راسخ في الذاكرة
                      </span>
                    ) : topic.status === 'needs_review' ? (
                      <span className="text-[11px] text-amber-400 hidden md:flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        موصى بمراجعته اليوم
                      </span>
                    ) : (
                      <span className="text-[11px] text-cyan-400 hidden md:flex items-center gap-1 font-medium">
                        <TrendingUp className="w-3.5 h-3.5" />
                        في مسار التعزيز
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MasteryMatrix;
