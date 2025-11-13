import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const EnvironmentalSEO = () => (
  <SEO 
    title="الاستدامة البيئية - حاسبة الكربون ومشاريع بيئية"
    description="الاستدامة البيئية مع ذروة العلم - حاسبة البصمة الكربونية، مشاريع بيئية للطلاب، التغير المناخي، الاحتباس الحراري، الطاقة المتجددة، إعادة التدوير، ترشيد الطاقة والمياه، الاقتصاد الأخضر، المدن المستدامة، التشجير، التنوع البيولوجي، رؤية 2030، السعودية الخضراء، الوعي البيئي، التعليم البيئي، حماية البيئة"
    keywords={getKeywordsForSection('environmental')}
    canonicalUrl="https://yoursite.lovable.app/environmental-sustainability"
  />
);
