
-- 1) Add current_medications to clinical_cases
ALTER TABLE public.clinical_cases
  ADD COLUMN IF NOT EXISTS current_medications text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Backfill defaults by category
UPDATE public.clinical_cases SET current_medications = ARRAY['أسبرين 81mg يوميًا','أتورفاستاتين 20mg ليلًا','ميتوبرولول 50mg مرتين'] WHERE category='cardiology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['إيبوبروفين 400mg عند الألم','باراسيتامول 1g كل 8 ساعات','كالسيوم + فيتامين D'] WHERE category='orthopedics' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['سالبوتامول إنهالر عند الحاجة','بوديزونيد إنهالر يومي'] WHERE category='pulmonology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['فوروسيميد 40mg صباحًا','أملوديبين 5mg'] WHERE category='nephrology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['ميتفورمين 850mg مرتين','إنسولين Glargine 20U ليلًا'] WHERE category='endocrinology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['ليفيتيراسيتام 500mg مرتين'] WHERE category='neurology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['أوميبرازول 20mg صباحًا'] WHERE category='gastro' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['كريم هيدروكورتيزون 1%'] WHERE category='dermatology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['سيرترالين 50mg صباحًا'] WHERE category='psychiatry' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['قطرات مضاد حيوي للعين'] WHERE category='ophthalmology' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['أموكسيسيلين 500mg ثلاث مرات'] WHERE category='ent' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['حمض الفوليك 5mg','حديد 65mg'] WHERE category='obgyn' AND cardinality(current_medications)=0;
UPDATE public.clinical_cases SET current_medications = ARRAY['باراسيتامول شراب 250mg/5ml'] WHERE category='pediatrics' AND cardinality(current_medications)=0;

-- 2) Seed clinical_devices (idempotent via ON CONFLICT key)
CREATE UNIQUE INDEX IF NOT EXISTS clinical_devices_key_uniq ON public.clinical_devices(key);

INSERT INTO public.clinical_devices (key, name_ar, name_en, category, ui_kind, applicable_specialties, default_params, description_ar, safety_ar, icon)
VALUES
  ('ecg_12lead','جهاز تخطيط القلب 12-قطب','12-Lead ECG','cardiology','interactive_ecg', ARRAY['cardiology','emergency','internal'], '{"leads":"12","speed_mm_s":"25"}'::jsonb,'تسجيل النشاط الكهربائي للقلب من 12 قطبًا.', ARRAY['تنظيف الجلد','تثبيت الأقطاب جيدًا'], '📈'),
  ('aed','مزيل الرجفان الآلي AED','Automated External Defibrillator','cardiology','interactive_aed', ARRAY['cardiology','emergency'], '{"energy_j":"200"}'::jsonb,'صدمة كهربائية لاستعادة إيقاع القلب.', ARRAY['ابتعد عن المريض قبل الصدمة','جفّف الصدر'], '⚡'),
  ('stethoscope','السمّاعة الإلكترونية','Electronic Stethoscope','cardiology','interactive_stetho', ARRAY['cardiology','pulmonology','pediatrics','internal'], '{"site":"apex"}'::jsonb,'سماع أصوات القلب والرئة بدقة.', ARRAY['تنظيف الزيتونتين'], '🩺'),
  ('holter','جهاز هولتر 24 ساعة','Holter Monitor','cardiology','generic', ARRAY['cardiology'], '{"duration_h":"24"}'::jsonb,'تسجيل مستمر لإيقاع القلب لمدة 24-48 ساعة.', ARRAY['تجنّب البلل'], '⏱️'),
  ('echo','جهاز الإيكو القلبي','Echocardiogram','cardiology','generic', ARRAY['cardiology'], '{"mode":"2D","probe":"phased_array"}'::jsonb,'تصوير القلب بالموجات فوق الصوتية لتقييم الصمامات والكسر القذفي.', ARRAY['استخدم جل ناقل'], '🫀'),
  ('bp_monitor','جهاز قياس ضغط الدم','Blood Pressure Monitor','cardiology','generic', ARRAY['cardiology','internal','emergency','obgyn'], '{"cuff_size":"adult"}'::jsonb,'قياس الضغط الانقباضي والانبساطي.', ARRAY['ذراع مرتاحة بمستوى القلب'], '🩸'),
  ('pulse_ox','مقياس الأكسجين','Pulse Oximeter','pulmonology','generic', ARRAY['pulmonology','cardiology','emergency','pediatrics'], '{"site":"finger"}'::jsonb,'قياس تشبع الأكسجين ومعدل النبض.', ARRAY['أزل طلاء الأظافر'], '🫁'),
  ('troponin','اختبار التروبونين السريع','Cardiac Troponin Rapid','cardiology','generic', ARRAY['cardiology','emergency'], '{"sample":"blood"}'::jsonb,'كشف إنزيم القلب لتشخيص الاحتشاء.', ARRAY['تعقيم موقع السحب'], '🧪'),
  ('xray','جهاز الأشعة السينية','X-Ray','orthopedics','generic', ARRAY['orthopedics','pulmonology','emergency'], '{"region":"chest","kvp":"80"}'::jsonb,'تصوير العظام والصدر بالأشعة.', ARRAY['درع الرصاص للحماية'], '🦴'),
  ('mri','جهاز الرنين المغناطيسي MRI','MRI Scanner','orthopedics','generic', ARRAY['orthopedics','neurology'], '{"sequence":"T1","region":"knee"}'::jsonb,'تصوير الأنسجة الرخوة والمفاصل.', ARRAY['ممنوع المعادن داخل الغرفة'], '🧲'),
  ('ct','جهاز التصوير المقطعي CT','CT Scanner','orthopedics','generic', ARRAY['orthopedics','neurology','emergency','pulmonology'], '{"region":"head","contrast":"no"}'::jsonb,'مقاطع تصويرية تفصيلية للأنسجة والعظام.', ARRAY['تأكيد عدم الحمل'], '🌀'),
  ('goniometer','مقياس مدى الحركة','Goniometer','orthopedics','generic', ARRAY['orthopedics'], '{"joint":"knee"}'::jsonb,'قياس زوايا حركة المفاصل بالدرجات.', ARRAY['عدم إجبار المفصل'], '📐'),
  ('us_msk','الموجات فوق الصوتية للعضلات','MSK Ultrasound','orthopedics','generic', ARRAY['orthopedics'], '{"probe":"linear"}'::jsonb,'تقييم الأوتار والعضلات والإصابات الرياضية.', ARRAY['جل فقط'], '🎯'),
  ('spirometer','مقياس التنفس','Spirometer','pulmonology','generic', ARRAY['pulmonology'], '{"trials":"3"}'::jsonb,'قياس FEV1 و FVC لتقييم وظائف الرئة.', ARRAY['مَلقم لكل مريض'], '💨'),
  ('nebulizer','جهاز الاستنشاق','Nebulizer','pulmonology','generic', ARRAY['pulmonology','pediatrics','emergency'], '{"drug":"salbutamol","ml":"3"}'::jsonb,'إيصال الدواء على شكل رذاذ للرئتين.', ARRAY['تنظيف القناع بعد الاستخدام'], '🌫️'),
  ('capnograph','جهاز قياس CO₂ الزفير','Capnograph','pulmonology','generic', ARRAY['pulmonology','emergency'], '{"sampling":"sidestream"}'::jsonb,'قياس ثاني أكسيد الكربون في الزفير.', ARRAY['عيّر الجهاز قبل الاستخدام'], '🌬️'),
  ('o2_concentrator','مكثف الأكسجين','Oxygen Concentrator','pulmonology','generic', ARRAY['pulmonology','emergency'], '{"flow_lpm":"2"}'::jsonb,'إمداد الأكسجين النقي للمريض عبر قنية أنفية.', ARRAY['ابتعد عن مصادر اللهب'], '🟢'),
  ('peak_flow','مقياس التدفق الأقصى','Peak Flow Meter','pulmonology','generic', ARRAY['pulmonology'], '{"trials":"3"}'::jsonb,'قياس أقصى تدفق زفير لمتابعة الربو.', ARRAY['وضعية وقوف'], '💨'),
  ('eeg','جهاز رسم المخ EEG','EEG','neurology','generic', ARRAY['neurology','psychiatry'], '{"channels":"16"}'::jsonb,'تسجيل النشاط الكهربائي للدماغ.', ARRAY['غسل الشعر مسبقًا'], '🧠'),
  ('glucometer','جهاز قياس السكر','Glucometer','endocrinology','generic', ARRAY['endocrinology','internal','emergency'], '{"sample":"capillary"}'::jsonb,'قياس سكر الدم بقطرة من الإصبع.', ARRAY['شريط لكل قياس'], '💉'),
  ('otoscope','منظار الأذن','Otoscope','ent','generic', ARRAY['ent','pediatrics'], '{"speculum":"adult"}'::jsonb,'فحص قناة الأذن وطبلة الأذن.', ARRAY['رؤوس مُعقّمة'], '👂'),
  ('ophthalmoscope','منظار العين','Ophthalmoscope','ophthalmology','generic', ARRAY['ophthalmology','neurology'], '{"aperture":"small"}'::jsonb,'فحص قاع العين والعصب البصري.', ARRAY['إضاءة منخفضة'], '👁️'),
  ('reflex_hammer','مطرقة المنعكسات','Reflex Hammer','neurology','generic', ARRAY['neurology','orthopedics'], '{"site":"patellar"}'::jsonb,'اختبار المنعكسات العصبية الوترية.', ARRAY['ضربة لطيفة'], '🔨'),
  ('tuning_fork','شوكة رنانة','Tuning Fork','neurology','generic', ARRAY['neurology','ent'], '{"hz":"512"}'::jsonb,'فحوصات السمع (Rinne/Weber) والاهتزاز.', ARRAY['تطهير قبل الاستخدام'], '🎵'),
  ('ir_thermo','ميزان حرارة بالأشعة تحت الحمراء','IR Thermometer','pediatrics','generic', ARRAY['pediatrics','emergency','internal'], '{"site":"forehead"}'::jsonb,'قياس الحرارة عن بُعد بدون تلامس.', ARRAY['تنظيف الجبهة'], '🌡️'),
  ('vascular_doppler','جهاز دوبلر وعائي','Vascular Doppler','cardiology','generic', ARRAY['cardiology','internal','emergency'], '{"hz":"8MHz"}'::jsonb,'تقييم تدفق الدم في الشرايين والأوردة.', ARRAY['جل ناقل'], '🌊'),
  ('gcs','مقياس غلاسكو للوعي','Glasgow Coma Scale','emergency','generic', ARRAY['emergency','neurology'], '{}'::jsonb,'تقييم مستوى الوعي (3-15).', ARRAY['تكرار التقييم'], '🧮'),
  ('urine_strip','شريط فحص البول','Urine Dipstick','nephrology','generic', ARRAY['nephrology','internal','obgyn','endocrinology'], '{"params":"10"}'::jsonb,'كشف البروتين والسكر والدم في البول.', ARRAY['عينة طازجة'], '🧫')
ON CONFLICT (key) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  category=EXCLUDED.category,
  ui_kind=EXCLUDED.ui_kind,
  applicable_specialties=EXCLUDED.applicable_specialties,
  default_params=EXCLUDED.default_params,
  description_ar=EXCLUDED.description_ar,
  safety_ar=EXCLUDED.safety_ar,
  icon=EXCLUDED.icon;
