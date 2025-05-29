
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Calculator, Lightbulb, Heart, Dna, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const BiologyCalculatorAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'أهلاً بك! أنا مساعدك الذكي للحسابات الحيوية والطبية. يمكنني مساعدتك في:\n\n🫀 العلامات الحيوية ونبض القلب\n⚖️ مؤشر كتلة الجسم والتغذية\n🩸 تحليل الدم والهيموغلوبين\n🧬 الوراثة ومربع بونت\n📈 نمو الجماعات والإحصاءات الحيوية\n💊 تركيز الأدوية والإنزيمات\n⚡ إنتاج الطاقة والتنفس الخلوي\n\nما هو السؤال الذي تريد المساعدة فيه؟',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "كيف أحسب BMI؟",
    "ما المعدل الطبيعي للنبض؟",
    "كيف أحلل مربع بونت؟",
    "شرح التنفس الخلوي"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // محاكاة رد المساعد الذكي
    setTimeout(() => {
      const aiResponse = generateBiologyAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const generateBiologyAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('bmi') || lowerQuestion.includes('مؤشر كتلة') || lowerQuestion.includes('وزن')) {
      return `⚖️ **حساب مؤشر كتلة الجسم (BMI):**

**القانون:**
BMI = الوزن (كغ) ÷ (الطول (م))²

**التصنيفات:**
• أقل من 18.5: نقص في الوزن
• 18.5 - 24.9: وزن طبيعي ✅
• 25 - 29.9: زيادة في الوزن
• 30 فأكثر: سمنة

**مثال:**
شخص وزنه 70 كغ وطوله 175 سم
BMI = 70 ÷ (1.75)² = 22.9
النتيجة: وزن طبيعي ✅

**نصائح:**
🥗 تناول غذاء متوازن
🏃‍♂️ ممارسة الرياضة
💧 شرب الماء بكثرة`;
    }
    
    if (lowerQuestion.includes('نبض') || lowerQuestion.includes('قلب') || lowerQuestion.includes('heart')) {
      return `💓 **معدل نبض القلب:**

**المعدلات الطبيعية:**
👶 الأطفال: 80-120 نبضة/دقيقة
🧑 البالغين: 60-100 نبضة/دقيقة  
👴 كبار السن: 60-100 نبضة/دقيقة

**الحد الأقصى للنبض:**
العمر الأقصى = 220 - العمر

**المنطقة المستهدفة للتمرين:**
• الحد الأدنى: 50% من الحد الأقصى
• الحد الأعلى: 85% من الحد الأقصى

**مثال (عمر 30 سنة):**
الحد الأقصى = 220 - 30 = 190
المنطقة المستهدفة: 95-162 نبضة/دقيقة

**متى تقلق؟**
⚠️ أقل من 60 (بطء القلب)
⚠️ أكثر من 100 في الراحة (تسارع)`;
    }
    
    if (lowerQuestion.includes('مربع بونت') || lowerQuestion.includes('وراثة') || lowerQuestion.includes('punnett')) {
      return `🧬 **مربع بونت والوراثة:**

**الخطوات:**
1. تحديد الطراز الجيني للوالدين
2. استخراج الأمشاج من كل والد
3. رسم المربع وملء الخانات
4. حساب النسب الجينية والظاهرية

**مثال: Aa × Aa**
الأمشاج: A, a من كل والد

|   | A | a |
|---|---|---|
| A | AA| Aa|
| a | Aa| aa|

**النتائج:**
🧬 النسب الجينية:
• AA: 25% (متماثل سائد)
• Aa: 50% (خليط)  
• aa: 25% (متماثل متنحي)

👁️ النسب الظاهرية:
• سائد: 75% (AA + Aa)
• متنحي: 25% (aa)

**قوانين مندل:**
✅ قانون الانعزال
✅ قانون التوزيع الحر`;
    }
    
    if (lowerQuestion.includes('تنفس خلوي') || lowerQuestion.includes('atp') || lowerQuestion.includes('طاقة')) {
      return `⚡ **التنفس الخلوي وإنتاج الطاقة:**

**المعادلة الإجمالية:**
C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 32 ATP

**المراحل:**
🔹 **التحلل السكري** (السيتوبلازم):
جلوكوز → 2 بيروفات + 2 ATP + 2 NADH

🔹 **دورة كريبس** (الميتوكوندريا):
2 بيروفات → 6 CO₂ + 2 ATP + 8 NADH + 2 FADH₂

🔹 **السلسلة التنفسية** (الميتوكوندريا):
NADH + FADH₂ → 28 ATP + H₂O

**المجموع: 32 ATP**

**مقارنة مع التخمر:**
• التنفس الهوائي: 32 ATP ✅
• التخمر: 2 ATP فقط ⚠️

**أهمية ATP:**
💪 انقباض العضلات
🧠 عمل الدماغ
🔬 العمليات الحيوية`;
    }
    
    if (lowerQuestion.includes('هيموغلوبين') || lowerQuestion.includes('دم') || lowerQuestion.includes('أنيميا')) {
      return `🩸 **الهيموغلوبين وتحليل الدم:**

**المعدلات الطبيعية:**
👨 الرجال: 14-18 g/dL
👩 النساء: 12-16 g/dL
👶 الأطفال: 11-13 g/dL

**وظائف الهيموغلوبين:**
🫁 نقل الأوكسجين من الرئتين للأنسجة
💨 نقل CO₂ من الأنسجة للرئتين
⚖️ تنظيم pH الدم

**أنواع فقر الدم:**
• **نقص الحديد:** الأكثر شيوعاً
• **نقص B12:** فقر الدم الخبيث
• **نقص حمض الفوليك:** خاصة في الحمل
• **وراثي:** الثلاسيميا، المنجلي

**أعراض نقص الهيموغلوبين:**
😴 تعب وإرهاق
💓 خفقان القلب
🥶 برودة الأطراف
😵 دوخة وصداع

**العلاج:**
🥩 أطعمة غنية بالحديد
💊 مكملات الحديد
🍊 فيتامين C لتحسين الامتصاص`;
    }
    
    if (lowerQuestion.includes('كلى') || lowerQuestion.includes('gfr') || lowerQuestion.includes('كرياتينين')) {
      return `🫘 **وظائف الكلى ومعدل التصفية:**

**معدل تصفية الكلى (GFR):**
المعدل الطبيعي: 90-120 mL/min/1.73m²

**معادلة Cockcroft-Gault:**
GFR = ((140-العمر) × الوزن) ÷ (72 × الكرياتينين)
للنساء: النتيجة × 0.85

**مراحل أمراض الكلى:**
🟢 المرحلة 1: GFR ≥ 90 (طبيعي)
🟡 المرحلة 2: GFR 60-89 (انخفاض طفيف)
🟠 المرحلة 3: GFR 30-59 (انخفاض متوسط)
🔴 المرحلة 4: GFR 15-29 (انخفاض شديد)
⚫ المرحلة 5: GFR < 15 (فشل كلوي)

**وظائف الكلى:**
💧 تنظيم الماء والأملاح
🧪 إزالة السموم والفضلات
🩸 تنظيم ضغط الدم
🦴 إنتاج فيتامين D النشط

**نصائح للحفاظ على الكلى:**
💧 شرب الماء بكثرة
🧂 تقليل الملح
🍎 نظام غذائي صحي
🏃‍♂️ ممارسة الرياضة`;
    }

    // رد عام للأسئلة الأخرى
    return `🤔 **سؤال ممتاز في علم الأحياء!**

يمكنني مساعدتك في فهم هذا الموضوع. إليك ما أستطيع تقديمه:

🧮 **الحسابات الحيوية:**
• العلامات الحيوية (نبض، تنفس، ضغط)
• مؤشر كتلة الجسم والتغذية
• تحليل الدم والهرمونات

🧬 **علم الوراثة:**
• مربع بونت والنسب الوراثية
• قوانين مندل وهاردي-واينبرغ
• الطفرات والتطور

📊 **الإحصاءات الحيوية:**
• نمو الجماعات السكانية
• معدلات البقاء والوفيات
• التحليل الإحصائي للبيانات

⚡ **الطاقة والأيض:**
• التنفس الخلوي وإنتاج ATP
• السعرات الحرارية والتغذية
• النشاط الإنزيمي

يرجى توضيح السؤال أكثر أو استخدام الحاسبات أعلاه للحصول على نتائج دقيقة مع شرح مفصل!

**💡 نصيحة:** جرب الحاسبات التفاعلية في الأعلى لحسابات دقيقة!`;
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="h-96 flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser 
                    ? 'bg-subject-biology-primary text-white' 
                    : 'bg-white/10 text-subject-biology-primary'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  message.isUser
                    ? 'bg-subject-biology-primary text-white'
                    : 'bg-white/5 border border-white/10 text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/10 text-subject-biology-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-subject-biology-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* أسئلة سريعة */}
      <div className="p-3 border-t border-white/10">
        <div className="text-xs text-white/60 mb-2 flex items-center">
          <Lightbulb className="w-3 h-3 mr-1" />
          أسئلة سريعة:
        </div>
        <div className="grid grid-cols-2 gap-1">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-xs p-2 bg-white/5 hover:bg-subject-biology-primary/20 rounded border border-white/10 hover:border-subject-biology-primary/50 transition-all duration-200 text-left"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* حقل الإدخال */}
      <div className="p-3 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اسأل عن أي حساب حيوي أو طبي..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/50 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BiologyCalculatorAI;
