
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ في تحميل الصورة",
          description: "يجب تسجيل الدخول أولاً لرفع الصور",
          variant: "destructive",
        });
        return false;
      }

      // رفع الصورة إلى التخزين
      const fileExt = data.image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${data.subject}/${fileName}`;

      const { success, publicUrl, error: uploadError } = await supabaseStorageService.uploadImage(
        'educational_images',
        filePath,
        data.image
      );

      if (!success || !publicUrl) {
        throw uploadError || new Error("فشل تحميل الصورة");
      }

      // تخزين البيانات الوصفية في قاعدة البيانات
      const { error: dbError } = await supabase
        .from('educational_images')
        .insert({
          title: data.title,
          description: data.description || null,
          subject: data.subject,
          image_url: publicUrl,
          created_by: user.id,
        });

      if (dbError) {
        console.error("خطأ في حفظ بيانات الصورة:", dbError);
        throw dbError;
      }

      console.log("تم حفظ بيانات الصورة بنجاح");

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تمت إضافة الصورة إلى المكتبة المرئية",
      });

      return true;
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
