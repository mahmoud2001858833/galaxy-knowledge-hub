// Evidence-based ADHD screening instruments
// Sources:
//  - Vanderbilt: NICHQ Vanderbilt Assessment Scales (AAP/NICHQ)
//  - SNAP-IV: Swanson, Nolan and Pelham — 26 item version
//  - ASRS-v1.1: WHO Adult ADHD Self-Report Scale

export type ResponseValue = 0 | 1 | 2 | 3;

export const FREQUENCY_OPTIONS: { value: ResponseValue; label: string }[] = [
  { value: 0, label: 'أبداً' },
  { value: 1, label: 'أحياناً' },
  { value: 2, label: 'غالباً' },
  { value: 3, label: 'دائماً' },
];

export interface InstrumentItem {
  id: string;
  text: string;
  domain: 'inattention' | 'hyperactivity_impulsivity' | 'oppositional' | 'conduct' | 'anxiety_depression' | 'performance';
}

export interface Instrument {
  key: string;
  title: string;
  shortTitle: string;
  description: string;
  source: string;
  sourceUrl: string;
  ageRange: string;
  completedBy: 'parent' | 'teacher' | 'self';
  items: InstrumentItem[];
  cutoff: {
    inattention: { count: number; threshold: ResponseValue };
    hyperactivity_impulsivity: { count: number; threshold: ResponseValue };
  };
}

// SNAP-IV core 18 (DSM-IV criteria) — most widely reproduced public set
export const SNAP_IV: Instrument = {
  key: 'snap_iv',
  title: 'مقياس SNAP-IV (نسخة 18 بنداً)',
  shortTitle: 'SNAP-IV',
  description: 'مقياس Swanson/Nolan/Pelham لتقييم أعراض ADHD حسب معايير DSM. يستخدم للأطفال 6–18 سنة.',
  source: 'Swanson JM, et al. SNAP-IV Rating Scale',
  sourceUrl: 'https://www.shared-care.ca/files/Scoring_for_SNAP_IV_Guide_26-item.pdf',
  ageRange: '6–18',
  completedBy: 'parent',
  cutoff: {
    inattention: { count: 6, threshold: 2 },
    hyperactivity_impulsivity: { count: 6, threshold: 2 },
  },
  items: [
    { id: 'i1', domain: 'inattention', text: 'يفشل في الانتباه للتفاصيل أو يرتكب أخطاء بسبب الإهمال.' },
    { id: 'i2', domain: 'inattention', text: 'يصعب عليه الحفاظ على الانتباه في المهام أو اللعب.' },
    { id: 'i3', domain: 'inattention', text: 'يبدو وكأنه لا يصغي عند توجيه الكلام إليه مباشرة.' },
    { id: 'i4', domain: 'inattention', text: 'لا يتبع التعليمات ولا ينهي الواجبات أو المهام.' },
    { id: 'i5', domain: 'inattention', text: 'يصعب عليه تنظيم المهام والأنشطة.' },
    { id: 'i6', domain: 'inattention', text: 'يتجنب أو يكره المهام التي تتطلب جهداً ذهنياً مستمراً.' },
    { id: 'i7', domain: 'inattention', text: 'يفقد أشياءه الضرورية (أقلام، كتب، أدوات).' },
    { id: 'i8', domain: 'inattention', text: 'يتشتت بسهولة بسبب مثيرات خارجية.' },
    { id: 'i9', domain: 'inattention', text: 'ينسى الأنشطة اليومية بشكل متكرر.' },
    { id: 'h1', domain: 'hyperactivity_impulsivity', text: 'يحرك يديه أو قدميه أو يتلوى في مقعده.' },
    { id: 'h2', domain: 'hyperactivity_impulsivity', text: 'يغادر مقعده في المواقف التي يجب أن يبقى جالساً فيها.' },
    { id: 'h3', domain: 'hyperactivity_impulsivity', text: 'يجري أو يتسلق في مواقف غير مناسبة.' },
    { id: 'h4', domain: 'hyperactivity_impulsivity', text: 'يصعب عليه اللعب أو ممارسة الأنشطة بهدوء.' },
    { id: 'h5', domain: 'hyperactivity_impulsivity', text: 'يتصرف وكأنه "مدفوع بمحرك" دائماً.' },
    { id: 'h6', domain: 'hyperactivity_impulsivity', text: 'يتحدث بإفراط.' },
    { id: 'h7', domain: 'hyperactivity_impulsivity', text: 'يجيب عن الأسئلة قبل اكتمالها.' },
    { id: 'h8', domain: 'hyperactivity_impulsivity', text: 'يصعب عليه انتظار دوره.' },
    { id: 'h9', domain: 'hyperactivity_impulsivity', text: 'يقاطع الآخرين أو يتطفل عليهم.' },
  ],
};

export const VANDERBILT_PARENT: Instrument = {
  ...SNAP_IV,
  key: 'vanderbilt_parent',
  title: 'مقياس Vanderbilt — نسخة الوالد',
  shortTitle: 'Vanderbilt (والد)',
  description: 'مقياس NICHQ Vanderbilt للوالدين. يستخدم للأطفال 6–12 سنة لفحص ADHD وما يصاحبه.',
  source: 'NICHQ Vanderbilt Assessment Scales — Parent Informant',
  sourceUrl: 'https://www.nichq.org/sites/default/files/resource-file/NICHQ_Vanderbilt_Assessment_Scales.pdf',
  ageRange: '6–12',
  completedBy: 'parent',
};

export const VANDERBILT_TEACHER: Instrument = {
  ...SNAP_IV,
  key: 'vanderbilt_teacher',
  title: 'مقياس Vanderbilt — نسخة المعلم',
  shortTitle: 'Vanderbilt (معلم)',
  description: 'نسخة المعلم من مقياس NICHQ Vanderbilt للأطفال 6–12 سنة.',
  source: 'NICHQ Vanderbilt Assessment Scales — Teacher Informant',
  sourceUrl: 'https://www.nichq.org/sites/default/files/resource-file/NICHQ_Vanderbilt_Assessment_Scales.pdf',
  ageRange: '6–12',
  completedBy: 'teacher',
};

// ASRS-v1.1 — WHO Adult ADHD Self-Report Scale (full 18 items)
export const ASRS_V11: Instrument = {
  key: 'asrs_v1_1',
  title: 'مقياس ASRS-v1.1 (للراشدين)',
  shortTitle: 'ASRS',
  description: 'مقياس منظمة الصحة العالمية لفحص ADHD لدى البالغين (18+ سنة).',
  source: 'WHO Adult ADHD Self-Report Scale (ASRS-v1.1)',
  sourceUrl: 'https://add.org/wp-content/uploads/2015/03/adhd-questionnaire-ASRS111.pdf',
  ageRange: '18+',
  completedBy: 'self',
  cutoff: {
    inattention: { count: 4, threshold: 2 },
    hyperactivity_impulsivity: { count: 4, threshold: 2 },
  },
  items: [
    { id: 'a1', domain: 'inattention', text: 'كم مرة تواجه صعوبة في إنهاء التفاصيل النهائية لمشروع بعد إنجاز الأجزاء الصعبة؟' },
    { id: 'a2', domain: 'inattention', text: 'كم مرة تواجه صعوبة في ترتيب المهام التي تتطلب تنظيماً؟' },
    { id: 'a3', domain: 'inattention', text: 'كم مرة تواجه مشكلة في تذكّر المواعيد أو الالتزامات؟' },
    { id: 'a4', domain: 'inattention', text: 'كم مرة تتجنب أو تؤجل البدء بمهمة تتطلب تفكيراً عميقاً؟' },
    { id: 'a5', domain: 'hyperactivity_impulsivity', text: 'كم مرة تتلوى أو تحرك يديك/قدميك عند الجلوس لفترة طويلة؟' },
    { id: 'a6', domain: 'hyperactivity_impulsivity', text: 'كم مرة تشعر بنشاط زائد ومضطر للقيام بأشياء كأنك "مدفوع بمحرك"؟' },
    { id: 'a7', domain: 'inattention', text: 'كم مرة ترتكب أخطاء إهمالية عندما تعمل على مشروع ممل أو صعب؟' },
    { id: 'a8', domain: 'inattention', text: 'كم مرة تواجه صعوبة في الحفاظ على انتباهك أثناء عمل ممل أو متكرر؟' },
    { id: 'a9', domain: 'inattention', text: 'كم مرة تواجه صعوبة في التركيز على ما يقوله الناس حتى عندما يخاطبونك مباشرة؟' },
    { id: 'a10', domain: 'inattention', text: 'كم مرة تضع الأشياء في غير مكانها أو تواجه صعوبة في إيجادها في المنزل أو العمل؟' },
    { id: 'a11', domain: 'inattention', text: 'كم مرة تتشتت بسبب الأنشطة أو الضوضاء من حولك؟' },
    { id: 'a12', domain: 'hyperactivity_impulsivity', text: 'كم مرة تنهض من مقعدك في اجتماعات أو مواقف يُتوقع منك فيها البقاء جالساً؟' },
    { id: 'a13', domain: 'hyperactivity_impulsivity', text: 'كم مرة تشعر بعدم الاستقرار أو القلق؟' },
    { id: 'a14', domain: 'hyperactivity_impulsivity', text: 'كم مرة تواجه صعوبة في الاسترخاء عندما يتاح لك وقت لذلك؟' },
    { id: 'a15', domain: 'hyperactivity_impulsivity', text: 'كم مرة تجد نفسك تتحدث كثيراً في المواقف الاجتماعية؟' },
    { id: 'a16', domain: 'hyperactivity_impulsivity', text: 'كم مرة تكمل جمل الآخرين قبل أن ينتهوا من الحديث؟' },
    { id: 'a17', domain: 'hyperactivity_impulsivity', text: 'كم مرة تواجه صعوبة في انتظار دورك؟' },
    { id: 'a18', domain: 'hyperactivity_impulsivity', text: 'كم مرة تقاطع الآخرين أثناء انشغالهم؟' },
  ],
};

export const INSTRUMENTS: Record<string, Instrument> = {
  vanderbilt_parent: VANDERBILT_PARENT,
  vanderbilt_teacher: VANDERBILT_TEACHER,
  snap_iv: SNAP_IV,
  asrs_v1_1: ASRS_V11,
};

export interface ScoringResult {
  inattentionPositive: number;
  hyperactivityPositive: number;
  inattentionMean: number;
  hyperactivityMean: number;
  meetsInattention: boolean;
  meetsHyperactivity: boolean;
  subtype: 'inattentive' | 'hyperactive_impulsive' | 'combined' | 'none';
  severity: 'none' | 'mild' | 'moderate' | 'severe';
}

export function scoreInstrument(
  instrument: Instrument,
  responses: Record<string, ResponseValue>
): ScoringResult {
  const inAtt = instrument.items.filter((i) => i.domain === 'inattention');
  const hyp = instrument.items.filter((i) => i.domain === 'hyperactivity_impulsivity');

  const countAt = (items: InstrumentItem[], threshold: number) =>
    items.filter((it) => (responses[it.id] ?? 0) >= threshold).length;

  const meanOf = (items: InstrumentItem[]) =>
    items.length === 0 ? 0 : items.reduce((s, it) => s + (responses[it.id] ?? 0), 0) / items.length;

  const inattentionPositive = countAt(inAtt, instrument.cutoff.inattention.threshold);
  const hyperactivityPositive = countAt(hyp, instrument.cutoff.hyperactivity_impulsivity.threshold);

  const meetsInattention = inattentionPositive >= instrument.cutoff.inattention.count;
  const meetsHyperactivity = hyperactivityPositive >= instrument.cutoff.hyperactivity_impulsivity.count;

  let subtype: ScoringResult['subtype'] = 'none';
  if (meetsInattention && meetsHyperactivity) subtype = 'combined';
  else if (meetsInattention) subtype = 'inattentive';
  else if (meetsHyperactivity) subtype = 'hyperactive_impulsive';

  const overallMean = (meanOf(inAtt) + meanOf(hyp)) / 2;
  let severity: ScoringResult['severity'] = 'none';
  if (subtype !== 'none') {
    if (overallMean >= 2.4) severity = 'severe';
    else if (overallMean >= 1.8) severity = 'moderate';
    else severity = 'mild';
  }

  return {
    inattentionPositive,
    hyperactivityPositive,
    inattentionMean: meanOf(inAtt),
    hyperactivityMean: meanOf(hyp),
    meetsInattention,
    meetsHyperactivity,
    subtype,
    severity,
  };
}

export const SUBTYPE_LABEL: Record<ScoringResult['subtype'], string> = {
  none: 'لا تظهر معايير ADHD',
  inattentive: 'النمط الغالب: تشتّت الانتباه',
  hyperactive_impulsive: 'النمط الغالب: فرط الحركة والاندفاع',
  combined: 'النمط المختلط (انتباه + فرط حركة)',
};

export const SEVERITY_LABEL: Record<ScoringResult['severity'], string> = {
  none: 'لا تظهر شدّة',
  mild: 'خفيفة',
  moderate: 'متوسطة',
  severe: 'شديدة',
};
