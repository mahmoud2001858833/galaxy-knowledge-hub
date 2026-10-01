import React from 'react';
import { Dna, ShieldCheck } from 'lucide-react';
import { SubjectAIAssistantCore } from '@/components/shared/SubjectAIAssistantCore';

const BiologyAIAssistant: React.FC = () => {
  const suggestedQuestions = [
    "اشرح عملية التنفس الخلوي وحلقة كريبس وسلسلة نقل الإلكترون بالتفصيل",
    "كيف يعمل الجهاز المناعي والفرق بين المناعة الفطرية والمكتسبة والأجسام المضادة؟",
    "اشرح وراثة مندل وقانون انعزال الصفات ومربعات بانيت لتوقع الصفات الجينية",
    "ما هي آلية التعبير الجيني وكيف تتم ترجمة شفرة الـ DNA إلى بروتينات وظيفية؟",
    "اشرح عملية نقل السيال العصبي عبر المشابك الكيميائية ومضخة الصوديوم-بوتاسيوم",
    "كيف تعمل تقنية كريسبر-كاس9 (CRISPR-Cas9) في التعديل الجيني والهندسة الوراثية؟"
  ];

  return (
    <SubjectAIAssistantCore
      subjectKey="biology"
      subjectTitle="الأحياء والعلوم الحيوية"
      subjectIcon={<Dna className="w-8 h-8 text-white" />}
      accentColor="#10b981"
      accentGradient="linear-gradient(135deg, #10b981, #059669)"
      suggestedQuestions={suggestedQuestions}
      placeholderText="اسأل عن أي مفهوم حيوي (وراثة، بيولوجيا جزيئية، مناعة، فسيولوجيا، تنفس خلوي، بيئة)..."
    />
  );
};

export default BiologyAIAssistant;
