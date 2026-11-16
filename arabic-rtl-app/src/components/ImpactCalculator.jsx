import React from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { YAMAN_COLORS } from '../constants/colors';

/**
 * مكون القسم الثالث: ImpactCalculator (حاسبة الأثر التطوعي)
 * المعرّف الثابت للنزول: #impact-calculator و #impactCalculator
 */
export default function ImpactCalculator() {
  return (
    <section
      id="impact-calculator"
      className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl border border-yaman-border bg-white shadow-sm space-y-6"
    >
      {/* مرسى بديل لضمان وصول الرابط في حال كتابته بدون شرطة */}
      <div id="impactCalculator" className="-top-24 relative" />

      <div className="flex items-center justify-between border-b border-yaman-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: YAMAN_COLORS.primary }}
          >
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-yaman-text-light uppercase tracking-wider">
              القسم 3: حاسبة الأثر
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-yaman-text-main">
              حاسبة أثر المتطوع (Impact Calculator)
            </h2>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-yaman-bg-light text-yaman-text-muted border border-yaman-border font-mono">
          #impact-calculator
        </span>
      </div>

      <p className="text-sm sm:text-base text-yaman-text-muted font-tajawal">
        حساب ساعات التطوع المتوقعة، وعدد المستفيدين المحتملين، وقيمة الأثر المجتمعي التقديري بناءً على الالتزام الأسبوعي.
      </p>

      {/* مساحة فارغة جاهزة للمحتوى */}
      <div className="border-2 border-dashed border-yaman-border rounded-2xl p-8 text-center bg-yaman-bg-card/50 space-y-3">
        <TrendingUp className="w-8 h-8 mx-auto text-yaman-accent opacity-60" />
        <h3 className="font-bold text-yaman-text-main text-base">مكون حاسبة الأثر (جاهز للمنطق الرياضي والمدخلات)</h3>
        <p className="text-xs text-yaman-text-muted max-w-md mx-auto">
          يحتوي على مدخلات الساعات الشهرية، نوع النشاط، وعداد بياني تفاعلي يبرز القيمة المجتمعية.
        </p>
      </div>
    </section>
  );
}
