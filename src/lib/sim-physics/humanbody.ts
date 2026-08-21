/**
 * Human body physiology models: cardiovascular haemodynamics, pulmonary
 * ventilation and gas exchange, neural conduction, digestion transit,
 * renal filtration and skeletal-muscle mechanics.
 *
 * All formulas are the standard teaching-level relations used in secondary
 * biology / human physiology courses.
 */

export type BodySystem =
  | 'circulatory'
  | 'respiratory'
  | 'nervous'
  | 'digestive'
  | 'urinary'
  | 'muscular';

export interface BodyParams {
  /** Heart rate, beats per minute. */
  heartRate: number;
  /** Stroke volume, mL per beat. */
  strokeVolume: number;
  /** Respiratory (breathing) rate, breaths per minute. */
  breathRate: number;
  /** Tidal volume, mL per breath. */
  tidalVolume: number;
  /** Fraction of inspired oxygen, % (21 % = air). */
  fio2: number;
  /** Physical activity level 0..1 (rest → maximal effort). */
  activity: number;
  /** Hydration status 0..1. */
  hydration: number;
  /** Blood haemoglobin, g/dL. */
  hemoglobin: number;
  /** Core body temperature, °C. */
  temperature: number;
}

export const DEFAULT_BODY: BodyParams = {
  heartRate: 72,
  strokeVolume: 70,
  breathRate: 14,
  tidalVolume: 500,
  fio2: 21,
  activity: 0.1,
  hydration: 0.9,
  hemoglobin: 14,
  temperature: 37,
};

export const BODY_PRESETS: Record<string, { label: string; params: Partial<BodyParams> }> = {
  rest: {
    label: 'راحة',
    params: { heartRate: 68, strokeVolume: 70, breathRate: 13, tidalVolume: 500, activity: 0.05, temperature: 37 },
  },
  exercise: {
    label: 'جهد رياضي',
    params: { heartRate: 155, strokeVolume: 110, breathRate: 34, tidalVolume: 1800, activity: 0.85, temperature: 38.4 },
  },
  sleep: {
    label: 'نوم',
    params: { heartRate: 52, strokeVolume: 65, breathRate: 10, tidalVolume: 420, activity: 0.02, temperature: 36.4 },
  },
  anemia: {
    label: 'فقر دم',
    params: { hemoglobin: 8, heartRate: 96, activity: 0.15 },
  },
  altitude: {
    label: 'ارتفاع عالٍ',
    params: { fio2: 13, breathRate: 22, heartRate: 92 },
  },
  dehydration: {
    label: 'جفاف',
    params: { hydration: 0.35, heartRate: 104, strokeVolume: 55 },
  },
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Alveolar oxygen partial pressure (simplified alveolar gas equation), mmHg. */
export function alveolarPO2(fio2: number, alveolarVentilation: number): number {
  const pio2 = (fio2 / 100) * (760 - 47);
  // CO2 removal improves with ventilation; 4.2 L/min is a normal reference.
  const paco2 = clamp(40 * (4.2 / Math.max(0.4, alveolarVentilation)), 18, 90);
  return clamp(pio2 - paco2 / 0.8, 10, 660);
}

/**
 * Oxyhaemoglobin dissociation curve (Hill equation, n ≈ 2.7, P50 ≈ 26.6 mmHg)
 * with a Bohr shift from temperature and CO2 / acidity.
 */
export function hbSaturation(po2: number, temperature = 37, paco2 = 40): number {
  const p50 = 26.6 * Math.pow(10, 0.024 * (temperature - 37) + 0.06 * Math.log10(paco2 / 40) * 10 * 0.1);
  const n = 2.7;
  const s = Math.pow(po2, n) / (Math.pow(po2, n) + Math.pow(p50, n));
  return clamp(s, 0, 1);
}

export interface BodyStats {
  /** Cardiac output, L/min. */
  cardiacOutput: number;
  /** Mean arterial pressure, mmHg. */
  map: number;
  systolic: number;
  diastolic: number;
  pulsePressure: number;
  /** Ejection fraction, %. */
  ejectionFraction: number;
  /** Minute ventilation, L/min. */
  minuteVentilation: number;
  /** Alveolar ventilation, L/min (tidal volume minus 150 mL dead space). */
  alveolarVentilation: number;
  /** Arterial O2 partial pressure, mmHg. */
  pao2: number;
  /** Arterial CO2 partial pressure, mmHg. */
  paco2: number;
  /** Haemoglobin saturation, %. */
  spo2: number;
  /** Arterial oxygen content, mL O2 / dL blood. */
  cao2: number;
  /** Oxygen delivery to tissues, mL/min. */
  do2: number;
  /** Oxygen consumption, mL/min. */
  vo2: number;
  /** Blood pH (approximate, from PaCO2). */
  ph: number;
  /** Nerve conduction velocity, m/s (myelinated motor fibre). */
  conductionVelocity: number;
  /** Reflex arc latency, ms. */
  reflexLatency: number;
  /** Glomerular filtration rate, mL/min. */
  gfr: number;
  /** Daily urine output, L/day. */
  urineOutput: number;
  /** Gut transit time, hours. */
  transitTime: number;
  /** Muscle power output, watts. */
  musclePower: number;
  /** Fraction of ATP coming from anaerobic glycolysis. */
  anaerobicFraction: number;
  /** Blood lactate, mmol/L. */
  lactate: number;
  /** Basal + activity energy expenditure, kcal/day. */
  energy: number;
  /** Overall homeostasis assessment. */
  status: string;
  /** Warnings shown to the learner. */
  alerts: string[];
}

export function computeBody(p: BodyParams): BodyStats {
  // ---- Cardiovascular ----
  const cardiacOutput = (p.heartRate * p.strokeVolume) / 1000; // L/min
  const svr = 18 * (0.85 + 0.3 * (1 - p.activity)) * (0.7 + 0.4 * p.hydration); // resistance units
  const map = clamp(cardiacOutput * svr + 8, 40, 180);
  const pulsePressure = clamp(p.strokeVolume * 0.55 * (0.8 + 0.4 * p.hydration), 12, 90);
  const diastolic = clamp(map - pulsePressure / 3, 30, 140);
  const systolic = diastolic + pulsePressure;
  const edv = p.strokeVolume + 50 * (1.2 - 0.4 * p.activity);
  const ejectionFraction = clamp((p.strokeVolume / edv) * 100, 15, 80);

  // ---- Respiratory ----
  const deadSpace = 150;
  const minuteVentilation = (p.breathRate * p.tidalVolume) / 1000;
  const alveolarVentilation = (p.breathRate * Math.max(0, p.tidalVolume - deadSpace)) / 1000;
  const paco2 = clamp(40 * (4.2 / Math.max(0.4, alveolarVentilation)) * (1 + p.activity * 0.35), 15, 95);
  const pAO2 = alveolarPO2(p.fio2, alveolarVentilation);
  const pao2 = clamp(pAO2 - 8, 8, 640); // A–a gradient
  const spo2 = hbSaturation(pao2, p.temperature, paco2) * 100;
  const cao2 = 1.34 * p.hemoglobin * (spo2 / 100) + 0.003 * pao2;
  const do2 = cao2 * cardiacOutput * 10; // mL O2 / min
  const vo2Demand = 250 + 2600 * p.activity; // mL/min
  const vo2 = Math.min(vo2Demand, do2 * 0.75);
  const ph = clamp(7.4 + 0.008 * (40 - paco2) - 0.15 * Math.max(0, p.activity - 0.6), 6.9, 7.7);

  // ---- Nervous ----
  const conductionVelocity = clamp(60 * (1 + 0.02 * (p.temperature - 37)) * (0.6 + 0.4 * p.hydration), 5, 120);
  const reflexLatency = clamp((1.0 / conductionVelocity) * 1000 + 12, 14, 90); // ~1 m arc + synapse

  // ---- Renal ----
  const renalPerfusion = clamp((map - 45) / 55, 0, 1.6);
  const gfr = clamp(125 * renalPerfusion * (0.5 + 0.5 * p.hydration), 0, 190);
  const urineOutput = clamp(1.6 * (p.hydration - 0.2) * 2 * (gfr / 125) * (1 - p.activity * 0.4), 0.1, 4.5);

  // ---- Digestive ----
  const transitTime = clamp(30 * (1.15 - 0.35 * p.hydration) * (1 - p.activity * 0.25), 10, 60);

  // ---- Muscular / metabolic ----
  const aerobicCap = do2 * 0.75;
  const anaerobicFraction = clamp((vo2Demand - aerobicCap) / Math.max(1, vo2Demand), 0, 1);
  const musclePower = clamp(vo2Demand * 0.075, 12, 320);
  const lactate = clamp(1 + anaerobicFraction * 14, 0.6, 16);
  const energy = 1650 + 2400 * p.activity;

  const alerts: string[] = [];
  if (spo2 < 90) alerts.push('نقص أكسجة (SpO₂ < 90%)');
  if (paco2 > 50) alerts.push('احتباس CO₂ — حماض تنفّسي');
  if (paco2 < 30) alerts.push('فرط تهوية — قلاء تنفّسي');
  if (map < 60) alerts.push('انخفاض ضغط: تروية أعضاء غير كافية');
  if (map > 120) alerts.push('ارتفاع ضغط شرياني');
  if (p.hemoglobin < 10) alerts.push('فقر دم: سعة حمل أكسجين منخفضة');
  if (lactate > 4) alerts.push('تجاوز عتبة اللاكتات — تعب عضلي');
  if (urineOutput < 0.5) alerts.push('قلة بول — خطر جفاف');
  if (p.temperature > 38.5) alerts.push('ارتفاع حرارة');

  const status = alerts.length === 0 ? 'اتزان داخلي مستقر' : alerts.length <= 2 ? 'ضغط فسيولوجي' : 'اختلال الاتزان الداخلي';

  return {
    cardiacOutput,
    map,
    systolic,
    diastolic,
    pulsePressure,
    ejectionFraction,
    minuteVentilation,
    alveolarVentilation,
    pao2,
    paco2,
    spo2,
    cao2,
    do2,
    vo2,
    ph,
    conductionVelocity,
    reflexLatency,
    gfr,
    urineOutput,
    transitTime,
    musclePower,
    anaerobicFraction,
    lactate,
    energy,
    status,
    alerts,
  };
}

/** Oxyhaemoglobin dissociation curve data (with the current operating point). */
export function dissociationCurve(p: BodyParams, points = 60) {
  const s = computeBody(p);
  return Array.from({ length: points + 1 }, (_, i) => {
    const po2 = (i / points) * 120;
    return {
      po2: Number(po2.toFixed(0)),
      normal: Number((hbSaturation(po2, 37, 40) * 100).toFixed(1)),
      current: Number((hbSaturation(po2, p.temperature, s.paco2) * 100).toFixed(1)),
    };
  });
}

/** Cardiac output and MAP vs heart rate (shows the plateau from reduced filling). */
export function heartRateCurve(p: BodyParams, points = 50) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const heartRate = 40 + (i / points) * 160;
    // Filling time shortens at high rates → stroke volume falls.
    const strokeVolume = p.strokeVolume * clamp(1.15 - Math.max(0, heartRate - 150) / 160, 0.5, 1.15);
    const s = computeBody({ ...p, heartRate, strokeVolume });
    return {
      hr: Number(heartRate.toFixed(0)),
      co: Number(s.cardiacOutput.toFixed(2)),
      map: Number(s.map.toFixed(0)),
    };
  });
}

/** Ventilation, PaCO2 and SpO2 vs activity level. */
export function activityCurve(p: BodyParams, points = 40) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const activity = i / points;
    const heartRate = 65 + 110 * activity;
    const breathRate = 12 + 30 * activity;
    const tidalVolume = 480 + 1500 * activity;
    const s = computeBody({ ...p, activity, heartRate, breathRate, tidalVolume });
    return {
      activity: Number((activity * 100).toFixed(0)),
      ve: Number(s.minuteVentilation.toFixed(1)),
      vo2: Number((s.vo2 / 1000).toFixed(2)),
      lactate: Number(s.lactate.toFixed(2)),
    };
  });
}

/** Synthetic ECG (PQRST) trace for the current heart rate. */
export function ecgTrace(heartRate: number, points = 300) {
  const beats = 3;
  const period = 60 / Math.max(30, heartRate);
  const total = period * beats;
  const gauss = (x: number, mu: number, s: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * s * s));
  return Array.from({ length: points }, (_, i) => {
    const t = (i / (points - 1)) * total;
    const phase = (t % period) / period;
    const mv =
      gauss(phase, 0.16, 0.028, 0.12) + // P
      gauss(phase, 0.29, 0.008, -0.11) + // Q
      gauss(phase, 0.32, 0.009, 1.0) + // R
      gauss(phase, 0.35, 0.011, -0.22) + // S
      gauss(phase, 0.56, 0.05, 0.28); // T
    return { t: Number(t.toFixed(3)), mv: Number(mv.toFixed(3)) };
  });
}

/** Spirometry-style volume trace over time. */
export function spirometryTrace(p: BodyParams, points = 240) {
  const period = 60 / Math.max(4, p.breathRate);
  const total = period * 3;
  return Array.from({ length: points }, (_, i) => {
    const t = (i / (points - 1)) * total;
    const phase = (t % period) / period;
    // Faster inspiration than expiration.
    const v = phase < 0.4 ? Math.sin((phase / 0.4) * (Math.PI / 2)) : Math.cos(((phase - 0.4) / 0.6) * (Math.PI / 2));
    return {
      t: Number(t.toFixed(2)),
      volume: Number((2200 + v * p.tidalVolume).toFixed(0)),
    };
  });
}

export interface OrganInfo {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  detail: string;
  color: string;
}

export const SYSTEM_INFO: Record<BodySystem, {
  name: string;
  nameEn: string;
  summary: string;
  organs: OrganInfo[];
}> = {
  circulatory: {
    name: 'الجهاز الدوري',
    nameEn: 'Circulatory System',
    summary:
      'مضخة عضلية رباعية الحجرات تدفع الدم في دورتين: الدورة الرئوية إلى الرئتين لتحميل الأكسجين، والدورة الجهازية إلى بقية الجسم لتسليمه.',
    organs: [
      { id: 'ra', name: 'الأذين الأيمن', nameEn: 'Right Atrium', role: 'يستقبل الدم غير المؤكسج', detail: 'يأتي الدم من الأجوفين العلوي والسفلي ثم يمرّ عبر الصمام ثلاثي الشرف.', color: '#3b82f6' },
      { id: 'rv', name: 'البطين الأيمن', nameEn: 'Right Ventricle', role: 'يضخ إلى الرئتين', detail: 'جداره أرقّ لأن مقاومة الدورة الرئوية منخفضة.', color: '#2563eb' },
      { id: 'la', name: 'الأذين الأيسر', nameEn: 'Left Atrium', role: 'يستقبل الدم المؤكسج', detail: 'يعود الدم من الأوردة الرئوية الأربعة.', color: '#ef4444' },
      { id: 'lv', name: 'البطين الأيسر', nameEn: 'Left Ventricle', role: 'يضخ إلى كل الجسم', detail: 'أسمك حجرة في القلب لأنه يولّد الضغط الجهازي.', color: '#dc2626' },
      { id: 'cap', name: 'الشعيرات الدموية', nameEn: 'Capillaries', role: 'موقع التبادل', detail: 'جدارها بسمك خلية واحدة فيتم تبادل الغازات والمغذّيات بالانتشار.', color: '#a855f7' },
    ],
  },
  respiratory: {
    name: 'الجهاز التنفسي',
    nameEn: 'Respiratory System',
    summary:
      'ينقل الهواء عبر القصبة والشعب إلى نحو 300 مليون حويصلة هوائية تبلغ مساحتها ~70 م²، حيث تنتشر الغازات عبر غشاء رقيق جداً.',
    organs: [
      { id: 'trachea', name: 'القصبة الهوائية', nameEn: 'Trachea', role: 'ممر الهواء الرئيسي', detail: 'مدعومة بحلقات غضروفية تمنع انسدادها.', color: '#94a3b8' },
      { id: 'bronchi', name: 'الشُّعب الهوائية', nameEn: 'Bronchi', role: 'تفرّع الهواء', detail: 'تتفرّع نحو 23 مرة حتى القصيبات النهائية.', color: '#64748b' },
      { id: 'alveoli', name: 'الحويصلات الهوائية', nameEn: 'Alveoli', role: 'تبادل الغازات', detail: 'ينتشر O₂ إلى الدم وCO₂ إلى الهواء حسب فرق الضغط الجزئي.', color: '#38bdf8' },
      { id: 'diaphragm', name: 'الحجاب الحاجز', nameEn: 'Diaphragm', role: 'محرّك الشهيق', detail: 'انقباضه يوسّع الصدر فينخفض الضغط الداخلي ويدخل الهواء.', color: '#f97316' },
    ],
  },
  nervous: {
    name: 'الجهاز العصبي',
    nameEn: 'Nervous System',
    summary:
      'شبكة اتصال كهروكيميائية: جهد الفعل يسير قفزياً بين عقد رانفييه على المحاور المُميلَنة، وينتقل بين الخلايا عبر النواقل العصبية.',
    organs: [
      { id: 'brain', name: 'الدماغ', nameEn: 'Brain', role: 'المعالجة العليا', detail: 'القشرة الحركية والحسية والمخيخ ومراكز التنفس في جذع الدماغ.', color: '#a78bfa' },
      { id: 'cord', name: 'الحبل الشوكي', nameEn: 'Spinal Cord', role: 'ناقل ومركز انعكاسات', detail: 'القوس الانعكاسي يستجيب قبل وصول الإشارة إلى الدماغ.', color: '#c4b5fd' },
      { id: 'axon', name: 'المحور العصبي', nameEn: 'Axon', role: 'نقل جهد الفعل', detail: 'الميالين يعزل المحور فيقفز الجهد بين العقد بسرعة تصل 120 م/ث.', color: '#fbbf24' },
      { id: 'synapse', name: 'المشبك العصبي', nameEn: 'Synapse', role: 'نقل كيميائي', detail: 'حويصلات النواقل العصبية تُفرَغ في الشق المشبكي عند وصول الجهد.', color: '#34d399' },
    ],
  },
  digestive: {
    name: 'الجهاز الهضمي',
    nameEn: 'Digestive System',
    summary:
      'أنبوب بطول ~9 أمتار يحوّل الطعام إلى جزيئات قابلة للامتصاص بالهضم الميكانيكي والإنزيمي ثم يمتصّها عبر الخملات المعوية.',
    organs: [
      { id: 'mouth', name: 'الفم', nameEn: 'Mouth', role: 'هضم ميكانيكي وإنزيمي', detail: 'الأميليز اللعابي يبدأ هضم النشا.', color: '#fb7185' },
      { id: 'stomach', name: 'المعدة', nameEn: 'Stomach', role: 'هضم البروتين', detail: 'HCl عند pH ≈ 2 ينشّط البيبسين ويقتل الجراثيم.', color: '#f97316' },
      { id: 'sintestine', name: 'الأمعاء الدقيقة', nameEn: 'Small Intestine', role: 'الهضم والامتصاص', detail: 'الخملات والخملات الدقيقة توسّع المساحة إلى ~250 م².', color: '#fbbf24' },
      { id: 'liver', name: 'الكبد والبنكرياس', nameEn: 'Liver & Pancreas', role: 'عصارات هاضمة', detail: 'الصفراء تستحلب الدهون، والبنكرياس يفرز الليباز والأميليز والتربسين.', color: '#84cc16' },
      { id: 'lintestine', name: 'الأمعاء الغليظة', nameEn: 'Large Intestine', role: 'امتصاص الماء', detail: 'تعيد امتصاص الماء والأملاح وتؤوي الميكروبيوم.', color: '#a16207' },
    ],
  },
  urinary: {
    name: 'الجهاز البولي',
    nameEn: 'Urinary System',
    summary:
      'الكلية تُرشِّح نحو 180 لتراً يومياً في الكبيبات، ثم تعيد امتصاص أكثر من 99% منها لتحافظ على توازن الماء والأملاح وpH الدم.',
    organs: [
      { id: 'glom', name: 'الكبيبة', nameEn: 'Glomerulus', role: 'الترشيح', detail: 'ضغط دموي مرتفع يدفع الماء والأيونات والفضلات إلى محفظة بومان.', color: '#ef4444' },
      { id: 'pct', name: 'الأنبوب الملتوي القريب', nameEn: 'Proximal Tubule', role: 'إعادة امتصاص', detail: 'يستعيد الجلوكوز والأحماض الأمينية و~65% من الصوديوم والماء.', color: '#22d3ee' },
      { id: 'loop', name: 'التواء هنلي', nameEn: 'Loop of Henle', role: 'تركيز البول', detail: 'آلية التيار المعاكس تبني تدرّجاً ملحياً في اللب الكلوي.', color: '#0ea5e9' },
      { id: 'collect', name: 'القناة الجامعة', nameEn: 'Collecting Duct', role: 'ضبط الماء', detail: 'هرمون ADH يزيد نفاذية القناة فيتركّز البول عند الجفاف.', color: '#6366f1' },
    ],
  },
  muscular: {
    name: 'الجهاز العضلي الهيكلي',
    nameEn: 'Musculoskeletal System',
    summary:
      'العضلات تعمل بأزواج متضادة على عظام تشكّل روافع. الانقباض ينتج من انزلاق خيوط الأكتين على الميوسين باستهلاك ATP.',
    organs: [
      { id: 'biceps', name: 'العضلة ذات الرأسين', nameEn: 'Biceps', role: 'قابضة', detail: 'انقباضها يثني الساعد عند المرفق.', color: '#ef4444' },
      { id: 'triceps', name: 'العضلة ثلاثية الرؤوس', nameEn: 'Triceps', role: 'باسطة', detail: 'تنبسط عند انقباض القابضة — عمل متضاد.', color: '#f97316' },
      { id: 'sarcomere', name: 'القُسيم العضلي', nameEn: 'Sarcomere', role: 'وحدة الانقباض', detail: 'نظرية الخيوط المنزلقة: رؤوس الميوسين تسحب الأكتين بضربات مجدافية.', color: '#facc15' },
      { id: 'bone', name: 'العظم والمفصل', nameEn: 'Bone & Joint', role: 'رافعة ودعامة', detail: 'المرفق مفصل رزّي، والأوتار تنقل قوة العضلة إلى العظم.', color: '#e2e8f0' },
    ],
  },
};

export const NORMAL_RANGES = [
  { name: 'النتاج القلبي', normal: '4 – 8 لتر/د' },
  { name: 'ضغط الدم', normal: '120/80 mmHg' },
  { name: 'تشبّع الأكسجين', normal: '95 – 100 %' },
  { name: 'PaO₂', normal: '80 – 100 mmHg' },
  { name: 'PaCO₂', normal: '35 – 45 mmHg' },
  { name: 'pH الدم', normal: '7.35 – 7.45' },
  { name: 'التهوية الدقيقة', normal: '5 – 8 لتر/د' },
  { name: 'معدل الرشح الكبيبي', normal: '90 – 130 مل/د' },
  { name: 'اللاكتات', normal: '< 2 ممول/لتر' },
];
