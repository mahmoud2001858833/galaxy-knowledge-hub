import React from 'react';
import { motion } from 'framer-motion';
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Cpu,
  Telescope,
  Flame,
  Waves,
  Magnet,
  Radio,
  Microscope,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const DocsSimulationsTab: React.FC = () => {
  const navigate = useNavigate();

  const simulationCategories = [
    {
      title: 'مختبرات الفيزياء والميكانيكا والكم (18 مختبراً)',
      icon: Atom,
      color: 'blue',
      items: [
        { name: 'محاكي مصادم الهادرونات الكبير (LHC)', desc: 'تسريع البروتونات لسرعة 0.99c ورسم مسارات اصطدام وتخليق الجسيمات.', ops: 45 },
        { name: 'محاكي قطرة الزيت لميليكان (Millikan)', desc: 'موازنة قوى الجاذبية والمجال الكهربائي لحساب الشحنة الأولية للإلكترون.', ops: 30 },
        { name: 'مختبر حركة المقذوفات 3D', desc: 'محاكاة الزوايا، مقاومة الهواء، حساب المدى الأفقي وأقصى ارتفاع بيئياً.', ops: 40 },
        { name: 'مختبر تشتت رذرفورد لجسيمات ألفا', desc: 'إطلاق جسيمات ألفا على صفيحة الذهب وتتبع زوايا التشتت النفاثة.', ops: 28 },
        { name: 'محاكي الديناميكا الحرارية ثلاثي الأبعاد', desc: 'دورات كارنو، ضغط وحرارة الغاز المثالي وتوليد الرسوم البيانية P-V.', ops: 35 },
        { name: 'محاكي الموجات وتداخل الشقين ليونغ', desc: 'دراسة أنماط الحيود، التداخل البناء والهدام، ومعادلات الطول الموجي.', ops: 32 }
      ]
    },
    {
      title: 'مختبرات الكيمياء والبيولوجيا الجزيئية (11 مختبراً)',
      icon: FlaskConical,
      color: 'emerald',
      items: [
        { name: 'الجدول الدوري الذكي (118 عنصراً)', desc: 'استعراض التوزيع الإلكتروني، نصف القطر الذري، وطاقات التأين مع 3D Models.', ops: 55 },
        { name: 'مختبر تعديل الجينات CRISPR-Cas9', desc: 'تصميم دليل RNA وقص السلاسل الوراثية الطافرة واستبدالها في الخلية الحية.', ops: 38 },
        { name: 'محاكي الاتزان الكيميائي ومبدأ لوشاتيليه', desc: 'تغيير الضغط والحرارة ورصد استجابة ثوابت الاتزان الديناميكي لحظياً.', ops: 42 },
        { name: 'محاكي خلايا التحليل الكهربائي والجلفنة', desc: 'تفاعلات الأكسدة والاختزال عند المصعد والمهبط وحساب القوة الدافعة الكهربائية.', ops: 36 }
      ]
    },
    {
      title: 'مختبرات الفلك والميكانيكا المدارية (8 مختبرات)',
      icon: Telescope,
      color: 'amber',
      items: [
        { name: 'المجموعة الشمسية والمدارات ثلاثية الأبعاد', desc: 'تتبع كواكب المنظومة وسرعاتها المدارية وفق إحداثيات NASA JPL الحقيقية.', ops: 48 },
        { name: 'محاكي إشعاع الجسم الأسود الكوني', desc: 'منحنيات بلانك، قانون فين للإزاحة، وتطبيقات قياس حرارة النجوم البعيدة.', ops: 32 },
        { name: 'مختبر الميكانيكا المدارية لمركبات الفضاء', desc: 'مناورات هوهمان الانتقالية، سرعة الهروب الجذبي، ونقاط لاغرانج المتزنة.', ops: 35 }
      ]
    },
    {
      title: 'مختبرات الروبوتات والرياضيات والدوائر (8 مختبرات)',
      icon: Cpu,
      color: 'purple',
      items: [
        { name: 'محاكي حركيات الذراع الروبوتية (Kinematics)', desc: 'حل معادلات الحركيات المباشرة والعكسية ثلاثية الأبعاد وضبط المحركات المؤازرة.', ops: 44 },
        { name: 'محاكي رادار ومستشعر LiDAR 360°', desc: 'مسح العوائق بأشعة الليزر وبناء الخرائط الإشغالية للروبوت المتنقل الذاتي.', ops: 40 },
        { name: 'مختبر دوائر Wokwi المدمجة والـ Breadboard', desc: 'محاكاة دوائر ESP32 و Arduino والحساسات دون الحاجة لشراء عتاد حقيقي.', ops: 50 },
        { name: 'محاكي متسلسلات فورييه التفاعلي', desc: 'توليد النغمات وتفكيك الإشارات المعقدة إلى توافقيات جيبية ناعمة.', ops: 35 }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-blue-900/10 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-teal-950/30 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
            <Microscope className="w-3.5 h-3.5 ml-1 text-emerald-500" />
            الموسوعة العلمية الشاملة
          </Badge>
          <span className="text-xs text-slate-500 font-mono">45+ Fully Interactive Scientific Labs</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          45 مختبراً علمياً تفاعلياً لمحاكاة الفيزياء، الكيمياء، الفلك، والروبوتات
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          تعتمد مختبراتنا على محركات فيزيائية دقيقة تحسب القوى والمسارات في الوقت الحقيقي بمعدل 60 إطاراً في الثانية، مما يحول المعادلات المجردة إلى تجارب حسية ملموسة تمكّن الطالب من استيعاب المفاهيم الأكثر تعقيداً.
        </p>

        <div className="pt-2">
          <Button
            onClick={() => navigate('/simulations')}
            className="rounded-2xl text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <span>استعراض مركز المحاكيات العلمية التفاعلي</span>
            <ExternalLink className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </div>

      {/* Grid of Simulation Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {simulationCategories.map((cat, idx) => {
          const Icon = cat.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    {cat.title}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {item.ops} عملية حسابية
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
