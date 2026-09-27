import json, os, re

base_dir = 'public/simulations'
dist_dir = 'dist/simulations'
android_dir = 'android/app/src/main/assets/public/simulations'

with open('/tmp/untranslated_15.json') as f:
    untranslated_all = json.load(f)

# Comprehensive dictionary map
dict_overrides = {
    'balloons-and-static-electricity': {
        'BALLOONS_AND_STATIC_ELECTRICITY/BalloonApplet.ShowAllCharges': 'إظهار كافة الشحنات',
        'BALLOONS_AND_STATIC_ELECTRICITY/BalloonApplet.ShowNoCharges': 'إخفاء الشحنات',
        'BALLOONS_AND_STATIC_ELECTRICITY/BalloonApplet.ShowChargeDifferences': 'إظهار فرق الشحنات',
        'BALLOONS_AND_STATIC_ELECTRICITY/removeWall': 'إزالة الجدار',
        'BALLOONS_AND_STATIC_ELECTRICITY/addWall': 'إضافة الجدار',
        'BALLOONS_AND_STATIC_ELECTRICITY/balloon': 'بالون',
        'BALLOONS_AND_STATIC_ELECTRICITY/sweater': 'سترة صوفية',
        'BALLOONS_AND_STATIC_ELECTRICITY/wall': 'جدار',
        'BALLOONS_AND_STATIC_ELECTRICITY/resetBalloon': 'إعادة ضبط البالون',
        'BALLOONS_AND_STATIC_ELECTRICITY/twoBalloons': 'بالونان'
    },
    'bending-light': {
        'BENDING_LIGHT/material': 'المادة',
        'BENDING_LIGHT/normalLine': 'العمود المقام',
        'BENDING_LIGHT/intro': 'المقدمة',
        'BENDING_LIGHT/prisms': 'المنشورات',
        'BENDING_LIGHT/moreTools': 'أدوات متقدمة',
        'BENDING_LIGHT/air': 'هواء',
        'BENDING_LIGHT/water': 'ماء',
        'BENDING_LIGHT/glass': 'زجاج',
        'BENDING_LIGHT/diamond': 'ألماس',
        'BENDING_LIGHT/custom': 'مخصص',
        'BENDING_LIGHT/mysteryA': 'مادة مجهولة أ',
        'BENDING_LIGHT/mysteryB': 'مادة مجهولة ب',
        'BENDING_LIGHT/indexOfRefraction': 'معامل الانكسار (n)',
        'BENDING_LIGHT/ray': 'شعاع',
        'BENDING_LIGHT/wave': 'موجة',
        'BENDING_LIGHT/angles': 'الزوايا',
        'BENDING_LIGHT/intensity': 'الشدة الضوئية',
        'BENDING_LIGHT/speed': 'السرعة'
    },
    'build-a-nucleus': {
        'BUILD_A_NUCLEUS/protonsColon': 'بروتونات:',
        'BUILD_A_NUCLEUS/neutronsColon': 'نيوترونات:',
        'BUILD_A_NUCLEUS/halfLifeColon': 'عمر النصف:',
        'BUILD_A_NUCLEUS/availableDecays': 'أنماط الاضمحلال المتاحة',
        'BUILD_A_NUCLEUS/electronCloud': 'السحابة الإلكترونية',
        'BUILD_A_NUCLEUS/moreStable': 'أكثر استقراراً',
        'BUILD_A_NUCLEUS/lessStable': 'أقل استقراراً',
        'BUILD_A_NUCLEUS/protons': 'بروتونات',
        'BUILD_A_NUCLEUS/neutrons': 'نيوترونات',
        'BUILD_A_NUCLEUS/proton': 'بروتون',
        'BUILD_A_NUCLEUS/neutron': 'نيوترون',
        'BUILD_A_NUCLEUS/electron': 'إلكترون',
        'BUILD_A_NUCLEUS/positron': 'بوزيترون',
        'BUILD_A_NUCLEUS/alphaDecay': 'اضمحلال ألفا (α)',
        'BUILD_A_NUCLEUS/betaMinusDecay': 'اضمحلال بيتا السالبة (β⁻)',
        'BUILD_A_NUCLEUS/betaPlusDecay': 'اضمحلال بيتا الموجبة (β⁺)',
        'BUILD_A_NUCLEUS/protonEmission': 'انبعاث بروتون',
        'BUILD_A_NUCLEUS/neutronEmission': 'انبعاث نيوترون',
        'BUILD_A_NUCLEUS/stable': 'مستقرة',
        'BUILD_A_NUCLEUS/unstable': 'غير مستقرة',
        'BUILD_A_NUCLEUS/screen.decay': 'الاضمحلال الإشعاعي',
        'BUILD_A_NUCLEUS/screen.chartIntro': 'مخطط النويدات'
    },
    'hookes-law': {
        'HOOKES_LAW/appliedForceNumber': 'القوة المؤثرة {0}:',
        'HOOKES_LAW/springConstantNumber': 'ثابت الزنبرك {0}:',
        'HOOKES_LAW/appliedForceColon': 'القوة المؤثرة:',
        'HOOKES_LAW/springConstant': 'ثابت الزنبرك:',
        'HOOKES_LAW/springForce': 'قوة الزنبرك الإرجاعية',
        'HOOKES_LAW/displacement': 'الإزاحة أو الاستطالة (Δx)',
        'HOOKES_LAW/equilibriumPosition': 'موضع الاتزان',
        'HOOKES_LAW/values': 'القيم العددية',
        'HOOKES_LAW/intro': 'المقدمة',
        'HOOKES_LAW/systems': 'الأنظمة المركبة',
        'HOOKES_LAW/energy': 'طاقة الوضع',
        'HOOKES_LAW/appliedForce': 'القوة المؤثرة (F_app)'
    },
    'pendulum-lab': {
        'PENDULUM_LAB/ruler': 'مسطرة قياس',
        'PENDULUM_LAB/stopwatch': 'ساعة توقيت',
        'PENDULUM_LAB/periodTrace': 'أثر مسار الدورة',
        'PENDULUM_LAB/periodTimer': 'مؤقت زمن الدورة',
        'PENDULUM_LAB/length': 'طول الخيط (L)',
        'PENDULUM_LAB/mass': 'الكتلة (m)',
        'PENDULUM_LAB/gravity': 'الجاذبية (g)',
        'PENDULUM_LAB/friction': 'الاحتكاك',
        'PENDULUM_LAB/earth': 'الأرض',
        'PENDULUM_LAB/moon': 'القمر',
        'PENDULUM_LAB/jupiter': 'المشتري',
        'PENDULUM_LAB/planetX': 'كوكب X',
        'PENDULUM_LAB/velocity': 'متجه السرعة',
        'PENDULUM_LAB/acceleration': 'متجه التسارع',
        'PENDULUM_LAB/normal': 'عادي',
        'PENDULUM_LAB/slow': 'بطيء'
    },
    'wave-interference': {
        'WAVE_INTERFERENCE/topView': 'منظر علوي',
        'WAVE_INTERFERENCE/sideView': 'منظر جانبي',
        'WAVE_INTERFERENCE/graph': 'الرسم البياني',
        'WAVE_INTERFERENCE/frequency': 'التردد (f)',
        'WAVE_INTERFERENCE/amplitude': 'السعة (A)',
        'WAVE_INTERFERENCE/screen': 'الشاشة',
        'WAVE_INTERFERENCE/intensity': 'الشدة',
        'WAVE_INTERFERENCE/oneSource': 'مصدر واحد',
        'WAVE_INTERFERENCE/twoSources': 'مصدران',
        'WAVE_INTERFERENCE/oneSlit': 'شق مفرد',
        'WAVE_INTERFERENCE/twoSlits': 'شق مزدوج'
    },
    'natural-selection': {
        'NATURAL_SELECTION/addAMate': 'إضافة شريك للتكاثر',
        'NATURAL_SELECTION/environmentalFactors': 'العوامل البيئية',
        'NATURAL_SELECTION/limitedFood': 'غذاء محدود',
        'NATURAL_SELECTION/toughFood': 'غذاء صلب',
        'NATURAL_SELECTION/wolves': 'الذئاب المفترسة',
        'NATURAL_SELECTION/whiteFur': 'فراء أبيض',
        'NATURAL_SELECTION/brownFur': 'فراء بني',
        'NATURAL_SELECTION/fur': 'الفراء',
        'NATURAL_SELECTION/dominant': 'سائد',
        'NATURAL_SELECTION/recessive': 'متنحٍ',
        'NATURAL_SELECTION/generation': 'الجيل',
        'NATURAL_SELECTION/population': 'تعداد العشيرة',
        'NATURAL_SELECTION/proportions': 'النسب المئوية',
        'NATURAL_SELECTION/pedigree': 'شجرة النسب',
        'NATURAL_SELECTION/total': 'المجموع الكلي',
        'NATURAL_SELECTION/dataProbe': 'مسبار البيانات',
        'NATURAL_SELECTION/none': 'بلا'
    },
    'my-solar-system': {
        'MY_SOLAR_SYSTEM/speedKmS': 'السرعة (كم/ث)',
        'MY_SOLAR_SYSTEM/velocity': 'متجه السرعة',
        'MY_SOLAR_SYSTEM/gravityForce': 'قوة الجاذبية',
        'MY_SOLAR_SYSTEM/path': 'المسار',
        'MY_SOLAR_SYSTEM/grid': 'الشبكة',
        'MY_SOLAR_SYSTEM/measuringTape': 'شريط القياس',
        'MY_SOLAR_SYSTEM/centerOfMass': 'مركز الكتلة',
        'MY_SOLAR_SYSTEM/clear': 'مسح',
        'MY_SOLAR_SYSTEM/years': 'سنوات',
        'MY_SOLAR_SYSTEM/mass': 'الكتلة'
    },
    'ph-scale': {
        'PH_SCALE/water': 'ماء',
        'PH_SCALE/drainCleaner': 'منظف مجاري',
        'PH_SCALE/handSoap': 'صابون يدين',
        'PH_SCALE/blood': 'دم',
        'PH_SCALE/spit': 'لعاب',
        'PH_SCALE/milk': 'حليب',
        'PH_SCALE/coffee': 'قهوة',
        'PH_SCALE/beer': 'عصير شعير',
        'PH_SCALE/soda': 'مشروب غازي',
        'PH_SCALE/vomit': 'حمض المعدة',
        'PH_SCALE/batteryAcid': 'حمض البطارية',
        'PH_SCALE/acidic': 'حمضي',
        'PH_SCALE/basic': 'قاعدي',
        'PH_SCALE/neutral': 'متعادل'
    },
    'geometric-optics-basics': {
        'GEOMETRIC_OPTICS/object': 'الجسم',
        'GEOMETRIC_OPTICS/image': 'الصورة',
        'GEOMETRIC_OPTICS/focalLength': 'البعد البؤري (f)',
        'GEOMETRIC_OPTICS/radiusOfCurvature': 'نصف قطر التكور (R)',
        'GEOMETRIC_OPTICS/realImage': 'صورة حقيقية',
        'GEOMETRIC_OPTICS/virtualImage': 'صورة وهمية',
        'GEOMETRIC_OPTICS/marginalRays': 'الأشعة الطرفية',
        'GEOMETRIC_OPTICS/principalRays': 'الأشعة الرئيسية',
        'GEOMETRIC_OPTICS/manyRays': 'أشعة متعددة',
        'GEOMETRIC_OPTICS/arrow': 'سهم',
        'GEOMETRIC_OPTICS/candle': 'شمعة'
    },
    'faradays-electromagnetic-lab': {
        'FARADAYS_ELECTROMAGNETIC_LAB/barMagnet': 'مغناطيس مستقيم',
        'FARADAYS_ELECTROMAGNETIC_LAB/compass': 'بوصلة',
        'FARADAYS_ELECTROMAGNETIC_LAB/fieldLines': 'خطوط المجال',
        'FARADAYS_ELECTROMAGNETIC_LAB/voltmeter': 'فولتميتر',
        'FARADAYS_ELECTROMAGNETIC_LAB/acPowerSupply': 'مصدر تيار متناوب (AC)',
        'FARADAYS_ELECTROMAGNETIC_LAB/batteryVoltage': 'جهد البطارية (DC)',
        'FARADAYS_ELECTROMAGNETIC_LAB/lightBulb': 'مصباح',
        'FARADAYS_ELECTROMAGNETIC_LAB/electrons': 'إلكترونات',
        'FARADAYS_ELECTROMAGNETIC_LAB/conventionalCurrent': 'تيار اصطلاحي'
    },
    'neuron': {
        'NEURON/stimulateNeuron': 'تحفيز العصبون',
        'NEURON/actionPotential': 'جهد الفعل',
        'NEURON/membranePotential': 'جهد الغشاء (mV)',
        'NEURON/charges': 'الشحنات',
        'NEURON/concentrations': 'التراكيز'
    },
    'quadrilateral': {
        'QUADRILATERAL/square': 'مربع',
        'QUADRILATERAL/rectangle': 'مستطيل',
        'QUADRILATERAL/rhombus': 'معين',
        'QUADRILATERAL/parallelogram': 'متوازي أضلاع',
        'QUADRILATERAL/trapezoid': 'شبه منحرف',
        'QUADRILATERAL/kite': 'طائرة ورقية',
        'QUADRILATERAL/angles': 'الزوايا',
        'QUADRILATERAL/sideLengths': 'أطوال الأضلاع',
        'QUADRILATERAL/diagonals': 'الأقطار'
    },
    'quantum-measurement': {
        'QUANTUM_MEASUREMENT/spinUp': 'غزل لأعلى (+½)',
        'QUANTUM_MEASUREMENT/spinDown': 'غزل لأسفل (-½)',
        'QUANTUM_MEASUREMENT/averagePolarization': 'متوسط الاستقطاب',
        'QUANTUM_MEASUREMENT/probability': 'الاحتمالية الكمية',
        'QUANTUM_MEASUREMENT/magneticField': 'المجال المغناطيسي',
        'QUANTUM_MEASUREMENT/detectors': 'الكواشف'
    },
    'projectile-sampling-distributions': {
        'PROJECTILE_DATA_LAB/angle': 'زاوية الإطلاق (θ)',
        'PROJECTILE_DATA_LAB/speed': 'السرعة الابتدائية (v₀)',
        'PROJECTILE_DATA_LAB/target': 'الهدف',
        'PROJECTILE_DATA_LAB/sampleSize': 'حجم العينة (n)',
        'PROJECTILE_DATA_LAB/mean': 'المتوسط الحسابي (μ)',
        'PROJECTILE_DATA_LAB/standardDeviation': 'الانحراف المعياري (σ)',
        'PROJECTILE_DATA_LAB/histogram': 'المدرج التكراري'
    }
}

for sim_name, overrides in dict_overrides.items():
    html_file = f'{sim_name}.html'
    p = os.path.join(base_dir, html_file)
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for our injected code block or inject right after strings
    injection_code = f"""
(function(){{
  try {{
    var d = {json.dumps(overrides, ensure_ascii=False)};
    if (window.phet && window.phet.chipper && window.phet.chipper.strings && window.phet.chipper.strings.en) {{
      for (var k in d) {{
        window.phet.chipper.strings.en[k] = d[k];
      }}
    }}
  }} catch(e) {{
    console.error('Arabic override error:', e);
  }}
}})();
"""
    # Insert right before </head> or right before stringMetadata
    if 'window.phet.chipper.stringMetadata =' in content:
        idx = content.find('window.phet.chipper.stringMetadata =')
        content = content[:idx] + injection_code + '\n' + content[idx:]
    else:
        # insert right before </body>
        idx = content.rfind('</body>')
        content = content[:idx] + '<script>' + injection_code + '</script>\n' + content[idx:]

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)

    # Sync to dist and android
    dist_p = os.path.join(dist_dir, html_file)
    if os.path.exists(dist_dir):
        with open(dist_p, 'w', encoding='utf-8') as f:
            f.write(content)

    android_p = os.path.join(android_dir, html_file)
    if os.path.exists(android_dir):
        with open(android_p, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f'Enriched translations for {html_file}')

print('All 15 simulations enriched successfully!')
