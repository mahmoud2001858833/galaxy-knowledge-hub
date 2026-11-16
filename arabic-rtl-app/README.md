# مشروع React + Vite + Tailwind CSS باتجاه RTL وخط عربي

مشروع نموذجي كامل وسريع مُعد مسبقاً للعمل من اليمين إلى اليسار (RTL) مع خط **Cairo** العربي ودعم **Tailwind CSS**.

---

## 🚀 المميزات الرئيسية

1. **اتجاه RTL تلقائي**: تم ضبط `dir="rtl"` و `lang="ar"` على مستوى وسم `<html>` في `index.html`.
2. **خطوط عربية احترافية**: تضمين خط **Cairo** و **Tajawal** من Google Fonts مع تحسين سرعة التحميل عبر `preconnect`.
3. **Tailwind CSS مهيأ للاتجاه العربي**: يدعم الخصائص المنطقية الحديثة (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).
4. **أيقونات Lucide React**: أيقونات عصرية تدعم الانعكاس والاتجاه العربي.
5. **مكونات تفاعلية جاهزة**: ترويسة، شريط بحث مخصص لـ RTL، بطاقات إحصائيات، وقائمة مهام تفاعلية.

---

## 🛠️ كيفية التشغيل

### 1. الدخول إلى مجلد المشروع
```bash
cd arabic-rtl-app
```

### 2. تثبيت التبعيات (Dependencies)
```bash
npm install
```

### 3. تشغيل خادم التطوير (Dev Server)
```bash
npm run dev
```
افتح الرابط في المتصفح: `http://localhost:3000`

### 4. بناء المشروع للإنتاج (Production Build)
```bash
npm run build
```

---

## 💡 نصائح هامة للتعامل مع RTL في Tailwind CSS

- **الهوامش المنطقية**: استخدم `ms-*` (Margin-Inline-Start) و `me-*` (Margin-Inline-End) بدلاً من `ml-*` و `mr-*`.
- **الحواشي المنطقية**: استخدم `ps-*` (Padding-Inline-Start) و `pe-*` (Padding-Inline-End) بدلاً من `pl-*` و `pr-*`.
- **المحاذاة المطلقة**: استخدم `start-*` و `end-*` بدلاً من `left-*` و `right-*`.
- **محاذاة النصوص**: استخدم `text-start` أو `text-end` لمحاذاة تتأقلم تلقائياً مع اتجاه الصفحة.
