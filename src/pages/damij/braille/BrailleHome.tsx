import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeftRight, BookOpen, FileText } from 'lucide-react';
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

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SystemCard to="/damij/braille/text-to-braille" icon={ArrowLeftRight} title="من النص إلى بريل" description="حوّل أي نص عربي/إنجليزي إلى رموز بريل قابلة للقراءة والطباعة." />
      <SystemCard to="/damij/braille/braille-to-text" icon={FileText} title="من بريل إلى نص" description="ارفع صورة أو أدخل رموز بريل واحصل على النص المكتوب." />
      <SystemCard to="/damij/braille/learn" icon={BookOpen} title="تعلّم بريل" description="جدول الحروف والأرقام بطريقة بريل مع نطق صوتي." />
    </div>
  </div>
);

export default BrailleHome;
