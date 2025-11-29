import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

export const Function3DEducation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/30">
        <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
          دليل تمثيل الدوال ثلاثية الأبعاد
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is">
            <AccordionTrigger className="text-foreground hover:text-primary transition-colors">
              ما هي الدوال ثلاثية الأبعاد؟
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3">
              <p>
                الدوال ثلاثية الأبعاد هي دوال رياضية تعتمد على متغيرين مستقلين (x و y) وتنتج قيمة واحدة (z):
              </p>
              <div className="bg-background/30 p-4 rounded-lg font-mono text-center text-primary">
                z = f(x, y)
              </div>
              <p>
                مثال: <code className="bg-background/30 px-2 py-1 rounded">z = x² + y²</code> يمثل قطعًا مكافئًا دائريًا
              </p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li><strong>1D (نقطة):</strong> تحديد إحداثيات نقطة واحدة في الفضاء</li>
                <li><strong>2D (منحنى):</strong> دالة بمتغير واحد تشكل خطًا في الفضاء</li>
                <li><strong>3D (سطح):</strong> دالة بمتغيرين تشكل سطحًا في الفضاء</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="types">
            <AccordionTrigger className="text-foreground hover:text-primary transition-colors">
              أنواع السطوح الرياضية
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3">
              <div className="space-y-3">
                <div className="bg-background/20 p-3 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">السطوح التربيعية</h4>
                  <p className="text-sm">
                    مثل القطع المكافئ (z = x² + y²) والسرج (z = x² - y²)
                  </p>
                </div>
                <div className="bg-background/20 p-3 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">السطوح المثلثية</h4>
                  <p className="text-sm">
                    مثل الموجات (z = sin(x) × cos(y)) والتموجات الدائرية
                  </p>
                </div>
                <div className="bg-background/20 p-3 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">السطوح الأسية واللوغاريتمية</h4>
                  <p className="text-sm">
                    مثل التوزيع الغاوسي (z = e^(-(x²+y²)))
                  </p>
                </div>
                <div className="bg-background/20 p-3 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">السطوح البارامترية</h4>
                  <p className="text-sm">
                    حيث يتم تعريف x و y و z كدوال لمتغير واحد (t)
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="applications">
            <AccordionTrigger className="text-foreground hover:text-primary transition-colors">
              التطبيقات العملية
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>الهندسة والعمارة:</strong> تصميم الأسطح المنحنية والقباب</li>
                <li><strong>الفيزياء:</strong> وصف المجالات الكهرومغناطيسية والجاذبية</li>
                <li><strong>الاقتصاد:</strong> نمذجة دوال المنفعة والتكاليف</li>
                <li><strong>علم البيانات:</strong> تصور البيانات متعددة الأبعاد</li>
                <li><strong>الرسوم المتحركة:</strong> إنشاء تضاريس وأشكال ثلاثية الأبعاد</li>
                <li><strong>الهندسة الحيوية:</strong> نمذجة الأعضاء والأنسجة</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-to">
            <AccordionTrigger className="text-foreground hover:text-primary transition-colors">
              كيفية استخدام الأداة
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3">
              <ol className="list-decimal list-inside space-y-2 mr-4">
                <li>اختر البُعد المناسب (1D للنقاط، 2D للمنحنيات، 3D للسطوح)</li>
                <li>أدخل الدالة الرياضية باستخدام المتغيرات x و y</li>
                <li>حدد نطاق المحاور لتكبير أو تصغير منطقة العرض</li>
                <li>اضبط دقة الرسم (عدد النقاط) حسب الحاجة</li>
                <li>استخدم الفأرة للتدوير والعجلة للتكبير/التصغير</li>
                <li>جرّب الأمثلة الجاهزة لفهم أنواع الدوال المختلفة</li>
                <li>أضف دوال متعددة للمقارنة (حتى 5 دوال)</li>
                <li>خصص الألوان والشفافية لكل دالة</li>
              </ol>
              <div className="bg-primary/10 p-4 rounded-lg mt-4 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>نصيحة:</strong> ابدأ بالأمثلة الجاهزة لفهم كيفية إدخال الدوال، ثم جرّب إنشاء دوالك الخاصة!
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </motion.div>
  );
};
