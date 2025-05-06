
import { supabase } from '@/integrations/supabase/client';

/**
 * سرفس للتعامل مع تخزين الصور في Supabase
 */
export const supabaseStorageService = {
  /**
   * التحقق من وجود مجلد تخزين للصور التعليمية
   */
  async checkAndCreateBucket(bucketName: string): Promise<boolean> {
    try {
      console.log(`التحقق من وجود مجلد التخزين ${bucketName}`);
      const { data: buckets } = await supabase.storage.listBuckets();
      
      // البحث عن وجود bucket بالاسم المحدد
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`إنشاء مجلد تخزين جديد: ${bucketName}`);
        
        try {
          const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (createBucketError) {
            console.error("خطأ في إنشاء مجلد التخزين:", createBucketError);
            return false;
          } else {
            console.log(`تم إنشاء مجلد التخزين ${bucketName} بنجاح`);
            return true;
          }
        } catch (error) {
          console.error("خطأ استثنائي في إنشاء مجلد التخزين:", error);
          return false;
        }
      } else {
        console.log(`مجلد التخزين ${bucketName} موجود بالفعل`);
        return true;
      }
    } catch (error) {
      console.error("خطأ في التحقق من مجلد التخزين:", error);
      return false;
    }
  },
  
  /**
   * رفع الصورة إلى التخزين
   */
  async uploadImage(bucketName: string, filePath: string, file: File): Promise<{success: boolean, publicUrl?: string, error?: any}> {
    try {
      // التحقق من وجود bucket
      const bucketReady = await this.checkAndCreateBucket(bucketName);
      
      if (!bucketReady) {
        throw new Error("فشل إنشاء مجلد التخزين");
      }
      
      console.log(`جاري رفع الصورة إلى: ${filePath}`);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        console.error("خطأ في رفع الصورة:", uploadError);
        return { success: false, error: uploadError };
      }

      console.log("تم رفع الصورة بنجاح");

      // الحصول على الرابط العام
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("URL العام للصورة:", publicUrlData.publicUrl);
      
      return { success: true, publicUrl: publicUrlData.publicUrl };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error };
    }
  }
};
