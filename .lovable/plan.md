
## الهدف
إضافة خيار جديد ضمن أدوات الذكاء الاصطناعي في صفحة `/gju-competition` (مستقبل التكنولوجيا) باسم **"الدفع بالوجه - FacePay AI"**، يشبه تجربة بنكية مصغّرة مع متجر إلكتروني والدفع بالتعرف على الوجه + كلمة سر بإيماءة (ابتسامة / 3 رمشات).

---

## التدفق (User Flow)

1. **إنشاء حساب بنكي**: اسم الحساب + الرصيد الابتدائي (المبلغ المرفوع على اللينك).
2. **تسجيل الوجه**: مسح احترافي لملامح الوجه عبر الكاميرا مع تأثير سكان شعاعي وشبكة نقاط (FaceLandmarker من MediaPipe — موجود مسبقاً في المشروع لميزة لغة الإشارة).
3. **اختيار كلمة السر بالإيماءة**: 
   - ☺️ ابتسامة، أو 
   - 👁️ ثلاث رمشات متتالية.
4. **حفظ الحساب** (محلياً في `localStorage` — لا يحتاج باكند).
5. **المتجر**: 24+ منتج مع صور (Unsplash) وفئات وأسعار.
6. **الشراء**: زر "ادفع بالوجه" → كاميرا تتعرف على الوجه → تعرض اسم الحساب → تطلب الإيماءة (السر) → تأكيد بإيماءة ثانية → خصم الرصيد → فاتورة نجاح.

---

## الملفات المُنشأة

### 1. `src/pages/FacePayAI.tsx` (الصفحة الرئيسية)
- لوحة قيادة بتصميم مستقبلي (Glassmorphism + Neon) متناغم مع هوية GJU 3030.
- تبويبات: **حسابي / المتجر / السجل**.
- إذا لا يوجد حساب → يعرض زر كبير "إنشاء حساب بنكي".

### 2. `src/components/facepay/CreateAccountWizard.tsx`
معالج 4 خطوات:
- Step 1: اسم الحساب + الرصيد الابتدائي.
- Step 2: مسح الوجه (FaceScanner).
- Step 3: اختيار نوع كلمة السر بالإيماءة (ابتسامة / 3 رمشات).
- Step 4: تسجيل الإيماءة + تأكيد.

### 3. `src/components/facepay/FaceScanner.tsx`
- يستخدم `@mediapipe/tasks-vision` (المثبت سابقاً) — `FaceLandmarker` بنموذج `face_landmarker.task`.
- Overlay احترافي: شبكة 468 نقطة + خط مسح متحرك + حلقات نبض + مؤشر تقدم.
- يحسب **face embedding مبسط** = متجه من 30 مسافة معيارية بين landmarks (مقاومة للحجم/الميل) → يُحفظ بالـ localStorage.
- التحقق: cosine similarity > 0.92.

### 4. `src/components/facepay/GestureCapture.tsx`
- **ابتسامة**: نسبة عرض الفم (landmarks 61, 291) إلى المسافة بين العينين > حد معين.
- **رمش**: EAR (Eye Aspect Ratio) باستخدام landmarks الجفون — كشف 3 رمشات متتالية خلال 4 ثوانٍ.

### 5. `src/components/facepay/Store.tsx`
- شبكة 24 منتج بفئات (إلكترونيات، ملابس، طعام، كتب، ألعاب، عطور...) مع صور Unsplash وأسعار بالدينار.
- زر "ادفع بالوجه 👤" على كل منتج.

### 6. `src/components/facepay/FacePayCheckout.tsx`
- Modal بثلاث مراحل:
  1. **التعرف على الوجه** → يعرض "مرحباً، {اسم_الحساب}".
  2. **أدخل كلمة السر** (الإيماءة المسجلة).
  3. **تأكيد** (نفس الإيماءة مرة ثانية).
- عند النجاح: animation + خصم الرصيد + إضافة للسجل.

### 7. `src/lib/facepay/storage.ts`
إدارة `localStorage` تحت مفتاح `facepay_account_v1`:
```ts
{ name, balance, faceEmbedding: number[], passwordType: 'smile'|'blinks', history: Tx[] }
```

### 8. `src/lib/facepay/faceUtils.ts`
- `extractEmbedding(landmarks)` — متجه ثابت الطول.
- `cosineSimilarity(a, b)`.
- `detectSmile(landmarks)`, `getEAR(landmarks)`.

---

## التعديلات

### `src/pages/GJUCompetition.tsx`
إضافة عنصر جديد في `aiTools` (السطر 31-38):
```ts
{ title: '💳 الدفع بالوجه - FacePay AI', description: 'تجربة بنكية متكاملة: أنشئ حساباً، سجّل وجهك، اختر كلمة سر بإيماءة، وادفع من المتجر بمسح وجهك فقط', icon: ScanFace, gradient: 'from-emerald-500 via-cyan-500 to-violet-600', link: '/face-pay' }
```

### `src/App.tsx`
إضافة المسار:
```tsx
<Route path="/face-pay" element={<FacePayAI />} />
```

---

## التفاصيل التقنية

- **مكتبة الوجه**: `@mediapipe/tasks-vision` — موجودة مسبقاً (تُستخدم في `src/features/sign-language/`). نستخدم `FaceLandmarker` بدل `HandLandmarker`.
- **النموذج**: يُحمَّل من CDN `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`.
- **التخزين**: `localStorage` فقط — لا حاجة لباكند أو Supabase.
- **الأمان**: تجريبي/تعليمي (ضمن إطار GJU 3030 العرضي) — لا يُستخدم لمدفوعات حقيقية. يُعرض تنبيه في الصفحة.
- **التصميم**: متناغم مع تصميم `GJUCompetition` الداكن (gradients violet/cyan/emerald + glassmorphism + animations).
- **RTL**: كامل بالعربية.
- **Responsive**: يعمل على viewport 771px وما فوق.

---

## ملاحظات مهمة

- لن نُنشئ أي جداول في Supabase — كل شيء client-side.
- لن نلمس عزل منصة GJU 3030 (نحترم القيد المحفوظ في الذاكرة).
- سيظهر بانر "تجربة تعليمية — ليس نظام دفع حقيقي" بشكل واضح.
