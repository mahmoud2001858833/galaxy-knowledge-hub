import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TawjihiFile {
  id: string;
  file_name: string;
  description: string;
  file_url: string;
  created_at: string;
}

interface TawjihiFilesGridProps {
  subject: string;
  category: string;
  grade: string;
}

const TawjihiFilesGrid: React.FC<TawjihiFilesGridProps> = ({ subject, category, grade }) => {
  const [files, setFiles] = useState<TawjihiFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [subject, category, grade]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('tawjihi_files')
        .select('*')
        .eq('subject', subject)
        .eq('category', category)
        .eq('grade', grade)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الملفات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'تم التحميل',
      description: 'جاري تحميل الملف...'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-white/40" />
          <p className="text-white/60 text-lg">لا توجد ملفات حالياً</p>
          <p className="text-white/40 text-sm mt-2">كن أول من يرفع ملفاً في هذا القسم</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <FileText className="h-10 w-10 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-2 truncate">
                    {file.file_name}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2 mb-4">
                    {file.description}
                  </p>
                  <Button
                    onClick={() => handleDownload(file.file_url, file.file_name)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تحميل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TawjihiFilesGrid;
