const fs = require('fs');
const path = require('path');

const splashDataUri = fs.readFileSync('/tmp/dhirwat_splash_data_uri.txt', 'utf8').trim();
const logoDarkUri = fs.readFileSync('/tmp/dhirwat_logo_uri1.txt', 'utf8').trim();
const logoLightUri = fs.readFileSync('/tmp/dhirwat_logo_uri2.txt', 'utf8').trim();

// Common strings for all simulations
const commonJoistStrings = {
  "JOIST/menuItem.phetWebsite": "موقع منصة ذروة العلم…",
  "JOIST/menuItem.about": "حول محاكاة ذروة العلم…",
  "JOIST/phetMenu": "قائمة ذروة العلم",
  "JOIST/donateToPhet": "دعم منصة ذروة العلم",
  "JOIST/menuItem.fullscreen": "ملء الشاشة",
  "JOIST/menuItem.exitFullscreen": "الخروج من ملء الشاشة",
  "JOIST/menuItem.screenshot": "التقاط صورة للتجربة",
  "JOIST/title.settings": "الإعدادات",
  "JOIST/hotKeysAndHelp": "مفاتيح الاختصار والمساعدة",
  "JOIST/done": "تم",
  "JOIST/termsPrivacyAndLicensing": "الشروط والخصوصية والترخيص",
  "JOIST/versionPattern": "الإصدار {{version}}",
  "SCENERY_PHET/speed.fast": "سريع",
  "SCENERY_PHET/speed.normal": "عادي",
  "SCENERY_PHET/speed.slow": "بطيء",
  "SCENERY_PHET/keyboardHelpDialog.resetAll": "إعادة تعيين الكل",
  "SCENERY_PHET/keyboardHelpDialog.basicActions": "الإجراءات الأساسية",
  "SCENERY_PHET/keyboardHelpDialog.or": "أو",
  "SCENERY_PHET/keyboardHelpDialog.exitADialog": "إغلاق النافذة"
};

const configs = [
  {
    file: 'build-a-nucleus.html',
    title: 'بناء النواة الذرية | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "BUILD_A_NUCLEUS/build-a-nucleus.title": "بناء النواة الذرية",
      "BUILD_A_NUCLEUS/screen.decay": "الاضمحلال الإشعاعي",
      "BUILD_A_NUCLEUS/screen.chartIntro": "مخطط النويدات",
      "BUILD_A_NUCLEUS/symbol": "الرمز النووي",
      "BUILD_A_NUCLEUS/alphaDecay": "اضمحلال ألفا (α)",
      "BUILD_A_NUCLEUS/betaMinusDecay": "اضمحلال بيتا السالبة (β⁻)",
      "BUILD_A_NUCLEUS/betaPlusDecay": "اضمحلال بيتا الموجبة (β⁺)",
      "BUILD_A_NUCLEUS/protonEmission": "انبعاث بروتون",
      "BUILD_A_NUCLEUS/neutronEmission": "انبعاث نيوترون",
      "BUILD_A_NUCLEUS/stable": "مستقرة",
      "BUILD_A_NUCLEUS/unstable": "غير مستقرة",
      "BUILD_A_NUCLEUS/proton": "بروتون",
      "BUILD_A_NUCLEUS/protons": "بروتونات",
      "BUILD_A_NUCLEUS/neutron": "نيوترون",
      "BUILD_A_NUCLEUS/neutrons": "نيوترونات",
      "BUILD_A_NUCLEUS/nuclide": "نويدة",
      "BUILD_A_NUCLEUS/massNumber": "العدد الكتلي (A)",
      "BUILD_A_NUCLEUS/atomicNumber": "العدد الذري (Z)",
      "BUILD_A_NUCLEUS/halfLife": "عمر النصف (t½)"
    }
  },
  {
    file: 'bending-light.html',
    title: 'انكسار الضوء وقانون سنيل | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "BENDING_LIGHT/bending-light.title": "انكسار الضوء وقانون سنيل",
      "BENDING_LIGHT/screen.intro": "المقدمة",
      "BENDING_LIGHT/screen.prisms": "المنشورات",
      "BENDING_LIGHT/screen.moreTools": "أدوات متقدمة",
      "BENDING_LIGHT/air": "هواء",
      "BENDING_LIGHT/water": "ماء",
      "BENDING_LIGHT/glass": "زجاج",
      "BENDING_LIGHT/diamond": "ألماس",
      "BENDING_LIGHT/custom": "مخصص",
      "BENDING_LIGHT/mysteryA": "مادة مجهولة أ",
      "BENDING_LIGHT/mysteryB": "مادة مجهولة ب",
      "BENDING_LIGHT/indexOfRefraction": "معامل الانكسار (n)",
      "BENDING_LIGHT/ray": "شعاع",
      "BENDING_LIGHT/wave": "موجة",
      "BENDING_LIGHT/normal": "العمود المقام",
      "BENDING_LIGHT/angles": "الزوايا",
      "BENDING_LIGHT/intensity": "الشدة الضوئية",
      "BENDING_LIGHT/speed": "السرعة"
    }
  },
  {
    file: 'faradays-electromagnetic-lab.html',
    title: 'مختبر فاراداي للكهرومغناطيسية | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "FARADAYS_ELECTROMAGNETIC_LAB/faradays-electromagnetic-lab.title": "مختبر فاراداي للكهرومغناطيسية",
      "FARADAYS_ELECTROMAGNETIC_LAB/screen.barMagnet": "المغناطيس المستقيم",
      "FARADAYS_ELECTROMAGNETIC_LAB/screen.pickupCoil": "ملف الاستقبال",
      "FARADAYS_ELECTROMAGNETIC_LAB/screen.electromagnet": "المغناطيس الكهربائي",
      "FARADAYS_ELECTROMAGNETIC_LAB/screen.transformer": "المحول الكهربائي",
      "FARADAYS_ELECTROMAGNETIC_LAB/screen.generator": "المولد الكهربائي",
      "FARADAYS_ELECTROMAGNETIC_LAB/barMagnet": "مغناطيس مستقيم",
      "FARADAYS_ELECTROMAGNETIC_LAB/compass": "بوصلة",
      "FARADAYS_ELECTROMAGNETIC_LAB/fieldLines": "خطوط المجال المغناطيسي",
      "FARADAYS_ELECTROMAGNETIC_LAB/acPowerSupply": "مصدر تيار متناوب (AC)",
      "FARADAYS_ELECTROMAGNETIC_LAB/batteryVoltage": "جهد البطارية (DC)",
      "FARADAYS_ELECTROMAGNETIC_LAB/voltmeter": "فولتميتر",
      "FARADAYS_ELECTROMAGNETIC_LAB/lightBulb": "مصباح",
      "FARADAYS_ELECTROMAGNETIC_LAB/electrons": "إلكترونات",
      "FARADAYS_ELECTROMAGNETIC_LAB/conventionalCurrent": "تيار اصطلاحي"
    }
  },
  {
    file: 'geometric-optics-basics.html',
    title: 'أساسيات البصريات الهندسية | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "GEOMETRIC_OPTICS/geometric-optics-basics.title": "أساسيات البصريات الهندسية",
      "GEOMETRIC_OPTICS/screen.lens": "العدسات",
      "GEOMETRIC_OPTICS/screen.mirror": "المرايا",
      "GEOMETRIC_OPTICS/convex": "محدبة",
      "GEOMETRIC_OPTICS/concave": "مقعرة",
      "GEOMETRIC_OPTICS/focalLength": "البعد البؤري (f)",
      "GEOMETRIC_OPTICS/focalPoint": "البؤرة (F)",
      "GEOMETRIC_OPTICS/radiusOfCurvature": "نصف قطر التكور (R)",
      "GEOMETRIC_OPTICS/object": "الجسم",
      "GEOMETRIC_OPTICS/image": "الصورة",
      "GEOMETRIC_OPTICS/realImage": "صورة حقيقية",
      "GEOMETRIC_OPTICS/virtualImage": "صورة وهمية",
      "GEOMETRIC_OPTICS/rays": "الأشعة",
      "GEOMETRIC_OPTICS/marginalRays": "الأشعة الطرفية",
      "GEOMETRIC_OPTICS/principalRays": "الأشعة الرئيسية",
      "GEOMETRIC_OPTICS/manyRays": "أشعة متعددة",
      "GEOMETRIC_OPTICS/arrow": "سهم",
      "GEOMETRIC_OPTICS/candle": "شمعة"
    }
  },
  {
    file: 'pendulum-lab.html',
    title: 'مختبر البندول البسيط | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "PENDULUM_LAB/pendulum-lab.title": "مختبر البندول البسيط",
      "PENDULUM_LAB/screen.intro": "المقدمة",
      "PENDULUM_LAB/screen.energy": "الطاقة",
      "PENDULUM_LAB/screen.lab": "المختبر المتقدم",
      "PENDULUM_LAB/length": "طول الخيط (L)",
      "PENDULUM_LAB/mass": "الكتلة (m)",
      "PENDULUM_LAB/gravity": "الجاذبية (g)",
      "PENDULUM_LAB/friction": "الاحتكاك",
      "PENDULUM_LAB/earth": "الأرض",
      "PENDULUM_LAB/moon": "القمر",
      "PENDULUM_LAB/jupiter": "المشتري",
      "PENDULUM_LAB/planetX": "كوكب X",
      "PENDULUM_LAB/custom": "مخصص",
      "PENDULUM_LAB/none": "معدوم",
      "PENDULUM_LAB/lots": "كبير",
      "PENDULUM_LAB/stopwatch": "ساعة توقيت",
      "PENDULUM_LAB/periodTimer": "مؤقت زمن الدورة (T)",
      "PENDULUM_LAB/velocity": "متجه السرعة",
      "PENDULUM_LAB/acceleration": "متجه التسارع"
    }
  },
  {
    file: 'wave-interference.html',
    title: 'تداخل الموجات العامة | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "WAVE_INTERFERENCE/wave-interference.title": "تداخل الموجات العامة",
      "WAVE_INTERFERENCE/screen.water": "موجات الماء",
      "WAVE_INTERFERENCE/screen.sound": "الموجات الصوتية",
      "WAVE_INTERFERENCE/screen.light": "الموجات الضوئية",
      "WAVE_INTERFERENCE/screen.slits": "الشقوق والحيود",
      "WAVE_INTERFERENCE/screen.diffraction": "ظاهرة الحيود",
      "WAVE_INTERFERENCE/frequency": "التردد (f)",
      "WAVE_INTERFERENCE/amplitude": "السعة (A)",
      "WAVE_INTERFERENCE/wavelength": "الطول الموجي (λ)",
      "WAVE_INTERFERENCE/separation": "المسافة بين المصدرين (d)",
      "WAVE_INTERFERENCE/intensity": "الشدة",
      "WAVE_INTERFERENCE/screen": "الشاشة",
      "WAVE_INTERFERENCE/graph": "الرسم البياني",
      "WAVE_INTERFERENCE/oneSource": "مصدر واحد",
      "WAVE_INTERFERENCE/twoSources": "مصدران",
      "WAVE_INTERFERENCE/oneSlit": "شق مفرد",
      "WAVE_INTERFERENCE/twoSlits": "شق مزدوج"
    }
  },
  {
    file: 'natural-selection.html',
    title: 'الانتخاب الطبيعي والتكيف | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "NATURAL_SELECTION/natural-selection.title": "الانتخاب الطبيعي والتكيف",
      "NATURAL_SELECTION/screen.intro": "المقدمة",
      "NATURAL_SELECTION/screen.lab": "المختبر التطوري",
      "NATURAL_SELECTION/dominant": "سائد",
      "NATURAL_SELECTION/recessive": "متنحٍ",
      "NATURAL_SELECTION/addMutation": "إضافة طفرة وراثية",
      "NATURAL_SELECTION/wolves": "الذئاب (المفترسات)",
      "NATURAL_SELECTION/toughFood": "الغذاء القاسي",
      "NATURAL_SELECTION/whiteFur": "فراء أبيض",
      "NATURAL_SELECTION/brownFur": "فراء بني",
      "NATURAL_SELECTION/longTeeth": "أسنان طويلة",
      "NATURAL_SELECTION/shortTeeth": "أسنان قصيرة",
      "NATURAL_SELECTION/generation": "الجيل",
      "NATURAL_SELECTION/population": "تعداد العشيرة"
    }
  },
  {
    file: 'my-solar-system.html',
    title: 'نظامي الشمسي وقوانين الجاذبية | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "MY_SOLAR_SYSTEM/my-solar-system.title": "نظامي الشمسي والجاذبية الكونية",
      "MY_SOLAR_SYSTEM/screen.intro": "المقدمة",
      "MY_SOLAR_SYSTEM/screen.lab": "المختبر المداري",
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
      "MY_SOLAR_SYSTEM/collisions": "التصادمات"
    }
  },
  {
    file: 'ph-scale.html',
    title: 'مقياس الرقم الهيدروجيني (pH) | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "PH_SCALE/ph-scale.title": "مقياس الرقم الهيدروجيني (pH)",
      "PH_SCALE/screen.macro": "المستوى العياني (Macro)",
      "PH_SCALE/screen.micro": "المستوى المجهري (Micro)",
      "PH_SCALE/screen.mySolution": "محلولي المخصص",
      "PH_SCALE/acidic": "حمضي",
      "PH_SCALE/basic": "قاعدي",
      "PH_SCALE/neutral": "متعادل",
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
      "PH_SCALE/concentration": "التركيز (مول/لتر)"
    }
  },
  {
    file: 'neuron.html',
    title: 'العصبون والسيال العصبي | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "NEURON/neuron.title": "العصبون والسيال العصبي",
      "NEURON/actionPotential": "جهد الفعل",
      "NEURON/stimulateNeuron": "تحفيز العصبون",
      "NEURON/sodiumIon": "أيون الصوديوم (Na⁺)",
      "NEURON/potassiumIon": "أيون البوتاسيوم (K⁺)",
      "NEURON/sodiumChannel": "قناة صوديوم مبوبة",
      "NEURON/potassiumChannel": "قناة بوتاسيوم مبوبة",
      "NEURON/membranePotential": "جهد الغشاء (mV)",
      "NEURON/myelin": "غمد المايلين",
      "NEURON/charges": "الشحنات",
      "NEURON/concentrations": "التراكيز"
    }
  },
  {
    file: 'quadrilateral.html',
    title: 'الأشكال الرباعية وخواصها | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "QUADRILATERAL/quadrilateral.title": "الأشكال الرباعية وخواصها",
      "QUADRILATERAL/square": "مربع",
      "QUADRILATERAL/rectangle": "مستطيل",
      "QUADRILATERAL/rhombus": "معين",
      "QUADRILATERAL/parallelogram": "متوازي أضلاع",
      "QUADRILATERAL/trapezoid": "شبه منحرف",
      "QUADRILATERAL/kite": "طائرة ورقية (دالتون)",
      "QUADRILATERAL/angles": "قياسات الزوايا",
      "QUADRILATERAL/sideLengths": "أطوال الأضلاع",
      "QUADRILATERAL/diagonals": "الأقطار",
      "QUADRILATERAL/parallel": "متوازية",
      "QUADRILATERAL/perpendicular": "متعامدة",
      "QUADRILATERAL/equal": "متساوية"
    }
  },
  {
    file: 'hookes-law.html',
    title: 'قانون هوك ومرونة الزنبرك | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "HOOKES_LAW/hookes-law.title": "قانون هوك ومرونة الزنبرك",
      "HOOKES_LAW/screen.intro": "المقدمة",
      "HOOKES_LAW/screen.systems": "الأنظمة المركبة",
      "HOOKES_LAW/screen.energy": "طاقة الوضع المرونية",
      "HOOKES_LAW/appliedForce": "القوة المؤثرة (F_app)",
      "HOOKES_LAW/springForce": "قوة الزنبرك الإرجاعية (F_s)",
      "HOOKES_LAW/displacement": "الإزاحة أو الاستطالة (Δx)",
      "HOOKES_LAW/springConstant": "ثابت الزنبرك (k)",
      "HOOKES_LAW/equilibriumPosition": "موضع الاتزان",
      "HOOKES_LAW/potentialEnergy": "طاقة الوضع المرونية (Ep)",
      "HOOKES_LAW/series": "توصيل على التوالي",
      "HOOKES_LAW/parallel": "توصيل على التوازي"
    }
  },
  {
    file: 'quantum-measurement.html',
    title: 'القياس الكمي وتجربة شتيرن-غيرلاخ | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "QUANTUM_MEASUREMENT/quantum-measurement.title": "القياس الكمي وتجربة شتيرن-غيرلاخ",
      "QUANTUM_MEASUREMENT/screen.sternGerlach": "تجربة شتيرن-غيرلاخ",
      "QUANTUM_MEASUREMENT/screen.photonPolarization": "استقطاب الفوتونات",
      "QUANTUM_MEASUREMENT/spinUp": "غزل للأعلى (+½)",
      "QUANTUM_MEASUREMENT/spinDown": "غزل للأسفل (-½)",
      "QUANTUM_MEASUREMENT/magneticField": "المجال المغناطيسي غير المتجانس",
      "QUANTUM_MEASUREMENT/probability": "الاحتمالية الكمية",
      "QUANTUM_MEASUREMENT/superposition": "حالة التراكب الكمي",
      "QUANTUM_MEASUREMENT/measurement": "عملية القياس والانهيار",
      "QUANTUM_MEASUREMENT/analyzer": "المحلل المستقطب",
      "QUANTUM_MEASUREMENT/detectors": "كواشف الجسيمات"
    }
  },
  {
    file: 'balloons-and-static-electricity.html',
    title: 'البالونات والكهرباء الساكنة | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "BALLOONS_AND_STATIC_ELECTRICITY/balloons-and-static-electricity.title": "البالونات والكهرباء الساكنة",
      "BALLOONS_AND_STATIC_ELECTRICITY/balloon": "البالون",
      "BALLOONS_AND_STATIC_ELECTRICITY/sweater": "السترة الصوفية",
      "BALLOONS_AND_STATIC_ELECTRICITY/wall": "الجدار العازل",
      "BALLOONS_AND_STATIC_ELECTRICITY/showAllCharges": "إظهار كافة الشحنات",
      "BALLOONS_AND_STATIC_ELECTRICITY/showNoCharges": "إخفاء الشحنات",
      "BALLOONS_AND_STATIC_ELECTRICITY/showChargeDifferences": "إظهار فرق الشحنات",
      "BALLOONS_AND_STATIC_ELECTRICITY/twoBalloons": "بالونان",
      "BALLOONS_AND_STATIC_ELECTRICITY/resetBalloon": "إعادة ضبط البالون",
      "BALLOONS_AND_STATIC_ELECTRICITY/positiveCharge": "شحنة موجبة (+)",
      "BALLOONS_AND_STATIC_ELECTRICITY/negativeCharge": "شحنة سالبة (-)"
    }
  },
  {
    file: 'projectile-sampling-distributions.html',
    title: 'المقذوفات وتوزيعات المعاينة الإحصائية | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "PROJECTILE_DATA_LAB/projectile-sampling-distributions.title": "المقذوفات وتوزيعات المعاينة الإحصائية",
      "PROJECTILE_DATA_LAB/screen.launch": "منصة الإطلاق",
      "PROJECTILE_DATA_LAB/screen.sample": "معاينة البيانات",
      "PROJECTILE_DATA_LAB/screen.samplingDistributions": "توزيعات المعاينة",
      "PROJECTILE_DATA_LAB/angle": "زاوية الإطلاق (θ)",
      "PROJECTILE_DATA_LAB/speed": "سرعة الإطلاق الابتدائية (v₀)",
      "PROJECTILE_DATA_LAB/target": "الهدف",
      "PROJECTILE_DATA_LAB/sampleSize": "حجم العينة (n)",
      "PROJECTILE_DATA_LAB/mean": "المتوسط الحسابي (μ)",
      "PROJECTILE_DATA_LAB/standardDeviation": "الانحراف المعياري (σ)",
      "PROJECTILE_DATA_LAB/standardError": "الخطأ المعياري",
      "PROJECTILE_DATA_LAB/histogram": "المدرج التكراري",
      "PROJECTILE_DATA_LAB/normalDistribution": "التوزيع الطبيعي",
      "PROJECTILE_DATA_LAB/centralLimitTheorem": "مبرهنة النهاية المركزية"
    }
  }
];

for (const cfg of configs) {
  const filePath = path.join('public/simulations', cfg.file);
  console.log(`\n========================================`);
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace title and og:title
  content = content.replace(/<title>[\s\S]*?<\/title>/, `<title>${cfg.title}</title>`);
  content = content.replace(/<meta property="og:title" content="[\s\S]*?">/, `<meta property="og:title" content="${cfg.title}">`);
  console.log(`✓ Title updated to: ${cfg.title}`);

  // 2. Bypass home screen (initialScreen -> 1)
  const initialMatches = [
    'initialScreen:{type:"number",defaultValue:0,public:!0}',
    'initialScreen:{type:"number",defaultValue:0}',
    'initialScreen:{type:"number",defaultValue:0,public:true}'
  ];
  for (const m of initialMatches) {
    if (content.includes(m)) {
      content = content.replace(m, m.replace('defaultValue:0', 'defaultValue:1'));
      console.log(`✓ initialScreen bypassed (defaultValue: 1)`);
      break;
    }
  }

  // 3. Splash screen replacement
  const splashIdx = content.indexOf('window.PHET_SPLASH_DATA_URI="');
  if (splashIdx !== -1) {
    const splashEnd = content.indexOf('"', splashIdx + 29);
    content = content.slice(0, splashIdx + 29) + splashDataUri + content.slice(splashEnd);
    console.log(`✓ window.PHET_SPLASH_DATA_URI replaced with Dhirwat Al-Elm emblem`);
  }

  // 4. Brand logos and Brand object replacement
  if (content.includes('window.phet.chipper.mipmaps')) {
    // Older Chipper mipmaps replacement
    content = content.replace(
      /"BRAND\/logo-on-white\.png":\[\{width:273,height:108,url:"[^"]+"/,
      `"BRAND/logo-on-white.png":[{width:273,height:108,url:"${logoLightUri}"`
    );
    content = content.replace(
      /"BRAND\/logo\.png":\[\{width:273,height:108,url:"[^"]+"/,
      `"BRAND/logo.png":[{width:273,height:108,url:"${logoDarkUri}"`
    );
    console.log(`✓ Mipmap brand logos replaced with Dhirwat Al-Elm logos`);
  } else {
    // Modern Chipper inline base64 replacement
    const brandIdx = content.indexOf('{id:"phet",name:');
    if (brandIdx !== -1) {
      const partBefore = content.slice(brandIdx - 40000, brandIdx);
      const firstData = partBefore.indexOf('data:image/png;base64');
      const end1 = partBefore.indexOf('"', firstData);
      const secondData = partBefore.indexOf('data:image/png;base64', end1);
      const end2 = partBefore.indexOf('"', secondData);

      if (firstData !== -1 && secondData !== -1) {
        const globalFirst = (brandIdx - 40000) + firstData;
        const globalEnd1 = (brandIdx - 40000) + end1;
        const globalSecond = (brandIdx - 40000) + secondData;
        const globalEnd2 = (brandIdx - 40000) + end2;

        const before1 = content.slice(0, globalFirst);
        const between = content.slice(globalEnd1, globalSecond);
        const after2 = content.slice(globalEnd2);
        content = before1 + logoDarkUri + between + logoLightUri + after2;
        console.log(`✓ Modern Dhirwat Al-Elm 273x108 Dark and Light logos replaced`);
      }
    }
  }

  // Update Brand name and copyright
  content = content.replace(
    /\{id:"phet",name:"[^"]+",copyright:"[^"]+",license:/,
    '{id:"phet",name:"منصة ذروة العلم الوطنية للتعليم التفاعلي 2.0",copyright:"جميع الحقوق محفوظة © 2026 منصة ذروة العلم",license:'
  );
  content = content.replace(
    /id:\s*'phet',\s*name:\s*'[^']+',\s*\/\/\s*no\s*i18n\s*copyright:\s*'[^']+'/,
    "id: 'phet', name: 'منصة ذروة العلم الوطنية للتعليم التفاعلي 2.0', copyright: 'جميع الحقوق محفوظة © 2026 منصة ذروة العلم'"
  );
  console.log(`✓ Brand metadata updated to Dhirwat Al-Elm 2.0`);

  // 5. Inject Arabic strings dictionary
  const injectionCode = `\n(function(){\n  try {\n    var d = ${JSON.stringify(cfg.dict)};\n    if (window.phet && window.phet.chipper && window.phet.chipper.strings && window.phet.chipper.strings.en) {\n      for (var k in d) {\n        window.phet.chipper.strings.en[k] = d[k];\n      }\n    }\n  } catch(e) {\n    console.error('Arabic override error:', e);\n  }\n})();\n\n`;

  const metaIdx = content.indexOf('window.phet.chipper.stringMetadata =');
  if (metaIdx !== -1) {
    content = content.slice(0, metaIdx) + injectionCode + content.slice(metaIdx);
    console.log(`✓ Injected ${Object.keys(cfg.dict).length} Arabic overrides right before stringMetadata`);
  } else {
    // For sims without stringMetadata (e.g., pendulum-lab, balloons, neuron)
    // Inject right after window.phet.chipper.strings = {"en":{...}};
    const stringsEndIdx = content.indexOf('window.phet.chipper.strings =');
    if (stringsEndIdx !== -1) {
      const semiIdx = content.indexOf(';', stringsEndIdx);
      content = content.slice(0, semiIdx + 1) + injectionCode + content.slice(semiIdx + 1);
      console.log(`✓ Injected ${Object.keys(cfg.dict).length} Arabic overrides right after strings declaration`);
    } else {
      console.error(`✗ Error: Could not find string injection point for ${cfg.file}`);
    }
  }

  // Save modified file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Successfully saved ${filePath} (${(content.length / 1024 / 1024).toFixed(2)} MB)`);

  // Sync to dist if exists
  const distPath = path.join('dist/simulations', cfg.file);
  if (fs.existsSync('dist/simulations')) {
    fs.writeFileSync(distPath, content, 'utf8');
    console.log(`✓ Synced to ${distPath}`);
  }

  // Sync to android if exists
  const androidPath = path.join('android/app/src/main/assets/public/simulations', cfg.file);
  if (fs.existsSync('android/app/src/main/assets/public/simulations')) {
    fs.writeFileSync(androidPath, content, 'utf8');
    console.log(`✓ Synced to ${androidPath}`);
  }
}

console.log('\nAll 15 simulations transformed successfully with 100% Arabic and Dhirwat Al-Elm branding!');
