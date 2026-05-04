// Arabic screening items inspired by validated tools:
// - Toddler track: M-CHAT-R/F structure (16-30 months) — yes/no, certain
//   "fail-direction" answers indicate risk; critical items weighted higher.
//   Reference: https://mchatscreen.com (open instrument) and
//   https://www.cdc.gov/autism/hcp/screening/index.html
// - Child track: covers DSM-5 social-communication (A) + restricted/
//   repetitive behaviors (B) domains plus sensory and play.
// - Adolescent/Adult track: AQ-10 inspired self/parent items.

export type AgeTrack = 'toddler' | 'child' | 'adolescent';
export type Domain =
  | 'social_communication'
  | 'restricted_repetitive'
  | 'sensory'
  | 'language'
  | 'play';

export type Scale = 'yesno' | '4pt';

export interface ScreeningItem {
  id: string;
  ageTrack: AgeTrack;
  domain: Domain;
  text: string;
  scale: Scale;
  // The answer that indicates RISK (fail direction).
  riskAnswer: 'yes' | 'no' | 'often' | 'rarely';
  critical?: boolean;
}

const T = (
  id: string,
  domain: Domain,
  text: string,
  riskAnswer: 'yes' | 'no',
  critical = false,
): ScreeningItem => ({
  id,
  ageTrack: 'toddler',
  domain,
  text,
  scale: 'yesno',
  riskAnswer,
  critical,
});

const C = (
  id: string,
  domain: Domain,
  text: string,
  riskAnswer: 'often' | 'rarely',
): ScreeningItem => ({
  id,
  ageTrack: 'child',
  domain,
  text,
  scale: '4pt',
  riskAnswer,
});

const A = (
  id: string,
  domain: Domain,
  text: string,
  riskAnswer: 'often' | 'rarely',
): ScreeningItem => ({
  id,
  ageTrack: 'adolescent',
  domain,
  text,
  scale: '4pt',
  riskAnswer,
});

export const TODDLER_ITEMS: ScreeningItem[] = [
  T('t1', 'social_communication', 'هل ينظر الطفل إليك عندما تناديه باسمه؟', 'no', true),
  T('t2', 'social_communication', 'هل يبتسم لك عندما تبتسم له؟', 'no'),
  T('t3', 'social_communication', 'هل يشير بإصبعه ليطلب شيئاً يريده؟', 'no', true),
  T('t4', 'social_communication', 'هل يُحضر لك أشياء ليُريك إياها (للمشاركة، لا للمساعدة فقط)؟', 'no', true),
  T('t5', 'social_communication', 'هل يقلّد ما تفعله (تصفيق، إيماءات، أصوات)؟', 'no'),
  T('t6', 'social_communication', 'هل يحب اللعب التفاعلي مع الآخرين (مثل: غميضة)؟', 'no'),
  T('t7', 'social_communication', 'هل ينظر إلى ما تشير إليه عبر الغرفة؟', 'no', true),
  T('t8', 'play', 'هل يلعب لعباً تخيلياً (يطعم الدمية، يتحدث في هاتف لعبة)؟', 'no'),
  T('t9', 'language', 'هل يستخدم كلمات بسيطة مفهومة (غير ترديد آلي)؟', 'no'),
  T('t10', 'language', 'هل يحاول جذب انتباهك بالأصوات أو الكلمات؟', 'no'),
  T('t11', 'social_communication', 'هل يُظهر مشاعره لك (يأتي لطلب الحضن، يُريك ما يفرحه)؟', 'no'),
  T('t12', 'restricted_repetitive', 'هل يقوم بحركات متكررة غير عادية (رفرفة يدين، دوران، هز)؟', 'yes'),
  T('t13', 'restricted_repetitive', 'هل يتمسك بترتيب أو روتين معين ويغضب عند تغييره؟', 'yes'),
  T('t14', 'restricted_repetitive', 'هل يهتم بأجزاء صغيرة من الألعاب (دواليب، خيوط) أكثر من اللعبة كاملة؟', 'yes'),
  T('t15', 'sensory', 'هل يبدو حساساً جداً لأصوات أو أضواء أو ملمس معين؟', 'yes'),
  T('t16', 'sensory', 'هل يبدو غير مستجيب للألم أو الحرارة كما هو متوقع؟', 'yes'),
  T('t17', 'language', 'هل فقد كلمات أو مهارات كان يمتلكها سابقاً؟', 'yes', true),
  T('t18', 'social_communication', 'هل يتجنب التواصل البصري مع الناس عموماً؟', 'yes'),
  T('t19', 'play', 'هل يصطف الألعاب بترتيب معين باستمرار؟', 'yes'),
  T('t20', 'social_communication', 'هل يستجيب للابتسامة أو الوجوه المألوفة بانفعال واضح؟', 'no'),
];

export const CHILD_ITEMS: ScreeningItem[] = [
  C('c1', 'social_communication', 'يجد صعوبة في فهم مشاعر الآخرين أو وجهات نظرهم.', 'often'),
  C('c2', 'social_communication', 'يُفضّل اللعب وحده على اللعب مع الأطفال.', 'often'),
  C('c3', 'social_communication', 'يستخدم تواصلاً بصرياً متبادلاً أثناء الحوار.', 'rarely'),
  C('c4', 'social_communication', 'يبدأ المحادثات أو يشارك اهتماماته مع الآخرين.', 'rarely'),
  C('c5', 'social_communication', 'يفهم النكات، السخرية، والمعاني المجازية.', 'rarely'),
  C('c6', 'language', 'يكرر كلمات أو جمل سمعها (إيكولاليا).', 'often'),
  C('c7', 'language', 'يستخدم نبرة صوت غير اعتيادية (رتيبة أو مرتفعة).', 'often'),
  C('c8', 'language', 'يفهم التعليمات اللفظية المركبة من أكثر من خطوة.', 'rarely'),
  C('c9', 'restricted_repetitive', 'لديه اهتمامات شديدة وضيقة جداً (موضوع واحد يستحوذ عليه).', 'often'),
  C('c10', 'restricted_repetitive', 'يقوم بحركات متكررة (رفرفة، تأرجح، فرك يدين).', 'often'),
  C('c11', 'restricted_repetitive', 'يلتزم بطقوس وروتين بشكل صارم ويغضب عند تغييرها.', 'often'),
  C('c12', 'restricted_repetitive', 'يصطف الأشياء أو يرتبها بطريقة محددة جداً.', 'often'),
  C('c13', 'sensory', 'يبدو حساساً بشكل غير معتاد للأصوات أو الأضواء أو الملمس.', 'often'),
  C('c14', 'sensory', 'يسعى لمدخلات حسية قوية (يضغط على نفسه، يحب الدوران).', 'often'),
  C('c15', 'sensory', 'انتقائي جداً في الطعام بسبب الملمس أو الرائحة.', 'often'),
  C('c16', 'play', 'يلعب لعباً تخيلياً متنوعاً مع الأقران.', 'rarely'),
  C('c17', 'play', 'يقلّد ألعاب الأطفال الآخرين بشكل اجتماعي.', 'rarely'),
  C('c18', 'social_communication', 'يستخدم إيماءات (يشير، يلوّح) لدعم كلامه.', 'rarely'),
  C('c19', 'social_communication', 'يصعب عليه تكوين صداقات والحفاظ عليها.', 'often'),
  C('c20', 'social_communication', 'يُظهر تعاطفاً عملياً عندما يرى شخصاً حزيناً.', 'rarely'),
  C('c21', 'restricted_repetitive', 'يهتم بأجزاء من الأشياء (عجلة، مفتاح) أكثر من الشيء ككل.', 'often'),
  C('c22', 'language', 'يستطيع وصف يومه أو حدث وقع له بقصة مترابطة.', 'rarely'),
  C('c23', 'social_communication', 'ينتبه عندما يحاول شخص جذب انتباهه.', 'rarely'),
  C('c24', 'restricted_repetitive', 'يتأقلم بسهولة مع التغيرات (المدرسة، الزيارات، السفر).', 'rarely'),
  C('c25', 'sensory', 'يردّ ردود فعل حادة على لمس خفيف أو ضوضاء عادية.', 'often'),
];

export const ADOLESCENT_ITEMS: ScreeningItem[] = [
  A('a1', 'social_communication', 'أُفضّل غالباً أن أفعل الأشياء وحدي بدلاً من مع الآخرين.', 'often'),
  A('a2', 'social_communication', 'أجد صعوبة في فهم نوايا الآخرين من تعابير وجوههم.', 'often'),
  A('a3', 'social_communication', 'أحب الانخراط في حوارات اجتماعية جانبية (small talk).', 'rarely'),
  A('a4', 'social_communication', 'أستطيع تخيّل ما يفكر فيه الآخر بسهولة.', 'rarely'),
  A('a5', 'language', 'أستخدم نبرة كلام طبيعية ومرنة في الحوار.', 'rarely'),
  A('a6', 'restricted_repetitive', 'لديّ اهتمامات شديدة وعميقة في موضوعات محددة.', 'often'),
  A('a7', 'restricted_repetitive', 'أنزعج بشدة عند تغيير روتيني اليومي.', 'often'),
  A('a8', 'restricted_repetitive', 'ألاحظ تفاصيل صغيرة لا يلاحظها غيري.', 'often'),
  A('a9', 'sensory', 'بعض الأصوات أو الإضاءات تسبب لي إزعاجاً كبيراً.', 'often'),
  A('a10', 'sensory', 'أحتاج أحياناً لحركات متكررة لتهدئة نفسي.', 'often'),
  A('a11', 'social_communication', 'يصعب عليّ معرفة متى يكون دوري في الكلام.', 'often'),
  A('a12', 'social_communication', 'أفهم النكات والسخرية بسهولة.', 'rarely'),
  A('a13', 'language', 'أتبع المحادثات الجماعية بسهولة.', 'rarely'),
  A('a14', 'social_communication', 'أحرص على التواصل البصري أثناء الكلام.', 'rarely'),
  A('a15', 'restricted_repetitive', 'أحب التخطيط الدقيق وأجد صعوبة في التغييرات المفاجئة.', 'often'),
  A('a16', 'sensory', 'أتجنب أماكن مزدحمة بسبب الإحساس الزائد بالمحيط.', 'often'),
  A('a17', 'social_communication', 'أستطيع تكوين صداقات والحفاظ عليها بسهولة.', 'rarely'),
  A('a18', 'language', 'أستخدم تعابير مجازية وفهمها يأتيني بسهولة.', 'rarely'),
  A('a19', 'restricted_repetitive', 'أركّز على هواية واحدة لساعات طويلة دون ملل.', 'often'),
  A('a20', 'social_communication', 'أشعر أن قواعد التفاعل الاجتماعي غير منطقية أو مرهقة.', 'often'),
];

export function getItemsForTrack(track: AgeTrack): ScreeningItem[] {
  if (track === 'toddler') return TODDLER_ITEMS;
  if (track === 'child') return CHILD_ITEMS;
  return ADOLESCENT_ITEMS;
}

export const ANSWER_LABELS_YESNO: Record<'yes' | 'no', string> = {
  yes: 'نعم',
  no: 'لا',
};

export const ANSWER_LABELS_4PT: Record<'rarely' | 'sometimes' | 'often' | 'always', string> = {
  rarely: 'نادراً',
  sometimes: 'أحياناً',
  often: 'كثيراً',
  always: 'دائماً',
};
