import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Concept {
  title: string;
  category: string;
  desc: string;
  detailed: string;
  example: string;
}

const ConceptsTab = () => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  const concepts: Concept[] = [
    {
      title: "المتغيرات (Variables)",
      category: "أساسيات",
      desc: "حاويات لتخزين البيانات في الذاكرة",
      detailed: "المتغيرات هي أساس البرمجة. تُستخدم لتخزين القيم التي يمكن تغييرها أثناء تنفيذ البرنامج. كل متغير له اسم ونوع بيانات (عدد صحيح، نص، منطقي). في Python لا تحتاج لتحديد النوع بشكل صريح، بينما في Java و C++ يجب تحديد النوع.",
      example: "# Python\nx = 10\nname = 'أحمد'\nis_active = True\n\n// Java\nint x = 10;\nString name = \"أحمد\";\nboolean isActive = true;"
    },
    {
      title: "الحلقات (Loops)",
      category: "التحكم",
      desc: "تكرار تنفيذ مجموعة من الأوامر",
      detailed: "الحلقات تسمح بتنفيذ كود معين مراراً وتكراراً. أنواع الحلقات: for (للتكرار عدد محدد)، while (التكرار طالما الشرط صحيح)، do-while (تنفذ مرة واحدة على الأقل ثم تتحقق من الشرط).",
      example: "# Python\nfor i in range(5):\n    print(i)\n\nwhile x < 10:\n    x += 1\n\n// Java\nfor(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}"
    },
    {
      title: "الشروط (Conditions)",
      category: "التحكم",
      desc: "اتخاذ قرارات بناءً على شروط معينة",
      detailed: "الشروط تسمح للبرنامج باتخاذ قرارات. if-else تتحقق من شرط وتنفذ كوداً معيناً إذا كان صحيحاً وكوداً آخر إذا كان خاطئاً. العوامل المنطقية (AND, OR, NOT) تُستخدم لدمج عدة شروط.",
      example: "# Python\nif age >= 18:\n    print('بالغ')\nelse:\n    print('قاصر')\n\n// Java\nif (age >= 18) {\n    System.out.println(\"بالغ\");\n} else {\n    System.out.println(\"قاصر\");\n}"
    },
    {
      title: "الدوال (Functions)",
      category: "بنية الكود",
      desc: "كتل كود يمكن إعادة استخدامها",
      detailed: "الدوال تنظم الكود وتجعله قابلاً لإعادة الاستخدام. تأخذ معاملات كمدخلات وتُرجع قيمة كمخرج. تساعد في تقسيم المشاكل الكبيرة إلى أجزاء صغيرة قابلة للإدارة.",
      example: "# Python\ndef add(a, b):\n    return a + b\n\nresult = add(5, 3)\n\n// Java\npublic int add(int a, int b) {\n    return a + b;\n}"
    },
    {
      title: "المصفوفات (Arrays)",
      category: "هياكل البيانات",
      desc: "مجموعة من العناصر من نفس النوع",
      detailed: "المصفوفات تخزن عناصر متعددة من نفس النوع. الوصول للعناصر يتم عبر الفهرس الذي يبدأ من 0. المصفوفات ذات حجم ثابت في معظم اللغات.",
      example: "# Python\nnumbers = [1, 2, 3, 4, 5]\nprint(numbers[0])  # 1\n\n// Java\nint[] numbers = {1, 2, 3, 4, 5};\nSystem.out.println(numbers[0]);  // 1"
    },
    {
      title: "الكائنات (Objects)",
      category: "OOP",
      desc: "كيانات تجمع البيانات والدوال معاً",
      detailed: "الكائنات هي نُسخ من الأصناف. تحتوي على خصائص وطرق. الكائنات تمثل كيانات حقيقية في البرنامج مثل 'سيارة' أو 'مستخدم'.",
      example: "# Python\nclass Car:\n    def __init__(self, model):\n        self.model = model\n    def drive(self):\n        print(f'{self.model} يتحرك')\n\nmy_car = Car('تويوتا')\nmy_car.drive()"
    },
    {
      title: "معالجة الأخطاء (Exception Handling)",
      category: "الأمان",
      desc: "التعامل مع الأخطاء غير المتوقعة",
      detailed: "معالجة الأخطاء تمنع البرنامج من التوقف عند حدوث خطأ. try-catch تلتقط الأخطاء وتسمح بمعالجتها. أنواع الأخطاء: syntax errors (أخطاء نحوية)، runtime errors (أخطاء التنفيذ)، logical errors (أخطاء منطقية).",
      example: "# Python\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('لا يمكن القسمة على صفر')\nfinally:\n    print('انتهت العملية')"
    },
    {
      title: "القوائم (Lists)",
      category: "هياكل البيانات",
      desc: "مجموعة ديناميكية من العناصر",
      detailed: "القوائم تشبه المصفوفات لكنها مرنة الحجم. يمكن إضافة وحذف العناصر بسهولة. تدعم أنواع بيانات مختلفة في نفس القائمة (في بعض اللغات).",
      example: "# Python\nfruits = ['تفاح', 'موز', 'برتقال']\nfruits.append('عنب')\nfruits.remove('موز')\nprint(fruits)  # ['تفاح', 'برتقال', 'عنب']"
    },
    {
      title: "القواميس (Dictionaries)",
      category: "هياكل البيانات",
      desc: "تخزين البيانات بمفاتيح وقيم",
      detailed: "القواميس تخزن البيانات كأزواج key-value. الوصول للقيم يتم عبر المفتاح وليس الفهرس. مفيدة لتنظيم البيانات المعقدة.",
      example: "# Python\nstudent = {\n    'name': 'أحمد',\n    'age': 20,\n    'grade': 'A'\n}\nprint(student['name'])  # أحمد"
    },
    {
      title: "الوراثة (Inheritance)",
      category: "OOP",
      desc: "إنشاء أصناف جديدة من أصناف موجودة",
      detailed: "الوراثة تسمح بإنشاء صنف جديد يرث خصائص وطرق صنف آخر. الصنف الأب (parent/base class) والصنف الابن (child/derived class). تساعد في إعادة استخدام الكود وتنظيمه.",
      example: "# Python\nclass Animal:\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return 'نباح'\n\nclass Cat(Animal):\n    def speak(self):\n        return 'مواء'"
    },
    {
      title: "الخوارزميات (Algorithms)",
      category: "مفاهيم متقدمة",
      desc: "خطوات منطقية لحل المشاكل",
      detailed: "الخوارزمية هي مجموعة خطوات محددة لحل مشكلة. خصائص الخوارزمية الجيدة: واضحة، محددة، تنتهي بعد عدد محدود من الخطوات، فعّالة. أمثلة: خوارزميات الفرز، البحث، التشفير.",
      example: "# خوارزمية البحث الخطي\ndef linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1"
    },
    {
      title: "التعقيد الزمني (Time Complexity)",
      category: "مفاهيم متقدمة",
      desc: "قياس كفاءة الخوارزمية",
      detailed: "التعقيد الزمني يقيس عدد العمليات التي تحتاجها الخوارزمية بالنسبة لحجم المدخلات. رموز Big O: O(1) ثابت، O(n) خطي، O(n²) تربيعي، O(log n) لوغاريتمي.",
      example: "# O(1) - وصول مباشر\nfirst = arr[0]\n\n# O(n) - حلقة واحدة\nfor item in arr:\n    print(item)\n\n# O(n²) - حلقة متداخلة\nfor i in arr:\n    for j in arr:\n        print(i, j)"
    },
  ];

  const categories = ['جميع المفاهيم', 'أساسيات', 'التحكم', 'بنية الكود', 'هياكل البيانات', 'OOP', 'الأمان', 'مفاهيم متقدمة'];
  const [selectedCategory, setSelectedCategory] = useState('جميع المفاهيم');

  const filteredConcepts = selectedCategory === 'جميع المفاهيم'
    ? concepts
    : concepts.filter(c => c.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-sm ${
              selectedCategory === cat 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'hover:bg-white/10'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConcepts.map((concept, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className="cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/50"
              onClick={() => setSelectedConcept(concept)}
            >
              <CardHeader>
                <Badge className="w-fit mb-2 bg-purple-500/20">{concept.category}</Badge>
                <CardTitle className="text-xl">{concept.title}</CardTitle>
                <CardDescription className="text-gray-300">{concept.desc}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedConcept} onOpenChange={() => setSelectedConcept(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Book className="w-6 h-6 text-purple-400" />
              {selectedConcept?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConcept && (
            <div className="space-y-6 mt-4">
              <div>
                <Badge className="mb-3 bg-purple-500/20">{selectedConcept.category}</Badge>
                <p className="text-lg leading-relaxed text-gray-200">{selectedConcept.detailed}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-400" />
                  مثال توضيحي:
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/20">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{selectedConcept.example}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ConceptsTab;
