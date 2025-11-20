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
    const ocrServerUrl = Deno.env.get('OCR_SERVER_URL');

    if (!ocrServerUrl) {
      throw new Error("OCR_SERVER_URL is not configured");
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

    // Send file URL to OCR server
    console.log('Sending file URL to OCR server...');
    const ocrResponse = await fetch(`${ocrServerUrl}/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_url: textbook.file_url,
        filename: textbook.book_name
      }),
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error('OCR Server error:', ocrResponse.status, errorText);
      throw new Error(`فشل استخراج النص من السيرفر: ${ocrResponse.statusText}`);
    }

    const ocrResult = await ocrResponse.json();
    
    if (!ocrResult.success || !ocrResult.text) {
      throw new Error(ocrResult.error || 'لم يتم استخراج أي نص من الملف');
    }

    const extractedText = ocrResult.text;
    const fileSizeMB = ocrResult.file_size_mb || 0;
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
        textLength: extractedText.length,
        fileSize: fileSizeMB.toFixed(2)
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