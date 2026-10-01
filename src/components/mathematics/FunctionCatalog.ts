export interface MathFunctionItem {
  id: string;
  nameAr: string;
  symbol: string;
  template: string;
  category: string;
  categoryAr: string;
  descriptionAr: string;
  example: string;
  defaultRange?: [number, number];
}

export const FUNCTION_CATEGORIES = [
  { id: 'trig', name: 'الدوال المثلثية', icon: '📐' },
  { id: 'inv_trig', name: 'المثلثية العكسية', icon: '🔄' },
  { id: 'hyperbolic', name: 'الدوال الزائدية وعكوسها', icon: '〰️' },
  { id: 'exp_log', name: 'الأسس واللوغاريتمات', icon: '📈' },
  { id: 'poly_power', name: 'كثيرات الحدود والقوى', icon: '🔢' },
  { id: 'calculus', name: 'التفاضل والتكامل والتحليل', icon: '∫' },
  { id: 'distributions', name: 'التوزيعات الإحصائية والاحتمالية', icon: '📊' },
  { id: 'special', name: 'الدوال الرياضية والفيزيائية الخاصة', icon: '🔬' },
  { id: 'piecewise', name: 'الدوال المتقطعة والشروط', icon: '🧩' },
  { id: 'waves_signals', name: 'الأمواج والإشارات الفيزيائية', icon: '🌊' }
];

export const FUNCTION_CATALOG: MathFunctionItem[] = [
  // --- 1. الدوال المثلثية (Trigonometric - 12) ---
  {
    id: 'sin',
    nameAr: 'جيب الزاوية (Sine)',
    symbol: 'sin(x)',
    template: 'sin(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'الدالة الدورية الأساسية، تذبذب بين -1 و +1 بفترة 2π',
    example: 'sin(2*x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'cos',
    nameAr: 'جيب التمام (Cosine)',
    symbol: 'cos(x)',
    template: 'cos(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'دالة جيب التمام الزوجية الدورية، متطابقة مع الجيب بعد إزاحة طور π/2',
    example: 'cos(3*x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'tan',
    nameAr: 'ظل الزاوية (Tangent)',
    symbol: 'tan(x)',
    template: 'tan(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'نسبة الجيب إلى جيب التمام، لها خطوط تقارب رأسية عند (k+1/2)π',
    example: 'tan(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'cot',
    nameAr: 'ظل التمام (Cotangent)',
    symbol: 'cot(x)',
    template: 'cot(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'مقلوب دالة الظل: cot(x) = cos(x)/sin(x)',
    example: 'cot(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'sec',
    nameAr: 'القاطع (Secant)',
    symbol: 'sec(x)',
    template: 'sec(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'مقلوب جيب التمام: sec(x) = 1/cos(x)',
    example: 'sec(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'csc',
    nameAr: 'قاطع التمام (Cosecant)',
    symbol: 'csc(x)',
    template: 'csc(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'مقلوب جيب الزاوية: csc(x) = 1/sin(x)',
    example: 'csc(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'sin2',
    nameAr: 'مربع الجيب (Sin Squared)',
    symbol: 'sin²(x)',
    template: 'sin(x)^2',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'موجة موجبة دائماً تذبذب بين 0 و 1 بتردد مضاعف',
    example: 'sin(x)^2',
    defaultRange: [-10, 10]
  },
  {
    id: 'cos2',
    nameAr: 'مربع جيب التمام (Cos Squared)',
    symbol: 'cos²(x)',
    template: 'cos(x)^2',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'موجة موجبة تمثل كثافة القدرة واحتمال الحالة الكمية',
    example: 'cos(x)^2',
    defaultRange: [-10, 10]
  },
  {
    id: 'sinc',
    nameAr: 'دالة سينك الأساسية (Sinc)',
    symbol: 'sinc(x)',
    template: 'sinc(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'دالة أخذ العينات في معالجة الإشارات sinc(x) = sin(x)/x مع sinc(0) = 1',
    example: 'sinc(x)',
    defaultRange: [-20, 20]
  },
  {
    id: 'versin',
    nameAr: 'الجيب المعكوس (Versine)',
    symbol: 'versin(x)',
    template: '1 - cos(x)',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'دالة تاريخية في الملاحة وعلم الفلك: versin(x) = 1 - cos(x)',
    example: '1 - cos(x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'haversin',
    nameAr: 'نصف الجيب المعكوس (Haversine)',
    symbol: 'haversin(x)',
    template: '(1 - cos(x)) / 2',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'صيغة هافرسين لحساب المسافات على سطح الكرة الأرضية بين الإحداثيات',
    example: '(1 - cos(x)) / 2',
    defaultRange: [-10, 10]
  },
  {
    id: 'exsec',
    nameAr: 'القاطع الخارجي (Exsecant)',
    symbol: 'exsec(x)',
    template: 'sec(x) - 1',
    category: 'trig',
    categoryAr: 'الدوال المثلثية',
    descriptionAr: 'القاطع الخارجي المستخدم في هندسة السكك الحديدية والمنحنيات',
    example: 'sec(x) - 1',
    defaultRange: [-5, 5]
  },

  // --- 2. الدوال المثلثية العكسية (Inverse Trig - 6) ---
  {
    id: 'asin',
    nameAr: 'قوس الجيب (Arcsin)',
    symbol: 'asin(x)',
    template: 'asin(x)',
    category: 'inv_trig',
    categoryAr: 'المثلثية العكسية',
    descriptionAr: 'الدالة العكسية للجيب، مجالها [-1, 1] ومداها [-π/2, π/2]',
    example: 'asin(x)',
    defaultRange: [-1.5, 1.5]
  },
  {
    id: 'acos',
    nameAr: 'قوس جيب التمام (Arccos)',
    symbol: 'acos(x)',
    template: 'acos(x)',
    category: 'inv_trig',
    categoryAr: 'المثلثية العكسية',
    descriptionAr: 'الدالة العكسية لجيب التمام، مجالها [-1, 1] ومداها [0, π]',
    example: 'acos(x)',
    defaultRange: [-1.5, 1.5]
  },
  {
    id: 'atan',
    nameAr: 'قوس الظل (Arctan)',
    symbol: 'atan(x)',
    template: 'atan(x)',
    category: 'inv_trig',
    categoryAr: 'المثلثية العكسية',
    descriptionAr: 'الدالة العكسية للظل، مجالها جميع الأعداد الحقيقية ومداها (-π/2, π/2)',
    example: 'atan(x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'acot',
    nameAr: 'قوس ظل التمام (Arccot)',
    symbol: 'acot(x)',
    template: 'atan(1/x)',
    category: 'inv_trig',
    categoryAr: 'المثلثية العكسية',
    descriptionAr: 'الدالة العكسية لظل التمام: acot(x) = π/2 - atan(x)',
    example: 'atan(1/x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'asec',
    nameAr: 'قوس القاطع (Arcsec)',
    symbol: 'asec(x)',
    template: 'acos(1/x)',
    category: 'inv_trig',
    categoryAr: 'المثلثية العكسية',
    descriptionAr: 'الدالة العكسية للقاطع: asec(x) = acos(1/x)',
    example: 'acos(1/x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'acsc',
    nameAr: 'قوس قاطع التمام (Arccsc)',
    symbol: 'acsc(x)',
    template: 'asin(1/x)',
    category: 'inv_trig',
    categoryAr: 'المثلثية العكسية',
    descriptionAr: 'الدالة العكسية لقاطع التمام: acsc(x) = asin(1/x)',
    example: 'asin(1/x)',
    defaultRange: [-5, 5]
  },

  // --- 3. الدوال الزائدية وعكوسها (Hyperbolic - 12) ---
  {
    id: 'sinh',
    nameAr: 'الجيب الزائدي (Sinh)',
    symbol: 'sinh(x)',
    template: 'sinh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'دالة الجيب الزائدي الفردية sinh(x) = (e^x - e^-x)/2',
    example: 'sinh(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'cosh',
    nameAr: 'جيب التمام الزائدي (Cosh)',
    symbol: 'cosh(x)',
    template: 'cosh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'منحنى السلسلة المعلقة (Catenary curve): cosh(x) = (e^x + e^-x)/2',
    example: 'cosh(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'tanh',
    nameAr: 'الظل الزائدي (Tanh)',
    symbol: 'tanh(x)',
    template: 'tanh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'دالة تنشيط شهيرة في الشبكات العصبية محصورة بين -1 و +1',
    example: 'tanh(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'coth',
    nameAr: 'ظل التمام الزائدي (Coth)',
    symbol: 'coth(x)',
    template: '1/tanh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'مقلوب الظل الزائدي: cosh(x)/sinh(x)',
    example: '1/tanh(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'sech',
    nameAr: 'القاطع الزائدي (Sech)',
    symbol: 'sech(x)',
    template: '1/cosh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'تمثل شكل النبضات الضوئية المفردة في الألياف البصرية (Solitons)',
    example: '1/cosh(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'csch',
    nameAr: 'قاطع التمام الزائدي (Csch)',
    symbol: 'csch(x)',
    template: '1/sinh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'مقلوب الجيب الزائدي: 1/sinh(x)',
    example: '1/sinh(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'asinh',
    nameAr: 'معكوس الجيب الزائدي (Asinh)',
    symbol: 'asinh(x)',
    template: 'asinh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'الدالة العكسية لـ sinh: ln(x + sqrt(x^2 + 1))',
    example: 'asinh(x)',
    defaultRange: [-8, 8]
  },
  {
    id: 'acosh',
    nameAr: 'معكوس جيب التمام الزائدي (Acosh)',
    symbol: 'acosh(x)',
    template: 'acosh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'الدالة العكسية لـ cosh مع x >= 1: ln(x + sqrt(x^2 - 1))',
    example: 'acosh(x)',
    defaultRange: [1, 10]
  },
  {
    id: 'atanh',
    nameAr: 'معكوس الظل الزائدي (Atanh)',
    symbol: 'atanh(x)',
    template: 'atanh(x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'الدالة العكسية لـ tanh لمجال (-1, 1): 0.5 * ln((1+x)/(1-x))',
    example: 'atanh(x)',
    defaultRange: [-1.2, 1.2]
  },
  {
    id: 'acoth',
    nameAr: 'معكوس ظل التمام الزائدي (Acoth)',
    symbol: 'acoth(x)',
    template: 'atanh(1/x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'معكوس دالة coth لـ |x| > 1',
    example: 'atanh(1/x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'asech',
    nameAr: 'معكوس القاطع الزائدي (Asech)',
    symbol: 'asech(x)',
    template: 'acosh(1/x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'معكوس دالة sech لـ 0 < x <= 1',
    example: 'acosh(1/x)',
    defaultRange: [0, 2]
  },
  {
    id: 'acsch',
    nameAr: 'معكوس قاطع التمام الزائدي (Acsch)',
    symbol: 'acsch(x)',
    template: 'asinh(1/x)',
    category: 'hyperbolic',
    categoryAr: 'الدوال الزائدية وعكوسها',
    descriptionAr: 'معكوس دالة csch لجميع القيم غير الصفرية',
    example: 'asinh(1/x)',
    defaultRange: [-6, 6]
  },

  // --- 4. الأسس واللوغاريتمات (Exponential & Log - 10) ---
  {
    id: 'exp',
    nameAr: 'الدالة الأسية الطبيعية (eˣ)',
    symbol: 'e^x',
    template: 'exp(x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'دالة النمو الأسي ومشتقتها تساوي نفسها: d/dx(e^x) = e^x',
    example: 'exp(x)',
    defaultRange: [-4, 4]
  },
  {
    id: 'exp_neg',
    nameAr: 'الاضمحلال الأسي (e⁻ˣ)',
    symbol: 'e^-x',
    template: 'exp(-x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'تصف التحلل الإشعاعي وتفريغ المكثفات وتبريد نيوتن',
    example: 'exp(-0.5*x)',
    defaultRange: [-2, 8]
  },
  {
    id: 'exp_neg_sq',
    nameAr: 'الأس الجاوسي (e⁻ˣ²)',
    symbol: 'e^-x²',
    template: 'exp(-x^2)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'جوهر منحنى التوزيع الطبيعي والنبضات الليزرية',
    example: 'exp(-x^2)',
    defaultRange: [-4, 4]
  },
  {
    id: 'ln',
    nameAr: 'اللوغاريتم الطبيعي (ln x)',
    symbol: 'ln(x)',
    template: 'ln(x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'لوغاريتم للأساس e، مقلوب الدالة الأسية الطبيعية',
    example: 'ln(x)',
    defaultRange: [0.1, 15]
  },
  {
    id: 'log10',
    nameAr: 'اللوغاريتم العشري (log₁₀ x)',
    symbol: 'log(x)',
    template: 'log(x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'مقياس درجات ريختر للزلازل وشدة الصوت بالديسيبل والرقم الهيدروجيني pH',
    example: 'log(x)',
    defaultRange: [0.1, 20]
  },
  {
    id: 'log2',
    nameAr: 'اللوغاريتم الثنائي (log₂ x)',
    symbol: 'log₂(x)',
    template: 'log2(x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'أساس علوم الحاسوب ونظرية المعلومات وشجرة البحث الثنائية',
    example: 'log2(x)',
    defaultRange: [0.1, 16]
  },
  {
    id: 'pow2',
    nameAr: 'الأس الثنائي (2ˣ)',
    symbol: '2^x',
    template: '2^x',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'النمو التضاعفي والتكاثر الخلوي وسعة الذاكرة الرقمية',
    example: '2^x',
    defaultRange: [-4, 6]
  },
  {
    id: 'pow10',
    nameAr: 'قوى العشرة (10ˣ)',
    symbol: '10^x',
    template: '10^x',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'الدالة العكسية للوغاريتم العشري ورتب المقادير العلمية',
    example: '10^x',
    defaultRange: [-3, 3]
  },
  {
    id: 'x_exp_x',
    nameAr: 'دالة لامبرت الأثرية (x·eˣ)',
    symbol: 'x·e^x',
    template: 'x * exp(x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'الدالة التي تُعرف من خلالها دالة لامبرت W (Lambert W function)',
    example: 'x * exp(x)',
    defaultRange: [-4, 3]
  },
  {
    id: 'x_ln_x',
    nameAr: 'دالة الإنتروبيا الرياضية (x·ln x)',
    symbol: 'x·ln(x)',
    template: 'x * ln(x)',
    category: 'exp_log',
    categoryAr: 'الأسس واللوغاريتمات',
    descriptionAr: 'دالة شانون للإنتروبيا في الميكانيكا الإحصائية ونظرية المعلومات',
    example: 'x * ln(x)',
    defaultRange: [0.01, 5]
  },

  // --- 5. كثيرات الحدود والقوى (Polynomials & Powers - 12) ---
  {
    id: 'linear',
    nameAr: 'دالة خطية (Linear)',
    symbol: 'm·x + b',
    template: '2*x + 1',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'خط مستقيم بميل ثابت ومقطع صادي محدد',
    example: '2*x - 3',
    defaultRange: [-10, 10]
  },
  {
    id: 'quad_parabola',
    nameAr: 'القطع المكافئ (x²)',
    symbol: 'x²',
    template: 'x^2',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'دالة تربيعية متماثلة حول محور الصادات، رأسها عند نقطة الأصل',
    example: 'x^2 - 4',
    defaultRange: [-6, 6]
  },
  {
    id: 'cubic',
    nameAr: 'الدالة التكعيبية (x³)',
    symbol: 'x³',
    template: 'x^3',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'دالة فردية متزايدة ولها نقطة انعطاف عند المركز',
    example: 'x^3 - 3*x',
    defaultRange: [-5, 5]
  },
  {
    id: 'quartic',
    nameAr: 'دالة الدرجة الرابعة (x⁴)',
    symbol: 'x⁴',
    template: 'x^4',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'دالة زوجية قاعها أكثر تسطحاً وجوانبها أكثر انحداراً من القطع المكافئ',
    example: 'x^4 - 2*x^2',
    defaultRange: [-4, 4]
  },
  {
    id: 'quintic',
    nameAr: 'دالة الدرجة الخامسة (x⁵)',
    symbol: 'x⁵',
    template: 'x^5',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'كثيرة حدود من الدرجة الخامسة لا تملك حلاً جبرياً عاماً بالجذور (أبيل-روفيني)',
    example: 'x^5 - 5*x^3 + 4*x',
    defaultRange: [-3, 3]
  },
  {
    id: 'sqrt',
    nameAr: 'الجذر التربيعي (√x)',
    symbol: '√x',
    template: 'sqrt(x)',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'الجذر الموجب، معرف للأعداد الحقيقية غير السالبة x >= 0',
    example: 'sqrt(x)',
    defaultRange: [0, 16]
  },
  {
    id: 'cbrt',
    nameAr: 'الجذر التكعيبي (∛x)',
    symbol: '∛x',
    template: 'cbrt(x)',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'الجذر التكعيبي الحقيقي، معرف لجميع الأعداد الموجبة والسالبة',
    example: 'cbrt(x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'inv_x',
    nameAr: 'القطع الزائد المتساوي الساقين (1/x)',
    symbol: '1/x',
    template: '1/x',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'دالة المقلوب، تملك خطي تقارب: المحور السيني والمحور الصادي',
    example: '1/x',
    defaultRange: [-8, 8]
  },
  {
    id: 'inv_x2',
    nameAr: 'دالة التربيع المقلوب (1/x²)',
    symbol: '1/x²',
    template: '1/(x^2)',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'قانون التربيع العكسي في الجاذبية والكهرباء الساكنة وكثافة الضوء',
    example: '1/(x^2 + 0.1)',
    defaultRange: [-5, 5]
  },
  {
    id: 'rational_witch',
    nameAr: 'منحنى ساحرة أنيسي (Witch of Agnesi)',
    symbol: 'a³ / (x² + a²)',
    template: '8 / (x^2 + 4)',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'منحنى كلاسيكي أملس درسته عالمة الرياضيات ماريا أنيسي عام 1748',
    example: '8 / (x^2 + 4)',
    defaultRange: [-8, 8]
  },
  {
    id: 'parabola_inverted',
    nameAr: 'مسار المقذوف المنحني',
    symbol: 'h - k·x²',
    template: '10 - 0.2*x^2',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'مسار حركة قذيفة تحت تأثير مجال الجاذبية المنتظم مع إهمال مقاومة الهواء',
    example: '15 - 0.3*x^2',
    defaultRange: [-10, 10]
  },
  {
    id: 'chebyshev',
    nameAr: 'متعدد حدود تشيبيشيف T₃(x)',
    symbol: '4x³ - 3x',
    template: '4*x^3 - 3*x',
    category: 'poly_power',
    categoryAr: 'كثيرات الحدود والقوى',
    descriptionAr: 'متعددة حدود متعامدة مستخدمة في تقريب الدوال وتصميم المرشحات الإلكترونية',
    example: '4*x^3 - 3*x',
    defaultRange: [-1.5, 1.5]
  },

  // --- 6. التفاضل والتكامل والتحليل (Calculus & Analysis - 10) ---
  {
    id: 'derivative_poly',
    nameAr: 'مشتقة كثيرة حدود d/dx',
    symbol: 'd/dx (x³ - 3x)',
    template: '3*x^2 - 3',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'المشتقة الأولى لدالة x³ - 3x تعطي معدل التغير وميل المماس اللحظي',
    example: '3*x^2 - 3',
    defaultRange: [-4, 4]
  },
  {
    id: 'second_derivative',
    nameAr: 'المشتقة الثانية والتقعر (d²f/dx²)',
    symbol: 'd²/dx² (x⁴ - 4x²)',
    template: '12*x^2 - 8',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'تحدد تقعر المنحنى لأعلى أو لأسفل ونقاط الانقلاب والانعطاف',
    example: '12*x^2 - 8',
    defaultRange: [-3, 3]
  },
  {
    id: 'taylor_sin',
    nameAr: 'تقريب تايلور لدالة الجيب',
    symbol: 'x - x³/6 + x⁵/120',
    template: 'x - (x^3)/6 + (x^5)/120',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'متسلسلة ماكلوران من الدرجة الخامسة لتقريب دالة sin(x)',
    example: 'x - (x^3)/6 + (x^5)/120',
    defaultRange: [-5, 5]
  },
  {
    id: 'taylor_exp',
    nameAr: 'تقريب تايلور للدالة الأسية',
    symbol: '1 + x + x²/2 + x³/6',
    template: '1 + x + (x^2)/2 + (x^3)/6',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'تقريب متسلسلة تايلور للدالة الأسية e^x حول نقطة الأصل',
    example: '1 + x + (x^2)/2 + (x^3)/6',
    defaultRange: [-3, 3]
  },
  {
    id: 'tangent_line',
    nameAr: 'معادلة خط المماس للمنحنى',
    symbol: 'f(a) + f\'(a)(x - a)',
    template: '2*x - 1',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'مماس القطع المكافئ y=x² عند النقطة (1, 1)',
    example: '2*x - 1',
    defaultRange: [-4, 4]
  },
  {
    id: 'normal_line',
    nameAr: 'الخط العمودي على المماس',
    symbol: '-1/m · (x - a) + f(a)',
    template: '-0.5*x + 1.5',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'المستقيم العمودي على المماس عند نقطة التماس وميله يساوي مقلوب الميل بعكس الإشارة',
    example: '-0.5*x + 1.5',
    defaultRange: [-4, 4]
  },
  {
    id: 'curvature',
    nameAr: 'مقدار الانحناء الرياضي κ(x)',
    symbol: '|f"| / (1+f\'²)^(3/2)',
    template: '2 / ((1 + 4*x^2)^1.5)',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'مقياس درجة انحناء المنحنى عند كل نقطة للقطع المكافئ y=x²',
    example: '2 / ((1 + 4*x^2)^1.5)',
    defaultRange: [-3, 3]
  },
  {
    id: 'integral_poly',
    nameAr: 'الدالة الأصلية والتكامل العددي',
    symbol: '∫ (3x² + 2x) dx',
    template: 'x^3 + x^2',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'تكامل كثيرة حدود يمثل المساحة التراكمية تحت المنحنى',
    example: 'x^3 + x^2',
    defaultRange: [-4, 4]
  },
  {
    id: 'fourier_harmonic',
    nameAr: 'التوافقية الفورية الأولى والثالثة',
    symbol: 'sin(x) + sin(3x)/3',
    template: 'sin(x) + sin(3*x)/3',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'تجميع توافقيات فورير لتقريب الموجة المربعة',
    example: 'sin(x) + sin(3*x)/3 + sin(5*x)/5',
    defaultRange: [-10, 10]
  },
  {
    id: 'diff_quotient',
    nameAr: 'نسبة الفروق (Difference Quotient)',
    symbol: '[f(x+h) - f(x)] / h',
    template: '(sin(x + 0.1) - sin(x)) / 0.1',
    category: 'calculus',
    categoryAr: 'التفاضل والتكامل والتحليل',
    descriptionAr: 'التقريب العددي للمشتقة باستخدام خطوة صغيرة h=0.1',
    example: '(sin(x + 0.1) - sin(x)) / 0.1',
    defaultRange: [-10, 10]
  },

  // --- 7. التوزيعات الإحصائية والاحتمالية (Statistical Distributions - 10) ---
  {
    id: 'normal_pdf',
    nameAr: 'التوزيع الطبيعي المعياري (Standard Normal)',
    symbol: 'N(0, 1) PDF',
    template: 'exp(-0.5*x^2) / sqrt(2*pi)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'منحنى الجرس الأشهر في الإحصاء بمتوسط 0 وانحراف معياري 1',
    example: 'exp(-0.5*x^2) / sqrt(2*pi)',
    defaultRange: [-5, 5]
  },
  {
    id: 'cauchy_dist',
    nameAr: 'توزيع كوشي ولورنتز (Cauchy)',
    symbol: '1 / [π(1 + x²)]',
    template: '1 / (pi * (1 + x^2))',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'توزيع ذو ذيول ثقيلة، مشهور بعدم وجود متوسط حسابي أو تباين معرف له',
    example: '1 / (pi * (1 + x^2))',
    defaultRange: [-8, 8]
  },
  {
    id: 'laplace_dist',
    nameAr: 'توزيع لابلاس المزدوج (Laplace)',
    symbol: '0.5 · e⁻|ˣ|',
    template: '0.5 * exp(-abs(x))',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'توزيع أسي ثنائي متماثل ذو قمة حادة ومدببة عند الصفر',
    example: '0.5 * exp(-abs(x))',
    defaultRange: [-6, 6]
  },
  {
    id: 'logistic_pdf',
    nameAr: 'كثافة التوزيع اللوجستي (Logistic PDF)',
    symbol: 'e⁻ˣ / (1 + e⁻ˣ)²',
    template: 'exp(-x) / ((1 + exp(-x))^2)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'مشتقة الدالة اللوجستية وتستخدم في نماذج الانحدار اللوجستي والتعلم الآلي',
    example: 'exp(-x) / ((1 + exp(-x))^2)',
    defaultRange: [-6, 6]
  },
  {
    id: 'rayleigh_dist',
    nameAr: 'توزيع رايلي (Rayleigh Distribution)',
    symbol: 'x · e⁻ˣ²/2',
    template: 'x * exp(-0.5*x^2)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'نمذجة سرعة الرياح وتشتت الإشارات الراديوية وارتفاع أمواج البحر',
    example: 'x * exp(-0.5*x^2)',
    defaultRange: [0, 5]
  },
  {
    id: 'maxwell_boltzmann',
    nameAr: 'توزيع ماكسويل-بولتزمان للسرعات',
    symbol: 'x² · e⁻ˣ²',
    template: 'x^2 * exp(-x^2)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'يصف توزيع السرعات الجزيئية في الغاز المثالي في الديناميكا الحرارية',
    example: 'x^2 * exp(-x^2)',
    defaultRange: [0, 4]
  },
  {
    id: 'student_t',
    nameAr: 'توزيع تي ستيودنت (Student\'s t)',
    symbol: 't-Distribution (ν=3)',
    template: '1 / ((1 + (x^2)/3)^2)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'توزيع العينات الإحصائية الصغيرة عندما يكون الانحراف المعياري للمجتمع مجهولاً',
    example: '1 / ((1 + (x^2)/3)^2)',
    defaultRange: [-6, 6]
  },
  {
    id: 'exponential_dist',
    nameAr: 'التوزيع الأسي لزمن الانتظار',
    symbol: 'λ · e⁻ˡˣ',
    template: '1.5 * exp(-1.5 * x)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'يصف الفترات الزمنية بين الأحداث المتتالية في عمليات بواسون العشوائية',
    example: '1.5 * exp(-1.5 * x)',
    defaultRange: [0, 6]
  },
  {
    id: 'erf_function',
    nameAr: 'دالة الخطأ الإحصائية erf(x)',
    symbol: 'erf(x)',
    template: 'erf(x)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'تكامل دالة الكثافة للتوزيع الطبيعي، وتصف انتشار الحرارة والاحتمالات التراكمية',
    example: 'erf(x)',
    defaultRange: [-4, 4]
  },
  {
    id: 'erfc_function',
    nameAr: 'دالة الخطأ المتممة erfc(x)',
    symbol: 'erfc(x) = 1 - erf(x)',
    template: '1 - erf(x)',
    category: 'distributions',
    categoryAr: 'التوزيعات الإحصائية والاحتمالية',
    descriptionAr: 'تصف احتمال الخطأ في نظم الاتصالات الرقمية وانتقال الكتلة',
    example: '1 - erf(x)',
    defaultRange: [-3, 3]
  },

  // --- 8. الدوال الخاصة والفيزيائية (Special Functions - 10) ---
  {
    id: 'gamma_func',
    nameAr: 'دالة جاما لأويلر Γ(x)',
    symbol: 'Gamma(x)',
    template: 'gamma(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'تعميم المضروب للأعداد الحقيقية والمركبة: Γ(n) = (n-1)!',
    example: 'gamma(x)',
    defaultRange: [0.1, 5]
  },
  {
    id: 'sigmoid',
    nameAr: 'الدالة اللوجستية السيجمويدية (Sigmoid)',
    symbol: 'σ(x) = 1 / (1 + e⁻ˣ)',
    template: 'sigmoid(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'دالة التنشيط الأساسية في الذكاء الاصطناعي التي تحول المدخلات لاحتمالات [0, 1]',
    example: 'sigmoid(x)',
    defaultRange: [-8, 8]
  },
  {
    id: 'relu',
    nameAr: 'دالة الوحدة الخطية المصححة (ReLU)',
    symbol: 'ReLU(x) = max(0, x)',
    template: 'relu(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'أشهر دالة تنشيط في الشبكات العصبية العميقة لمنع تلاشي التدرج',
    example: 'relu(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'softplus',
    nameAr: 'دالة سوفت بلس الملساء (Softplus)',
    symbol: 'ln(1 + eˣ)',
    template: 'softplus(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'تقريب أملس وقابل للاشتقاق لدالة ReLU: ln(1 + e^x)',
    example: 'softplus(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'bessel_j0',
    nameAr: 'دالة بيسل من النوع الأول J₀(x)',
    symbol: 'J₀(x)',
    template: 'bessel_J0(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'تصف اهتزازات الأغشية الدائرية (كالطبل) وأنماط حيود الضوء الدائرية (قرص إيري)',
    example: 'bessel_J0(x)',
    defaultRange: [-15, 15]
  },
  {
    id: 'bessel_j1',
    nameAr: 'دالة بيسل من الدرجة الأولى J₁(x)',
    symbol: 'J₁(x)',
    template: 'bessel_J1(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'المشتقة العكسية لـ J₀، تصف شدة الإشعاع الكهرومغناطيسي في المرشدات الموجية الأسطوانية',
    example: 'bessel_J1(x)',
    defaultRange: [-15, 15]
  },
  {
    id: 'airy_ai',
    nameAr: 'دالة إيري البصرية Ai(x)',
    symbol: 'Airy Ai(x)',
    template: 'airy_Ai(x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'حل معادلة شروودنجر لجسيم في مجال خطي وحيود الضوء عند قوس قزح',
    example: 'airy_Ai(x)',
    defaultRange: [-10, 4]
  },
  {
    id: 'heart_math',
    nameAr: 'معادلة قلب الحب الرياضية الكلاسيكية',
    symbol: 'منحنى القلب',
    template: 'sqrt(abs(x)) + 0.7*sqrt(4 - x^2)*sin(20*x)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'دالة رياضية رائعة ترسم شكل قلب حب هندسي أنيق',
    example: 'sqrt(abs(x)) + 0.7*sqrt(4 - x^2)*sin(20*x)',
    defaultRange: [-2, 2]
  },
  {
    id: 'dirac_approx',
    nameAr: 'تقريب نبضة ديراك (Dirac Delta)',
    symbol: 'δ(x) Approx',
    template: '(1 / (0.2 * sqrt(pi))) * exp(-(x/0.2)^2)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'نبضة فائقة الضيق تمثل الصدمات اللحظية والشحنات النقطية في الفيزياء',
    example: '(1 / (0.2 * sqrt(pi))) * exp(-(x/0.2)^2)',
    defaultRange: [-2, 2]
  },
  {
    id: 'lorentz_resonance',
    nameAr: 'منحنى الرنين اللورنتزي (Resonance)',
    symbol: '1 / [(ω² - ω₀²)² + γ²ω²]',
    template: '1 / ((x^2 - 4)^2 + 0.5*x^2)',
    category: 'special',
    categoryAr: 'الدوال الرياضية والفيزيائية الخاصة',
    descriptionAr: 'سعة استجابة الدوائر الرنانة RLC والتجاوب الميكانيكي للمباني عند التردد الطبيعي',
    example: '1 / ((x^2 - 4)^2 + 0.5*x^2)',
    defaultRange: [-5, 5]
  },

  // --- 9. الدوال المتقطعة والشروط (Piecewise & Step - 10) ---
  {
    id: 'abs_val',
    nameAr: 'القيمة المطلقة (|x|)',
    symbol: '|x|',
    template: 'abs(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'المسافة عن نقطة الأصل بدون اعتبار للإشارة، غير قابلة للاشتقاق عند الصفر',
    example: 'abs(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'signum',
    nameAr: 'دالة الإشارة (Signum: sgn)',
    symbol: 'sgn(x)',
    template: 'sign(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'تساوي +1 للموجب و -1 للسالب و 0 عند الصفر',
    example: 'sign(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'floor_func',
    nameAr: 'دالة الجزء الصحيح الأدنى (Floor: ⌊x⌋)',
    symbol: '⌊x⌋',
    template: 'floor(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'دالة درجية تعطي أكبر عدد صحيح أقل من أو يساوي x',
    example: 'floor(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'ceil_func',
    nameAr: 'دالة السقف (Ceil: ⌈x⌉)',
    symbol: '⌈x⌉',
    template: 'ceil(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'دالة درجية تعطي أصغر عدد صحيح أكبر من أو يساوي x',
    example: 'ceil(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'round_func',
    nameAr: 'دالة التقريب لأقرب عدد صحيح',
    symbol: 'round(x)',
    template: 'round(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'تقرب القيمة للعدد الصحيح الأقرب بدرجات متساوية',
    example: 'round(x)',
    defaultRange: [-6, 6]
  },
  {
    id: 'fractional_part',
    nameAr: 'دالة الجزء الكسري (Fract: {x})',
    symbol: '{x} = x - ⌊x⌋',
    template: 'fract(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'موجة سن منشار دورية ناتجة عن طرح الجزء الصحيح من العدد',
    example: 'fract(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'heaviside_step',
    nameAr: 'دالة الخطوة لهيفسايد (Heaviside H)',
    symbol: 'H(x)',
    template: 'step(x)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'تمثل بدء تشغيل المفاتيح الكهربائية والإشارات اللحظية: 0 قبل الصفر و 1 بعده',
    example: 'step(x)',
    defaultRange: [-5, 5]
  },
  {
    id: 'boxcar_pulse',
    nameAr: 'النبضة المستطيلة (Boxcar Pulse)',
    symbol: 'rect(x)',
    template: 'step(x + 1) - step(x - 1)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'نافذة مستطيلة قيمتها 1 في المجال [-1, 1] وصفراً في باقي النطاق',
    example: 'step(x + 1) - step(x - 1)',
    defaultRange: [-4, 4]
  },
  {
    id: 'clamp_func',
    nameAr: 'دالة التقييد والتشبع (Clamp)',
    symbol: 'clamp(x, -1, 1)',
    template: 'max(-1, min(1, x))',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'تقيد القيمة بين حد أدنى وأعلى، تحاكي تشبع المضخمات التناظرية',
    example: 'max(-1, min(1, x))',
    defaultRange: [-4, 4]
  },
  {
    id: 'mod_modulo',
    nameAr: 'دالة باقي القسمة (Modulo)',
    symbol: 'x mod 2',
    template: 'mod(x, 2)',
    category: 'piecewise',
    categoryAr: 'الدوال المتقطعة والشروط',
    descriptionAr: 'حساب باقي القسمة الرياضي لإنشاء أنماط دورية متكررة',
    example: 'mod(x, 2)',
    defaultRange: [-6, 6]
  },

  // --- 10. الأمواج والإشارات الفيزيائية (Waveforms & Signals - 10) ---
  {
    id: 'damped_wave',
    nameAr: 'الموجة التوافقية المخمدة (Damped Wave)',
    symbol: 'e⁻⁰·²ˣ · cos(3x)',
    template: 'exp(-0.2*x) * cos(3*x)',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'تذبذب ميكانيكي أو كهربائي يتلاشى مع الزمن بسبب المقاومة والاحتكاك',
    example: 'exp(-0.2*x) * cos(3*x)',
    defaultRange: [0, 20]
  },
  {
    id: 'beat_phenomenon',
    nameAr: 'ظاهرة التضارب الصوتي (Acoustic Beats)',
    symbol: 'cos(5x) + cos(6x)',
    template: 'cos(5*x) + cos(6*x)',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'تداخل موجتين بترددين متقاربين ينتج تذبذباً في سعة الصوت (التضارب)',
    example: 'cos(5*x) + cos(5.6*x)',
    defaultRange: [-15, 15]
  },
  {
    id: 'am_modulation',
    nameAr: 'تضمين السعة الإذاعي (AM Wave)',
    symbol: '[1 + m·cos(ωₘx)]·cos(ω꜀x)',
    template: '(1 + 0.5*cos(0.5*x)) * cos(6*x)',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'تضمين إشارة صوتية منخفضة التردد على موجة كهرومغناطيسية حاملة عالية التردد',
    example: '(1 + 0.5*cos(0.5*x)) * cos(6*x)',
    defaultRange: [-15, 15]
  },
  {
    id: 'square_wave',
    nameAr: 'الموجة المربعة الدورية (Square Wave)',
    symbol: 'Square Wave',
    template: 'sign(sin(x))',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'إشارة الساعة الرقمية (Clock pulse) في المعالجات والدوائر الرقمية',
    example: 'sign(sin(x))',
    defaultRange: [-12, 12]
  },
  {
    id: 'sawtooth_wave',
    nameAr: 'موجة سن المنشار (Sawtooth Wave)',
    symbol: 'Sawtooth Wave',
    template: '2 * (x/(2*pi) - floor(0.5 + x/(2*pi)))',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'تستخدم في المسح التلفزيوني ومولدات النغمات الموسيقية التناظرية',
    example: '2 * (x/(2*pi) - floor(0.5 + x/(2*pi)))',
    defaultRange: [-12, 12]
  },
  {
    id: 'triangle_wave',
    nameAr: 'الموجة المثلثية المتماثلة (Triangle Wave)',
    symbol: 'Triangle Wave',
    template: 'asin(sin(x)) * (2/pi)',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'موجة دورية خطية صاعدة وهابطة بمعدل تغير ثابت',
    example: 'asin(sin(x)) * (2/pi)',
    defaultRange: [-12, 12]
  },
  {
    id: 'chirp_signal',
    nameAr: 'إشارة الشيرب متزايدة التردد (Chirp)',
    symbol: 'sin(x²)',
    template: 'sin(0.2 * x^2)',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'إشارة يتزايد ترددها مع الزمن وتستخدم في الرادار والسونار واكتشاف موجات الجاذبية',
    example: 'sin(0.2 * x^2)',
    defaultRange: [-10, 10]
  },
  {
    id: 'standing_wave',
    nameAr: 'الموجة الموقوفة والعقد والبطون',
    symbol: '2A · sin(kx) · cos(ωt)',
    template: '2 * sin(1.5*x) * 0.8',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'تراكب موجتين متطابقتين متعاكستين في الاتجاه يشكل عقداً ساكنة وبطوناً متذبذبة',
    example: '2 * sin(1.5*x)',
    defaultRange: [-10, 10]
  },
  {
    id: 'soliton_pulse',
    nameAr: 'نبضة السوليتون المنعزلة (Soliton Wave)',
    symbol: '2 / cosh²(x)',
    template: '2 / (cosh(x)^2)',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'موجة ذاتية التعزيز تحتفظ بشكلها وسرعتها أثناء الانتشار لمسافات هائلة دون تشوه',
    example: '2 / (cosh(x)^2)',
    defaultRange: [-6, 6]
  },
  {
    id: 'riemann_wave',
    nameAr: 'التذبذب التوافقي المركب (Multitone Wave)',
    symbol: 'sin(x) + sin(2x)/2 + sin(3x)/3',
    template: 'sin(x) + sin(2*x)/2 + sin(3*x)/3',
    category: 'waves_signals',
    categoryAr: 'الأمواج والإشارات الفيزيائية',
    descriptionAr: 'صوت آلة موسيقية وترية غنية بالتوافقيات النغمية',
    example: 'sin(x) + sin(2*x)/2 + sin(3*x)/3',
    defaultRange: [-10, 10]
  }
];
