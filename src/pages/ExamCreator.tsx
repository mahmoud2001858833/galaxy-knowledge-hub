import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import SafeBoundary from "@/components/common/SafeBoundary";
import ExamCreatorWizard from "@/components/exam-creator/ExamCreatorWizard";

export default function ExamCreator() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-right text-slate-900 dark:bg-[#050714] dark:text-white" dir="rtl">
      <SEO
        title="إنشاء الامتحانات بالذكاء الاصطناعي من ملفك | منصة ذروة العلم"
        description="ارفع كتابك أو ملزمتك، اختر الوحدات، فيُنشئ الذكاء الاصطناعي امتحاناً من ملفك فقط مع جداول وأشكال من الملف الأصلي، وتنزيل PDF ورابط امتحان إلكتروني."
        keywords="إنشاء امتحان, امتحان إلكتروني, ذكاء اصطناعي, تعليم, ذروة العلم"
        canonicalUrl="https://yoursite.lovable.app/exam-creator"
      />
      <SafeBoundary name="Navbar"><Navbar /></SafeBoundary>
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">إنشاء الامتحانات من ملفك</h1>
          <p className="text-muted-foreground">ارفع الملف ← اختر الوحدات ← حدّد الأسئلة وطلبك ← نزّل PDF أو شارك رابط امتحان إلكتروني</p>
        </header>
        <SafeBoundary name="ExamCreatorWizard"><ExamCreatorWizard /></SafeBoundary>
      </main>
      <SafeBoundary name="Footer"><Footer /></SafeBoundary>
    </div>
  );
}
