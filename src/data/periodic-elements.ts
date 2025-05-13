
import { Element, ElementType } from "@/types/periodic-table";

export const periodicElements: Element[] = [
  // المجموعة 1 (الفلزات القلوية)
  { 
    name: "هيدروجين", 
    symbol: "H", 
    atomic_number: 1, 
    group: 1, 
    period: 1, 
    type: "nonmetal", 
    usage: "يستخدم في إنتاج الأمونيا والميثانول وتكرير النفط",
    state_at_room_temp: "gas",
    position: { x: 0, y: 0 }
  },
  { 
    name: "ليثيوم", 
    symbol: "Li", 
    atomic_number: 3, 
    group: 1, 
    period: 2, 
    type: "alkali-metal", 
    usage: "يستخدم في البطاريات القابلة للشحن والزجاج والسيراميك",
    state_at_room_temp: "solid",
    position: { x: 0, y: 1 }
  },
  { 
    name: "صوديوم", 
    symbol: "Na", 
    atomic_number: 11, 
    group: 1, 
    period: 3, 
    type: "alkali-metal", 
    usage: "يستخدم في إنتاج ملح الطعام والصابون والعديد من المركبات الكيميائية",
    state_at_room_temp: "solid",
    position: { x: 0, y: 2 }
  },
  { 
    name: "بوتاسيوم", 
    symbol: "K", 
    atomic_number: 19, 
    group: 1, 
    period: 4, 
    type: "alkali-metal", 
    usage: "يستخدم في الأسمدة الكيميائية وإنتاج الصابون",
    state_at_room_temp: "solid",
    position: { x: 0, y: 3 }
  },
  { 
    name: "روبيديوم", 
    symbol: "Rb", 
    atomic_number: 37, 
    group: 1, 
    period: 5, 
    type: "alkali-metal", 
    usage: "يستخدم في البحث العلمي والساعات الذرية والخلايا الكهروضوئية",
    state_at_room_temp: "solid",
    position: { x: 0, y: 4 }
  },
  { 
    name: "سيزيوم", 
    symbol: "Cs", 
    atomic_number: 55, 
    group: 1, 
    period: 6, 
    type: "alkali-metal", 
    usage: "يستخدم في الساعات الذرية وفي معدات الحفر النفطي",
    state_at_room_temp: "solid",
    position: { x: 0, y: 5 }
  },
  { 
    name: "فرانسيوم", 
    symbol: "Fr", 
    atomic_number: 87, 
    group: 1, 
    period: 7, 
    type: "alkali-metal", 
    usage: "يستخدم للأبحاث العلمية فقط نظراً لندرته",
    state_at_room_temp: "solid",
    position: { x: 0, y: 6 }
  },

  // المجموعة 2 (الفلزات القلوية الترابية)
  { 
    name: "بيريليوم", 
    symbol: "Be", 
    atomic_number: 4, 
    group: 2, 
    period: 2, 
    type: "alkaline-earth-metal", 
    usage: "يستخدم في صناعة الفضاء والإلكترونيات والنظائر المشعة",
    state_at_room_temp: "solid",
    position: { x: 1, y: 1 }
  },
  { 
    name: "ماغنيسيوم", 
    symbol: "Mg", 
    atomic_number: 12, 
    group: 2, 
    period: 3, 
    type: "alkaline-earth-metal", 
    usage: "يستخدم في السبائك الخفيفة وفي تصنيع السيارات والطائرات",
    state_at_room_temp: "solid",
    position: { x: 1, y: 2 }
  },
  { 
    name: "كالسيوم", 
    symbol: "Ca", 
    atomic_number: 20, 
    group: 2, 
    period: 4, 
    type: "alkaline-earth-metal", 
    usage: "يستخدم في البناء (الإسمنت والجير) وتكملة غذائية",
    state_at_room_temp: "solid",
    position: { x: 1, y: 3 }
  },
  { 
    name: "سترونتيوم", 
    symbol: "Sr", 
    atomic_number: 38, 
    group: 2, 
    period: 5, 
    type: "alkaline-earth-metal", 
    usage: "يستخدم في الألعاب النارية وتقنيات الليزر",
    state_at_room_temp: "solid",
    position: { x: 1, y: 4 }
  },
  { 
    name: "باريوم", 
    symbol: "Ba", 
    atomic_number: 56, 
    group: 2, 
    period: 6, 
    type: "alkaline-earth-metal", 
    usage: "يستخدم في التصوير الطبي للجهاز الهضمي (الباريوم)",
    state_at_room_temp: "solid",
    position: { x: 1, y: 5 }
  },
  { 
    name: "راديوم", 
    symbol: "Ra", 
    atomic_number: 88, 
    group: 2, 
    period: 7, 
    type: "alkaline-earth-metal", 
    usage: "استخدم تاريخياً في علاج السرطان، الآن في البحث العلمي",
    state_at_room_temp: "solid",
    position: { x: 1, y: 6 }
  },

  // العناصر الانتقالية (المجموعات 3-12)
  // المجموعة 3
  { 
    name: "سكانديوم", 
    symbol: "Sc", 
    atomic_number: 21, 
    group: 3, 
    period: 4, 
    type: "transition-metal", 
    usage: "يستخدم في صناعة المصابيح وصناعة الطيران",
    state_at_room_temp: "solid",
    position: { x: 2, y: 3 }
  },
  { 
    name: "إتريوم", 
    symbol: "Y", 
    atomic_number: 39, 
    group: 3, 
    period: 5, 
    type: "transition-metal", 
    usage: "يستخدم في الليزر والإلكترونيات والسيراميك",
    state_at_room_temp: "solid",
    position: { x: 2, y: 4 }
  },
  // المجموعات 4-12 (أضف باقي العناصر الانتقالية)
  // لاحظ أن هناك العديد من العناصر هنا، سنضيف مجموعة ممثلة وسنكمل الباقي
  { 
    name: "تيتانيوم", 
    symbol: "Ti", 
    atomic_number: 22, 
    group: 4, 
    period: 4, 
    type: "transition-metal", 
    usage: "يستخدم في صناعة الطائرات والسفن والسبائك المقاومة للتآكل",
    state_at_room_temp: "solid",
    position: { x: 3, y: 3 }
  },
  
  // المجموعة 13
  { 
    name: "بورون", 
    symbol: "B", 
    atomic_number: 5, 
    group: 13, 
    period: 2, 
    type: "metalloid", 
    usage: "يستخدم في صناعة الزجاج البوروسيليكات والنظائر المشعة",
    state_at_room_temp: "solid",
    position: { x: 12, y: 1 }
  },
  { 
    name: "ألومنيوم", 
    symbol: "Al", 
    atomic_number: 13, 
    group: 13, 
    period: 3, 
    type: "post-transition-metal", 
    usage: "يستخدم في صناعة الهياكل والسيارات والطائرات وعلب المشروبات",
    state_at_room_temp: "solid",
    position: { x: 12, y: 2 }
  },
  
  // المجموعة 14
  { 
    name: "كربون", 
    symbol: "C", 
    atomic_number: 6, 
    group: 14, 
    period: 2, 
    type: "nonmetal", 
    usage: "أساس الحياة والكيمياء العضوية، يستخدم في الوقود والبلاستيك",
    state_at_room_temp: "solid",
    position: { x: 13, y: 1 }
  },
  { 
    name: "سيليكون", 
    symbol: "Si", 
    atomic_number: 14, 
    group: 14, 
    period: 3, 
    type: "metalloid", 
    usage: "يستخدم في الإلكترونيات وأشباه الموصلات والرقائق الإلكترونية",
    state_at_room_temp: "solid",
    position: { x: 13, y: 2 }
  },
  
  // المجموعة 15
  { 
    name: "نيتروجين", 
    symbol: "N", 
    atomic_number: 7, 
    group: 15, 
    period: 2, 
    type: "nonmetal", 
    usage: "يستخدم في الأسمدة والمتفجرات وتبريد المواد",
    state_at_room_temp: "gas",
    position: { x: 14, y: 1 }
  },
  { 
    name: "فوسفور", 
    symbol: "P", 
    atomic_number: 15, 
    group: 15, 
    period: 3, 
    type: "nonmetal", 
    usage: "يستخدم في الأسمدة وصناعة المواد الكيميائية والثقاب",
    state_at_room_temp: "solid",
    position: { x: 14, y: 2 }
  },
  
  // المجموعة 16
  { 
    name: "أكسجين", 
    symbol: "O", 
    atomic_number: 8, 
    group: 16, 
    period: 2, 
    type: "nonmetal", 
    usage: "ضروري للتنفس والاحتراق، يستخدم في الطب والصناعة",
    state_at_room_temp: "gas",
    position: { x: 15, y: 1 }
  },
  { 
    name: "كبريت", 
    symbol: "S", 
    atomic_number: 16, 
    group: 16, 
    period: 3, 
    type: "nonmetal", 
    usage: "يستخدم في إنتاج حمض الكبريتيك والأسمدة والمطاط",
    state_at_room_temp: "solid",
    position: { x: 15, y: 2 }
  },
  
  // المجموعة 17 (الهالوجينات)
  { 
    name: "فلور", 
    symbol: "F", 
    atomic_number: 9, 
    group: 17, 
    period: 2, 
    type: "halogen", 
    usage: "يستخدم في إنتاج مركبات الفلور وفي معاجين الأسنان",
    state_at_room_temp: "gas",
    position: { x: 16, y: 1 }
  },
  { 
    name: "كلور", 
    symbol: "Cl", 
    atomic_number: 17, 
    group: 17, 
    period: 3, 
    type: "halogen", 
    usage: "يستخدم في تعقيم المياه وإنتاج البلاستيك والمذيبات",
    state_at_room_temp: "gas",
    position: { x: 16, y: 2 }
  },
  
  // المجموعة 18 (الغازات النبيلة)
  { 
    name: "هيليوم", 
    symbol: "He", 
    atomic_number: 2, 
    group: 18, 
    period: 1, 
    type: "noble-gas", 
    usage: "يستخدم في البالونات والمناطيد وفي التبريد الفائق",
    state_at_room_temp: "gas",
    position: { x: 17, y: 0 }
  },
  { 
    name: "نيون", 
    symbol: "Ne", 
    atomic_number: 10, 
    group: 18, 
    period: 2, 
    type: "noble-gas", 
    usage: "يستخدم في لافتات النيون المضيئة وفي أنابيب الليزر",
    state_at_room_temp: "gas",
    position: { x: 17, y: 1 }
  },
  { 
    name: "أرغون", 
    symbol: "Ar", 
    atomic_number: 18, 
    group: 18, 
    period: 3, 
    type: "noble-gas", 
    usage: "يستخدم في المصابيح الكهربائية وفي اللحام",
    state_at_room_temp: "gas",
    position: { x: 17, y: 2 }
  },
  
  // هذه فقط عينة من العناصر - في التطبيق الحقيقي ستحتاج لإضافة جميع العناصر المطلوبة (118 عنصر)
  // يجب إكمال باقي العناصر بنفس الطريقة
];

export function getElementBySymbol(symbol: string): Element | undefined {
  return periodicElements.find(element => element.symbol.toLowerCase() === symbol.toLowerCase());
}

export function getElementByAtomicNumber(atomicNumber: number): Element | undefined {
  return periodicElements.find(element => element.atomic_number === atomicNumber);
}

export function getElementByName(name: string): Element | undefined {
  return periodicElements.find(element => 
    element.name.toLowerCase().includes(name.toLowerCase()) || 
    element.symbol.toLowerCase().includes(name.toLowerCase())
  );
}

export function getElementsByType(type: ElementType): Element[] {
  return periodicElements.filter(element => element.type === type);
}

export function getElementsByState(state: "solid" | "liquid" | "gas"): Element[] {
  return periodicElements.filter(element => element.state_at_room_temp === state);
}

export function getElementsByGroup(group: number): Element[] {
  return periodicElements.filter(element => element.group === group);
}

export function getElementsByPeriod(period: number): Element[] {
  return periodicElements.filter(element => element.period === period);
}
