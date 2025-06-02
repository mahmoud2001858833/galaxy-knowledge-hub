
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Move, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import type { AtomData } from '@/types/atom';

interface SmartAssistantProps {
  atomData: AtomData;
  position: { x: number; y: number };
  onDrag: (event: any, info: any) => void;
  onClose: () => void;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({
  atomData,
  position,
  onDrag,
  onClose
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // أوامر التنقل المباشر - تنقل فوري بدون أي كلام
  const handleDirectNavigation = (query: string): boolean => {
    const lowerQuery = query.toLowerCase().trim();
    
    // تنقل فوري للكيمياء
    if (lowerQuery.includes('كيمياء') || lowerQuery.includes('chemistry') || lowerQuery === 'كيمياء') {
      navigate('/chemistry');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للفيزياء
    if (lowerQuery.includes('فيزياء') || lowerQuery.includes('physics') || lowerQuery === 'فيزياء') {
      navigate('/physics');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للرياضيات
    if (lowerQuery.includes('رياضيات') || lowerQuery.includes('math') || lowerQuery === 'رياضيات') {
      navigate('/mathematics');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للأحياء
    if (lowerQuery.includes('أحياء') || lowerQuery.includes('biology') || lowerQuery === 'أحياء') {
      navigate('/biology');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للرئيسية
    if (lowerQuery.includes('رئيسية') || lowerQuery.includes('home') || lowerQuery === 'الرئيسية' || lowerQuery === 'رئيسية') {
      navigate('/');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للمحاكاة
    if (lowerQuery.includes('محاكاة') || lowerQuery.includes('simulation') || lowerQuery === 'محاكاة') {
      navigate('/scientific-simulations');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للإنجليزي
    if (lowerQuery.includes('انجليزي') || lowerQuery.includes('english') || lowerQuery === 'انجليزي') {
      navigate('/english');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للعربي
    if (lowerQuery.includes('عربي') || lowerQuery.includes('arabic') || lowerQuery === 'عربي') {
      navigate('/arabic');
      setQuery('');
      return true;
    }
    
    // تنقل فوري للمحادثة
    if (lowerQuery.includes('محادثة') || lowerQuery.includes('chat') || lowerQuery === 'محادثة') {
      navigate('/chat-rooms');
      setQuery('');
      return true;
    }
    
    return false;
  };

  const queryGeminiAPI = async (question: string) => {
    // التحقق من أوامر التنقل أولاً - تنقل فوري بدون أي رسائل
    if (handleDirectNavigation(question)) {
      return; // تنقل فوري بدون أي تعليمات أو رسائل
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDR0bf_lLE8A83mionE3IT5gAH3Z8-O-MA`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `أنت مساعد ذكي متخصص في الفيزياء الذرية. أجب على السؤال باللغة العربية بشكل مختصر وعلمي: ${question}
                    
                    الذرة الحالية:
                    - العنصر: ${atomData.element} (${atomData.symbol})
                    - البروتونات: ${atomData.protons}
                    - النيوترونات: ${atomData.neutrons}
                    - الإلكترونات: ${atomData.electrons}
                    - العدد الكتلي: ${atomData.massNumber}
                    - الشحنة: ${atomData.charge}
                    - التوزيع الإلكتروني: ${atomData.electronConfiguration}
                    - حالة الاستقرار: ${atomData.isStable ? 'مستقر' : 'غير مستقر'}
                    - صحة التوزيع: ${atomData.isValid ? 'صحيح' : 'خاطئ'}
                    ${atomData.warnings.length > 0 ? `- تحذيرات: ${atomData.warnings.join(', ')}` : ''}
                    
                    أجب بشكل مختصر ومفيد (3 أسطر كحد أقصى).
                    `
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else {
        setResponse('عذراً، لم أتمكن من الحصول على إجابة. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error querying Gemini API:', error);
      setResponse('حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={onDrag}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000
      }}
      className="w-96 max-w-[90vw]"
      whileDrag={{ scale: 1.05 }}
    >
      <Card className="bg-purple-900/95 backdrop-blur-sm border-purple-500/50 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-300 flex items-center text-sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              المساعد الذكي للفيزياء الذرية
            </CardTitle>
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-gray-400 cursor-move" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسم المنصة للانتقال فوراً أو اسأل عن الذرات..."
              className="flex-1 bg-purple-800/50 border-purple-500/50 text-white placeholder-purple-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  queryGeminiAPI(query);
                }
              }}
            />
            <Button
              onClick={() => query.trim() && queryGeminiAPI(query)}
              disabled={isLoading || !query.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? '...' : 'سؤال'}
            </Button>
          </div>
          
          {/* عرض تحذيرات التوزيع */}
          {atomData.warnings.length > 0 && (
            <div className="bg-yellow-800/30 p-3 rounded-lg border border-yellow-500/50">
              <h4 className="text-yellow-300 font-bold text-sm mb-2">تحذيرات التوزيع:</h4>
              <ul className="text-yellow-200 text-xs space-y-1">
                {atomData.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {response && (
            <div className="bg-purple-800/30 p-3 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            </div>
          )}
          
          {!response && !isLoading && (
            <div className="text-center text-purple-300 text-sm">
              <div className="mb-2">مرحباً! اسألني عن بناء الذرات</div>
              <div className="text-xs text-purple-400 space-y-1">
                <div><strong>للتنقل الفوري:</strong> اكتب "كيمياء"، "فيزياء"، "رياضيات"، "أحياء"، "محادثة"...</div>
                <div><strong>للأسئلة:</strong> اسأل عن التوزيع الإلكتروني أو خصائص العناصر</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
