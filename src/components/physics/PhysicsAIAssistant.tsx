import React from 'react';
import { Atom, Zap } from 'lucide-react';
import { SubjectAIAssistantCore } from '@/components/shared/SubjectAIAssistantCore';

const PhysicsAIAssistant: React.FC = () => {
  const suggestedQuestions = [
    "ما هو قانون نيوتن الثالث للحركة وكيف يُفسر دفع الصواريخ الفضائية؟",
    "اشرح النظرية النسبية الخاصة لأينشتاين وتمدد الزمن وتقلص الطول",
    "كيف تعمل ظاهرة التشابك الكمي (Quantum Entanglement) والتراكب؟",
    "اشرح الحث الكهرومغناطيسي وقانون فاراداي وقاعدة لنز مع أمثلة",
    "ما هو القانون الثاني للديناميكا الحرارية والإنتروبيا وسهم الزمان؟",
    "كيف تتكون الثقوب السوداء وما هو أفق الحدث وإشعاع هوكينغ؟"
  ];

  return (
    <SubjectAIAssistantCore
      subjectKey="physics"
      subjectTitle="الفيزياء"
      subjectIcon={<Zap className="w-8 h-8 text-white" />}
      accentColor="#06b6d4"
      accentGradient="linear-gradient(135deg, #06b6d4, #3b82f6)"
      suggestedQuestions={suggestedQuestions}
      placeholderText="اسأل عن أي مفهوم أو قانون فيزيائي (ميكانيكا، كهرومغناطيسية، كم، نسبية، ديناميكا حرارية)..."
    />
  );
};

export default PhysicsAIAssistant;
