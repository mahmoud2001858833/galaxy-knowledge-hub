import React from 'react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const ClinicalReports: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">تقارير التجارب</h1>
    <PlaceholderPanel title="لا توجد تقارير بعد" description="بعد إجراء تجربة في المختبر السريري، ستظهر تقاريرها هنا قابلة للتصدير كـ PDF لأبحاث الطلاب." />
  </div>
);
export default ClinicalReports;
