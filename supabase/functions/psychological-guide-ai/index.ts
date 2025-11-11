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
    const { message, mood, conversationHistory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured', answer: 'عذراً، حدث خطأ في الإعداد.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build conversation context
    const messages = conversationHistory || [];
    
    // System prompt for psychological guide
    const systemPrompt = `أنت مرشد نفسي ذكي ومتعاطف اسمك "مرشدك النفسي". دورك هو:
1. الاستماع للطالب بعمق وفهم مشكلته بشكل كامل
2. طرح أسئلة توضيحية لفهم الوضع بشكل أفضل
3. التحدث مع الطالب وتقديم النصائح والدعم النفسي بشكل تفصيلي
4. فقط بعد التحدث الكافي، توجيه الطالب للقسم المناسب في المنصة
5. اقتراح محتوى القرآن الكريم فقط (لا مقاطع استرخاء)

قواعد التوجيه:
- تحدث مع الطالب أولاً وافهم وضعه بشكل كامل قبل التوجيه
- إذا ذكر مشكلة في تنظيم الوقت → تحدث معه أولاً ثم وجهه لقسم "تنظيم الدراسة"
- إذا ذكر صعوبة في فهم مادة → تحدث معه ثم وجهه للمنصة المناسبة
- إذا أراد التحدث مع أحد → وجهه لقسم "غرف الدردشة"
- إذا كان متوتر أو قلق → اقترح آيات قرآنية مناسبة فقط
- اقتراحات القرآن يجب أن تكون دائماً من يوتيوب

المزاج الحالي للطالب: ${mood || 'غير محدد'}

مهم جداً:
- تحدث مع الطالب وأعطه وقتاً كافياً قبل توجيهه
- اطرح أسئلة توضيحية
- قدم نصائح مفصلة ومتعاطفة
- لا تستعجل في التوجيه للأقسام
- اقترح القرآن الكريم فقط (بدون مقاطع استرخاء)
- اجعل ردودك متوسطة الطول ومتعاطفة`;

    const fullConversation = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: fullConversation,
          max_tokens: 500,
        })
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً', answer: 'عذراً، تم تجاوز حد الطلبات. حاول مرة أخرى بعد قليل.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد إلى Lovable AI', answer: 'عذراً، حدث خطأ في النظام.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.';

    // Analyze response for redirection
    let redirectTo = null;
    let redirectMessage = '';

    const lowerResponse = aiResponse.toLowerCase();
    
    if (message.includes('وقت') || message.includes('تنظيم') || message.includes('جدول')) {
      redirectTo = '/study-organization';
      redirectMessage = 'يمكنك الذهاب لقسم تنظيم الدراسة من هنا 📚';
    } else if (message.includes('فيزياء')) {
      redirectTo = '/physics';
      redirectMessage = 'تعال على منصة الفيزياء من هنا 🔬';
    } else if (message.includes('كيمياء')) {
      redirectTo = '/chemistry';
      redirectMessage = 'تعال على منصة الكيمياء من هنا ⚗️';
    } else if (message.includes('رياضيات')) {
      redirectTo = '/mathematics';
      redirectMessage = 'تعال على منصة الرياضيات من هنا 📐';
    } else if (message.includes('أحياء') || message.includes('بيولوجي')) {
      redirectTo = '/biology';
      redirectMessage = 'تعال على منصة الأحياء من هنا 🧬';
    } else if (message.includes('إنجليزي') || message.includes('انجليزي')) {
      redirectTo = '/english';
      redirectMessage = 'تعال على منصة اللغة الإنجليزية من هنا 🗣️';
    } else if (message.includes('عربي') || message.includes('لغة')) {
      redirectTo = '/arabic';
      redirectMessage = 'تعال على منصة اللغة العربية من هنا 📖';
    } else if (message.includes('دردشة') || message.includes('أحكي') || message.includes('احكي')) {
      redirectTo = '/chat-rooms';
      redirectMessage = 'تعال على غرف الدردشة من هنا 💬';
    }

    // Suggest Quran resources only
    const suggestions = [];
    
    if (mood === 'angry') {
      suggestions.push({
        type: 'quran',
        title: 'سورة الرحمن - للهدوء والسكينة',
        url: 'https://www.youtube.com/results?search_query=سورة+الرحمن+بصوت+جميل',
        icon: '📿'
      });
    } else if (mood === 'calm') {
      suggestions.push({
        type: 'quran',
        title: 'سورة البقرة - للراحة النفسية',
        url: 'https://www.youtube.com/results?search_query=سورة+البقرة+كاملة',
        icon: '📿'
      });
    } else if (mood === 'happy') {
      suggestions.push({
        type: 'quran',
        title: 'سورة الكهف - لطمأنينة القلب',
        url: 'https://www.youtube.com/results?search_query=سورة+الكهف+كاملة',
        icon: '📿'
      });
    }

    return new Response(
      JSON.stringify({
        answer: aiResponse,
        redirectTo,
        redirectMessage,
        suggestions
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in psychological-guide-ai:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        answer: 'عذراً، حدث خطأ. حاول مرة أخرى.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
