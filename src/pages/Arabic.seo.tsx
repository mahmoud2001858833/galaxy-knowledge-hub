import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const ArabicSEO = () => (
  <SEO 
    title="اللغة العربية - النحو والصرف والبلاغة"
    description="تعلم اللغة العربية مع ذروة العلم - النحو والإعراب، الصرف والميزان الصرفي، البلاغة والبيان، العروض وبحور الشعر، القاموس العربي الذكي، مصحح لغوي AI، كتابة المقال، التعبير، الشعراء والأدباء العرب، النصوص الأدبية، النقد الأدبي، القصائد المحفوظة، ألغاز لغوية، بنك الأسئلة للمرحلة الثانوية والمتوسطة والابتدائية"
    keywords={getKeywordsForSection('arabic')}
    canonicalUrl="https://yoursite.lovable.app/arabic-language"
  />
);
