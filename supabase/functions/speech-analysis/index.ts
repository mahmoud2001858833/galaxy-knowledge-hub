
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
    const { audioData, targetText, language = 'en' } = await req.json();
    
    if (!audioData || !targetText) {
      throw new Error('Audio data and target text are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert base64 audio to blob for Whisper API
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    // Create form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'verbose_json');

    // Call Whisper API for transcription
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Whisper API error: ${transcriptionResponse.status}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcribedText = transcriptionData.text;

    // Analyze pronunciation accuracy
    const accuracy = calculatePronunciationAccuracy(transcribedText, targetText);
    
    // Generate detailed feedback
    const feedback = await generateDetailedFeedback(transcribedText, targetText, openaiApiKey);

    return new Response(
      JSON.stringify({
        transcription: transcribedText,
        accuracy: accuracy,
        feedback: feedback,
        confidence: transcriptionData.segments?.[0]?.avg_logprob || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in speech-analysis function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculatePronunciationAccuracy(transcribed: string, target: string): number {
  const transcribedWords = transcribed.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  
  let correctWords = 0;
  const maxLength = Math.max(transcribedWords.length, targetWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (transcribedWords[i] && targetWords[i] && 
        transcribedWords[i] === targetWords[i]) {
      correctWords++;
    }
  }
  
  return Math.round((correctWords / targetWords.length) * 100);
}

async function generateDetailedFeedback(transcribed: string, target: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an English pronunciation coach. Analyze the differences between what the student said and what they were supposed to say. Provide specific, helpful feedback for improvement. Keep it concise and encouraging.'
          },
          {
            role: 'user',
            content: `Target text: "${target}"\nStudent said: "${transcribed}"\n\nProvide specific pronunciation feedback.`
          }
        ],
        max_tokens: 200
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error: any) {
    console.error('Error generating feedback:', error);
  }
  
  return 'Keep practicing! Focus on clear pronunciation of each word.';
}
