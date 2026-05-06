import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, ArrowLeft, Globe, Sparkles } from 'lucide-react';

const SignHome: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-3">مترجم لغة الإشارة الذكي</h1>
    <p className="text-lg text-[hsl(var(--damij-text))]/75 mb-10 max-w-3xl">
      جسر تواصل ثنائي الاتجاه بين الصمّ والمجتمع: ترجمة فورية من الكاميرا إلى نص/صوت، ومن نص/صوت إلى تتابع إشارات احترافي. يدعم أكثر من 100 لغة منطوقة و19 نظام إشارة عالمي.
    </p>

    <Link
      to="/damij/sign/translator"
      className="group block p-8 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 border border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
    >
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center shrink-0">
          <Hand className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">المترجم الفوري</h3>
          <p className="text-[hsl(var(--damij-text))]/70 leading-relaxed mb-4">
            اختر نظام لغة الإشارة واللغة المنطوقة أولاً، ثم ترجم في الاتجاهين فوراً مع رسوم يدّ توضيحية وتهجئة بالأبجدية الإصبعية لأي كلمة.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--damij-text))]/65 mb-4">
            <span className="inline-flex items-center gap-1"><Globe className="w-4 h-4" /> 19 نظام إشارة</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="w-4 h-4" /> 100+ لغة منطوقة</span>
          </div>
          <div className="flex items-center gap-2 text-[hsl(var(--damij-accent-2))] font-semibold group-hover:gap-3 transition-all">
            <span>افتح المترجم</span><ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  </div>
);

export default SignHome;
