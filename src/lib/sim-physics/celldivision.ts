/**
 * Cell division: mitosis and meiosis phase models, chromosome bookkeeping
 * and the cell cycle timeline.
 */

export type DivisionMode = 'mitosis' | 'meiosis' | 'cycle';

export interface Phase {
  id: string;
  name: string;
  nameEn: string;
  /** Description in Arabic. */
  description: string;
  /** Relative duration weight in the process. */
  duration: number;
  color: string;
  /** Number of separate cells present during this phase. */
  cells: number;
  /** Chromosome count per cell (for 2n = 4 model). */
  chromosomes: number;
  /** Chromatids per chromosome. */
  chromatids: 1 | 2;
  /** Ploidy label. */
  ploidy: 'ثنائية 2n' | 'أحادية n';
}

/** Mitosis: PMAT + cytokinesis (model organism 2n = 4). */
export const MITOSIS_PHASES: Phase[] = [
  {
    id: 'interphase',
    name: 'الطور البيني',
    nameEn: 'Interphase',
    description: 'تنمو الخلية وتُضاعف DNA في مرحلة S فيصبح لكل كروموسوم كروماتيدان شقيقان.',
    duration: 4,
    color: '#38bdf8',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'prophase',
    name: 'الطور التمهيدي',
    nameEn: 'Prophase',
    description: 'تتكثّف الكروموسومات، يختفي الغلاف النووي، ويتكوّن المغزل من المريكزات.',
    duration: 2,
    color: '#a855f7',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'metaphase',
    name: 'الطور الاستوائي',
    nameEn: 'Metaphase',
    description: 'تصطف الكروموسومات في صف واحد على خط استواء الخلية وترتبط بألياف المغزل.',
    duration: 1.5,
    color: '#f59e0b',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'anaphase',
    name: 'الطور الانفصالي',
    nameEn: 'Anaphase',
    description: 'تنفصل الكروماتيدات الشقيقة وتُسحب نحو قطبي الخلية المتقابلين.',
    duration: 1.5,
    color: '#ef4444',
    cells: 1,
    chromosomes: 8,
    chromatids: 1,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'telophase',
    name: 'الطور النهائي',
    nameEn: 'Telophase',
    description: 'يتكوّن غلافان نوويان جديدان وتبدأ الكروموسومات بالاستطالة.',
    duration: 1.5,
    color: '#22c55e',
    cells: 1,
    chromosomes: 8,
    chromatids: 1,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'cytokinesis',
    name: 'انقسام السيتوبلازم',
    nameEn: 'Cytokinesis',
    description: 'ينقسم السيتوبلازم فتنتج خليتان متطابقتان وراثياً 2n لكل منهما 4 كروموسومات.',
    duration: 1.5,
    color: '#14b8a6',
    cells: 2,
    chromosomes: 4,
    chromatids: 1,
    ploidy: 'ثنائية 2n',
  },
];

/** Meiosis I + II. */
export const MEIOSIS_PHASES: Phase[] = [
  {
    id: 'interphase',
    name: 'الطور البيني',
    nameEn: 'Interphase',
    description: 'مضاعفة DNA قبل بدء الانقسام المنصف.',
    duration: 3,
    color: '#38bdf8',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'prophase1',
    name: 'التمهيدي الأول',
    nameEn: 'Prophase I',
    description: 'يحدث الاقتران بين الكروموسومات المتماثلة والعبور الجيني (تبادل قطع) مصدر التنوّع.',
    duration: 3,
    color: '#a855f7',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'metaphase1',
    name: 'الاستوائي الأول',
    nameEn: 'Metaphase I',
    description: 'تصطف أزواج الكروموسومات المتماثلة في صفّين على خط الاستواء (توزيع مستقل).',
    duration: 1.5,
    color: '#f59e0b',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'anaphase1',
    name: 'الانفصالي الأول',
    nameEn: 'Anaphase I',
    description: 'تنفصل الكروموسومات المتماثلة (وليس الكروماتيدات) نحو القطبين فيقلّ العدد للنصف.',
    duration: 1.5,
    color: '#ef4444',
    cells: 1,
    chromosomes: 4,
    chromatids: 2,
    ploidy: 'ثنائية 2n',
  },
  {
    id: 'telophase1',
    name: 'النهائي الأول',
    nameEn: 'Telophase I',
    description: 'تنتج خليتان أحاديتا المجموعة الكروموسومية n، كل كروموسوم بكروماتيدين.',
    duration: 1.5,
    color: '#22c55e',
    cells: 2,
    chromosomes: 2,
    chromatids: 2,
    ploidy: 'أحادية n',
  },
  {
    id: 'metaphase2',
    name: 'الاستوائي الثاني',
    nameEn: 'Metaphase II',
    description: 'تصطف الكروموسومات في كل خلية على خط الاستواء استعداداً لفصل الكروماتيدات.',
    duration: 1.5,
    color: '#fb923c',
    cells: 2,
    chromosomes: 2,
    chromatids: 2,
    ploidy: 'أحادية n',
  },
  {
    id: 'anaphase2',
    name: 'الانفصالي الثاني',
    nameEn: 'Anaphase II',
    description: 'تنفصل الكروماتيدات الشقيقة نحو القطبين في كلتا الخليتين.',
    duration: 1.5,
    color: '#f43f5e',
    cells: 2,
    chromosomes: 4,
    chromatids: 1,
    ploidy: 'أحادية n',
  },
  {
    id: 'telophase2',
    name: 'النهائي الثاني',
    nameEn: 'Telophase II',
    description: 'تنتج أربع خلايا أحادية n مختلفة وراثياً — الأمشاج.',
    duration: 2,
    color: '#14b8a6',
    cells: 4,
    chromosomes: 2,
    chromatids: 1,
    ploidy: 'أحادية n',
  },
];

/** Cell-cycle segments with typical human somatic durations (hours). */
export const CYCLE_STAGES = [
  { id: 'g1', name: 'G1 — النمو الأول', hours: 11, color: '#38bdf8', note: 'نمو الخلية وتصنيع البروتينات والعضيّات.' },
  { id: 's', name: 'S — التضاعف', hours: 8, color: '#a855f7', note: 'مضاعفة DNA فيصبح لكل كروموسوم كروماتيدان.' },
  { id: 'g2', name: 'G2 — النمو الثاني', hours: 4, color: '#f59e0b', note: 'تجهيز المغزل ومراجعة سلامة DNA.' },
  { id: 'm', name: 'M — الانقسام', hours: 1, color: '#ef4444', note: 'الانقسام المتساوي وانقسام السيتوبلازم.' },
] as const;

export const CYCLE_CHECKPOINTS = [
  { id: 'g1s', name: 'نقطة تفتيش G1/S', at: 'نهاية G1', note: 'هل الخلية كبيرة كفاية وDNA سليم؟ إن لا تدخل طور السكون G0.' },
  { id: 'g2m', name: 'نقطة تفتيش G2/M', at: 'نهاية G2', note: 'هل اكتملت مضاعفة DNA دون أخطاء؟' },
  { id: 'spindle', name: 'نقطة تفتيش المغزل', at: 'الطور الاستوائي', note: 'هل ارتبطت كل الكروموسومات بألياف المغزل؟' },
];

export const phasesFor = (mode: DivisionMode): Phase[] =>
  mode === 'meiosis' ? MEIOSIS_PHASES : MITOSIS_PHASES;

export interface DivisionStats {
  phase: Phase;
  index: number;
  total: number;
  /** Progress within the current phase 0..1. */
  phaseProgress: number;
  /** Overall progress 0..1. */
  overall: number;
  /** Total DNA content relative to a resting cell (2C = 1). */
  dnaContent: number;
  daughterCells: number;
  geneticallyIdentical: boolean;
}

/**
 * @param mode process to model
 * @param t normalised time 0..1 over the whole process
 */
export function computeDivision(mode: DivisionMode, t: number): DivisionStats {
  const phases = phasesFor(mode);
  const total = phases.reduce((s, p) => s + p.duration, 0);
  const clamped = Math.max(0, Math.min(0.9999, t));
  let acc = 0;
  let index = 0;
  let phaseProgress = 0;
  for (let i = 0; i < phases.length; i++) {
    const frac = phases[i].duration / total;
    if (clamped < acc + frac) {
      index = i;
      phaseProgress = (clamped - acc) / frac;
      break;
    }
    acc += frac;
    index = i;
    phaseProgress = 1;
  }
  const phase = phases[index];
  const dnaContent = (phase.chromosomes * phase.chromatids) / 4;

  return {
    phase,
    index,
    total: phases.length,
    phaseProgress,
    overall: clamped,
    dnaContent,
    daughterCells: phases[phases.length - 1].cells,
    geneticallyIdentical: mode === 'mitosis',
  };
}

/** DNA content vs time for the chart. */
export function dnaCurve(mode: DivisionMode, points = 100) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const t = i / points;
    const s = computeDivision(mode, t);
    return {
      t: Number((t * 100).toFixed(1)),
      dna: Number(s.dnaContent.toFixed(2)),
      chromosomes: s.phase.chromosomes,
      cells: s.phase.cells,
    };
  });
}

/** Comparison table rows between mitosis and meiosis. */
export const COMPARISON = [
  { key: 'عدد الانقسامات', mitosis: 'انقسام واحد', meiosis: 'انقسامان متتاليان' },
  { key: 'عدد الخلايا الناتجة', mitosis: 'خليتان', meiosis: 'أربع خلايا' },
  { key: 'عدد الكروموسومات', mitosis: 'يبقى 2n', meiosis: 'يصبح n (النصف)' },
  { key: 'التطابق الوراثي', mitosis: 'متطابقة مع الأم', meiosis: 'مختلفة وراثياً' },
  { key: 'العبور الجيني', mitosis: 'لا يحدث', meiosis: 'يحدث في التمهيدي الأول' },
  { key: 'مكان الحدوث', mitosis: 'الخلايا الجسمية', meiosis: 'الخلايا التناسلية' },
  { key: 'الوظيفة', mitosis: 'النمو وتعويض التالف', meiosis: 'إنتاج الأمشاج والتنوّع' },
];
