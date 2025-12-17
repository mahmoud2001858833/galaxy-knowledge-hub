import { motion } from "framer-motion";
import { 
  Newspaper, 
  ShoppingCart, 
  GraduationCap, 
  LayoutDashboard,
  MessageSquare,
  Users,
  Image,
  BookOpen,
  Store,
  Heart,
  Briefcase,
  Calendar,
  Music,
  Utensils
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  features: string[];
  color: string;
  badge?: string;
}

interface BuilderTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

export const BuilderTemplates = ({ onSelectTemplate }: BuilderTemplatesProps) => {
  const templates: Template[] = [
    {
      id: 'ecommerce-full',
      name: 'متجر إلكتروني كامل',
      description: 'متجر احترافي مثل Amazon مع سلة شراء وإدارة منتجات',
      icon: <ShoppingCart className="w-6 h-6" />,
      prompt: `أنشئ متجر إلكتروني احترافي متكامل يحتوي على:
- صفحة رئيسية Hero Section مع عروض ومنتجات مميزة
- صفحة المنتجات مع فلترة حسب الفئات والسعر والبحث
- صفحة تفاصيل المنتج مع صور متعددة ووصف وتقييمات
- سلة شراء متقدمة مع تعديل الكميات وحساب المجموع
- صفحة checkout مع نموذج الشحن والدفع
- صفحة الطلبات للمستخدم
- لوحة إدارة كاملة لإضافة/تعديل/حذف المنتجات
- نظام تسجيل دخول كامل
- تصميم عصري متجاوب مع animations`,
      features: ['سلة شراء', 'إدارة منتجات', 'Checkout', 'طلبات', 'فلترة', 'تقييمات'],
      color: 'from-green-500 to-emerald-600',
      badge: '⭐ الأكثر طلباً'
    },
    {
      id: 'social-network',
      name: 'شبكة اجتماعية مثل Facebook',
      description: 'منصة تواصل اجتماعي كاملة مع Feed وإعجابات وتعليقات',
      icon: <Users className="w-6 h-6" />,
      prompt: `أنشئ شبكة اجتماعية متكاملة مثل Facebook تحتوي على:
- صفحة رئيسية Hero ترحيبية للزوار
- صفحة Feed للمنشورات مع التمرير اللانهائي
- إنشاء منشور جديد مع نص وصور
- نظام إعجاب مع عداد وتغيير اللون
- نظام تعليقات تحت كل منشور
- صفحة الملف الشخصي مع معلومات ومنشورات المستخدم
- صفحة الإعدادات لتعديل البيانات الشخصية
- صفحة استكشاف للمستخدمين والمنشورات
- إشعارات بالإعجابات والتعليقات الجديدة
- تسجيل دخول وإنشاء حساب
- تصميم عصري مثل Facebook/Instagram`,
      features: ['Feed', 'إعجاب', 'تعليقات', 'ملف شخصي', 'استكشاف', 'إشعارات'],
      color: 'from-blue-500 to-indigo-600',
      badge: '🔥 شائع'
    },
    {
      id: 'news-magazine',
      name: 'مجلة أخبار متكاملة',
      description: 'منصة أخبار مثل CNN مع تصنيفات ولوحة إدارة',
      icon: <Newspaper className="w-6 h-6" />,
      prompt: `أنشئ مجلة أخبار احترافية متكاملة تحتوي على:
- صفحة رئيسية مع أخبار عاجلة ومميزة وحديثة
- صفحات التصنيفات (رياضة، سياسة، تقنية، اقتصاد)
- صفحة الخبر الكاملة مع صورة كبيرة ومحتوى وتاريخ
- نظام تعليقات على الأخبار
- بحث في الأخبار
- لوحة إدارة متقدمة لكتابة ونشر الأخبار مع محرر نصوص
- رفع صور للأخبار
- أخبار متعلقة في أسفل كل خبر
- تسجيل دخول للمحررين
- تصميم صحفي احترافي متجاوب`,
      features: ['تصنيفات', 'لوحة إدارة', 'محرر', 'تعليقات', 'بحث', 'أخبار متعلقة'],
      color: 'from-red-500 to-rose-600'
    },
    {
      id: 'education-platform',
      name: 'منصة تعليمية متقدمة',
      description: 'منصة دورات مثل Udemy مع تتبع التقدم والشهادات',
      icon: <GraduationCap className="w-6 h-6" />,
      prompt: `أنشئ منصة تعليمية متكاملة مثل Udemy تحتوي على:
- صفحة رئيسية مع دورات مميزة وفئات
- صفحة استعراض جميع الدورات مع فلترة وبحث
- صفحة تفاصيل الدورة مع وصف ومنهج ومعلم
- صفحة الدرس مع فيديو أو محتوى نصي
- نظام تتبع التقدم بنسب مئوية
- شهادة إتمام الدورة
- لوحة تحكم للمعلمين لإنشاء الدورات والدروس
- لوحة تحكم للطلاب لمتابعة دوراتهم
- نظام تقييمات الدورات
- تسجيل دخول للطلاب والمعلمين
- تصميم تعليمي حديث`,
      features: ['دورات', 'دروس', 'تقدم', 'شهادات', 'معلمين', 'تقييمات'],
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'admin-dashboard',
      name: 'لوحة تحكم إدارية',
      description: 'Dashboard احترافي مع Charts وإحصائيات وجداول',
      icon: <LayoutDashboard className="w-6 h-6" />,
      prompt: `أنشئ لوحة تحكم إدارية متقدمة تحتوي على:
- صفحة Dashboard رئيسية مع بطاقات إحصائيات متحركة
- رسوم بيانية للمبيعات والزوار والأرباح (Charts)
- جدول بيانات تفاعلي مع بحث وفلترة وترقيم
- صفحة إدارة المستخدمين مع الأدوار
- صفحة إدارة المحتوى/المنتجات
- صفحة الإعدادات العامة
- صفحة التقارير
- نظام إشعارات
- Sidebar قابل للطي
- تسجيل دخول آمن للمسؤولين
- Dark/Light Mode
- تصميم مهني احترافي`,
      features: ['إحصائيات', 'Charts', 'جداول', 'مستخدمين', 'تقارير', 'Sidebar'],
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'blog-personal',
      name: 'مدونة شخصية احترافية',
      description: 'مدونة أنيقة مع محرر نصوص وتعليقات ومشاركة',
      icon: <BookOpen className="w-6 h-6" />,
      prompt: `أنشئ مدونة شخصية احترافية تحتوي على:
- صفحة رئيسية مع أحدث المقالات والمميزة
- صفحة المقالة الكاملة مع صورة غلاف ومحتوى منسق
- نظام تعليقات تفاعلي
- صفحة "عني" مع سيرة ذاتية
- صفحة التواصل مع نموذج
- تصنيفات ووسوم للمقالات
- بحث في المقالات
- مشاركة على السوشيال ميديا
- لوحة إدارة لكتابة المقالات مع محرر نصوص
- رفع صور للمقالات
- تسجيل دخول للكاتب
- تصميم أنيق للقراءة`,
      features: ['مقالات', 'تعليقات', 'تصنيفات', 'محرر', 'مشاركة', 'بحث'],
      color: 'from-orange-500 to-amber-600'
    },
    {
      id: 'portfolio',
      name: 'معرض أعمال إبداعي',
      description: 'Portfolio احترافي مع أنيميشن وعرض مشاريع',
      icon: <Image className="w-6 h-6" />,
      prompt: `أنشئ موقع Portfolio إبداعي احترافي يحتوي على:
- صفحة رئيسية Hero Section مذهلة مع أنيميشن
- قسم "عني" مع مهارات ونبذة
- معرض المشاريع مع فلترة حسب النوع
- صفحة تفاصيل المشروع مع صور ووصف وتقنيات
- قسم الخدمات المقدمة
- قسم الشهادات والتوصيات
- نموذج اتصال تفاعلي
- روابط السوشيال ميديا
- لوحة إدارة لإضافة المشاريع
- تأثيرات Scroll Animations
- تصميم إبداعي مميز`,
      features: ['Hero', 'معرض', 'مشاريع', 'خدمات', 'اتصال', 'Animations'],
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'restaurant',
      name: 'موقع مطعم مع حجوزات',
      description: 'موقع مطعم احترافي مع قائمة طعام ونظام حجز',
      icon: <Utensils className="w-6 h-6" />,
      prompt: `أنشئ موقع مطعم احترافي يحتوي على:
- صفحة رئيسية مع صور جذابة للمطعم والأطباق
- قائمة الطعام مع فئات (مقبلات، أطباق رئيسية، حلويات، مشروبات)
- صفحة تفاصيل الطبق مع صورة ومكونات وسعر
- نظام حجز طاولة مع اختيار التاريخ والوقت وعدد الأشخاص
- صفحة "عن المطعم" مع قصته
- معرض صور للمطعم والأجواء
- نموذج اتصال وموقع على الخريطة
- لوحة إدارة لتعديل القائمة والحجوزات
- ساعات العمل وأرقام التواصل
- تصميم أنيق يفتح الشهية`,
      features: ['قائمة طعام', 'حجز طاولة', 'معرض صور', 'فئات', 'موقع', 'إدارة'],
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'chat-app',
      name: 'تطبيق دردشة حديث',
      description: 'تطبيق محادثات مثل WhatsApp مع غرف ورسائل',
      icon: <MessageSquare className="w-6 h-6" />,
      prompt: `أنشئ تطبيق دردشة متكامل مثل WhatsApp يحتوي على:
- صفحة تسجيل الدخول وإنشاء حساب
- قائمة المحادثات مع آخر رسالة
- صفحة المحادثة مع رسائل ذهاباً وإياباً
- إرسال رسائل نصية
- إرسال صور في المحادثة
- حالة الرسالة (مرسل، مستلم، مقروء)
- بحث في المحادثات
- صفحة الملف الشخصي
- إعدادات المستخدم
- إشعارات الرسائل الجديدة
- تصميم عصري مثل WhatsApp`,
      features: ['محادثات', 'رسائل', 'صور', 'حالة', 'بحث', 'إشعارات'],
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'job-board',
      name: 'منصة توظيف',
      description: 'موقع وظائف مثل LinkedIn Jobs مع تقديم طلبات',
      icon: <Briefcase className="w-6 h-6" />,
      prompt: `أنشئ منصة توظيف متكاملة تحتوي على:
- صفحة رئيسية مع وظائف مميزة وبحث
- صفحة استعراض الوظائف مع فلترة (المجال، الموقع، نوع العمل)
- صفحة تفاصيل الوظيفة مع المتطلبات والمزايا
- نموذج تقديم طلب توظيف مع رفع السيرة الذاتية
- صفحة "وظائفي" للباحثين عن عمل
- لوحة تحكم للشركات لنشر وإدارة الوظائف
- صفحة الشركة مع معلومات ووظائفها
- إشعارات بالوظائف الجديدة
- تسجيل دخول للباحثين والشركات
- تصميم مهني احترافي`,
      features: ['وظائف', 'فلترة', 'تقديم', 'شركات', 'سيرة ذاتية', 'إشعارات'],
      color: 'from-slate-500 to-gray-600'
    },
    {
      id: 'event-booking',
      name: 'منصة حجز فعاليات',
      description: 'موقع لحجز تذاكر الفعاليات والمؤتمرات',
      icon: <Calendar className="w-6 h-6" />,
      prompt: `أنشئ منصة حجز فعاليات متكاملة تحتوي على:
- صفحة رئيسية مع فعاليات قادمة ومميزة
- صفحة استعراض الفعاليات مع فلترة (النوع، التاريخ، الموقع)
- صفحة تفاصيل الفعالية مع وصف وجدول وأسعار التذاكر
- نظام حجز تذاكر مع اختيار الفئة والكمية
- صفحة "تذاكري" لعرض الحجوزات
- لوحة إدارة لإنشاء وإدارة الفعاليات
- تقويم الفعاليات
- إشعارات بالفعاليات القادمة
- تسجيل دخول للمستخدمين والمنظمين
- تصميم عصري جذاب`,
      features: ['فعاليات', 'حجز', 'تذاكر', 'تقويم', 'فئات', 'إدارة'],
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'music-streaming',
      name: 'منصة موسيقى',
      description: 'تطبيق استماع للموسيقى مثل Spotify',
      icon: <Music className="w-6 h-6" />,
      prompt: `أنشئ منصة موسيقى متكاملة مثل Spotify تحتوي على:
- صفحة رئيسية مع قوائم تشغيل وأغاني رائجة
- مشغل موسيقى ثابت في الأسفل مع التحكم
- صفحة الاستكشاف مع التصنيفات
- صفحة الفنان مع ألبوماته وأغانيه
- صفحة الألبوم مع قائمة الأغاني
- قوائم التشغيل الخاصة بالمستخدم
- بحث عن أغاني وفنانين
- صفحة المكتبة الشخصية
- نظام إعجاب بالأغاني
- تسجيل دخول للمستخدمين
- تصميم داكن عصري`,
      features: ['مشغل', 'قوائم', 'فنانين', 'ألبومات', 'بحث', 'مكتبة'],
      color: 'from-green-600 to-emerald-700'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">🚀 قوالب جاهزة للإطلاق</h3>
        <p className="text-sm text-muted-foreground">اختر قالباً وسأنشئ لك منصة متكاملة مع 20+ ملف</p>
        <Badge className="mt-2 bg-green-500/20 text-green-500 border-green-500/30">
          ✓ قاعدة البيانات جاهزة تلقائياً
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectTemplate(template.prompt)}
            className="group text-right p-4 rounded-xl border border-border bg-card hover:bg-accent/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {template.name}
                  </h4>
                  {template.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {template.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
