/**
 * فيزياء التفاعلات النووية — محرك حسابي
 * Nuclear physics engine: fission, fusion, radioactive decay (SI + MeV units).
 */

export const AMU_MEV = 931.494102; // MeV per atomic mass unit
export const AVOGADRO = 6.02214076e23;
export const MEV_J = 1.602176634e-13;

export type NuclearMode = 'fission' | 'fusion' | 'decay';

export interface NuclearParams {
  mode: NuclearMode;
  /** neutron multiplication factor k for the chain reaction */
  multiplication: number;
  /** number of initial neutrons */
  initialNeutrons: number;
  /** plasma temperature in millions of kelvin (fusion) */
  plasmaMK: number;
  /** confinement/density factor 0.2 - 3 (fusion) */
  confinement: number;
  /** sample mass in grams (decay) */
  sampleGrams: number;
  /** half life in years (decay) */
  halfLifeYears: number;
  /** elapsed time in years (decay) */
  elapsedYears: number;
  /** number of chain generations to model (fission) */
  generations: number;
}

export interface NuclearStats {
  reactionLabel: string;
  /** mass defect in u */
  massDefect: number;
  /** energy released per single reaction, MeV */
  energyPerReaction: number;
  /** energy per nucleon, MeV */
  energyPerNucleon: number;
  /** binding energy per nucleon of the dominant product, MeV */
  bindingPerNucleon: number;
  /** total neutrons after N generations (fission) */
  chainNeutrons: number;
  /** total released energy in joules for the modelled event */
  totalEnergyJ: number;
  /** TNT equivalent in kilograms */
  tntKg: number;
  critical: boolean;
  criticalityLabel: string;
  /** fusion Lawson-like ignition score (>=1 ignites) */
  ignitionScore: number;
  ignited: boolean;
  /** decay */
  remainingFraction: number;
  remainingGrams: number;
  halfLivesPassed: number;
  decayConstant: number; // per year
  activityBq: number;
}

/** Fission of U-235: n + U235 -> Ba141 + Kr92 + 3n, ~200 MeV. */
const FISSION = {
  label: 'انشطار اليورانيوم-235',
  massDefect: 0.2154,
  perReaction: 200.6,
  nucleons: 236,
  bindingPerNucleon: 8.5,
  molarMass: 235,
};

/** D-T fusion: D + T -> He4 + n + 17.6 MeV. */
const FUSION = {
  label: 'اندماج الديوتيريوم–التريتيوم',
  massDefect: 0.01888,
  perReaction: 17.59,
  nucleons: 5,
  bindingPerNucleon: 7.07,
  molarMass: 5,
};

export const computeNuclear = (p: NuclearParams): NuclearStats => {
  const base = p.mode === 'fusion' ? FUSION : FISSION;

  // ---- chain reaction (fission) ----
  const k = Math.max(p.multiplication, 0.01);
  const gens = Math.max(1, Math.round(p.generations));
  const chainNeutrons = p.initialNeutrons * Math.pow(k, gens);
  const totalFissions =
    k === 1
      ? p.initialNeutrons * gens
      : p.initialNeutrons * ((Math.pow(k, gens) - 1) / (k - 1));

  const critical = k >= 1;
  const criticalityLabel = k < 0.98 ? 'دون الحرج (خامد)' : k <= 1.02 ? 'حرج (مستقر)' : 'فوق الحرج (متسارع)';

  // ---- fusion ignition ----
  // simplified: needs T ~ 150 MK and good confinement
  const ignitionScore = (p.plasmaMK / 150) * p.confinement;
  const ignited = ignitionScore >= 1;

  // ---- decay ----
  const halfLife = Math.max(p.halfLifeYears, 1e-6);
  const halfLivesPassed = p.elapsedYears / halfLife;
  const remainingFraction = Math.pow(0.5, halfLivesPassed);
  const remainingGrams = p.sampleGrams * remainingFraction;
  const decayConstant = Math.LN2 / halfLife; // per year
  const atoms = (remainingGrams / base.molarMass) * AVOGADRO;
  const activityBq = (decayConstant / (365.25 * 24 * 3600)) * atoms;

  // ---- energy accounting ----
  let reactions = 0;
  if (p.mode === 'fission') reactions = totalFissions;
  else if (p.mode === 'fusion') reactions = 1e12 * Math.max(ignitionScore, 0.05) * p.confinement;
  else reactions = atoms * (1 - remainingFraction || 0.0001) * 1e-12;

  const totalEnergyJ = reactions * base.perReaction * MEV_J;
  const tntKg = totalEnergyJ / 4.184e6;

  return {
    reactionLabel: p.mode === 'decay' ? 'اضمحلال إشعاعي' : base.label,
    massDefect: base.massDefect,
    energyPerReaction: base.perReaction,
    energyPerNucleon: base.perReaction / base.nucleons,
    bindingPerNucleon: base.bindingPerNucleon,
    chainNeutrons,
    totalEnergyJ,
    tntKg,
    critical,
    criticalityLabel,
    ignitionScore,
    ignited,
    remainingFraction,
    remainingGrams,
    halfLivesPassed,
    decayConstant,
    activityBq,
  };
};

/** Binding energy per nucleon curve (semi-empirical, smooth approximation). */
export const bindingEnergyCurve = (points = 60) =>
  Array.from({ length: points }, (_, i) => {
    const A = 2 + (i / (points - 1)) * 236;
    // approximate Weizsäcker with Z ≈ A/2 (adjusted for heavy nuclei)
    const Z = A <= 40 ? A / 2 : A / (1.98 + 0.0155 * Math.pow(A, 2 / 3));
    const N = A - Z;
    const aV = 15.75;
    const aS = 17.8;
    const aC = 0.711;
    const aA = 23.7;
    const B =
      aV * A -
      aS * Math.pow(A, 2 / 3) -
      (aC * Z * (Z - 1)) / Math.pow(A, 1 / 3) -
      (aA * Math.pow(N - Z, 2)) / A;
    return {
      'العدد الكتلي A': Math.round(A),
      'طاقة الربط لكل نوية (MeV)': Number(Math.max(B / A, 0).toFixed(3)),
    };
  });

/** Chain reaction growth per generation. */
export const chainCurve = (k: number, initial: number, gens: number) =>
  Array.from({ length: Math.max(gens, 1) + 1 }, (_, g) => ({
    'الجيل': g,
    'عدد النيوترونات': Number((initial * Math.pow(Math.max(k, 0.01), g)).toFixed(2)),
  }));

/** Radioactive decay curve. */
export const decayCurve = (halfLifeYears: number, spanYears: number, points = 80) =>
  Array.from({ length: points }, (_, i) => {
    const t = (i / (points - 1)) * spanYears;
    return {
      'الزمن (سنة)': Number(t.toFixed(2)),
      'النسبة المتبقية %': Number((Math.pow(0.5, t / Math.max(halfLifeYears, 1e-6)) * 100).toFixed(3)),
    };
  });
