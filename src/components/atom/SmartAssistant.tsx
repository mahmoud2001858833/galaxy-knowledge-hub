
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

  // أوامر التنقل المباشر
  const handleNavigationCommands = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('كيمياء') || lowerQuery.includes('chemistry')) {
      navigate('/chemistry');
      return true;
    }
    if (lowerQuery.includes('فيزياء') || lowerQuery.includes('physics')) {
      navigate('/physics');
      return true;
    }
    if (lowerQuery.includes('رياضيات') || lowerQuery.includes('math')) {
      navigate('/mathematics');
      return true;
    }
    if (lowerQuery.includes('أحياء') || lowerQuery.includes('biology')) {
      navigate('/biology');
      return true;
    }
    if (lowerQuery.includes('رئيسية') || lowerQuery.includes('home')) {
      navigate('/');
      return true;
    }
    if (lowerQuery.includes('محاكاة') || lowerQuery.includes('simulation')) {
      navigate('/scientific-simulations');
      return true;
    }
    
    return false;
  };

  const queryGeminiAPI = async (question: string) => {
    // التحقق من أوامر التنقل أولاً
    if (handleNavigationCommands(question)) {
      setResponse('تم التنقل إلى الصفحة المطلوبة!');
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
                    text: `أنت مساعد ذكي متخصص في الكيمياء والفيزياء الذرية. يمكنك أيضاً التنقل المباشر للصفحات عندما يطلب المستخدم ذلك. أجب على السؤال التالي باللغة العربية بشكل علمي ومبسط: ${question}
                    
                    السياق الحالي:
                    - العنصر: ${atomData.element} (${atomData.symbol})
                    - البروتونات: ${atomData.protons}
                    - النيوترونات: ${atomData.neutrons}
                    - الإلكترونات: ${atomData.electrons}
                    - العدد الكتلي: ${atomData.massNumber}
                    - الشحنة: ${atomData.charge}
                    - التوزيع الإلكتروني: ${atomData.electronConfiguration}
                    - حالة الاستقرار: ${atomData.isStable ? 'مستقر' : 'غير مستقر'}
                    
                    إذا طلب المستخدم الانتقال لصفحة معينة (مثل الكيمياء، الفيزياء، الرياضيات، الأحياء)، أخبره أنه سيتم التنقل فوراً.
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
              placeholder="اسأل عن بناء الذرات أو اطلب الانتقال لصفحة..."
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
              مرحباً! اسألني أي سؤال عن بناء الذرات أو اطلب الانتقال لأي صفحة
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
