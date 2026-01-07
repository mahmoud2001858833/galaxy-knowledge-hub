import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hand, MessageSquare, BookOpen, Camera, Volume2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import SignLanguageCamera from './SignLanguageCamera';

interface SignLanguageGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const gestureCommands = [
  { gesture: '✋', name: 'كف مفتوح', action: 'إيقاف', description: 'إيقاف القراءة أو العملية الحالية' },
  { gesture: '☝️', name: 'إصبع واحد للأعلى', action: 'التالي', description: 'الانتقال للعنصر التالي أو التمرير للأعلى' },
  { gesture: '👇', name: 'إصبع للأسفل', action: 'السابق', description: 'العودة للعنصر السابق أو التمرير للأسفل' },
  { gesture: '👍', name: 'إبهام للأعلى', action: 'موافق', description: 'تأكيد أو النقر على العنصر الحالي' },
  { gesture: '👎', name: 'إبهام للأسفل', action: 'إلغاء', description: 'إلغاء العملية أو الرجوع للخلف' },
  { gesture: '✊', name: 'قبضة', action: 'تحديد', description: 'تحديد العنصر أو الانتقال للعنصر التالي' },
  { gesture: '✌️', name: 'علامة النصر', action: 'سلام', description: 'إشارة السلام أو التحية' },
  { gesture: '👋', name: 'تلويح', action: 'وداعاً', description: 'إشارة الوداع' },
];

const signDictionary = [
  { word: 'مرحبا', gesture: '👋', category: 'تحيات' },
  { word: 'نعم', gesture: '👍', category: 'أساسيات' },
  { word: 'لا', gesture: '👎', category: 'أساسيات' },
  { word: 'شكراً', gesture: '🙏', category: 'تحيات' },
  { word: 'من فضلك', gesture: '🤲', category: 'أساسيات' },
  { word: 'أنا', gesture: '👆', category: 'ضمائر' },
  { word: 'أنت', gesture: '👉', category: 'ضمائر' },
  { word: 'جيد', gesture: '👌', category: 'صفات' },
  { word: 'سيء', gesture: '👎', category: 'صفات' },
  { word: 'حب', gesture: '❤️', category: 'مشاعر' },
  { word: 'سعيد', gesture: '😊', category: 'مشاعر' },
  { word: 'حزين', gesture: '😢', category: 'مشاعر' },
];

const SignLanguageGuide: React.FC<SignLanguageGuideProps> = ({ isOpen, onClose }) => {
  const [textToConvert, setTextToConvert] = useState('');
  const [convertedSigns, setConvertedSigns] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState<{ gesture: string; text: string }[]>([]);

  const handleTextToSign = async () => {
    if (!textToConvert.trim()) return;
    
    setIsConverting(true);
    
    // محاكاة تحويل النص إلى إشارات
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const words = textToConvert.split(' ');
    const signs = words.map(word => {
      const found = signDictionary.find(s => s.word === word);
      return found ? found.gesture : '❓';
    });
    
    setConvertedSigns(signs);
    setIsConverting(false);
  };

  const handleGestureDetected = (gesture: string, arabicText: string) => {
    setDetectedGestures(prev => [...prev, { gesture, text: arabicText }].slice(-10));
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 w-full max-w-4xl max-h-[85vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <Card className="bg-transparent border-0 h-full">
              <CardHeader className="border-b border-indigo-500/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                      <Hand className="h-6 w-6 text-indigo-400" />
                    </div>
                    دليل لغة الإشارة
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-auto max-h-[calc(85vh-100px)]">
                <Tabs defaultValue="camera" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b border-indigo-500/20 bg-transparent p-0">
                    <TabsTrigger 
                      value="camera" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-6 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <Camera className="h-4 w-4 ml-2" />
                      الكاميرا والتحكم
                    </TabsTrigger>
                    <TabsTrigger 
                      value="commands" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-6 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <Hand className="h-4 w-4 ml-2" />
                      أوامر التحكم
                    </TabsTrigger>
                    <TabsTrigger 
                      value="convert" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-6 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      تحويل النص
                    </TabsTrigger>
                    <TabsTrigger 
                      value="dictionary" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-6 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <BookOpen className="h-4 w-4 ml-2" />
                      القاموس
                    </TabsTrigger>
                  </TabsList>

                  {/* تبويب الكاميرا والتحكم */}
                  <TabsContent value="camera" className="p-6 space-y-6">
                    <div className="text-center">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl inline-block mb-4">
                        <Camera className="h-16 w-16 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        التحكم بالمنصة عبر لغة الإشارة
                      </h3>
                      <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                        افتح الكاميرا واستخدم إيماءات يدك للتحكم بالمنصة والتنقل بين العناصر. 
                        سيتم أيضاً تحويل إشاراتك إلى نص عربي.
                      </p>
                      
                      <Button
                        size="lg"
                        onClick={() => setShowCamera(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Camera className="ml-2 h-5 w-5" />
                        تفعيل الكاميرا
                      </Button>
                    </div>

                    {/* الإيماءات المكتشفة مؤخراً */}
                    {detectedGestures.length > 0 && (
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-lg font-bold text-white mb-3">الإيماءات المكتشفة:</h4>
                        <div className="flex flex-wrap gap-2">
                          {detectedGestures.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-indigo-500/20 px-3 py-2 rounded-lg flex items-center gap-2"
                            >
                              <span className="text-xl">{item.gesture}</span>
                              <span className="text-white">{item.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* تعليمات سريعة */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">☝️</div>
                        <div className="text-white font-medium">التمرير للأعلى</div>
                        <div className="text-slate-400 text-sm">إصبع واحد للأعلى</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">👍</div>
                        <div className="text-white font-medium">تأكيد / نقر</div>
                        <div className="text-slate-400 text-sm">إبهام للأعلى</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">✋</div>
                        <div className="text-white font-medium">إيقاف</div>
                        <div className="text-slate-400 text-sm">كف مفتوح</div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* تبويب أوامر التحكم */}
                  <TabsContent value="commands" className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {gestureCommands.map((cmd, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-4 hover:bg-slate-800/70 transition-colors"
                        >
                          <div className="text-4xl">{cmd.gesture}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-bold">{cmd.name}</h4>
                              <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-sm">
                                {cmd.action}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">{cmd.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* تبويب تحويل النص */}
                  <TabsContent value="convert" className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">تحويل النص إلى لغة الإشارة</h3>
                      <Textarea
                        value={textToConvert}
                        onChange={(e) => setTextToConvert(e.target.value)}
                        placeholder="اكتب النص الذي تريد تحويله..."
                        className="min-h-[100px] bg-slate-800/50 border-indigo-500/30 text-white"
                      />
                      <Button 
                        onClick={handleTextToSign} 
                        disabled={isConverting || !textToConvert.trim()}
                        className="mt-3"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري التحويل...
                          </>
                        ) : (
                          <>
                            <Hand className="ml-2 h-4 w-4" />
                            تحويل إلى إشارات
                          </>
                        )}
                      </Button>
                    </div>

                    {convertedSigns.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 rounded-xl p-6"
                      >
                        <h4 className="text-white font-bold mb-4">الإشارات:</h4>
                        <div className="flex flex-wrap gap-4 text-5xl">
                          {convertedSigns.map((sign, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {sign}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>

                  {/* تبويب القاموس */}
                  <TabsContent value="dictionary" className="p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {signDictionary.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="bg-slate-800/50 rounded-xl p-4 text-center hover:bg-slate-800/70 transition-colors cursor-pointer group"
                          onClick={() => speakText(item.word)}
                        >
                          <div className="text-5xl mb-3">{item.gesture}</div>
                          <div className="text-white font-bold text-lg">{item.word}</div>
                          <div className="text-indigo-400 text-sm">{item.category}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Volume2 className="h-4 w-4 ml-1" />
                            نطق
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Camera Modal */}
      <SignLanguageCamera
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onGestureDetected={handleGestureDetected}
      />
    </>
  );
};

export default SignLanguageGuide;
