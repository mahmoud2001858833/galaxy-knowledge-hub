import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FileText, Trash2, Download, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TawjihiFile {
  id: string;
  file_name: string;
  description: string;
  file_url: string;
  subject: string;
  category: string;
  grade: string;
  created_at: string;
  user_id: string | null;
}

export const TawjihiFilesSection = () => {
  const [files, setFiles] = useState<TawjihiFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tawjihi_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('فشل في تحميل الملفات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${fileName}"؟`)) {
      return;
    }

    try {
      setDeletingId(fileId);
      const { error } = await supabase
        .from('tawjihi_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('تم حذف الملف بنجاح');
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('فشل في حذف الملف');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSubjectLabel = (subject: string) => {
    const labels: { [key: string]: string } = {
      'arabic': 'اللغة العربية',
      'english': 'اللغة الإنجليزية',
      'history': 'التاريخ',
      'religion': 'التربية الإسلامية'
    };
    return labels[subject] || subject;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'question-bank': 'بنك أسئلة',
      'review': 'مراجعة',
      'handouts': 'دوسيات',
      'exams': 'امتحانات'
    };
    return labels[category] || category;
  };

  const getGradeLabel = (grade: string) => {
    return grade === 'first' ? 'الصف الأول ثانوي' : 'الصف الثاني ثانوي';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <FileText className="h-6 w-6" />
          ملفات التوجيهي ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedScrollArea className="h-[600px]">
          {files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد ملفات محملة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50 hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {file.file_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {file.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {getSubjectLabel(file.subject)}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                              {getCategoryLabel(file.category)}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                              {getGradeLabel(file.grade)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(new Date(file.created_at), 'dd MMMM yyyy', { locale: ar })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file.file_url, file.file_name)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            تحميل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(file.id, file.file_name)}
                            disabled={deletingId === file.id}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </EnhancedScrollArea>
      </CardContent>
    </Card>
  );
};
