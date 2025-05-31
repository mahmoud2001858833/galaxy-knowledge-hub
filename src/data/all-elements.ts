
export interface CompleteElement {
  name: string;
  symbol: string;
  atomic_number: number;
  atomic_mass: number;
  group: number;
  period: number;
  type: ElementType;
  usage: string;
  state_at_room_temp?: "solid" | "liquid" | "gas";
  position?: { x: number; y: number };
  electronegativity?: number;
  ionization_energy?: number;
  electron_affinity?: number;
  atomic_radius?: number;
  melting_point?: number;
  boiling_point?: number;
  density?: number;
  electron_configuration?: string;
  commonNeutrons: number;
}

export type ElementType = 
  | "alkali-metal" 
  | "alkaline-earth-metal" 
  | "transition-metal" 
  | "post-transition-metal" 
  | "metalloid" 
  | "nonmetal" 
  | "halogen" 
  | "noble-gas"
  | "lanthanide"
  | "actinide";

export const allElements: CompleteElement[] = [
  { atomic_number: 1, symbol: 'H', name: 'هيدروجين', atomic_mass: 1.008, group: 1, period: 1, type: 'nonmetal', usage: 'وقود وصناعة الأمونيا', commonNeutrons: 0 },
  { atomic_number: 2, symbol: 'He', name: 'هيليوم', atomic_mass: 4.003, group: 18, period: 1, type: 'noble-gas', usage: 'البالونات والتبريد', commonNeutrons: 2 },
  { atomic_number: 3, symbol: 'Li', name: 'ليثيوم', atomic_mass: 6.94, group: 1, period: 2, type: 'alkali-metal', usage: 'البطاريات', commonNeutrons: 4 },
  { atomic_number: 4, symbol: 'Be', name: 'بيريليوم', atomic_mass: 9.012, group: 2, period: 2, type: 'alkaline-earth-metal', usage: 'السبائك المعدنية', commonNeutrons: 5 },
  { atomic_number: 5, symbol: 'B', name: 'بورون', atomic_mass: 10.81, group: 13, period: 2, type: 'metalloid', usage: 'الزجاج والسيراميك', commonNeutrons: 6 },
  { atomic_number: 6, symbol: 'C', name: 'كربون', atomic_mass: 12.011, group: 14, period: 2, type: 'nonmetal', usage: 'أساس الحياة', commonNeutrons: 6 },
  { atomic_number: 7, symbol: 'N', name: 'نيتروجين', atomic_mass: 14.007, group: 15, period: 2, type: 'nonmetal', usage: 'الأسمدة والمتفجرات', commonNeutrons: 7 },
  { atomic_number: 8, symbol: 'O', name: 'أكسجين', atomic_mass: 15.999, group: 16, period: 2, type: 'nonmetal', usage: 'التنفس والاحتراق', commonNeutrons: 8 },
  { atomic_number: 9, symbol: 'F', name: 'فلور', atomic_mass: 18.998, group: 17, period: 2, type: 'halogen', usage: 'معجون الأسنان', commonNeutrons: 10 },
  { atomic_number: 10, symbol: 'Ne', name: 'نيون', atomic_mass: 20.180, group: 18, period: 2, type: 'noble-gas', usage: 'اللافتات المضيئة', commonNeutrons: 10 },
  { atomic_number: 11, symbol: 'Na', name: 'صوديوم', atomic_mass: 22.990, group: 1, period: 3, type: 'alkali-metal', usage: 'ملح الطعام', commonNeutrons: 12 },
  { atomic_number: 12, symbol: 'Mg', name: 'مغنيسيوم', atomic_mass: 24.305, group: 2, period: 3, type: 'alkaline-earth-metal', usage: 'السبائك الخفيفة', commonNeutrons: 12 },
  { atomic_number: 13, symbol: 'Al', name: 'ألومنيوم', atomic_mass: 26.982, group: 13, period: 3, type: 'post-transition-metal', usage: 'علب المشروبات', commonNeutrons: 14 },
  { atomic_number: 14, symbol: 'Si', name: 'سيليكون', atomic_mass: 28.085, group: 14, period: 3, type: 'metalloid', usage: 'الحاسوب والإلكترونيات', commonNeutrons: 14 },
  { atomic_number: 15, symbol: 'P', name: 'فوسفور', atomic_mass: 30.974, group: 15, period: 3, type: 'nonmetal', usage: 'الأسمدة والكبريت', commonNeutrons: 16 },
  { atomic_number: 16, symbol: 'S', name: 'كبريت', atomic_mass: 32.06, group: 16, period: 3, type: 'nonmetal', usage: 'المطاط والحمض', commonNeutrons: 16 },
  { atomic_number: 17, symbol: 'Cl', name: 'كلور', atomic_mass: 35.45, group: 17, period: 3, type: 'halogen', usage: 'التطهير والتعقيم', commonNeutrons: 18 },
  { atomic_number: 18, symbol: 'Ar', name: 'أرجون', atomic_mass: 39.948, group: 18, period: 3, type: 'noble-gas', usage: 'اللحام والإضاءة', commonNeutrons: 22 },
  { atomic_number: 19, symbol: 'K', name: 'بوتاسيوم', atomic_mass: 39.098, group: 1, period: 4, type: 'alkali-metal', usage: 'الأسمدة', commonNeutrons: 20 },
  { atomic_number: 20, symbol: 'Ca', name: 'كالسيوم', atomic_mass: 40.078, group: 2, period: 4, type: 'alkaline-earth-metal', usage: 'العظام والأسنان', commonNeutrons: 20 },
  { atomic_number: 21, symbol: 'Sc', name: 'سكانديوم', atomic_mass: 44.956, group: 3, period: 4, type: 'transition-metal', usage: 'سبائك الألومنيوم', commonNeutrons: 24 },
  { atomic_number: 22, symbol: 'Ti', name: 'تيتانيوم', atomic_mass: 47.867, group: 4, period: 4, type: 'transition-metal', usage: 'الطيران والطب', commonNeutrons: 26 },
  { atomic_number: 23, symbol: 'V', name: 'فاناديوم', atomic_mass: 50.942, group: 5, period: 4, type: 'transition-metal', usage: 'الفولاذ المقاوم', commonNeutrons: 28 },
  { atomic_number: 24, symbol: 'Cr', name: 'كروم', atomic_mass: 51.996, group: 6, period: 4, type: 'transition-metal', usage: 'طلاء المعادن', commonNeutrons: 28 },
  { atomic_number: 25, symbol: 'Mn', name: 'منغنيز', atomic_mass: 54.938, group: 7, period: 4, type: 'transition-metal', usage: 'إنتاج الفولاذ', commonNeutrons: 30 },
  { atomic_number: 26, symbol: 'Fe', name: 'حديد', atomic_mass: 55.845, group: 8, period: 4, type: 'transition-metal', usage: 'البناء والصناعة', commonNeutrons: 30 },
  { atomic_number: 27, symbol: 'Co', name: 'كوبالت', atomic_mass: 58.933, group: 9, period: 4, type: 'transition-metal', usage: 'المغناطيس والبطاريات', commonNeutrons: 32 },
  { atomic_number: 28, symbol: 'Ni', name: 'نيكل', atomic_mass: 58.693, group: 10, period: 4, type: 'transition-metal', usage: 'العملات المعدنية', commonNeutrons: 31 },
  { atomic_number: 29, symbol: 'Cu', name: 'نحاس', atomic_mass: 63.546, group: 11, period: 4, type: 'transition-metal', usage: 'الأسلاك الكهربائية', commonNeutrons: 35 },
  { atomic_number: 30, symbol: 'Zn', name: 'زنك', atomic_mass: 65.38, group: 12, period: 4, type: 'transition-metal', usage: 'الجلفنة', commonNeutrons: 35 },
  { atomic_number: 31, symbol: 'Ga', name: 'غاليوم', atomic_mass: 69.723, group: 13, period: 4, type: 'post-transition-metal', usage: 'أشباه الموصلات', commonNeutrons: 39 },
  { atomic_number: 32, symbol: 'Ge', name: 'جرمانيوم', atomic_mass: 72.630, group: 14, period: 4, type: 'metalloid', usage: 'الألياف البصرية', commonNeutrons: 41 },
  { atomic_number: 33, symbol: 'As', name: 'زرنيخ', atomic_mass: 74.922, group: 15, period: 4, type: 'metalloid', usage: 'أشباه الموصلات', commonNeutrons: 42 },
  { atomic_number: 34, symbol: 'Se', name: 'سيلينيوم', atomic_mass: 78.971, group: 16, period: 4, type: 'nonmetal', usage: 'آلات التصوير', commonNeutrons: 45 },
  { atomic_number: 35, symbol: 'Br', name: 'بروم', atomic_mass: 79.904, group: 17, period: 4, type: 'halogen', usage: 'مثبطات اللهب', commonNeutrons: 45 },
  { atomic_number: 36, symbol: 'Kr', name: 'كريبتون', atomic_mass: 83.798, group: 18, period: 4, type: 'noble-gas', usage: 'الليزر والإضاءة', commonNeutrons: 48 },
  { atomic_number: 37, symbol: 'Rb', name: 'روبيديوم', atomic_mass: 85.468, group: 1, period: 5, type: 'alkali-metal', usage: 'الساعات الذرية', commonNeutrons: 48 },
  { atomic_number: 38, symbol: 'Sr', name: 'سترونشيوم', atomic_mass: 87.62, group: 2, period: 5, type: 'alkaline-earth-metal', usage: 'الألعاب النارية', commonNeutrons: 50 },
  { atomic_number: 39, symbol: 'Y', name: 'إتريوم', atomic_mass: 88.906, group: 3, period: 5, type: 'transition-metal', usage: 'أجهزة التلفاز', commonNeutrons: 50 },
  { atomic_number: 40, symbol: 'Zr', name: 'زيركونيوم', atomic_mass: 91.224, group: 4, period: 5, type: 'transition-metal', usage: 'المفاعلات النووية', commonNeutrons: 51 },
  { atomic_number: 41, symbol: 'Nb', name: 'نيوبيوم', atomic_mass: 92.906, group: 5, period: 5, type: 'transition-metal', usage: 'المغناطيس الفائق', commonNeutrons: 52 },
  { atomic_number: 42, symbol: 'Mo', name: 'موليبدنوم', atomic_mass: 95.95, group: 6, period: 5, type: 'transition-metal', usage: 'الفولاذ العالي', commonNeutrons: 54 },
  { atomic_number: 43, symbol: 'Tc', name: 'تكنيتيوم', atomic_mass: 98, group: 7, period: 5, type: 'transition-metal', usage: 'التصوير الطبي', commonNeutrons: 55 },
  { atomic_number: 44, symbol: 'Ru', name: 'روثينيوم', atomic_mass: 101.07, group: 8, period: 5, type: 'transition-metal', usage: 'الحفز الكيميائي', commonNeutrons: 57 },
  { atomic_number: 45, symbol: 'Rh', name: 'روديوم', atomic_mass: 102.91, group: 9, period: 5, type: 'transition-metal', usage: 'المجوهرات والحفز', commonNeutrons: 58 },
  { atomic_number: 46, symbol: 'Pd', name: 'بالاديوم', atomic_mass: 106.42, group: 10, period: 5, type: 'transition-metal', usage: 'تنقية الهيدروجين', commonNeutrons: 60 },
  { atomic_number: 47, symbol: 'Ag', name: 'فضة', atomic_mass: 107.87, group: 11, period: 5, type: 'transition-metal', usage: 'المجوهرات والطب', commonNeutrons: 61 },
  { atomic_number: 48, symbol: 'Cd', name: 'كادميوم', atomic_mass: 112.41, group: 12, period: 5, type: 'transition-metal', usage: 'البطاريات', commonNeutrons: 64 },
  { atomic_number: 49, symbol: 'In', name: 'إنديوم', atomic_mass: 114.82, group: 13, period: 5, type: 'post-transition-metal', usage: 'الشاشات اللمسية', commonNeutrons: 66 },
  { atomic_number: 50, symbol: 'Sn', name: 'قصدير', atomic_mass: 118.71, group: 14, period: 5, type: 'post-transition-metal', usage: 'طلاء المعادن', commonNeutrons: 69 },
  { atomic_number: 51, symbol: 'Sb', name: 'إثمد', atomic_mass: 121.76, group: 15, period: 5, type: 'metalloid', usage: 'مثبطات اللهب', commonNeutrons: 71 },
  { atomic_number: 52, symbol: 'Te', name: 'تيلوريوم', atomic_mass: 127.60, group: 16, period: 5, type: 'metalloid', usage: 'أشباه الموصلات', commonNeutrons: 76 },
  { atomic_number: 53, symbol: 'I', name: 'يود', atomic_mass: 126.90, group: 17, period: 5, type: 'halogen', usage: 'المطهرات والطب', commonNeutrons: 74 },
  { atomic_number: 54, symbol: 'Xe', name: 'زينون', atomic_mass: 131.29, group: 18, period: 5, type: 'noble-gas', usage: 'مصابيح السيارات', commonNeutrons: 77 },
  { atomic_number: 55, symbol: 'Cs', name: 'سيزيوم', atomic_mass: 132.91, group: 1, period: 6, type: 'alkali-metal', usage: 'الساعات الذرية', commonNeutrons: 78 },
  { atomic_number: 56, symbol: 'Ba', name: 'باريوم', atomic_mass: 137.33, group: 2, period: 6, type: 'alkaline-earth-metal', usage: 'الأشعة السينية', commonNeutrons: 81 },
  { atomic_number: 57, symbol: 'La', name: 'لانثانوم', atomic_mass: 138.91, group: 3, period: 6, type: 'lanthanide', usage: 'عدسات الكاميرا', commonNeutrons: 82 },
  { atomic_number: 58, symbol: 'Ce', name: 'سيريوم', atomic_mass: 140.12, group: 3, period: 6, type: 'lanthanide', usage: 'تلميع الزجاج', commonNeutrons: 82 },
  { atomic_number: 59, symbol: 'Pr', name: 'براسوديميوم', atomic_mass: 140.91, group: 3, period: 6, type: 'lanthanide', usage: 'المغناطيس القوي', commonNeutrons: 82 },
  { atomic_number: 60, symbol: 'Nd', name: 'نيوديميوم', atomic_mass: 144.24, group: 3, period: 6, type: 'lanthanide', usage: 'مغناطيس قوي جداً', commonNeutrons: 84 },
  { atomic_number: 61, symbol: 'Pm', name: 'بروميثيوم', atomic_mass: 145, group: 3, period: 6, type: 'lanthanide', usage: 'بطاريات نووية', commonNeutrons: 84 },
  { atomic_number: 62, symbol: 'Sm', name: 'ساماريوم', atomic_mass: 150.36, group: 3, period: 6, type: 'lanthanide', usage: 'المغناطيس', commonNeutrons: 88 },
  { atomic_number: 63, symbol: 'Eu', name: 'يوروبيوم', atomic_mass: 151.96, group: 3, period: 6, type: 'lanthanide', usage: 'شاشات التلفاز', commonNeutrons: 89 },
  { atomic_number: 64, symbol: 'Gd', name: 'غادولينيوم', atomic_mass: 157.25, group: 3, period: 6, type: 'lanthanide', usage: 'التصوير المغناطيسي', commonNeutrons: 93 },
  { atomic_number: 65, symbol: 'Tb', name: 'تيربيوم', atomic_mass: 158.93, group: 3, period: 6, type: 'lanthanide', usage: 'الليزر الأخضر', commonNeutrons: 94 },
  { atomic_number: 66, symbol: 'Dy', name: 'دسبروسيوم', atomic_mass: 162.50, group: 3, period: 6, type: 'lanthanide', usage: 'المغناطيس', commonNeutrons: 97 },
  { atomic_number: 67, symbol: 'Ho', name: 'هولميوم', atomic_mass: 164.93, group: 3, period: 6, type: 'lanthanide', usage: 'ليزر طبي', commonNeutrons: 98 },
  { atomic_number: 68, symbol: 'Er', name: 'إربيوم', atomic_mass: 167.26, group: 3, period: 6, type: 'lanthanide', usage: 'ألياف بصرية', commonNeutrons: 99 },
  { atomic_number: 69, symbol: 'Tm', name: 'ثوليوم', atomic_mass: 168.93, group: 3, period: 6, type: 'lanthanide', usage: 'الأشعة السينية', commonNeutrons: 100 },
  { atomic_number: 70, symbol: 'Yb', name: 'إتيربيوم', atomic_mass: 173.05, group: 3, period: 6, type: 'lanthanide', usage: 'الساعات الذرية', commonNeutrons: 103 },
  { atomic_number: 71, symbol: 'Lu', name: 'لوتيتيوم', atomic_mass: 174.97, group: 3, period: 6, type: 'lanthanide', usage: 'التصوير الطبي', commonNeutrons: 104 },
  { atomic_number: 72, symbol: 'Hf', name: 'هافنيوم', atomic_mass: 178.49, group: 4, period: 6, type: 'transition-metal', usage: 'المفاعلات النووية', commonNeutrons: 106 },
  { atomic_number: 73, symbol: 'Ta', name: 'تانتالوم', atomic_mass: 180.95, group: 5, period: 6, type: 'transition-metal', usage: 'الهواتف المحمولة', commonNeutrons: 108 },
  { atomic_number: 74, symbol: 'W', name: 'تنغستن', atomic_mass: 183.84, group: 6, period: 6, type: 'transition-metal', usage: 'فتائل المصابيح', commonNeutrons: 110 },
  { atomic_number: 75, symbol: 'Re', name: 'رينيوم', atomic_mass: 186.21, group: 7, period: 6, type: 'transition-metal', usage: 'محركات الطائرات', commonNeutrons: 111 },
  { atomic_number: 76, symbol: 'Os', name: 'أوزميوم', atomic_mass: 190.23, group: 8, period: 6, type: 'transition-metal', usage: 'أقلام الحبر', commonNeutrons: 114 },
  { atomic_number: 77, symbol: 'Ir', name: 'إيريديوم', atomic_mass: 192.22, group: 9, period: 6, type: 'transition-metal', usage: 'شمعات الاشتعال', commonNeutrons: 115 },
  { atomic_number: 78, symbol: 'Pt', name: 'بلاتين', atomic_mass: 195.08, group: 10, period: 6, type: 'transition-metal', usage: 'المجوهرات والحفز', commonNeutrons: 117 },
  { atomic_number: 79, symbol: 'Au', name: 'ذهب', atomic_mass: 196.97, group: 11, period: 6, type: 'transition-metal', usage: 'المجوهرات والاستثمار', commonNeutrons: 118 },
  { atomic_number: 80, symbol: 'Hg', name: 'زئبق', atomic_mass: 200.59, group: 12, period: 6, type: 'transition-metal', usage: 'موازين الحرارة', commonNeutrons: 121 },
  { atomic_number: 81, symbol: 'Tl', name: 'ثاليوم', atomic_mass: 204.38, group: 13, period: 6, type: 'post-transition-metal', usage: 'كاشفات الإشعاع', commonNeutrons: 123 },
  { atomic_number: 82, symbol: 'Pb', name: 'رصاص', atomic_mass: 207.2, group: 14, period: 6, type: 'post-transition-metal', usage: 'البطاريات والحماية', commonNeutrons: 125 },
  { atomic_number: 83, symbol: 'Bi', name: 'بزموت', atomic_mass: 208.98, group: 15, period: 6, type: 'post-transition-metal', usage: 'أدوية المعدة', commonNeutrons: 126 },
  { atomic_number: 84, symbol: 'Po', name: 'بولونيوم', atomic_mass: 209, group: 16, period: 6, type: 'metalloid', usage: 'مصادر الإشعاع', commonNeutrons: 125 },
  { atomic_number: 85, symbol: 'At', name: 'أستاتين', atomic_mass: 210, group: 17, period: 6, type: 'halogen', usage: 'العلاج الإشعاعي', commonNeutrons: 125 },
  { atomic_number: 86, symbol: 'Rn', name: 'رادون', atomic_mass: 222, group: 18, period: 6, type: 'noble-gas', usage: 'كشف الزلازل', commonNeutrons: 136 },
  { atomic_number: 87, symbol: 'Fr', name: 'فرانسيوم', atomic_mass: 223, group: 1, period: 7, type: 'alkali-metal', usage: 'البحث العلمي', commonNeutrons: 136 },
  { atomic_number: 88, symbol: 'Ra', name: 'راديوم', atomic_mass: 226, group: 2, period: 7, type: 'alkaline-earth-metal', usage: 'العلاج الإشعاعي', commonNeutrons: 138 },
  { atomic_number: 89, symbol: 'Ac', name: 'أكتينيوم', atomic_mass: 227, group: 3, period: 7, type: 'actinide', usage: 'مصادر النيوترونات', commonNeutrons: 138 },
  { atomic_number: 90, symbol: 'Th', name: 'ثوريوم', atomic_mass: 232.04, group: 3, period: 7, type: 'actinide', usage: 'الطاقة النووية', commonNeutrons: 142 },
  { atomic_number: 91, symbol: 'Pa', name: 'بروتكتينيوم', atomic_mass: 231.04, group: 3, period: 7, type: 'actinide', usage: 'البحث النووي', commonNeutrons: 140 },
  { atomic_number: 92, symbol: 'U', name: 'يورانيوم', atomic_mass: 238.03, group: 3, period: 7, type: 'actinide', usage: 'الطاقة النووية', commonNeutrons: 146 },
  { atomic_number: 93, symbol: 'Np', name: 'نبتونيوم', atomic_mass: 237, group: 3, period: 7, type: 'actinide', usage: 'كاشفات النيوترونات', commonNeutrons: 144 },
  { atomic_number: 94, symbol: 'Pu', name: 'بلوتونيوم', atomic_mass: 244, group: 3, period: 7, type: 'actinide', usage: 'الأسلحة النووية', commonNeutrons: 150 },
  { atomic_number: 95, symbol: 'Am', name: 'أمريسيوم', atomic_mass: 243, group: 3, period: 7, type: 'actinide', usage: 'كاشفات الدخان', commonNeutrons: 148 },
  { atomic_number: 96, symbol: 'Cm', name: 'كوريوم', atomic_mass: 247, group: 3, period: 7, type: 'actinide', usage: 'مصادر الطاقة', commonNeutrons: 151 },
  { atomic_number: 97, symbol: 'Bk', name: 'بيركليوم', atomic_mass: 247, group: 3, period: 7, type: 'actinide', usage: 'البحث العلمي', commonNeutrons: 150 },
  { atomic_number: 98, symbol: 'Cf', name: 'كاليفورنيوم', atomic_mass: 251, group: 3, period: 7, type: 'actinide', usage: 'مصادر النيوترونات', commonNeutrons: 153 },
  { atomic_number: 99, symbol: 'Es', name: 'أينشتاينيوم', atomic_mass: 252, group: 3, period: 7, type: 'actinide', usage: 'البحث النووي', commonNeutrons: 153 },
  { atomic_number: 100, symbol: 'Fm', name: 'فيرميوم', atomic_mass: 257, group: 3, period: 7, type: 'actinide', usage: 'البحث العلمي', commonNeutrons: 157 },
  { atomic_number: 101, symbol: 'Md', name: 'مندليفيوم', atomic_mass: 258, group: 3, period: 7, type: 'actinide', usage: 'البحث العلمي', commonNeutrons: 157 },
  { atomic_number: 102, symbol: 'No', name: 'نوبليوم', atomic_mass: 259, group: 3, period: 7, type: 'actinide', usage: 'البحث العلمي', commonNeutrons: 157 },
  { atomic_number: 103, symbol: 'Lr', name: 'لورنسيوم', atomic_mass: 262, group: 3, period: 7, type: 'actinide', usage: 'البحث العلمي', commonNeutrons: 159 },
  { atomic_number: 104, symbol: 'Rf', name: 'رذرفورديوم', atomic_mass: 267, group: 4, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 163 },
  { atomic_number: 105, symbol: 'Db', name: 'دوبنيوم', atomic_mass: 270, group: 5, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 165 },
  { atomic_number: 106, symbol: 'Sg', name: 'سيبورغيوم', atomic_mass: 271, group: 6, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 165 },
  { atomic_number: 107, symbol: 'Bh', name: 'بوريوم', atomic_mass: 274, group: 7, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 167 },
  { atomic_number: 108, symbol: 'Hs', name: 'هاسيوم', atomic_mass: 277, group: 8, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 169 },
  { atomic_number: 109, symbol: 'Mt', name: 'مايتنيريوم', atomic_mass: 278, group: 9, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 169 },
  { atomic_number: 110, symbol: 'Ds', name: 'دارمشتاديوم', atomic_mass: 281, group: 10, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 171 },
  { atomic_number: 111, symbol: 'Rg', name: 'رونتغنيوم', atomic_mass: 282, group: 11, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 171 },
  { atomic_number: 112, symbol: 'Cn', name: 'كوبرنيسيوم', atomic_mass: 285, group: 12, period: 7, type: 'transition-metal', usage: 'البحث العلمي', commonNeutrons: 173 },
  { atomic_number: 113, symbol: 'Nh', name: 'نيهونيوم', atomic_mass: 286, group: 13, period: 7, type: 'post-transition-metal', usage: 'البحث العلمي', commonNeutrons: 173 },
  { atomic_number: 114, symbol: 'Fl', name: 'فليروفيوم', atomic_mass: 289, group: 14, period: 7, type: 'post-transition-metal', usage: 'البحث العلمي', commonNeutrons: 175 },
  { atomic_number: 115, symbol: 'Mc', name: 'موسكوفيوم', atomic_mass: 290, group: 15, period: 7, type: 'post-transition-metal', usage: 'البحث العلمي', commonNeutrons: 175 },
  { atomic_number: 116, symbol: 'Lv', name: 'ليفرموريوم', atomic_mass: 293, group: 16, period: 7, type: 'post-transition-metal', usage: 'البحث العلمي', commonNeutrons: 177 },
  { atomic_number: 117, symbol: 'Ts', name: 'تينيسين', atomic_mass: 294, group: 17, period: 7, type: 'halogen', usage: 'البحث العلمي', commonNeutrons: 177 },
  { atomic_number: 118, symbol: 'Og', name: 'أوغانيسون', atomic_mass: 294, group: 18, period: 7, type: 'noble-gas', usage: 'البحث العلمي', commonNeutrons: 176 }
];
