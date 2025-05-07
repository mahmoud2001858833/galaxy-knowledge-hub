
import { supabase } from '@/integrations/supabase/client';

/**
 * سرفس للتعامل مع تخزين الصور في Supabase
 */
export const supabaseStorageService = {
  /**
   * التحقق من وجود مجلد تخزين وإنشاءه إذا لم يكن موجوداً
   */
  async checkAndCreateBucket(bucketName: string): Promise<boolean> {
    try {
      console.log(`التحقق من وجود مجلد التخزين ${bucketName}`);
      
      // التحقق أولاً من وجود مجلد التخزين
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("خطأ في استعلام مجلدات التخزين:", listError);
        throw new Error(`فشل في استعلام مجلدات التخزين: ${listError.message}`);
      }
      
      // البحث عن وجود bucket بالاسم المحدد
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`إنشاء مجلد تخزين جديد: ${bucketName}`);
        
        // محاولة إنشاء مجلد التخزين
        const { data: bucketData, error: createBucketError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createBucketError) {
          console.error("خطأ في إنشاء مجلد التخزين:", createBucketError);
          throw new Error(`فشل في إنشاء مجلد التخزين: ${createBucketError.message}`);
        }
        
        console.log(`تم إنشاء مجلد التخزين ${bucketName} بنجاح`, bucketData);
        return true;
      } else {
        console.log(`مجلد التخزين ${bucketName} موجود بالفعل`);
        return true;
      }
    } catch (error: any) {
      console.error("خطأ في التحقق من مجلد التخزين:", error);
      throw new Error(`فشل في إنشاء مجلد التخزين: ${error.message}`);
    }
  },
  
  /**
   * رفع الصورة إلى التخزين
   */
  async uploadImage(bucketName: string, filePath: string, file: File): Promise<{success: boolean, publicUrl?: string, error?: any}> {
    try {
      // التحقق من وجود bucket
      await this.checkAndCreateBucket(bucketName);
      
      console.log(`جاري رفع الصورة إلى: ${filePath}`);
      
      // محاولة رفع الصورة
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("خطأ في رفع الصورة:", uploadError);
        return { success: false, error: uploadError };
      }

      console.log("تم رفع الصورة بنجاح", uploadData);

      // الحصول على الرابط العام
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("URL العام للصورة:", publicUrlData.publicUrl);
      
      return { success: true, publicUrl: publicUrlData.publicUrl };
    } catch (error: any) {
      console.error('خطأ في رفع الصورة:', error);
      return { success: false, error };
    }
  }
};
