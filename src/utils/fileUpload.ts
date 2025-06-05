
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
        fileSizeLimit: 10737418240, // 10GB
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

// رفع ملف واحد كامل بدون تجزئة (محسن للملفات الكبيرة)
export const uploadLargeFileComplete = async (
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
) => {
  try {
    // التأكد من وجود bucket
    await ensureStorageBucket();
    
    console.log(`بدء رفع ملف كامل: ${file.name} (${formatFileSize(file.size)})`);
    
    // رفع الملف كاملاً دون تجزئة
    const { data, error } = await supabase.storage
      .from('scientific_journals')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false // عدم الكتابة فوق الملفات الموجودة
      });
    
    if (error) {
      console.error('خطأ في رفع الملف:', error);
      throw error;
    }
    
    onProgress?.(100);
    console.log('تم رفع الملف بنجاح:', data);
    return data;
    
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

// دالة لحذف الملفات من التخزين نهائياً
export const deleteFileFromStorage = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('scientific_journals')
      .remove([filePath]);
    
    if (error) {
      console.error('خطأ في حذف الملف من التخزين:', error);
      throw error;
    }
    
    console.log('تم حذف الملف من التخزين بنجاح:', filePath);
    return true;
  } catch (error) {
    console.error('خطأ في حذف الملف من التخزين:', error);
    return false;
  }
};

// دالة لتنسيق حجم الملف
export const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجابايت`;
  } else if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
  } else {
    return `${(bytes / 1024).toFixed(2)} كيلوبايت`;
  }
};
