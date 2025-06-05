
import { supabase } from '@/integrations/supabase/client';

export const ensureStorageBucket = async () => {
  try {
    // التحقق من وجود bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'scientific_journals');
    
    if (!bucketExists) {
      // إنشاء bucket جديد
      const { error } = await supabase.storage.createBucket('scientific_journals', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/*'],
        fileSizeLimit: 5368709120, // 5GB
      });
      
      if (error) {
        console.error('خطأ في إنشاء bucket:', error);
        throw error;
      }
      
      console.log('تم إنشاء bucket بنجاح');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في التحقق من bucket:', error);
    return false;
  }
};

// رفع ملف مع معالجة محسنة للملفات الكبيرة
export const uploadFileWithProgress = async (
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
) => {
  try {
    // التأكد من وجود bucket
    await ensureStorageBucket();
    
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    
    if (file.size <= CHUNK_SIZE) {
      // رفع مباشر للملفات الصغيرة
      const { data, error } = await supabase.storage
        .from('scientific_journals')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      onProgress?.(100);
      return data;
    }
    
    // رفع متجزء للملفات الكبيرة
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedBytes = 0;
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      const chunkPath = i === 0 ? path : `${path}.part${i}`;
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { error } = await supabase.storage
            .from('scientific_journals')
            .upload(chunkPath, chunk, {
              cacheControl: '3600',
              upsert: i > 0
            });
          
          if (error) throw error;
          break;
          
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) throw error;
          
          // انتظار قبل المحاولة مرة أخرى
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      uploadedBytes += chunk.size;
      const progress = Math.round((uploadedBytes / file.size) * 100);
      onProgress?.(progress);
      
      // توقف قصير بين الأجزاء
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return { path };
    
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    throw error;
  }
};

// دالة لإنشاء رابط عام محسن
export const getSecurePublicUrl = (path: string) => {
  try {
    const { data } = supabase.storage
      .from('scientific_journals')
      .getPublicUrl(path);
    
    return data.publicUrl;
  } catch (error) {
    console.error('خطأ في إنشاء الرابط:', error);
    return null;
  }
};
