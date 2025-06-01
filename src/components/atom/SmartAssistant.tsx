
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

  // أوامر التنقل المباشر - تم إصلاحها للتنقل الفوري
  const handleNavigationCommands = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('كيمياء') || lowerQuery.includes('chemistry')) {
      navigate('/chemistry');
      setResponse('تم الانتقال إلى منصة الكيمياء');
      return true;
    }
    if (lowerQuery.includes('فيزياء') || lowerQuery.includes('physics')) {
      navigate('/physics');
      setResponse('تم الانتقال إلى منصة الفيزياء');
      return true;
    }
    if (lowerQuery.includes('رياضيات') || lowerQuery.includes('math')) {
      navigate('/mathematics');
      setResponse('تم الانتقال إلى منصة الرياضيات');
      return true;
    }
    if (lowerQuery.includes('أحياء') || lowerQuery.includes('biology')) {
      navigate('/biology');
      setResponse('تم الانتقال إلى منصة الأحياء');
      return true;
    }
    if (lowerQuery.includes('رئيسية') || lowerQuery.includes('home') || lowerQuery.includes('الرئيسية')) {
      navigate('/');
      setResponse('تم الانتقال إلى الصفحة الرئيسية');
      return true;
    }
    if (lowerQuery.includes('محاكاة') || lowerQuery.includes('simulation')) {
      navigate('/scientific-simulations');
      setResponse('تم الانتقال إلى المحاكاة العلمية');
      return true;
    }
    if (lowerQuery.includes('انجليزي') || lowerQuery.includes('english')) {
      navigate('/english');
      setResponse('تم الانتقال إلى منصة الإنجليزية');
      return true;
    }
    if (lowerQuery.includes('عربي') || lowerQuery.includes('arabic')) {
      navigate('/arabic');
      setResponse('تم الانتقال إلى منصة العربية');
      return true;
    }
    
    return false;
  };

  const queryGeminiAPI = async (question: string) => {
    // التحقق من أوامر التنقل أولاً - التنقل الفوري
    if (handleNavigationCommands(question)) {
      return;
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
                    text: `أنت مساعد ذكي متخصص في الكيمياء والفيزياء الذرية. أجب على السؤال التالي باللغة العربية بشكل علمي ومبسط: ${question}
                    
                    السياق الحالي:
                    - العنصر: ${atomData.element} (${atomData.symbol})
                    - البروتونات: ${atomData.protons}
                    - النيوترونات: ${atomData.neutrons}
                    - الإلكترونات: ${atomData.electrons}
                    - العدد الكتلي: ${atomData.massNumber}
                    - الشحنة: ${atomData.charge}
                    - التوزيع الإلكتروني: ${atomData.electronConfiguration}
                    - حالة الاستقرار: ${atomData.isStable ? 'مستقر' : 'غير مستقر'}
                    
                    أجب بشكل مختصر ومفيد.
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
              placeholder="اسأل عن بناء الذرات أو اطلب الانتقال (كيمياء، فيزياء، رياضيات...)..."
              className="flex-1 bg-purple-800/50 border-purple-500/50"
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
          
          {response && (
            <div className="bg-purple-800/30 p-3 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            </div>
          )}
          
          {!response && !isLoading && (
            <div className="text-center text-purple-300 text-sm">
              مرحباً! اسألني أي سؤال عن بناء الذرات أو اطلب الانتقال السريع للمنصات
              <br />
              <span className="text-xs text-purple-400">
                مثال: "كيمياء" للانتقال فوراً لمنصة الكيمياء
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
