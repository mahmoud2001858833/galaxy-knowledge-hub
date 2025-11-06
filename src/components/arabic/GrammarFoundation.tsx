import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Search, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GrammarFile {
  id: string;
  file_name: string;
  description: string;
  file_url: string;
  folder_image_url: string;
  created_at: string;
}

const GrammarFoundation = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState<GrammarFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fileName: '',
    description: '',
    file: null as File | null,
    folderImage: null as File | null
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grammar_foundation_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الملفات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.fileName) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الملف وتحديد الملف',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const fileUrl = await uploadFile(formData.file, 'grammar-files');
      let folderImageUrl = null;
      
      if (formData.folderImage) {
        folderImageUrl = await uploadFile(formData.folderImage, 'grammar-files');
      }

      const { error } = await supabase
        .from('grammar_foundation_files')
        .insert({
          user_id: user.id,
          file_name: formData.fileName,
          description: formData.description,
          file_url: fileUrl,
          folder_image_url: folderImageUrl
        });

      if (error) throw error;

      toast({
        title: 'نجاح',
        description: 'تم رفع الملف بنجاح'
      });

      setFormData({
        fileName: '',
        description: '',
        file: null,
        folderImage: null
      });
      setShowUpload(false);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع الملف',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl p-6 border border-emerald-500/30">
        <h3 className="text-2xl font-bold text-emerald-300 mb-4">أساسيات النحو</h3>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-600/50 transition-colors"
          >
            {showUpload ? <X className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            {showUpload ? 'إلغاء' : 'رفع ملف'}
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الملفات..."
              className="w-full pr-10 pl-4 py-3 bg-white/10 border border-emerald-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {showUpload && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 mb-6 p-6 bg-white/5 rounded-lg border border-emerald-500/20"
          >
            <div>
              <label className="block text-white/80 mb-2">اسم الملف</label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">الملف</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-500/30 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">صورة المجلد (اختياري)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, folderImage: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-500/30 rounded-lg text-white"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full px-6 py-3 bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-600/50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  رفع الملف
                </>
              )}
            </button>
          </motion.form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <motion.a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group p-4 bg-white/5 border border-emerald-500/30 rounded-lg hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                {file.folder_image_url && (
                  <img
                    src={file.folder_image_url}
                    alt={file.file_name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="flex items-start gap-3">
                  <FileText className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white group-hover:text-emerald-300 transition-colors mb-1 truncate">
                      {file.file_name}
                    </h4>
                    {file.description && (
                      <p className="text-sm text-white/60 line-clamp-2">{file.description}</p>
                    )}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {!loading && filteredFiles.length === 0 && (
          <div className="text-center py-12 text-white/60">
            {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد ملفات مرفوعة بعد'}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarFoundation;