/**
 * Organic chemistry data model: 3D molecular geometries, bonding,
 * functional-group classification, isomer sets and simple reaction pathways.
 * Coordinates in ångström-like units (scaled for the 3D scene).
 */

export type OrganicMode = 'model' | 'isomers' | 'reaction';

export type Element = 'C' | 'H' | 'O' | 'N' | 'Cl' | 'Br';

export interface Atom {
  el: Element;
  x: number;
  y: number;
  z: number;
}

export interface Bond {
  a: number;
  b: number;
  order: 1 | 2 | 3;
}

export interface Molecule {
  id: string;
  name: string;
  nameEn: string;
  formula: string;
  family: string;
  group: string;
  /** Boiling point at 1 atm (°C). */
  bp: number;
  /** Short educational note. */
  note: string;
  atoms: Atom[];
  bonds: Bond[];
}

export const ELEMENT_COLOR: Record<Element, string> = {
  C: '#334155',
  H: '#e2e8f0',
  O: '#ef4444',
  N: '#3b82f6',
  Cl: '#22c55e',
  Br: '#b45309',
};

export const ELEMENT_RADIUS: Record<Element, number> = {
  C: 0.42,
  H: 0.26,
  O: 0.4,
  N: 0.4,
  Cl: 0.5,
  Br: 0.56,
};

export const ATOMIC_MASS: Record<Element, number> = {
  C: 12.011,
  H: 1.008,
  O: 15.999,
  N: 14.007,
  Cl: 35.45,
  Br: 79.904,
};

/* ---------- geometry helpers ---------- */

const T = 0.63; // tetrahedral zig-zag step
const L = 1.05; // C–C length in scene units

/** Build a straight zig-zag carbon backbone in the XY plane. */
function backbone(n: number, y0 = 0): Atom[] {
  const out: Atom[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ el: 'C', x: (i - (n - 1) / 2) * L, y: y0 + (i % 2 === 0 ? 0 : T), z: 0 });
  }
  return out;
}

/** Add hydrogens around a carbon to complete four bonds (visual approximation). */
function addH(atoms: Atom[], bonds: Bond[], ci: number, count: number, up = true) {
  const c = atoms[ci];
  const dirs = [
    [0, 0.95, 0.55],
    [0, 0.95, -0.55],
    [0.5, -0.35, 0.85],
    [-0.5, -0.35, -0.85],
    [0.85, 0.2, -0.6],
    [-0.85, 0.2, 0.6],
  ];
  for (let i = 0; i < count; i++) {
    const d = dirs[i % dirs.length];
    const s = up ? 1 : -1;
    atoms.push({ el: 'H', x: c.x + d[0] * 0.9, y: c.y + d[1] * 0.9 * s, z: c.z + d[2] * 0.9 });
    bonds.push({ a: ci, b: atoms.length - 1, order: 1 });
  }
}

/** Straight-chain alkane C(n)H(2n+2). */
function alkane(n: number): { atoms: Atom[]; bonds: Bond[] } {
  const atoms = backbone(n);
  const bonds: Bond[] = [];
  for (let i = 0; i < n - 1; i++) bonds.push({ a: i, b: i + 1, order: 1 });
  for (let i = 0; i < n; i++) {
    const h = i === 0 || i === n - 1 ? 3 : 2;
    addH(atoms, bonds, i, h, i % 2 === 0);
  }
  return { atoms, bonds };
}

/** Planar ring of carbons of radius r. */
function ring(n: number, r: number, planar = true): Atom[] {
  const out: Atom[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push({
      el: 'C',
      x: Math.cos(a) * r,
      y: planar ? 0 : (i % 2 === 0 ? 0.32 : -0.32),
      z: Math.sin(a) * r,
    });
  }
  return out;
}

function ringH(atoms: Atom[], bonds: Bond[], n: number, perC: number, r: number) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = atoms[i];
    if (perC >= 1) {
      atoms.push({ el: 'H', x: Math.cos(a) * (r + 0.95), y: c.y + 0.25, z: Math.sin(a) * (r + 0.95) });
      bonds.push({ a: i, b: atoms.length - 1, order: 1 });
    }
    if (perC >= 2) {
      atoms.push({ el: 'H', x: Math.cos(a) * (r + 0.6), y: c.y - 0.85, z: Math.sin(a) * (r + 0.6) });
      bonds.push({ a: i, b: atoms.length - 1, order: 1 });
    }
  }
}

/* ---------- molecule library ---------- */

function mol(
  base: Omit<Molecule, 'atoms' | 'bonds'>,
  geo: { atoms: Atom[]; bonds: Bond[] }
): Molecule {
  return { ...base, ...geo };
}

function buildBenzene(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms = ring(6, 1.35);
  const bonds: Bond[] = [];
  for (let i = 0; i < 6; i++) bonds.push({ a: i, b: (i + 1) % 6, order: i % 2 === 0 ? 2 : 1 });
  ringH(atoms, bonds, 6, 1, 1.35);
  return { atoms, bonds };
}

function buildCyclohexane(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms = ring(6, 1.4, false);
  const bonds: Bond[] = [];
  for (let i = 0; i < 6; i++) bonds.push({ a: i, b: (i + 1) % 6, order: 1 });
  ringH(atoms, bonds, 6, 2, 1.4);
  return { atoms, bonds };
}

function buildEthene(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -0.67, y: 0, z: 0 },
    { el: 'C', x: 0.67, y: 0, z: 0 },
  ];
  const bonds: Bond[] = [{ a: 0, b: 1, order: 2 }];
  const hs: [number, number, number, number][] = [
    [0, -1.5, 0.9, 0],
    [0, -1.5, -0.9, 0],
    [1, 1.5, 0.9, 0],
    [1, 1.5, -0.9, 0],
  ];
  hs.forEach(([c, x, y, z]) => {
    atoms.push({ el: 'H', x, y, z });
    bonds.push({ a: c, b: atoms.length - 1, order: 1 });
  });
  return { atoms, bonds };
}

function buildEthyne(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -0.6, y: 0, z: 0 },
    { el: 'C', x: 0.6, y: 0, z: 0 },
    { el: 'H', x: -1.65, y: 0, z: 0 },
    { el: 'H', x: 1.65, y: 0, z: 0 },
  ];
  return {
    atoms,
    bonds: [
      { a: 0, b: 1, order: 3 },
      { a: 0, b: 2, order: 1 },
      { a: 1, b: 3, order: 1 },
    ],
  };
}

function buildEthanol(): { atoms: Atom[]; bonds: Bond[] } {
  const { atoms, bonds } = alkane(2);
  // replace one hydrogen of C2 with an OH group
  const idx = atoms.findIndex((a, i) => a.el === 'H' && bonds.some((b) => b.b === i && b.a === 1));
  atoms[idx] = { el: 'O', x: atoms[1].x + 1.05, y: atoms[1].y + 0.55, z: 0.2 };
  atoms.push({ el: 'H', x: atoms[idx].x + 0.55, y: atoms[idx].y + 0.75, z: 0.4 });
  bonds.push({ a: idx, b: atoms.length - 1, order: 1 });
  return { atoms, bonds };
}

function buildAcid(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -1.1, y: 0, z: 0 },
    { el: 'C', x: 0.2, y: 0.35, z: 0 },
    { el: 'O', x: 0.5, y: 1.6, z: 0 },
    { el: 'O', x: 1.25, y: -0.5, z: 0 },
    { el: 'H', x: 2.15, y: -0.1, z: 0 },
  ];
  const bonds: Bond[] = [
    { a: 0, b: 1, order: 1 },
    { a: 1, b: 2, order: 2 },
    { a: 1, b: 3, order: 1 },
    { a: 3, b: 4, order: 1 },
  ];
  addH(atoms, bonds, 0, 3, true);
  return { atoms, bonds };
}

function buildAcetone(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -1.3, y: 0, z: 0 },
    { el: 'C', x: 0, y: 0.4, z: 0 },
    { el: 'C', x: 1.3, y: 0, z: 0 },
    { el: 'O', x: 0, y: 1.7, z: 0 },
  ];
  const bonds: Bond[] = [
    { a: 0, b: 1, order: 1 },
    { a: 1, b: 2, order: 1 },
    { a: 1, b: 3, order: 2 },
  ];
  addH(atoms, bonds, 0, 3, false);
  addH(atoms, bonds, 2, 3, false);
  return { atoms, bonds };
}

function buildEthanal(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -1.1, y: 0, z: 0 },
    { el: 'C', x: 0.2, y: 0.35, z: 0 },
    { el: 'O', x: 0.5, y: 1.6, z: 0 },
    { el: 'H', x: 1.05, y: -0.4, z: 0 },
  ];
  const bonds: Bond[] = [
    { a: 0, b: 1, order: 1 },
    { a: 1, b: 2, order: 2 },
    { a: 1, b: 3, order: 1 },
  ];
  addH(atoms, bonds, 0, 3, false);
  return { atoms, bonds };
}

function buildAmine(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -0.75, y: 0, z: 0 },
    { el: 'N', x: 0.75, y: 0.3, z: 0 },
    { el: 'H', x: 1.4, y: 1.1, z: 0.35 },
    { el: 'H', x: 1.25, y: -0.5, z: -0.5 },
  ];
  const bonds: Bond[] = [
    { a: 0, b: 1, order: 1 },
    { a: 1, b: 2, order: 1 },
    { a: 1, b: 3, order: 1 },
  ];
  addH(atoms, bonds, 0, 3, false);
  return { atoms, bonds };
}

function buildChloroethane(): { atoms: Atom[]; bonds: Bond[] } {
  const { atoms, bonds } = alkane(2);
  const idx = atoms.findIndex((a, i) => a.el === 'H' && bonds.some((b) => b.b === i && b.a === 1));
  atoms[idx] = { el: 'Cl', x: atoms[1].x + 1.2, y: atoms[1].y + 0.6, z: 0.3 };
  return { atoms, bonds };
}

function buildEster(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: -2.2, y: 0, z: 0 },
    { el: 'C', x: -1, y: 0.4, z: 0 },
    { el: 'O', x: -1, y: 1.7, z: 0 },
    { el: 'O', x: 0.15, y: -0.35, z: 0 },
    { el: 'C', x: 1.4, y: 0.25, z: 0 },
    { el: 'C', x: 2.6, y: -0.5, z: 0 },
  ];
  const bonds: Bond[] = [
    { a: 0, b: 1, order: 1 },
    { a: 1, b: 2, order: 2 },
    { a: 1, b: 3, order: 1 },
    { a: 3, b: 4, order: 1 },
    { a: 4, b: 5, order: 1 },
  ];
  addH(atoms, bonds, 0, 3, false);
  addH(atoms, bonds, 4, 2, true);
  addH(atoms, bonds, 5, 3, false);
  return { atoms, bonds };
}

function buildIsobutane(): { atoms: Atom[]; bonds: Bond[] } {
  const atoms: Atom[] = [
    { el: 'C', x: 0, y: 0, z: 0 },
    { el: 'C', x: -1.2, y: 0.7, z: 0.3 },
    { el: 'C', x: 1.2, y: 0.7, z: -0.3 },
    { el: 'C', x: 0, y: -0.6, z: 1.25 },
  ];
  const bonds: Bond[] = [
    { a: 0, b: 1, order: 1 },
    { a: 0, b: 2, order: 1 },
    { a: 0, b: 3, order: 1 },
  ];
  addH(atoms, bonds, 0, 1, false);
  addH(atoms, bonds, 1, 3, true);
  addH(atoms, bonds, 2, 3, true);
  addH(atoms, bonds, 3, 3, false);
  return { atoms, bonds };
}

export const MOLECULES: Molecule[] = [
  mol(
    {
      id: 'methane',
      name: 'الميثان',
      nameEn: 'Methane',
      formula: 'CH₄',
      family: 'ألكان',
      group: 'لا يوجد (هيدروكربون مشبع)',
      bp: -161,
      note: 'أبسط هيدروكربون، شكله رباعي السطوح بزاوية 109.5°.',
    },
    alkane(1)
  ),
  mol(
    {
      id: 'ethane',
      name: 'الإيثان',
      nameEn: 'Ethane',
      formula: 'C₂H₆',
      family: 'ألكان',
      group: 'روابط أحادية فقط',
      bp: -89,
      note: 'دوران حرّ حول الرابطة الأحادية C–C ينتج متصاوغات تشكّلية.',
    },
    alkane(2)
  ),
  mol(
    {
      id: 'propane',
      name: 'البروبان',
      nameEn: 'Propane',
      formula: 'C₃H₈',
      family: 'ألكان',
      group: 'روابط أحادية فقط',
      bp: -42,
      note: 'وقود منزلي شائع، سلسلة متعرّجة بثلاث ذرات كربون.',
    },
    alkane(3)
  ),
  mol(
    {
      id: 'butane',
      name: 'البيوتان',
      nameEn: 'n-Butane',
      formula: 'C₄H₁₀',
      family: 'ألكان',
      group: 'سلسلة مستقيمة',
      bp: -0.5,
      note: 'له متصاوغ سلسلي هو الأيزوبيوتان بخصائص فيزيائية مختلفة.',
    },
    alkane(4)
  ),
  mol(
    {
      id: 'isobutane',
      name: 'الأيزوبيوتان',
      nameEn: 'Isobutane',
      formula: 'C₄H₁₀',
      family: 'ألكان متفرّع',
      group: 'تفرّع في السلسلة',
      bp: -12,
      note: 'نفس الصيغة الجزيئية للبيوتان لكن التفرّع يخفض درجة الغليان.',
    },
    buildIsobutane()
  ),
  mol(
    {
      id: 'ethene',
      name: 'الإيثين',
      nameEn: 'Ethene',
      formula: 'C₂H₄',
      family: 'ألكين',
      group: 'رابطة مزدوجة C=C',
      bp: -104,
      note: 'مستوٍ بزاوية 120°، والدوران حول الرابطة المزدوجة ممنوع.',
    },
    buildEthene()
  ),
  mol(
    {
      id: 'ethyne',
      name: 'الإيثاين (أسيتيلين)',
      nameEn: 'Ethyne',
      formula: 'C₂H₂',
      family: 'ألكاين',
      group: 'رابطة ثلاثية C≡C',
      bp: -84,
      note: 'خطّي بزاوية 180°، يُستخدم في لحام الأكسي أسيتيلين.',
    },
    buildEthyne()
  ),
  mol(
    {
      id: 'cyclohexane',
      name: 'حلقي الهكسان',
      nameEn: 'Cyclohexane',
      formula: 'C₆H₁₂',
      family: 'هيدروكربون حلقي',
      group: 'حلقة مشبعة',
      bp: 81,
      note: 'يتخذ شكل الكرسي لتقليل الإجهاد الزاوي.',
    },
    buildCyclohexane()
  ),
  mol(
    {
      id: 'benzene',
      name: 'البنزين',
      nameEn: 'Benzene',
      formula: 'C₆H₆',
      family: 'أروماتي',
      group: 'حلقة عطرية مترافقة',
      bp: 80,
      note: 'إلكترونات π غير موضعية تمنح استقراراً عطرياً عالياً.',
    },
    buildBenzene()
  ),
  mol(
    {
      id: 'ethanol',
      name: 'الإيثانول',
      nameEn: 'Ethanol',
      formula: 'C₂H₅OH',
      family: 'كحول',
      group: 'هيدروكسيل ‎–OH',
      bp: 78,
      note: 'الروابط الهيدروجينية ترفع درجة غليانه كثيراً عن الإيثان.',
    },
    buildEthanol()
  ),
  mol(
    {
      id: 'acetic',
      name: 'حمض الإيثانويك',
      nameEn: 'Acetic acid',
      formula: 'CH₃COOH',
      family: 'حمض كربوكسيلي',
      group: 'كربوكسيل ‎–COOH',
      bp: 118,
      note: 'يكوّن ثنائيات عبر روابط هيدروجينية مزدوجة.',
    },
    buildAcid()
  ),
  mol(
    {
      id: 'ethanal',
      name: 'الإيثانال',
      nameEn: 'Ethanal',
      formula: 'CH₃CHO',
      family: 'ألدهيد',
      group: 'كربونيل طرفي ‎–CHO',
      bp: 20,
      note: 'يتأكسد بسهولة إلى حمض كربوكسيلي (اختبار تولنز).',
    },
    buildEthanal()
  ),
  mol(
    {
      id: 'acetone',
      name: 'البروبانون (أسيتون)',
      nameEn: 'Propanone',
      formula: 'CH₃COCH₃',
      family: 'كيتون',
      group: 'كربونيل داخلي C=O',
      bp: 56,
      note: 'مذيب قطبي لا يتأكسد بسهولة كالألدهيدات.',
    },
    buildAcetone()
  ),
  mol(
    {
      id: 'methylamine',
      name: 'ميثيل أمين',
      nameEn: 'Methylamine',
      formula: 'CH₃NH₂',
      family: 'أمين',
      group: 'أمين ‎–NH₂',
      bp: -6,
      note: 'قاعدي بسبب الزوج الإلكتروني الحر على النيتروجين.',
    },
    buildAmine()
  ),
  mol(
    {
      id: 'chloroethane',
      name: 'كلورو إيثان',
      nameEn: 'Chloroethane',
      formula: 'C₂H₅Cl',
      family: 'هاليد ألكيل',
      group: 'هالوجين ‎–Cl',
      bp: 12,
      note: 'يخضع لتفاعلات إحلال نيوكليوفيلي لتكوين الكحولات.',
    },
    buildChloroethane()
  ),
  mol(
    {
      id: 'ester',
      name: 'إيثانوات الإيثيل',
      nameEn: 'Ethyl ethanoate',
      formula: 'CH₃COOC₂H₅',
      family: 'إستر',
      group: 'إستر ‎–COO–',
      bp: 77,
      note: 'ناتج الأسترة بين حمض الإيثانويك والإيثانول، رائحته عطرية.',
    },
    buildEster()
  ),
];

export const findMolecule = (id: string): Molecule =>
  MOLECULES.find((m) => m.id === id) ?? MOLECULES[0];

/* ---------- computed properties ---------- */

export interface MoleculeStats {
  molecule: Molecule;
  counts: Partial<Record<Element, number>>;
  molarMass: number;
  bondCount: number;
  doubleBonds: number;
  tripleBonds: number;
  /** Degrees of unsaturation from the molecular formula. */
  unsaturation: number;
  saturated: boolean;
  /** Approximate polarity indicator 0..1. */
  polarity: number;
  hBonding: boolean;
}

export function computeMolecule(id: string): MoleculeStats {
  const m = findMolecule(id);
  const counts: Partial<Record<Element, number>> = {};
  m.atoms.forEach((a) => {
    counts[a.el] = (counts[a.el] ?? 0) + 1;
  });
  const molarMass = m.atoms.reduce((s, a) => s + ATOMIC_MASS[a.el], 0);
  const c = counts.C ?? 0;
  const h = counts.H ?? 0;
  const n = counts.N ?? 0;
  const x = (counts.Cl ?? 0) + (counts.Br ?? 0);
  const unsaturation = Math.max(0, (2 * c + 2 + n - h - x) / 2);
  const doubleBonds = m.bonds.filter((b) => b.order === 2).length;
  const tripleBonds = m.bonds.filter((b) => b.order === 3).length;
  const hetero = (counts.O ?? 0) + n + x;
  const polarity = Math.min(1, hetero / Math.max(c + 1, 1));
  const hBonding = m.atoms.some(
    (a, i) => (a.el === 'O' || a.el === 'N') && m.bonds.some((b) => (b.a === i && m.atoms[b.b].el === 'H') || (b.b === i && m.atoms[b.a].el === 'H'))
  );

  return {
    molecule: m,
    counts,
    molarMass,
    bondCount: m.bonds.length,
    doubleBonds,
    tripleBonds,
    unsaturation,
    saturated: unsaturation === 0,
    polarity,
    hBonding,
  };
}

/** Isomer sets sharing one molecular formula. */
export const ISOMER_SETS: { formula: string; label: string; ids: string[]; note: string }[] = [
  {
    formula: 'C₄H₁₀',
    label: 'متصاوغات سلسلية',
    ids: ['butane', 'isobutane'],
    note: 'نفس الصيغة الجزيئية واختلاف في تفرّع السلسلة؛ التفرّع يقلّل مساحة التلامس فتقلّ درجة الغليان.',
  },
  {
    formula: 'C₂H₆O',
    label: 'متصاوغات وظيفية',
    ids: ['ethanol', 'ethanal'],
    note: 'اختلاف المجموعة الوظيفية يغيّر الخصائص جذرياً رغم تقارب الكتلة المولية.',
  },
  {
    formula: 'C₃H₆O',
    label: 'ألدهيد مقابل كيتون',
    ids: ['acetone', 'ethanal'],
    note: 'موضع مجموعة الكربونيل (طرفي أو داخلي) يحدد سلوك الأكسدة.',
  },
];

/** Simple reaction pathways used by the animated reaction mode. */
export interface OrganicReaction {
  id: string;
  name: string;
  type: string;
  equation: string;
  reactants: string[];
  product: string;
  conditions: string;
  explanation: string;
}

export const ORGANIC_REACTIONS: OrganicReaction[] = [
  {
    id: 'esterification',
    name: 'الأسترة',
    type: 'تكاثف',
    equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
    reactants: ['acetic', 'ethanol'],
    product: 'ester',
    conditions: 'حمض كبريتيك مركّز، تسخين انعكاسي',
    explanation:
      'يهاجم الكحول كربون الكربونيل في الحمض فتُفقد جزيئة ماء ويتكوّن الإستر؛ التفاعل انعكاسي ويُزاح بإزالة الماء.',
  },
  {
    id: 'substitution',
    name: 'الإحلال النيوكليوفيلي',
    type: 'إحلال',
    equation: 'C₂H₅Cl + OH⁻ → C₂H₅OH + Cl⁻',
    reactants: ['chloroethane'],
    product: 'ethanol',
    conditions: 'هيدروكسيد الصوديوم المائي، تسخين',
    explanation:
      'يهاجم أيون الهيدروكسيد الكربون المرتبط بالكلور فينفصل أيون الكلوريد كمجموعة مغادرة ويتكوّن الكحول.',
  },
  {
    id: 'addition',
    name: 'الإضافة للهيدروجين',
    type: 'إضافة',
    equation: 'C₂H₄ + H₂ → C₂H₆',
    reactants: ['ethene'],
    product: 'ethane',
    conditions: 'عامل حفّاز نيكل عند 150°م',
    explanation: 'تنكسر رابطة π ويُضاف الهيدروجين على ذرتي الكربون فيتحوّل الألكين غير المشبع إلى ألكان مشبع.',
  },
  {
    id: 'oxidation',
    name: 'أكسدة الكحول',
    type: 'أكسدة',
    equation: 'C₂H₅OH + [O] → CH₃CHO + H₂O',
    reactants: ['ethanol'],
    product: 'ethanal',
    conditions: 'ثنائي كرومات البوتاسيوم الحمضية، تقطير',
    explanation: 'الكحول الأوّلي يتأكسد أولاً إلى ألدهيد، وبالأكسدة الكاملة يعطي حمضاً كربوكسيلياً.',
  },
];

export const findReactionO = (id: string): OrganicReaction =>
  ORGANIC_REACTIONS.find((r) => r.id === id) ?? ORGANIC_REACTIONS[0];

/** Boiling-point comparison data for the chart. */
export function boilingComparison() {
  return MOLECULES.map((m) => ({
    name: m.name,
    bp: m.bp,
    mass: Number(m.atoms.reduce((s, a) => s + ATOMIC_MASS[a.el], 0).toFixed(1)),
    family: m.family,
  }));
}
