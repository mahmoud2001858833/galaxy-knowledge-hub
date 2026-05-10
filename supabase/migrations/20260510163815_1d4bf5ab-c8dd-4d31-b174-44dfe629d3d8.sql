
INSERT INTO public.clinical_interventions_catalog (category, condition_keys, name_ar, name_en, short_ar, default_params, mechanism_ar, contraindications_ar, references_ar, evidence_level)
VALUES
-- ============ CARDIOLOGY ============
('medication', ARRAY['cardiology','emergency'], 'أسبرين Aspirin 325mg', 'Aspirin', 'مضاد صفائح في الذبحة والاحتشاء الحاد', '{"dose":"325mg","route":"مضغ فموي","frequency":"جرعة محمّلة"}'::jsonb, 'تثبيط COX-1 يمنع تكدّس الصفائح', ARRAY['نزيف نشط','حساسية للأسبرين','قرحة هضمية'], ARRAY['ACC/AHA STEMI 2024'], 'A'),
('medication', ARRAY['cardiology'], 'كلوبيدوغرل Clopidogrel 75mg', 'Clopidogrel', 'مضاد صفائح ثنائي مع الأسبرين', '{"dose":"75mg","frequency":"يوميًا"}'::jsonb, 'حصار P2Y12 على الصفائح', ARRAY['نزيف نشط','اضطراب تخثر'], ARRAY['ESC 2023'], 'A'),
('medication', ARRAY['cardiology'], 'أتورفاستاتين Atorvastatin 40mg', 'Atorvastatin', 'خفض LDL والوقاية الثانوية', '{"dose":"40mg","frequency":"ليلًا"}'::jsonb, 'تثبيط HMG-CoA reductase', ARRAY['أمراض كبد نشطة','حمل'], ARRAY['NICE CG181'], 'A'),
('medication', ARRAY['cardiology','internal'], 'ميتوبرولول Metoprolol 50mg', 'Metoprolol', 'حاصر بيتا لخفض الضغط ومعدل القلب', '{"dose":"50mg","frequency":"مرتين"}'::jsonb, 'حصر مستقبلات β1', ARRAY['ربو شديد','بطء قلب','حصار من الدرجة الثانية+'], ARRAY['ACC/AHA HF 2022'], 'A'),
('medication', ARRAY['cardiology','emergency'], 'نتروغليسرين Nitroglycerin SL', 'Nitroglycerin', 'موسع وعائي تحت اللسان للذبحة', '{"dose":"0.4mg","route":"تحت اللسان","frequency":"كل 5 دقائق ×3"}'::jsonb, 'موسع وريدي يقلّل الحمل القبلي', ARRAY['استخدام Sildenafil خلال 24 ساعة','ضغط < 90'], ARRAY['ACC 2024'], 'A'),
('medication', ARRAY['cardiology'], 'فوروسيميد Furosemide 40mg', 'Furosemide', 'مدر بول قوي لاحتقان فشل القلب', '{"dose":"40mg","route":"وريدي/فموي","frequency":"حسب الحاجة"}'::jsonb, 'تثبيط Na/K/2Cl في عروة هنلي', ARRAY['نقص بوتاسيوم شديد','جفاف'], ARRAY['ESC HF 2023'], 'A'),
('behavioral', ARRAY['cardiology'], 'تأهيل قلبي بالمشي المتدرّج', 'Cardiac Rehab', 'برنامج تمارين تحت إشراف لتحسين سعة القلب', '{"intensity":"40-70% HRmax","duration":"30 دقيقة","frequency":"3 مرات/أسبوع"}'::jsonb, 'تحسين السعة الهوائية وكفاءة القلب', ARRAY['ذبحة غير مستقرة','احتشاء حاد < 48 ساعة'], ARRAY['AACVPR 2023'], 'A'),
('educational', ARRAY['cardiology'], 'تثقيف نظام DASH الغذائي', 'DASH Diet Education', 'حمية لخفض الضغط: فواكه/خضار/قليل صوديوم', '{"sodium_max":"2g/day"}'::jsonb, 'خفض ضغط الدم وتقليل LDL', ARRAY[]::text[], ARRAY['NHLBI DASH'], 'A'),

-- ============ ORTHOPEDICS ============
('medication', ARRAY['orthopedics'], 'إيبوبروفين Ibuprofen 400mg', 'Ibuprofen', 'مضاد التهاب لا ستيرويدي للألم', '{"dose":"400mg","frequency":"كل 8 ساعات"}'::jsonb, 'تثبيط COX 1و2', ARRAY['قرحة هضمية','قصور كلوي','حمل ثلث ثالث'], ARRAY['Cochrane 2022'], 'A'),
('medication', ARRAY['orthopedics','pediatrics'], 'باراسيتامول Paracetamol 1g', 'Paracetamol', 'مسكن وخافض حرارة آمن', '{"dose":"1g","frequency":"كل 6 ساعات","max":"4g/day"}'::jsonb, 'تثبيط مركزي لـ COX', ARRAY['قصور كبدي شديد'], ARRAY['BNF 2024'], 'A'),
('medication', ARRAY['orthopedics'], 'ديكلوفيناك Diclofenac 75mg IM', 'Diclofenac', 'حقنة مضاد التهاب لألم حاد', '{"dose":"75mg","route":"عضلي"}'::jsonb, 'تثبيط COX', ARRAY['قصور كلوي','قرحة'], ARRAY['NICE 2023'], 'A'),
('medication', ARRAY['orthopedics'], 'باكلوفين Baclofen 10mg', 'Baclofen', 'مرخي عضلات للتشنج', '{"dose":"10mg","frequency":"3 مرات"}'::jsonb, 'منبّه GABA-B', ARRAY['صرع غير مضبوط'], ARRAY['Cochrane 2023'], 'B'),
('behavioral', ARRAY['orthopedics'], 'علاج طبيعي بتمارين تقوية', 'Strengthening PT', 'تمارين متدرّجة لاستعادة الوظيفة', '{"sets":"3","reps":"10-15","sessions":"3/أسبوع"}'::jsonb, 'تضخم عضلي وتحسين المدى', ARRAY['كسر حديث غير مثبت'], ARRAY['APTA Guidelines'], 'A'),
('educational', ARRAY['orthopedics'], 'تثبيت بجبيرة وتعليمات RICE', 'RICE Protocol', 'راحة/ثلج/ضغط/رفع لإصابة حادة', '{"ice":"15 دقيقة كل ساعتين","duration":"48 ساعة"}'::jsonb, 'تقليل الالتهاب والوذمة', ARRAY[]::text[], ARRAY['ACSM 2023'], 'A'),
('sensory', ARRAY['orthopedics'], 'تحفيز كهربائي عبر الجلد TENS', 'TENS', 'تخفيف الألم بتيار كهربائي خفيف', '{"frequency":"80-100Hz","duration":"30 دقيقة"}'::jsonb, 'بوّابة الألم وإفراز إندورفين', ARRAY['ناظمة قلبية','جلد متضرر'], ARRAY['Cochrane 2024'], 'B'),

-- ============ PULMONOLOGY ============
('medication', ARRAY['pulmonology','emergency'], 'سالبوتامول Salbutamol Inhaler', 'Salbutamol', 'موسع شعب لنوبة الربو', '{"puffs":"2-4","frequency":"كل 20 دقيقة x3"}'::jsonb, 'منبّه β2', ARRAY['تسرع قلب شديد'], ARRAY['GINA 2024'], 'A'),
('medication', ARRAY['pulmonology'], 'بوديزونيد Budesonide Inhaler', 'Budesonide', 'كورتيكوستيرويد استنشاقي وقائي', '{"dose":"400mcg","frequency":"مرتين يوميًا"}'::jsonb, 'مضاد التهاب موضعي', ARRAY['عدوى تنفسية فطرية'], ARRAY['GINA 2024'], 'A'),
('medication', ARRAY['pulmonology'], 'إبراتروبيوم Ipratropium', 'Ipratropium', 'مضاد كولين للانسداد المزمن', '{"dose":"500mcg","frequency":"كل 6 ساعات"}'::jsonb, 'حصر M3', ARRAY['زرق ضيق الزاوية'], ARRAY['GOLD 2024'], 'A'),
('behavioral', ARRAY['pulmonology'], 'تمارين تنفس بالشفة المزمومة', 'Pursed-Lip Breathing', 'تقنية لتحسين التهوية والتقاط CO2', '{"duration":"5-10 دقيقة","frequency":"3 مرات/يوم"}'::jsonb, 'إطالة الزفير وتقليل انهيار الشعب', ARRAY[]::text[], ARRAY['ATS Guidelines'], 'A'),
('sensory', ARRAY['pulmonology','emergency'], 'أكسجين عبر قنية أنفية', 'Nasal Oxygen', 'أكسجين تكميلي 2-4 لتر/دقيقة', '{"flow":"2-4 LPM","target_spo2":"94-98%"}'::jsonb, 'رفع تشبع الأكسجين', ARRAY['ابتعد عن اللهب'], ARRAY['BTS 2023'], 'A'),

-- ============ NEUROLOGY ============
('medication', ARRAY['neurology'], 'ليفيتيراسيتام Levetiracetam 500mg', 'Levetiracetam', 'مضاد صرع واسع الطيف', '{"dose":"500mg","frequency":"مرتين"}'::jsonb, 'يربط SV2A', ARRAY['اكتئاب شديد','حساسية'], ARRAY['ILAE 2023'], 'A'),
('medication', ARRAY['neurology','emergency'], 'فينيتوين Phenytoin Loading', 'Phenytoin', 'تحميل وريدي للحالة الصرعية', '{"dose":"15-20 mg/kg","route":"IV ببطء"}'::jsonb, 'حصار قنوات Na', ARRAY['حصار قلبي','بطء قلب شديد'], ARRAY['NEJM 2022'], 'A'),
('medication', ARRAY['neurology'], 'سوماتريبتان Sumatriptan 50mg', 'Sumatriptan', 'مضاد شقيقة حاد', '{"dose":"50mg","frequency":"عند بدء النوبة"}'::jsonb, 'منبّه 5HT-1B/1D', ARRAY['ذبحة','ضغط غير مضبوط'], ARRAY['AHS 2023'], 'A'),
('behavioral', ARRAY['neurology'], 'إعادة تأهيل عصبي حركي', 'Neuro Rehab', 'برنامج متعدد لاستعادة الوظائف بعد سكتة', '{"sessions":"5/أسبوع","duration":"45 دقيقة"}'::jsonb, 'مرونة دماغية وإعادة تشكيل عصبي', ARRAY[]::text[], ARRAY['AAN 2023'], 'A'),

-- ============ ENDOCRINOLOGY ============
('medication', ARRAY['endocrinology'], 'إنسولين Glargine 20U ليلًا', 'Insulin Glargine', 'إنسولين قاعدي طويل المفعول', '{"dose":"20U","frequency":"ليلًا"}'::jsonb, 'تنشيط مستقبل الإنسولين', ARRAY['نقص سكر شديد'], ARRAY['ADA 2024'], 'A'),
('medication', ARRAY['endocrinology'], 'ميتفورمين Metformin 850mg', 'Metformin', 'الخط الأول للسكري النمط 2', '{"dose":"850mg","frequency":"مرتين مع الطعام"}'::jsonb, 'يقلل إنتاج الكبد للجلوكوز', ARRAY['eGFR<30','حماض لبني'], ARRAY['ADA 2024'], 'A'),
('medication', ARRAY['endocrinology'], 'غليكلازيد Gliclazide 80mg', 'Gliclazide', 'سلفونيل يوريا لتحفيز الإنسولين', '{"dose":"80mg","frequency":"يوميًا"}'::jsonb, 'إغلاق قنوات K-ATP في βcell', ARRAY['نقص سكر متكرر'], ARRAY['EASD 2023'], 'B'),
('educational', ARRAY['endocrinology'], 'تعليم العدّ الكربوهيدراتي', 'Carb Counting', 'حساب الكربوهيدرات لجرعة الإنسولين', '{"ratio":"1U:10g","correction":"1U:50mg/dL"}'::jsonb, 'ضبط حقن الإنسولين البلعية', ARRAY[]::text[], ARRAY['ADA 2024'], 'A'),

-- ============ NEPHROLOGY ============
('medication', ARRAY['nephrology'], 'فوروسيميد Furosemide 40mg', 'Furosemide', 'مدر بول لمتلازمة الكلوية والوذمة', '{"dose":"40mg","frequency":"يوميًا"}'::jsonb, 'تثبيط Na/K/2Cl', ARRAY['نقص بوتاسيوم'], ARRAY['KDIGO 2023'], 'A'),
('medication', ARRAY['nephrology'], 'إيبليرينون Eplerenone 25mg', 'Eplerenone', 'مضاد ألدوستيرون لحماية الكلى', '{"dose":"25mg","frequency":"يوميًا"}'::jsonb, 'حصر مستقبل المعدنية', ARRAY['فرط بوتاسيوم'], ARRAY['KDIGO 2023'], 'B'),
('educational', ARRAY['nephrology'], 'حمية منخفضة البروتين والصوديوم', 'Renal Diet', 'حمية لإبطاء تقدم الفشل الكلوي', '{"protein":"0.8 g/kg","sodium":"2g"}'::jsonb, 'تقليل عبء الكلى', ARRAY[]::text[], ARRAY['NKF 2023'], 'B'),

-- ============ GASTRO ============
('medication', ARRAY['gastro'], 'أوميبرازول Omeprazole 20mg', 'Omeprazole', 'مثبط مضخة البروتون للقرحة والارتجاع', '{"dose":"20mg","frequency":"صباحًا"}'::jsonb, 'تثبيط H+/K+ ATPase', ARRAY['حساسية'], ARRAY['ACG 2023'], 'A'),
('medication', ARRAY['gastro'], 'أوندانسيترون Ondansetron 4mg', 'Ondansetron', 'مضاد قيء قوي', '{"dose":"4mg","route":"وريدي/فموي","frequency":"كل 8 ساعات"}'::jsonb, 'حصر 5HT3', ARRAY['QT طويل'], ARRAY['NICE 2023'], 'A'),
('medication', ARRAY['gastro'], 'لوبيراميد Loperamide 4mg', 'Loperamide', 'مضاد إسهال', '{"dose":"4mg","frequency":"ثم 2mg لكل براز رخو"}'::jsonb, 'منبّه μ معوي', ARRAY['التهاب قولون مغشي','حمى'], ARRAY['BNF 2024'], 'B'),

-- ============ EMERGENCY ============
('medication', ARRAY['emergency'], 'إبينفرين Epinephrine 1mg IV', 'Epinephrine', 'إنعاش قلبي رئوي ARRest', '{"dose":"1mg","route":"IV","frequency":"كل 3-5 دقائق"}'::jsonb, 'منبّه α/β', ARRAY[]::text[], ARRAY['ACLS 2024'], 'A'),
('medication', ARRAY['emergency'], 'أميودارون Amiodarone 300mg', 'Amiodarone', 'لـ VF/VT بعد 3 صدمات', '{"dose":"300mg","route":"IV bolus"}'::jsonb, 'حصار قنوات K', ARRAY['حصار قلبي','اعتلال درقية'], ARRAY['ACLS 2024'], 'A'),
('medication', ARRAY['emergency'], 'ناركان Naloxone 0.4mg IV', 'Naloxone', 'عكس جرعة المخدرات الزائدة', '{"dose":"0.4mg","route":"IV/IM/IN"}'::jsonb, 'حاصر مستقبلات المخدر', ARRAY[]::text[], ARRAY['SAMHSA 2024'], 'A'),
('behavioral', ARRAY['emergency'], 'CPR عالي الجودة', 'High-Quality CPR', 'ضغطات صدر 100-120/دقيقة بعمق 5-6 سم', '{"rate":"100-120/min","depth":"5-6cm","ratio":"30:2"}'::jsonb, 'إعادة دوران دموي قسري', ARRAY[]::text[], ARRAY['AHA 2024'], 'A'),

-- ============ PEDIATRICS ============
('medication', ARRAY['pediatrics'], 'باراسيتامول شراب 15mg/kg', 'Paracetamol Syrup', 'خافض حرارة للأطفال', '{"dose":"15mg/kg","frequency":"كل 6 ساعات"}'::jsonb, 'تثبيط COX مركزي', ARRAY['قصور كبد'], ARRAY['WHO 2023'], 'A'),
('medication', ARRAY['pediatrics'], 'أموكسيسيلين Amoxicillin 50mg/kg', 'Amoxicillin', 'مضاد حيوي شائع', '{"dose":"50mg/kg/day","frequency":"3 مرات"}'::jsonb, 'تثبيط جدار البكتيريا', ARRAY['حساسية بنسلين'], ARRAY['AAP 2023'], 'A'),
('educational', ARRAY['pediatrics'], 'تعليم الإرضاع الطبيعي', 'Breastfeeding Education', 'دعم وضعية الإرضاع والتغذية', '{"frequency":"كل 2-3 ساعات"}'::jsonb, 'تعزيز التغذية والمناعة', ARRAY[]::text[], ARRAY['WHO/UNICEF'], 'A'),

-- ============ OBGYN ============
('medication', ARRAY['obgyn'], 'حمض الفوليك 5mg', 'Folic Acid', 'وقاية من تشوهات الأنبوب العصبي', '{"dose":"5mg","frequency":"يوميًا"}'::jsonb, 'تخليق DNA', ARRAY[]::text[], ARRAY['WHO 2023'], 'A'),
('medication', ARRAY['obgyn'], 'حديد Iron 65mg', 'Ferrous Sulfate', 'علاج فقر دم الحمل', '{"dose":"65mg elemental","frequency":"يوميًا"}'::jsonb, 'بناء الهيموغلوبين', ARRAY['داء ترسّب الأصبغة'], ARRAY['ACOG 2023'], 'A'),
('medication', ARRAY['obgyn'], 'أوكسيتوسين IV', 'Oxytocin', 'تحريض المخاض ومنع النزف', '{"dose":"10U","route":"IM/IV"}'::jsonb, 'تقلّص الرحم', ARRAY['تشوّه جنيني','مشيمة منزاحة'], ARRAY['ACOG 2024'], 'A'),

-- ============ DERMATOLOGY ============
('medication', ARRAY['dermatology'], 'هيدروكورتيزون 1% كريم', 'Hydrocortisone', 'كورتيكوستيرويد موضعي خفيف', '{"frequency":"مرتين/يوم","duration":"7-14 يوم"}'::jsonb, 'مضاد التهاب موضعي', ARRAY['عدوى فيروسية/فطرية'], ARRAY['BAD 2023'], 'A'),
('medication', ARRAY['dermatology'], 'كلوتريمازول Clotrimazole 1%', 'Clotrimazole', 'مضاد فطري موضعي', '{"frequency":"مرتين","duration":"4 أسابيع"}'::jsonb, 'تثبيط إرغوسترول', ARRAY['حساسية'], ARRAY['IDSA 2023'], 'A'),
('educational', ARRAY['dermatology'], 'حماية شمسية SPF 50', 'Sun Protection', 'وقاية من UV لتجنب السرطان والشيخوخة', '{"spf":"50","frequency":"كل ساعتين"}'::jsonb, 'حصر UV-A/B', ARRAY[]::text[], ARRAY['AAD 2024'], 'A'),

-- ============ OPHTHALMOLOGY ============
('medication', ARRAY['ophthalmology'], 'كلورامفينيكول قطرات', 'Chloramphenicol Drops', 'مضاد حيوي لالتهاب الملتحمة', '{"frequency":"كل 4 ساعات","duration":"5 أيام"}'::jsonb, 'تثبيط بروتين البكتيريا', ARRAY['حساسية'], ARRAY['NICE 2023'], 'A'),
('medication', ARRAY['ophthalmology'], 'تيمولول Timolol 0.5% قطرات', 'Timolol', 'خفض ضغط العين في الزرق', '{"frequency":"مرتين/يوم"}'::jsonb, 'حاصر β موضعي', ARRAY['ربو','بطء قلب'], ARRAY['AAO 2023'], 'A'),

-- ============ ENT ============
('medication', ARRAY['ent'], 'أموكسيسيلين 500mg', 'Amoxicillin', 'لالتهاب الأذن والجيوب', '{"dose":"500mg","frequency":"3 مرات","duration":"7 أيام"}'::jsonb, 'تثبيط جدار البكتيريا', ARRAY['حساسية بنسلين'], ARRAY['AAO-HNS 2023'], 'A'),
('medication', ARRAY['ent'], 'أوكسي ميتازولين بخاخ', 'Oxymetazoline', 'مزيل احتقان أنفي قصير', '{"frequency":"مرتين","max_duration":"3 أيام"}'::jsonb, 'منبّه α', ARRAY['استخدام مطوّل (احتقان ارتدادي)'], ARRAY['BNF 2024'], 'B'),

-- ============ PSYCHIATRY ============
('medication', ARRAY['psychiatry'], 'سيرترالين Sertraline 50mg', 'Sertraline', 'SSRI للاكتئاب والقلق', '{"dose":"50mg","frequency":"صباحًا"}'::jsonb, 'تثبيط استرداد السيروتونين', ARRAY['MAOI متزامن','Mania ثنائي القطب'], ARRAY['NICE CG90'], 'A'),
('medication', ARRAY['psychiatry'], 'ريسبيريدون Risperidone 1mg', 'Risperidone', 'مضاد ذهان غير نموذجي', '{"dose":"1mg","frequency":"مرتين"}'::jsonb, 'حصر D2 و5HT2A', ARRAY['خرف مع أحداث وعائية','QT طويل'], ARRAY['APA 2023'], 'A'),
('behavioral', ARRAY['psychiatry'], 'علاج معرفي سلوكي CBT', 'CBT', 'إعادة هيكلة معرفية وتعرض متدرّج', '{"sessions":"12-16","duration":"45 دقيقة"}'::jsonb, 'تعديل الأنماط المعرفية المختلّة', ARRAY[]::text[], ARRAY['NICE 2023'], 'A'),

-- ============ INTERNAL MEDICINE ============
('medication', ARRAY['internal'], 'أملوديبين Amlodipine 5mg', 'Amlodipine', 'حاصر قنوات الكالسيوم لخفض الضغط', '{"dose":"5mg","frequency":"يوميًا"}'::jsonb, 'حصر قنوات Ca-L', ARRAY['وذمة محيطية شديدة'], ARRAY['ESH 2023'], 'A'),
('medication', ARRAY['internal','cardiology'], 'ليسينوبريل Lisinopril 10mg', 'Lisinopril', 'ACE-I لضغط الدم وحماية القلب', '{"dose":"10mg","frequency":"يوميًا"}'::jsonb, 'تثبيط ACE وخفض أنجيوتنسين 2', ARRAY['حمل','وذمة وعائية سابقة','فرط بوتاسيوم'], ARRAY['NICE NG136'], 'A'),
('medication', ARRAY['internal','endocrinology'], 'ليفوثيروكسين Levothyroxine 50mcg', 'Levothyroxine', 'بدائل هرمون الدرقية', '{"dose":"50mcg","frequency":"صباحًا قبل الفطور"}'::jsonb, 'بدائل T4', ARRAY['تسمم درقي','احتشاء حاد'], ARRAY['ATA 2023'], 'A'),

-- ============ Cross-cutting AAC / Visual / Hearing aids for general medical communication ============
('aac', ARRAY['emergency','neurology','ent'], 'بطاقات تواصل بصرية', 'Communication Picture Cards', 'لمرضى الحبسة أو ضعف السمع', '{"set":"50 صورة"}'::jsonb, 'تواصل بديل عند فقد الكلام', ARRAY[]::text[], ARRAY['ASHA 2023'], 'B'),
('visual_aid', ARRAY['ophthalmology','neurology'], 'مكبّرة قراءة 4x', 'Reading Magnifier', 'وسيلة بصرية للضعف البصري', '{"power":"4x"}'::jsonb, 'تكبير الصورة على الشبكية', ARRAY[]::text[], ARRAY['WHO Vision'], 'B'),
('hearing_aid', ARRAY['ent','neurology'], 'سماعة طبية BTE', 'BTE Hearing Aid', 'تكبير الصوت لفقد سمعي معتدل', '{"gain_db":"30-50"}'::jsonb, 'تكبير الإشارة الصوتية', ARRAY['عدوى أذن نشطة'], ARRAY['ASHA 2024'], 'B')
;
