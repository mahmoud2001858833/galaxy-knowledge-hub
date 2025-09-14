import { Car, Bike, Bus, Train, Plane, Zap, Flame, Droplets, AirVent, Refrigerator, Shirt, Utensils, Trash2, TreePine, Home, Package, Heart, Hammer, Lightbulb, Monitor, Printer, ShoppingCart, Coffee, Phone, Laptop, Tv } from 'lucide-react';
import { ModuleData } from './CalculationModule';

export const calculationModules: ModuleData[] = [
  // Transportation
  {
    id: 'private-car',
    title: 'السيارة الخاصة',
    description: 'انبعاثات السيارة الشخصية حسب نوع الوقود والمسافة',
    category: 'Transport',
    icon: Car,
    inputs: [
      {
        id: 'distance',
        label: 'المسافة الأسبوعية',
        type: 'number',
        unit: 'كم',
        placeholder: '200',
        required: true
      },
      {
        id: 'fuelType',
        label: 'نوع الوقود',
        type: 'select',
        options: ['بنزين', 'ديزل', 'هجين', 'كهربائي'],
        required: true
      },
      {
        id: 'efficiency',
        label: 'استهلاك الوقود',
        type: 'number',
        unit: 'لتر/100كم',
        placeholder: '8',
        required: true
      }
    ],
    formula: 'المسافة × الاستهلاك × معامل الانبعاث × 52',
    emissionFactor: 2.31,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'motorcycle',
    title: 'الدراجة النارية',
    description: 'انبعاثات الدراجة النارية والسكوتر',
    category: 'Transport',
    icon: Bike,
    inputs: [
      {
        id: 'distance',
        label: 'المسافة الأسبوعية',
        type: 'number',
        unit: 'كم',
        placeholder: '100',
        required: true
      },
      {
        id: 'engineSize',
        label: 'حجم المحرك',
        type: 'select',
        options: ['أقل من 125 سي سي', '125-250 سي سي', '250-500 سي سي', 'أكثر من 500 سي سي'],
        required: true
      }
    ],
    formula: 'المسافة × معامل الانبعاث × 52',
    emissionFactor: 0.12,
    unit: 'كج CO₂e',
    source: 'بروتوكول غازات الدفيئة',
    sourceUrl: 'https://ghgprotocol.org/'
  },
  {
    id: 'taxi',
    title: 'التاكسي وخدمات النقل',
    description: 'انبعاثات استخدام التاكسي وخدمات النقل التشاركي',
    category: 'Transport',
    icon: Car,
    inputs: [
      {
        id: 'tripsPerWeek',
        label: 'عدد الرحلات أسبوعياً',
        type: 'number',
        unit: 'رحلة',
        placeholder: '5',
        required: true
      },
      {
        id: 'averageDistance',
        label: 'متوسط المسافة للرحلة الواحدة',
        type: 'number',
        unit: 'كم',
        placeholder: '10',
        required: true
      }
    ],
    formula: 'عدد الرحلات × المسافة × معامل الانبعاث × 52',
    emissionFactor: 0.21,
    unit: 'كج CO₂e',
    source: 'وكالة حماية البيئة الأمريكية',
    sourceUrl: 'https://www.epa.gov/ghgemissions'
  },
  {
    id: 'local-bus',
    title: 'الحافلة المحلية',
    description: 'انبعاثات استخدام الحافلات داخل المدينة',
    category: 'Transport',
    icon: Bus,
    inputs: [
      {
        id: 'tripsPerWeek',
        label: 'عدد الرحلات أسبوعياً',
        type: 'number',
        unit: 'رحلة',
        placeholder: '10',
        required: true
      },
      {
        id: 'averageDistance',
        label: 'متوسط المسافة للرحلة الواحدة',
        type: 'number',
        unit: 'كم',
        placeholder: '15',
        required: true
      }
    ],
    formula: 'عدد الرحلات × المسافة × معامل الانبعاث × 52',
    emissionFactor: 0.08,
    unit: 'كج CO₂e',
    source: 'الاتحاد الدولي للنقل العام',
    sourceUrl: 'https://www.uitp.org/'
  },
  {
    id: 'intercity-bus',
    title: 'الحافلة بين المدن',
    description: 'انبعاثات الحافلات للمسافات الطويلة',
    category: 'Transport',
    icon: Bus,
    inputs: [
      {
        id: 'tripsPerYear',
        label: 'عدد الرحلات سنوياً',
        type: 'number',
        unit: 'رحلة',
        placeholder: '12',
        required: true
      },
      {
        id: 'averageDistance',
        label: 'متوسط المسافة للرحلة الواحدة',
        type: 'number',
        unit: 'كم',
        placeholder: '300',
        required: true
      }
    ],
    formula: 'عدد الرحلات × المسافة × معامل الانبعاث',
    emissionFactor: 0.06,
    unit: 'كج CO₂e',
    source: 'بروتوكول غازات الدفيئة',
    sourceUrl: 'https://ghgprotocol.org/'
  },
  {
    id: 'train-travel',
    title: 'السفر بالقطار',
    description: 'انبعاثات القطارات المحلية وبين المدن',
    category: 'Transport',
    icon: Train,
    inputs: [
      {
        id: 'tripsPerYear',
        label: 'عدد الرحلات سنوياً',
        type: 'number',
        unit: 'رحلة',
        placeholder: '20',
        required: true
      },
      {
        id: 'averageDistance',
        label: 'متوسط المسافة للرحلة الواحدة',
        type: 'number',
        unit: 'كم',
        placeholder: '150',
        required: true
      },
      {
        id: 'trainType',
        label: 'نوع القطار',
        type: 'select',
        options: ['قطار محلي', 'قطار سريع', 'قطار كهربائي'],
        required: true
      }
    ],
    formula: 'عدد الرحلات × المسافة × معامل الانبعاث',
    emissionFactor: 0.04,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'domestic-flights',
    title: 'الطيران المحلي',
    description: 'انبعاثات الرحلات الجوية قصيرة ومتوسطة المدى',
    category: 'Transport',
    icon: Plane,
    inputs: [
      {
        id: 'flightsPerYear',
        label: 'عدد الرحلات سنوياً',
        type: 'number',
        unit: 'رحلة',
        placeholder: '4',
        required: true
      },
      {
        id: 'flightType',
        label: 'نوع الرحلة',
        type: 'select',
        options: ['قصيرة المدى (أقل من 1500كم)', 'متوسطة المدى (1500-4000كم)', 'طويلة المدى (أكثر من 4000كم)'],
        required: true
      }
    ],
    formula: 'عدد الرحلات × معامل الانبعاث',
    emissionFactor: 255,
    unit: 'كج CO₂e',
    source: 'منظمة الطيران المدني الدولي',
    sourceUrl: 'https://www.icao.int/'
  },
  {
    id: 'international-flights',
    title: 'الطيران الدولي',
    description: 'انبعاثات الرحلات الجوية الدولية الطويلة',
    category: 'Transport',
    icon: Plane,
    inputs: [
      {
        id: 'flightsPerYear',
        label: 'عدد الرحلات سنوياً',
        type: 'number',
        unit: 'رحلة',
        placeholder: '2',
        required: true
      },
      {
        id: 'averageDistance',
        label: 'متوسط المسافة للرحلة الواحدة',
        type: 'number',
        unit: 'كم',
        placeholder: '8000',
        required: true
      },
      {
        id: 'classType',
        label: 'درجة السفر',
        type: 'select',
        options: ['اقتصادية', 'رجال أعمال', 'درجة أولى'],
        required: true
      }
    ],
    formula: 'عدد الرحلات × المسافة × معامل الانبعاث',
    emissionFactor: 0.25,
    unit: 'كج CO₂e',
    source: 'منظمة الطيران المدني الدولي',
    sourceUrl: 'https://www.icao.int/'
  },

  // Energy
  {
    id: 'electricity',
    title: 'استهلاك الكهرباء',
    description: 'انبعاثات استهلاك الكهرباء المنزلي',
    category: 'Energy',
    icon: Zap,
    inputs: [
      {
        id: 'monthlyUsage',
        label: 'الاستهلاك الشهري',
        type: 'number',
        unit: 'كيلو واط ساعة',
        placeholder: '500',
        required: true
      },
      {
        id: 'gridType',
        label: 'نوع الشبكة',
        type: 'select',
        options: ['شبكة عادية', 'طاقة متجددة جزئياً', 'طاقة متجددة بالكامل'],
        required: true
      }
    ],
    formula: 'الاستهلاك الشهري × 12 × معامل الانبعاث',
    emissionFactor: 0.5,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'heating-fuel',
    title: 'وقود التدفئة',
    description: 'انبعاثات الغاز الطبيعي وزيت التدفئة والغاز المسال',
    category: 'Energy',
    icon: Flame,
    inputs: [
      {
        id: 'fuelType',
        label: 'نوع الوقود',
        type: 'select',
        options: ['غاز طبيعي', 'زيت التدفئة', 'غاز مسال', 'الخشب'],
        required: true
      },
      {
        id: 'monthlyUsage',
        label: 'الاستهلاك الشهري',
        type: 'number',
        unit: 'لتر/م³',
        placeholder: '200',
        required: true
      },
      {
        id: 'heatingMonths',
        label: 'عدد أشهر التدفئة',
        type: 'number',
        unit: 'شهر',
        placeholder: '6',
        required: true
      }
    ],
    formula: 'الاستهلاك الشهري × أشهر التدفئة × معامل الانبعاث',
    emissionFactor: 2.0,
    unit: 'كج CO₂e',
    source: 'بروتوكول غازات الدفيئة',
    sourceUrl: 'https://ghgprotocol.org/'
  },
  {
    id: 'cooking-gas',
    title: 'غاز الطبخ',
    description: 'انبعاثات الغاز المسال المستخدم في الطبخ',
    category: 'Energy',
    icon: Flame,
    inputs: [
      {
        id: 'monthlyUsage',
        label: 'الاستهلاك الشهري',
        type: 'number',
        unit: 'كج',
        placeholder: '12',
        required: true
      },
      {
        id: 'efficiency',
        label: 'كفاءة الموقد',
        type: 'select',
        options: ['عادي', 'موفر للطاقة', 'عالي الكفاءة'],
        required: true
      }
    ],
    formula: 'الاستهلاك الشهري × 12 × معامل الانبعاث',
    emissionFactor: 3.0,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'water-heating',
    title: 'تسخين المياه',
    description: 'انبعاثات تسخين المياه بالكهرباء أو الغاز',
    category: 'Energy',
    icon: Droplets,
    inputs: [
      {
        id: 'heaterType',
        label: 'نوع السخان',
        type: 'select',
        options: ['سخان كهربائي', 'سخان غاز', 'سخان شمسي'],
        required: true
      },
      {
        id: 'dailyUsage',
        label: 'الاستخدام اليومي',
        type: 'number',
        unit: 'لتر',
        placeholder: '150',
        required: true
      },
      {
        id: 'temperature',
        label: 'درجة حرارة المياه',
        type: 'select',
        options: ['40°م', '50°م', '60°م', '70°م'],
        required: true
      }
    ],
    formula: 'الاستخدام اليومي × 365 × معامل الانبعاث',
    emissionFactor: 0.5,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'air-conditioning',
    title: 'التكييف والتبريد',
    description: 'انبعاثات أجهزة التكييف والتبريد',
    category: 'Energy',
    icon: AirVent,
    inputs: [
      {
        id: 'hoursPerDay',
        label: 'ساعات التشغيل يومياً',
        type: 'number',
        unit: 'ساعة',
        placeholder: '8',
        required: true
      },
      {
        id: 'power',
        label: 'قدرة الجهاز',
        type: 'number',
        unit: 'كيلو واط',
        placeholder: '2.5',
        required: true
      },
      {
        id: 'coolingMonths',
        label: 'عدد أشهر التبريد',
        type: 'number',
        unit: 'شهر',
        placeholder: '6',
        required: true
      }
    ],
    formula: 'ساعات التشغيل × القدرة × أشهر التبريد × 30 × معامل الانبعاث',
    emissionFactor: 0.5,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'refrigerator',
    title: 'الثلاجة',
    description: 'انبعاثات استهلاك الثلاجة للكهرباء',
    category: 'Energy',
    icon: Refrigerator,
    inputs: [
      {
        id: 'age',
        label: 'عمر الثلاجة',
        type: 'select',
        options: ['أقل من 5 سنوات', '5-10 سنوات', '10-15 سنة', 'أكثر من 15 سنة'],
        required: true
      },
      {
        id: 'size',
        label: 'حجم الثلاجة',
        type: 'select',
        options: ['صغيرة (أقل من 200 لتر)', 'متوسطة (200-400 لتر)', 'كبيرة (أكثر من 400 لتر)'],
        required: true
      },
      {
        id: 'efficiency',
        label: 'تصنيف الطاقة',
        type: 'select',
        options: ['A+++', 'A++', 'A+', 'A', 'B', 'C'],
        required: true
      }
    ],
    formula: 'استهلاك يومي مقدر × 365 × معامل الانبعاث',
    emissionFactor: 200,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },

  // Food
  {
    id: 'food-consumption',
    title: 'استهلاك الطعام',
    description: 'انبعاثات أنواع الأطعمة المختلفة',
    category: 'Food',
    icon: Utensils,
    inputs: [
      {
        id: 'beefMeals',
        label: 'وجبات اللحم الأحمر أسبوعياً',
        type: 'number',
        unit: 'وجبة',
        placeholder: '3',
        required: true
      },
      {
        id: 'chickenMeals',
        label: 'وجبات الدجاج أسبوعياً',
        type: 'number',
        unit: 'وجبة',
        placeholder: '4',
        required: true
      },
      {
        id: 'fishMeals',
        label: 'وجبات السمك أسبوعياً',
        type: 'number',
        unit: 'وجبة',
        placeholder: '2',
        required: true
      },
      {
        id: 'dairyServings',
        label: 'الحصص اليومية من الألبان',
        type: 'number',
        unit: 'حصة',
        placeholder: '3',
        required: true
      },
      {
        id: 'plantMeals',
        label: 'الوجبات النباتية أسبوعياً',
        type: 'number',
        unit: 'وجبة',
        placeholder: '10',
        required: true
      }
    ],
    formula: 'مجموع الوجبات × معامل الانبعاث لكل نوع × 52',
    emissionFactor: 1.5,
    unit: 'كج CO₂e',
    source: 'منظمة الأغذية والزراعة',
    sourceUrl: 'https://www.fao.org/'
  },
  {
    id: 'food-waste',
    title: 'هدر الطعام',
    description: 'انبعاثات الطعام المهدر شهرياً',
    category: 'Food',
    icon: Trash2,
    inputs: [
      {
        id: 'wasteAmount',
        label: 'كمية الطعام المهدر شهرياً',
        type: 'number',
        unit: 'كج',
        placeholder: '10',
        required: true
      },
      {
        id: 'wasteType',
        label: 'نوع الهدر الأكثر',
        type: 'select',
        options: ['خضار وفواكه', 'خبز وحبوب', 'لحوم', 'ألبان', 'مختلط'],
        required: true
      }
    ],
    formula: 'كمية الهدر الشهري × 12 × معامل الانبعاث',
    emissionFactor: 2.5,
    unit: 'كج CO₂e',
    source: 'منظمة الأغذية والزراعة',
    sourceUrl: 'https://www.fao.org/'
  },

  // Consumption
  {
    id: 'clothing',
    title: 'شراء الملابس',
    description: 'انبعاثات شراء الملابس الجديدة',
    category: 'Consumption',
    icon: Shirt,
    inputs: [
      {
        id: 'clothingSpend',
        label: 'الإنفاق السنوي على الملابس',
        type: 'number',
        unit: 'ريال',
        placeholder: '2000',
        required: true
      },
      {
        id: 'clothingType',
        label: 'نوع الملابس الأكثر شراءً',
        type: 'select',
        options: ['ملابس قطنية', 'ملابس صناعية', 'ملابس جلدية', 'مختلط'],
        required: true
      }
    ],
    formula: 'الإنفاق السنوي × معامل الانبعاث',
    emissionFactor: 0.01,
    unit: 'كج CO₂e',
    source: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/'
  },
  {
    id: 'electronics',
    title: 'الأجهزة الإلكترونية',
    description: 'انبعاثات شراء الأجهزة الإلكترونية',
    category: 'Consumption',
    icon: Package,
    inputs: [
      {
        id: 'phoneFrequency',
        label: 'تكرار شراء الهاتف',
        type: 'select',
        options: ['كل سنة', 'كل سنتين', 'كل 3 سنوات', 'كل 4+ سنوات'],
        required: true
      },
      {
        id: 'laptopFrequency',
        label: 'تكرار شراء الحاسوب',
        type: 'select',
        options: ['كل سنة', 'كل سنتين', 'كل 3 سنوات', 'كل 4+ سنوات'],
        required: true
      },
      {
        id: 'applianceSpend',
        label: 'الإنفاق السنوي على الأجهزة الأخرى',
        type: 'number',
        unit: 'ريال',
        placeholder: '1000',
        required: true
      }
    ],
    formula: 'مجموع الأجهزة × معامل الانبعاث السنوي',
    emissionFactor: 50,
    unit: 'كج CO₂e',
    source: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/'
  },

  // Water & Waste
  {
    id: 'water-use',
    title: 'استهلاك المياه',
    description: 'انبعاثات معالجة وضخ المياه',
    category: 'Water',
    icon: Droplets,
    inputs: [
      {
        id: 'monthlyUsage',
        label: 'الاستهلاك الشهري',
        type: 'number',
        unit: 'متر مكعب',
        placeholder: '15',
        required: true
      },
      {
        id: 'waterSource',
        label: 'مصدر المياه',
        type: 'select',
        options: ['شبكة المدينة', 'بئر خاص', 'محطة تحلية', 'مياه معبأة'],
        required: true
      }
    ],
    formula: 'الاستهلاك الشهري × 12 × معامل الانبعاث',
    emissionFactor: 0.3,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'waste-generation',
    title: 'إنتاج النفايات',
    description: 'انبعاثات النفايات ومعدل إعادة التدوير',
    category: 'Waste',
    icon: Trash2,
    inputs: [
      {
        id: 'weeklyWaste',
        label: 'كمية النفايات الأسبوعية',
        type: 'number',
        unit: 'كج',
        placeholder: '20',
        required: true
      },
      {
        id: 'recyclingRate',
        label: 'معدل إعادة التدوير',
        type: 'select',
        options: ['0%', '25%', '50%', '75%', '90%+'],
        required: true
      },
      {
        id: 'compostingRate',
        label: 'معدل التسميد',
        type: 'select',
        options: ['0%', '25%', '50%', '75%', '90%+'],
        required: true
      }
    ],
    formula: 'النفايات الأسبوعية × 52 × معامل الانبعاث',
    emissionFactor: 0.5,
    unit: 'كج CO₂e',
    source: 'وكالة حماية البيئة الأمريكية',
    sourceUrl: 'https://www.epa.gov/'
  },

  // Home & Garden
  {
    id: 'home-size',
    title: 'حجم المنزل',
    description: 'انبعاثات التدفئة والتبريد حسب مساحة المنزل',
    category: 'Energy',
    icon: Home,
    inputs: [
      {
        id: 'floorArea',
        label: 'المساحة الإجمالية',
        type: 'number',
        unit: 'متر مربع',
        placeholder: '150',
        required: true
      },
      {
        id: 'homeAge',
        label: 'عمر المبنى',
        type: 'select',
        options: ['أقل من 10 سنوات', '10-20 سنة', '20-50 سنة', 'أكثر من 50 سنة'],
        required: true
      },
      {
        id: 'insulation',
        label: 'مستوى العزل',
        type: 'select',
        options: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'],
        required: true
      }
    ],
    formula: 'المساحة × معامل الانبعاث × معامل العمر والعزل',
    emissionFactor: 20,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'garden-care',
    title: 'العناية بالحديقة',
    description: 'انبعاثات جز العشب واستخدام الأسمدة',
    category: 'Other',
    icon: TreePine,
    inputs: [
      {
        id: 'gardenSize',
        label: 'مساحة الحديقة',
        type: 'number',
        unit: 'متر مربع',
        placeholder: '100',
        required: true
      },
      {
        id: 'mowingFrequency',
        label: 'تكرار جز العشب',
        type: 'select',
        options: ['أسبوعياً', 'كل أسبوعين', 'شهرياً', 'نادراً'],
        required: true
      },
      {
        id: 'mowerType',
        label: 'نوع الجزازة',
        type: 'select',
        options: ['يدوية', 'كهربائية', 'بنزين', 'بطارية'],
        required: true
      },
      {
        id: 'fertilizerUse',
        label: 'استخدام الأسمدة الكيماوية',
        type: 'select',
        options: ['لا أستخدم', 'قليل', 'متوسط', 'كثير'],
        required: true
      }
    ],
    formula: 'مساحة الحديقة × معامل الانبعاث × معامل الاستخدام',
    emissionFactor: 0.5,
    unit: 'كج CO₂e',
    source: 'وكالة حماية البيئة الأمريكية',
    sourceUrl: 'https://www.epa.gov/'
  },
  {
    id: 'pet-ownership',
    title: 'تربية الحيوانات الأليفة',
    description: 'انبعاثات طعام ونفايات الحيوانات الأليفة',
    category: 'Other',
    icon: Heart,
    inputs: [
      {
        id: 'petType',
        label: 'نوع الحيوان الأليف',
        type: 'select',
        options: ['قط صغير', 'قط كبير', 'كلب صغير', 'كلب متوسط', 'كلب كبير', 'طيور', 'أخرى'],
        required: true
      },
      {
        id: 'petCount',
        label: 'عدد الحيوانات',
        type: 'number',
        unit: 'حيوان',
        placeholder: '1',
        required: true
      },
      {
        id: 'foodType',
        label: 'نوع الطعام',
        type: 'select',
        options: ['طعام جاف تجاري', 'طعام رطب تجاري', 'طعام منزلي', 'مختلط'],
        required: true
      }
    ],
    formula: 'عدد الحيوانات × معامل الانبعاث السنوي',
    emissionFactor: 300,
    unit: 'كج CO₂e',
    source: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/'
  },
  {
    id: 'shipping-deliveries',
    title: 'الشحن والتوصيل',
    description: 'انبعاثات التسوق الإلكتروني والتوصيل',
    category: 'Transport',
    icon: Package,
    inputs: [
      {
        id: 'ordersPerMonth',
        label: 'عدد الطلبات شهرياً',
        type: 'number',
        unit: 'طلب',
        placeholder: '5',
        required: true
      },
      {
        id: 'averageWeight',
        label: 'متوسط وزن الطلب',
        type: 'number',
        unit: 'كج',
        placeholder: '2',
        required: true
      },
      {
        id: 'deliveryType',
        label: 'نوع التوصيل',
        type: 'select',
        options: ['توصيل عادي', 'توصيل سريع', 'توصيل في نفس اليوم'],
        required: true
      }
    ],
    formula: 'عدد الطلبات × الوزن × معامل الانبعاث × 12',
    emissionFactor: 0.5,
    unit: 'كج CO₂e',
    source: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/'
  },
  
  // Additional Consumption & Technology modules
  {
    id: 'digital-devices',
    title: 'الأجهزة الرقمية',
    description: 'انبعاثات استخدام الحاسوب والهاتف والتلفزيون',
    category: 'Consumption',
    icon: Monitor,
    inputs: [
      {
        id: 'computerHours',
        label: 'ساعات استخدام الحاسوب يومياً',
        type: 'number',
        unit: 'ساعة',
        placeholder: '6',
        required: true
      },
      {
        id: 'tvHours',
        label: 'ساعات مشاهدة التلفزيون يومياً',
        type: 'number',
        unit: 'ساعة',
        placeholder: '3',
        required: true
      },
      {
        id: 'phoneCharging',
        label: 'عدد مرات شحن الهاتف يومياً',
        type: 'number',
        unit: 'مرة',
        placeholder: '1',
        required: true
      }
    ],
    formula: 'إجمالي الاستهلاك × 365 × معامل الانبعاث',
    emissionFactor: 0.4,
    unit: 'كج CO₂e',
    source: 'وكالة الطاقة الدولية',
    sourceUrl: 'https://www.iea.org/'
  },
  {
    id: 'coffee-consumption',
    title: 'استهلاك القهوة',
    description: 'انبعاثات إنتاج ونقل القهوة',
    category: 'Food',
    icon: Coffee,
    inputs: [
      {
        id: 'cupsPerDay',
        label: 'عدد أكواب القهوة يومياً',
        type: 'number',
        unit: 'كوب',
        placeholder: '3',
        required: true
      },
      {
        id: 'coffeeType',
        label: 'نوع القهوة',
        type: 'select',
        options: ['قهوة عادية', 'قهوة إسبريسو', 'قهوة بالحليب', 'قهوة سريعة التحضير'],
        required: true
      }
    ],
    formula: 'عدد الأكواب × 365 × معامل الانبعاث',
    emissionFactor: 0.125,
    unit: 'كج CO₂e',
    source: 'منظمة القهوة العالمية',
    sourceUrl: 'https://www.ico.org/'
  },
  {
    id: 'mobile-phone-usage',
    title: 'استخدام الهاتف المحمول',
    description: 'انبعاثات شبكات الاتصال واستهلاك البيانات',
    category: 'Consumption',
    icon: Phone,
    inputs: [
      {
        id: 'dataUsage',
        label: 'استهلاك البيانات الشهري',
        type: 'number',
        unit: 'جيجابايت',
        placeholder: '10',
        required: true
      },
      {
        id: 'callMinutes',
        label: 'دقائق المكالمات الشهرية',
        type: 'number',
        unit: 'دقيقة',
        placeholder: '300',
        required: true
      },
      {
        id: 'networkType',
        label: 'نوع الشبكة',
        type: 'select',
        options: ['3G', '4G', '5G', 'واي فاي'],
        required: true
      }
    ],
    formula: 'استهلاك البيانات × 12 × معامل الانبعاث + المكالمات × معامل المكالمات × 12',
    emissionFactor: 0.006,
    unit: 'كج CO₂e',
    source: 'معهد التكنولوجيا الرقمية',
    sourceUrl: 'https://digital.org/'
  },
  {
    id: 'streaming-services',
    title: 'خدمات البث المرئي',
    description: 'انبعاثات مشاهدة نتفلكس ويوتيوب وخدمات البث',
    category: 'Consumption',
    icon: Tv,
    inputs: [
      {
        id: 'hoursPerDay',
        label: 'ساعات المشاهدة يومياً',
        type: 'number',
        unit: 'ساعة',
        placeholder: '2',
        required: true
      },
      {
        id: 'quality',
        label: 'جودة المشاهدة',
        type: 'select',
        options: ['عادية (480p)', 'عالية (720p)', 'عالية جداً (1080p)', '4K'],
        required: true
      },
      {
        id: 'deviceType',
        label: 'نوع الجهاز',
        type: 'select',
        options: ['هاتف ذكي', 'تابلت', 'حاسوب محمول', 'تلفزيون ذكي'],
        required: true
      }
    ],
    formula: 'ساعات المشاهدة × 365 × معامل الانبعاث',
    emissionFactor: 0.0036,
    unit: 'كج CO₂e',
    source: 'مجموعة الكربون الرقمي',
    sourceUrl: 'https://theshiftproject.org/'
  },
  {
    id: 'printing-paper',
    title: 'الطباعة واستهلاك الورق',
    description: 'انبعاثات طباعة الأوراق والمستندات',
    category: 'Consumption',
    icon: Printer,
    inputs: [
      {
        id: 'sheetsPerMonth',
        label: 'عدد الأوراق المطبوعة شهرياً',
        type: 'number',
        unit: 'ورقة',
        placeholder: '100',
        required: true
      },
      {
        id: 'paperType',
        label: 'نوع الورق',
        type: 'select',
        options: ['ورق عادي', 'ورق معاد التدوير', 'ورق ملون', 'كرتون'],
        required: true
      },
      {
        id: 'printType',
        label: 'نوع الطباعة',
        type: 'select',
        options: ['أبيض وأسود', 'ملون'],
        required: true
      }
    ],
    formula: 'عدد الأوراق × 12 × معامل الانبعاث',
    emissionFactor: 0.005,
    unit: 'كج CO₂e',
    source: 'صناعة الورق والطباعة',
    sourceUrl: 'https://www.paperrecycles.org/'
  },
  {
    id: 'online-shopping',
    title: 'التسوق الإلكتروني',
    description: 'انبعاثات المشتريات عبر الإنترنت والتغليف',
    category: 'Consumption',
    icon: ShoppingCart,
    inputs: [
      {
        id: 'ordersPerMonth',
        label: 'عدد الطلبات شهرياً',
        type: 'number',
        unit: 'طلب',
        placeholder: '8',
        required: true
      },
      {
        id: 'averageValue',
        label: 'متوسط قيمة الطلب',
        type: 'number',
        unit: 'ريال',
        placeholder: '200',
        required: true
      },
      {
        id: 'productType',
        label: 'نوع المنتجات',
        type: 'select',
        options: ['ملابس', 'إلكترونيات', 'كتب ومجلات', 'منتجات منزلية', 'مواد غذائية'],
        required: true
      }
    ],
    formula: 'عدد الطلبات × القيمة × معامل الانبعاث × 12',
    emissionFactor: 0.001,
    unit: 'كج CO₂e',
    source: 'مجلة التجارة الإلكترونية',
    sourceUrl: 'https://ecommerce.org/'
  }
];