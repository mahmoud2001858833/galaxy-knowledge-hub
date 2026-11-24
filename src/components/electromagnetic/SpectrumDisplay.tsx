import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface SpectrumDisplayProps {
  currentFrequency: number; // in THz
  onFrequencyChange: (freq: number) => void;
}

interface SpectrumRange {
  id: string;
  name: string;
  /** Inclusive range in THz (strictly > 0 for log scale) */
  startTHz: number;
  endTHz: number;
  sampleTHz: number;
  labelRange: string;
  color: string;
  applications: string[];
}

const LOG_MIN = Math.log10(0.01); // 0.01 THz (10 GHz — Radio / Microwave edge)
const LOG_MAX = Math.log10(200000); // 200,000 THz (Gamma range in sim)

const SPECTRUM_RANGES: SpectrumRange[] = [
  {
    id: 'radio',
    name: 'موجات الراديو',
    startTHz: 0.01,
    endTHz: 0.3,
    sampleTHz: 0.1,
    labelRange: 'أقل من 300 GHz (0.3 THz)',
    color: 'linear-gradient(90deg, #b91c1c, #dc2626)',
    applications: ['الراديو', 'التلفزيون', 'الاتصالات اللاسلكية'],
  },
  {
    id: 'microwave',
    name: 'الموجات الميكروية',
    startTHz: 0.3,
    endTHz: 3,
    sampleTHz: 2.4,
    labelRange: '0.3 – 3 THz (الميكروويف والرادار)',
    color: 'linear-gradient(90deg, #ea580c, #f97316)',
    applications: ['أفران الميكروويف', 'الرادار', 'الاتصالات الفضائية وWi-Fi'],
  },
  {
    id: 'infrared',
    name: 'الأشعة تحت الحمراء',
    startTHz: 3,
    endTHz: 400,
    sampleTHz: 100,
    labelRange: '3 – 400 THz',
    color: 'linear-gradient(90deg, #f59e0b, #eab308)',
    applications: ['التصوير الحراري', 'أجهزة التحكم عن بُعد', 'الألياف الضوئية'],
  },
  {
    id: 'visible',
    name: 'الضوء المرئي',
    startTHz: 400,
    endTHz: 790,
    sampleTHz: 550,
    labelRange: '400 – 790 THz (380 – 750 nm)',
    color: 'linear-gradient(90deg, #ef4444 0%, #f97316 18%, #eab308 35%, #22c55e 52%, #3b82f6 72%, #6366f1 86%, #9333ea 100%)',
    applications: ['الرؤية البشرية', 'الإضاءة والليزر', 'البناء الضوئي'],
  },
  {
    id: 'ultraviolet',
    name: 'الأشعة فوق البنفسجية',
    startTHz: 790,
    endTHz: 10000,
    sampleTHz: 1500,
    labelRange: '790 THz – 10 PHz',
    color: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
    applications: ['التعقيم الطبي', 'الكشف عن التزييف', 'إنتاج فيتامين D'],
  },
  {
    id: 'xray',
    name: 'الأشعة السينية',
    startTHz: 10000,
    endTHz: 60000,
    sampleTHz: 30000,
    labelRange: '10 – 60 PHz',
    color: 'linear-gradient(90deg, #4338ca, #312e81)',
    applications: ['التصوير الطبي للعظام', 'فحص الحقائب والأمن', 'تحليل البلورات'],
  },
  {
    id: 'gamma',
    name: 'أشعة غاما',
    startTHz: 60000,
    endTHz: 200000,
    sampleTHz: 95000,
    labelRange: 'أعلى من 60 PHz',
    color: 'linear-gradient(90deg, #1e1b4b, #0f172a)',
    applications: ['العلاج الإشعاعي للأورام', 'تعقيم المعدات الطبية', 'رصد الظواهر الكونية'],
  },
];

const formatWavelengthFromTHz = (freqTHz: number) => {
  const safeFreq = Math.max(0.01, freqTHz);
  const wavelengthMeters = 299792458 / (safeFreq * 1e12);
  if (wavelengthMeters >= 1e-3) return `${(wavelengthMeters * 1e3).toFixed(2)} mm`;
  if (wavelengthMeters >= 1e-6) return `${(wavelengthMeters * 1e6).toFixed(2)} µm`;
  if (wavelengthMeters >= 1e-9) return `${(wavelengthMeters * 1e9).toFixed(1)} nm`;
  return `${(wavelengthMeters * 1e12).toFixed(2)} pm`;
};

const SpectrumDisplay = ({ currentFrequency, onFrequencyChange }: SpectrumDisplayProps) => {
  const getPositionPercent = (freqTHz: number) => {
    const clamped = Math.min(200000, Math.max(0.01, freqTHz));
    const pct = ((Math.log10(clamped) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
    return Math.min(98.5, Math.max(1.5, pct));
  };

  const activeRange =
    SPECTRUM_RANGES.find((r) => currentFrequency >= r.startTHz && currentFrequency <= r.endTHz) ??
    (currentFrequency < SPECTRUM_RANGES[0].startTHz
      ? SPECTRUM_RANGES[0]
      : SPECTRUM_RANGES[SPECTRUM_RANGES.length - 1]);

  const indicatorLeft = getPositionPercent(currentFrequency);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-xl font-bold text-foreground">الطيف الكهرومغناطيسي الكامل</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
              النطاق النشط: {activeRange.name} • {currentFrequency.toFixed(2)} THz
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-5 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>
              المؤشر العمودي المضيء يحدد موقع <strong>التردد والطول الموجي الحالي</strong> بدقة على المقياس اللوغاريتمي للطيف — اضغط على أي نطاق أدناه للانتقال إليه فوراً.
            </span>
          </p>

          {/* Spectrum Bar Wrapper (outer wrapper allows the top frequency badge to show clearly without clipping) */}
          <div className="relative pt-12 pb-7 mb-4" dir="ltr">
            {/* Colored bands bar */}
            <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border border-border shadow-inner flex">
              {SPECTRUM_RANGES.map((range) => {
                const widthPct = ((Math.log10(range.endTHz) - Math.log10(range.startTHz)) / (LOG_MAX - LOG_MIN)) * 100;
                const isActive = activeRange.id === range.id;
                return (
                  <button
                    key={range.id}
                    type="button"
                    title={`${range.name} (${range.labelRange})`}
                    className={`relative h-full cursor-pointer transition-all hover:brightness-110 focus:outline-none border-r border-white/15 last:border-r-0 ${
                      isActive ? 'ring-2 ring-inset ring-white/80 brightness-110' : 'opacity-90'
                    }`}
                    style={{
                      width: `${widthPct}%`,
                      background: range.color,
                    }}
                    onClick={() => onFrequencyChange(range.sampleTHz)}
                  >
                    <span className="hidden md:block absolute bottom-1.5 inset-x-1 text-[10px] font-bold text-white drop-shadow truncate text-center">
                      {range.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Functional Current Frequency / Wavelength Marker — clearly labelled & aligned */}
            <motion.div
              className="pointer-events-none absolute top-11 bottom-6 z-20 flex flex-col items-center"
              style={{ left: `${indicatorLeft}%`, transform: 'translateX(-50%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Top Label Pill */}
              <div
                className="absolute -top-10 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow-lg border border-sky-300/60"
                style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                dir="rtl"
              >
                موقع الموجة: {currentFrequency.toFixed(1)} THz ({formatWavelengthFromTHz(currentFrequency)})
              </div>
              {/* Downward Triangle */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-sky-500 -mt-1" />
              {/* Crisp Vertical Line */}
              <div className="w-1 flex-1 rounded-full bg-white shadow-[0_0_10px_rgba(56,189,248,0.95)] ring-1 ring-sky-500" />
            </motion.div>

            {/* Scale Direction Axis */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mt-2 px-1" dir="rtl">
              <span>← طاقة وتردد أعلى (أشعة غاما)</span>
              <span>طول موجي أطول وتردد أقل (موجات الراديو) →</span>
            </div>
          </div>

          {/* Spectrum Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPECTRUM_RANGES.map((range, index) => {
              const isActive = activeRange.id === range.id;
              return (
                <motion.div
                  key={range.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-background/50 hover:bg-background/80 hover:border-primary/40'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onFrequencyChange(range.sampleTHz)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-full h-2.5 rounded-full mb-3" style={{ background: range.color }} />
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="font-bold text-foreground">{range.name}</h4>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        محدد الآن
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 font-mono">{range.labelRange}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">التطبيقات:</p>
                    {range.applications.map((app, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {app}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Educational Information */}
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">حقائق علمية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">العلاقة بين التردد والطول الموجي</h4>
              <p className="text-sm text-muted-foreground font-mono">λ = c / f</p>
              <p className="text-xs text-muted-foreground mt-2">حيث c هي سرعة الضوء (3×10⁸ m/s)</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">طاقة الفوتون</h4>
              <p className="text-sm text-muted-foreground font-mono">E = h × f</p>
              <p className="text-xs text-muted-foreground mt-2">حيث h هو ثابت بلانك (6.626×10⁻³⁴ J·s)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpectrumDisplay;
