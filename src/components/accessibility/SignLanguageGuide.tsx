import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Hand, MessageSquare, ArrowLeftRight, Info, BookOpen, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignLanguageGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

// أوامر التحكم بلغة الإشارة
const gestureCommands = [
  { gesture: '✋', name: 'كف مفتوح', action: 'توقف / إيقاف', description: 'افتح كفك بالكامل لإيقاف أي عملية جارية' },
  { gesture: '☝️', name: 'إصبع واحد', action: 'التالي', description: 'ارفع إصبعك السبابة للانتقال للعنصر التالي' },
  { gesture: '✌️', name: 'إصبعان', action: 'السابق', description: 'ارفع إصبعين للرجوع للعنصر السابق' },
  { gesture: '👍', name: 'إبهام للأعلى', action: 'موافق / تأكيد', description: 'ارفع إبهامك للموافقة على الإجراء' },
  { gesture: '👎', name: 'إبهام للأسفل', action: 'رفض / إلغاء', description: 'اخفض إبهامك لرفض أو إلغاء الإجراء' },
  { gesture: '👉', name: 'إشارة لليمين', action: 'تمرير للأمام', description: 'أشر لليمين للتمرير للأمام' },
  { gesture: '👈', name: 'إشارة لليسار', action: 'تمرير للخلف', description: 'أشر لليسار للتمرير للخلف' },
  { gesture: '✊', name: 'قبضة مغلقة', action: 'تحديد / اختيار', description: 'اغلق قبضتك لتحديد العنصر الحالي' },
  { gesture: '🖐️', name: 'تحريك للأعلى', action: 'تكبير / رفع الصوت', description: 'حرك يدك للأعلى للتكبير' },
  { gesture: '🖐️↓', name: 'تحريك للأسفل', action: 'تصغير / خفض الصوت', description: 'حرك يدك للأسفل للتصغير' },
];

// قاموس لغة الإشارة
const signDictionary = [
  { word: 'مرحبا', signUrl: '/signs/hello.gif', category: 'تحيات' },
  { word: 'شكراً', signUrl: '/signs/thanks.gif', category: 'تحيات' },
  { word: 'نعم', signUrl: '/signs/yes.gif', category: 'ردود' },
  { word: 'لا', signUrl: '/signs/no.gif', category: 'ردود' },
  { word: 'أنا', signUrl: '/signs/me.gif', category: 'ضمائر' },
  { word: 'أنت', signUrl: '/signs/you.gif', category: 'ضمائر' },
];

const SignLanguageGuide: React.FC<SignLanguageGuideProps> = ({ isOpen, onClose }) => {
  const [textToConvert, setTextToConvert] = useState('');
  const [convertedSigns, setConvertedSigns] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleTextToSign = async () => {
    if (!textToConvert.trim()) {
      toast.error('الرجاء إدخال نص للتحويل');
      return;
    }

    setIsConverting(true);
    try {
      // محاكاة تحويل النص إلى لغة الإشارة
      // في التطبيق الحقيقي، سيتم استخدام API لتحويل النص
      const words = textToConvert.split(' ');
      const signs = words.map(word => {
        const found = signDictionary.find(s => s.word === word);
        return found?.signUrl || `📝 ${word}`;
      });
      setConvertedSigns(signs);
      toast.success('تم تحويل النص إلى لغة الإشارة');
    } catch (error) {
      console.error('Error converting text:', error);
      toast.error('حدث خطأ أثناء التحويل');
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-2 border-primary/20 shadow-2xl" dir="rtl">
            <CardHeader className="bg-gradient-to-l from-primary/10 to-purple-500/10 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Hand className="h-6 w-6 text-primary" />
                  </div>
                  دليل لغة الإشارة
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Tabs defaultValue="commands" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="commands" className="flex items-center gap-2">
                    <Hand className="h-4 w-4" />
                    أوامر التحكم
                  </TabsTrigger>
                  <TabsTrigger value="text-to-sign" className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    تحويل النص
                  </TabsTrigger>
                  <TabsTrigger value="learn" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    تعلم الإشارات
                  </TabsTrigger>
                </TabsList>

                {/* تبويب أوامر التحكم */}
                <TabsContent value="commands">
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700 dark:text-blue-300">كيفية استخدام أوامر اليد</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          استخدم هذه الإيماءات أمام الكاميرا للتحكم بالمنصة. تأكد من أن يدك واضحة ومضاءة جيداً.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {gestureCommands.map((cmd, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-4xl">{cmd.gesture}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{cmd.name}</span>
                              <span className="text-primary font-medium">← {cmd.action}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{cmd.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* تبويب تحويل النص إلى إشارة */}
                <TabsContent value="text-to-sign">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        تحويل النص إلى لغة الإشارة
                      </h3>
                      <Textarea
                        placeholder="اكتب النص الذي تريد تحويله إلى لغة الإشارة..."
                        value={textToConvert}
                        onChange={(e) => setTextToConvert(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={handleTextToSign}
                        disabled={isConverting}
                        className="mt-3 w-full"
                      >
                        <ArrowLeftRight className="ml-2 h-4 w-4" />
                        تحويل إلى لغة الإشارة
                      </Button>
                    </div>

                    {convertedSigns.length > 0 && (
                      <div className="border-t pt-6">
                        <h4 className="font-medium mb-4">النتيجة:</h4>
                        <div className="flex flex-wrap gap-4 justify-center">
                          {convertedSigns.map((sign, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="w-24 h-24 bg-muted/50 rounded-xl flex items-center justify-center text-3xl border-2 border-primary/20"
                            >
                              {sign.startsWith('/') ? (
                                <img src={sign} alt="إشارة" className="w-full h-full object-contain" />
                              ) : (
                                sign
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <h4 className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        قريباً: تحويل لغة الإشارة إلى نص
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        سيتم إضافة خاصية التعرف على إيماءات اليد من الكاميرا وتحويلها تلقائياً إلى نص عربي.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* تبويب تعلم الإشارات */}
                <TabsContent value="learn">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      قاموس لغة الإشارة العربية
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {signDictionary.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-muted/30 rounded-xl p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-3">
                            🤟
                          </div>
                          <h4 className="font-semibold text-lg">{item.word}</h4>
                          <span className="text-xs text-muted-foreground">{item.category}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center py-8 border-t">
                      <p className="text-muted-foreground">
                        سيتم إضافة المزيد من الإشارات والفيديوهات التعليمية قريباً
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignLanguageGuide;
