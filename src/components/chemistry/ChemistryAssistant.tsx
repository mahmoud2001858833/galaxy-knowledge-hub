import React from 'react';
import { FlaskConical } from 'lucide-react';
import { SubjectAIAssistantCore } from '@/components/shared/SubjectAIAssistantCore';

const ChemistryAssistant: React.FC = () => {
  const suggestedQuestions = [
    "اشرح الاتزان الكيميائي ومبدأ لوشاتيليه وتأثير الضغط ودرجة الحرارة",
    "ما هي الروابط الكيميائية والفرق بين التساهمية والأيونية والفلزية وتأثيرها على الخصائص؟",
    "اشرح الكيمياء العضوية ومجموعات الألكانات والألكينات والمركبات الأروماتية",
    "كيف تعمل تفاعلات الأكسدة والاختزال ومفهوم أرقام التأكسد والبطاريات الكهروكيميائية؟",
    "اشرح نظرية الأحماض والقواعد للويس وبرونستد-لوري وحساب الرقم الهيدروجيني pH",
    "ما هي سرعة التفاعل الكيميائي وطاقة التنشيط ونظرية التصادم ونظرية الحالة الانتقالية؟"
  ];

  return (
    <SubjectAIAssistantCore
      subjectKey="chemistry"
      subjectTitle="الكيمياء"
      subjectIcon={<FlaskConical className="w-8 h-8 text-white" />}
      accentColor="#f59e0b"
      accentGradient="linear-gradient(135deg, #f59e0b, #10b981)"
      suggestedQuestions={suggestedQuestions}
      placeholderText="اسأل عن أي تفاعل كيميائي، عنصر، مركب عضوي، أو قانون فيزيائي كيميائي..."
    />
  );
};

export default ChemistryAssistant;
