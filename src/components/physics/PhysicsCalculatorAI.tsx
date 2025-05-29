
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Calculator, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const PhysicsCalculatorAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! أنا مساعدك الذكي للحسابات الفيزيائية. يمكنني مساعدتك في:\n\n• شرح القوانين الفيزيائية\n• حل المسائل خطوة بخطوة\n• اقتراح طرق حل مختلفة\n• توضيح المفاهيم الصعبة\n\nما السؤال الذي تريد المساعدة فيه؟',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "كيف أحسب السرعة؟",
    "ما هو قانون نيوتن الثاني؟",
    "شرح قانون أوم",
    "كيف أحسب الطاقة الحركية؟"
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
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('سرعة') || lowerQuestion.includes('velocity')) {
      return `🎯 **حساب السرعة:**

**القانون الأساسي:**
السرعة = المسافة ÷ الزمن
v = d / t

**الوحدات:**
• المسافة: متر (m)
• الزمن: ثانية (s)  
• السرعة: متر/ثانية (m/s)

**مثال:**
سيارة قطعت 100 متر في 20 ثانية
v = 100 ÷ 20 = 5 م/ث

**نصائح:**
✅ تأكد من وحدات القياس
✅ السرعة المتوسطة تختلف عن السرعة اللحظية`;
    }
    
    if (lowerQuestion.includes('نيوتن') || lowerQuestion.includes('قوة') || lowerQuestion.includes('force')) {
      return `⚡ **قانون نيوتن الثاني:**

**القانون:**
القوة = الكتلة × التسارع
F = ma

**الوحدات:**
• القوة: نيوتن (N)
• الكتلة: كيلوغرام (kg)
• التسارع: متر/ثانية² (m/s²)

**التطبيقات:**
🔹 حساب قوة الجاذبية: F = mg
🔹 حساب قوة الاحتكاك
🔹 تحليل الحركة

**ملاحظة مهمة:**
القوة والتسارع في نفس الاتجاه!`;
    }
    
    if (lowerQuestion.includes('أوم') || lowerQuestion.includes('كهرباء') || lowerQuestion.includes('ohm')) {
      return `⚡ **قانون أوم:**

**القانون:**
الجهد = التيار × المقاومة
V = I × R

**العلاقات:**
• I = V / R (التيار)
• R = V / I (المقاومة)
• P = V × I (القدرة)

**الوحدات:**
• الجهد: فولت (V)
• التيار: أمبير (A)
• المقاومة: أوم (Ω)

**تذكر:**
المقاومة تقاوم تدفق التيار!`;
    }
    
    if (lowerQuestion.includes('طاقة') || lowerQuestion.includes('energy')) {
      return `💫 **الطاقة في الفيزياء:**

**الطاقة الحركية:**
KE = ½mv²

**الطاقة الجهدية:**
PE = mgh

**قانون حفظ الطاقة:**
الطاقة الكلية = طاقة حركية + طاقة جهدية

**أنواع الطاقة:**
🔋 طاقة كهربائية
⚡ طاقة حرارية  
🌟 طاقة ضوئية
⚛️ طاقة نووية

**الطاقة لا تفنى ولا تستحدث!**`;
    }

    // رد عام للأسئلة الأخرى
    return `🤔 **سؤال ممتاز!**

يمكنني مساعدتك في فهم هذا الموضوع. هل تريد:

📚 **شرح المفهوم النظري**
🧮 **حل مسألة عملية**  
📐 **اقتراح طريقة حل**
💡 **أمثلة توضيحية**

يرجى توضيح السؤال أكثر أو اختيار إحدى الحسابات من الأعلى لأساعدك بشكل أفضل!

**نصيحة:** استخدم الآلات الحاسبة أعلاه للحسابات السريعة!`;
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
                    ? 'bg-subject-physics-primary text-white' 
                    : 'bg-white/10 text-subject-physics-primary'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  message.isUser
                    ? 'bg-subject-physics-primary text-white'
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
                <div className="w-8 h-8 rounded-full bg-white/10 text-subject-physics-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-subject-physics-primary rounded-full"
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
              className="text-xs p-2 bg-white/5 hover:bg-subject-physics-primary/20 rounded border border-white/10 hover:border-subject-physics-primary/50 transition-all duration-200 text-left"
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
            placeholder="اسأل عن أي حساب فيزيائي..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/50 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhysicsCalculatorAI;
