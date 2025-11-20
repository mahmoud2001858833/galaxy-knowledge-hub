import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textbookId } = await req.json();
    
    if (!textbookId) {
      throw new Error("Textbook ID is required");
    }

    console.log(`Starting text extraction for textbook: ${textbookId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get textbook details
    const { data: textbook, error: fetchError } = await supabase
      .from('jordanian_textbooks')
      .select('file_url, book_name')
      .eq('id', textbookId)
      .single();

    if (fetchError || !textbook) {
      throw new Error(`Failed to fetch textbook: ${fetchError?.message}`);
    }

    console.log(`Processing textbook: ${textbook.book_name}`);
    console.log(`File URL: ${textbook.file_url}`);

    // Download PDF from storage
    const fileResponse = await fetch(textbook.file_url);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download PDF: ${fileResponse.statusText}`);
    }

    const pdfArrayBuffer = await fileResponse.arrayBuffer();
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    console.log(`PDF size: ${pdfBytes.length} bytes`);

    // Convert PDF to base64
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    
    console.log('Extracting text using Lovable AI...');

    // Use Lovable AI to extract text from PDF
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'استخرج كل النص من هذا الكتاب المدرسي. أعد النص كاملاً بدون أي تلخيص أو اختصار. احتفظ بكل التفاصيل والأمثلة والتمارين.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        temperature: 0,
        max_tokens: 100000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI extraction failed: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    const extractedText = aiResult.choices?.[0]?.message?.content;

    if (!extractedText || !extractedText.trim()) {
      throw new Error('No text could be extracted from PDF');
    }

    console.log(`Extracted text length: ${extractedText.length} characters`);

    // Update textbook with extracted text
    const { error: updateError } = await supabase
      .from('jordanian_textbooks')
      .update({ extracted_text: extractedText.trim() })
      .eq('id', textbookId);

    if (updateError) {
      throw new Error(`Failed to save extracted text: ${updateError.message}`);
    }

    console.log('OCR extraction completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم استخراج النص من الكتاب بنجاح',
        textLength: extractedText.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-textbook-text function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});