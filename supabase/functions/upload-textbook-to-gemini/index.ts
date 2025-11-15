import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('JORDANIAN_AI_SEARCH_KEY_1')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get book details
    const { data: book, error: bookError } = await supabase
      .from('jordanian_textbooks')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      throw new Error('Book not found');
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('jordanian-textbooks')
      .download(book.file_url.split('/').pop()!);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Upload to Gemini File API
    const formData = new FormData();
    formData.append('file', fileData, book.book_name + '.pdf');

    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${geminiApiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Gemini');
    }

    const geminiFile = await uploadResponse.json();

    // Update database with Gemini file info
    const { error: updateError } = await supabase
      .from('jordanian_textbooks')
      .update({
        gemini_file_uri: geminiFile.file.uri,
        gemini_file_name: geminiFile.file.name,
      })
      .eq('id', bookId);

    if (updateError) {
      throw new Error('Failed to update book record');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        geminiFileUri: geminiFile.file.uri,
        geminiFileName: geminiFile.file.name
      }),
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