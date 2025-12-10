import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

// ✅ دالة محسنة لاستخراج الكلمات المفتاحية
function extractKeywords(question: string): string[] {
  // كلمات التوقف العربية
  const stopWords = new Set([
    'من', 'في', 'على', 'إلى', 'عن', 'مع', 'هو', 'هي', 'هذا', 'هذه', 'ذلك', 'تلك',
    'الذي', 'التي', 'ما', 'ماذا', 'كيف', 'لماذا', 'متى', 'أين', 'هل', 'كم',
    'و', 'أو', 'ثم', 'لكن', 'أن', 'إن', 'أنه', 'أنها', 'كان', 'كانت', 'يكون',
    'ال', 'لا', 'نعم', 'قد', 'سوف', 'قبل', 'بعد', 'فوق', 'تحت', 'بين',
    'كل', 'بعض', 'أي', 'جميع', 'معظم', 'أكثر', 'أقل', 'عند', 'حول',
  ]);
  
  // تنظيف السؤال واستخراج الكلمات
  const words = question
    .replace(/[؟،.!:؛'"«»\-\(\)\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word))
    .map(word => word.replace(/^ال/, '')); // إزالة "ال" التعريف
  
  // إضافة أشكال متعددة للكلمات
  const expandedWords: string[] = [];
  for (const word of words) {
    expandedWords.push(word);
    expandedWords.push(`ال${word}`);
    
    // إضافة جذور محتملة (تبسيط)
    if (word.length > 3) {
      expandedWords.push(word.substring(0, word.length - 1));
      expandedWords.push(word.substring(1));
    }
  }
  
  return [...new Set(expandedWords)];
}

// ✅ دالة محسنة لحساب درجة الصلة
function calculateRelevanceScore(
  page: any,
  keywords: string[],
  studentGrade: string
): number {
  let score = 0;
  
  const pageText = (page.page_content || '').toLowerCase();
  const lessonName = (page.lesson_name || '').toLowerCase();
  const unitName = (page.unit_name || '').toLowerCase();
  const subject = (page.subject || '').toLowerCase();
  
  const fullText = `${pageText} ${lessonName} ${unitName}`;
  
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    // تطابق في المحتوى
    const contentMatches = (pageText.match(new RegExp(lowerKeyword, 'gi')) || []).length;
    score += contentMatches * 2;
    
    // تطابق في اسم الدرس (أولوية عالية)
    if (lessonName.includes(lowerKeyword)) score += 10;
    
    // تطابق في اسم الوحدة
    if (unitName.includes(lowerKeyword)) score += 8;
    
    // تطابق في اسم المادة
    if (subject.includes(lowerKeyword)) score += 5;
    
    // بحث عن تعريفات ومفاهيم
    const definitionPatterns = [
      `${lowerKeyword} هو`,
      `${lowerKeyword} هي`,
      `تعريف ${lowerKeyword}`,
      `معنى ${lowerKeyword}`,
      `مفهوم ${lowerKeyword}`,
      `يُعرَّف ${lowerKeyword}`,
      `${lowerKeyword}:`,
    ];
    
    for (const pattern of definitionPatterns) {
      if (fullText.includes(pattern)) score += 15;
    }
  }
  
  // أولوية لصف الطالب
  if (page.grade === studentGrade) score += 5;
  
  // أولوية للمحتوى الأطول (أكثر تفصيلاً)
  if (pageText.length > 500) score += 2;
  if (pageText.length > 1000) score += 3;
  
  return score;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, studentName, grade, image } = await req.json();
    console.log('🎓 Processing question:', { question: question?.substring(0, 100), studentName, grade, hasImage: !!image });

    if (!question) {
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'السؤال مفقود' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('❌ LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'إعدادات الذكاء الاصطناعي غير مكتملة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ استخراج كلمات البحث المحسنة
    const keywords = extractKeywords(question);
    console.log('🔍 Search keywords:', keywords.slice(0, 10));

    // ✅ جلب كل المحتوى من قاعدة البيانات
    console.log('📚 Fetching all textbook content...');
    
    const { data: allContent, error: contentError } = await supabase
      .from('jordanian_textbook_content')
      .select('*')
      .order('grade', { ascending: true })
      .order('unit_number', { ascending: true })
      .order('lesson_number', { ascending: true })
      .order('page_number', { ascending: true });

    if (contentError) {
      console.error('❌ Content fetch error:', contentError);
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'فشل جلب المحتوى الدراسي' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allContent || allContent.length === 0) {
      console.log('❌ No content found in database');
      return new Response(
        JSON.stringify({
          answer: 'عذراً، لم يتم تزويد النظام بأي محتوى دراسي بعد. يرجى رفع الكتب المدرسية أولاً.',
          sources: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📖 Total pages in database: ${allContent.length}`);

    // ✅ حساب درجة الصلة لكل صفحة
    const scoredContent = allContent.map((page: any) => ({
      ...page,
      relevanceScore: calculateRelevanceScore(page, keywords, grade)
    }));

    // ترتيب حسب الصلة
    scoredContent.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    // ✅ اختيار أفضل المحتوى (أعلى 80 صفحة ذات صلة)
    const topRelevantPages = scoredContent.filter((p: any) => p.relevanceScore > 0).slice(0, 80);
    
    // إضافة كل محتوى صف الطالب إذا لم يكن كافياً
    const gradePages = scoredContent.filter((p: any) => p.grade === grade);
    
    // دمج بدون تكرار
    const contentMap = new Map();
    [...topRelevantPages, ...gradePages.slice(0, 50)].forEach((p: any) => {
      contentMap.set(p.id, p);
    });
    
    const selectedPages = Array.from(contentMap.values())
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, 100);

    console.log(`📊 Selected ${selectedPages.length} most relevant pages`);
    console.log(`📈 Top relevance scores: ${selectedPages.slice(0, 5).map((p: any) => p.relevanceScore).join(', ')}`);

    // ✅ بناء السياق مع تنسيق واضح
    const booksContext = selectedPages
      .map((p: any) => 
        `【المصدر: الصف ${p.grade} | ${p.subject} | الوحدة ${p.unit_number}: ${p.unit_name} | الدرس ${p.lesson_number}: ${p.lesson_name} | صفحة ${p.page_number}】
${p.page_content}
【نهاية المصدر】`
      )
      .join('\n\n---\n\n');

    console.log(`📝 Context size: ${booksContext.length} characters`);

    // ✅ بناء الـ System Prompt المحسن
    const systemPrompt = `أنت معلم أردني محترف ذو خبرة 30 عاماً في تدريس المنهاج الأردني لجميع المراحل.
مهمتك الأساسية: الإجابة على أسئلة الطلاب من الكتب المدرسية الأردنية فقط.

📚 المحتوى المتاح من الكتب:
${booksContext}

═══════════════════════════════════════════════════════════════════
📋 قواعد البحث والإجابة:
═══════════════════════════════════════════════════════════════════

1. 🔍 البحث الشامل والذكي:
   - ابحث في كل المحتوى المتاح بدقة عالية
   - ابحث عن المفاهيم وليس الكلمات الحرفية فقط
   - إذا سأل الطالب عن "تعريف X" ابحث عن: "X هو/هي"، "يُعرَّف X"، "X:"، "معنى X" إلخ

2. 🔄 المرونة اللغوية الكاملة:
   - "تعريف" = "معنى" = "مفهوم" = "ما هو" = "ما المقصود"
   - "أسباب" = "عوامل" = "دوافع" = "لماذا"
   - "نتائج" = "آثار" = "عواقب" = "ماذا حدث"
   - "أهمية" = "فائدة" = "دور" = "قيمة"
   - تجاهل الفروق الإملائية البسيطة والهمزات
   - افهم السياق العام للسؤال

3. ✅ إذا وجدت المعلومة - صيغة الإجابة:
   
   ابدأ بإجابة واضحة ومفصلة:
   - اشرح المفهوم بطريقة سهلة الفهم
   - أضف أمثلة من الكتاب إذا وجدت
   - وضح النقاط المهمة
   
   ثم اختم بالمصدر الدقيق:
   ═══════════════════════════
   📚 المصدر:
   - الكتاب: [اسم المادة]
   - الصف: [الصف]
   - الوحدة: [رقم]: [اسم الوحدة]
   - الدرس: [رقم]: [اسم الدرس]
   - الصفحة: [رقم]
   ═══════════════════════════

4. ⚠️ قاعدة المصدر الواحد:
   - اذكر فقط المصدر الذي أخذت منه المعلومة فعلياً
   - لا تسرد كل الكتب والمصادر المتاحة
   - كن دقيقاً في ذكر رقم الصفحة

5. ❌ إذا لم تجد المعلومة بعد البحث الشامل:
   قل: "عذراً، لم أجد هذه المعلومة في الكتب المتاحة حالياً. قد تكون في كتاب لم يتم رفعه بعد."
   
   لا تختلق معلومات غير موجودة في الكتب!

6. 📝 اللغة والأسلوب:
   - استخدم العربية الفصحى الواضحة والبسيطة
   - قسّم الإجابة لفقرات قصيرة
   - استخدم التعداد للنقاط المتعددة

═══════════════════════════════════════════════════════════════════
الطالب ${studentName} من الصف ${grade} يسأل. 
ابحث بعناية فائقة في كل المحتوى المتاح للإجابة على سؤاله.
═══════════════════════════════════════════════════════════════════`;

    console.log('🤖 Calling Lovable AI Gateway...');

    // Prepare messages for Lovable AI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (image) {
      const base64Content = image.split(',')[1] || image;
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: `السؤال: ${question}` },
          { 
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Content}` }
          }
        ]
      });
    } else {
      messages.push({ role: 'user', content: `السؤال: ${question}` });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.2,
        max_tokens: 10000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ answer: null, sources: [], error: 'تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ answer: null, sources: [], error: 'يرجى إضافة رصيد للحساب' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'فشل الحصول على إجابة من الذكاء الاصطناعي' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '';

    if (!answer) {
      return new Response(
        JSON.stringify({ answer: null, sources: [], error: 'لم يتم توليد إجابة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Answer generated, length:', answer.length);

    // ✅ استخراج المصادر من الإجابة
    const sources: any[] = [];
    
    const sourceMatch = answer.match(/📚\s*المصدر[\s\S]*?(?=═|$)/);
    if (sourceMatch) {
      const sourceText = sourceMatch[0];
      const subjectMatch = sourceText.match(/الكتاب:\s*([^\n-]+)/);
      const gradeMatch = sourceText.match(/الصف:\s*([^\n-]+)/);
      const unitMatch = sourceText.match(/الوحدة:\s*(\d+)[:\s]*([^\n-]*)/);
      const lessonMatch = sourceText.match(/الدرس:\s*(\d+)[:\s]*([^\n-]*)/);
      const pageMatch = sourceText.match(/الصفحة:\s*(\d+)/);

      if (subjectMatch || pageMatch) {
        sources.push({
          bookName: subjectMatch?.[1]?.trim() || 'الكتاب',
          subject: subjectMatch?.[1]?.trim() || '',
          grade: gradeMatch?.[1]?.trim() || grade,
          unitNumber: unitMatch ? parseInt(unitMatch[1]) : null,
          unitName: unitMatch?.[2]?.trim() || '',
          lessonNumber: lessonMatch ? parseInt(lessonMatch[1]) : null,
          lessonName: lessonMatch?.[2]?.trim() || '',
          pageNumber: pageMatch ? pageMatch[1] : null,
          fileUrl: null,
        });
      }
    }

    // ✅ حفظ في قاعدة البيانات
    if (image) {
      await supabase.from('jordanian_image_analysis').insert({
        student_name: studentName,
        grade: grade,
        question: question,
        image_url: image.substring(0, 200) + '...',
        analysis_result: answer,
      });
    }
    
    await supabase.from('student_assistant_usage').insert({
      student_name: studentName,
      grade: grade,
      question: question,
      answer: answer,
      sources: sources,
    });

    console.log('💾 Answer saved, sources:', sources.length);

    return new Response(
      JSON.stringify({ answer, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ answer: null, sources: [], error: error?.message || 'حدث خطأ غير متوقع' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
