import React from 'react';
import { Calculator, Brain } from 'lucide-react';
import { SubjectAIAssistantCore } from '@/components/shared/SubjectAIAssistantCore';

const MathAIAssistant: React.FC = () => {
  const suggestedQuestions = [
    "اشرح نظرية فيثاغورس وكيفية استخدامها في الهندسة ثلاثية الأبعاد",
    "ما هي المتسلسلات اللانهائية وما الفرق بين التقارب والتباعد؟",
    "اشرح مفهوم النهاية (Limits) وقاعدة لوبيتال في التفاضل",
    "كيف تعمل مصفوفات التحويل الخطي ودوران المتجهات؟",
    "اشرح التوزيع الطبيعي المعياري وقاعدة 68-95-99.7 في الإحصاء",
    "ما هي الأعداد المركبة وتطبيقاتها في الدوال المثلثية ومعادلة أويلر؟"
  ];

  return (
    <SubjectAIAssistantCore
      subjectKey="math"
      subjectTitle="الرياضيات"
      subjectIcon={<Brain className="w-8 h-8 text-white" />}
      accentColor="#a855f7"
      accentGradient="linear-gradient(135deg, #a855f7, #6366f1)"
      suggestedQuestions={suggestedQuestions}
      placeholderText="اسأل عن أي مفهوم رياضي (جبر، هندسة، تفاضل وتكامل، إحصاء، مصفوفات)..."
    />
  );
};

export default MathAIAssistant;
