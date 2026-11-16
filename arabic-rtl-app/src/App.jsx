import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Calculator,
  MapPin,
  CheckSquare,
  Palette,
  ExternalLink,
  Heart
} from 'lucide-react';

import Hero from './components/Hero';
import Wizard from './components/Wizard';
import ImpactCalculator from './components/ImpactCalculator';
import Governorates from './components/Governorates';
import Checklist from './components/Checklist';
import { YAMAN_COLORS } from './constants/colors';

export default function App() {
  const [showColorPalette, setShowColorPalette] = useState(false);

  // قائمة الأقسام الخمسة بالترتيب مع معرفاتها الثابتة للنزول
  const sections = [
    { id: 'hero', name: 'البداية', labelEn: 'Hero', icon: Sparkles },
    { id: 'wizard', name: 'المعالج التفاعلي', labelEn: 'Wizard', icon: Compass },
    { id: 'impact-calculator', name: 'حاسبة الأثر', labelEn: 'ImpactCalculator', icon: Calculator },
    { id: 'governorates', name: 'المحافظات', labelEn: 'Governorates', icon: MapPin },
    { id: 'checklist', name: 'قائمة التحقق', labelEn: 'Checklist', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-cairo">
      {/* شريط التنقل العلوي مع روابط النزول الثابتة للأقسام الخمسة */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-yaman-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* الشعار */}
          <a href="#hero" className="flex items-center gap-3 shrink-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: YAMAN_COLORS.primary }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-yaman-text-main">
                خطى التطوع
              </span>
              <span className="hidden sm:block text-[11px] text-yaman-text-muted">
                5 أقسام تفاعلية | مرجع ألوان يمان
              </span>
            </div>
          </a>

          {/* روابط النزول السريع للأقسام الخمسة بالترتيب */}
          <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-yaman-text-muted hover:text-yaman-text-main hover:bg-yaman-bg-light transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="w-5 h-5 rounded-md bg-yaman-bg-card border border-yaman-border/80 flex items-center justify-center text-[11px] text-yaman-text-light font-mono">
                    {idx + 1}
                  </span>
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  <span>{sec.name}</span>
                </a>
              );
            })}
          </nav>

          {/* زر عرض لوحة متغيرات ألوان مرجع يمان */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="px-3 py-1.5 rounded-lg border border-yaman-border bg-yaman-bg-card hover:bg-yaman-bg-light text-yaman-text-main text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="استعراض متغيرات ألوان مرجع يمان"
            >
              <Palette className="w-4 h-4 text-yaman-primary" />
              <span className="hidden sm:inline">ألوان مرجع يمان</span>
            </button>
            <a
              href="https://www.nawa.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity flex items-center gap-1"
              style={{ backgroundColor: YAMAN_COLORS.emerald }}
            >
              <span>منصة نوى</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* روابط التنقل للشاشات الصغيرة */}
        <div className="md:hidden flex items-center justify-around border-t border-yaman-border/40 py-2 px-2 bg-yaman-bg-card/60 overflow-x-auto text-xs">
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-2 py-1 text-yaman-text-muted hover:text-yaman-text-main whitespace-nowrap font-medium"
            >
              {sec.name}
            </a>
          ))}
        </div>
      </header>

      {/* لوحة عرض متغيرات الألوان المنبثقة عند الطلب */}
      {showColorPalette && (
        <section className="bg-yaman-bg-card border-b border-yaman-border px-4 py-4 animate-fadeIn">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-yaman-primary" />
                <h3 className="text-sm font-bold text-yaman-text-main">
                  ثوابت ألوان مرجع يمان (YAMAN_COLORS)
                </h3>
              </div>
              <span className="text-[11px] text-yaman-text-muted font-mono">
                src/constants/colors.js
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {[
                { name: 'primary', hex: YAMAN_COLORS.primary, label: 'الرئيسي الدافئ' },
                { name: 'primaryDark', hex: YAMAN_COLORS.primaryDark, label: 'الداكن' },
                { name: 'accent', hex: YAMAN_COLORS.accent, label: 'التمييز' },
                { name: 'bgLight', hex: YAMAN_COLORS.bgLight, label: 'الخلفية الفاتحة' },
                { name: 'border', hex: YAMAN_COLORS.border, label: 'الحدود' },
                { name: 'textMain', hex: YAMAN_COLORS.textMain, label: 'النص الأساسي' },
                { name: 'emerald', hex: YAMAN_COLORS.emerald, label: 'أخضر التطوع' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="p-2.5 rounded-xl border border-yaman-border bg-white flex flex-col gap-1.5 shadow-2xs"
                >
                  <div
                    className="w-full h-7 rounded-lg border border-black/10 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="font-mono text-slate-500">{c.hex}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* الحاوية الرئيسية: تصيير المكونات الخمسة بالترتيب الدقيق */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* 1. القسم الأول: Hero */}
        <Hero />

        {/* 2. القسم الثاني: Wizard */}
        <Wizard />

        {/* 3. القسم الثالث: ImpactCalculator */}
        <ImpactCalculator />

        {/* 4. القسم الرابع: Governorates */}
        <Governorates />

        {/* 5. القسم الخامس: Checklist */}
        <Checklist />
      </main>

      {/* التذييل */}
      <footer className="bg-white border-t border-yaman-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-yaman-text-muted space-y-3">
          <div className="flex items-center justify-center gap-1.5">
            <span>تم إعداد الأقسام الخمسة وثوابت الألوان بكل</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>وفق مرجع يمان</span>
          </div>
          <div className="text-[11px] text-yaman-text-light font-mono">
            #hero • #wizard • #impact-calculator • #governorates • #checklist
          </div>
        </div>
      </footer>
    </div>
  );
}
