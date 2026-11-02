import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  FileUp,
  FlaskConical,
  Globe,
  LineChart,
  ListChecks,
  Pause,
  Play,
  School,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { CORE_SECTIONS } from "@/config/platformSections";

/**
 * Interactive platform tour: a step list on one side and a live mock screen on the other.
 * Auto-advances (paused on hover, after a manual pick, or when the user prefers reduced motion).
 */

const STEP_MS = 7000;

/* ---------------------------------------------------------------- mock screens */

const ScreenSections: React.FC = () => (
  <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-3">
    {CORE_SECTIONS.map((s, i) => (
      <motion.div
        key={s.id}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: i * 0.08 }}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background p-3 text-center"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-white">
          <s.icon className="h-5 w-5" />
        </span>
        <span className="text-xs font-bold">{s.navLabel}</span>
        <span className="text-[10px] text-muted-foreground">
          {s.pages.length} أداة
        </span>
      </motion.div>
    ))}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center justify-center rounded-2xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground"
    >
      كل قسم صفحة واحدة تجمع أدواته
    </motion.div>
  </div>
);

const ANSWER =
  "القوة المحصّلة المؤثرة في جسم تساوي كتلته مضروبة في تسارعه: ق = ك × ت. فإذا زادت القوة زاد التسارع، وإذا زادت الكتلة قلّ التسارع.";

const ScreenAssistant: React.FC = () => {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? ANSWER.length : 0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setShown((n) => (n >= ANSWER.length ? n : n + 2)),
      30,
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="flex h-full flex-col gap-3">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mr-auto w-fit max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm"
      >
        اشرح لي قانون نيوتن الثاني من كتاب الفيزياء
      </motion.div>
      <div className="w-fit max-w-[90%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
        {ANSWER.slice(0, shown)}
        {shown < ANSWER.length && (
          <span className="mr-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary-foreground/80 align-middle" />
        )}
        {shown >= ANSWER.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-1 text-[11px] opacity-85"
          >
            <BookOpenCheck className="h-3.5 w-3.5" /> المصدر: كتاب الفيزياء،
            الوحدة الثانية
          </motion.div>
        )}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" /> اسأل عن أي درس في المنهاج
        الأردني…
      </div>
    </div>
  );
};

const EXAM_STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: FileUp, label: "رفع ملف الكتاب أو الملزمة" },
  { icon: ListChecks, label: "اختيار الوحدات" },
  { icon: SlidersHorizontal, label: "عدد الأسئلة ونوعها" },
  { icon: FileDown, label: "امتحان PDF جاهز" },
  { icon: Globe, label: "رابط إلكتروني يُصحَّح تلقائياً" },
];

const ScreenExam: React.FC = () => {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(reduce ? EXAM_STEPS.length : 0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setDone((n) => Math.min(n + 1, EXAM_STEPS.length)),
      900,
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="flex h-full flex-col gap-2">
      {EXAM_STEPS.map(({ icon: Icon, label }, i) => {
        const complete = i < done;
        return (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-2xl border p-2.5 text-sm transition-all duration-500 ${
              complete
                ? "border-primary/40 bg-accent"
                : "border-border bg-background opacity-60"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                complete
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="font-semibold">{label}</span>
            {complete && (
              <CheckCircle2 className="mr-auto h-4 w-4 text-success" />
            )}
          </div>
        );
      })}
    </div>
  );
};

/** A real mini-simulation: drag the angle and watch the trajectory and range change. */
const ScreenLab: React.FC = () => {
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(20);
  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const range = (speed * speed * Math.sin(2 * rad)) / g;
  const height = (speed * speed * Math.sin(rad) ** 2) / (2 * g);
  const maxRange = (30 * 30) / g; // largest possible range on the sliders

  const W = 300;
  const H = 130;
  const sx = (W - 20) / maxRange;
  const sy = (H - 20) / ((30 * 30) / (2 * g));
  const path = useMemo(() => {
    const tFlight = (2 * speed * Math.sin(rad)) / g;
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = (tFlight * i) / 40;
      const x = speed * Math.cos(rad) * t;
      const y = speed * Math.sin(rad) * t - 0.5 * g * t * t;
      pts.push(`${(10 + x * sx).toFixed(1)},${(H - 10 - y * sy).toFixed(1)}`);
    }
    return `M${pts.join(" L")}`;
  }, [speed, rad, sx, sy]);

  return (
    <div className="flex h-full flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-2xl border border-border bg-background"
        role="img"
        aria-label="مسار المقذوف"
      >
        <line
          x1="0"
          y1={H - 10}
          x2={W}
          y2={H - 10}
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx={10 + range * sx}
          cy={H - 10}
          r="5"
          fill="hsl(var(--brand-to))"
        />
      </svg>
      <label className="text-xs font-semibold">
        زاوية الإطلاق: <span className="text-primary">{angle}°</span>
        <input
          type="range"
          min={5}
          max={85}
          value={angle}
          onChange={(e) => setAngle(+e.target.value)}
          className="mt-1 w-full accent-[hsl(var(--primary))]"
        />
      </label>
      <label className="text-xs font-semibold">
        السرعة الابتدائية: <span className="text-primary">{speed} م/ث</span>
        <input
          type="range"
          min={5}
          max={30}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          className="mt-1 w-full accent-[hsl(var(--primary))]"
        />
      </label>
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-xl bg-muted p-2">
          المدى{" "}
          <span className="block text-base font-black text-primary">
            {range.toFixed(1)} م
          </span>
        </div>
        <div className="rounded-xl bg-muted p-2">
          أقصى ارتفاع{" "}
          <span className="block text-base font-black text-primary">
            {height.toFixed(1)} م
          </span>
        </div>
      </div>
    </div>
  );
};

const PROGRESS = [
  { subject: "الفيزياء", value: 82 },
  { subject: "الرياضيات", value: 68 },
  { subject: "الكيمياء", value: 74 },
  { subject: "الأحياء", value: 55 },
  { subject: "الإنجليزية", value: 90 },
];

const ScreenProgress: React.FC = () => (
  <div className="flex h-full flex-col gap-3">
    <div className="text-xs font-bold text-muted-foreground">
      تقدّمك هذا الأسبوع (مثال)
    </div>
    {PROGRESS.map((p, i) => (
      <div key={p.subject} className="space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span>{p.subject}</span>
          <span className="text-muted-foreground">{p.value}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${p.value}%` }}
            transition={{ delay: 0.15 * i, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-l from-brand-from to-brand-to"
          />
        </div>
      </div>
    ))}
    <div className="mt-auto rounded-2xl bg-accent p-3 text-xs text-accent-foreground">
      اقتراح: راجع وحدة الوراثة في الأحياء اليوم، فهي الأقل إتقاناً.
    </div>
  </div>
);

const SCHOOL_FEED = [
  {
    icon: ClipboardCheck,
    title: "واجب جديد في الرياضيات",
    meta: "أ. سلمى · التسليم الخميس",
  },
  {
    icon: Bell,
    title: "ملاحظة من معلم الفيزياء",
    meta: "أداء ممتاز في تجربة البندول",
  },
  { icon: School, title: "المجلة المدرسية", meta: "نتائج مسابقة العلوم" },
];

const ScreenSchool: React.FC = () => (
  <div className="flex h-full flex-col gap-2.5">
    {SCHOOL_FEED.map((f, i) => (
      <motion.div
        key={f.title}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 * i }}
        className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <f.icon className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-bold">{f.title}</span>
          <span className="text-[11px] text-muted-foreground">{f.meta}</span>
        </span>
      </motion.div>
    ))}
    <div className="mt-auto text-center text-[11px] text-muted-foreground">
      الطالب والمعلم وولي الأمر على نفس الصفحة
    </div>
  </div>
);

/* ---------------------------------------------------------------- steps */

interface TourStep {
  id: string;
  icon: LucideIcon;
  title: string;
  text: string;
  cta: { label: string; to: string };
  url: string;
  Screen: React.FC;
}

const STEPS: TourStep[] = [
  {
    id: "sections",
    icon: Sparkles,
    title: "اختر قسمك",
    text: "خمسة أقسام واضحة: التعلّم، الامتحانات، المختبرات، أدوات الطالب، والمجتمع المدرسي. كل أداة في مكانها.",
    cta: { label: "تصفّح قسم التعلّم", to: "/learn" },
    url: "zarwa/sections",
    Screen: ScreenSections,
  },
  {
    id: "assistant",
    icon: BookOpenCheck,
    title: "اسأل المساعد الأردني",
    text: "اسأل عن أي درس، فيشرح لك من كتاب وزارة التربية نفسه ويذكر المصدر.",
    cta: { label: "جرّب المساعد", to: "/jordanian-assistant" },
    url: "zarwa/jordanian-assistant",
    Screen: ScreenAssistant,
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    title: "أنشئ امتحاناً من ملفك",
    text: "ارفع الكتاب أو الملزمة، اختر الوحدات، واحصل على امتحان بنمط الوزارة للطباعة أو برابط إلكتروني.",
    cta: { label: "افتح منشئ الامتحانات", to: "/exam-creator" },
    url: "zarwa/exam-creator",
    Screen: ScreenExam,
  },
  {
    id: "lab",
    icon: FlaskConical,
    title: "جرّب بنفسك في المختبر",
    text: "حرّك زاوية الإطلاق والسرعة وشاهد المسار يتغيّر. هذه تجربة حقيقية مصغّرة من مختبرات المنصة.",
    cta: { label: "كل المختبرات", to: "/experiments-section" },
    url: "zarwa/labs/projectile",
    Screen: ScreenLab,
  },
  {
    id: "progress",
    icon: LineChart,
    title: "تابع تقدّمك",
    text: "إحصاءات لكل مادة، وجدول دراسي، ومراجعة متباعدة تثبّت المعلومة.",
    cta: { label: "أدوات الطالب", to: "/tools" },
    url: "zarwa/student-progress",
    Screen: ScreenProgress,
  },
  {
    id: "school",
    icon: School,
    title: "تواصل مع مدرستك",
    text: "الواجبات وملاحظات المعلمين وأخبار المدرسة في مكان واحد للطالب وولي الأمر.",
    cta: { label: "المجتمع المدرسي", to: "/school" },
    url: "zarwa/communication-bridge",
    Screen: ScreenSchool,
  },
];

export const PlatformTour: React.FC = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [hovered, setHovered] = useState(false);

  const go = useCallback(
    (i: number) => setActive((i + STEPS.length) % STEPS.length),
    [],
  );

  const step = STEPS[active];

  return (
    <section
      id="platform-tour"
      aria-labelledby="tour-title"
      className="scroll-mt-24"
    >
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
          جولة تعريفية
        </span>
        <h2
          id="tour-title"
          className="text-3xl font-black tracking-tight sm:text-4xl"
        >
          تعرّف على المنصة بثانية
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          ست محطات تريك كيف يستخدم الطالب والمعلم ذروة العلم. اضغط أي محطة أو
          اتركها تعمل وحدها.
        </p>
      </div>

      <div
        className="grid gap-6 rounded-[2.5rem] border border-border bg-card p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-8"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <style>
          {"@keyframes tour-progress { from { width: 0% } to { width: 100% } }"}
        </style>
        {/* steps */}
        <div className="flex flex-col gap-2">
          <ol
            className="flex flex-col gap-2"
            role="tablist"
            aria-label="محطات الجولة"
          >
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="tour-panel"
                    onClick={() => {
                      go(i);
                      setPlaying(false);
                    }}
                    className={`relative w-full overflow-hidden rounded-2xl border p-4 text-right transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "border-primary/40 bg-accent/60 shadow-sm"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-gradient-to-br from-brand-from to-brand-to text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <s.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-black">
                          <span className="text-muted-foreground">
                            {i + 1}.
                          </span>{" "}
                          {s.title}
                        </span>
                        {isActive && (
                          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                            {s.text}
                          </span>
                        )}
                      </span>
                    </div>
                    {isActive && playing && (
                      // The bar's CSS animation is the timer: it pauses on hover and advances the tour when it ends
                      <span
                        key={active}
                        className="absolute bottom-0 right-0 h-0.5 bg-primary"
                        style={{
                          animation: `tour-progress ${STEP_MS}ms linear forwards`,
                          animationPlayState: hovered ? "paused" : "running",
                        }}
                        onAnimationEnd={() => go(active + 1)}
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {playing ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي"}
            </button>
            <span className="text-xs text-muted-foreground">
              {active + 1} / {STEPS.length}
            </span>
          </div>
        </div>

        {/* mock screen */}
        <div
          id="tour-panel"
          role="tabpanel"
          aria-label={step.title}
          className="flex flex-col"
        >
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-muted/40 shadow-inner">
            <div
              className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5"
              dir="ltr"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="mx-auto rounded-lg bg-muted px-3 py-0.5 text-[11px] text-muted-foreground">
                {step.url}
              </span>
            </div>
            <div className="relative min-h-[340px] flex-1 p-4 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <step.Screen />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
            <Link
              to={step.cta.to}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              {step.cta.label}
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
