import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const BTECSEO = () => (
  <SEO 
    title="BTEC تكنولوجيا المعلومات - تعلم البرمجة وتطوير المواقع"
    description="BTEC تكنولوجيا المعلومات مع ذروة العلم - تعلم البرمجة بلغات Python و JavaScript و Java و HTML/CSS، تطوير المواقع والتطبيقات، قواعد البيانات، الشبكات، أمن المعلومات، الذكاء الاصطناعي AI، تعلم الآلة، علم البيانات، مساعد برمجي ذكي، حل الأكواد، إصلاح الأخطاء، مشاريع برمجية، منصات البناء Lovable وReplit، تحويل الرياضيات لكود"
    keywords={getKeywordsForSection('btec')}
    canonicalUrl="https://yoursite.lovable.app/btec-information-technology"
  />
);
