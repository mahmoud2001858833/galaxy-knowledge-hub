import { useMemo, useState } from 'react';
import { ScanFace, ArrowRight, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FaceProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export const PRODUCTS: FaceProduct[] = [
  { id: 'p1', name: 'سماعات لاسلكية Pro', price: 65, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
  { id: 'p2', name: 'ساعة ذكية رياضية', price: 120, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
  { id: 'p3', name: 'لابتوب احترافي', price: 850, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop' },
  { id: 'p4', name: 'كاميرا رقمية DSLR', price: 540, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop' },
  { id: 'p5', name: 'هاتف ذكي حديث', price: 720, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop' },
  { id: 'p6', name: 'حذاء رياضي', price: 55, category: 'ملابس', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop' },
  { id: 'p7', name: 'جاكيت شتوي', price: 90, category: 'ملابس', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop' },
  { id: 'p8', name: 'نظارة شمسية', price: 35, category: 'ملابس', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop' },
  { id: 'p9', name: 'حقيبة ظهر', price: 42, category: 'ملابس', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop' },
  { id: 'p10', name: 'قهوة عربية فاخرة', price: 18, category: 'طعام', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop' },
  { id: 'p11', name: 'صندوق شوكولاتة', price: 22, category: 'طعام', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop' },
  { id: 'p12', name: 'عسل طبيعي 1كغ', price: 28, category: 'طعام', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop' },
  { id: 'p13', name: 'كتاب: الذكاء الاصطناعي', price: 15, category: 'كتب', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop' },
  { id: 'p14', name: 'موسوعة العلوم', price: 32, category: 'كتب', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop' },
  { id: 'p15', name: 'رواية أدبية', price: 12, category: 'كتب', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop' },
  { id: 'p16', name: 'يد تحكم ألعاب', price: 48, category: 'ألعاب', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=300&fit=crop' },
  { id: 'p17', name: 'لعبة ليغو', price: 60, category: 'ألعاب', image: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=400&h=300&fit=crop' },
  { id: 'p18', name: 'طائرة درون', price: 240, category: 'ألعاب', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop' },
  { id: 'p19', name: 'عطر شرقي فاخر', price: 75, category: 'عطور', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop' },
  { id: 'p20', name: 'عطر نسائي', price: 68, category: 'عطور', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=300&fit=crop' },
  { id: 'p21', name: 'مكواة بخار', price: 45, category: 'منزل', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop' },
  { id: 'p22', name: 'مكنسة كهربائية', price: 180, category: 'منزل', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop' },
  { id: 'p23', name: 'نباتات منزلية', price: 25, category: 'منزل', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop' },
  { id: 'p24', name: 'دراجة هوائية', price: 320, category: 'رياضة', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop' },
];

interface StoreProps {
  balance: number;
  onBuy: (p: FaceProduct) => void;
  onBack?: () => void;
}

const ALL = 'الكل';

export const Store = ({ balance, onBuy, onBack }: StoreProps) => {
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState('');

  const categories = useMemo(() => [ALL, ...Array.from(new Set(PRODUCTS.map(p => p.category)))], []);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = category === ALL || p.category === category;
      const matchQ = !query.trim() || p.name.includes(query.trim());
      return matchCat && matchQ;
    });
  }, [category, query]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="border-white/20 hover:bg-white/5 text-cyan-200"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
          )}
          <div className="relative flex-1 max-w-sm mr-auto">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              dir="rtl"
              placeholder="ابحث عن منتج..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-9 bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category chips */}
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

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
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
          {filtered.map(p => {
            const insufficient = p.price > balance;
            return (
              <div
                key={p.id}
                className="group rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(56,232,255,0.3)] animate-in fade-in"
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
                  {insufficient && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <span className="px-3 py-1 rounded-full bg-rose-500/80 text-white text-xs font-bold">
                        رصيد غير كافٍ
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-bold text-lg">
                      {p.price}
                      <span className="text-[10px] text-slate-400 font-normal mr-1">د.أ</span>
                    </span>
                    <Button
                      size="sm"
                      disabled={insufficient}
                      onClick={() => onBuy(p)}
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90 disabled:opacity-40 text-xs group-hover:scale-105 transition-transform"
                    >
                      <ScanFace className="w-3.5 h-3.5" />
                      ادفع بالوجه
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
