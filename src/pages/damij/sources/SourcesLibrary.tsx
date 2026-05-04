import React from 'react';
import { BookMarked, ExternalLink } from 'lucide-react';

const sources = [
  { t: 'DSM-5-TR (APA, 2022)', d: 'الدليل التشخيصي والإحصائي للاضطرابات النفسية — المرجع المعتمد عالمياً.', tag: 'توحّد · ADHD' },
  { t: 'M-CHAT-R/F', d: 'أداة فحص التوحّد المعدّلة للأطفال (Robins et al., 2014).', tag: 'فحص توحّد' },
  { t: 'ADOS-2', d: 'مقياس ملاحظة تشخيص التوحّد — المعيار الذهبي للتشخيص.', tag: 'تشخيص توحّد' },
  { t: 'Conners-3 / Vanderbilt', d: 'مقاييس تقييم ADHD المعتمدة من AAP.', tag: 'ADHD' },
  { t: 'WHO ICF-CY', d: 'التصنيف الدولي لوظائف الأطفال واليافعين.', tag: 'إعاقة' },
  { t: 'UNESCO Inclusive Education Guidelines', d: 'الدليل المرجعي للتعليم الدامج.', tag: 'سياسات' },
  { t: 'Unicode Braille (ISO/TR 11548)', d: 'المعيار العالمي لترميز بريل.', tag: 'بريل' },
  { t: 'WFD — World Federation of the Deaf', d: 'معايير لغات الإشارة العالمية.', tag: 'إشارة' },
];

const SourcesLibrary: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <div className="flex items-center gap-3 mb-3">
      <BookMarked className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">المصادر العلمية الموثّقة</h1>
    </div>
    <p className="text-[hsl(var(--damij-text))]/70 mb-8">جميع أدوات منصة دامج مبنية على مراجع علمية معتمدة دولياً.</p>
    <div className="space-y-3">
      {sources.map((s, i) => (
        <div key={i} className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-1">{s.t}</h3>
              <p className="text-sm text-[hsl(var(--damij-text))]/75">{s.d}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] font-semibold whitespace-nowrap">{s.tag}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default SourcesLibrary;
