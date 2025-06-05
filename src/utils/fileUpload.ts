
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

// رفع ملف واحد كامل بدون تجزئة (محسن للملفات الكبيرة حتى 5 جيجابايت)
export const uploadLargeFileComplete = async (
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
) => {
  try {
    // التأكد من وجود bucket
    await ensureStorageBucket();
    
    console.log(`بدء رفع ملف كامل: ${file.name} (${formatFileSize(file.size)})`);
    
    // رفع الملف كاملاً دون تجزئة مع تحسينات للملفات الكبيرة
    const { data, error } = await supabase.storage
      .from('scientific_journals')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false, // عدم الكتابة فوق الملفات الموجودة
        duplex: 'half' // تحسين للملفات الكبيرة
      });
    
    if (error) {
      console.error('خطأ في رفع الملف:', error);
      throw error;
    }
    
    // تحديث شريط التقدم
    onProgress?.(100);
    console.log('تم رفع الملف بنجاح:', data);
    return data;
    
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    throw error;
  }
};

// دالة لإنشاء رابط عام محسن مع التحقق من الصحة
export const getSecurePublicUrl = (path: string) => {
  try {
    const { data } = supabase.storage
      .from('scientific_journals')
      .getPublicUrl(path);
    
    // التحقق من صحة الرابط
    if (!data.publicUrl) {
      throw new Error('فشل في إنشاء الرابط العام');
    }
    
    console.log('تم إنشاء رابط عام:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('خطأ في إنشاء الرابط:', error);
    return null;
  }
};

// دالة محسنة لحذف الملفات من التخزين نهائياً
export const deleteFileFromStorage = async (filePath: string) => {
  try {
    console.log('بدء حذف الملف من التخزين:', filePath);
    
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
    throw error; // رفع الخطأ ليتم التعامل معه في المكون
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

// دالة للتحقق من حجم الملف قبل الرفع
export const validateFileSize = (file: File, maxSizeGB: number = 5) => {
  const maxBytes = maxSizeGB * 1024 * 1024 * 1024; // تحويل إلى بايت
  
  if (file.size > maxBytes) {
    throw new Error(`حجم الملف كبير جداً. الحد الأقصى المسموح: ${maxSizeGB} جيجابايت`);
  }
  
  return true;
};
