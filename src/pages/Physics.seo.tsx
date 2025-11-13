import { SEO } from '@/components/SEO';
import { getKeywordsForSection } from '@/data/seoKeywords';

export const PhysicsSEO = () => (
  <SEO 
    title="الفيزياء - دروس وشروحات تفاعلية"
    description="تعلم الفيزياء مع ذروة العلم - شروحات تفاعلية، حسابات فيزيائية، ألغاز علمية، فيديوهات تعليمية، مساعد ذكي AI، علماء الفيزياء، قوانين الفيزياء، تجارب فيزياء، الميكانيكا، الكهرباء والمغناطيسية، الضوء والبصريات، الديناميكا الحرارية، فيزياء حديثة للمرحلة الثانوية والمتوسطة"
    keywords={getKeywordsForSection('physics')}
    canonicalUrl="https://yoursite.lovable.app/physics"
  />
);
