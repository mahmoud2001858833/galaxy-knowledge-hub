import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const searchKeys = [
  Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1')!,
  Deno.env.get('JORDANIAN_AI_SEARCH_KEY_2')!,
  Deno.env.get('JORDANIAN_AI_SEARCH_KEY_3')!,
  Deno.env.get('JORDANIAN_AI_SEARCH_KEY_4')!,
  Deno.env.get('JORDANIAN_AI_SEARCH_KEY_5')!,
];

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

    // Search in parallel using multiple AI keys
    const searchPromises = relevantBooks.slice(0, 5).map(async (book, index) => {
      const apiKey = searchKeys[index % searchKeys.length];
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `ابحث في كتاب ${book.book_name} عن معلومات تجيب على هذا السؤال: "${question}"\n\nقدم:\n1. المعلومات المتعلقة بالسؤال\n2. أرقام الصفحات المحددة\n3. اقتباسات نصية من الكتاب`
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2000,
              }
            })
          }
        );

        if (!response.ok) {
          console.error(`Search failed for ${book.book_name}`);
          return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
          bookName: book.book_name,
          subject: book.subject,
          content: text,
          bookId: book.id
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