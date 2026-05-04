import React from 'react';
import SignTranslatorPro from '@/features/sign-language/SignTranslatorPro';
import { Hand, Sparkles } from 'lucide-react';

const SignTranslator: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))]/10 mb-4">
          <Hand className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">
          المترجم الفوري للغة الإشارة
        </h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto leading-relaxed">
          ترجمة فورية للإشارات إلى نص عربي مهذّب ثم إلى أكثر من <b>100 لغة عالمية</b>،
          ودعم <b>19 نظام إشارة</b>، مع نطق صوتي وتصحيح لغوي ذكي.
        </p>
        <div className="inline-flex items-center gap-1 mt-3 text-xs text-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> مدعوم بالذكاء الاصطناعي
        </div>
      </div>

      <SignTranslatorPro />
    </div>
  );
};

export default SignTranslator;
