import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { YAMAN_COLORS } from '../constants/colors';

/**
 * مكون القسم الأول: Hero (الترويج والبداية)
 * المعرّف الثابت للنزول: #hero
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="scroll-mt-20 py-16 px-4 sm:px-6 lg:px-8 rounded-3xl border border-yaman-border bg-gradient-to-b from-yaman-bg-card via-yaman-bg-light to-white shadow-sm transition-all"
    >
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* شارة الترحيب */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yaman-bg-light border border-yaman-border text-yaman-text-light text-xs font-bold">
          <Sparkles className="w-4 h-4 text-yaman-primary animate-pulse" />
          <span>القسم 1: البوابة والترحيب الرئيسي [Hero Section]</span>
        </div>

        {/* العنوان الرئيسي */}
        <h1 className="text-3xl sm:text-5xl font-black text-yaman-text-main tracking-tight leading-tight">
          منصة <span className="text-yaman-primary">«خطى التطوع»</span> التفاعلية
        </h1>

        {/* النص الوصفي */}
        <p className="text-base sm:text-lg text-yaman-text-muted leading-relaxed max-w-2xl mx-auto font-tajawal">
          نظام توجيه تفاعلي خطوة بخطوة يحدد مسار التطوع الأمثل لشغفك ووقتك المتاح، ويربطك بمبادرات منصة نوى الوطنية في المملكة.
        </p>

        {/* أزرار الإجراءات للنزول السريع للأقسام التالية */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#wizard"
            className="px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center gap-2 hover:-translate-y-0.5"
            style={{ backgroundColor: YAMAN_COLORS.primary }}
          >
            <span>ابدأ المعالج التفاعلي</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
          <a
            href="#impact-calculator"
            className="px-6 py-3 rounded-xl font-semibold border transition-all"
            style={{
              borderColor: YAMAN_COLORS.border,
              backgroundColor: YAMAN_COLORS.white,
              color: YAMAN_COLORS.textMain
            }}
          >
            <span>حاسبة الأثر</span>
          </a>
        </div>
      </div>
    </section>
  );
}
