import { Link } from "react-router-dom";
import { FileUp, ListChecks, SlidersHorizontal, FileDown, Globe, ArrowLeft, ShieldCheck, Table2, Image as ImageIcon, BookMarked } from "lucide-react";

const STEPS = [
  { icon: FileUp, label: "اختر من المكتبة أو ارفع ملفك" },
  { icon: ListChecks, label: "اختر الوحدات" },
  { icon: SlidersHorizontal, label: "حدّد الأسئلة وطلبك" },
  { icon: FileDown, label: "نزّل PDF" },
  { icon: Globe, label: "شارك رابطاً إلكترونياً" },
];

const FEATURES = [
  { icon: ListChecks, text: "امتحان حتى 100 سؤال، أو بنك أسئلة حتى 1000 سؤال تسحب منه امتحانات عشوائية متعددة" },
  { icon: BookMarked, text: "اختر من مكتبة ملفات المنصة بلا رفع، أو ادمج عدة ملفات في امتحان واحد" },
  { icon: ShieldCheck, text: "أسئلة من ملفك فقط، وكل سؤال مرفق باقتباس يثبت إجابته ويُدقَّق آلياً" },
  { icon: Table2, text: "جداول تُنقل من ملفك خلية بخلية وتُدقَّق مقابله" },
  { icon: ImageIcon, text: "أشكال علمية تُقصّ من ملفك الأصلي بدقة، بلا رسوم مولَّدة قد تخطئ" },
];

export default function ExamCreatorShowcase() {
  return (
    <section className="px-4" aria-labelledby="exam-creator-title">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-blue-200/60 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-sm dark:border-cyan-900/40 dark:from-[#0a1030] dark:via-[#0b1438] dark:to-[#07202e] sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <span className="inline-block rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-300">جديد · للمعلمين</span>
            <h2 id="exam-creator-title" className="text-3xl font-black leading-tight sm:text-4xl">إنشاء الامتحانات بالذكاء الاصطناعي من ملفك</h2>
            <p className="text-slate-600 dark:text-slate-300">ارفع الكتاب أو الملزمة، يقسّمه الذكاء الاصطناعي إلى وحدات، تختار منها، ثم تحصل على امتحان جاهز للطباعة أو للإجابة إلكترونياً.</p>
            <ul className="space-y-2">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />{text}
                </li>
              ))}
            </ul>
            <Link to="/exam-creator"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              ابدأ إنشاء امتحان<ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <ol className="space-y-2">
            {STEPS.map(({ icon: Icon, label }, i) => (
              <li key={label} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Icon className="h-4 w-4" /></span>
                <span className="font-semibold">{i + 1}. {label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
