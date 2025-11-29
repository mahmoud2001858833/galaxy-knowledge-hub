import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const FourierEducation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            دليل تعليمي شامل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-bold">
                ما هي سلسلة فورييه؟
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  سلسلة فورييه هي طريقة رياضية لتمثيل أي دالة دورية كمجموع لا نهائي من موجات 
                  جيبية (sin) وجيب تمام (cos) بترددات مختلفة.
                </p>
                <p className="font-mono text-sm bg-card/50 p-2 rounded" dir="ltr">
                  f(x) = a₀/2 + Σ[aₙcos(nπx/L) + bₙsin(nπx/L)]
                </p>
                <p>
                  حيث L هي نصف الفترة، و aₙ و bₙ هي المعاملات التي تحدد سعة كل موجة.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-bold">
                معنى المعاملات (a₀, aₙ, bₙ)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <div>
                  <h4 className="font-bold text-foreground mb-1">a₀ (المعامل الثابت):</h4>
                  <p>
                    يمثل متوسط قيمة الدالة على الفترة. إذا كان a₀ = 0، فالدالة متوازنة حول المحور الأفقي.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">aₙ (معاملات الجيب تمام):</h4>
                  <p>
                    تمثل سعة موجات cos بتردد n. الدوال الزوجية (f(-x) = f(x)) تحتوي فقط على حدود cos.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">bₙ (معاملات الجيب):</h4>
                  <p>
                    تمثل سعة موجات sin بتردد n. الدوال الفردية (f(-x) = -f(x)) تحتوي فقط على حدود sin.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-bold">
                ظاهرة غيبس (Gibbs Phenomenon)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  عند تقريب دالة لها قفزة مفاجئة (عدم استمرار)، يظهر تجاوز بنسبة ~9% من حجم القفزة 
                  بالقرب من نقطة عدم الاستمرار.
                </p>
                <p className="font-bold text-red-400">
                  ⚠️ هذا التجاوز لا يختفي حتى مع زيادة N إلى ما لا نهاية!
                </p>
                <p>
                  السبب: الموجات الجيبية ذات الترددات العالية تحاول "محاكاة" القفزة المفاجئة، 
                  لكنها تفشل في الوصول إلى دقة كاملة عند النقطة نفسها.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-bold">
                التطبيقات العملية
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>معالجة الإشارات:</strong> تحليل وتصفية الإشارات الصوتية والراديوية</li>
                  <li><strong>ضغط البيانات:</strong> JPEG للصور و MP3 للصوت يستخدمان تحويلات فورييه</li>
                  <li><strong>حل المعادلات التفاضلية:</strong> تحويل معادلات معقدة لحلول أبسط</li>
                  <li><strong>الفيزياء:</strong> تحليل الموجات الكهرومغناطيسية والميكانيكا الكمية</li>
                  <li><strong>الهندسة:</strong> تحليل الاهتزازات والديناميكا الحرارية</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-bold">
                كيفية استخدام الأداة
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-2">
                  <li>اختر نوع الدالة: عادية أو قطعية (piecewise)</li>
                  <li>أدخل الدالة f(x) أو اختر مثالاً جاهزاً من القائمة</li>
                  <li>استخدم لوحة الرموز الرياضية لإدخال رموز خاصة</li>
                  <li>اضبط عدد الحدود N (1-100) باستخدام الشريط المنزلق</li>
                  <li>شاهد التقريب يتحسن مع زيادة N</li>
                  <li>فعّل الأنيميشن لمشاهدة كيف يتطور التقريب تدريجياً</li>
                  <li>راقب نقاط عدم الاستمرار وظاهرة غيبس على الرسوم البيانية</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FourierEducation;
