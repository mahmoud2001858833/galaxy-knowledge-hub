import { motion } from "framer-motion";
import { 
  Newspaper, 
  ShoppingCart, 
  GraduationCap, 
  LayoutDashboard,
  MessageSquare,
  Users,
  Image,
  BookOpen
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  features: string[];
  color: string;
}

interface BuilderTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

export const BuilderTemplates = ({ onSelectTemplate }: BuilderTemplatesProps) => {
  const templates: Template[] = [
    {
      id: 'news-platform',
      name: 'منصة أخبار متكاملة',
      description: 'منصة أخبار مع تسجيل دخول ولوحة إدارة لرفع الأخبار',
      icon: <Newspaper className="w-6 h-6" />,
      prompt: 'أنشئ منصة أخبار متكاملة تحتوي على: صفحة رئيسية لعرض الأخبار، نظام تسجيل دخول وخروج كامل مع Supabase، لوحة تحكم للمسؤولين لرفع وتعديل وحذف الأخبار مع رفع صور، تصنيفات للأخبار، بحث وفلترة، تصميم عصري متجاوب مع Dark/Light Mode.',
      features: ['تسجيل دخول', 'لوحة إدارة', 'رفع صور', 'تصنيفات', 'بحث'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'ecommerce',
      name: 'متجر إلكتروني',
      description: 'متجر مع عربة تسوق ونظام طلبات',
      icon: <ShoppingCart className="w-6 h-6" />,
      prompt: 'أنشئ متجر إلكتروني متكامل يحتوي على: صفحة رئيسية لعرض المنتجات، صفحة تفاصيل المنتج، عربة تسوق، نظام checkout، تسجيل دخول للمستخدمين، لوحة تحكم لإدارة المنتجات والطلبات، فلترة حسب الفئات، تصميم احترافي متجاوب.',
      features: ['عربة تسوق', 'إدارة منتجات', 'طلبات', 'فئات', 'دفع'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'education',
      name: 'منصة تعليمية',
      description: 'منصة دورات تعليمية مع تتبع التقدم',
      icon: <GraduationCap className="w-6 h-6" />,
      prompt: 'أنشئ منصة تعليمية متكاملة تحتوي على: صفحة رئيسية لعرض الدورات، صفحة تفاصيل الدورة مع الدروس، نظام تسجيل دخول للطلاب والمعلمين، لوحة تحكم للمعلمين لإضافة الدورات والدروس، تتبع تقدم الطلاب، شهادات إتمام، تصميم تعليمي حديث.',
      features: ['دورات', 'دروس', 'تقدم', 'شهادات', 'معلمين'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'dashboard',
      name: 'لوحة تحكم إدارية',
      description: 'لوحة تحكم مع إحصائيات ورسوم بيانية',
      icon: <LayoutDashboard className="w-6 h-6" />,
      prompt: 'أنشئ لوحة تحكم إدارية متقدمة تحتوي على: صفحة تسجيل دخول آمنة، Dashboard رئيسي مع بطاقات إحصائيات متحركة، رسوم بيانية للمبيعات والزوار، جداول بيانات مع بحث وفلترة وترقيم، إدارة المستخدمين، إعدادات النظام، تصميم مهني مع Dark Mode.',
      features: ['إحصائيات', 'رسوم بيانية', 'جداول', 'مستخدمين', 'إعدادات'],
      color: 'from-indigo-500 to-violet-500'
    },
    {
      id: 'blog',
      name: 'مدونة شخصية',
      description: 'مدونة مع تعليقات وتصنيفات',
      icon: <BookOpen className="w-6 h-6" />,
      prompt: 'أنشئ مدونة شخصية احترافية تحتوي على: صفحة رئيسية لعرض المقالات، صفحة المقالة مع نظام تعليقات، صفحة حول الكاتب، تسجيل دخول للإدارة، لوحة تحكم لكتابة وتعديل المقالات مع محرر نصوص، تصنيفات ووسوم، مشاركة على السوشيال ميديا، تصميم أنيق للقراءة.',
      features: ['مقالات', 'تعليقات', 'محرر', 'تصنيفات', 'مشاركة'],
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'chat',
      name: 'تطبيق دردشة',
      description: 'تطبيق محادثات في الوقت الحقيقي',
      icon: <MessageSquare className="w-6 h-6" />,
      prompt: 'أنشئ تطبيق دردشة متكامل يحتوي على: تسجيل دخول وإنشاء حساب، قائمة المحادثات، غرف محادثة، إرسال رسائل نصية وصور، إشعارات الرسائل الجديدة، البحث في المحادثات، حالة المستخدم (متصل/غير متصل)، تصميم عصري مثل WhatsApp.',
      features: ['محادثات', 'غرف', 'صور', 'إشعارات', 'حالة'],
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'portfolio',
      name: 'معرض أعمال',
      description: 'موقع شخصي لعرض الأعمال والمشاريع',
      icon: <Image className="w-6 h-6" />,
      prompt: 'أنشئ موقع معرض أعمال شخصي يحتوي على: صفحة هبوط Hero Section مميزة مع أنيميشن، قسم عن الشخص، معرض المشاريع مع فلترة، صفحة تفاصيل المشروع، نموذج اتصال، روابط السوشيال ميديا، تسجيل دخول لإدارة المشاريع، تصميم إبداعي مع تأثيرات Scroll.',
      features: ['Hero', 'معرض', 'مشاريع', 'اتصال', 'أنيميشن'],
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'social',
      name: 'شبكة اجتماعية',
      description: 'منصة تواصل اجتماعي مصغرة',
      icon: <Users className="w-6 h-6" />,
      prompt: 'أنشئ شبكة اجتماعية مصغرة تحتوي على: تسجيل دخول وإنشاء ملف شخصي، feed للمنشورات، نشر منشورات مع صور، إعجاب وتعليق، متابعة المستخدمين، صفحة الملف الشخصي، البحث عن المستخدمين، إشعارات، تصميم مثل Twitter/Instagram.',
      features: ['منشورات', 'إعجاب', 'تعليق', 'متابعة', 'ملف شخصي'],
      color: 'from-sky-500 to-blue-500'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">🚀 قوالب جاهزة للبدء</h3>
        <p className="text-sm text-muted-foreground">اختر قالباً وسأنشئ لك منصة متكاملة</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectTemplate(template.prompt)}
            className="group text-right p-4 rounded-xl border border-border bg-card hover:bg-accent/10 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${template.color} text-white shrink-0 group-hover:scale-110 transition-transform`}>
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 4).map((feature, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 bg-secondary/50 text-secondary-foreground rounded"
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
