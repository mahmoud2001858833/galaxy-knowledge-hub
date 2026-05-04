import React from 'react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const SensoryOutput: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">نتيجة التحويل الحسّي</h1>
    <PlaceholderPanel title="لا يوجد محتوى محوّل بعد" description="ارفع ملفاً من شاشة الرفع أولاً، وستظهر النتائج هنا في تبويبات منفصلة لكل حاسة." />
  </div>
);
export default SensoryOutput;
