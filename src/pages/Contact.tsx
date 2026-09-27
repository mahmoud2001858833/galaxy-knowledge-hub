import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import ContactForm from '@/components/contact/ContactForm';
import { 
  Mail, Phone, MapPin, Sparkles, MessageSquare, ShieldCheck, 
  HelpCircle, ChevronDown, ChevronUp, Atom, HeartHandshake, School, 
  ExternalLink, Clock, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const Contact: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    document.title = 'تواصل معنا - منصة ذروة العلم';
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email?.toLowerCase() === 'jowmahmoud6@gmail.com') {
        setIsSuperAdmin(true);
      }
    });
  }, []);

  const faqs = [
    {
      q: 'هل استخدام منصة ذروة العلم والمختبرات الافتراضية مجاني لطلبة المدارس؟',
      a: 'نعم، المنظومة متاحة لكافة طلبة ومعلمي المملكة للاستخدام الأكاديمي، بما يشمل كافة المختبرات ثلاثية الأبعاد (49 مختبراً)، دوري الألغاز، والمرشد الذكي.'
    },
    {
      q: 'كيف يمكن لمدارس المملكة اعتماد المنظومة في مختبراتها المدرسية؟',
      a: 'يمكن لإدارات المدارس التواصل مباشرة عبر نموذج التواصل باختيار تصنيف (تسجيل واعتماد مدرسة جديدة) للحصول على رمز التفعيل المؤسسي وربط الكوادر التعليمية.'
    },
    {
      q: 'كيف تعمل تقنية مترجم لغة الإشارة في مشروع دامج؟ وهل تسجل الكاميرا أي فيديو؟',
      a: 'تعمل خوارزميات الذكاء الاصطناعي لمترجم لغة الإشارة بالكامل على جهاز المستخدم (On-Device Edge Computing)، ولا يتم تسجيل، أو رفع، أو حفظ أي بث فيديو للطلبة إطلاقاً احتراماً للخصوصية الصارمة.'
    },
    {
      q: 'هل تعمل المختبرات ثلاثية الأبعاد على الهواتف والأجهزة اللوحية البسيطة؟',
      a: 'نعم، تم تحسين محركات WebGL و Canvas لتعمل بكفاءة وسلاسة على كافة الهواتف الذكية والأجهزة اللوحية دون الحاجة لتنزيل تطبيقات ثقيلة أو مواصفات خاصة.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white font-sans transition-colors duration-300" dir="rtl">
      <StarField starCount={60} speed={0.06} />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
            <MessageSquare className="w-4 h-4" />
            <span>قنوات التواصل والدعم الفني والأكاديمي الرسمي</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            تواصل مع فريق ذروة العلم
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            نسعد بتلقي استفسارات الطلبة، والكوادر التعليمية، ومسؤولي المدارس والجامعات. تواصل معنا عبر القنوات المعتمدة وسنكون سعداء بخدمتك.
          </p>

          {isSuperAdmin && (
            <div className="pt-2">
              <Link to="/super-admin-control-hub?tab=support">
                <Button className="h-10 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-2 shadow-md shadow-amber-500/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول صندوق استفسارات ورسائل المستخدمين (لوحة الأدمن)</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 4 Direct Channel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">المشرف العام والدعم الأكاديمي</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                للأسئلة المتعلقة بالمناهج العلمية، وتجارب المحاكاة 3D، ومقترحات البحث.
              </p>
            </div>
            <a 
              href="mailto:jowmahmoud6@gmail.com" 
              className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800"
              dir="ltr"
            >
              jowmahmoud6@gmail.com
            </a>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Atom className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">الدعم التقني والمنصات</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                للمشاكل الفنية، الحسابات المسجلة، واستعادة كلمات المرور وتحديث البيانات.
              </p>
            </div>
            <a 
              href="mailto:support@zarwat-alelm.edu.jo" 
              className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800"
              dir="ltr"
            >
              support@zarwat-alelm.edu.jo
            </a>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">مشروع دامج والمدارس</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                لاعتماد المدارس الأردنية وتفعيل مسارات التربية الخاصة ولغة الإشارة وبرايل.
              </p>
            </div>
            <a 
              href="mailto:partners@zarwat-alelm.edu.jo" 
              className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800"
              dir="ltr"
            >
              partners@zarwat-alelm.edu.jo
            </a>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">الاتصال والواتساب المباشر</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                الخط الساخن لخدمة الطلبة وأولياء الأمور طوال أيام الأسبوع (8 ص - 6 م).
              </p>
            </div>
            <a 
              href="tel:+962790000000" 
              className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline block pt-2 border-t border-slate-100 dark:border-slate-800"
              dir="ltr"
            >
              +962 7 9000 0000
            </a>
          </div>
        </div>

        {/* Main Content Grid: Form on the Right, Live FAQ & Details on the Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form Card */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                إرسال استفسار أو تذكرة رسمية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يرجى تزويدنا بالتفاصيل المطلوبة وسيصلك الرد الرسمي مباشرة
              </p>
            </div>

            <ContactForm />
          </div>

          {/* Quick FAQ & Platform Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Headquarters Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>المقر الرئيسي والإدارة الأكاديمية</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                المملكة الأردنية الهاشمية — العاصمة عمان. مجمع الابتكار التعليمي والتطوير التكنولوجي، لخدمة كافة مديريات التربية والتعليم في المحافظات الاثنتي عشرة.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>ساعات العمل الرسمية: الأحد - الخميس (08:00 ص - 04:00 م)</span>
              </div>
            </div>

            {/* Instant FAQ Accordion */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-500" />
                  <span>الأسئلة الأكثر شيوعاً فورياً</span>
                </h3>
                <Badge className="bg-cyan-500/10 text-cyan-600 text-[10px]">إجابات فورية</Badge>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-3.5 text-right font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-cyan-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-3.5 pt-0 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy Link Teaser */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-transparent border border-cyan-500/20 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">السياسات والمعايير القانونية</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  اطلع على وثيقة الخصوصية وشروط الاستخدام الأكاديمي
                </p>
              </div>
              <Link to="/privacy">
                <Button size="sm" variant="outline" className="h-8 px-3 rounded-xl border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold gap-1 shrink-0">
                  <span>الخصوصية والشروط</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
