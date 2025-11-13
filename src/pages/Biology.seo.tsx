import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const BiologySEO = () => (
  <SEO 
    title="الأحياء - جسم الإنسان التفاعلي وعلم الحياة"
    description="تعلم الأحياء مع ذروة العلم - جسم الإنسان التفاعلي، الخلية، الوراثة، DNA، التطور، التصنيف، علم النبات، علم الحيوان، الأجهزة الحيوية، موسوعة الأمراض، حسابات أحياء، ألغاز، فيديوهات تعليمية، مساعد ذكي AI، علماء الأحياء، التقنية الحيوية، علم البيئة للمرحلة الثانوية والمتوسطة"
    keywords={getKeywordsForSection('biology')}
    canonicalUrl="https://yoursite.lovable.app/biology"
  />
);
