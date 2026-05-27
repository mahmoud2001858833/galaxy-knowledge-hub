# خطة شاملة لمنصة دامج

## 1) نظام دخول مستقل لدامج (Damij Auth)

### الفكرة
يستخدم Supabase Auth (نفس قاعدة المستخدمين الموحّدة لا يمكن تفاديها)، لكن **حساب دامج موجود فقط إذا كان للمستخدم سطر في جدول `damij_users`**. أي مستخدم سجّل في "ذروة العلم" ودخل `/damij` سيُطلب منه إنشاء حساب دامج جديد (أو ربط نفس البريد بحساب دامج).

### الجداول الجديدة
```sql
CREATE TABLE public.damij_users (
  id uuid PK default gen_random_uuid(),
  user_id uuid not null unique,  -- auth.users.id
  display_name text not null,
  role text not null default 'caregiver' check (role in ('caregiver','therapist','teacher','self','other')),
  preferred_lang text default 'ar',
  avatar_url text,
  created_at timestamptz default now()
);
-- GRANT + RLS (auth.uid()=user_id select/insert/update)
```

### الصفحات الجديدة
- `src/pages/damij/auth/DamijAuth.tsx` — صفحة دخول/تسجيل أنيقة بتصميم زجاجي (glass-morphism) متوافق مع هوية دامج، تحوي:
  - Tabs: "تسجيل دخول" / "إنشاء حساب"
  - حقول: البريد، كلمة المرور، الاسم، الدور (في التسجيل)
  - أزرار خط زجاجي + خلفية متحركة بتدرّجات دامج
  - رابط "نسيت كلمة المرور" → `/damij/auth/reset`
- `src/pages/damij/auth/DamijResetPassword.tsx` — صفحة تعيين كلمة مرور جديدة

### Guard
- `src/components/damij/DamijAuthGuard.tsx` — يفحص session + وجود سطر `damij_users`. إن لم يوجد → redirect إلى `/damij/auth?returnUrl=<original>`.
- يُلفّ حول `<DamijLayout />` في `App.tsx` (يستبدل `<PublicRoute>` الحالي بـ `<DamijAuthGuard>`).
- استثناءات (تظل عامة): `/damij/auth`, `/damij/auth/reset`, `/damij/clinical/public/:token`, `/autism/c/:token`.

### تبديل الحساب
- زر "تسجيل خروج من دامج" في `DamijHeader` يقوم بـ `signOut()` ويرجع لـ `/damij/auth` (لا يلمس جلسة ذروة العلم لأنه نفس الـ session — لكن سيحوّل المستخدم خارج دامج فقط).

---

## 2) تحسين الواجهة (Header + Logo + Eco)

### Header
- شفافية زجاجية مع `backdrop-blur-xl`، خط ذهبي رفيع أسفل
- شعار جديد متحرّك (SVG + شعاع نبضي خفيف) — تحديث `DamijBrandLogo`
- زر اللغة + زر "الوضع البيئي" أصغر وأنيق داخل Header (يستبدل البانر العلوي)

### نقل الوضع البيئي
- **حذف `DamijEcoBanner` من أعلى الصفحة** ووضع زر دائري صغير في Header مع Popover يعرض: حالة الوضع، الـ CO₂ الموفّر، زر التشغيل/الإيقاف
- ملف جديد: `src/components/damij/DamijEcoToggle.tsx`

---

## 3) Hover-Speak + Smart Guide: تصميم متحرّك مع التمرير

### المشكلة الحالية
الزرّان مثبّتان بـ `fixed bottom`، لا يتحركان مع scroll. المطلوب أن "يطلعوا وينزلوا" مع تحركات المنصة.

### الحل
- Container جديد `DamijFloatingDock` (Bottom-end، عمودي) يضم Smart Guide + Hover Speak + Eco Quick + Language Quick
- استخدام `framer-motion` مع `useScroll` + `useTransform`:
  - عند Scroll للأسفل بسرعة: تنزلق الأزرار للأسفل قليلاً (y: 20) وتقل العتامة (opacity 0.5)
  - عند التوقف/Scroll للأعلى: ترجع لمكانها بـ spring
- شكل أرقى: أزرار دائرية أصغر (12 → 14)، حلقة zircon متدرجة، ظل ملوّن، تموّج عند الضغط
- لمسة فاخرة: micro-interaction عند Hover (rotate-y 8deg + glow)

### ملفات
- جديد: `src/components/damij/DamijFloatingDock.tsx`
- تعديل: `DamijSmartGuide`, `DamijHoverSpeak` لاستقبال `compact` mode وحذف الـ `fixed` الخاص بهما (يصبحان داخل Dock)
- تعديل: `DamijLayout` لاستبدالهما بـ `<DamijFloatingDock />`

---

## 4) حل تأخر الترجمة

### المشاكل القائمة
- عند تبديل اللغة، الزوار يرون النص العربي ثم يتحدّث تدريجياً
- لا تظهر مؤشر تقدّم واضح، فقط شارة صغيرة في الزاوية

### الحلول
1. **Skeleton فوري للنص**: عند تبديل اللغة، يُطبَّق فلتر `blur-sm opacity-60` على `.damij-root` مع overlay رسالة "جاري الترجمة…" حتى تصل أول دفعة
2. **Cache مُسبق**: على أول زيارة بلغة ما، يجلب القاموس الأساسي (200 مصطلح شائع من قاموس ثابت `src/features/damij/i18n/core-dictionary.ts`) فوراً من ملف JSON محلي بدلاً من API
3. **زيادة التوازي**: دفعات 30 → 60، وزيادة `Promise.all` إلى 6 دفعات متوازية بدل غير محدود
4. **Cache مشترك في DB**: جدول جديد `damij_translation_cache (source_text text, lang text, translated text, PRIMARY KEY (source_text, lang))` يستخدمه edge function `damij-translate` للقراءة قبل استدعاء AI، ويكتب النتائج للجميع
5. **Overlay عرض التقدّم**: عوض loader صغير، شريط علوي ممتدّ (`progress bar`) يعرض "ترجمة 45/120"

### ملفات
- جديد: `src/features/damij/i18n/core-dictionary.ts` (مصطلحات Header/Nav/Buttons الثابتة)
- جديد: `supabase/migrations/...` لإنشاء `damij_translation_cache` و `damij_users`
- تعديل: `supabase/functions/damij-translate/index.ts` للقراءة/الكتابة من Cache
- تعديل: `DamijAutoTranslator.tsx` للـ skeleton + progress bar

---

## 5) Routing تعديلات

في `App.tsx`:
```tsx
{
  path: 'damij',
  element: <DamijAuthGuard><DamijLayout /></DamijAuthGuard>,
  children: [
    { index: true, element: <DamijLanding /> },
    // باقي المسارات...
  ],
},
{ path: 'damij/auth', element: <DamijAuth /> },           // خارج Guard
{ path: 'damij/auth/reset', element: <DamijResetPassword /> },
```

---

## التقنيات
- Supabase Auth (email/password)
- Framer Motion للحركة المتزامنة مع scroll
- Tailwind للـ glass-morphism
- لا Lovable AI (محظور)
- Cache في DB لتسريع الترجمة

## ترتيب التنفيذ
1. Migration (`damij_users` + `damij_translation_cache`)
2. صفحات Auth + Guard + ربط Routing
3. Header الجديد + نقل Eco
4. Dock العائم + Scroll-aware animation
5. تحسينات الترجمة (skeleton + cache + progress)

هل أبدأ؟
