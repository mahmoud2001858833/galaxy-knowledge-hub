import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const ChemistrySEO = () => (
  <SEO 
    title="الكيمياء - الجدول الدوري التفاعلي وشروحات شاملة"
    description="تعلم الكيمياء مع ذروة العلم - الجدول الدوري التفاعلي، محاكاة الذرة، تفاعلات كيميائية، حسابات كيميائية، آلة حاسبة كيمياء، ألغاز كيمياء، فيديوهات تعليمية، مساعد ذكي AI، علماء الكيمياء، التوزيع الإلكتروني، الروابط الكيميائية، الكيمياء العضوية وغير العضوية للمرحلة الثانوية والمتوسطة"
    keywords={getKeywordsForSection('chemistry')}
    canonicalUrl="https://yoursite.lovable.app/chemistry"
  />
);
