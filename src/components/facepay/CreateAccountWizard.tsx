import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaceScanner } from './FaceScanner';
import { GestureCapture } from './GestureCapture';
import { saveAccount, type PasswordType, type FacePayAccount } from '@/lib/facepay/storage';
import { Smile, Eye, ArrowRight, ArrowLeft, Wallet, ScanFace, KeyRound, CheckCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreateAccountWizardProps {
  onDone: (acc: FacePayAccount) => void;
  onCancel: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4;

export const CreateAccountWizard = ({ onDone, onCancel }: CreateAccountWizardProps) => {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState<string>('500');
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [passwordType, setPasswordType] = useState<PasswordType | null>(null);

  const stepsMeta = [
    { icon: Wallet, label: 'بيانات الحساب' },
    { icon: ScanFace, label: 'مسح الوجه' },
    { icon: KeyRound, label: 'نوع كلمة السر' },
    { icon: Smile, label: 'تسجيل الإيماءة' },
    { icon: CheckCheck, label: 'إنهاء' },
  ];

  const finish = () => {
    if (!name || !embedding || !passwordType) return;
    const acc: FacePayAccount = {
      name: name.trim(),
      balance: parseFloat(balance) || 0,
      faceEmbedding: embedding,
      passwordType,
      createdAt: new Date().toISOString(),
      history: [],
    };
    saveAccount(acc);
    toast({ title: 'تم إنشاء الحساب 🎉', description: `مرحباً ${acc.name}!` });
    onDone(acc);
  };

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-cyan-400/20 backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(56,232,255,0.3)]">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {stepsMeta.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={i} className="flex items-center flex-shrink-0">
              <div
                className={`flex flex-col items-center gap-1.5 ${
                  active ? 'text-cyan-300' : done ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    active
                      ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(56,232,255,0.5)]'
                      : done
                      ? 'border-emerald-400 bg-emerald-400/20'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium hidden md:block">{s.label}</span>
              </div>
              {i < stepsMeta.length - 1 && (
                <div className={`w-6 md:w-12 h-0.5 mx-1 ${i < step ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="space-y-5 max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-white text-center">إنشاء حساب بنكي جديد</h3>
          <p className="text-sm text-slate-400 text-center">أدخل بيانات حسابك الرقمي للبدء.</p>
          <div>
            <Label className="text-cyan-200 mb-2 block">اسم الحساب</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: محمد أحمد"
              maxLength={40}
              className="bg-slate-900/60 border-cyan-400/30 text-white"
            />
          </div>
          <div>
            <Label className="text-cyan-200 mb-2 block">المبلغ الابتدائي (دينار أردني)</Label>
            <Input
              type="number"
              min={1}
              max={1000000}
              value={balance}
              onChange={e => setBalance(e.target.value)}
              className="bg-slate-900/60 border-cyan-400/30 text-white"
            />
            <p className="text-xs text-slate-500 mt-1">هذا هو الرصيد الذي ستستخدمه للشراء من المتجر.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">إلغاء</Button>
            <Button
              disabled={!name.trim() || !parseFloat(balance)}
              onClick={() => setStep(1)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90"
            >
              التالي <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white text-center">مسح الوجه ثلاثي الأبعاد</h3>
          <p className="text-sm text-slate-400 text-center">
            ضع وجهك داخل الإطار وحافظ على ثباته حتى يكتمل بناء البصمة.
          </p>
          <FaceScanner
            mode="enroll"
            onComplete={(emb) => {
              setEmbedding(emb);
              toast({ title: '✅ تم تسجيل الوجه', description: 'بصمة وجهك جاهزة.' });
              setTimeout(() => setStep(2), 400);
            }}
          />
          <Button variant="outline" onClick={() => setStep(0)} className="w-full">
            <ArrowRight className="w-4 h-4" /> رجوع
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-md mx-auto space-y-5">
          <h3 className="text-2xl font-bold text-white text-center">اختر كلمة السر بالإيماءة</h3>
          <p className="text-sm text-slate-400 text-center">
            ستحتاج لتأدية هذه الإيماءة لتأكيد كل عملية شراء.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { type: 'smile' as PasswordType, icon: Smile, label: 'ابتسامة', desc: 'ابتسم لمدة ثانية' },
              { type: 'blinks' as PasswordType, icon: Eye, label: '٣ رمشات', desc: 'أغمض عينيك ٣ مرات' },
            ].map(opt => {
              const Icon = opt.icon;
              const active = passwordType === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => setPasswordType(opt.type)}
                  className={`p-5 rounded-2xl border-2 transition-all text-center ${
                    active
                      ? 'border-violet-400 bg-violet-500/15 shadow-[0_0_30px_rgba(139,92,246,0.4)]'
                      : 'border-slate-700 bg-slate-900/50 hover:border-violet-400/50'
                  }`}
                >
                  <Icon className={`w-10 h-10 mx-auto mb-2 ${active ? 'text-violet-300' : 'text-slate-400'}`} />
                  <div className="font-bold text-white">{opt.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <Button
              disabled={!passwordType}
              onClick={() => setStep(3)}
              className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
            >
              التالي <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && passwordType && (
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white text-center">سجّل إيماءتك السرية</h3>
          <p className="text-sm text-slate-400 text-center">
            {passwordType === 'smile' ? 'ابتسم بوضوح أمام الكاميرا.' : 'أغمض عينيك ٣ مرات بشكل واضح.'}
          </p>
          <GestureCapture type={passwordType} onSuccess={() => setStep(4)} />
          <Button variant="outline" onClick={() => setStep(2)} className="w-full">
            <ArrowRight className="w-4 h-4" /> رجوع
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-md mx-auto text-center space-y-5 py-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)]">
            <CheckCheck className="w-10 h-10 text-emerald-300" />
          </div>
          <h3 className="text-2xl font-bold text-white">حسابك جاهز!</h3>
          <p className="text-sm text-slate-400">
            تم ربط وجهك بإيماءتك السرية بنجاح. يمكنك الآن الدخول للمتجر والشراء بمسح وجهك فقط.
          </p>
          <Button
            onClick={finish}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 text-white font-bold"
          >
            دخول إلى حسابي
          </Button>
        </div>
      )}
    </div>
  );
};
