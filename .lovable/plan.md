# خطة تحسين منصة الدعم (دامج)

## 1) إتاحة الصفحة الرئيسية بدون تسجيل دخول
- في `src/App.tsx` السطر 981 سيُزال غلاف `<DamijAuthGuard>` من حول `<DamijLayout/>`.
- يُلفّ كل **route فرعي** بـ `DamijAuthGuard` (braille, blind-eye, autism, adhd, sign, clinical, dashboard…) بحيث:
  - `/damij` (الـ `index`) = **عام بدون دخول**.
  - أي خيار آخر = يفتح شاشة الدخول مع `returnUrl` للرجوع التلقائي بعد الدخول.
- `DamijAuthGuard` نفسه يبقى كما هو (يحوي منطق `getSession` + `damij_users` + `onAuthStateChange`).

## 2) Header منصة دامج — قائمة المستخدم
يُضاف إلى `src/components/damij/DamijHeader.tsx` في الجانب اليساري (بجوار Eco + اللغة):

**حالة غير مسجَّل:**
- زرّ «تسجيل الدخول» يربط إلى `/damij/auth?returnUrl=<current>` بنفس ألوان المنصّة (`--damij-primary`).

**حالة مسجَّل دخول:**
- زرّ دائريّ يعرض الحرف الأول من الاسم + إشارة حالة خضراء.
- عند الضغط: قائمة منسدلة (Popover من shadcn) تعرض:
  - الاسم الكامل + البريد + الدور (caregiver/therapist/teacher…)
  - حالة الجلسة («متصل الآن») وعداد الإحصاءات (عدد البرامج النشطة، عدد التقارير)
  - روابط: «حسابي»، «لوحتي» (`/damij/dashboard`)، «الإعدادات»
  - زرّ «تسجيل الخروج» (`supabase.auth.signOut()` ثم تحويل إلى `/damij`).
- يُضاف `useEffect` يستمع لـ `supabase.auth.onAuthStateChange` ويسحب صفّ `damij_users` لعرض الاسم والدور.

## 3) تحسين شاشة الدخول `DamijAuth`
- نفس tokens الحالية (`--damij-primary`, `--damij-accent-2`, `--damij-bg`) — **بدون تغيير الألوان**.
- إعادة تخطيط بطاقة الدخول:
  - عمودان على الشاشات الكبيرة: يسار = بطاقة الدخول، يمين = panel ترحيب (شعار + 3 نقاط تعريفية + اقتباس).
  - حقول بإطار glass + أيقونة Mail/Lock أنيقة، تركيز focus-ring بلون primary.
  - تبويبتان زجاجيتان «دخول / إنشاء» مع underline متحرّك (Framer Motion `layoutId`).
  - زرّ submit بتدرّج `primary → accent-2` + حالة loading واضحة.
  - رابطان أسفل: «نسيت كلمة المرور» و«العودة لصفحة دامج» (لا يجبر المستخدم على الدخول).

## 4) أيقونتا «المرشد الذكي» و«النطق» — حجم وموضع موحَّدان
- الأيقونتان أصلاً بحجم `w-14 h-14` لكن المسافات والـ glow مختلفان فيظهران غير متطابقتَين.
- في `DamijFloatingDock.tsx`: يُثبَّت `flex flex-col items-center gap-2` (بدل `items-end gap-3`)، ويُمنح كل طفل صندوق ثابت `w-14 h-14` بمحاذاة مركز.
- يُوحَّد التصميم في `DamijSmartGuide` و`DamijHoverSpeak`:
  - زرّ دائريّ `w-14 h-14` بنفس الـ shadow وحلقة `ring-1 ring-white/50`.
  - تدرّج لون كلٍّ منهما يلتزم بـ design tokens:
    - المرشد: `from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))]`.
    - النطق: نفس التدرّج لكن معكوس، حتى يصبحان «أخوَين» بصرياً.
  - badges (النقطة الخضراء / حلقة التشغيل) تُوضع داخل نفس الـ bounding-box حتى لا تُزحزح المركز.
- الدوك يبقى `fixed bottom-24 end-4` ويتبع كل صفحات `/damij` (موجود حالياً في `DamijLayout`).
- ترتيب عمودي ثابت: **المرشد فوق، النطق تحت** (أو العكس حسب تفضيل المستخدم — افتراضياً المرشد فوق).

## 5) ملفّات ستُعدَّل
- `src/App.tsx` — توزيع `DamijAuthGuard` على الأبناء بدل اللفّ الكلّي.
- `src/components/damij/DamijHeader.tsx` — قائمة مستخدم/دخول.
- `src/pages/damij/auth/DamijAuth.tsx` — إعادة تصميم الشاشة.
- `src/components/damij/DamijFloatingDock.tsx` — توحيد المحاذاة.
- `src/components/damij/DamijSmartGuide.tsx` و`DamijHoverSpeak.tsx` — توحيد التصميم.

## ملاحظات تقنية
- لا تغييرات في قاعدة البيانات أو RLS.
- لا مساس بنمط GJU 3030 ولا بمكوّنات النسخة الأندرويد.
- جميع الألوان عبر CSS variables الحالية — لا hex مباشر.
