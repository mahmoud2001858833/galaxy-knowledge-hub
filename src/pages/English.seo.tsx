import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const EnglishSEO = () => (
  <SEO 
    title="اللغة الإنجليزية - تعلم الإنجليزية بذكاء"
    description="تعلم اللغة الإنجليزية مع ذروة العلم - قواعد Grammar، الأزمنة، الأفعال، مترجم ذكي AI، مساعد النطق، تحليل الكلام، مصحح لغوي، كتابة المقال Essay، استخراج النص من الصور OCR، المحادثة، القراءة، الاستماع، الكتابة، TOEFL، IELTS، الأدب الإنجليزي، فيديوهات تعليمية، بنك الأسئلة للمرحلة الثانوية والمتوسطة والابتدائية"
    keywords={getKeywordsForSection('english')}
    canonicalUrl="https://yoursite.lovable.app/english-language"
  />
);
