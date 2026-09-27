import json, os, re

translations = {
    'build-a-nucleus.html': {
        "BUILD_A_NUCLEUS/neutronUppercase": "نيوترون",
        "BUILD_A_NUCLEUS/neutronsUppercase": "نيوترونات",
        "BUILD_A_NUCLEUS/protonUppercase": "بروتون",
        "BUILD_A_NUCLEUS/protonsUppercase": "بروتونات",
        "BUILD_A_NUCLEUS/electronUppercase": "إلكترون",
        "BUILD_A_NUCLEUS/positronUppercase": "بوزيترون",
        "BUILD_A_NUCLEUS/seconds": "ثوانٍ",
        "BUILD_A_NUCLEUS/energy": "الطاقة",
        "BUILD_A_NUCLEUS/magicNumbers": "الأعداد السحرية",
        "BUILD_A_NUCLEUS/halfLifeTimescale": "مقياس عمر النصف الزمني",
        "BUILD_A_NUCLEUS/partialNuclideChart": "مخطط النويدات الجزئي",
        "BUILD_A_NUCLEUS/fullNuclideChart": "مخطط النويدات الكامل",
        "BUILD_A_NUCLEUS/nuclearShellModel": "نموذج الغلاف النووي",
        "BUILD_A_NUCLEUS/unknown": "مجهول",
        "BUILD_A_NUCLEUS/stable": "مستقرة",
        "BUILD_A_NUCLEUS/unstable": "غير مستقرة"
    },
    'geometric-optics-basics.html': {
        "GEOMETRIC_OPTICS/pencil": "قلم رصاص",
        "GEOMETRIC_OPTICS/penguin": "بطريق",
        "GEOMETRIC_OPTICS/star": "نجمة",
        "GEOMETRIC_OPTICS/arrow": "سهم",
        "GEOMETRIC_OPTICS/light": "ضوء",
        "GEOMETRIC_OPTICS/diameter": "القطر",
        "GEOMETRIC_OPTICS/focalLengthPositive": "البعد البؤري",
        "GEOMETRIC_OPTICS/focalLengthNegative": "البعد البؤري (-)",
        "GEOMETRIC_OPTICS/focalLengthControl": "التحكم بالبعد البؤري:",
        "GEOMETRIC_OPTICS/checkbox.focalPoints": "بؤرتا العدسة (F)",
        "GEOMETRIC_OPTICS/checkbox.twoFPoints": "نقطتا 2F",
        "GEOMETRIC_OPTICS/checkbox.virtualImage": "صورة وهمية",
        "GEOMETRIC_OPTICS/checkbox.labels": "تسميات توضيحية",
        "GEOMETRIC_OPTICS/checkbox.guides": "خطوط الإرشاد",
        "GEOMETRIC_OPTICS/rays": "الأشعة",
        "GEOMETRIC_OPTICS/radioButton.marginal": "طرفية",
        "GEOMETRIC_OPTICS/radioButton.principal": "رئيسية",
        "GEOMETRIC_OPTICS/radioButton.many": "متعددة",
        "GEOMETRIC_OPTICS/radioButton.none": "بلا أشعة",
        "GEOMETRIC_OPTICS/screen.lens": "العدسات",
        "GEOMETRIC_OPTICS/screen.mirror": "المرايا",
        "GEOMETRIC_OPTICS/label.convexLens": "عدسة<br>محدبة",
        "GEOMETRIC_OPTICS/label.concaveLens": "عدسة<br>مقعرة",
        "GEOMETRIC_OPTICS/label.convexMirror": "مرآة<br>محدبة",
        "GEOMETRIC_OPTICS/label.concaveMirror": "مرآة<br>مقعرة",
        "GEOMETRIC_OPTICS/label.flatMirror": "مرآة<br>مستوية",
        "GEOMETRIC_OPTICS/label.object": "الجسم",
        "GEOMETRIC_OPTICS/label.realImage": "صورة<br>حقيقية",
        "GEOMETRIC_OPTICS/label.virtualImage": "صورة<br>وهمية",
        "GEOMETRIC_OPTICS/label.opticalAxis": "المحور البصري",
        "GEOMETRIC_OPTICS/label.projectionScreen": "شاشة العرض",
        "GEOMETRIC_OPTICS/radiusOfCurvaturePositive": "نصف قطر التكور (R)",
        "GEOMETRIC_OPTICS/keyboardHelpDialog.chooseAnObject": "اختر جسماً",
        "GEOMETRIC_OPTICS/keyboardHelpDialog.object": "الجسم",
        "GEOMETRIC_OPTICS/keyboardHelpDialog.objects": "الأجسام",
        "GEOMETRIC_OPTICS/keyboardHelpDialog.rulerAndMarkerControls": "أدوات المسطرة والعلامات"
    },
    'bending-light.html': {
        "BENDING_LIGHT/environment": "البيئة المحيطة",
        "BENDING_LIGHT/objects": "الأجسام",
        "BENDING_LIGHT/protractor": "المنقلة",
        "BENDING_LIGHT/reflections": "الانعكاسات",
        "BENDING_LIGHT/time": "الزمن",
        "BENDING_LIGHT/unknown": "ما هي قيمة n؟",
        "BENDING_LIGHT/air": "هواء",
        "BENDING_LIGHT/water": "ماء",
        "BENDING_LIGHT/glass": "زجاج",
        "BENDING_LIGHT/diamond": "ألماس",
        "BENDING_LIGHT/custom": "مخصص",
        "BENDING_LIGHT/indexOfRefraction": "معامل الانكسار (n)",
        "BENDING_LIGHT/ray": "شعاع",
        "BENDING_LIGHT/wave": "موجة",
        "BENDING_LIGHT/normalLine": "العمود المقام",
        "BENDING_LIGHT/angles": "الزوايا",
        "BENDING_LIGHT/intensity": "الشدة الضوئية",
        "BENDING_LIGHT/speed": "السرعة"
    },
    'faradays-electromagnetic-lab.html': {
        "FARADAYS_ELECTROMAGNETIC_LAB/currentFlow": "تدفق التيار",
        "FARADAYS_ELECTROMAGNETIC_LAB/currentSource": "مصدر<br>التيار",
        "FARADAYS_ELECTROMAGNETIC_LAB/dcPowerSupply": "مصدر تيار مستمر (DC)",
        "FARADAYS_ELECTROMAGNETIC_LAB/earth": "كوكب الأرض",
        "FARADAYS_ELECTROMAGNETIC_LAB/electromagnet": "مغناطيس كهربائي",
        "FARADAYS_ELECTROMAGNETIC_LAB/electronPreference": "إلكترونات",
        "FARADAYS_ELECTROMAGNETIC_LAB/conventionalPreference": "اصطلاحي",
        "FARADAYS_ELECTROMAGNETIC_LAB/fieldMeter": "مقياس المجال",
        "FARADAYS_ELECTROMAGNETIC_LAB/flipPolarity": "عكس القطبية",
        "FARADAYS_ELECTROMAGNETIC_LAB/flipEarth": "عكس قطبي الأرض",
        "FARADAYS_ELECTROMAGNETIC_LAB/pickupCoil": "ملف الاستقبال (الحث)",
        "FARADAYS_ELECTROMAGNETIC_LAB/transformer": "المحول الكهربائي",
        "FARADAYS_ELECTROMAGNETIC_LAB/generator": "المولد الكهرومغناطيسي",
        "FARADAYS_ELECTROMAGNETIC_LAB/compass": "البوصلة",
        "FARADAYS_ELECTROMAGNETIC_LAB/barMagnet": "قضيب مغناطيسي",
        "FARADAYS_ELECTROMAGNETIC_LAB/voltage": "فرق الجهد",
        "FARADAYS_ELECTROMAGNETIC_LAB/lightBulb": "مصباح",
        "FARADAYS_ELECTROMAGNETIC_LAB/electrons": "إلكترونات",
        "FARADAYS_ELECTROMAGNETIC_LAB/conventionalCurrent": "تيار اصطلاحي"
    },
    'hookes-law.html': {
        "HOOKES_LAW/appliedForce": "القوة المؤثرة (F)",
        "HOOKES_LAW/barGraph": "رسم بياني شريطي",
        "HOOKES_LAW/components": "المركبات",
        "HOOKES_LAW/displacement": "الإزاحة أو الاستطالة (Δx)",
        "HOOKES_LAW/displacementColon": "الإزاحة:",
        "HOOKES_LAW/energyPlot": "مخطط الطاقة",
        "HOOKES_LAW/forcePlot": "مخطط القوة",
        "HOOKES_LAW/bottomSpring": "الزنبرك السفلي:",
        "HOOKES_LAW/leftSpring": "الزنبرك الأيسر:",
        "HOOKES_LAW/rightSpring": "الزنبرك الأيمن:",
        "HOOKES_LAW/topSpring": "الزنبرك العلوي:",
        "HOOKES_LAW/potentialEnergy": "طاقة الوضع المرونية (Ep)",
        "HOOKES_LAW/springConstant": "ثابت المرونة (k)",
        "HOOKES_LAW/equilibriumPosition": "موضع الاتزان"
    },
    'wave-interference.html': {
        "WAVE_INTERFERENCE/water": "الماء",
        "WAVE_INTERFERENCE/sound": "الصوت",
        "WAVE_INTERFERENCE/light": "الضوء",
        "WAVE_INTERFERENCE/slits": "الشقوق",
        "WAVE_INTERFERENCE/diffraction": "الحيود",
        "WAVE_INTERFERENCE/screen": "شاشة الكشف",
        "WAVE_INTERFERENCE/intensityGraph": "مخطط الشدة",
        "WAVE_INTERFERENCE/frequency": "التردد",
        "WAVE_INTERFERENCE/amplitude": "السعة",
        "WAVE_INTERFERENCE/separation": "المسافة بين الشقين (d)",
        "WAVE_INTERFERENCE/slitWidth": "عرض الشق (a)"
    },
    'natural-selection.html': {
        "NATURAL_SELECTION/addMutation": "إضافة طفرة وراثية",
        "NATURAL_SELECTION/wolves": "الذئاب (المفترسات)",
        "NATURAL_SELECTION/toughFood": "الغذاء القاسي",
        "NATURAL_SELECTION/whiteFur": "فراء أبيض",
        "NATURAL_SELECTION/brownFur": "فراء بني",
        "NATURAL_SELECTION/longTeeth": "أسنان طويلة",
        "NATURAL_SELECTION/shortTeeth": "أسنان قصيرة",
        "NATURAL_SELECTION/generation": "الجيل",
        "NATURAL_SELECTION/population": "تعداد العشيرة",
        "NATURAL_SELECTION/environmentalFactors": "العوامل البيئية",
        "NATURAL_SELECTION/pedigree": "شجرة النسب الوراثي"
    },
    'my-solar-system.html': {
        "MY_SOLAR_SYSTEM/sun": "شمس",
        "MY_SOLAR_SYSTEM/planet": "كوكب",
        "MY_SOLAR_SYSTEM/moon": "قمر",
        "MY_SOLAR_SYSTEM/comet": "مذنب",
        "MY_SOLAR_SYSTEM/mass": "الكتلة",
        "MY_SOLAR_SYSTEM/velocity": "متجه السرعة",
        "MY_SOLAR_SYSTEM/gravity": "قوة الجاذبية",
        "MY_SOLAR_SYSTEM/orbits": "المسارات المدارية",
        "MY_SOLAR_SYSTEM/centerOfMass": "مركز الكتلة",
        "MY_SOLAR_SYSTEM/grid": "الشبكة الإحداثية",
        "MY_SOLAR_SYSTEM/collisions": "التصادمات",
        "SOLAR_SYSTEM_COMMON/sun": "شمس",
        "SOLAR_SYSTEM_COMMON/planet": "كوكب",
        "SOLAR_SYSTEM_COMMON/moon": "قمر",
        "SOLAR_SYSTEM_COMMON/comet": "مذنب",
        "SOLAR_SYSTEM_COMMON/mass": "الكتلة",
        "SOLAR_SYSTEM_COMMON/velocity": "متجه السرعة",
        "SOLAR_SYSTEM_COMMON/gravity": "قوة الجاذبية",
        "SOLAR_SYSTEM_COMMON/orbits": "المسارات المدارية"
    },
    'ph-scale.html': {
        "PH_SCALE/water": "ماء نقي",
        "PH_SCALE/drainCleaner": "منظف مجاري",
        "PH_SCALE/handSoap": "صابون يدين",
        "PH_SCALE/blood": "دم",
        "PH_SCALE/spit": "لعاب",
        "PH_SCALE/milk": "حليب",
        "PH_SCALE/coffee": "قهوة",
        "PH_SCALE/beer": "عصير شعير",
        "PH_SCALE/soda": "مشروب غازي",
        "PH_SCALE/vomit": "حمض المعدة",
        "PH_SCALE/batteryAcid": "حمض البطارية",
        "PH_SCALE/chickenSoup": "حساء دجاج",
        "PH_SCALE/orangeJuice": "عصير برتقال",
        "PH_SCALE/macro": "المستوى العياني",
        "PH_SCALE/micro": "المستوى المجهري",
        "PH_SCALE/mySolution": "محلولي المخصص",
        "PH_SCALE/acidic": "حمضي",
        "PH_SCALE/basic": "قاعدي",
        "PH_SCALE/neutral": "متعادل",
        "PH_SCALE/concentration": "التركيز (مول/لتر)",
        "PH_SCALE/quantity": "الكمية (مول)",
        "PH_SCALE/linear": "خطي",
        "PH_SCALE/logarithmic": "لوغاريتمي"
    },
    'quadrilateral.html': {
        "QUADRILATERAL/quadrilateral": "شكل رباعي",
        "QUADRILATERAL/trapezoid": "شبه منحرف",
        "QUADRILATERAL/parallelogram": "متوازي أضلاع",
        "QUADRILATERAL/rectangle": "مستطيل",
        "QUADRILATERAL/rhombus": "معين",
        "QUADRILATERAL/square": "مربع",
        "QUADRILATERAL/kite": "طائرة ورقية",
        "QUADRILATERAL/dart": "سهم مقعر",
        "QUADRILATERAL/sideLengths": "أطوال الأضلاع",
        "QUADRILATERAL/angles": "الزوايا",
        "QUADRILATERAL/diagonals": "الأقطار",
        "QUADRILATERAL/area": "المساحة",
        "QUADRILATERAL/perimeter": "المحيط"
    },
    'quantum-measurement.html': {
        "QUANTUM_MEASUREMENT/spin": "اللف المغزلي (Spin)",
        "QUANTUM_MEASUREMENT/magnet": "المغناطيس",
        "QUANTUM_MEASUREMENT/analyzer": "المحلل",
        "QUANTUM_MEASUREMENT/detector": "الكاشف",
        "QUANTUM_MEASUREMENT/measurement": "القياس",
        "QUANTUM_MEASUREMENT/state": "الحالة الكمية",
        "QUANTUM_MEASUREMENT/probability": "الاحتمالية",
        "QUANTUM_MEASUREMENT/beam": "حزمة الجسيمات",
        "QUANTUM_MEASUREMENT/photons": "فوتونات",
        "QUANTUM_MEASUREMENT/electrons": "إلكترونات"
    },
    'projectile-sampling-distributions.html': {
        "PROJECTILE_DATA_LAB/sampleSize": "حجم العينة (n)",
        "PROJECTILE_DATA_LAB/mean": "المتوسط الحسابي (μ)",
        "PROJECTILE_DATA_LAB/standardDeviation": "الانحراف المعياري (σ)",
        "PROJECTILE_DATA_LAB/standardError": "الخطأ المعياري",
        "PROJECTILE_DATA_LAB/histogram": "المدرج التكراري",
        "PROJECTILE_DATA_LAB/normalDistribution": "منحنى التوزيع الطبيعي",
        "PROJECTILE_DATA_LAB/centralLimitTheorem": "مبرهنة النهاية المركزية"
    }
}

for fname, dict_trans in translations.items():
    fpath = os.path.join('public/simulations', fname)
    if not os.path.exists(fpath): continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Create injection script
    inj = "\n(function(){\n  try {\n    var d = " + json.dumps(dict_trans, ensure_ascii=False) + ";\n    if (window.phet && window.phet.chipper && window.phet.chipper.strings && window.phet.chipper.strings.en) {\n      for (var k in d) {\n        window.phet.chipper.strings.en[k] = d[k];\n      }\n    }\n  } catch(e) {}\n})();\n\n"

    # Inject right before window.phet.chipper.stringMetadata
    meta_idx = content.find('window.phet.chipper.stringMetadata =')
    if meta_idx != -1:
        new_content = content[:meta_idx] + inj + content[meta_idx:]
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Enriched {fname} with {len(dict_trans)} strings')

print('All done!')
