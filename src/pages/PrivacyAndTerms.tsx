import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { 
  Shield, Lock, FileText, CheckCircle2, Eye, Server, 
  HeartHandshake, AlertCircle, ArrowLeft, Printer, Download,
  Scale, UserCheck, BookOpen, Sparkles, Building2, HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const PrivacyAndTerms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white font-sans transition-colors duration-300" dir="rtl">
      <StarField starCount={60} speed={0.06} />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
            <Shield className="w-4 h-4" />
            <span>الوثيقة الرسمية للسياسات والمعايير القانونية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            الخصوصية والشروط والأحكام الأكاديمية
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            تلتزم منصة ذروة العلم بأعلى معايير حماية خصوصية الطلبة والمعلمين، والامتثال لقانون حماية البيانات الشخصية الأردني لسنة 2023 والمعايير الدولية للنفاذ الرقمي.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="text-xs text-slate-400 font-mono">
              تاريخ الاعتماد والتحديث: سبتمبر 2026 • الإصدار 2.4
            </span>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الوثيقة الرسمية</span>
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700 flex items-center gap-2 max-w-md w-full">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>سياسة الخصوصية وحماية البيانات</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>شروط الاستخدام والحقوق الأكاديمية</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          {activeTab === 'privacy' ? (
            /* =================== PRIVACY POLICY =================== */
            <div className="space-y-8">
              {/* Section 1: Introduction */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Shield className="w-5 h-5" />
                  </span>
                  <h2>1. التزامنا بحماية الخصوصية والبيانات</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  تعتبر منصة <strong>ذروة العلم</strong> خصوصية الطلبة، والمعلمين، والكوادر الإدارية، وأولياء الأمور أولوية سيادية وأخلاقية مطلقة. تُحدد هذه السياسة كيفية التعامل مع البيانات التي يتم جمعها واستخدامها وحمايتها، بما يتطابق تماماً مع التشريعات الأردنية النافذة، بما في ذلك <em>قانون حماية البيانات الشخصية الأردني لسنة 2023</em> والسياسات الصادرة عن وزارة الاقتصاد الرقمي والريادة ووزارة التربية والتعليم.
                </p>
              </div>

              {/* Section 2: Damij & Camera Privacy (Crucial) */}
              <div className="p-5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-base">
                  <HeartHandshake className="w-5 h-5" />
                  <h3>2. خصوصية تقنيات مشروع «دامج» والكاميرا (On-Device AI)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  في مشروع دامج الوطني للتربية الخاصة (مترجم لغة الإشارة، التعرف على المشاعر، والكاميرا التكيفية):
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mr-4 list-disc">
                  <li>
                    <strong>المعالجة اللحظية على جهاز المستخدم (Edge Processing):</strong> تعمل خوارزميات الرؤية الحاسوبية ونماذج TensorFlow.js بالكامل داخل متصفح المستخدم دون نقل أي بث فيديو، أو صور للوجه، أو صور للأيدي إلى أي خوادم خارجية.
                  </li>
                  <li>
                    <strong>انعدام التسجيل أو التخزين:</strong> لا تحتفظ المنصة بأي لقطات فيديو أو صور مسجلة للمستخدمين أثناء استخدام مترجم لغة الإشارة إطلاقاً.
                  </li>
                  <li>
                    <strong>أداة المساعد الطبي المدرسي:</strong> الفحوصات والإرشادات الطبية هي أدوات إرشادية وتدريبية إسعافية فقط ولا يتم تداول أي سجلات صحية لأغراض تجارية أو تأمينية.
                  </li>
                </ul>
              </div>

              {/* Section 3: Collected Data */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Server className="w-5 h-5" />
                  </span>
                  <h2>3. البيانات التي نجمعها والأغراض الأكاديمية</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  نحن نجمع فقط الحد الأدنى اللازم لتقديم تجربة تعليمية مخصصة وعادلة:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">البيانات التعريفية والتعليمية:</span>
                    الاسم، البريد الإلكتروني، المدرسة، المرحلة والصف الدراسي، والمحافظة، لعرض التقدم الأكاديمي ولوحة متصدري المحافظات.
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">بيانات الإنجاز والمحاكاة:</span>
                    الدرجات في دوري الألغاز، عدد المختبرات ثلاثية الأبعاد المنجزة، وساعات التفاعل، لحساب الرتبة والأوسمة الأكاديمية.
                  </div>
                </div>
              </div>

              {/* Section 4: Data Sharing & Commercial Prohibition */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Lock className="w-5 h-5" />
                  </span>
                  <h2>4. حظر البيع أو المشاركة التجارية للبيانات</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>لا نقوم ولن نقوم أبداً ببيع، أو تأجير، أو مقايضة بيانات الطلاب أو المعلمين</strong> مع أي شركات إعلانية، تسويقية، أو جهات تجارية أياً كانت. يتم تشفير جميع قنوات الاتصال والبيانات بواسطة تقنيات تشفير عسكرية <strong>TLS 1.3 / AES-256</strong>.
                </p>
              </div>

              {/* Section 5: User Rights & Deletion */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <UserCheck className="w-5 h-5" />
                  </span>
                  <h2>5. حقوقك في تعديل وحذف بياناتك</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  يحق لكل طالب، معلم، أو ولي أمر:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mr-4 list-disc">
                  <li>الاطلاع على كافة البيانات المخزنة وتعديلها من خلال صفحة الملف الشخصي.</li>
                  <li>طلب تصدير نسخة من سجله الأكاديمي والإنجازات في صيغة قابلة للقراءة.</li>
                  <li>طلب حذف الحساب وجميع البيانات المرتبطة به نهائياً وبلا رجعة عبر التواصل مع الإدارة.</li>
                </ul>
              </div>
            </div>
          ) : (
            /* =================== TERMS OF SERVICE =================== */
            <div className="space-y-8">
              {/* Terms Section 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <h2>1. الموافقة على شروط الاستخدام الأكاديمي</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  باستخدامك لمنصة <strong>ذروة العلم</strong> أو أي من مختبراتها الافتراضية، وأدوات الذكاء الاصطناعي، ومشاريعها الملحقة، فإنك تقر وتوافق على الالتزام الكامل بهذه الشروط والأحكام. إذا كنت قاصراً دون سن 18 عاماً، يُفترض أنك حصلت على موافقة ولي الأمر أو المدرسة الراعية.
                </p>
              </div>

              {/* Terms Section 2: Intellectual Property */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <h2>2. الملكية الفكرية للمختبرات والمحاكاة 3D</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  كافة الأصول البرمجية، والمحاكيات ثلاثية الأبعاد، والرسوم الهندسية، والمحركات الفيزيائية والكيميائية، ومسارات مشروع دامج، والألغاز العلمية، ونصوص التوثيق المنشورة على المنظومة هي ملكية فكرية حصرية محمية بموجب قوانين الملكية الفكرية والعلامات التجارية الأردنية والدولية.
                </p>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold block">الاستخدام المسموح:</span>
                  يُسمح بالاستخدام للأغراض التعليمية، والمدرسية، والجامعية، والبحثية غير التجارية دون مقابل. يُحظر تماماً تفكيك، أو إعادة بيع، أو استغلال أي جزء من الشيفرات البرمجية أو المختبرات لأغراض تجارية دون إذن خطي من المشرف العام.
                </div>
              </div>

              {/* Terms Section 3: Community Guidelines */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <h2>3. قواعد السلوك الأكاديمي والنزاهة</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  يجب على جميع المستخدمين الالتزام ببيئة تفاعلية آمنة ومحترمة:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mr-4 list-disc">
                  <li>النزاهة التامة في حل الألغاز وتجنب أي محاولات تلاعب أو اختراق لأنظمة النقاط.</li>
                  <li>الامتناع عن نشر أي محتوى مسيء، غير لائق، أو تنمر إلكتروني في غرف الدردشة ومنتديات الطلبة.</li>
                  <li>المحافظة على سرية بيانات تسجيل الدخول وعدم مشاركة الحسابات الإدارية المحمية.</li>
                </ul>
              </div>

              {/* Terms Section 4: Limitation of Liability */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </span>
                  <h2>4. إخلاء المسؤولية التعليمية والمخبرية</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  صُممت المختبرات الافتراضية لأغراض المحاكاة والتعليم التفاعلي. ورغم معايرتها الرياضية الدقيقة وفق المعايير العالمية (99.8%)، إلا أنها لا تغني عن إجراءات السلامة المخبرية في المختبرات الحقيقية عند التعامل مع المواد الكيميائية الخطرة أو الإشعاع. كما أن أدوات المساعد الطبي هي أدوات توعية إسعافية أولية ولا تعد بديلاً عن التدخل الطبي المتخصص.
                </p>
              </div>
            </div>
          )}

          {/* Contact Officer Info */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                مسؤول حماية البيانات والامتثال القانوني:
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                لأي استفسارات قانونية أو ممارسة لحقوق الخصوصية: <a href="mailto:jowmahmoud6@gmail.com" className="font-mono text-cyan-600 dark:text-cyan-400 font-bold hover:underline" dir="ltr">jowmahmoud6@gmail.com</a>
              </p>
            </div>

            <Link to="/contact">
              <Button size="sm" className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs gap-1.5 shrink-0">
                <span>تواصل مع الإدارة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyAndTerms;
