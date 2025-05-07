
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { supabaseStorageService } from '@/services/supabaseStorage';
import { SubjectType } from '@/components/shared/types/educationalContentTypes';

export interface ImageUploadFormData {
  title: string;
  description?: string;
  subject: SubjectType;
  image: File;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (data: ImageUploadFormData): Promise<boolean> => {
    setIsUploading(true);
    console.log("بدء تحميل الصورة:", data);
    
    try {
      // الحصول على بيانات المستخدم الحالي
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`فشل في الحصول على بيانات المستخدم: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً لرفع الصور");
      }

      try {
        // التحقق من وجود bucket أو إنشاء bucket جديد باستخدام SQL
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'educational_images');
        
        if (!bucketExists) {
          const { data: bucket, error: createBucketError } = await supabase.storage.createBucket('educational_images', {
            public: true,
            fileSizeLimit: 10485760  // 10MB
          });
          
          if (createBucketError) {
            console.error("خطأ في إنشاء مجلد التخزين:", createBucketError);
            throw new Error("تعذر إنشاء مجلد التخزين. يرجى المحاولة مرة أخرى لاحقًا.");
          }
          
          console.log("تم إنشاء مجلد التخزين بنجاح:", bucket);
        }

        // رفع الصورة إلى التخزين
        const fileExt = data.image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${data.subject}/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('educational_images')
          .upload(filePath, data.image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        console.log("تم رفع الصورة بنجاح:", uploadData);

        // الحصول على الرابط العام
        const { data: publicUrlData } = supabase.storage
          .from('educational_images')
          .getPublicUrl(filePath);

        // تخزين البيانات الوصفية في قاعدة البيانات
        const { error: dbError } = await supabase
          .from('educational_images')
          .insert({
            title: data.title,
            description: data.description || null,
            subject: data.subject,
            image_url: publicUrlData.publicUrl,
            created_by: user.id,
          });

        if (dbError) {
          console.error("خطأ في حفظ بيانات الصورة:", dbError);
          throw new Error(`فشل في حفظ بيانات الصورة: ${dbError.message}`);
        }

        console.log("تم حفظ بيانات الصورة بنجاح");

        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تمت إضافة الصورة إلى المكتبة المرئية",
        });

        return true;
      } catch (storageError: any) {
        console.error('خطأ في رفع الصورة:', storageError);
        throw new Error(storageError.message || "فشل في رفع الصورة، يرجى المحاولة مرة أخرى لاحقًا");
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في تحميل الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading
  };
};
