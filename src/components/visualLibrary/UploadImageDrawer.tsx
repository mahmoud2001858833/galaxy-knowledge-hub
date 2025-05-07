
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from 'lucide-react';
import { supabaseStorageService } from '@/services/supabaseStorage';
import ImageUploadForm, { ImageUploadFormValues } from './ImageUploadForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useNavigate } from 'react-router-dom';

const UploadImageDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // تأكد من وجود bucket للصور التعليمية عند تحميل المكون
    supabaseStorageService.checkAndCreateBucket('educational_images');
  }, []);

  const handleSubmit = async (data: ImageUploadFormValues) => {
    try {
      // Make sure data matches required type by ensuring all required fields
      const success = await uploadImage({
        title: data.title,
        description: data.description,
        subject: data.subject,
        image: data.image
      });
      
      if (success) {
        setIsOpen(false);
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تمت إضافة الصورة إلى المكتبة المرئية",
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "خطأ في النموذج",
        description: "حدث خطأ أثناء معالجة النموذج",
        variant: "destructive",
      });
    }
  };

  const handleOpenFullPage = () => {
    navigate('/upload-image');
  };

  return (
    <div>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button className="group bg-blue-500 hover:bg-blue-600">
            <Upload className="mr-2 h-4 w-4" />
            رفع صورة تعليمية
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-right">رفع صورة تعليمية جديدة</DrawerTitle>
            <DrawerDescription className="text-right">
              أضف صورة تعليمية إلى المكتبة المرئية لمشاركتها مع الطلاب والمعلمين
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4">
            <ImageUploadForm onSubmit={handleSubmit} isUploading={isUploading} />
          </div>
          
          <DrawerFooter className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={handleOpenFullPage} 
              className="w-full"
            >
              فتح في صفحة مستقلة
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">إلغاء</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default UploadImageDrawer;
