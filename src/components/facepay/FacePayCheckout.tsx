import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaceScanner } from './FaceScanner';
import { GestureCapture } from './GestureCapture';
import { addTransaction, type FacePayAccount } from '@/lib/facepay/storage';
import type { FaceProduct } from './Store';
import { ScanFace, KeyRound, ShieldCheck, CheckCircle2, ShoppingBag } from 'lucide-react';

interface FacePayCheckoutProps {
  open: boolean;
  product: FaceProduct | null;
  account: FacePayAccount;
  onClose: () => void;
  onSuccess: (acc: FacePayAccount) => void;
}

type Phase = 'identify' | 'password' | 'confirm' | 'success';

export const FacePayCheckout = ({ open, product, account, onClose, onSuccess }: FacePayCheckoutProps) => {
  const [phase, setPhase] = useState<Phase>('identify');

  const reset = () => setPhase('identify');
  const handleClose = () => { reset(); onClose(); };

  const completePurchase = () => {
    if (!product) return;
    const updated = addTransaction(product.name, product.price);
    if (updated) {
      setPhase('success');
      setTimeout(() => {
        onSuccess(updated);
        reset();
      }, 1800);
    }
  };

  if (!product) return null;

  const phaseMeta: Record<Phase, { icon: typeof ScanFace; title: string; sub: string }> = {
    identify: { icon: ScanFace, title: 'مسح الوجه', sub: 'انظر إلى الكاميرا للتعرف على هويتك' },
    password: { icon: KeyRound, title: 'كلمة السر بالإيماءة', sub: account.passwordType === 'smile' ? 'ابتسم لتأكيد هويتك' : 'أغمض عينيك ٣ مرات' },
    confirm: { icon: ShieldCheck, title: 'تأكيد العملية', sub: 'كرر الإيماءة لإتمام الشراء' },
    success: { icon: CheckCircle2, title: 'تمت العملية', sub: '' },
  };

  const meta = phaseMeta[phase];
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-400/30 text-white" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="w-5 h-5 text-cyan-300" />
            دفع بالوجه — {product.name}
          </DialogTitle>
        </DialogHeader>

        {/* Phase header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-400/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-cyan-200" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-sm">{meta.title}</div>
            <div className="text-xs text-slate-400">{meta.sub}</div>
          </div>
          <div className="text-left">
            <div className="text-xs text-slate-400">المبلغ</div>
            <div className="font-bold text-emerald-300">{product.price} د.أ</div>
          </div>
        </div>

        {phase === 'identify' && (
          <div className="space-y-3">
            <FaceScanner
              mode="verify"
              expectedEmbedding={account.faceEmbedding}
              onComplete={() => {
                setTimeout(() => setPhase('password'), 400);
              }}
            />
            <p className="text-center text-xs text-cyan-200">
              عند التعرف عليك سيظهر اسم حسابك تلقائياً.
            </p>
          </div>
        )}

        {phase === 'password' && (
          <div className="space-y-3">
            <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
              <p className="text-xs text-emerald-200">تم التعرف على</p>
              <p className="text-lg font-bold text-emerald-300">{account.name}</p>
            </div>
            <GestureCapture
              type={account.passwordType}
              onSuccess={() => setPhase('confirm')}
              label="أدخل كلمة السر"
            />
          </div>
        )}

        {phase === 'confirm' && (
          <div className="space-y-3">
            <div className="text-center p-3 rounded-xl bg-violet-500/10 border border-violet-400/30">
              <p className="text-xs text-violet-200">تأكيد العملية</p>
              <p className="text-sm text-white">كرر الإيماءة لإتمام الشراء</p>
            </div>
            <GestureCapture
              type={account.passwordType}
              onSuccess={completePurchase}
              label="تأكيد الإيماءة"
            />
          </div>
        )}

        {phase === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.7)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-emerald-300">تم الشراء بنجاح!</h3>
              <p className="text-sm text-slate-400 mt-1">
                تم خصم <span className="text-white font-bold">{product.price} د.أ</span> من حسابك
              </p>
            </div>
          </div>
        )}

        {phase !== 'success' && (
          <Button variant="outline" onClick={handleClose} className="w-full">
            إلغاء العملية
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
