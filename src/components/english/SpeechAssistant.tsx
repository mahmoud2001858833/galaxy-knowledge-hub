
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, Award, Target, Headphones, MessageSquare, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface SpeechAssistantProps {
  language: 'ar' | 'en';
}

const SpeechAssistant: React.FC<SpeechAssistantProps> = ({ language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAccent, setSelectedAccent] = useState('american');
  const [mode, setMode] = useState('pronunciation');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const t = {
    ar: {
      title: "المساعد الذكي للنطق والتحدث",
      subtitle: "طور مهاراتك في النطق والتحدث باللغة الإنجليزية مع مساعد ذكي",
      accent: "اللهجة",
      accents: {
        american: "أمريكي",
        british: "بريطاني"
      },
      modes: {
        pronunciation: "تدريب النطق",
        fluency: "تدريب الطلاقة", 
        roleplay: "تمثيل الأدوار",
        challenge: "تحدي 60 ثانية"
      },
      startRecording: "ابدأ التسجيل",
      stopRecording: "توقف عن التسجيل",
      playExample: "استمع للمثال",
      tryAgain: "حاول مرة أخرى",
      accuracy: "دقة النطق",
      score: "النقاط",
      streak: "السلسلة",
      excellent: "ممتاز!",
      good: "جيد!",
      needsWork: "يحتاج تحسين",
      feedback: "التقييم",
      nextExercise: "التمرين التالي",
      practiceWords: "كلمات للتدريب",
      sentences: "جمل للتدريب",
      conversations: "محادثات"
    },
    en: {
      title: "Speech & Pronunciation AI Assistant",
      subtitle: "Improve your English pronunciation and speaking skills with intelligent assistance",
      accent: "Accent",
      accents: {
        american: "American",
        british: "British"
      },
      modes: {
        pronunciation: "Pronunciation Training",
        fluency: "Fluency Coach",
        roleplay: "Role Play",
        challenge: "60-Second Challenge"
      },
      startRecording: "Start Recording",
      stopRecording: "Stop Recording", 
      playExample: "Play Example",
      tryAgain: "Try Again",
      accuracy: "Pronunciation Accuracy",
      score: "Score",
      streak: "Streak",
      excellent: "Excellent!",
      good: "Good!",
      needsWork: "Needs Work",
      feedback: "Feedback",
      nextExercise: "Next Exercise",
      practiceWords: "Practice Words",
      sentences: "Practice Sentences",
      conversations: "Conversations"
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  const exercises = {
    pronunciation: [
      { text: "Think", phonetic: "/θɪŋk/", difficulty: "easy" },
      { text: "Through", phonetic: "/θruː/", difficulty: "medium" },
      { text: "Thoroughly", phonetic: "/ˈθʌrəli/", difficulty: "hard" },
      { text: "Restaurant", phonetic: "/ˈrestərɑːnt/", difficulty: "medium" },
      { text: "Comfortable", phonetic: "/ˈkʌmftəbəl/", difficulty: "hard" }
    ],
    fluency: [
      "How are you doing today?",
      "I would like to make a reservation for dinner.",
      "Could you please explain the difference between these two options?",
      "I'm really excited about the new project we're starting next week."
    ],
    roleplay: [
      { scenario: "Restaurant Order", prompt: "You're ordering food at a restaurant" },
      { scenario: "Job Interview", prompt: "You're in a job interview" },
      { scenario: "Airport Check-in", prompt: "You're checking in at the airport" },
      { scenario: "Doctor's Appointment", prompt: "You're describing symptoms to a doctor" }
    ]
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        // Here you would send the audio data to your speech recognition service
        analyzeSpeech(event.data);
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: language === 'ar' ? "بدأ التسجيل" : "Recording Started",
        description: language === 'ar' ? "اقرأ النص بوضوح" : "Speak clearly into your microphone",
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "لا يمكن الوصول للميكروفون" : "Cannot access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const analyzeSpeech = async (audioData: Blob) => {
    // Simulate speech analysis - in real implementation, this would call your AI service
    const randomAccuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
    setAccuracy(randomAccuracy);
    
    if (randomAccuracy >= 90) {
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
      toast({
        title: currentLang.excellent,
        description: `${randomAccuracy}% ${currentLang.accuracy}`,
      });
    } else if (randomAccuracy >= 80) {
      setScore(prev => prev + 75);
      toast({
        title: currentLang.good,
        description: `${randomAccuracy}% ${currentLang.accuracy}`,
      });
    } else {
      setStreak(0);
      toast({
        title: currentLang.needsWork,
        description: `${randomAccuracy}% ${currentLang.accuracy}`,
        variant: "destructive"
      });
    }
  };

  const playExample = () => {
    // In real implementation, this would play the pronunciation example
    toast({
      title: language === 'ar' ? "تشغيل المثال" : "Playing Example",
      description: language === 'ar' ? "استمع بعناية" : "Listen carefully",
    });
  };

  const nextExercise = () => {
    if (mode === 'pronunciation') {
      setCurrentExercise(prev => (prev + 1) % exercises.pronunciation.length);
    } else if (mode === 'fluency') {
      setCurrentExercise(prev => (prev + 1) % exercises.fluency.length);
    } else if (mode === 'roleplay') {
      setCurrentExercise(prev => (prev + 1) % exercises.roleplay.length);
    }
    setAccuracy(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const renderExerciseContent = () => {
    switch (mode) {
      case 'pronunciation':
        const currentWord = exercises.pronunciation[currentExercise];
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-white">{currentWord.text}</h3>
              <p className="text-xl text-indigo-300">{currentWord.phonetic}</p>
              <Badge className={getDifficultyColor(currentWord.difficulty)}>
                {currentWord.difficulty}
              </Badge>
            </div>
          </div>
        );

      case 'fluency':
        return (
          <div className="text-center space-y-6">
            <div className="p-6 bg-white/10 rounded-lg border border-white/20">
              <p className="text-xl text-white leading-relaxed">
                {exercises.fluency[currentExercise]}
              </p>
            </div>
            <p className="text-indigo-300">
              {language === 'ar' ? 'اقرأ الجملة بطلاقة وثقة' : 'Read the sentence fluently and confidently'}
            </p>
          </div>
        );

      case 'roleplay':
        const currentRole = exercises.roleplay[currentExercise];
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-indigo-300">{currentRole.scenario}</h3>
              <div className="p-6 bg-white/10 rounded-lg border border-white/20">
                <p className="text-lg text-white">{currentRole.prompt}</p>
              </div>
            </div>
            <p className="text-white/70">
              {language === 'ar' ? 'تحدث لمدة 30-60 ثانية في هذا السيناريو' : 'Speak for 30-60 seconds in this scenario'}
            </p>
          </div>
        );

      default:
        return null;
    }
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
        <p className="text-white/70 text-lg">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{score}</p>
            <p className="text-white/60 text-sm">{currentLang.score}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{accuracy}%</p>
            <p className="text-white/60 text-sm">{currentLang.accuracy}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{streak}</p>
            <p className="text-white/60 text-sm">{currentLang.streak}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Select value={selectedAccent} onValueChange={setSelectedAccent}>
            <SelectTrigger className="w-48 bg-white/10 border-indigo-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-indigo-950 border-indigo-500/30">
              <SelectItem value="american" className="text-white hover:bg-indigo-800">
                {currentLang.accents.american}
              </SelectItem>
              <SelectItem value="british" className="text-white hover:bg-indigo-800">
                {currentLang.accents.british}
              </SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={mode} onValueChange={setMode} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="pronunciation" className="text-white data-[state=active]:bg-indigo-600 text-xs">
                {currentLang.modes.pronunciation}
              </TabsTrigger>
              <TabsTrigger value="fluency" className="text-white data-[state=active]:bg-indigo-600 text-xs">
                {currentLang.modes.fluency}
              </TabsTrigger>
              <TabsTrigger value="roleplay" className="text-white data-[state=active]:bg-indigo-600 text-xs">
                {currentLang.modes.roleplay}
              </TabsTrigger>
              <TabsTrigger value="challenge" className="text-white data-[state=active]:bg-indigo-600 text-xs">
                {currentLang.modes.challenge}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Exercise Content */}
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-8">
            {renderExerciseContent()}
          </CardContent>
        </Card>

        {/* Recording Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={playExample}
            variant="outline"
            className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            {currentLang.playExample}
          </Button>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-8`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                {currentLang.stopRecording}
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                {currentLang.startRecording}
              </>
            )}
          </Button>

          <Button
            onClick={nextExercise}
            variant="outline"
            className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {currentLang.nextExercise}
          </Button>
        </div>

        {/* Accuracy Display */}
        {accuracy > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-indigo-300 text-center">{currentLang.feedback}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{accuracy}%</p>
                    <Progress value={accuracy} className="mt-2" />
                  </div>
                  <div className="text-center">
                    {accuracy >= 90 && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        {currentLang.excellent}
                      </Badge>
                    )}
                    {accuracy >= 80 && accuracy < 90 && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        {currentLang.good}
                      </Badge>
                    )}
                    {accuracy < 80 && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                        {currentLang.needsWork}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SpeechAssistant;
