import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRODUCTS, type FaceProduct } from '@/components/facepay/Store';
import { FacePayCheckout } from '@/components/facepay/FacePayCheckout';
import { loadAccount, type FacePayAccount } from '@/lib/facepay/storage';
import {
  ArrowRight, Search, ShoppingBag, ShoppingCart, Plus, Minus, Trash2,
  Sparkles, CheckCircle2, X, ScanFace, AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CartItem { product: FaceProduct; qty: number; }
interface CompletedOrder { items: CartItem[]; total: number; accountName: string; date: string; }

const ALL = 'الكل';

const AIFutureStore = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [account, setAccount] = useState<FacePayAccount | null>(() => loadAccount());
  const [payProduct, setPayProduct] = useState<FaceProduct | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(PRODUCTS.map(p => p.category)))],
    []
  );

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = category === ALL || p.category === category;
      const matchQ = !query.trim() || p.name.includes(query.trim());
      return matchCat && matchQ;
    });
  }, [category, query]);

  const total = cart.reduce((s, it) => s + it.product.price * it.qty, 0);
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);

  const addToCart = (p: FaceProduct) => {
    setCart(prev => {
      const ex = prev.find(it => it.product.id === p.id);
      if (ex) return prev.map(it => it.product.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      return [...prev, { product: p, qty: 1 }];
    });
    toast({ title: 'أُضيف إلى السلة', description: p.name });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(it => it.product.id === id ? { ...it, qty: it.qty + delta } : it)
      .filter(it => it.qty > 0));
  };

  const removeItem = (id: string) =>
    setCart(prev => prev.filter(it => it.product.id !== id));

  const checkout = () => {
    if (cart.length === 0) return;
    const freshAccount = loadAccount();
    setAccount(freshAccount);
    if (!freshAccount) {
      toast({ title: 'الحساب غير موجود', description: 'يرجى إنشاء حساب بنكي وهمي في FacePay أولاً.' });
      return;
    }
    if (total > freshAccount.balance) {
      toast({ title: 'رصيد غير كافٍ', description: `رصيدك الحالي ${freshAccount.balance} د.أ والمطلوب ${total} د.أ.` });
      return;
    }
    setPayProduct({
      id: `cart-${Date.now()}`,
      name: `طلب المتجر (${itemCount} منتج)`,
      price: total,
      category: 'سلة التسوق',
      image: cart[0]?.product.image ?? '',
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(56,232,255,0.10),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.12),_transparent_60%)] bg-slate-950 text-white">
      <Helmet>
        <title>المتجر الذكي AI Store | مستقبل التكنولوجيا</title>
        <meta name="description" content="متجر إلكتروني مستقل بـ ٢٤ منتجاً وسلة شراء كاملة ضمن قسم الذكاء الاصطناعي." />
      </Helmet>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-slate-950/60 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gju-competition')}
            className="text-cyan-200"
          >
            <ArrowRight className="w-4 h-4" />
            مستقبل التكنولوجيا
          </Button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(56,232,255,0.5)]">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">المتجر الذكي</h1>
                <p className="text-[10px] text-cyan-300/80 leading-tight font-mono">AI STORE v1</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90"
            >
              <ShoppingCart className="w-4 h-4" />
              السلة
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Hero */}
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/30 text-xs text-violet-200">
            <Sparkles className="w-3.5 h-3.5" />
            متجر مستقل تماماً عن الحساب البنكي FacePay
          </div>
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
            تسوّق بحرية — ٢٤ منتجاً عبر ٧ فئات
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            استعرض المنتجات وأضفها إلى السلة. لا حاجة لحساب أو وجه — تجربة تسوّق صافية.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur">
          <div className="relative max-w-md w-full mr-auto">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              dir="rtl"
              placeholder="ابحث عن منتج..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-9 bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => {
              const active = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 border-transparent text-white shadow-[0_4px_20px_-4px_rgba(56,232,255,0.5)]'
                      : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200'
                  ].join(' ')}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-3">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            {filtered.length} منتج {category !== ALL && `في ${category}`}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 border border-dashed border-white/10 rounded-2xl">
            لا توجد منتجات مطابقة.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div
                key={p.id}
                className="group rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(56,232,255,0.3)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-800 relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-cyan-200 backdrop-blur border border-cyan-400/30">
                    {p.category}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-300 font-bold text-lg">
                      {p.price}
                      <span className="text-[10px] text-slate-400 font-normal mr-1">د.أ</span>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(p)}
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      أضف للسلة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex" dir="rtl">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <aside className="w-full max-w-md bg-slate-950 border-l border-white/10 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-300" />
                سلة التسوّق
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {checkoutDone && completedOrder ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.7)]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-emerald-300">تم الطلب بنجاح!</h4>
                  <p className="text-sm text-slate-400 mt-1">تم الدفع عبر وجه {completedOrder.accountName}</p>
                </div>
                <div className="w-full space-y-2 text-right">
                  {completedOrder.items.map(it => (
                    <div key={it.product.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
                      <span className="text-sm text-white">{it.product.name} × {it.qty}</span>
                      <span className="text-sm font-bold text-cyan-300">{it.product.price * it.qty} د.أ</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-sm text-slate-400">المجموع</span>
                    <span className="text-2xl font-bold text-emerald-300">{completedOrder.total} د.أ</span>
                  </div>
                </div>
                <Button onClick={() => { setCheckoutDone(false); setCompletedOrder(null); setShowCart(false); }} className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90">
                  إغلاق التفاصيل
                </Button>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
                <ShoppingBag className="w-16 h-16 opacity-30" />
                <p>سلتك فارغة. أضف بعض المنتجات!</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map(it => (
                    <div
                      key={it.product.id}
                      className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/10"
                    >
                      <img
                        src={it.product.image}
                        alt={it.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white line-clamp-1">
                          {it.product.name}
                        </div>
                        <div className="text-xs text-emerald-300 mt-1">
                          {it.product.price} د.أ
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-7 h-7 border-white/20"
                            onClick={() => updateQty(it.product.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center">{it.qty}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-7 h-7 border-white/20"
                            onClick={() => updateQty(it.product.id, +1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 mr-auto text-rose-300 hover:bg-rose-500/10"
                            onClick={() => removeItem(it.product.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-left text-sm font-bold text-cyan-300">
                        {it.product.price * it.qty} د.أ
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">المجموع</span>
                    <span className="text-2xl font-bold text-emerald-300">
                      {total} <span className="text-xs text-slate-400 font-normal">د.أ</span>
                    </span>
                  </div>
                  <Button
                    onClick={checkout}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-base font-bold"
                  >
                    <ScanFace className="w-5 h-5" />
                    إتمام الطلب والدفع بالوجه
                  </Button>
                  {!account && (
                    <p className="flex items-center gap-1.5 text-xs text-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      إذا لم يتم العثور على حساب، أنشئ حساباً وهمياً من FacePay أولاً.
                    </p>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {account && payProduct && (
        <FacePayCheckout
          open={!!payProduct}
          product={payProduct}
          account={account}
          onClose={() => { setPayProduct(null); setAccount(loadAccount()); }}
          onSuccess={(updated) => {
            setCompletedOrder({
              items: cart,
              total,
              accountName: updated.name,
              date: new Date().toISOString(),
            });
            setAccount(updated);
            setCart([]);
            setPayProduct(null);
            setCheckoutDone(true);
          }}
        />
      )}
    </div>
  );
};

export default AIFutureStore;
