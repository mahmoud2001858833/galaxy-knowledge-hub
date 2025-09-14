import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  DollarSign, 
  Users, 
  Target, 
  BookOpen, 
  Download, 
  Star,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Package
} from 'lucide-react';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    description: string;
    examples: string;
    type: 'school' | 'home';
  };
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ isOpen, onClose, project }) => {
  const projectDetails = {
    // School projects details
    'paper-recycling': {
      summary: 'مشروع شامل لتجميع وإعادة تدوير الورق في البيئة المدرسية',
      objectives: [
        'تقليل النفايات الورقية في المدرسة',
        'تعليم الطلاب أهمية إعادة التدوير',
        'توفير المال من شراء الأوراق الجديدة',
        'حماية البيئة من التلوث'
      ],
      materials: [
        'صناديق تجميع مخصصة للورق',
        'ملصقات توضيحية',
        'ميزان صغير لقياس الكمية',
        'دفتر لتسجيل البيانات',
        'أكياس كبيرة للتخزين'
      ],
      steps: [
        'وضع صناديق التجميع في الفصول والمكاتب',
        'تعليم الطلاب كيفية فصل الورق',
        'جمع الأوراق أسبوعياً وقياس الكمية',
        'نقل الأوراق لمركز إعادة التدوير',
        'تسجيل النتائج ومتابعة التقدم'
      ],
      cost: '100-300 ريال',
      duration: 'مستمر طوال العام الدراسي',
      ageGroup: 'جميع المراحل الدراسية',
      safety: [
        'تجنب الأوراق الملوثة بالمواد الكيميائية',
        'غسل اليدين بعد التعامل مع الأوراق',
        'عدم تجميع الأوراق المبللة'
      ],
      benefits: [
        'توفير 500-1000 ريال سنوياً',
        'تقليل 2-5 أطنان من النفايات',
        'تعليم مهارات بيئية مهمة',
        'تحسين صورة المدرسة البيئية'
      ],
      variations: [
        'إضافة مسابقات بين الفصول',
        'إنشاء مشروع فني من الورق المعاد تدويره',
        'ربط المشروع بمادة العلوم',
        'دعوة خبراء بيئيين للمدرسة'
      ]
    },
    'plastic-recycling': {
      summary: 'مبادرة مدرسية لتقليل استخدام البلاستيك وإعادة تدوير المتبقي',
      objectives: [
        'تقليل النفايات البلاستيكية',
        'إعادة استخدام الزجاجات البلاستيكية',
        'تطوير الوعي البيئي لدى الطلاب',
        'تحويل النفايات إلى منتجات مفيدة'
      ],
      materials: [
        'زجاجات بلاستيكية فارغة',
        'مقص وأدوات قطع آمنة',
        'ألوان وأدوات زخرفة',
        'تربة ونباتات صغيرة',
        'أدوات ثقب'
      ],
      steps: [
        'جمع الزجاجات البلاستيكية النظيفة',
        'تنظيف وتجفيف الزجاجات',
        'قطع وتشكيل الزجاجات بأمان',
        'تزيين الزجاجات بالألوان',
        'استخدامها كأصص للنباتات'
      ],
      cost: '50-200 ريال',
      duration: 'شهر واحد للتنفيذ',
      ageGroup: 'المرحلة الابتدائية والمتوسطة',
      safety: [
        'استخدام مقصات آمنة تحت الإشراف',
        'تجنب الحواف الحادة',
        'ارتداء قفازات عند الحاجة',
        'التأكد من نظافة الزجاجات'
      ],
      benefits: [
        'تحويل 100+ زجاجة من النفايات',
        'إنتاج أصص نباتات مجانية',
        'تعليم مهارات يدوية',
        'تجميل البيئة المدرسية'
      ],
      variations: [
        'صنع حاويات تخزين للأقلام',
        'إنشاء نظام ري بسيط',
        'صنع ألعاب تعليمية',
        'عمل مجسمات فنية'
      ]
    },
    // Home projects details  
    'waste-sorting': {
      summary: 'نظام منزلي شامل لفصل وتصنيف النفايات المنزلية',
      objectives: [
        'تقليل كمية النفايات المختلطة',
        'تسهيل عملية إعادة التدوير',
        'توعية العائلة بأنواع النفايات',
        'المساهمة في حماية البيئة'
      ],
      materials: [
        '4 حاويات ملونة مختلفة',
        'ملصقات توضيحية',
        'دليل تصنيف النفايات',
        'قفازات واقية',
        'كيس للنفايات العضوية'
      ],
      steps: [
        'تحضير الحاويات وتجهيزها',
        'وضع ملصقات واضحة لكل نوع',
        'تعليم أفراد العائلة طريقة الفصل',
        'البدء بفصل النفايات يومياً',
        'ترتيب التخلص من كل نوع بطريقة صحيحة'
      ],
      cost: '80-150 ريال',
      duration: 'إعداد يوم واحد، تطبيق مدى الحياة',
      ageGroup: 'جميع أفراد العائلة',
      safety: [
        'ارتداء قفازات عند فصل النفايات',
        'غسل اليدين جيداً بعد التعامل مع النفايات',
        'تجنب خلط المواد الخطرة',
        'إبقاء المواد الحادة بعيداً عن الأطفال'
      ],
      benefits: [
        'تقليل 60-80% من النفايات المختلطة',
        'توفير مساحة في صندوق القمامة',
        'إمكانية بيع المواد القابلة للتدوير',
        'تحسين النظافة العامة للمنزل'
      ],
      variations: [
        'إضافة حاوية للمواد الخطرة',
        'إنشاء نظام مكافآت للأطفال',
        'ربط النشاط بتطبيق ذكي',
        'مشاركة النتائج مع الجيران'
      ]
    },
    'food-composting': {
      summary: 'تحويل بقايا الطعام العضوية إلى سماد طبيعي مفيد للنباتات',
      objectives: [
        'تقليل نفايات المطبخ العضوية',
        'إنتاج سماد طبيعي مجاني',
        'تحسين صحة النباتات المنزلية',
        'تعليم الأطفال عن دورة الطبيعة'
      ],
      materials: [
        'صندوق كبير بغطاء',
        'تربة عادية',
        'مواد عضوية (قشور الفواكه)',
        'أوراق شجر جافة',
        'مجرفة صغيرة'
      ],
      steps: [
        'إعداد صندوق السماد في مكان مناسب',
        'وضع طبقة من التربة في القاع',
        'إضافة بقايا الطعام العضوية',
        'تغطية بأوراق جافة وتربة',
        'تقليب الخليط أسبوعياً'
      ],
      cost: '50-100 ريال',
      duration: '2-3 أشهر لإنتاج السماد',
      ageGroup: 'جميع أفراد العائلة',
      safety: [
        'عدم إضافة اللحوم أو منتجات الألبان',
        'تجنب المواد المطبوخة بالزيت',
        'الحفاظ على توازن الرطوبة',
        'وضع الصندوق بعيداً عن المنزل'
      ],
      benefits: [
        'إنتاج 5-10 كج سماد شهرياً',
        'توفير 50-100 ريال من شراء السماد',
        'تقليل 30% من نفايات المطبخ',
        'تحسين نمو النباتات بشكل ملحوظ'
      ],
      variations: [
        'استخدام دود الأرض لتسريع العملية',
        'إضافة مواد أخرى مثل أوراق الشاي',
        'صنع سماد سائل من الخليط',
        'تسجيل يومياً لمراقبة التطور'
      ]
    }
  };

  const details = projectDetails[project.id as keyof typeof projectDetails];

  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-green-400">
            {project.title}
          </DialogTitle>
          <p className="text-white/70 mt-2">{details.summary}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Project Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">معلومات المشروع</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">المدة:</span>
                    <span className="text-white">{details.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">التكلفة:</span>
                    <span className="text-white">{details.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">العمر المناسب:</span>
                    <span className="text-white">{details.ageGroup}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white">الفوائد المتوقعة</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  {details.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Objectives */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">الأهداف التعليمية</h4>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {details.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Materials */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-orange-400" />
                  <h4 className="font-semibold text-white">المواد المطلوبة</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {details.materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="border-white/30 text-white/80">
                      {material}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-semibold text-white">خطوات التنفيذ</h4>
                </div>
                <ol className="space-y-3">
                  {details.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white/80 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Safety & Variations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h4 className="font-semibold text-white">احتياطات الأمان</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {details.safety.map((safety, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{safety}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold text-white">أفكار إضافية</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {details.variations.map((variation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{variation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                تحميل دليل المشروع
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Star className="w-4 h-4 mr-2" />
                إضافة للمفضلة
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;