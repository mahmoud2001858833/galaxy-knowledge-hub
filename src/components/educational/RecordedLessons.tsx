import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Video, ArrowLeft, Loader2, BookOpen, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade_level: string | null;
  description: string | null;
  video_url: string;
  video_duration: number | null;
  created_at: string;
  teacher_id: string;
}

const RecordedLessons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    gradeLevel: '',
    description: '',
    video: null as File | null
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('recorded_lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الدروس',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max 100GB = 107374182400 bytes
      if (file.size > 107374182400) {
        toast({
          title: 'خطأ',
          description: 'حجم الفيديو يجب أن يكون أقل من 100 جيجابايت',
          variant: 'destructive'
        });
        return;
      }
      setFormData({ ...formData, video: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'يجب تسجيل الدخول',
        description: 'يرجى تسجيل الدخول لرفع درسك',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (!formData.title || !formData.subject || !formData.video) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = formData.video.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // Upload video (note: progress tracking not available in Supabase storage API)
      const { error: uploadError } = await supabase.storage
        .from('lesson-videos')
        .upload(filePath, formData.video);
      
      setUploadProgress(50); // Set progress after upload starts

      if (uploadError) throw uploadError;

      setUploadProgress(90); // Set progress before metadata extraction

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-videos')
        .getPublicUrl(filePath);

      // Create video element to get duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(formData.video);
      
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const duration = Math.round(video.duration);

      // Check if duration exceeds 1 hour (3600 seconds)
      if (duration > 3600) {
        // Delete the uploaded video
        await supabase.storage
          .from('lesson-videos')
          .remove([filePath]);

        toast({
          title: 'خطأ',
          description: 'مدة الفيديو يجب أن تكون أقل من ساعة واحدة',
          variant: 'destructive'
        });
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('recorded_lessons')
        .insert({
          teacher_id: session.user.id,
          title: formData.title,
          subject: formData.subject,
          grade_level: formData.gradeLevel || null,
          description: formData.description || null,
          video_url: publicUrl,
          video_duration: duration
        });

      if (insertError) throw insertError;

      toast({
        title: 'تم بنجاح!',
        description: 'تم رفع الدرس بنجاح'
      });

      setFormData({
        title: '',
        subject: '',
        gradeLevel: '',
        description: '',
        video: null
      });
      setShowForm(false);
      setUploadProgress(0);
      fetchLessons();
    } catch (error) {
      console.error('Error uploading lesson:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في رفع الدرس',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 p-6" dir={dir}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Upload className="w-4 h-4" />
            {showForm ? 'إلغاء' : 'رفع درس جديد'}
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-indigo-400 mb-4">
            الدروس المسجلة
          </h1>
          <p className="text-white/70 text-lg">
            شارك دروسك التعليمية وتعلّم من المعلمين الآخرين
          </p>
        </motion.div>

        {/* Upload Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  رفع درس جديد
                </CardTitle>
                <CardDescription className="text-white/70">
                  املأ المعلومات التالية لرفع درسك التعليمي (الحد الأقصى: 100 جيجابايت، مدة ساعة واحدة)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-white flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4" />
                      عنوان الدرس
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="أدخل عنوان الدرس"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject" className="text-white mb-2 block">
                        المادة
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        required
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">الرياضيات</SelectItem>
                          <SelectItem value="physics">الفيزياء</SelectItem>
                          <SelectItem value="chemistry">الكيمياء</SelectItem>
                          <SelectItem value="biology">الأحياء</SelectItem>
                          <SelectItem value="arabic">اللغة العربية</SelectItem>
                          <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="gradeLevel" className="text-white mb-2 block">
                        المستوى الدراسي (اختياري)
                      </Label>
                      <Input
                        id="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        placeholder="مثال: الصف التاسع"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white mb-2 block">
                      وصف الدرس (اختياري)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                      placeholder="اكتب وصفاً تفصيلياً عن محتوى الدرس..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="video" className="text-white flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4" />
                      فيديو الدرس (حد أقصى 100 جيجابايت، مدة ساعة)
                    </Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                      required
                    />
                    {formData.video && (
                      <p className="text-blue-300 text-sm mt-2">
                        تم اختيار: {formData.video.name} ({(formData.video.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  {uploading && uploadProgress > 0 && (
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الرفع... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        رفع الدرس
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lessons Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
          </div>
        ) : lessons.length === 0 ? (
          <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Video className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">لا توجد دروس مسجلة حالياً</p>
              <p className="text-white/50 text-sm mt-2">كن أول من يشارك درساً تعليمياً!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-t-lg flex items-center justify-center">
                    <Video className="w-16 h-16 text-white/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {lesson.video_duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(lesson.video_duration)}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="text-blue-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {lesson.subject} {lesson.grade_level && `- ${lesson.grade_level}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lesson.description && (
                      <p className="text-white/80 text-sm line-clamp-3 mb-4">
                        {lesson.description}
                      </p>
                    )}
                    <Button
                      onClick={() => window.open(lesson.video_url, '_blank')}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      مشاهدة الدرس
                    </Button>
                    <p className="text-white/50 text-xs mt-4">
                      {new Date(lesson.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordedLessons;