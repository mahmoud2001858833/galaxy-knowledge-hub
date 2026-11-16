import React from 'react';
import { CheckSquare, ListChecks } from 'lucide-react';
import { YAMAN_COLORS } from '../constants/colors';

/**
 * مكون القسم الخامس: Checklist / Chesklist (قائمة التحقق لجهوزية المتطوع)
 * المعرّف الثابت للنزول: #checklist و #chesklist
 */
export default function Checklist() {
  return (
    <section
      id="checklist"
      className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl border border-yaman-border bg-white shadow-sm space-y-6"
    >
      {/* مرسى بديل لدعم كتابة Chesklist بنفس تهجئة الطلب */}
      <div id="chesklist" className="-top-24 relative" />

      <div className="flex items-center justify-between border-b border-yaman-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: YAMAN_COLORS.primary }}
          >
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-yaman-text-light uppercase tracking-wider">
              القسم 5: قائمة التحقق
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-yaman-text-main">
              قائمة فحص جاهزية المتطوع (Checklist)
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-yaman-bg-light text-yaman-text-muted border border-yaman-border font-mono">
            #checklist
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono text-[11px]">
            #chesklist
          </span>
        </div>
      </div>

      <p className="text-sm sm:text-base text-yaman-text-muted font-tajawal">
        قائمة مهام تفاعلية تتيح للمتطوع مراجعة المستلزمات قبل الانطلاق (التسجيل الرسمي، توفير الهوية، معرفة نقطة التجمع، والاطلاع على تعليمات السلامة).
      </p>

      {/* مساحة فارغة جاهزة للمحتوى */}
      <div className="border-2 border-dashed border-yaman-border rounded-2xl p-8 text-center bg-yaman-bg-card/50 space-y-3">
        <ListChecks className="w-8 h-8 mx-auto text-yaman-accent opacity-60" />
        <h3 className="font-bold text-yaman-text-main text-base">مكون قائمة الفحص والتحقق (جاهز لعناصر التحقق)</h3>
        <p className="text-xs text-yaman-text-muted max-w-md mx-auto">
          يحتوي على بنود قابلة للتأشير (Checkable items) مع شريط نسبة الإنجاز وحفظ الحالة محلياً.
        </p>
      </div>
    </section>
  );
}
