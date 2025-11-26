import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Radio, Wifi, Lightbulb, Sun, Activity, Zap } from 'lucide-react';

interface WaveApplicationsProps {
  waveType: string;
}

const WaveApplications = ({ waveType }: WaveApplicationsProps) => {
  const applications = {
    radio: {
      icon: Radio,
      name: 'موجات الراديو',
      description: 'أطول الموجات في الطيف الكهرومغناطيسي',
      uses: [
        { title: 'البث الإذاعي', desc: 'نقل البرامج الإذاعية عبر ترددات AM و FM' },
        { title: 'التلفزيون', desc: 'بث القنوات التلفزيونية الأرضية' },
        { title: 'الاتصالات اللاسلكية', desc: 'الهواتف المحمولة والواي فاي' },
        { title: 'الملاحة', desc: 'أنظمة GPS والملاحة الجوية' }
      ],
      facts: [
        'يمكنها اختراق الجدران والمباني',
        'تنتقل لمسافات طويلة جداً',
        'تستخدم في علم الفلك الراديوي'
      ]
    },
    microwave: {
      icon: Wifi,
      name: 'الموجات الميكروية',
      description: 'موجات قصيرة نسبياً تستخدم في الاتصالات والطهي',
      uses: [
        { title: 'أفران الميكروويف', desc: 'تسخين الطعام عن طريق اهتزاز جزيئات الماء' },
        { title: 'الرادار', desc: 'كشف الطائرات والسفن والأجسام المتحركة' },
        { title: 'الأقمار الصناعية', desc: 'الاتصالات الفضائية ونقل البيانات' },
        { title: 'الواي فاي', desc: 'الإنترنت اللاسلكي والبلوتوث' }
      ],
      facts: [
        'تمتصها جزيئات الماء بشكل فعال',
        'تستخدم في الاتصالات الفضائية',
        'يمكن أن تسبب الحروق عند التعرض المباشر'
      ]
    },
    infrared: {
      icon: Lightbulb,
      name: 'الأشعة تحت الحمراء',
      description: 'إشعاع حراري يمكن الشعور به كحرارة',
      uses: [
        { title: 'التصوير الحراري', desc: 'كاميرات الرؤية الليلية والتصوير الحراري' },
        { title: 'أجهزة التحكم عن بعد', desc: 'التحكم في الأجهزة المنزلية' },
        { title: 'التدفئة', desc: 'سخانات الأشعة تحت الحمراء' },
        { title: 'الاتصالات قصيرة المدى', desc: 'نقل البيانات بين الأجهزة' }
      ],
      facts: [
        'جميع الأجسام الدافئة تشع أشعة تحت حمراء',
        'تستخدم في علاج بعض الحالات الطبية',
        'الغلاف الجوي يمتص معظمها'
      ]
    },
    visible: {
      icon: Sun,
      name: 'الضوء المرئي',
      description: 'الجزء الوحيد من الطيف الذي يمكننا رؤيته',
      uses: [
        { title: 'الرؤية', desc: 'تمكننا من رؤية العالم من حولنا' },
        { title: 'الإضاءة', desc: 'المصابيح والإنارة الاصطناعية' },
        { title: 'الألياف البصرية', desc: 'نقل البيانات بسرعات عالية جداً' },
        { title: 'التصوير الفوتوغرافي', desc: 'الكاميرات والتصوير' }
      ],
      facts: [
        'يتكون من ألوان الطيف السبعة',
        'يمثل جزءاً صغيراً جداً من الطيف الكهرومغناطيسي',
        'الشمس هي المصدر الطبيعي الرئيسي'
      ]
    },
    ultraviolet: {
      icon: Activity,
      name: 'الأشعة فوق البنفسجية',
      description: 'إشعاع غير مرئي بطاقة أعلى من الضوء المرئي',
      uses: [
        { title: 'التعقيم', desc: 'قتل البكتيريا والفيروسات' },
        { title: 'الكشف عن التزييف', desc: 'فحص الأوراق النقدية والوثائق' },
        { title: 'العلاج الطبي', desc: 'علاج بعض الأمراض الجلدية' },
        { title: 'إنتاج فيتامين D', desc: 'تصنيع فيتامين D في الجلد' }
      ],
      facts: [
        'يمكن أن تسبب حروق الشمس',
        'طبقة الأوزون تحمينا من معظمها',
        'تستخدم في تحليل المواد الكيميائية'
      ]
    },
    xray: {
      icon: Zap,
      name: 'الأشعة السينية',
      description: 'إشعاع عالي الطاقة يخترق معظم المواد',
      uses: [
        { title: 'التصوير الطبي', desc: 'تصوير العظام والأسنان' },
        { title: 'الأمن', desc: 'فحص الأمتعة في المطارات' },
        { title: 'تحليل المواد', desc: 'دراسة البنية البلورية للمواد' },
        { title: 'علم الفلك', desc: 'دراسة الأجسام الكونية عالية الطاقة' }
      ],
      facts: [
        'يمكنها اختراق الأنسجة الرخوة',
        'اكتشفها فيلهلم رونتجن عام 1895',
        'التعرض الزائد يمكن أن يكون ضاراً'
      ]
    },
    gamma: {
      icon: Zap,
      name: 'أشعة غاما',
      description: 'أعلى طاقة في الطيف الكهرومغناطيسي',
      uses: [
        { title: 'العلاج الإشعاعي', desc: 'علاج السرطان بقتل الخلايا السرطانية' },
        { title: 'التعقيم', desc: 'تعقيم المعدات الطبية والأغذية' },
        { title: 'علم الفلك', desc: 'دراسة الانفجارات الكونية' },
        { title: 'الصناعة', desc: 'فحص اللحامات والمواد' }
      ],
      facts: [
        'تنتج من التفاعلات النووية',
        'أخطر أنواع الإشعاع',
        'تحتاج لحماية من الرصاص أو الخرسانة السميكة'
      ]
    }
  };

  const currentApp = applications[waveType as keyof typeof applications] || applications.visible;
  const Icon = currentApp.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/20 rounded-full">
              <Icon className="text-primary" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{currentApp.name}</h3>
              <p className="text-sm text-muted-foreground">{currentApp.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">التطبيقات العملية</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentApp.uses.map((use, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-background/50 rounded-lg border border-border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h5 className="font-semibold text-foreground mb-2">{use.title}</h5>
                    <p className="text-sm text-muted-foreground">{use.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">حقائق مثيرة</h4>
              <div className="space-y-3">
                {currentApp.facts.map((fact, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <span className="text-primary font-bold">•</span>
                    <p className="text-sm text-foreground">{fact}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaveApplications;
