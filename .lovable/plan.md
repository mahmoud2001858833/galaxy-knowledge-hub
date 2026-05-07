## تثبيت شريط التنقل السفلي بشكل دائم

شريط التنقل في `DamijFloatingNav.tsx` مُعرَّف حالياً بـ `fixed bottom-0`، لكنه يتأثر أحياناً بسياق التمرير أو بعناصر أب فيها `transform`/`overflow`، مما يجعله يبدو وكأنه يتحرك مع الصفحة.

### التغييرات

**1. `src/components/damij/DamijFloatingNav.tsx`**
- التأكد من `position: fixed` بقيم صريحة عبر `style` (يتجاوز أي تعارض من Tailwind/الـ parent).
- إضافة `will-change: transform` و `transform: translateZ(0)` لإنشاء طبقة مستقلة تمنع التأثر بسياق تمرير الأب.
- رفع `z-index` إلى `100` لضمان البقاء فوق كل المحتوى.
- إضافة `pointer-events-auto` للتأكد من التفاعل.

**2. `src/pages/damij/DamijLayout.tsx`**
- إزالة أي `transform` أو `overflow-hidden` من الحاوية الجذرية (إن وجد) لأن هذه الخصائص تكسر `position: fixed` للأبناء.
- التأكد من `pb-32` كافٍ لئلا يغطي الشريط آخر المحتوى.

### تفاصيل تقنية

السبب الجذري المحتمل: عنصر أب يستخدم `transform` أو `filter` يُنشئ "containing block" جديداً يجعل `fixed` يتصرف كـ `absolute` نسبةً لذلك العنصر بدلاً من viewport. الحل هو تنظيف هذه الخصائص من الحاويات الأب أو نقل الـ nav لخارج شجرة الحاوية المسببة (Portal إلى `document.body`) كحل احتياطي.

إن لم تكفِ التعديلات أعلاه، الخطوة التالية: تغليف الـ nav بـ `createPortal(..., document.body)`.
