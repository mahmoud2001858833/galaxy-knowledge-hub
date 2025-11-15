import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, grade, subject } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get relevant textbooks
    const { data: books, error: booksError } = await supabase
      .from('jordanian_textbooks')
      .select('*')
      .eq('grade', grade)
      .eq('is_active', true);

    if (booksError || !books || books.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No textbooks found for this grade' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Filter by subject if provided
    const relevantBooks = subject 
      ? books.filter(book => book.subject.toLowerCase() === subject.toLowerCase())
      : books;

// Search in parallel using Lovable AI (Gemini 2.5 Flash)
const searchPromises = relevantBooks.slice(0, 5).map(async (book) => {
  try {
    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير مناهج أردني. لا تعتمد على أي مصدر خارج الكتب المذكورة. أعِد فقط مقتطفات واقتباسات مباشرة من الكتاب مع أرقام الصفحات إن توفّرت. إذا لم تجد معلومة صريحة في الكتاب، أعد كلمة واحدة فقط: NOT_FOUND.',
          },
          {
            role: 'user',
            content: `السؤال: ${question}\n\nالكتاب: ${book.book_name}\nالمادة: ${book.subject}\nالصف: ${book.grade}\n\nأعد مقطعاً موجزاً يجيب على السؤال باقتباسات نصية من الكتاب فقط مع ذكر أرقام الصفحات بصيغة (ص: 12). لا تضف مقدمات.`,
          }
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('Lovable AI search error:', t);
      return null;
    }

    const data = await resp.json();
    const text: string = data.choices?.[0]?.message?.content || '';

    if (!text || text.trim() === 'NOT_FOUND') {
      console.error(`No content found in ${book.book_name}`);
      return null;
    }

    return {
      bookName: book.book_name,
      subject: book.subject,
      content: text,
      bookId: book.id,
      fileUrl: book.file_url ?? null,
    };
  } catch (error) {
    console.error(`Error searching ${book.book_name}:`, error);
    return null;
  }
});

    const results = (await Promise.all(searchPromises)).filter(r => r !== null);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});