import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Bot, Book, Calculator, Sparkles, Video, ChevronRight, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

const ProgrammingSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mathOperation, setMathOperation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [mathCode, setMathCode] = useState('');
  const [mathLoading, setMathLoading] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);

  const suggestedQuestions = [
    "كيف أنشئ دالة لحساب المتوسط الحسابي؟",
    "ما الفرق بين المصفوفة والقائمة؟",
    "كيف أتعامل مع الأخطاء في البرمجة؟",
    "ما هي البرمجة الكائنية؟",
    "كيف أستخدم الحلقات التكرارية بشكل صحيح؟"
  ];

  const recommendedVideos = [
    { title: "أساسيات البرمجة للمبتدئين", url: "https://youtube.com/watch?v=example1" },
    { title: "شرح الخوارزميات", url: "https://youtube.com/watch?v=example2" },
    { title: "البرمجة الكائنية بالتفصيل", url: "https://youtube.com/watch?v=example3" },
  ];

  const programmingConcepts = [
    {
      title: "المتغيرات (Variables)",
      category: "أساسيات",
      desc: "حاويات لتخزين البيانات في الذاكرة أثناء تنفيذ البرنامج",
      detailed: "المتغيرات هي أساس البرمجة، حيث تُستخدم لتخزين القيم التي يمكن تغييرها أثناء تنفيذ البرنامج. كل متغير له اسم ونوع بيانات (مثل عدد صحيح، نص، منطقي). في لغات مثل Python، لا تحتاج لتحديد النوع بشكل صريح، بينما في Java و C++ يجب تحديد النوع.",
      example: "x = 10\nname = 'محمد'\nis_active = True"
    },
    {
      title: "الثوابت (Constants)",
      category: "أساسيات",
      desc: "قيم ثابتة لا يمكن تغييرها بعد تعريفها",
      detailed: "الثوابت تشبه المتغيرات لكنها لا تتغير طوال فترة تنفيذ البرنامج. تُستخدم للقيم التي تظل ثابتة مثل قيمة π أو عدد أيام الأسبوع. في بعض اللغات تُعرف باستخدام كلمة مفتاحية خاصة مثل const أو final.",
      example: "const PI = 3.14159\nfinal int MAX_USERS = 100"
    },
    {
      title: "الحلقات (Loops)",
      category: "التحكم",
      desc: "تكرار تنفيذ مجموعة من الأوامر عدة مرات",
      detailed: "الحلقات تسمح بتنفيذ كود معين مراراً وتكراراً. أنواع الحلقات الرئيسية: for (للتكرار عدد محدد من المرات)، while (التكرار طالما الشرط صحيح)، do-while (تنفذ مرة واحدة على الأقل ثم تتحقق من الشرط). الحلقات ضرورية للتعامل مع المصفوفات والقوائم.",
      example: "for i in range(5):\n    print(i)\n\nwhile x < 10:\n    x += 1"
    },
    {
      title: "الشروط (Conditions)",
      category: "التحكم",
      desc: "اتخاذ قرارات بناءً على شروط معينة",
      detailed: "الشروط تسمح للبرنامج باتخاذ قرارات. if-else تتحقق من شرط وتنفذ كوداً معيناً إذا كان صحيحاً وكوداً آخر إذا كان خاطئاً. switch-case تُستخدم لفحص قيمة متغير مقابل عدة خيارات. العوامل المنطقية (AND, OR, NOT) تُستخدم لدمج عدة شروط.",
      example: "if age >= 18:\n    print('بالغ')\nelse:\n    print('قاصر')"
    },
    {
      title: "الدوال (Functions)",
      category: "بنية الكود",
      desc: "كتل كود يمكن إعادة استخدامها عند الحاجة",
      detailed: "الدوال تنظم الكود وتجعله قابلاً لإعادة الاستخدام. تأخذ الدوال معاملات (parameters) كمدخلات وتُرجع قيمة (return value) كمخرج. الدوال تساعد في تقسيم المشاكل الكبيرة إلى أجزاء صغيرة قابلة للإدارة. المعاملات يمكن أن تكون اختيارية وأن يكون لها قيم افتراضية.",
      example: "def add(a, b):\n    return a + b\n\nresult = add(5, 3)"
    },
    {
      title: "المصفوفات (Arrays)",
      category: "هياكل البيانات",
      desc: "مجموعة من العناصر من نفس النوع مخزنة في ذاكرة متجاورة",
      detailed: "المصفوفات تخزن عناصر متعددة من نفس النوع. الوصول للعناصر يتم عبر الفهرس (index) الذي يبدأ من 0. المصفوفات ذات حجم ثابت في معظم اللغات. العمليات الشائعة: الوصول، التعديل، التكرار، الفرز، البحث. المصفوفات متعددة الأبعاد تُستخدم للبيانات ثنائية البعد مثل المصفوفات.",
      example: "numbers = [1, 2, 3, 4, 5]\nprint(numbers[0])  # 1\nmatrix = [[1,2], [3,4]]"
    },
    {
      title: "الكائنات (Objects)",
      category: "OOP",
      desc: "كيانات تجمع البيانات والدوال المرتبطة معاً",
      detailed: "الكائنات هي نُسخ (instances) من الأصناف (classes). تحتوي على خصائص (properties/attributes) وطرق (methods). الكائنات تمثل كيانات حقيقية في البرنامج مثل 'سيارة' أو 'مستخدم'. التفاعل بين الكائنات يحدث عبر استدعاء طرق بعضها البعض.",
      example: "class Car:\n    def __init__(self, model):\n        self.model = model\n    def drive(self):\n        print(f'{self.model} يتحرك')\n\nmy_car = Car('تويوتا')\nmy_car.drive()"
    },
    {
      title: "الأصناف (Classes)",
      category: "OOP",
      desc: "قوالب لإنشاء الكائنات تحدد خصائصها وسلوكها",
      detailed: "الصنف هو مخطط blueprint لإنشاء كائنات. يحدد الخصائص (البيانات) والطرق (السلوك) التي ستمتلكها الكائنات. الصنف لا يشغل ذاكرة حتى يتم إنشاء كائن منه. يمكن إنشاء عدد لا نهائي من الكائنات من نفس الصنف. Constructor هو دالة خاصة تُستدعى عند إنشاء كائن جديد.",
      example: "class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n    def study(self):\n        print(f'{self.name} يدرس')"
    },
    {
      title: "الوراثة (Inheritance)",
      category: "OOP",
      desc: "آلية تسمح لصنف بوراثة خصائص وطرق صنف آخر",
      detailed: "الوراثة تسمح بإعادة استخدام الكود من خلال إنشاء صنف جديد (الصنف الفرعي/المشتق) يرث من صنف موجود (الصنف الأساسي/الأب). الصنف الفرعي يرث كل خصائص وطرق الصنف الأساسي ويمكنه إضافة خصائص جديدة أو تعديل الموروثة (override). الوراثة تعكس علاقة 'is-a' (مثل: السيارة هي مركبة).",
      example: "class Vehicle:\n    def move(self):\n        print('يتحرك')\n\nclass Car(Vehicle):\n    def honk(self):\n        print('بوق!')"
    },
    {
      title: "التغليف (Encapsulation)",
      category: "OOP",
      desc: "إخفاء تفاصيل التنفيذ وإظهار واجهة بسيطة فقط",
      detailed: "التغليف يحمي البيانات من الوصول المباشر غير المصرح به. يتم ذلك بجعل الخصائص private وتوفير طرق public للوصول إليها (getters/setters). هذا يسمح بالتحكم في كيفية تعديل البيانات والتحقق من صحتها. التغليف يزيد من أمان الكود ويسهل صيانته لأن التغييرات الداخلية لا تؤثر على الكود الذي يستخدم الصنف.",
      example: "class Account:\n    def __init__(self):\n        self.__balance = 0\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount"
    },
    {
      title: "تعدد الأشكال (Polymorphism)",
      category: "OOP",
      desc: "قدرة كائنات مختلفة على الاستجابة لنفس الطريقة بطرق مختلفة",
      detailed: "تعدد الأشكال يسمح لطريقة واحدة بالعمل على أنواع مختلفة من الكائنات. يحدث عبر: 1) Method Overriding: إعادة تعريف طريقة موروثة في الصنف الفرعي. 2) Method Overloading: نفس اسم الطريقة بمعاملات مختلفة. تعدد الأشكال يجعل الكود أكثر مرونة وقابلية للتوسع.",
      example: "class Animal:\n    def sound(self):\n        pass\n\nclass Dog(Animal):\n    def sound(self):\n        return 'نباح'\n\nclass Cat(Animal):\n    def sound(self):\n        return 'مواء'"
    },
    {
      title: "التجريد (Abstraction)",
      category: "OOP",
      desc: "إخفاء التعقيد وإظهار الوظائف الأساسية فقط",
      detailed: "التجريد يركز على ما يفعله الكائن وليس كيف يفعله. يتم تحقيقه عبر الأصناف المجردة (Abstract Classes) والواجهات (Interfaces). الصنف المجرد لا يمكن إنشاء كائنات منه مباشرة، بل يجب أن يُورث. الطرق المجردة تُعرف بدون تنفيذ، ويجب على الأصناف الفرعية تنفيذها.",
      example: "from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self):\n        pass\n\nclass Circle(Shape):\n    def area(self):\n        return 3.14 * r * r"
    },
    {
      title: "المؤشرات (Pointers)",
      category: "إدارة الذاكرة",
      desc: "متغيرات تخزن عناوين الذاكرة لمتغيرات أخرى",
      detailed: "المؤشرات تخزن عنوان موقع في الذاكرة بدلاً من القيمة نفسها. شائعة في C/C++. عامل & يعطي عنوان المتغير، وعامل * يعطي القيمة في ذلك العنوان (dereferencing). المؤشرات قوية لكنها خطرة إذا لم تُستخدم بحذر. تُستخدم في: المصفوفات الديناميكية، القوائم المرتبطة، تمرير المعاملات بالمرجع.",
      example: "int x = 10;\nint* ptr = &x;  // ptr يشير إلى x\n*ptr = 20;      // يغير قيمة x إلى 20"
    },
    {
      title: "المراجع (References)",
      category: "إدارة الذاكرة",
      desc: "أسماء بديلة لمتغيرات موجودة",
      detailed: "المراجع مثل الأسماء المستعارة لمتغيرات موجودة. في C++، المرجع يُنشأ باستخدام &. المراجع أكثر أماناً من المؤشرات لأنها لا يمكن أن تكون null ولا يمكن تغييرها للإشارة إلى متغير آخر. تُستخدم غالباً لتمرير معاملات كبيرة للدوال بكفاءة دون نسخها.",
      example: "int x = 10;\nint& ref = x;  // ref مرجع لـ x\nref = 20;      // يغير x إلى 20"
    },
    {
      title: "النطاق (Scope)",
      category: "بنية الكود",
      desc: "المنطقة التي يكون فيها المتغير مرئياً وقابلاً للاستخدام",
      detailed: "النطاق يحدد أين يمكن الوصول للمتغير. أنواع النطاقات: 1) Global: مرئي في كل البرنامج. 2) Local: مرئي فقط داخل الدالة/الكتلة. 3) Block: داخل أقواس {}. المتغيرات المحلية تُنشأ عند دخول النطاق وتُحذف عند الخروج منه. متغير محلي يُخفي متغيراً عاماً بنفس الاسم (shadowing).",
      example: "global_var = 'عام'\n\ndef func():\n    local_var = 'محلي'\n    print(global_var)  # يمكن الوصول\n    print(local_var)   # يمكن الوصول\n\nprint(global_var)  # يمكن\n# print(local_var) # خطأ!"
    },
    {
      title: "التهيئة (Initialization)",
      category: "أساسيات",
      desc: "إعطاء قيمة ابتدائية للمتغير عند إنشائه",
      detailed: "التهيئة تعطي المتغير قيمة أولية. في بعض اللغات، المتغيرات غير المهيأة تحتوي على قيم عشوائية (garbage values). التهيئة يمكن أن تكون مباشرة (int x = 5) أو ديناميكية (من مُدخل المستخدم). في OOP، Constructor يُستخدم لتهيئة كائنات الأصناف. التهيئة الثابتة Static initialization تحدث قبل بدء البرنامج.",
      example: "int x = 10;  // تهيئة مباشرة\nint y;       // غير مهيأ (خطر)\ny = 20;      // تعيين القيمة لاحقاً"
    },
    {
      title: "العوامل (Operators)",
      category: "أساسيات",
      desc: "رموز تُستخدم لإجراء عمليات على المتغيرات والقيم",
      detailed: "العوامل أنواع: 1) حسابية: +، -، *، /، % (باقي القسمة). 2) مقارنة: ==، !=، >، <، >=، <=. 3) منطقية: AND (&&)، OR (||)، NOT (!). 4) تعيين: =، +=، -=، *=، /=. 5) bitwise: &، |، ^، ~، <<، >>. أولوية العوامل operator precedence تحدد ترتيب التنفيذ.",
      example: "x = 10 + 5 * 2    # الضرب أولاً\nis_valid = (x > 15) and (x < 25)\nx += 5             # x = x + 5"
    },
    {
      title: "الدوال المجهولة (Anonymous Functions)",
      category: "متقدم",
      desc: "دوال بدون اسم تُعرف وتُستخدم مباشرة",
      detailed: "الدوال المجهولة (Lambda functions) تُكتب inline وغالباً تُستخدم لمرة واحدة. في Python: lambda، في JavaScript: Arrow functions (=>). مفيدة مع دوال مثل map، filter، reduce. تجعل الكود أكثر إيجازاً لكن يجب استخدامها بحذر لتجنب التعقيد.",
      example: "# Python\nsquare = lambda x: x ** 2\nnumbers = [1, 2, 3, 4]\nsquared = list(map(lambda x: x**2, numbers))\n\n// JavaScript\nconst add = (a, b) => a + b;"
    },
    {
      title: "البرمجة الكائنية (OOP)",
      category: "نماذج البرمجة",
      desc: "نموذج برمجي يعتمد على الكائنات والأصناف",
      detailed: "OOP تنظم البرنامج حول الكائنات بدلاً من الدوال والمنطق. المبادئ الأربعة: التغليف، الوراثة، تعدد الأشكال، التجريد. مزايا: إعادة استخدام الكود، سهولة الصيانة، نمذجة أفضل للعالم الحقيقي. لغات OOP الشهيرة: Java، C++، Python، C#. تُستخدم في تطوير التطبيقات الكبيرة والمعقدة.",
      example: "class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.__balance = balance\n    \n    def deposit(self, amount):\n        self.__balance += amount\n    \n    def get_balance(self):\n        return self.__balance"
    },
    {
      title: "البرمجة الإجرائية (Procedural)",
      category: "نماذج البرمجة",
      desc: "نموذج يعتمد على تسلسل الإجراءات والدوال",
      detailed: "البرمجة الإجرائية تركز على الخطوات والإجراءات. البرنامج سلسلة من الأوامر تُنفذ بالترتيب. تستخدم الدوال لتنظيم الكود لكن بدون الكائنات. مناسبة للبرامج الصغيرة والبسيطة. لغات مثل C هي إجرائية بحتة. أبسط من OOP لكن أصعب في إدارة البرامج الكبيرة.",
      example: "def calculate_area(radius):\n    return 3.14 * radius * radius\n\ndef main():\n    r = float(input('نصف القطر: '))\n    area = calculate_area(r)\n    print(f'المساحة: {area}')\n\nmain()"
    },
    {
      title: "البرمجة الوظيفية (Functional)",
      category: "نماذج البرمجة",
      desc: "نموذج يعامل الحسابات كتقييم للدوال الرياضية",
      detailed: "البرمجة الوظيفية تتجنب تغيير الحالة والبيانات المتغيرة. الدوال pure functions لا تُغير شيئاً خارجها وتُرجع نفس النتيجة لنفس المدخلات. مفاهيم رئيسية: immutability، first-class functions، higher-order functions، recursion. لغات: Haskell، Lisp، Erlang. JavaScript و Python تدعم البرمجة الوظيفية جزئياً.",
      example: "# Pure function\ndef add(a, b):\n    return a + b\n\n# Higher-order function\ndef apply_twice(func, x):\n    return func(func(x))\n\nresult = apply_twice(lambda x: x * 2, 5)  # 20"
    },
    {
      title: "الهياكل (Structures)",
      category: "هياكل البيانات",
      desc: "أنواع بيانات مخصصة تجمع متغيرات مختلفة",
      detailed: "الهياكل (struct في C/C++) تجمع متغيرات مختلفة الأنواع تحت اسم واحد. تشبه الأصناف لكن بدون طرق (في C). في Python، dataclass أو NamedTuple تخدم نفس الغرض. الهياكل مفيدة لتنظيم البيانات المترابطة مثل بيانات الطالب (الاسم، العمر، الدرجات).",
      example: "// C\nstruct Student {\n    char name[50];\n    int age;\n    float gpa;\n};\n\nstruct Student s1;\ns1.age = 20;"
    },
    {
      title: "القوائم (Lists)",
      category: "هياكل البيانات",
      desc: "مجموعات ديناميكية قابلة للتعديل من العناصر",
      detailed: "القوائم مثل المصفوفات لكن حجمها ديناميكي. يمكن إضافة/حذف عناصر أثناء التنفيذ. في Python، list مدمجة في اللغة. عمليات شائعة: append، insert، remove، pop، sort. القوائم المرتبطة Linked Lists تخزن عناصر متصلة بمؤشرات. الوصول بالفهرس O(1) في القوائم العادية، O(n) في المرتبطة.",
      example: "my_list = [1, 2, 3]\nmy_list.append(4)      # [1, 2, 3, 4]\nmy_list.insert(1, 10)  # [1, 10, 2, 3, 4]\nmy_list.remove(2)      # [1, 10, 3, 4]"
    },
    {
      title: "القواميس (Dictionaries)",
      category: "هياكل البيانات",
      desc: "مجموعات من أزواج المفتاح-القيمة",
      detailed: "القواميس (أو Hash Maps) تربط مفاتيح بقيم. الوصول بالمفتاح سريع جداً O(1) في المتوسط. المفاتيح يجب أن تكون فريدة وغير قابلة للتغيير. في Python: dict، في Java: HashMap، في JavaScript: Object. مفيدة للبحث السريع، التخزين المؤقت، عد التكرارات.",
      example: "student = {\n    'name': 'أحمد',\n    'age': 20,\n    'grade': 'A'\n}\n\nprint(student['name'])  # أحمد\nstudent['age'] = 21     # تحديث\nstudent['major'] = 'CS' # إضافة"
    },
    {
      title: "المكدسات (Stacks)",
      category: "هياكل البيانات",
      desc: "هيكل LIFO - آخر عنصر يدخل هو أول عنصر يخرج",
      detailed: "المكدس مثل كومة من الأطباق: آخر طبق تضعه هو أول طبق تأخذه. عمليتان أساسيتان: push (إضافة)، pop (إزالة وإرجاع). تُستخدم في: undo/redo، تقييم التعابير الرياضية، استدعاءات الدوال (call stack)، depth-first search. يمكن تنفيذها بالمصفوفات أو القوائم المرتبطة.",
      example: "stack = []\nstack.append(1)  # push\nstack.append(2)\nstack.append(3)\ntop = stack.pop()  # 3 (آخر عنصر)\nprint(stack)       # [1, 2]"
    },
    {
      title: "الطوابير (Queues)",
      category: "هياكل البيانات",
      desc: "هيكل FIFO - أول عنصر يدخل هو أول عنصر يخرج",
      detailed: "الطابور مثل طابور المطعم: أول شخص يصل، أول من يُخدم. عمليات: enqueue (إضافة في النهاية)، dequeue (إزالة من البداية). تُستخدم في: طباعة المستندات، معالجة المهام، breadth-first search. أنواع: Simple Queue، Circular Queue، Priority Queue، Deque (ثنائي الاتجاه).",
      example: "from collections import deque\nqueue = deque()\nqueue.append(1)  # enqueue\nqueue.append(2)\nfirst = queue.popleft()  # 1 (أول عنصر)\nprint(queue)             # deque([2])"
    },
    {
      title: "الشجرة (Tree)",
      category: "هياكل البيانات",
      desc: "هيكل هرمي من العقد المتصلة",
      detailed: "الشجرة تتكون من عقد nodes متصلة بأطراف edges. العقدة العليا هي الجذر root. كل عقدة لها عقد فرعية (أطفال). العقد بدون أطفال تسمى أوراق leaves. أنواع: Binary Tree، Binary Search Tree (BST)، AVL، Red-Black. تُستخدم في: أنظمة الملفات، DOM في المتصفحات، قواعد البيانات، ضغط البيانات (Huffman).",
      example: "class TreeNode:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\n\nroot = TreeNode(10)\nroot.left = TreeNode(5)\nroot.right = TreeNode(15)"
    },
    {
      title: "الرسم البياني (Graph)",
      category: "هياكل البيانات",
      desc: "مجموعة من العقد والحواف التي تربطها",
      detailed: "الرسم البياني يتكون من vertices (عقد) و edges (حواف). أنواع: موجه Directed/غير موجه Undirected، موزون Weighted/غير موزون. تمثيل: Adjacency Matrix، Adjacency List. خوارزميات شهيرة: DFS، BFS، Dijkstra (أقصر مسار)، Kruskal/Prim (MST). تُستخدم في: شبكات التواصل، خرائط GPS، جدولة المهام.",
      example: "# Adjacency List\ngraph = {\n    'A': ['B', 'C'],\n    'B': ['A', 'D'],\n    'C': ['A', 'D'],\n    'D': ['B', 'C']\n}"
    },
    {
      title: "الخوارزميات (Algorithms)",
      category: "مفاهيم متقدمة",
      desc: "مجموعة خطوات محددة لحل مشكلة",
      detailed: "الخوارزمية وصفة recipe لحل مشكلة. خصائص الخوارزمية الجيدة: صحيحة، فعّالة، واضحة، منتهية. أنواع: بحث Search، ترتيب Sorting، رسومات Graph، ديناميكي Dynamic Programming، جشع Greedy، تقسيم وحكم Divide & Conquer. مثال: خوارزمية الترتيب السريع QuickSort تقسم المصفوفة وترتبها بكفاءة.",
      example: "# Binary Search\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1"
    },
    {
      title: "التعقيد الزمني (Time Complexity)",
      category: "مفاهيم متقدمة",
      desc: "مقياس لسرعة تنفيذ الخوارزمية مع زيادة حجم المدخلات",
      detailed: "Big O Notation تصف كيف يزداد وقت التنفيذ مع حجم المدخلات. تعقيدات شائعة: O(1) ثابت، O(log n) لوغاريتمي، O(n) خطي، O(n log n) خطي لوغاريتمي، O(n²) تربيعي، O(2ⁿ) أُسّي. مثال: البحث الخطي O(n)، البحث الثنائي O(log n)، الترتيب الفقاعي O(n²)، QuickSort متوسط O(n log n).",
      example: "# O(1) - وصول مباشر\narr[5]\n\n# O(n) - حلقة واحدة\nfor i in arr:\n    print(i)\n\n# O(n²) - حلقة متداخلة\nfor i in arr:\n    for j in arr:\n        print(i, j)"
    },
    {
      title: "التعقيد المكاني (Space Complexity)",
      category: "مفاهيم متقدمة",
      desc: "مقياس للذاكرة التي تستهلكها الخوارزمية",
      detailed: "التعقيد المكاني يقيس كمية الذاكرة الإضافية المطلوبة. يشمل: متغيرات الإدخال، متغيرات محلية، مكدس الاستدعاءات recursion stack، هياكل بيانات مساعدة. O(1) ذاكرة ثابتة، O(n) خطية. مثال: خوارزمية in-place لا تحتاج ذاكرة إضافية O(1)، بينما merge sort تحتاج O(n). التوازن بين السرعة والذاكرة مهم.",
      example: "# O(1) space\ndef sum_array(arr):\n    total = 0\n    for num in arr:\n        total += num\n    return total\n\n# O(n) space\ndef copy_array(arr):\n    return arr.copy()"
    },
    {
      title: "العودية (Recursion)",
      category: "مفاهيم متقدمة",
      desc: "دالة تستدعي نفسها لحل مشكلة",
      detailed: "العودية تقسم المشكلة لأجزاء أصغر مشابهة. تحتاج: 1) Base case (حالة إيقاف). 2) Recursive case (استدعاء ذاتي). مثال كلاسيكي: Fibonacci، Factorial. ميزة: كود أبسط وأنظف. عيب: استهلاك ذاكرة بسبب call stack. كل استدعاء عودي يمكن تحويله لحلقة iterative.",
      example: "def factorial(n):\n    if n == 0:  # base case\n        return 1\n    return n * factorial(n-1)  # recursive\n\nprint(factorial(5))  # 120"
    },
    {
      title: "المعالجة المتوازية (Parallel Processing)",
      category: "برمجة متقدمة",
      desc: "تنفيذ عدة عمليات في وقت واحد",
      detailed: "المعالجة المتوازية تقسم المهمة لأجزاء تُنفذ معاً على عدة processors/cores. أنواع: Data Parallelism (نفس العملية على بيانات مختلفة)، Task Parallelism (عمليات مختلفة معاً). تحديات: تزامن Synchronization، race conditions، deadlock. مكتبات: OpenMP، MPI، Python multiprocessing. مفيدة للحسابات الثقيلة، معالجة الصور.",
      example": "from multiprocessing import Pool\n\ndef square(x):\n    return x * x\n\nwith Pool(4) as p:\n    results = p.map(square, [1,2,3,4,5])"
    },
    {
      title: "الخيوط (Threads)",
      category: "برمجة متقدمة",
      desc: "وحدات تنفيذ خفيفة داخل عملية واحدة",
      detailed: "الخيوط threads تسمح بتنفيذ أجزاء من البرنامج بالتوازي. تتشارك نفس الذاكرة مما يسهل التواصل لكن يخلق مشاكل تزامن. Multi-threading مفيد لـ I/O operations، واجهات المستخدم. في Python، GIL يحد من تعدد الخيوط الحقيقي. Java و C++ لديهم دعم ممتاز للخيوط.",
      example: "import threading\n\ndef print_numbers():\n    for i in range(5):\n        print(i)\n\nthread = threading.Thread(target=print_numbers)\nthread.start()\nthread.join()  # انتظر حتى ينتهي"
    },
    {
      title: "الاستثناءات (Exceptions)",
      category: "معالجة الأخطاء",
      desc: "أخطاء تحدث أثناء تنفيذ البرنامج",
      detailed: "الاستثناءات أحداث غير متوقعة تقطع التدفق الطبيعي. أنواع: ZeroDivisionError، FileNotFoundError، IndexError، ValueError، TypeError. يتم التعامل معها بـ try-except (Python) أو try-catch (Java/C++). يمكن رفع استثناءات مخصصة. finally block يُنفذ دائماً. الاستثناءات أفضل من إرجاع أكواد خطأ.",
      example: "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('لا يمكن القسمة على صفر')\nfinally:\n    print('دائماً يُنفذ')"
    },
    {
      title: "معالجة الأخطاء (Error Handling)",
      category: "معالجة الأخطاء",
      desc: "استراتيجيات للتعامل مع المواقف الخاطئة",
      detailed: "معالجة الأخطاء تجعل البرنامج أكثر قوة robustness. استراتيجيات: 1) تجاهل (سيء). 2) إيقاف البرنامج. 3) تسجيل الخطأ logging. 4) محاولة إصلاح. 5) إعلام المستخدم. defensive programming يتحقق من المدخلات. validation يتأكد من صحة البيانات. assertions للتحقق من الافتراضات أثناء التطوير.",
      example: "def divide(a, b):\n    if not isinstance(a, (int, float)):\n        raise TypeError('a يجب أن يكون رقماً')\n    if b == 0:\n        raise ValueError('لا يمكن القسمة على صفر')\n    return a / b"
    },
    {
      title: "الواجهات (Interfaces)",
      category: "OOP",
      desc: "عقد يحدد ما يجب أن تنفذه الأصناف",
      detailed: "الواجهة interface تعرف مجموعة من الطرق بدون تنفيذها. الصنف الذي يُنفذ implements الواجهة يجب أن يوفر تنفيذاً لكل طرق الواجهة. الواجهات تُستخدم لتحقيق تعدد الأشكال والتجريد. Java لديها interfaces صريحة، Python تستخدم Abstract Base Classes. الواجهات تفصل 'ما' عن 'كيف'.",
      example: "from abc import ABC, abstractmethod\n\nclass Drawable(ABC):\n    @abstractmethod\n    def draw(self):\n        pass\n\nclass Circle(Drawable):\n    def draw(self):\n        print('رسم دائرة')"
    },
    {
      title: "الترجمة (Compilation)",
      category: "تنفيذ البرامج",
      desc: "تحويل الكود المصدري إلى كود آلي",
      detailed: "الترجمة compilation تحول الكود عالي المستوى لكود آلي machine code مرة واحدة قبل التنفيذ. مراحل: Lexical Analysis، Parsing، Semantic Analysis، Optimization، Code Generation. لغات مترجمة: C، C++، Rust، Go. مزايا: سرعة تنفيذ عالية، أخطاء تُكتشف قبل التشغيل. عيوب: وقت ترجمة، ليست cross-platform بدون إعادة ترجمة.",
      example: "// C code -> Compile\n#include <stdio.h>\nint main() {\n    printf(\"Hello\");\n    return 0;\n}\n\n// gcc main.c -o main\n// ./main"
    },
    {
      title: "التفسير (Interpretation)",
      category: "تنفيذ البرامج",
      desc: "تنفيذ الكود سطراً بسطر مباشرة",
      detailed: "التفسير interpretation يقرأ وينفذ الكود مباشرة سطراً بسطر بدون ترجمة مسبقة. المُفسر interpreter يقرأ الكود، يحوله لبايت كود bytecode (أحياناً)، وينفذه. لغات مُفسرة: Python، JavaScript، Ruby. مزايا: مرونة، سهولة debugging، cross-platform. عيوب: أبطأ من اللغات المترجمة، الأخطاء تُكتشف وقت التشغيل.",
      example: "# Python (interpreted)\nprint('Hello')\n\n# يُنفذ مباشرة:\n# python script.py"
    },
    {
      title: "قواعد البيانات (Database)",
      category: "البيانات",
      desc: "نظام منظم لتخزين واسترجاع البيانات",
      detailed: "قواعد البيانات تخزن البيانات بشكل منظم. أنواع: 1) Relational (SQL): MySQL، PostgreSQL، Oracle - تستخدم جداول مترابطة. 2) NoSQL: MongoDB، Redis، Cassandra - أكثر مرونة. مفاهيم: Tables، Rows، Columns، Primary Key، Foreign Key، Indexes، Queries، Transactions (ACID). ORM (Object-Relational Mapping) يسهل التعامل مع قواعد البيانات من الكود.",
      example: "-- SQL\nCREATE TABLE students (\n    id INT PRIMARY KEY,\n    name VARCHAR(50),\n    grade FLOAT\n);\n\nINSERT INTO students VALUES (1, 'أحمد', 3.5);\n\nSELECT * FROM students WHERE grade > 3.0;"
    },
    {
      title: "واجهات البرمجة (APIs)",
      category: "التكامل",
      desc: "مجموعة قواعد للتواصل بين البرامج",
      detailed: "API (Application Programming Interface) تسمح للبرامج بالتواصل. أنواع: Web APIs، Library APIs، Operating System APIs. Web APIs تستخدم HTTP requests (GET، POST، PUT، DELETE). Endpoints تحدد الموارد المتاحة. API Documentation تشرح كيفية الاستخدام. Authentication (API keys، OAuth) تحمي APIs. Rate limiting يمنع الإفراط في الاستخدام.",
      example: "import requests\n\n# GET request\nresponse = requests.get('https://api.example.com/users')\ndata = response.json()\n\n# POST request\nresponse = requests.post(\n    'https://api.example.com/users',\n    json={'name': 'أحمد', 'age': 20}\n)"
    },
    {
      title: "واجهات RESTful (RESTful APIs)",
      category: "التكامل",
      desc: "نمط معماري لتصميم Web APIs",
      detailed: "REST (Representational State Transfer) مبادئ لتصميم APIs. مبادئ: 1) Stateless - كل طلب مستقل. 2) Client-Server - فصل واضح. 3) Cacheable - يمكن تخزين الردود مؤقتاً. 4) Uniform Interface - نمط موحد. تستخدم HTTP methods: GET (قراءة)، POST (إنشاء)، PUT (تحديث)، DELETE (حذف). الموارد تُعرّف بـ URLs. Status codes (200، 404، 500) تشير للنتيجة.",
      example: "# RESTful endpoints\nGET    /api/users        # كل المستخدمين\nGET    /api/users/123    # مستخدم محدد\nPOST   /api/users        # إنشاء مستخدم\nPUT    /api/users/123    # تحديث مستخدم\nDELETE /api/users/123    # حذف مستخدم"
    },
    {
      title: "JSON",
      category: "تنسيق البيانات",
      desc: "تنسيق خفيف لتبادل البيانات",
      detailed: "JSON (JavaScript Object Notation) تنسيق نصي لتمثيل البيانات المهيكلة. يستخدم أزواج key-value. أنواع البيانات: string، number، boolean، null، array، object. سهل القراءة للإنسان والآلة. مستخدم بكثرة في Web APIs، ملفات الإعدادات، NoSQL databases. كل لغة برمجة لديها مكتبة لمعالجة JSON.",
      example: '{\n  "name": "أحمد",\n  "age": 20,\n  "is_student": true,\n  "courses": ["رياضيات", "فيزياء"],\n  "address": {\n    "city": "عمان",\n    "country": "الأردن"\n  }\n}'
    },
    {
      title: "XML",
      category: "تنسيق البيانات",
      desc: "لغة ترميز قابلة للتوسع لتنظيم البيانات",
      detailed: "XML (eXtensible Markup Language) تنسيق نصي مرن. يستخدم tags مثل HTML لكن يمكنك تعريف tags خاصة. البنية هرمية. أكثر تفصيلاً من JSON. يدعم namespaces، schemas، comments. مستخدم في: ملفات الإعدادات، SOAP web services، تبادل البيانات بين الأنظمة القديمة. XML أقل شيوعاً الآن، JSON أكثر شعبية.",
      example: "<?xml version=\"1.0\"?>\n<student>\n  <name>أحمد</name>\n  <age>20</age>\n  <courses>\n    <course>رياضيات</course>\n    <course>فيزياء</course>\n  </courses>\n</student>"
    },
    {
      title: "Git",
      category: "أدوات التطوير",
      desc: "نظام للتحكم في الإصدارات",
      detailed: "Git نظام distributed version control يتتبع التغييرات في الكود. مفاهيم: Repository، Commit، Branch، Merge، Pull، Push، Clone. يسمح بالعمل الجماعي، الرجوع للإصدارات السابقة، تجربة ميزات جديدة في branches منفصلة. GitHub، GitLab، Bitbucket منصات استضافة. أوامر أساسية: git init، git add، git commit، git push، git pull.",
      example: "# إنشاء repository\ngit init\n\n# إضافة ملفات\ngit add .\n\n# commit\ngit commit -m \"Initial commit\"\n\n# إنشاء branch\ngit branch feature-x\ngit checkout feature-x\n\n# دمج\ngit checkout main\ngit merge feature-x"
    },
    {
      title: "التحكم في الإصدارات (Version Control)",
      category: "أدوات التطوير",
      desc: "إدارة التغييرات على الكود عبر الزمن",
      detailed: "Version Control يحفظ تاريخ كل تغيير في المشروع. فوائد: 1) تتبع من غيّر ماذا ومتى. 2) الرجوع لإصدارات سابقة. 3) التعاون بدون تضارب. 4) تجربة ميزات جديدة بأمان. أنواع: Centralized (SVN) vs Distributed (Git). Git هو الأكثر استخداماً. Workflows: Feature Branch، Gitflow، Trunk-based Development.",
      example: "# سير عمل نموذجي\n1. Clone repository\n2. إنشاء branch للميزة الجديدة\n3. كتابة الكود و commit\n4. Push ل remote repository\n5. فتح Pull Request للمراجعة\n6. Merge بعد الموافقة"
    },
    {
      title: "الإطارات (Framework)",
      category: "أدوات التطوير",
      desc: "بنية تحتية جاهزة لبناء التطبيقات",
      detailed: "Framework يوفر بنية ومكتبات وأدوات لتسريع التطوير. يفرض نمطاً معيناً (convention over configuration). أمثلة: Django (Python web)، React (JavaScript UI)، Spring (Java)، Laravel (PHP). مزايا: سرعة التطوير، معايير محددة، أمان مدمج، مجتمع كبير. عيوب: منحنى تعلم، قيود معينة. الإطار يستدعي كودك (inversion of control).",
      example: "# Django Framework\nfrom django.http import HttpResponse\nfrom django.urls import path\n\ndef home(request):\n    return HttpResponse('مرحباً')\n\nurlpatterns = [\n    path('', home),\n]"
    },
    {
      title: "المكتبات (Libraries)",
      category: "أدوات التطوير",
      desc: "مجموعات كود جاهزة لوظائف محددة",
      detailed: "المكتبة مجموعة من الدوال والأصناف الجاهزة. على عكس الإطار، أنت تستدعي المكتبة. أمثلة: NumPy (حسابات علمية)، Pandas (تحليل البيانات)، Requests (HTTP)، Matplotlib (رسوم بيانية). مزايا: توفير الوقت، كود مُختبر، تركيز على منطق التطبيق. مدير الحزم package manager (pip، npm) لتثبيت المكتبات.",
      example: "# استخدام مكتبة requests\nimport requests\n\nresponse = requests.get('https://api.example.com')\nprint(response.json())\n\n# استخدام NumPy\nimport numpy as np\narr = np.array([1, 2, 3, 4])\nprint(arr.mean())"
    },
    {
      title: "الاختبارات (Testing)",
      category: "جودة الكود",
      desc: "التحقق من أن الكود يعمل كما هو متوقع",
      detailed: "Testing يكتشف الأخطاء قبل الإنتاج. أنواع: 1) Unit Tests - اختبار دوال/طرق فردية. 2) Integration Tests - اختبار تفاعل المكونات. 3) End-to-End Tests - اختبار سيناريوهات المستخدم الكاملة. TDD (Test-Driven Development) يكتب الاختبارات قبل الكود. أدوات: pytest (Python)، JUnit (Java)، Jest (JavaScript). Coverage يقيس نسبة الكود المُختبر.",
      example: "import pytest\n\ndef add(a, b):\n    return a + b\n\ndef test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n    assert add(0, 0) == 0\n\n# تشغيل: pytest test_file.py"
    },
    {
      title: "تصميم البرمجيات (Software Design)",
      category: "جودة الكود",
      desc: "تخطيط بنية ومكونات النظام البرمجي",
      detailed: "Software Design يحدد كيف سيُبنى النظام. مراحل: Requirements، Architecture، Detailed Design، Implementation. مبادئ: SOLID، DRY، KISS، YAGNI. Design Patterns حلول مثبتة لمشاكل شائعة (Singleton، Factory، Observer، MVC). UML diagrams تُستخدم للتوثيق المرئي. تصميم جيد يسهل الصيانة والتوسع.",
      example: "# SOLID Principles\n# S - Single Responsibility\n# O - Open/Closed\n# L - Liskov Substitution\n# I - Interface Segregation\n# D - Dependency Inversion\n\n# مثال Singleton Pattern\nclass Database:\n    _instance = None\n    \n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance"
    }
  ];

  const handleAIAssistant = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال سؤالك", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('btec-programming-assistant', {
        body: { prompt: aiPrompt }
      });

      if (error) throw error;
      setAiResponse(data.response);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleMathToCode = async () => {
    if (!mathOperation.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال العملية الرياضية", variant: "destructive" });
      return;
    }

    setMathLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('btec-math-to-code', {
        body: { operation: mathOperation, language: selectedLanguage }
      });

      if (error) throw error;
      setMathCode(data.code);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setMathLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" dir="rtl">
      <SEO 
        title="البرمجة - تكنولوجيا المعلومات"
        description="مساعد ذكي للبرمجة، تعاريف المفاهيم البرمجية، وتحويل العمليات الرياضية إلى كود"
        keywords="برمجة, AI, مساعد ذكي, تعلم البرمجة, كود, algorithms"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/btec/information-technology')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
          >
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            العودة
          </button>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            البرمجة Programming
          </motion.h1>
          <p className="text-center text-white/70 mb-12 text-lg">منصة متكاملة لتعلم وممارسة البرمجة بمساعدة الذكاء الاصطناعي</p>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/5 p-2 backdrop-blur-sm">
              <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                <Bot className="w-5 h-5" />
                <span className="hidden sm:inline">مساعد ذكي</span>
              </TabsTrigger>
              <TabsTrigger value="concepts" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                <Book className="w-5 h-5" />
                <span className="hidden sm:inline">تعاريف مهمة</span>
              </TabsTrigger>
              <TabsTrigger value="math" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500">
                <Calculator className="w-5 h-5" />
                <span className="hidden sm:inline">رياضيات → كود</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Question Side */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-3xl text-white flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                      سؤالك
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                      اطرح أي سؤال برمجي واحصل على إجابة مفصلة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="مثال: كيف أنشئ دالة لحساب المتوسط الحسابي في Python؟"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[200px] bg-white/10 text-white text-lg border-cyan-500/30 focus:border-cyan-400"
                    />
                    <Button 
                      onClick={handleAIAssistant} 
                      disabled={aiLoading} 
                      className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      {aiLoading ? 'جاري المعالجة...' : 'اسأل المساعد الذكي'}
                    </Button>

                    <div className="space-y-3 pt-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        أسئلة مقترحة:
                      </h3>
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiPrompt(q)}
                          className="w-full text-right p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all text-sm border border-white/10 hover:border-cyan-400/50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        فيديوهات مقترحة:
                      </h3>
                      {recommendedVideos.map((vid, idx) => (
                        <a
                          key={idx}
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-400 hover:text-cyan-300 transition-all text-sm"
                        >
                          <Video className="w-4 h-4" />
                          {vid.title}
                          <ChevronRight className="w-4 h-4 mr-auto" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Answer Side */}
                <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-3xl text-white flex items-center gap-3">
                      <Bot className="w-8 h-8 text-blue-400" />
                      الإجابة
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                      ستظهر الإجابة المفصلة هنا
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiResponse ? (
                      <div className="bg-slate-950/50 p-6 rounded-xl border border-cyan-400/30 min-h-[400px]">
                        <pre className="text-white whitespace-pre-wrap text-right leading-relaxed">{aiResponse}</pre>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[400px] text-white/50 space-y-4">
                        <Bot className="w-20 h-20 opacity-20" />
                        <p className="text-center">اطرح سؤالك لتظهر الإجابة هنا</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="concepts">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">المفاهيم البرمجية الأساسية</h2>
                  <p className="text-white/70">انقر على أي مفهوم لعرض التفاصيل الكاملة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programmingConcepts.map((concept, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card 
                        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-400/50 transition-all h-full cursor-pointer group hover:scale-105"
                        onClick={() => setSelectedConcept(concept)}
                      >
                        <CardHeader>
                          <Badge className="w-fit mb-2 bg-purple-500/20 text-purple-300 border-purple-400/50">
                            {concept.category}
                          </Badge>
                          <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                            {concept.title}
                          </CardTitle>
                          <CardDescription className="text-white/70 line-clamp-2">
                            {concept.desc}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-purple-400 text-sm">
                            <ChevronRight className="w-4 h-4" />
                            انقر للمزيد
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Concept Detail Dialog */}
              <AnimatePresence>
                {selectedConcept && (
                  <Dialog open={!!selectedConcept} onOpenChange={() => setSelectedConcept(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900/50 text-white border-purple-500/30">
                      <DialogHeader>
                        <DialogTitle className="text-3xl flex items-center gap-3">
                          <Book className="w-8 h-8 text-purple-400" />
                          {selectedConcept.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/50">
                          {selectedConcept.category}
                        </Badge>
                        
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-purple-300">نظرة عامة</h3>
                          <p className="text-white/90 leading-relaxed">{selectedConcept.desc}</p>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-2 text-purple-300">شرح تفصيلي</h3>
                          <p className="text-white/90 leading-relaxed whitespace-pre-line">{selectedConcept.detailed}</p>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-3 text-purple-300">مثال عملي</h3>
                          <div className="bg-slate-950/70 p-6 rounded-xl border border-purple-400/30">
                            <pre className="text-green-300 text-sm leading-relaxed" dir="ltr">
                              {selectedConcept.example}
                            </pre>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedConcept(null)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          إغلاق
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="math">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Operation Input Side */}
                <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-3xl text-white flex items-center gap-3">
                      <Calculator className="w-8 h-8 text-green-400" />
                      العملية الرياضية
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                      صف العملية بالكلمات واختر لغة البرمجة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-white mb-2 block font-semibold">وصف العملية:</label>
                      <Textarea
                        placeholder="مثال: احسب مساحة الدائرة بمعلومية نصف القطر&#10;أو: اجمع كل الأعداد الزوجية من 1 إلى 100"
                        value={mathOperation}
                        onChange={(e) => setMathOperation(e.target.value)}
                        className="min-h-[150px] bg-white/10 text-white text-lg border-green-500/30 focus:border-green-400"
                      />
                    </div>

                    <div>
                      <label className="text-white mb-2 block font-semibold">لغة البرمجة:</label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="bg-white/10 text-white border-green-500/30 h-12 text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleMathToCode} 
                      disabled={mathLoading} 
                      className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      {mathLoading ? 'جاري التحويل...' : 'حول إلى كود'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Code Output Side */}
                <Card className="bg-gradient-to-br from-teal-900/30 to-green-900/30 border-teal-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-3xl text-white flex items-center gap-3">
                      <Bot className="w-8 h-8 text-teal-400" />
                      الكود الناتج
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                      الكود البرمجي المُولّد تلقائياً
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mathCode ? (
                      <div className="space-y-3">
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/50">
                          {selectedLanguage.toUpperCase()}
                        </Badge>
                        <div className="bg-slate-950/70 p-6 rounded-xl border border-teal-400/30 min-h-[300px] overflow-x-auto">
                          <pre className="text-green-300 text-sm leading-relaxed" dir="ltr">
                            {mathCode}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[400px] text-white/50 space-y-4">
                        <Calculator className="w-20 h-20 opacity-20" />
                        <p className="text-center">أدخل العملية الرياضية لتوليد الكود</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProgrammingSection;