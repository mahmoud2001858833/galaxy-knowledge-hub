# خطة: مختبر المحاكاة السريرية الاحترافي (إصدار شامل)

بيئة محاكاة سريرية متكاملة لطلاب التربية الخاصة والبحث العلمي، تغطي خمس فئات سريرية كبرى، مع مريض ذكي حواري وسيناريوهات مكتوبة وتقارير AI شاملة قابلة للتصدير والمقارنة. كل المحرّكات تعمل عبر Gemini مع Lovable Gateway كاحتياط.

---

## 1. الفئات السريرية المغطّاة

| الفئة | البروتوكولات/الأدوات |
|---|---|
| اضطراب طيف التوحد (ASD) | M-CHAT-R/F، ADOS-2 (Modules 1-4)، CARS-2، ABA (DTT/NET)، PECS، Floortime |
| ADHD | Vanderbilt، Conners-3، SNAP-IV، CPT، تدخلات سلوكية تنفيذية |
| الإعاقة السمعية | Pure-Tone Audiogram، Speech Audiometry، AVT، قراءة الشفاه، تقييم لغة الإشارة |
| الإعاقة البصرية | Functional Vision Assessment، تقييم بريل، تدريب O&M |
| صعوبات تعلم/تأخر لغوي/شلل دماغي | DLD screen، Dyslexia (RAN/Phonological)، GMFCS، Bayley-III |

المحتوى الأولي: 60 حالة افتراضية + 40 بروتوكولاً، قابلة للتوسعة لاحقاً.

---

## 2. تدفّق الجلسة

```text
[1] اختر حالة  →  [2] اختر بروتوكول  →  [3] جلسة تفاعلية  →  [4] تقرير AI
                                              |
                                              ├─ مريض AI حواري (نص + صوت)
                                              ├─ سيناريو ثابت (خطوات + مهلات)
                                              ├─ قياسات لحظية (انتباه/قلق/تقدّم)
                                              └─ سجل أحداث Move-by-move
```

داخل الجلسة:
- مريض AI حواري بطابع شخصية الحالة، مع TTS عربي وإدخال صوتي.
- ثلاث قضبان حيّة (انتباه/قلق/تقدّم) تتغيّر حسب جودة التدخل.
- خط زمني للأحداث وتعليقات المُيسّر.
- أزرار سريرية (تعزيز إيجابي / Prompt جسدي / تعديل صعوبة / استراحة حسّية) تؤثر فعلياً على المؤشرات.

---

## 3. مكونات الواجهة

| الصفحة | المسار |
|---|---|
| Hub | `/damij/clinical` |
| مكتبة الحالات | `/damij/clinical/cases` |
| تفاصيل الحالة | `/damij/clinical/case/:id` |
| المختبر الحي | `/damij/clinical/lab/:sessionId` |
| التقرير | `/damij/clinical/report/:reportId` |
| المقارنات | `/damij/clinical/compare` |
| لوحة الطالب | `/damij/clinical/dashboard` |
| تقرير عام (مشاركة) | `/clinical/r/:token` |

---

## 4. التفاصيل التقنية

### 4.1 قاعدة البيانات (migration واحدة)
- `clinical_cases` — الاسم، العمر، الفئة، الشدة، شخصية المريض، تاريخ مرضي وملف حسّي JSONB.
- `clinical_protocols` — الفئة، خطوات JSONB، معايير، مرجع DSM-5/ICF/WHO.
- `clinical_sessions` — case_id, protocol_id, started_at, ended_at, status, metrics_snapshot.
- `clinical_session_events` — timestamp, actor, event_type, payload, attention/anxiety/progress.
- `clinical_reports` — score, diagnosis_ar, strengths, weaknesses, recommendations, references, full_text, share_token.
- RLS: المستخدم يرى جلساته/تقاريره فقط؛ الحالات والبروتوكولات قراءة عامة؛ مشاركة عبر share_token دون مصادقة.

### 4.2 Edge Functions (Gemini + احتياط Lovable Gateway)
1. `clinical-seed-content` — يولّد 60 حالة و40 بروتوكولاً مرة واحدة (idempotent).
2. `clinical-patient-turn` — كل دور حواري للمريض الذكي: يرجع رد المريض + Δ مؤشرات + ملاحظة سريرية.
3. `clinical-finalize-report` — تقرير سريري شامل عند انتهاء الجلسة.
4. `clinical-compare-sessions` — تحليل مقارن بين عدة جلسات.

### 4.3 الواجهة الأمامية
- TTS عربي عبر `useArabicSpeech` + إدخال صوتي بـ Web Speech API.
- رسوم لحظية بـ Recharts (Line/Radar/Bar).
- PDF عبر `src/lib/pdfExport.ts` للتقرير ولوحة الطالب.
- مشاركة عامة على `/clinical/r/:token`.
- فلترة الحالات بفئة/عمر/شدّة + بحث نصي.

### 4.4 الجودة
- Streaming SSE لردود المريض الحواري.
- TanStack Query للتخزين المؤقت.
- معالجة 429/402 وعرض Toast واضح.
- التحقق بـ Zod في Edge Functions.

---

## 5. ما سيتم إنشاؤه/تعديله

جديد:
- `supabase/migrations/<ts>_clinical_lab.sql`
- `supabase/functions/clinical-seed-content/index.ts`
- `supabase/functions/clinical-patient-turn/index.ts`
- `supabase/functions/clinical-finalize-report/index.ts`
- `supabase/functions/clinical-compare-sessions/index.ts`
- `src/pages/damij/clinical/ClinicalCaseDetail.tsx`
- `src/pages/damij/clinical/ClinicalLabSession.tsx`
- `src/pages/damij/clinical/ClinicalReport.tsx`
- `src/pages/damij/clinical/ClinicalCompare.tsx`
- `src/pages/damij/clinical/ClinicalDashboard.tsx`
- `src/pages/damij/clinical/ClinicalPublicReport.tsx`
- `src/features/clinical/` (types, scoring, hooks: useLiveMetrics, usePatientChat, useSessionEvents)

تحديث:
- `ClinicalHome.tsx` و`ClinicalCases.tsx` و`ClinicalLab.tsx` و`ClinicalReports.tsx`
- `src/App.tsx` (المسارات الجديدة)

---

## 6. تقدير الاستهلاك

العمل الكثيف (60 حالة + 40 بروتوكولاً + 4 Edge Functions + 7 صفحات + DB + نظام حواري حي + PDF + مقارنات) يستهلك ~100 Credits كما طلبت، والنتيجة مختبر سريري متكامل جاهز للاستخدام البحثي.

---

## 7. المتطلبات
- `GEMINI_API_KEY` متوفر بالفعل، لا حاجة لمفاتيح جديدة.

اضغط "Implement plan" لبدء التنفيذ.
