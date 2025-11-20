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

    console.log(`Starting OCR extraction for textbook: ${textbookId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ocrApiKey = Deno.env.get('OCR_SPACE_API_KEY');

    if (!ocrApiKey) {
      throw new Error("OCR_SPACE_API_KEY is not configured");
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

    const pdfBlob = await fileResponse.blob();
    console.log(`PDF size: ${pdfBlob.size} bytes`);

    // Prepare form data for OCR.space API
    const formData = new FormData();
    formData.append('file', pdfBlob, 'textbook.pdf');
    formData.append('apikey', ocrApiKey);
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('filetype', 'PDF');

    console.log('Sending PDF to OCR.space API...');

    // Call OCR.space API
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR API request failed: ${ocrResponse.statusText}`);
    }

    const ocrResult = await ocrResponse.json();
    console.log(`OCR API response status: ${ocrResult.OCRExitCode}`);

    if (ocrResult.OCRExitCode !== 1) {
      throw new Error(`OCR processing failed: ${ocrResult.ErrorMessage || 'Unknown error'}`);
    }

    // Extract text from all pages
    let extractedText = '';
    if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
      for (const result of ocrResult.ParsedResults) {
        if (result.ParsedText) {
          extractedText += result.ParsedText + '\n\n';
        }
      }
    }

    if (!extractedText.trim()) {
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