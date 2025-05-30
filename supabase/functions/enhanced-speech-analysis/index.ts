
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
    const { audioData, targetText, language = 'en', analysisType = 'pronunciation' } = await req.json();
    
    if (!audioData || !targetText) {
      throw new Error('Audio data and target text are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing speech analysis:', { targetText: targetText.substring(0, 50), language, analysisType });

    // Convert base64 audio to blob for Whisper API
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    // Create form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    console.log('Making request to Whisper API...');

    // Call Whisper API for transcription
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Whisper API error:', transcriptionResponse.status, errorText);
      throw new Error(`Whisper API error: ${transcriptionResponse.status}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcribedText = transcriptionData.text;

    console.log('Transcription received:', transcribedText);

    // Enhanced analysis calculations
    const analysis = performEnhancedAnalysis(transcribedText, targetText, transcriptionData);
    
    // Generate detailed feedback using GPT
    const feedback = await generateEnhancedFeedback(
      transcribedText, 
      targetText, 
      analysis, 
      analysisType,
      openaiApiKey
    );

    const result = {
      transcription: transcribedText,
      accuracy: analysis.accuracy,
      wordAccuracy: analysis.wordAccuracy,
      pronunciationScore: analysis.pronunciationScore,
      fluencyScore: analysis.fluencyScore,
      clarityScore: analysis.clarityScore,
      feedback: feedback,
      detailedAnalysis: analysis.details,
      confidence: transcriptionData.segments?.[0]?.avg_logprob || 0,
      wordTimings: transcriptionData.words || []
    };

    console.log('Analysis complete:', { accuracy: analysis.accuracy, scores: analysis });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in enhanced-speech-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        transcription: '',
        accuracy: 0,
        feedback: 'Unable to analyze speech. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function performEnhancedAnalysis(transcribed: string, target: string, transcriptionData: any) {
  const transcribedWords = transcribed.toLowerCase().trim().split(/\s+/);
  const targetWords = target.toLowerCase().trim().split(/\s+/);
  
  // Word-level accuracy
  let correctWords = 0;
  let wordDetails = [];
  
  for (let i = 0; i < Math.max(transcribedWords.length, targetWords.length); i++) {
    const transcribedWord = transcribedWords[i] || '';
    const targetWord = targetWords[i] || '';
    
    if (transcribedWord && targetWord) {
      const similarity = calculateWordSimilarity(transcribedWord, targetWord);
      if (similarity > 0.8) correctWords++;
      
      wordDetails.push({
        target: targetWord,
        transcribed: transcribedWord,
        correct: similarity > 0.8,
        similarity: similarity
      });
    }
  }
  
  const wordAccuracy = targetWords.length > 0 ? (correctWords / targetWords.length) * 100 : 0;
  
  // Overall accuracy (considering word order and completeness)
  const accuracy = Math.round(wordAccuracy);
  
  // Pronunciation score (based on word similarities)
  const pronunciationScore = Math.round(
    wordDetails.reduce((sum, word) => sum + word.similarity, 0) / Math.max(wordDetails.length, 1) * 100
  );
  
  // Fluency score (based on speech rate and pauses)
  const avgLogProb = transcriptionData.segments?.[0]?.avg_logprob || -1;
  const fluencyScore = Math.round(Math.max(0, (avgLogProb + 1) * 100));
  
  // Clarity score (based on confidence)
  const clarityScore = Math.round(Math.max(0, (avgLogProb + 0.5) * 200));
  
  return {
    accuracy,
    wordAccuracy: Math.round(wordAccuracy),
    pronunciationScore,
    fluencyScore,
    clarityScore,
    details: {
      wordAnalysis: wordDetails,
      totalWords: targetWords.length,
      correctWords,
      confidence: avgLogProb
    }
  };
}

function calculateWordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 1;
  
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 1;
  
  return 1 - (levenshteinDistance(word1, word2) / maxLen);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function generateEnhancedFeedback(
  transcribed: string, 
  target: string, 
  analysis: any, 
  analysisType: string,
  apiKey: string
): Promise<string> {
  try {
    const prompt = `You are an expert English pronunciation coach. Analyze this speech attempt and provide specific, encouraging feedback.

Target text: "${target}"
Student said: "${transcribed}"
Analysis type: ${analysisType}
Accuracy: ${analysis.accuracy}%
Pronunciation score: ${analysis.pronunciationScore}%
Word accuracy: ${analysis.wordAccuracy}%

Provide specific feedback on:
1. What they did well
2. Specific areas to improve
3. Pronunciation tips for difficult words
4. Encouragement for continued practice

Keep the feedback concise, specific, and encouraging. Focus on actionable advice.`;

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
            content: 'You are a supportive English pronunciation coach who provides specific, actionable feedback to help students improve their English speaking skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error generating enhanced feedback:', error);
  }
  
  // Fallback feedback based on scores
  if (analysis.accuracy >= 90) {
    return 'Excellent pronunciation! Your speech was very clear and accurate. Keep up the great work!';
  } else if (analysis.accuracy >= 70) {
    return 'Good job! Most words were pronounced correctly. Focus on the words that were unclear and practice them slowly.';
  } else if (analysis.accuracy >= 50) {
    return 'You\'re making progress! Try speaking more slowly and clearly. Practice the target text several times before recording.';
  } else {
    return 'Keep practicing! Try breaking down difficult words into smaller parts. Listen to the example audio carefully and repeat it several times.';
  }
}
