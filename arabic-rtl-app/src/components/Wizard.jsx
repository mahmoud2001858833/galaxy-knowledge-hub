import React from 'react';
import { Compass, HelpCircle } from 'lucide-react';
import { YAMAN_COLORS } from '../constants/colors';

/**
 * مكون القسم الثاني: Wizard (معالج التوجيه التفاعلي)
 * المعرّف الثابت للنزول: #wizard
 */
export default function Wizard() {
  return (
    <section
      id="wizard"
      className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl border border-yaman-border bg-white shadow-sm space-y-6"
    >
      <div className="flex items-center justify-between border-b border-yaman-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: YAMAN_COLORS.primary }}
          >
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-yaman-text-light uppercase tracking-wider">
              القسم 2: معالج الخطوات
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-yaman-text-main">
              المعالج التفاعلي (Wizard Flow)
            </h2>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-yaman-bg-light text-yaman-text-muted border border-yaman-border font-mono">
          #wizard
        </span>
      </div>

      <p className="text-sm sm:text-base text-yaman-text-muted font-tajawal">
        مساحة مخصصة لخطوات اختيار مجال التطوع (التعليم، البيئة، الصحة، التكنولوجيا) وتحديد الوقت المتاح لتوليد التوصية المخصصة.
      </p>

      {/* مساحة فارغة جاهزة للمحتوى */}
      <div className="border-2 border-dashed border-yaman-border rounded-2xl p-8 text-center bg-yaman-bg-card/50 space-y-3">
        <HelpCircle className="w-8 h-8 mx-auto text-yaman-accent opacity-60" />
        <h3 className="font-bold text-yaman-text-main text-base">مكون المعالج التفاعلي (جاهز لإضافة الخطوات)</h3>
        <p className="text-xs text-yaman-text-muted max-w-md mx-auto">
          يحتوي هذا المكون على تدفق الأسئلة خطوة بخطوة ومؤشر التقدم وبطاقات الخيارات والتوصيات الـ 12.
        </p>
      </div>
    </section>
  );
}
