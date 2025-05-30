import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Play, Pause, RotateCcw, Volume2, Award, Target, 
  Timer, Zap, TrendingUp, BookOpen, Users, Star, Trophy, 
  ChevronRight, Settings, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { expandedEnglishExamples, getExamplesForMode, getRandomExample } from '@/data/expandedEnglishExamples';

interface EnhancedSpeechAssistantProps {
  language: 'ar' | 'en';
}

interface SpeechAnalysis {
  transcription: string;
  accuracy: number;
  wordAccuracy: number;
  pronunciationScore: number;
  fluencyScore: number;
  clarityScore: number;
  feedback: string;
  detailedAnalysis?: any;
}

const EnhancedSpeechAssistant: React.FC<EnhancedSpeechAssistantProps> = ({ language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExample, setCurrentExample] = useState(expandedEnglishExamples[0]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [mode, setMode] = useState('pronunciation');
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [voice, setVoice] = useState('Sarah');
  
  // Challenge mode states
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(60);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeWords, setChallengeWords] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "المساعد الذكي للنطق والتحدث",
      subtitle: "طور مهاراتك في النطق والتحدث باللغة الإنجليزية مع تدريبات تفاعلية متقدمة",
      difficultyLabel: "المستوى",
      easy: "سهل",
      medium: "متوسط", 
      hard: "صعب",
      modeLabel: "نوع التدريب",
      pronunciationMode: "تدريب النطق",
      fluencyMode: "تدريب الطلاقة",
      roleplayMode: "تمثيل الأدوار",
      challengeMode: "تحدي 60 ثانية",
      voiceLabel: "الصوت",
      listenExample: "استمع للمثال",
      startRecording: "ابدأ التسجيل",
      stopRecording: "أوقف التسجيل",
      analyzing: "جاري التحليل...",
      tryAgain: "حاول مرة أخرى",
      nextExample: "المثال التالي",
      currentExample: "المثال الحالي",
      yourRecording: "تسجيلك",
      analysis: "التحليل",
      accuracy: "الدقة",
      pronunciation: "النطق", 
      fluency: "الطلاقة",
      clarity: "الوضوح",
      feedback: "التعليقات",
      score: "النقاط",
      streak: "السلسلة",
      timeLeft: "الوقت المتبقي",
      wordsCompleted: "الكلمات المكتملة",
      startChallenge: "ابدأ التحدي",
      endChallenge: "إنهاء التحدي",
      excellent: "ممتاز!",
      good: "جيد!",
      needsWork: "يحتاج تحسين",
      keepPracticing: "استمر في التدريب",
      recordingTime: "وقت التسجيل"
    },
    en: {
      title: "Enhanced Speech & Pronunciation Coach",
      subtitle: "Master English pronunciation and speaking skills with advanced interactive training",
      difficultyLabel: "Difficulty",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard", 
      modeLabel: "Training Mode",
      pronunciationMode: "Pronunciation Training",
      fluencyMode: "Fluency Training",
      roleplayMode: "Role Play",
      challengeMode: "60-Second Challenge",
      voiceLabel: "Voice",
      listenExample: "Listen to Example",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording", 
      analyzing: "Analyzing...",
      tryAgain: "Try Again",
      nextExample: "Next Example",
      currentExample: "Current Example",
      yourRecording: "Your Recording",
      analysis: "Analysis",
      accuracy: "Accuracy",
      pronunciation: "Pronunciation",
      fluency: "Fluency", 
      clarity: "Clarity",
      feedback: "Feedback",
      score: "Score",
      streak: "Streak",
      timeLeft: "Time Left",
      wordsCompleted: "Words Completed",
      startChallenge: "Start Challenge",
      endChallenge: "End Challenge",
      excellent: "Excellent!",
      good: "Good!",
      needsWork: "Needs Work",
      keepPracticing: "Keep Practicing",
      recordingTime: "Recording Time"
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  const voices = [
    { value: 'Sarah', label: 'Sarah (Clear American)' },
    { value: 'Aria', label: 'Aria (Natural)' },
    { value: 'Roger', label: 'Roger (British)' },
    { value: 'Laura', label: 'Laura (Professional)' },
    { value: 'Charlie', label: 'Charlie (Friendly)' }
  ];

  const getNextExample = () => {
    const examples = getExamplesForMode(mode, difficulty);
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setCurrentExample(randomExample);
    setAnalysis(null);
  };

  const playExampleAudio = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-text-to-speech', {
        body: { 
          text: currentExample.text,
          voice: voice,
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: language === 'ar' ? "خطأ في تشغيل الصوت" : "Audio playback error",
        description: language === 'ar' ? "حدث خطأ أثناء تشغيل الصوت" : "An error occurred while playing audio",
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeRecording(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: language === 'ar' ? "خطأ في التسجيل" : "Recording error",
        description: language === 'ar' ? "تأكد من السماح بالوصول للميكروفون" : "Please allow microphone access",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const { data, error } = await supabase.functions.invoke('enhanced-speech-analysis', {
        body: {
          audioData: base64Audio,
          targetText: currentExample.text,
          language: 'en',
          analysisType: mode
        }
      });

      if (error) throw error;

      setAnalysis(data);
      
      // Update score and streak
      if (data.accuracy >= 80) {
        setStreak(prev => prev + 1);
        setScore(prev => prev + Math.round(data.accuracy / 10));
        
        if (challengeMode) {
          setChallengeScore(prev => prev + Math.round(data.accuracy / 10));
          setChallengeWords(prev => prev + 1);
        }
      } else {
        setStreak(0);
      }
      
      toast({
        title: data.accuracy >= 80 ? currentLang.excellent : data.accuracy >= 60 ? currentLang.good : currentLang.needsWork,
        description: `${currentLang.accuracy}: ${data.accuracy}%`,
      });
      
    } catch (error) {
      console.error('Error analyzing recording:', error);
      toast({
        title: language === 'ar' ? "خطأ في التحليل" : "Analysis error",
        description: language === 'ar' ? "حدث خطأ أثناء تحليل التسجيل" : "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startChallenge = () => {
    setChallengeMode(true);
    setChallengeTimeLeft(60);
    setChallengeScore(0);
    setChallengeWords(0);
    getNextExample();
    
    challengeTimerRef.current = setInterval(() => {
      setChallengeTimeLeft(prev => {
        if (prev <= 1) {
          endChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endChallenge = () => {
    setChallengeMode(false);
    if (challengeTimerRef.current) {
      clearInterval(challengeTimerRef.current);
      challengeTimerRef.current = null;
    }
    
    toast({
      title: language === 'ar' ? "انتهى التحدي!" : "Challenge Complete!",
      description: language === 'ar' 
        ? `النقاط: ${challengeScore}, الكلمات: ${challengeWords}`
        : `Score: ${challengeScore}, Words: ${challengeWords}`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-6 ${textAlign}`} dir={dir}>
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-indigo-300 mb-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Headphones className="w-8 h-8" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70 text-lg max-w-3xl mx-auto">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.difficultyLabel}</label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    <SelectItem value="easy" className="text-white hover:bg-indigo-800">{currentLang.easy}</SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-indigo-800">{currentLang.medium}</SelectItem>
                    <SelectItem value="hard" className="text-white hover:bg-indigo-800">{currentLang.hard}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.modeLabel}</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    <SelectItem value="pronunciation" className="text-white hover:bg-indigo-800">{currentLang.pronunciationMode}</SelectItem>
                    <SelectItem value="fluency" className="text-white hover:bg-indigo-800">{currentLang.fluencyMode}</SelectItem>
                    <SelectItem value="roleplay" className="text-white hover:bg-indigo-800">{currentLang.roleplayMode}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">{currentLang.voiceLabel}</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="bg-white/10 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    {voices.map((v) => (
                      <SelectItem key={v.value} value={v.value} className="text-white hover:bg-indigo-800">
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                {!challengeMode ? (
                  <Button
                    onClick={startChallenge}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {currentLang.challengeMode}
                  </Button>
                ) : (
                  <Button
                    onClick={endChallenge}
                    variant="destructive"
                    className="w-full"
                  >
                    {currentLang.endChallenge}
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-300">{score}</div>
                <div className="text-sm text-white/60">{currentLang.score}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{streak}</div>
                <div className="text-sm text-white/60">{currentLang.streak}</div>
              </div>
              {challengeMode && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{challengeTimeLeft}s</div>
                    <div className="text-sm text-white/60">{currentLang.timeLeft}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{challengeWords}</div>
                    <div className="text-sm text-white/60">{currentLang.wordsCompleted}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Training Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {currentLang.currentExample}
              </div>
              <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                {currentLang[difficulty]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-white/10 rounded-lg border border-white/20">
              <p className="text-2xl font-medium text-white leading-relaxed text-center">
                {currentExample.text}
              </p>
              {currentExample.phonetic && (
                <p className="text-indigo-300 text-center mt-2 font-mono">
                  {currentExample.phonetic}
                </p>
              )}
              {currentExample.translation && language === 'ar' && (
                <p className="text-white/60 text-center mt-2 text-sm">
                  {currentExample.translation}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={playExampleAudio}
                disabled={isPlaying}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-2" />
                )}
                {currentLang.listenExample}
              </Button>
              
              <Button
                onClick={getNextExample}
                variant="outline"
                className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recording Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-indigo-300 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              {currentLang.yourRecording}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recording Button */}
            <div className="text-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-32 h-32 rounded-full text-white transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              <p className="mt-4 text-white/70">
                {isRecording ? currentLang.stopRecording : currentLang.startRecording}
              </p>
              
              {isRecording && (
                <p className="text-red-400 font-mono">
                  {currentLang.recordingTime}: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>

            {/* Analysis Loading */}
            {isAnalyzing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-2"></div>
                <p className="text-white/70">{currentLang.analyzing}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-indigo-300 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {currentLang.analysis}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="scores" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="scores" className="text-white data-[state=active]:bg-indigo-600">
                      Scores
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="text-white data-[state=active]:bg-indigo-600">
                      {currentLang.feedback}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="scores" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(analysis.accuracy)}`}>
                          {analysis.accuracy}%
                        </div>
                        <div className="text-sm text-white/60 mb-2">{currentLang.accuracy}</div>
                        <Progress value={analysis.accuracy} className="h-2" />
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(analysis.pronunciationScore)}`}>
                          {analysis.pronunciationScore}%
                        </div>
                        <div className="text-sm text-white/60 mb-2">{currentLang.pronunciation}</div>
                        <Progress value={analysis.pronunciationScore} className="h-2" />
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(analysis.fluencyScore || 0)}`}>
                          {analysis.fluencyScore || 0}%
                        </div>
                        <div className="text-sm text-white/60 mb-2">{currentLang.fluency}</div>
                        <Progress value={analysis.fluencyScore || 0} className="h-2" />
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(analysis.clarityScore || 0)}`}>
                          {analysis.clarityScore || 0}%
                        </div>
                        <div className="text-sm text-white/60 mb-2">{currentLang.clarity}</div>
                        <Progress value={analysis.clarityScore || 0} className="h-2" />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="feedback" className="mt-6">
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                      <p className="text-white/90 leading-relaxed">
                        {analysis.feedback}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setAnalysis(null)}
                    variant="outline"
                    className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {currentLang.tryAgain}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      getNextExample();
                      setAnalysis(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    {currentLang.nextExample}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSpeechAssistant;
