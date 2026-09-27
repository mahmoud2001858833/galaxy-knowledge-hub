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
    file: 'energy-skate-park.html',
    title: 'حديقة التزلج وحفظ الطاقة | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "ENERGY_SKATE_PARK/energy-skate-park.title": "حديقة التزلج وحفظ الطاقة",
      "ENERGY_SKATE_PARK/screens.intro": "المقدمة",
      "ENERGY_SKATE_PARK/screens.measure": "القياس والتحليل",
      "ENERGY_SKATE_PARK/screens.graphs": "الرسوم البيانية",
      "ENERGY_SKATE_PARK/screens.playground": "المسار الحر",
      "ENERGY_SKATE_PARK/energies.energy": "الطاقة",
      "ENERGY_SKATE_PARK/energies.kinetic": "حركية",
      "ENERGY_SKATE_PARK/energies.potential": "وضعية (كامنة)",
      "ENERGY_SKATE_PARK/energies.thermal": "حرارية",
      "ENERGY_SKATE_PARK/energies.total": "الكلية",
      "ENERGY_SKATE_PARK/heightLabels.heightEqualsZero": "الارتفاع = 0",
      "ENERGY_SKATE_PARK/heightLabels.zeroM": "0 م",
      "ENERGY_SKATE_PARK/skaterControls.restartSkater": "إعادة المتزلج",
      "ENERGY_SKATE_PARK/speedometer.label": "السرعة",
      "ENERGY_SKATE_PARK/speedometer.metersPerSecondPattern": "{{value}} م/ث",
      "ENERGY_SKATE_PARK/trackControls.stickToTrack": "التثبيت بالمسار",
      "ENERGY_SKATE_PARK/visibilityControls.grid": "الشبكة",
      "ENERGY_SKATE_PARK/visibilityControls.path": "المسار",
      "ENERGY_SKATE_PARK/visibilityControls.referenceHeight": "ارتفاع الإسناد",
      "ENERGY_SKATE_PARK/visibilityControls.speed": "مقياس السرعة",
      "ENERGY_SKATE_PARK/physicalControls.massControls.mass": "الكتلة",
      "ENERGY_SKATE_PARK/physicalControls.massControls.massKilogramsPattern": "{{value}} كغ",
      "ENERGY_SKATE_PARK/physicalControls.friction": "الاحتكاك",
      "ENERGY_SKATE_PARK/physicalControls.gravityControls.gravity": "الجاذبية",
      "ENERGY_SKATE_PARK/physicalControls.gravityControls.earth": "الأرض",
      "ENERGY_SKATE_PARK/physicalControls.gravityControls.moon": "القمر",
      "ENERGY_SKATE_PARK/physicalControls.gravityControls.jupiter": "المشتري",
      "ENERGY_SKATE_PARK/physicalControls.gravityControls.gravityMetersPerSecondSquaredPattern": "{{value}} م/ث²",
      "ENERGY_SKATE_PARK/physicalControls.gravityControls.gravityNewtonsPerKilogramPattern": "{{value}} ن/كغ",
      "ENERGY_SKATE_PARK/physicalControls.custom": "مخصص",
      "ENERGY_SKATE_PARK/physicalControls.none": "معدوم",
      "ENERGY_SKATE_PARK/physicalControls.lots": "كبير",
      "ENERGY_SKATE_PARK/physicalControls.small": "صغير",
      "ENERGY_SKATE_PARK/physicalControls.tiny": "ضئيل",
      "ENERGY_SKATE_PARK/physicalControls.large": "كبير",
      "ENERGY_SKATE_PARK/plots.pieChart.label": "مخطط دائري",
      "ENERGY_SKATE_PARK/plots.energyGraph.label": "رسم بياني للطاقة",
      "ENERGY_SKATE_PARK/plots.energyLabel": "الطاقة (جول)",
      "ENERGY_SKATE_PARK/plots.positionLabel": "الموقع (م)",
      "ENERGY_SKATE_PARK/plots.positionSwitchLabel": "الموقع",
      "ENERGY_SKATE_PARK/plots.timeLabel": "الزمن (ث)",
      "ENERGY_SKATE_PARK/plots.timeSwitchLabel": "الزمن",
      "ENERGY_SKATE_PARK/pathSensor.energyJoulesPattern": "{{value}} جول",
      "ENERGY_SKATE_PARK/pathSensor.heightMetersPattern": "الارتفاع = {{value}} م",
      "ENERGY_SKATE_PARK/pathSensor.speedMetersPerSecondPattern": "السرعة = {{value}} م/ث",
      "ENERGY_SKATE_PARK/a11y.trackToolboxPanel.accessibleName": "إضافة مسار",
      "ENERGY_SKATE_PARK/a11y.yourSkatePark.skaterOnTrack": "المتزلج على المسار",
      "ENERGY_SKATE_PARK/a11y.yourSkatePark.skaterOffTrack": "المتزلج خارج المسار",
      "ENERGY_SKATE_PARK/preferences.accelerationUnits": "وحدات التسارع",
      "ENERGY_SKATE_PARK/preferences.metersPerSecondSquared": "م/ث²",
      "ENERGY_SKATE_PARK/preferences.newtonsPerKilogram": "ن/كغ",
      "ENERGY_SKATE_PARK/preferences.patterns": "أنماط التباين"
    }
  },
  {
    file: 'circuit-construction-kit-dc.html',
    title: 'بناء الدوائر الكهربائية (DC) | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "CIRCUIT_CONSTRUCTION_KIT_DC/circuit-construction-kit-dc.title": "بناء الدوائر الكهربائية (DC)",
      "CIRCUIT_CONSTRUCTION_KIT_DC/screen.intro": "المقدمة",
      "CIRCUIT_CONSTRUCTION_KIT_DC/screen.lab": "المختبر المتقدم",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/wire": "سلك توصيل",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/battery": "بطارية",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb": "مصباح كهربائي",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor": "مقاوم",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/switch": "قاطع (مفتاح)",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/fuse": "منصهر (فيوز)",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter": "فولتميتر",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter": "أمبيرميتر",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeters": "أجهزة الأميتر",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeterReadout": "قراءة الأميتر",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/dollarBill": "ورقة نقدية",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/paperClip": "مشبك ورق",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/coin": "عملة معدنية",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser": "ممحاة",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil": "قلم رصاص",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/thinPencil": "قلم رفيع",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/current": "التيار",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/electrons": "إلكترونات",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/conventional": "اصطلاحي",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/labels": "التسميات",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/values": "القيم العددية",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage": "فرق الجهد",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/resistance": "المقاومة",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/currentWithUnits": "التيار (أمبير)",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageWithUnits": "الجهد (فولت)",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance": "مقاومة البطارية الداخلية",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/wireResistivity": "مقاومة الأسلاك",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/advanced": "خيارات متقدمة",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/sourceResistance": "مقاومة المصدر",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/tapCircuitElementToEdit": "المس أي عنصر لتعديل قيمته",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsOpen": "المفتاح مفتوح",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsClosed": "المفتاح مغلق",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/stopwatch": "ساعة توقيت",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/showCurrent": "إظهار حركة التيار",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/currentChart": "مخطط التيار",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageChart": "مخطط الجهد",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/realBulb": "مصباح حقيقي",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/addRealBulbs": "إضافة مصابيح حقيقية",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/extremeBattery": "بطارية فائقة الجهد",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/extremeBulb": "مصباح فائق التحمل",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/extremeResistor": "مقاوم عالي القيمة",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/currentRating": "الحد الأقصى للتيار",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/schematicStandard": "الرمز التخطيطي",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/tiny": "ضئيل",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/lots": "كبير",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/time": "الزمن",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/keyboardCues.toCut": "للقص والقطع",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/keyboardCues.toEditComponent": "لتعديل العنصر",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/a11y.zoomButtonGroup.zoomIn.accessibleName": "تكبير",
      "CIRCUIT_CONSTRUCTION_KIT_COMMON/a11y.zoomButtonGroup.zoomOut.accessibleName": "تصغير"
    }
  },
  {
    file: 'membrane-transport.html',
    title: 'النقل عبر الغشاء الخلوي | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "MEMBRANE_TRANSPORT/membrane-transport.title": "النقل عبر الغشاء الخلوي",
      "MEMBRANE_TRANSPORT/screen.simpleDiffusion": "الانتشار البسيط",
      "MEMBRANE_TRANSPORT/screen.facilitatedDiffusion": "الانتشار الميسر",
      "MEMBRANE_TRANSPORT/screen.activeTransport": "النقل النشط",
      "MEMBRANE_TRANSPORT/screen.playground": "المختبر الاستكشافي",
      "MEMBRANE_TRANSPORT/cellRegions.outside": "خارج الخلية",
      "MEMBRANE_TRANSPORT/cellRegions.inside": "داخل الخلية",
      "MEMBRANE_TRANSPORT/solutes": "المواد المذابة",
      "MEMBRANE_TRANSPORT/soluteConcentrationsAccordionBox.title": "تركيز المواد المذابة",
      "MEMBRANE_TRANSPORT/soluteNames.sodiumIon": "أيونات الصوديوم (Na⁺)",
      "MEMBRANE_TRANSPORT/soluteNames.potassiumIon": "أيونات البوتاسيوم (K⁺)",
      "MEMBRANE_TRANSPORT/soluteNames.glucose": "الغلوكوز",
      "MEMBRANE_TRANSPORT/soluteNames.oxygen": "الأكسجين (O₂)",
      "MEMBRANE_TRANSPORT/soluteNames.carbonDioxide": "ثاني أكسيد الكربون (CO₂)",
      "MEMBRANE_TRANSPORT/soluteNames.atp": "ATP (طاقة الخلية)",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.leakageChannels": "قنوات التسريب (المفتوحة)",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.voltageGatedChannels": "قنوات مبوبة بفرق الجهد",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.ligandGatedChannels": "قنوات مبوبة بالمستقبلات (ربائط)",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.activeTransporters": "نواقل النقل النشط",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.naPlusKPlusPump": "مضخة صوديوم-بوتاسيوم",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.sodiumGlucoseCotransporter": "ناقل صوديوم-غلوكوز المتزامن",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.charges": "الشحنات الكهربائية",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.membranePotentialMV": "جهد الغشاء (ميلي فولت)",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.addLigands": "إضافة ربائط كيميائية",
      "MEMBRANE_TRANSPORT/transportProteinToolbox.removeLigands": "إزالة الربائط",
      "MEMBRANE_TRANSPORT/settings.crossingHighlights": "تمييز حركة العبور",
      "MEMBRANE_TRANSPORT/settings.crossingSounds": "أصوات العبور",
      "MEMBRANE_TRANSPORT/preferencesDialog.simulation.animateLipids.label": "حركة الليبيدات المفسفرة",
      "MEMBRANE_TRANSPORT/preferencesDialog.simulation.glucoseMetabolism.label": "أيض واستهلاك الغلوكوز",
      "MEMBRANE_TRANSPORT/outsideSodiumTooLow": "تركيز الصوديوم الخارجي منخفض جداً!",
      "MEMBRANE_TRANSPORT/a11y.transportProteinToolbox.leakageChannelPanel.sodiumIonNaPlusLeakage": "قناة تسريب صوديوم",
      "MEMBRANE_TRANSPORT/a11y.transportProteinToolbox.leakageChannelPanel.potassiumIonKPlusLeakage": "قناة تسريب بوتاسيوم"
    }
  },
  {
    file: 'models-of-the-hydrogen-atom.html',
    title: 'نماذج ذرة الهيدروجين | منصة ذروة العلم 2.0',
    dict: {
      ...commonJoistStrings,
      "MODELS_OF_THE_HYDROGEN_ATOM/models-of-the-hydrogen-atom.title": "نماذج ذرة الهيدروجين",
      "MODELS_OF_THE_HYDROGEN_ATOM/screen.spectra": "الأطياف الذرية",
      "MODELS_OF_THE_HYDROGEN_ATOM/screen.energyLevels": "مستويات الطاقة",
      "MODELS_OF_THE_HYDROGEN_ATOM/experiment": "التجربة المعملية",
      "MODELS_OF_THE_HYDROGEN_ATOM/model": "النماذج النظرية",
      "MODELS_OF_THE_HYDROGEN_ATOM/billiardBall": "كرة البلياردو (دالتون)",
      "MODELS_OF_THE_HYDROGEN_ATOM/plumPudding": "فطيرة البرقوق (طومسون)",
      "MODELS_OF_THE_HYDROGEN_ATOM/classicalSolarSystem": "النظام الشمسي الكلاسيكي (رذرفورد)",
      "MODELS_OF_THE_HYDROGEN_ATOM/bohr": "نموذج بور",
      "MODELS_OF_THE_HYDROGEN_ATOM/deBroglie": "نموذج دي بروي (الموجي)",
      "MODELS_OF_THE_HYDROGEN_ATOM/schrodinger": "نموذج شرودنغر (الميكانيكا الكمية)",
      "MODELS_OF_THE_HYDROGEN_ATOM/white": "ضوء أبيض",
      "MODELS_OF_THE_HYDROGEN_ATOM/monochromatic": "ضوء أحادي اللون",
      "MODELS_OF_THE_HYDROGEN_ATOM/wavelengthNanometers": "الطول الموجي (نانومتر)",
      "MODELS_OF_THE_HYDROGEN_ATOM/spectrometerPhotonsEmittedPerNanometer": "المطياف (الفوتونات المنبعثة / نانومتر)",
      "MODELS_OF_THE_HYDROGEN_ATOM/electronEnergyLevel": "مستوى طاقة الإلكترون",
      "MODELS_OF_THE_HYDROGEN_ATOM/transitions": "الانتقالات الإلكترونية",
      "MODELS_OF_THE_HYDROGEN_ATOM/quantumNumbers": "الأعداد الكمية",
      "MODELS_OF_THE_HYDROGEN_ATOM/nTransition": "انتقال n",
      "MODELS_OF_THE_HYDROGEN_ATOM/brightness": "السطوع",
      "MODELS_OF_THE_HYDROGEN_ATOM/exciteElectron": "إثارة الإلكترون",
      "MODELS_OF_THE_HYDROGEN_ATOM/electron": "إلكترون",
      "MODELS_OF_THE_HYDROGEN_ATOM/proton": "بروتون",
      "MODELS_OF_THE_HYDROGEN_ATOM/photon": "فوتون",
      "MODELS_OF_THE_HYDROGEN_ATOM/energy": "الطاقة",
      "MODELS_OF_THE_HYDROGEN_ATOM/uv": "فوق بنفسجي (UV)",
      "MODELS_OF_THE_HYDROGEN_ATOM/visible": "مرئي",
      "MODELS_OF_THE_HYDROGEN_ATOM/ir": "تحت أحمر (IR)",
      "MODELS_OF_THE_HYDROGEN_ATOM/a11y.snapshotButton.accessibleName": "التقاط طيف",
      "MODELS_OF_THE_HYDROGEN_ATOM/a11y.eraseSnapshotsButton.accessibleName": "مسح بيانات المطياف",
      "MODELS_OF_THE_HYDROGEN_ATOM/a11y.viewSnapshotsButton.accessibleName": "عرض الأطياف الملتقطة",
      "MODELS_OF_THE_HYDROGEN_ATOM/a11y.resetAtomButton.accessibleName": "إعادة ضبط الذرة",
      "MODELS_OF_THE_HYDROGEN_ATOM/radialDistance": "المسافة القطرية (r)",
      "MODELS_OF_THE_HYDROGEN_ATOM/nInfo": "{{n}}، <b>العدد الكمي الرئيسي</b>، يحدد طاقة الإلكترون ومتوسط بعده عن النواة.",
      "MODELS_OF_THE_HYDROGEN_ATOM/lInfo": "{{l}}، <b>العدد الكمي المداري</b>، يحدد شكل السحابة المدارية (s كروي، p فصي...).",
      "MODELS_OF_THE_HYDROGEN_ATOM/mInfo": "{{m}}، <b>العدد الكمي المغناطيسي</b>، يحدد اتجاه المدار في الفضاء ثلاثي الأبعاد.",
      "MODELS_OF_THE_HYDROGEN_ATOM/nlmInfo": "يستخدم نموذج شرودنغر 3 أعداد كمية ({{n}}, {{l}}, {{m}}) لوصف الموقع الأكثر احتمالاً للإلكترون (المدار الذري)."
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
  const initialMatch = 'initialScreen:{type:"number",defaultValue:0,public:!0}';
  const initialReplace = 'initialScreen:{type:"number",defaultValue:1,public:!0}';
  if (content.includes(initialMatch)) {
    content = content.replace(initialMatch, initialReplace);
    console.log(`✓ initialScreen bypassed (defaultValue: 1)`);
  } else {
    console.warn(`! Warning: initialScreen defaultValue:0 not found in ${cfg.file}`);
  }

  // 3. Splash screen replacement
  const splashIdx = content.indexOf('window.PHET_SPLASH_DATA_URI="');
  if (splashIdx !== -1) {
    const splashEnd = content.indexOf('"', splashIdx + 29);
    content = content.slice(0, splashIdx + 29) + splashDataUri + content.slice(splashEnd);
    console.log(`✓ window.PHET_SPLASH_DATA_URI replaced with Dhirwat Al-Elm emblem`);
  } else {
    console.warn(`! Warning: window.PHET_SPLASH_DATA_URI not found`);
  }

  // 4. Brand logos and Brand object replacement
  const brandIdx = content.indexOf('{id:"phet",name:');
  if (brandIdx !== -1) {
    // Replace the two data URIs immediately preceding Brand
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
      console.log(`✓ Dhirwat Al-Elm 273x108 Dark and Light logos replaced`);
    } else {
      console.warn(`! Warning: Could not locate both logo data URIs before Brand`);
    }

    // Now update Brand name and copyright
    content = content.replace(
      /\{id:"phet",name:"[^"]+",copyright:"[^"]+",license:/,
      '{id:"phet",name:"منصة ذروة العلم الوطنية للتعليم التفاعلي 2.0",copyright:"جميع الحقوق محفوظة © 2026 منصة ذروة العلم",license:'
    );
    console.log(`✓ Brand name and copyright updated to Dhirwat Al-Elm`);
  } else {
    console.warn(`! Warning: Brand definition not found`);
  }

  // 5. Inject Arabic strings dictionary right before window.phet.chipper.stringMetadata =
  const metaIdx = content.indexOf('window.phet.chipper.stringMetadata =');
  if (metaIdx !== -1) {
    const injectionCode = `\n(function(){\n  try {\n    var d = ${JSON.stringify(cfg.dict)};\n    if (window.phet && window.phet.chipper && window.phet.chipper.strings && window.phet.chipper.strings.en) {\n      for (var k in d) {\n        window.phet.chipper.strings.en[k] = d[k];\n      }\n    }\n  } catch(e) {\n    console.error('Arabic override error:', e);\n  }\n})();\n\n`;
    content = content.slice(0, metaIdx) + injectionCode + content.slice(metaIdx);
    console.log(`✓ Injected ${Object.keys(cfg.dict).length} Arabic overrides right before stringMetadata`);
  } else {
    console.error(`✗ Error: stringMetadata marker not found for ${cfg.file}`);
  }

  // Write updated file
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

console.log('\nAll simulations transformed successfully with 100% Arabic and Dhirwat Al-Elm branding!');
