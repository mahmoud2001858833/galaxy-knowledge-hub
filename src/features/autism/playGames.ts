export interface GameMeta {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  domain: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'response_to_name',
    title: 'الاستجابة للاسم',
    description: 'يقيس سرعة الاستجابة عند سماع نداء أو منبّه صوتي.',
    durationLabel: '٦٠ ثانية',
    domain: 'تواصل اجتماعي',
  },
  {
    id: 'joint_attention',
    title: 'الانتباه المشترك',
    description: 'متابعة اتجاه نظر الشخصية إلى الهدف الصحيح.',
    durationLabel: '٩٠ ثانية',
    domain: 'تواصل اجتماعي',
  },
  {
    id: 'pattern_vs_social',
    title: 'الأنماط أم الوجوه؟',
    description: 'يقيس تفضيل المنبّهات الهندسية مقابل الاجتماعية.',
    durationLabel: '٦٠ ثانية',
    domain: 'سلوك مقيّد',
  },
  {
    id: 'repetitive_match',
    title: 'لعبة المطابقة',
    description: 'يقيس مدى الإصرار على نمط محدد بعد تغيير القاعدة.',
    durationLabel: '٩٠ ثانية',
    domain: 'مرونة معرفية',
  },
  {
    id: 'emotion_recognition',
    title: 'تمييز المشاعر',
    description: 'تحديد الانفعال من تعابير الوجه.',
    durationLabel: '٧٠ ثانية',
    domain: 'إدراك اجتماعي',
  },
  {
    id: 'sensory_tolerance',
    title: 'الاحتمال الحسي',
    description: 'يقيس عتبة تحمّل المنبّهات الصوتية والبصرية.',
    durationLabel: '٤٥ ثانية',
    domain: 'حسي',
  },
];
