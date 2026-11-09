# نظام التصميم: ذروة العلم

هوية واحدة لكل صفحات المنصة، في الوضعين الفاتح والداكن.

## المبدأ الأساسي
**لا ألوان مكتوبة يدوياً في الصفحات.** كل لون يأتي من رموز التصميم (design tokens) المعرّفة في `src/index.css`، حتى تتبدّل الصفحة تلقائياً بين الوضعين وتبقى متطابقة مع باقي المنصة.

| بدل هذا ❌ | استخدم هذا ✅ |
|---|---|
| `bg-[#F8FAFC]` / `bg-slate-950` / `bg-gradient-to-b from-blue-900` | `bg-background` (يأتي من `PageShell`) |
| `bg-white dark:bg-slate-900` | `bg-card` |
| `text-slate-900 dark:text-white` | `text-foreground` |
| `text-slate-500 dark:text-slate-400` | `text-muted-foreground` |
| `border-slate-200 dark:border-slate-800` | `border-border` |
| `bg-blue-600` / `bg-cyan-500` للأزرار | `bg-primary text-primary-foreground` أو `<Button>` |
| `from-cyan-600 to-blue-600` | `from-brand-from to-brand-to` |
| `text-green-600` / `text-amber-500` للحالات | `text-success` / `text-warning` / `text-destructive` |

## الرموز
| الرمز | الفاتح | الداكن | الاستخدام |
|---|---|---|---|
| `background` | `#F8FAFC` | `#060818` | خلفية الصفحة |
| `card` | أبيض | `slate-900` | البطاقات والأسطح |
| `primary` | `blue-600` | `sky-500` | الأزرار والروابط والعنصر النشط |
| `accent` | سماوي فاتح | سماوي داكن | خلفية الأيقونات والتمييز الخفيف |
| `brand-from` → `brand-to` | سماوي ← أزرق | سماوي ← أزرق | التدرّج المميز للهوية (أيقونة العنوان، الأزرار البارزة) |
| `muted-foreground` | `slate-500` | `slate-400` | النص الثانوي |
| `border` | `slate-200` | `slate-800` | الحدود |
| `success` / `warning` / `destructive` | | | الحالات |
| `--radius` | `1rem` | | زوايا مكونات shadcn |

الخط: **Cairo** (محمّل في `index.html`)، والاتجاه دائماً `rtl`.

## مكونات الصفحة (`src/components/layout/PageShell.tsx`)
```tsx
import { PageShell, PageHeader, PageSection, PageCardLink } from '@/components/layout/PageShell';

<PageShell>                      {/* القائمة العلوية + الخلفية + الهامش + التذييل */}
  <PageHeader
    title="الفيزياء"
    description="دروس ومحاكاة وأسئلة"
    icon={Atom}
    crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'التعلّم', to: '/learn' }, { label: 'الفيزياء' }]}
    actions={<Button>ابدأ</Button>}
  />
  <PageSection title="الوحدات">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <PageCardLink to="/..." title="..." description="..." icon={...} />
    </div>
  </PageSection>
</PageShell>
```
- الأدوات التي تحتاج كامل الشاشة (المختبرات، تشغيل الامتحان): `<PageShell bare>`.
- البطاقات: `rounded-3xl border border-border bg-card p-5 shadow-sm`.
- مسار الصفحة (crumbs) يبدأ دائماً بالرئيسية ثم القسم الذي تنتمي إليه الصفحة في `platformSections.ts`.

## الوضع الفاتح القديم
`src/index.css` يحتوي على طبقة تجاوز ضخمة تحت `.light` تعيد تلوين الصفحات القديمة الداكنة بالقوة (`!important`). هي حل مؤقت: كل صفحة تُنقل إلى `PageShell` والرموز لم تعد تحتاجها. عندما تنتقل كل الصفحات تُحذف هذه الطبقة.

## الأقسام الخاصة
صفحات **ذكاء المنصة** (المشاريع المستقبلية: دامج، مستقبل التكنولوجيا) تحتفظ بتصميمها الحالي ولا تُنقل.
