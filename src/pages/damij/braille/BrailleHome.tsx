import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeftRight, BookOpen, FileText, Globe, Shapes, GraduationCap } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';

const BrailleHome: React.FC = () => (
  <div className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
    <header className="text-center mb-12">
      <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] flex items-center justify-center mx-auto mb-5">
        <Eye className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-[hsl(var(--damij-primary))] mb-3">نظام بريل الدامج</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto">
        أدوات لتمكين الطلاب المكفوفين من الاندماج في الصف الدامج عبر تحويل النصوص بين العربية وبريل وتعلّم تفاعلي.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SystemCard to="/damij/braille/universal" icon={Globe} title="محوّل بريل العالمي ✨" description="حوّل أي ملف (PDF, Word, PPT, Excel, صور) أو صفحة ويب أو نص إلى بريل بأكثر من 100 لغة، مع دعم المستوى الأول والثاني (الاختزالي)." />
      
      <SystemCard to="/damij/braille/braille-to-text" icon={FileText} title="من بريل إلى نص + قراءة صوتية" description="صوّر صفحة بريل ورقية بالكاميرا أو ارفع صورة، وحوّلها إلى نص رقمي قابل للقراءة الصوتية بأكثر من لغة." />
      <SystemCard to="/damij/braille/tactile" icon={Shapes} title="رسومات تكتيلية للطباعة 🖨️" description="ولّد أو حوّل أشكالاً هندسية وخرائط جغرافية وجزيئات كيميائية ورسوماً بيانية إلى رسوم تكتيلية جاهزة للطباعة على ورق منتفخ أو طابعة بريل، أو افهم رسماً تكتيلياً موجوداً." />
      <SystemCard to="/damij/braille/learn" icon={BookOpen} title="📖 قاموس بريل العالمي" description="ترجم كلمة أو جملة بين أكثر من 100 لغة وبريل (نص → بريل / بريل → نص)، مع نطق صوتي، إدخال بالميكروفون، تمثيل بصري بالنقاط، وحفظ المفضلة." />
      <SystemCard to="/damij/braille/interactive-learn" icon={GraduationCap} title="تعلّم بريل التفاعلي 🎓" description="دروس متدرّجة (مبتدئ/متوسط/متقدم)، لوحة مفاتيح بريل افتراضية (F D S / J K L)، ومحاكاة شاشة قراءة، مع قياس مستمر للسرعة والدقة واختبار 30 ثانية." />
    </div>
  </div>
);

export default BrailleHome;
