
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en' } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing English AI assistant request:', { 
      message: message.substring(0, 100),
      language 
    });

    // Enhanced response based on common English learning queries
    let response = '';

    // Check for common patterns and provide comprehensive responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('generate') && lowerMessage.includes('text')) {
      // Handle text generation requests
      const topic = extractTopic(message);
      const textType = extractTextType(message);
      const wordCount = extractWordCount(message);
      
      response = generateEnglishText(topic, textType, wordCount, language);
    } else if (lowerMessage.includes('grammar') || lowerMessage.includes('قواعد')) {
      response = language === 'ar' ? 
        generateGrammarResponse(message, 'ar') : 
        generateGrammarResponse(message, 'en');
    } else if (lowerMessage.includes('pronunciation') || lowerMessage.includes('نطق')) {
      response = language === 'ar' ?
        generatePronunciationResponse(message, 'ar') :
        generatePronunciationResponse(message, 'en');
    } else if (lowerMessage.includes('vocabulary') || lowerMessage.includes('مفردات')) {
      response = language === 'ar' ?
        generateVocabularyResponse(message, 'ar') :
        generateVocabularyResponse(message, 'en');
    } else {
      // General English learning assistance
      response = language === 'ar' ?
        generateGeneralResponse(message, 'ar') :
        generateGeneralResponse(message, 'en');
    }

    console.log('Generated response length:', response.length);

    return new Response(
      JSON.stringify({ reply: response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in english-ai-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        reply: language === 'ar' ? 
          'أعتذر، حدث خطأ. يمكنني مساعدتك في تعلم اللغة الإنجليزية بطرق أخرى.' :
          'I apologize for the error. I can help you learn English in other ways.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractTopic(message: string): string {
  const aboutMatch = message.match(/about ["']?([^"']+)["']?/i);
  if (aboutMatch) return aboutMatch[1];
  
  const topicMatch = message.match(/topic.*?["']?([^"']+)["']?/i);
  if (topicMatch) return topicMatch[1];
  
  return "communication and technology";
}

function extractTextType(message: string): string {
  const types = ['formal', 'academic', 'business', 'creative', 'technical', 'persuasive', 'informative', 'narrative'];
  for (const type of types) {
    if (message.toLowerCase().includes(type)) {
      return type;
    }
  }
  return 'formal';
}

function extractWordCount(message: string): number {
  const countMatch = message.match(/(\d+)\s*words?/i);
  if (countMatch) return parseInt(countMatch[1]);
  
  const approximateMatch = message.match(/approximately\s*(\d+)/i);
  if (approximateMatch) return parseInt(approximateMatch[1]);
  
  return 300;
}

function generateEnglishText(topic: string, textType: string, wordCount: number, language: string): string {
  const templates = {
    formal: {
      en: `# ${topic.charAt(0).toUpperCase() + topic.slice(1)}

In today's rapidly evolving world, ${topic} has become increasingly significant across various sectors of society. This comprehensive analysis examines the multifaceted aspects of ${topic} and its far-reaching implications.

## Introduction

The importance of ${topic} cannot be overstated in our contemporary context. As we navigate through complex challenges and opportunities, understanding the nuances of ${topic} becomes essential for informed decision-making and strategic planning.

## Key Considerations

Several critical factors must be considered when examining ${topic}:

**Primary Aspects:**
- The fundamental principles underlying ${topic}
- Current trends and emerging patterns
- Stakeholder perspectives and interests
- Potential challenges and opportunities

**Implementation Strategies:**
- Best practices and proven methodologies
- Risk assessment and mitigation approaches
- Resource allocation and management
- Performance measurement and evaluation

## Analysis and Recommendations

Based on comprehensive research and analysis, it is evident that ${topic} requires a systematic and well-coordinated approach. Organizations and individuals must develop robust frameworks that address both immediate needs and long-term objectives.

The successful implementation of initiatives related to ${topic} depends on several key factors:

1. **Leadership and Vision:** Strong leadership commitment and clear vision are essential for driving meaningful change and achieving desired outcomes.

2. **Stakeholder Engagement:** Active participation and collaboration among all relevant stakeholders ensure comprehensive understanding and buy-in.

3. **Resource Management:** Adequate allocation of financial, human, and technological resources is crucial for successful implementation.

4. **Continuous Improvement:** Regular monitoring, evaluation, and adaptation are necessary to maintain relevance and effectiveness.

## Conclusion

In conclusion, ${topic} represents both a significant opportunity and a complex challenge that requires careful consideration and strategic action. By adopting a comprehensive approach that incorporates best practices, stakeholder engagement, and continuous improvement, we can work towards achieving positive outcomes and sustainable progress.

The path forward requires commitment, collaboration, and innovation. As we continue to explore and develop our understanding of ${topic}, we must remain adaptable and responsive to changing circumstances while maintaining focus on our core objectives and values.`,
      ar: `# ${topic}

في عالمنا المتطور بسرعة، أصبح ${topic} ذا أهمية متزايدة في مختلف قطاعات المجتمع. يفحص هذا التحليل الشامل الجوانب متعددة الأوجه لـ ${topic} وآثاره بعيدة المدى.`
    },
    academic: {
      en: `# Academic Analysis: ${topic.charAt(0).toUpperCase() + topic.slice(1)}

## Abstract

This academic paper examines ${topic} through a comprehensive analytical lens, exploring its theoretical foundations, empirical evidence, and practical implications. The research synthesizes existing literature while identifying gaps for future investigation.

## Introduction and Literature Review

The scholarly discourse surrounding ${topic} has evolved significantly over the past decade. Numerous researchers have contributed to our understanding through diverse methodological approaches and theoretical frameworks.

### Theoretical Framework

The theoretical underpinnings of ${topic} can be traced to several foundational concepts:

- **Conceptual Foundations:** The basic principles and definitions that form the basis of understanding
- **Theoretical Models:** Established frameworks that explain relationships and patterns
- **Empirical Evidence:** Research findings that support or challenge existing theories

### Previous Research

Extensive research has been conducted in this field, with notable contributions from various scholars:

1. **Quantitative Studies:** Statistical analyses that provide measurable insights
2. **Qualitative Research:** In-depth explorations that reveal nuanced understanding
3. **Mixed-Method Approaches:** Comprehensive studies combining multiple research methodologies

## Methodology

This analysis employs a systematic approach to examine ${topic}, incorporating:

- **Data Collection:** Comprehensive gathering of relevant information from multiple sources
- **Analysis Techniques:** Application of appropriate analytical methods and tools
- **Validation Processes:** Ensuring accuracy and reliability of findings

## Findings and Discussion

The research reveals several significant findings regarding ${topic}:

### Primary Findings

1. **Pattern Identification:** Clear patterns emerge from the analysis of available data
2. **Correlation Analysis:** Strong relationships exist between various factors
3. **Causal Relationships:** Evidence suggests specific cause-and-effect relationships

### Implications

These findings have important implications for:

- **Theoretical Development:** Advancing our conceptual understanding
- **Practical Applications:** Informing real-world implementations
- **Policy Considerations:** Guiding decision-making processes

## Conclusion and Future Research

This study contributes to the academic discourse on ${topic} by providing comprehensive analysis and evidence-based insights. Future research should focus on addressing identified gaps and exploring emerging dimensions of this important topic.

The scholarly community would benefit from continued investigation into the complexities and nuances of ${topic}, particularly in light of evolving contexts and changing circumstances.`,
      ar: `# التحليل الأكاديمي: ${topic}

هذه الورقة الأكاديمية تفحص ${topic} من خلال عدسة تحليلية شاملة، تستكشف أسسه النظرية والأدلة التجريبية والآثار العملية.`
    }
  };

  const template = templates[textType as keyof typeof templates] || templates.formal;
  return template[language as keyof typeof template] || template.en;
}

function generateGrammarResponse(message: string, language: string): string {
  if (language === 'ar') {
    return `# شرح قواعد اللغة الإنجليزية

## نصائح مهمة لتعلم قواعد اللغة الإنجليزية:

### 1. الأزمنة (Tenses)
- **الماضي البسيط (Past Simple):** للأحداث المكتملة في الماضي
- **الحاضر البسيط (Present Simple):** للحقائق والعادات
- **المستقبل البسيط (Future Simple):** للخطط المستقبلية

### 2. قواعد الأفعال المساعدة
- **Do/Does:** في الأسئلة والنفي في الحاضر البسيط
- **Did:** في الأسئلة والنفي في الماضي البسيط
- **Will:** للمستقبل

### 3. أدوات التعريف والتنكير
- **A/An:** للأسماء المفردة النكرة
- **The:** للأسماء المعرفة

### 4. نصائح للتحسين:
- اقرأ كثيراً لتعتاد على التراكيب الصحيحة
- مارس الكتابة يومياً
- استمع للمتحدثين الأصليين
- لا تخف من الأخطاء - فهي جزء من التعلم`;
  }

  return `# English Grammar Guide

## Essential Grammar Tips:

### 1. Verb Tenses
- **Past Simple:** For completed actions in the past
- **Present Simple:** For facts and habits
- **Future Simple:** For future plans and predictions

### 2. Auxiliary Verbs
- **Do/Does:** For questions and negatives in present simple
- **Did:** For questions and negatives in past simple
- **Will:** For future tense

### 3. Articles
- **A/An:** For singular countable nouns (indefinite)
- **The:** For specific nouns (definite)

### 4. Common Mistakes to Avoid:
- Subject-verb agreement errors
- Incorrect use of prepositions
- Mixing up similar words (affect/effect)
- Forgetting to use articles

### 5. Practice Tips:
- Read extensively to see correct structures
- Write daily to practice grammar rules
- Listen to native speakers
- Don't be afraid of mistakes - they're part of learning!`;
}

function generatePronunciationResponse(message: string, language: string): string {
  if (language === 'ar') {
    return `# دليل تحسين النطق الإنجليزي

## نصائح أساسية للنطق الصحيح:

### 1. الأصوات الصعبة للعرب:
- **TH Sound (/θ/ و /ð/):** ضع لسانك بين أسنانك
- **P vs B:** P بنفخة هواء، B بدون نفخة
- **V vs W:** V بالأسنان والشفة، W بضم الشفتين

### 2. تمارين يومية:
- اقرأ بصوت عالٍ لمدة 10 دقائق يومياً
- سجل صوتك وقارنه بالمتحدثين الأصليين
- مارس الكلمات الصعبة مراراً وتكراراً

### 3. استخدم الموارد التالية:
- القواميس الصوتية
- تطبيقات النطق
- مقاطع فيديو تعليمية
- محادثات مع متحدثين أصليين

### 4. تذكر:
- النطق الصحيح يحتاج وقت وصبر
- التكرار هو مفتاح التحسن
- لا تخجل من الأخطاء`;
  }

  return `# English Pronunciation Improvement Guide

## Essential Pronunciation Tips:

### 1. Challenging Sounds for Arabic Speakers:
- **TH Sound (/θ/ and /ð/):** Place tongue between teeth
- **P vs B:** P with a puff of air, B without
- **V vs W:** V with teeth and lip, W with rounded lips

### 2. Daily Practice Exercises:
- Read aloud for 10 minutes daily
- Record yourself and compare with native speakers
- Practice difficult words repeatedly
- Use tongue twisters for specific sounds

### 3. Helpful Resources:
- Audio dictionaries with phonetic symbols
- Pronunciation apps with feedback
- YouTube pronunciation tutorials
- Language exchange with native speakers

### 4. Key Reminders:
- Pronunciation improvement takes time and patience
- Repetition is the key to progress
- Don't be afraid to make mistakes
- Focus on clarity over perfection initially`;
}

function generateVocabularyResponse(message: string, language: string): string {
  if (language === 'ar') {
    return `# تطوير المفردات الإنجليزية

## استراتيجيات فعالة لزيادة المفردات:

### 1. التعلم بالسياق:
- اقرأ المفردات في جمل وليس منفردة
- استخدم القواميس أحادية اللغة
- اربط الكلمات الجديدة بالكلمات المعروفة

### 2. تقنيات الحفظ:
- **البطاقات التعليمية:** للمراجعة اليومية
- **الخرائط الذهنية:** لربط الكلمات ذات الصلة
- **القصص:** لحفظ الكلمات في سياق

### 3. مفردات أساسية للتركيز عليها:
- **الكلمات الأكثر شيوعاً:** 1000 كلمة الأكثر استخداماً
- **المفردات الأكاديمية:** للدراسة والعمل
- **المصطلحات المهنية:** حسب مجال عملك

### 4. تطبيق عملي:
- استخدم 5 كلمات جديدة يومياً في المحادثة
- اكتب جملاً باستخدام المفردات الجديدة
- راجع المفردات القديمة بانتظام

### 5. موارد مفيدة:
- قوائم المفردات المصنفة حسب الموضوع
- تطبيقات تعلم المفردات
- كتب المفردات المتدرجة`;
  }

  return `# English Vocabulary Development

## Effective Strategies for Vocabulary Building:

### 1. Learn in Context:
- Study words in sentences, not isolation
- Use monolingual dictionaries
- Connect new words to known words

### 2. Memory Techniques:
- **Flashcards:** For daily review
- **Mind Maps:** To connect related words
- **Stories:** To remember words in context
- **Word Associations:** Link to visual or emotional memory

### 3. Essential Vocabulary Categories:
- **High-Frequency Words:** The most common 1000 words
- **Academic Vocabulary:** For study and professional use
- **Subject-Specific Terms:** Related to your field of interest

### 4. Practical Application:
- Use 5 new words daily in conversation
- Write sentences with new vocabulary
- Review old vocabulary regularly
- Keep a vocabulary journal

### 5. Useful Resources:
- Thematic vocabulary lists
- Vocabulary learning apps
- Graded vocabulary books
- Etymology dictionaries for word origins`;
}

function generateGeneralResponse(message: string, language: string): string {
  if (language === 'ar') {
    return `# مساعدتك في تعلم اللغة الإنجليزية

مرحباً! أنا هنا لمساعدتك في تطوير مهاراتك في اللغة الإنجليزية. يمكنني مساعدتك في:

## المجالات التي أقدم المساعدة فيها:

### 📚 القواعد النحوية
- شرح قواعد اللغة الإنجليزية بطريقة مبسطة
- أمثلة عملية وتمارين تطبيقية
- تصحيح الأخطاء الشائعة

### 🗣️ النطق والتحدث
- تحسين النطق للأصوات الصعبة
- نصائح للتحدث بطلاقة
- تمارين للتدرب على النطق

### 📖 المفردات
- استراتيجيات حفظ الكلمات الجديدة
- المفردات حسب المواضيع
- تطوير المفردات الأكاديمية والمهنية

### ✍️ الكتابة
- تحسين مهارات الكتابة
- أنواع النصوص المختلفة
- التدقيق اللغوي والنحوي

### 👂 الاستماع والفهم
- تطوير مهارات الاستماع
- فهم اللهجات المختلفة
- نصائح لتحسين الفهم

## كيف يمكنني مساعدتك اليوم؟

أخبرني عما تريد تعلمه أو تحسينه في اللغة الإنجليزية، وسأقدم لك شرحاً مفصلاً ونصائح عملية!`;
  }

  return `# Your English Learning Assistant

Hello! I'm here to help you improve your English language skills. I can assist you with:

## Areas I Can Help With:

### 📚 Grammar
- Explaining English grammar rules clearly
- Providing practical examples and exercises
- Correcting common mistakes

### 🗣️ Pronunciation & Speaking
- Improving pronunciation of difficult sounds
- Tips for speaking fluently
- Practice exercises for better speech

### 📖 Vocabulary
- Strategies for learning new words
- Topic-based vocabulary
- Academic and professional terminology

### ✍️ Writing
- Improving writing skills
- Different types of texts
- Grammar and style checking

### 👂 Listening & Comprehension
- Developing listening skills
- Understanding different accents
- Tips for better comprehension

### 💼 Business English
- Professional communication
- Email writing
- Meeting and presentation skills

## How Can I Help You Today?

Tell me what you'd like to learn or improve in English, and I'll provide you with detailed explanations and practical tips!

Feel free to ask about:
- Specific grammar rules
- Pronunciation of particular words
- Vocabulary for certain topics
- Writing techniques
- Speaking practice topics`;
}
