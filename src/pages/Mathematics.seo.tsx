import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const MathematicsSEO = () => (
  <SEO 
    title="الرياضيات - حل مسائل وشروحات تفاعلية"
    description="تعلم الرياضيات مع ذروة العلم - آلة حاسبة علمية متقدمة، رسم الدوال البيانية، حل المعادلات، الجبر، الهندسة، حساب المثلثات، التفاضل والتكامل، الإحصاء، الاحتمالات، ألغاز رياضيات، فيديوهات تعليمية، مساعد ذكي AI، علماء الرياضيات، قوانين المساحات والحجوم للمرحلة الثانوية والمتوسطة والابتدائية"
    keywords={getKeywordsForSection('mathematics')}
    canonicalUrl="https://yoursite.lovable.app/mathematics"
  />
);
