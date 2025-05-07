
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ImageUploadForm, { ImageUploadFormValues } from '@/components/visualLibrary/ImageUploadForm';

const UploadImagePage = () => {
  const { uploadImage, isUploading } = useImageUpload();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: ImageUploadFormValues) => {
    try {
      const success = await uploadImage({
        title: data.title,
        description: data.description || "",
        subject: data.subject,
        image: data.image
      });
      
      if (success) {
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تمت إضافة الصورة إلى المكتبة المرئية",
        });
        navigate('/visual-library');
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

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950 w-full" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 w-full px-0 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4 sm:px-6"
        >
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              className="flex items-center"
              onClick={() => navigate('/visual-library')}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى المكتبة المرئية
            </Button>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500">
              رفع صورة تعليمية جديدة
            </h1>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <ImageUploadForm onSubmit={handleSubmit} isUploading={isUploading} />
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UploadImagePage;
