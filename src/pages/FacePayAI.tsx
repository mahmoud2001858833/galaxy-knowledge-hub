import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateAccountWizard } from '@/components/facepay/CreateAccountWizard';
import { Store, PRODUCTS, type FaceProduct } from '@/components/facepay/Store';
import { FacePayCheckout } from '@/components/facepay/FacePayCheckout';
import { loadAccount, deleteAccount, type FacePayAccount } from '@/lib/facepay/storage';
import {
  ArrowRight, ScanFace, Wallet, ShoppingBag, History, Trash2, ShieldAlert,
  Smile, Eye, Sparkles, ListChecks, CheckCircle2, XCircle, RotateCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FacePayAI = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<FacePayAccount | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [tab, setTab] = useState<'home' | 'store' | 'history' | 'attempts'>('home');
  const [checkoutProduct, setCheckoutProduct] = useState<FaceProduct | null>(null);

  useEffect(() => {
    setAccount(loadAccount());
  }, []);

  const handleResetAccount = () => {
    if (!confirm('سيتم حذف الحساب والبصمة بشكل نهائي. هل أنت متأكد؟')) return;
    deleteAccount();
    setAccount(null);
    setTab('home');
    toast({ title: 'تم حذف الحساب' });
  };

  const handleBuy = (p: FaceProduct) => setCheckoutProduct(p);

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(56,232,255,0.12),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.15),_transparent_60%)] bg-slate-950 text-white">
      <Helmet>
        <title>الدفع بالوجه FacePay AI | مستقبل التكنولوجيا</title>
        <meta name="description" content="تجربة بنكية مستقبلية: أنشئ حساباً، سجّل وجهك بالذكاء الاصطناعي، وادفع من المتجر بمسح وجهك وإيماءة سرية." />
      </Helmet>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-slate-950/60 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gju-competition')} className="text-cyan-200">
            <ArrowRight className="w-4 h-4" />
            مستقبل التكنولوجيا
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(56,232,255,0.5)]">
              <ScanFace className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">FacePay AI</h1>
              <p className="text-[10px] text-cyan-300/80 leading-tight font-mono">FACE-AUTH PAYMENT v3</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Demo banner */}
        <div className="mb-6 flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30">
          <ShieldAlert className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-100/90 leading-relaxed">
            <strong>تجربة تعليمية ضمن GJU 3030</strong> — هذه ليست منصة دفع حقيقية. كل البيانات (الوجه، الرصيد، السجل)
            تُحفظ محلياً في متصفحك فقط ولا تُرسل لأي خادم.
          </p>
        </div>

        {!account && !showWizard && (
          <div className="text-center py-10 md:py-16 space-y-6">
            <div className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 via-violet-500 to-emerald-500 items-center justify-center shadow-[0_20px_60px_-12px_rgba(139,92,246,0.6)] animate-pulse">
              <ScanFace className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
                ادفع بوجهك. لا بطاقات. لا أرقام.
              </h2>
              <p className="mt-3 text-slate-400 max-w-2xl mx-auto leading-relaxed">
                أنشئ حسابك البنكي الرقمي، سجّل بصمة وجهك بمسح ثلاثي الأبعاد، اختر إيماءة سرية،
                وتسوّق من متجرنا الذي يضم ٢٤ منتجاً — كل عملية تتم بمسح وجهك فقط.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
              {[
                { icon: ScanFace, title: 'مسح وجه دقيق', desc: '٤٦٨ نقطة بمحرك MediaPipe' },
                { icon: Smile, title: 'كلمة سر بالإيماءة', desc: 'ابتسامة أو ٣ رمشات' },
                { icon: ShoppingBag, title: 'متجر متكامل', desc: '٢٤ منتجاً وأكثر' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur">
                    <Icon className="w-8 h-8 text-cyan-300 mb-2 mx-auto" />
                    <div className="font-bold">{f.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
                  </div>
                );
              })}
            </div>

            <Button
              size="lg"
              onClick={() => setShowWizard(true)}
              className="h-14 px-8 text-base bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500 hover:opacity-90 shadow-[0_10px_40px_-10px_rgba(139,92,246,0.7)]"
            >
              <Sparkles className="w-5 h-5" />
              إنشاء حساب بنكي جديد
            </Button>
          </div>
        )}

        {showWizard && !account && (
          <CreateAccountWizard
            onDone={(acc) => { setAccount(acc); setShowWizard(false); setTab('store'); }}
            onCancel={() => setShowWizard(false)}
          />
        )}

        {account && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-slate-900/60 border border-white/10 h-12">
              <TabsTrigger value="home"><Wallet className="w-4 h-4 ml-1" />حسابي</TabsTrigger>
              <TabsTrigger value="store"><ShoppingBag className="w-4 h-4 ml-1" />المتجر</TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4 ml-1" />السجل</TabsTrigger>
              <TabsTrigger value="attempts">
                <ListChecks className="w-4 h-4 ml-1" />المحاولات
                {(account.attempts?.length ?? 0) > 0 && (
                  <span className="mr-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 text-[10px]">
                    {account.attempts!.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Card */}
                <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-cyan-600 to-emerald-500 relative overflow-hidden shadow-[0_30px_80px_-20px_rgba(56,232,255,0.5)]">
                  <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-black/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-xs text-white/70 font-mono">FACEPAY · BANK CARD</p>
                        <h2 className="text-2xl font-bold mt-1">{account.name}</h2>
                      </div>
                      <ScanFace className="w-10 h-10 opacity-80" />
                    </div>
                    <p className="text-xs text-white/70">الرصيد المتاح</p>
                    <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                      {account.balance.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}
                      <span className="text-base font-normal text-white/70 mr-2">د.أ</span>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs text-white/80">
                      {account.passwordType === 'smile' ? <Smile className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>كلمة السر: {account.passwordType === 'smile' ? 'ابتسامة' : '٣ رمشات'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setTab('store')}
                    className="w-full h-14 bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    اذهب إلى المتجر
                  </Button>
                  <Button
                    onClick={() => setTab('history')}
                    variant="outline"
                    className="w-full h-12 border-white/20 hover:bg-white/5"
                  >
                    <History className="w-4 h-4" />
                    سجل المشتريات ({account.history.length})
                  </Button>
                  <Button
                    onClick={handleResetAccount}
                    variant="outline"
                    className="w-full h-12 border-rose-400/30 text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف الحساب
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="store">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">المتجر</h2>
                <div className="text-sm text-slate-400">
                  رصيدك: <span className="text-emerald-300 font-bold">{account.balance.toFixed(2)} د.أ</span>
                </div>
              </div>
              <Store balance={account.balance} onBuy={handleBuy} onBack={() => setTab('home')} />
            </TabsContent>

            <TabsContent value="history">
              <h2 className="text-xl font-bold mb-4">سجل المشتريات</h2>
              {account.history.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-white/10 rounded-2xl">
                  لا توجد عمليات شراء بعد.
                </div>
              ) : (
                <div className="space-y-2">
                  {account.history.map(tx => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/10"
                    >
                      <div>
                        <div className="font-bold text-white">{tx.productName}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(tx.date).toLocaleString('ar-EG')}
                        </div>
                      </div>
                      <div className="text-rose-300 font-bold">- {tx.amount} د.أ</div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="attempts">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">سجل المحاولات</h2>
                <span className="text-xs text-slate-400">
                  آخر {Math.min(account.attempts?.length ?? 0, 50)} عملية
                </span>
              </div>
              {(!account.attempts || account.attempts.length === 0) ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-white/10 rounded-2xl">
                  لا توجد محاولات بعد. ابدأ من المتجر.
                </div>
              ) : (
                <div className="space-y-2">
                  {account.attempts.map(att => {
                    const success = att.status === 'success';
                    const StatusIcon = success ? CheckCircle2 : XCircle;
                    const reasonLabel: Record<string, string> = {
                      success: 'تمت بنجاح',
                      face_mismatch: 'فشل التعرّف على الوجه',
                      gesture_failed: 'إيماءة كلمة السر غير صحيحة',
                      cancelled: 'تم الإلغاء يدوياً',
                      insufficient_balance: 'رصيد غير كافٍ',
                    };
                    const product = PRODUCTS.find(p => p.id === att.productId)
                      ?? PRODUCTS.find(p => p.name === att.productName);
                    return (
                      <div
                        key={att.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border ${
                          success
                            ? 'bg-emerald-500/5 border-emerald-400/20'
                            : 'bg-rose-500/5 border-rose-400/20'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm truncate">{att.productName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              success
                                ? 'bg-emerald-500/20 text-emerald-200'
                                : 'bg-rose-500/20 text-rose-200'
                            }`}>
                              {success ? 'نجح' : 'فشل'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {reasonLabel[att.reason] ?? att.reason} · {new Date(att.date).toLocaleString('ar-EG')}
                          </div>
                        </div>
                        <div className="text-left flex-shrink-0">
                          <div className={`font-bold text-sm ${success ? 'text-rose-300' : 'text-slate-400'}`}>
                            {success ? '-' : ''}{att.amount} د.أ
                          </div>
                          {!success && product && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCheckoutProduct(product)}
                              className="mt-1 h-7 text-[11px] border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10"
                            >
                              <RotateCw className="w-3 h-3" />
                              إعادة المحاولة
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {account && checkoutProduct && (
        <FacePayCheckout
          open={!!checkoutProduct}
          product={checkoutProduct}
          account={account}
          onClose={() => { setCheckoutProduct(null); setAccount(loadAccount()); }}
          onSuccess={(updated) => { setAccount(updated); setCheckoutProduct(null); }}
        />
      )}
    </div>
  );
};

export default FacePayAI;
