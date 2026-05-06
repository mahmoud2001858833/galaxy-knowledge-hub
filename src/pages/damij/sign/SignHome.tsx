import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, ArrowLeft, Globe, Sparkles, Youtube, Volume2 } from 'lucide-react';

const SignHome: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
    <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-3">مترجم لغة الإشارة الذكي</h1>
    <p className="text-lg text-[hsl(var(--damij-text))]/75 mb-10 max-w-3xl">
      جسر تواصل ثنائي الاتجاه بين الصمّ والمجتمع: ترجمة فورية من الكاميرا إلى نص/صوت، ومن نص/صوت إلى تتابع إشارات احترافي. يدعم أكثر من 100 لغة منطوقة و19 نظام إشارة عالمي.
    </p>

    <div className="grid md:grid-cols-2 gap-6">
      <Link
        to="/damij/sign/translator"
        className="group block p-7 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 border border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center shrink-0">
            <Hand className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-2">المترجم الفوري</h3>
            <p className="text-[hsl(var(--damij-text))]/70 leading-relaxed mb-3 text-sm">
              اختر نظام لغة الإشارة واللغة المنطوقة، ثم ترجم في الاتجاهين فوراً مع رسوم يدّ توضيحية وتهجئة بالأبجدية الإصبعية.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--damij-text))]/65 mb-3">
              <span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> 19 نظام</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> 100+ لغة</span>
            </div>
            <div className="flex items-center gap-2 text-[hsl(var(--damij-accent-2))] font-semibold group-hover:gap-3 transition-all">
              <span>افتح المترجم</span><ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>

      <Link
        to="/damij/sign/youtube"
        className="group block p-7 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200/60 hover:border-red-400/60 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Youtube className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-700 mb-2">مترجم فيديوهات يوتيوب إلى إشارة</h3>
            <p className="text-[hsl(var(--damij-text))]/70 leading-relaxed mb-3 text-sm">
              ألصق رابط أي فيديو يوتيوب وشاهده مع ترجمة لغة إشارة متزامنة لحظة بلحظة، ونص حي، ونطق صوتي بلغة الترجمة.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--damij-text))]/65 mb-3">
              <span className="inline-flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> صوت + إشارة</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> ترجمة فورية</span>
            </div>
            <div className="flex items-center gap-2 text-red-700 font-semibold group-hover:gap-3 transition-all">
              <span>جرّب الآن</span><ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  </div>
);

export default SignHome;

