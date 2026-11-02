// Scientific experiments the central AI can run. Results are computed here from the real equations
// (numerically where needed), never made up by the model; the model only picks the parameters and
// explains the numbers it gets back.

export type Metric = { label: string; value: number; unit?: string };
export type Series = { name: string; points: [number, number][] };
export type ExperimentResult = {
  id: string;
  title: string;
  equation: string;
  params: Metric[];
  metrics: Metric[];
  xLabel: string;
  yLabel: string;
  series: Series[];
};

type P = Record<string, unknown>;
const num = (p: P, k: string, def: number, min: number, max: number) => {
  const v = Number(p?.[k]);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
};
const r = (v: number, d = 3) => Number(v.toPrecision(d));

function projectile(p: P): ExperimentResult {
  const v0 = num(p, 'v0', 20, 0.1, 2000), ang = num(p, 'angle', 45, 0, 90), g = num(p, 'g', 9.81, 0.1, 50), h0 = num(p, 'height', 0, 0, 10000);
  const th = (ang * Math.PI) / 180, vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
  const T = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 80; i++) { const t = (T * i) / 80; pts.push([vx * t, Math.max(0, h0 + vy * t - 0.5 * g * t * t)]); }
  // compare with 30° / 60° launches at the same speed
  const other = (a: number): Series => {
    const t2 = (a * Math.PI) / 180, ux = v0 * Math.cos(t2), uy = v0 * Math.sin(t2), TT = (uy + Math.sqrt(uy * uy + 2 * g * h0)) / g;
    return { name: `${a}°`, points: Array.from({ length: 61 }, (_, i) => { const t = (TT * i) / 60; return [ux * t, Math.max(0, h0 + uy * t - 0.5 * g * t * t)] as [number, number]; }) };
  };
  return {
    id: 'projectile', title: 'حركة المقذوفات', equation: 'y = h₀ + v₀·sinθ·t − ½gt²',
    params: [{ label: 'السرعة الابتدائية', value: v0, unit: 'م/ث' }, { label: 'الزاوية', value: ang, unit: '°' }, { label: 'الجاذبية', value: g, unit: 'م/ث²' }],
    metrics: [
      { label: 'المدى', value: r(vx * T), unit: 'م' },
      { label: 'أقصى ارتفاع', value: r(h0 + (vy * vy) / (2 * g)), unit: 'م' },
      { label: 'زمن التحليق', value: r(T), unit: 'ث' },
    ],
    xLabel: 'المسافة الأفقية (م)', yLabel: 'الارتفاع (م)',
    series: [{ name: `${ang}°`, points: pts }, ...[30, 60].filter((a) => a !== ang).map(other)],
  };
}

function pendulum(p: P): ExperimentResult {
  const L = num(p, 'length', 1, 0.01, 100), g = num(p, 'g', 9.81, 0.1, 50), a0 = num(p, 'angle', 20, 1, 170), b = num(p, 'damping', 0.05, 0, 5);
  let th = (a0 * Math.PI) / 180, w = 0;
  const dt = 0.002, Tsmall = 2 * Math.PI * Math.sqrt(L / g), dur = Tsmall * 5;
  const pts: [number, number][] = [];
  let lastCross = -1, period = 0, prev = th;
  for (let t = 0, i = 0; t <= dur; t += dt, i++) {
    // RK2 on the full nonlinear equation θ'' = −(g/L)·sinθ − bθ'
    const acc = (x: number, v: number) => -(g / L) * Math.sin(x) - b * v;
    const k1w = acc(th, w), mth = th + (w * dt) / 2, mw = w + (k1w * dt) / 2;
    th += mw * dt; w += acc(mth, mw) * dt;
    if (prev > 0 && th <= 0) { if (lastCross >= 0 && !period) period = t - lastCross; lastCross = t; }
    prev = th;
    if (i % 10 === 0) pts.push([r(t, 4), (th * 180) / Math.PI]);
  }
  return {
    id: 'pendulum', title: 'البندول البسيط', equation: "θ'' = −(g/L)·sinθ − bθ'",
    params: [{ label: 'طول الخيط', value: L, unit: 'م' }, { label: 'زاوية البداية', value: a0, unit: '°' }, { label: 'التخميد', value: b }],
    metrics: [
      { label: 'الزمن الدوري (تقريب الزوايا الصغيرة)', value: r(Tsmall), unit: 'ث' },
      { label: 'الزمن الدوري المحسوب', value: r(period || Tsmall), unit: 'ث' },
      { label: 'التردد', value: r(1 / (period || Tsmall)), unit: 'هيرتز' },
    ],
    xLabel: 'الزمن (ث)', yLabel: 'الزاوية (°)', series: [{ name: 'θ(t)', points: pts }],
  };
}

function freeFallDrag(p: P): ExperimentResult {
  const m = num(p, 'mass', 70, 0.01, 10000), k = num(p, 'drag', 0.25, 0.0001, 100), g = 9.81, dur = num(p, 'duration', 20, 1, 300);
  const vt = Math.sqrt((m * g) / k);
  const withDrag: [number, number][] = [], vacuum: [number, number][] = [];
  let v = 0, y = 0, t95 = 0;
  for (let t = 0, i = 0; t <= dur; t += 0.01, i++) {
    v += (g - (k / m) * v * v) * 0.01; y += v * 0.01;
    if (!t95 && v >= 0.95 * vt) t95 = t;
    if (i % 20 === 0) { withDrag.push([r(t, 4), v]); vacuum.push([r(t, 4), g * t]); }
  }
  return {
    id: 'free_fall_drag', title: 'السقوط الحر مع مقاومة الهواء', equation: 'm·dv/dt = mg − kv²',
    params: [{ label: 'الكتلة', value: m, unit: 'كغ' }, { label: 'ثابت المقاومة k', value: k, unit: 'كغ/م' }],
    metrics: [
      { label: 'السرعة الحدية', value: r(vt), unit: 'م/ث' },
      { label: 'زمن الوصول إلى 95٪ منها', value: r(t95), unit: 'ث' },
      { label: 'المسافة المقطوعة', value: r(y), unit: 'م' },
    ],
    xLabel: 'الزمن (ث)', yLabel: 'السرعة (م/ث)',
    series: [{ name: 'مع الهواء', points: withDrag }, { name: 'في الفراغ', points: vacuum.filter(([, s]) => s <= vt * 1.6) }],
  };
}

function ohmsLaw(p: P): ExperimentResult {
  const V = num(p, 'voltage', 12, 0.001, 100000), R = num(p, 'resistance', 10, 0.001, 1e9);
  const line = (res: number): Series => ({ name: `${res} Ω`, points: Array.from({ length: 21 }, (_, i) => { const v = (V * i) / 20; return [r(v, 4), v / res] as [number, number]; }) });
  return {
    id: 'ohms_law', title: 'قانون أوم', equation: 'I = V / R ،  P = V·I',
    params: [{ label: 'الجهد', value: V, unit: 'فولت' }, { label: 'المقاومة', value: R, unit: 'أوم' }],
    metrics: [{ label: 'التيار', value: r(V / R), unit: 'أمبير' }, { label: 'القدرة', value: r((V * V) / R), unit: 'واط' }],
    xLabel: 'الجهد (فولت)', yLabel: 'التيار (أمبير)',
    series: [line(R), line(R * 2), line(R / 2)],
  };
}

function decay(p: P): ExperimentResult {
  const h = num(p, 'half_life', 5, 1e-6, 1e12), N0 = num(p, 'n0', 1000, 1, 1e30), dur = num(p, 'duration', h * 5, h / 10, h * 50);
  const lam = Math.LN2 / h;
  const pts = Array.from({ length: 101 }, (_, i) => { const t = (dur * i) / 100; return [r(t, 4), N0 * Math.exp(-lam * t)] as [number, number]; });
  return {
    id: 'radioactive_decay', title: 'التحلل الإشعاعي', equation: 'N = N₀·e^(−λt) ،  λ = ln2 / t½',
    params: [{ label: 'عمر النصف', value: h, unit: 'وحدة زمن' }, { label: 'عدد الأنوية الابتدائي', value: N0 }],
    metrics: [
      { label: 'ثابت التحلل λ', value: r(lam), unit: '1/وحدة زمن' },
      { label: 'المتبقي في النهاية', value: r(N0 * Math.exp(-lam * dur)) },
      { label: 'متوسط العمر', value: r(1 / lam), unit: 'وحدة زمن' },
    ],
    xLabel: 'الزمن', yLabel: 'عدد الأنوية', series: [{ name: 'N(t)', points: pts }],
  };
}

function idealGas(p: P): ExperimentResult {
  const n = num(p, 'moles', 1, 1e-6, 1e6), V = num(p, 'volume', 0.0224, 1e-6, 1e6), R = 8.314;
  const curve = (vol: number): Series => ({ name: `${r(vol * 1000)} لتر`, points: Array.from({ length: 31 }, (_, i) => { const T = 100 + i * 20; return [T, (n * R * T) / vol / 1000] as [number, number]; }) });
  return {
    id: 'ideal_gas', title: 'قانون الغاز المثالي', equation: 'PV = nRT',
    params: [{ label: 'عدد المولات', value: n, unit: 'مول' }, { label: 'الحجم', value: r(V * 1000), unit: 'لتر' }],
    metrics: [
      { label: 'الضغط عند 273 كلفن', value: r((n * R * 273.15) / V / 1000), unit: 'كيلوباسكال' },
      { label: 'الضغط عند 373 كلفن', value: r((n * R * 373.15) / V / 1000), unit: 'كيلوباسكال' },
    ],
    xLabel: 'درجة الحرارة (كلفن)', yLabel: 'الضغط (كيلوباسكال)', series: [curve(V), curve(V * 2)],
  };
}

function spring(p: P): ExperimentResult {
  const k = num(p, 'k', 50, 0.001, 1e7), m = num(p, 'mass', 2, 0.001, 1e6), A = num(p, 'amplitude', 0.1, 1e-4, 100), c = num(p, 'damping', 0.3, 0, 1e4);
  const w0 = Math.sqrt(k / m), T = (2 * Math.PI) / w0, dur = T * 6;
  let x = A, v = 0;
  const pts: [number, number][] = [];
  for (let t = 0, i = 0; t <= dur; t += T / 400, i++) {
    const dt = T / 400, a1 = (-k * x - c * v) / m, xm = x + (v * dt) / 2, vm = v + (a1 * dt) / 2;
    x += vm * dt; v += ((-k * xm - c * vm) / m) * dt;
    if (i % 4 === 0) pts.push([r(t, 4), x]);
  }
  return {
    id: 'spring_oscillator', title: 'النابض (قانون هوك)', equation: "m·x'' = −kx − cx'",
    params: [{ label: 'ثابت النابض', value: k, unit: 'ن/م' }, { label: 'الكتلة', value: m, unit: 'كغ' }, { label: 'السعة', value: A, unit: 'م' }],
    metrics: [
      { label: 'الزمن الدوري', value: r(T), unit: 'ث' },
      { label: 'الطاقة الابتدائية', value: r(0.5 * k * A * A), unit: 'جول' },
      { label: 'أقصى سرعة', value: r(w0 * A), unit: 'م/ث' },
    ],
    xLabel: 'الزمن (ث)', yLabel: 'الإزاحة (م)', series: [{ name: 'x(t)', points: pts }],
  };
}

function titration(p: P): ExperimentResult {
  const Ca = num(p, 'acid_conc', 0.1, 1e-5, 10), Va = num(p, 'acid_volume', 25, 0.1, 1000), Cb = num(p, 'base_conc', 0.1, 1e-5, 10);
  const Veq = (Ca * Va) / Cb, Kw = 1e-14;
  const pH = (Vb: number) => {
    const na = Ca * Va, nb = Cb * Vb, Vt = (Va + Vb) / 1000;
    const d = (na - nb) / 1000 / Vt; // excess H+ (mol/L) if positive
    // exact charge balance for strong acid + strong base: [H+] − Kw/[H+] = d
    const h = (d + Math.sqrt(d * d + 4 * Kw)) / 2;
    return -Math.log10(h);
  };
  const pts = Array.from({ length: 161 }, (_, i) => { const vb = (Veq * 2 * i) / 160; return [r(vb, 4), pH(vb)] as [number, number]; });
  return {
    id: 'titration', title: 'معايرة حمض قوي بقاعدة قوية', equation: '[H⁺] − Kw/[H⁺] = (nₐ − n_b)/V',
    params: [{ label: 'تركيز الحمض', value: Ca, unit: 'مول/لتر' }, { label: 'حجم الحمض', value: Va, unit: 'مل' }, { label: 'تركيز القاعدة', value: Cb, unit: 'مول/لتر' }],
    metrics: [
      { label: 'حجم القاعدة عند نقطة التكافؤ', value: r(Veq), unit: 'مل' },
      { label: 'pH البداية', value: r(pH(0)) },
      { label: 'pH عند التكافؤ', value: r(pH(Veq)) },
    ],
    xLabel: 'حجم القاعدة المضافة (مل)', yLabel: 'pH', series: [{ name: 'pH', points: pts }],
  };
}

function population(p: P): ExperimentResult {
  const rr = num(p, 'r', 0.4, 0.0001, 10), K = num(p, 'K', 1000, 1, 1e12), n0 = num(p, 'n0', 10, 0.001, 1e12), dur = num(p, 'duration', 30, 1, 1000);
  const logi = (t: number) => K / (1 + ((K - n0) / n0) * Math.exp(-rr * t));
  const pts = Array.from({ length: 101 }, (_, i) => { const t = (dur * i) / 100; return [r(t, 4), logi(t)] as [number, number]; });
  const expo = pts.map(([t]) => [t, n0 * Math.exp(rr * t)] as [number, number]).filter(([, y]) => y <= K * 1.5);
  return {
    id: 'population_growth', title: 'النمو السكاني اللوجستي', equation: 'dN/dt = rN(1 − N/K)',
    params: [{ label: 'معدل النمو r', value: rr }, { label: 'السعة الحاملة K', value: K }, { label: 'العدد الابتدائي', value: n0 }],
    metrics: [
      { label: 'العدد في النهاية', value: r(logi(dur)) },
      { label: 'زمن الوصول لنصف السعة', value: r(Math.log((K - n0) / n0) / rr) },
      { label: 'أقصى معدل نمو', value: r((rr * K) / 4), unit: 'فرد/وحدة زمن' },
    ],
    xLabel: 'الزمن', yLabel: 'عدد الأفراد', series: [{ name: 'لوجستي', points: pts }, { name: 'أسّي (بلا حدود)', points: expo }],
  };
}

const RUNNERS: Record<string, (p: P) => ExperimentResult> = {
  projectile, pendulum, free_fall_drag: freeFallDrag, ohms_law: ohmsLaw, radioactive_decay: decay,
  ideal_gas: idealGas, spring_oscillator: spring, titration, population_growth: population,
};

export function runExperiment(id: string, params: P = {}): ExperimentResult | null {
  const fn = RUNNERS[id];
  return fn ? fn(params ?? {}) : null;
}
