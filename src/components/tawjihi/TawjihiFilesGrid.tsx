import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TawjihiFile {
  id: string;
  file_name: string;
  description: string;
  file_url: string;
  teacher_name: string | null;
  created_at: string;
}

interface TawjihiFilesGridProps {
  subject: string;
  category: string;
  grade: string;
}

const TawjihiFilesGrid: React.FC<TawjihiFilesGridProps> = ({ subject, category, grade }) => {
  const [files, setFiles] = useState<TawjihiFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<TawjihiFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const { toast } = useToast();

  // Get unique teachers for filter
  const uniqueTeachers = Array.from(new Set(files.map(f => f.teacher_name).filter(Boolean))) as string[];

  useEffect(() => {
    fetchFiles();
  }, [subject, category, grade]);

  useEffect(() => {
    applyFilters();
  }, [files, searchTerm, filterTeacher, filterDate]);

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
      setFilteredFiles(data || []);
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

  const applyFilters = () => {
    let filtered = [...files];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.teacher_name && file.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Teacher filter
    if (filterTeacher !== 'all') {
      filtered = filtered.filter(file => file.teacher_name === filterTeacher);
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.created_at);
        const daysDiff = Math.floor((now.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterDate) {
          case 'today':
            return daysDiff === 0;
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredFiles(filtered);
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
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold">البحث والتصفية</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="text"
                placeholder="ابحث عن اسم الملف، الوصف، أو الأستاذ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Teacher Filter */}
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر الأستاذ/ة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأساتذة</SelectItem>
                {uniqueTeachers.map((teacher) => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="اختر التاريخ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأوقات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-white/60 text-sm">
            عرض {filteredFiles.length} من {files.length} ملف
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <p className="text-white/60 text-lg">لا توجد ملفات تطابق البحث</p>
            <p className="text-white/40 text-sm mt-2">جرب تغيير معايير البحث أو التصفية</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file, index) => (
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
                  <p className="text-white/60 text-sm line-clamp-2 mb-2">
                    {file.description}
                  </p>
                  {file.teacher_name && (
                    <p className="text-blue-300 text-xs mb-3 flex items-center gap-1">
                      <span className="font-semibold">الأستاذ/ة:</span>
                      <span>{file.teacher_name}</span>
                    </p>
                  )}
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
      )}
    </div>
  );
};

export default TawjihiFilesGrid;
