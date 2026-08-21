/**
 * Living cell: organelle catalogue for animal / plant / bacterial cells,
 * membrane transport (diffusion, osmosis, active transport) and tonicity.
 */

export type CellMode = 'explore' | 'compare' | 'transport';
export type CellType = 'animal' | 'plant' | 'bacteria';

export interface Organelle {
  id: string;
  name: string;
  nameEn: string;
  /** Function description in Arabic. */
  fn: string;
  color: string;
  /** Relative radius inside the cell model. */
  size: number;
  /** Normalised position inside the cell (x, y, z) in −1..1. */
  pos: [number, number, number];
  /** How many copies to render. */
  count: number;
  /** Which cell types contain it. */
  types: CellType[];
  shape: 'sphere' | 'box' | 'tube' | 'disc';
}

export const ORGANELLES: Organelle[] = [
  {
    id: 'nucleus',
    name: 'النواة',
    nameEn: 'Nucleus',
    fn: 'تحتوي DNA وتتحكّم في جميع أنشطة الخلية وانقسامها.',
    color: '#8b5cf6',
    size: 0.3,
    pos: [0, 0, 0],
    count: 1,
    types: ['animal', 'plant'],
    shape: 'sphere',
  },
  {
    id: 'nucleolus',
    name: 'النوية',
    nameEn: 'Nucleolus',
    fn: 'تصنع الرايبوسومات داخل النواة.',
    color: '#4c1d95',
    size: 0.11,
    pos: [0.08, 0.06, 0.05],
    count: 1,
    types: ['animal', 'plant'],
    shape: 'sphere',
  },
  {
    id: 'mitochondria',
    name: 'الميتوكندريا',
    nameEn: 'Mitochondrion',
    fn: 'التنفّس الخلوي وإنتاج طاقة ATP — «بيت طاقة الخلية».',
    color: '#ef4444',
    size: 0.13,
    pos: [0.55, 0.28, 0.2],
    count: 6,
    types: ['animal', 'plant'],
    shape: 'tube',
  },
  {
    id: 'chloroplast',
    name: 'البلاستيدة الخضراء',
    nameEn: 'Chloroplast',
    fn: 'موقع البناء الضوئي وتحويل ضوء الشمس إلى غذاء.',
    color: '#22c55e',
    size: 0.16,
    pos: [-0.55, 0.3, -0.2],
    count: 6,
    types: ['plant'],
    shape: 'disc',
  },
  {
    id: 'ribosome',
    name: 'الرايبوسومات',
    nameEn: 'Ribosome',
    fn: 'بناء البروتين بترجمة الشيفرة الوراثية mRNA.',
    color: '#f59e0b',
    size: 0.05,
    pos: [0.35, -0.4, 0.35],
    count: 16,
    types: ['animal', 'plant', 'bacteria'],
    shape: 'sphere',
  },
  {
    id: 'er-rough',
    name: 'الشبكة الإندوبلازمية الخشنة',
    nameEn: 'Rough ER',
    fn: 'تحمل الرايبوسومات وتنقل البروتينات المصنّعة.',
    color: '#38bdf8',
    size: 0.1,
    pos: [0.4, 0.05, -0.35],
    count: 4,
    types: ['animal', 'plant'],
    shape: 'box',
  },
  {
    id: 'er-smooth',
    name: 'الشبكة الإندوبلازمية الملساء',
    nameEn: 'Smooth ER',
    fn: 'تصنيع الدهون وإزالة سمّية بعض المواد.',
    color: '#0ea5e9',
    size: 0.09,
    pos: [-0.42, -0.1, 0.35],
    count: 3,
    types: ['animal', 'plant'],
    shape: 'box',
  },
  {
    id: 'golgi',
    name: 'جهاز جولجي',
    nameEn: 'Golgi apparatus',
    fn: 'تعديل البروتينات وتعبئتها وشحنها خارج الخلية.',
    color: '#ec4899',
    size: 0.12,
    pos: [-0.3, -0.45, -0.15],
    count: 4,
    types: ['animal', 'plant'],
    shape: 'disc',
  },
  {
    id: 'lysosome',
    name: 'الليسوسوم',
    nameEn: 'Lysosome',
    fn: 'يحتوي إنزيمات هاضمة تحلّل الفضلات والعضيات التالفة.',
    color: '#a3e635',
    size: 0.08,
    pos: [0.5, -0.3, -0.4],
    count: 4,
    types: ['animal'],
    shape: 'sphere',
  },
  {
    id: 'vacuole',
    name: 'الفجوة العصارية',
    nameEn: 'Central vacuole',
    fn: 'تخزّن الماء والأملاح وتحافظ على ضغط الامتلاء في النبات.',
    color: '#67e8f9',
    size: 0.42,
    pos: [-0.15, 0.12, 0.25],
    count: 1,
    types: ['plant'],
    shape: 'sphere',
  },
  {
    id: 'cellwall',
    name: 'الجدار الخلوي',
    nameEn: 'Cell wall',
    fn: 'طبقة سليولوزية صلبة تدعم الخلية النباتية وتحميها.',
    color: '#84cc16',
    size: 1.08,
    pos: [0, 0, 0],
    count: 1,
    types: ['plant', 'bacteria'],
    shape: 'sphere',
  },
  {
    id: 'membrane',
    name: 'الغشاء البلازمي',
    nameEn: 'Plasma membrane',
    fn: 'غشاء فسفوليبيدي شبه منفذ ينظّم دخول وخروج المواد.',
    color: '#fbbf24',
    size: 1,
    pos: [0, 0, 0],
    count: 1,
    types: ['animal', 'plant', 'bacteria'],
    shape: 'sphere',
  },
  {
    id: 'nucleoid',
    name: 'المنطقة النووية',
    nameEn: 'Nucleoid',
    fn: 'DNA حلقي حرّ في السيتوبلازم دون غشاء نووي (بدائيات النوى).',
    color: '#c084fc',
    size: 0.26,
    pos: [0, 0, 0],
    count: 1,
    types: ['bacteria'],
    shape: 'sphere',
  },
  {
    id: 'plasmid',
    name: 'البلازميد',
    nameEn: 'Plasmid',
    fn: 'حلقة DNA صغيرة إضافية تحمل صفات كمقاومة المضادات الحيوية.',
    color: '#f472b6',
    size: 0.1,
    pos: [0.45, 0.25, 0.1],
    count: 3,
    types: ['bacteria'],
    shape: 'tube',
  },
  {
    id: 'flagellum',
    name: 'السوط',
    nameEn: 'Flagellum',
    fn: 'زائدة خيطية تدفع البكتيريا للحركة.',
    color: '#e2e8f0',
    size: 0.12,
    pos: [-1.15, 0, 0],
    count: 1,
    types: ['bacteria'],
    shape: 'tube',
  },
  {
    id: 'cytoskeleton',
    name: 'الهيكل الخلوي',
    nameEn: 'Cytoskeleton',
    fn: 'شبكة بروتينية تحفظ شكل الخلية وتحرّك العضيات.',
    color: '#94a3b8',
    size: 0.03,
    pos: [0, 0, 0],
    count: 10,
    types: ['animal', 'plant'],
    shape: 'tube',
  },
];

export const organellesFor = (type: CellType) => ORGANELLES.filter((o) => o.types.includes(type));

export const findOrganelle = (id: string) => ORGANELLES.find((o) => o.id === id) ?? ORGANELLES[0];

export interface CellProfile {
  type: CellType;
  name: string;
  /** Typical diameter in micrometres. */
  size: string;
  dna: string;
  wall: string;
  domain: string;
  color: string;
}

export const CELL_PROFILES: Record<CellType, CellProfile> = {
  animal: {
    type: 'animal',
    name: 'خلية حيوانية',
    size: '10 – 30 µm',
    dna: 'خطي داخل نواة محاطة بغشاء',
    wall: 'لا يوجد جدار خلوي',
    domain: 'حقيقيات النوى',
    color: '#f472b6',
  },
  plant: {
    type: 'plant',
    name: 'خلية نباتية',
    size: '10 – 100 µm',
    dna: 'خطي داخل نواة محاطة بغشاء',
    wall: 'جدار سليولوزي + فجوة مركزية',
    domain: 'حقيقيات النوى',
    color: '#4ade80',
  },
  bacteria: {
    type: 'bacteria',
    name: 'خلية بكتيرية',
    size: '0.5 – 5 µm',
    dna: 'حلقي حرّ (منطقة نووية) + بلازميدات',
    wall: 'جدار من الببتيدوغليكان',
    domain: 'بدائيات النوى',
    color: '#38bdf8',
  },
};

/* ---------------- membrane transport ---------------- */

export type Tonicity = 'hypotonic' | 'isotonic' | 'hypertonic';

export interface TransportParams {
  /** Solute concentration outside the cell (mM). */
  outside: number;
  /** Solute concentration inside the cell (mM). */
  inside: number;
  /** Temperature (°C). */
  temperature: number;
  /** Membrane permeability 0..1. */
  permeability: number;
  /** ATP available for active transport 0..1. */
  atp: number;
  cellType: CellType;
}

export interface TransportStats {
  tonicity: Tonicity;
  tonicityLabel: string;
  /** Concentration gradient (outside − inside), mM. */
  gradient: number;
  /** Net water flow into the cell (arbitrary units, + = swelling). */
  waterFlux: number;
  /** Osmotic pressure difference (atm) via π = MRT. */
  osmoticPressure: number;
  /** Diffusion rate of the solute (arbitrary units). */
  diffusionRate: number;
  /** Active transport rate against the gradient. */
  activeRate: number;
  /** Cell volume factor: 1 = normal. */
  volumeFactor: number;
  /** Outcome description for this cell type. */
  outcome: string;
  /** True when the animal cell is at risk of lysis / crenation. */
  danger: boolean;
}

const R = 0.0821; // L·atm/(mol·K)

export function computeTransport(p: TransportParams): TransportStats {
  const gradient = p.outside - p.inside;
  const tK = p.temperature + 273.15;
  const osmoticPressure = (Math.abs(gradient) / 1000) * R * tK;
  const diffusionRate = p.permeability * gradient * (0.6 + (p.temperature / 37) * 0.4);
  const activeRate = p.atp * 0.8 * (gradient > 0 ? 0.4 : 1);
  const waterFlux = -gradient * p.permeability * 0.02;

  let tonicity: Tonicity = 'isotonic';
  if (gradient > 5) tonicity = 'hypertonic';
  else if (gradient < -5) tonicity = 'hypotonic';

  const raw = 1 + waterFlux * 0.35;
  const isPlantOrBac = p.cellType !== 'animal';
  const volumeFactor = Math.max(0.55, Math.min(isPlantOrBac ? 1.15 : 1.6, raw));

  const label: Record<Tonicity, string> = {
    hypotonic: 'وسط ناقص التوتّر',
    isotonic: 'وسط متساوي التوتّر',
    hypertonic: 'وسط زائد التوتّر',
  };

  let outcome = 'اتزان — دخول الماء يساوي خروجه، حجم الخلية ثابت.';
  if (tonicity === 'hypotonic') {
    outcome =
      p.cellType === 'animal'
        ? 'يدخل الماء بغزارة فتنتفخ الخلية وقد تنفجر (تحلّل).'
        : 'يدخل الماء فتصبح الخلية ممتلئة، والجدار يمنع انفجارها (ضغط الامتلاء).';
  } else if (tonicity === 'hypertonic') {
    outcome =
      p.cellType === 'animal'
        ? 'يخرج الماء فتنكمش الخلية ويتجعّد غشاؤها.'
        : 'يخرج الماء فينفصل الغشاء عن الجدار (البلزمة).';
  }

  const danger =
    p.cellType === 'animal' && (volumeFactor > 1.35 || volumeFactor < 0.72);

  return {
    tonicity,
    tonicityLabel: label[tonicity],
    gradient,
    waterFlux,
    osmoticPressure,
    diffusionRate,
    activeRate,
    volumeFactor,
    outcome,
    danger,
  };
}

/** Volume response across a sweep of external concentrations. */
export function tonicityCurve(p: TransportParams, points = 40) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const outside = (i * 600) / points;
    const s = computeTransport({ ...p, outside });
    return {
      outside: Math.round(outside),
      volume: Number(s.volumeFactor.toFixed(3)),
      flux: Number(s.waterFlux.toFixed(3)),
    };
  });
}

/** Diffusion vs active transport as ATP changes. */
export function transportRateCurve(p: TransportParams, points = 20) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const atp = i / points;
    const s = computeTransport({ ...p, atp });
    return {
      atp: Number(atp.toFixed(2)),
      passive: Number(Math.abs(s.diffusionRate).toFixed(3)),
      active: Number(s.activeRate.toFixed(3)),
    };
  });
}
