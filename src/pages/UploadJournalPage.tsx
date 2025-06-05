import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Loader2, FileText, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadLargeFileComplete, getSecurePublicUrl, formatFileSize, validateFileSize } from '@/utils/fileUpload';

const formSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون العنوان 3 أحرف على الأقل" }),
  description: z.string().optional(),
  author: z.string().min(3, { message: "يجب أن يكون اسم المؤلف 3 أحرف على الأقل" }),
  subject: z.enum(['physics', 'chemistry', 'biology', 'mathematics']),
  coverImage: z.instanceof(File).refine(
    (file) => file.size < 100 * 1024 * 1024, // 100MB للصور
    { message: "حجم صورة الغلاف يجب أن يكون أقل من 100 ميجابايت" }
  ),
  pdfFile: z.instanceof(File).refine(
    (file) => file.size < 5 * 1024 * 1024 * 1024, // 5GB للملفات PDF
    { message: "حجم ملف PDF يجب أن يكون أقل من 5 جيجابايت" }
  ).refine(
    (file) => file.type === 'application/pdf',
    { message: "يجب أن يكون الملف بصيغة PDF" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const UploadJournalPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
      subject: "physics",
    },
  });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFileSize(file, 0.1); // 100MB للصور
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      form.setValue("coverImage", file);
      toast({
        title: "تم اختيار صورة الغلاف",
        description: `تم اختيار صورة بحجم ${formatFileSize(file.size)}`,
      });
    } catch (error: any) {
      toast({
        title: "حجم الصورة كبير جداً",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      validateFileSize(file, 5); // 5GB للـ PDF
      
      if (file.type !== 'application/pdf') {
        throw new Error("يرجى اختيار ملف PDF فقط");
      }
      
      setSelectedPdfName(file.name);
      form.setValue("pdfFile", file);
      
      toast({
        title: "تم اختيار الملف بنجاح",
        description: `تم اختيار ملف PDF بحجم ${formatFileSize(file.size)} - جاهز للرفع كملف واحد كامل`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ في الملف",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    
    try {
      // الحصول على بيانات المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ في تحميل المجلة",
          description: "يجب تسجيل الدخول أولاً لرفع المجلات",
          variant: "destructive",
        });
        return;
      }

      setCurrentStep("رفع صورة الغلاف...");
      toast({
        title: "بدء عملية الرفع",
        description: "جاري رفع صورة الغلاف...",
      });

      // رفع صورة الغلاف
      const coverExt = data.coverImage.name.split('.').pop();
      const coverFileName = `cover_${uuidv4()}.${coverExt}`;
      const coverFilePath = `${data.subject}/${coverFileName}`;

      await uploadLargeFileComplete(data.coverImage, coverFilePath, (progress) => {
        setUploadProgress(progress * 0.3); // 30% للصورة
      });

      setCurrentStep(`رفع ملف PDF الكامل (${formatFileSize(data.pdfFile.size)})...`);
      toast({
        title: "جاري رفع الملف الرئيسي",
        description: `جاري رفع ملف PDF بحجم ${formatFileSize(data.pdfFile.size)} كملف واحد كامل...`,
      });

      // رفع ملف PDF كاملاً بدون تجزئة
      const pdfFileName = `pdf_${uuidv4()}.pdf`;
      const pdfFilePath = `${data.subject}/${pdfFileName}`;

      await uploadLargeFileComplete(data.pdfFile, pdfFilePath, (progress) => {
        setUploadProgress(30 + (progress * 0.6)); // 60% للـ PDF
      });

      setCurrentStep("حفظ البيانات في قاعدة البيانات...");
      setUploadProgress(95);

      // الحصول على الروابط العامة المحسنة
      const coverPublicUrl = getSecurePublicUrl(coverFilePath);
      const pdfPublicUrl = getSecurePublicUrl(pdfFilePath);

      if (!coverPublicUrl || !pdfPublicUrl) {
        throw new Error('فشل في إنشاء روابط الملفات');
      }

      // تخزين البيانات الوصفية في قاعدة البيانات مع ضمانات إضافية
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { error: dbError } = await supabase
            .from('scientific_journals')
            .insert({
              title: data.title,
              description: data.description || null,
              subject: data.subject,
              author: data.author,
              cover_image_url: coverPublicUrl,
              pdf_url: pdfPublicUrl,
              created_by: user.id,
            });

          if (dbError) throw dbError;
          break; // نجح الإدراج، اخرج من الحلقة
          
        } catch (error: any) {
          retryCount++;
          console.error(`محاولة ${retryCount} فشلت:`, error);
          
          if (retryCount >= maxRetries) {
            throw new Error(`فشل في حفظ البيانات بعد ${maxRetries} محاولات: ${error.message}`);
          }
          
          // انتظار متزايد قبل إعادة المحاولة
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }

      setUploadProgress(100);
      setCurrentStep("تم الرفع بنجاح!");
      setUploadSuccess(true);

      toast({
        title: "تم رفع المجلة بنجاح",
        description: `تمت إضافة المجلة (${formatFileSize(data.pdfFile.size)}) إلى المكتبة العلمية بنجاح كملف واحد كامل`,
      });

      // إعادة تعيين النموذج بعد 2 ثانية
      setTimeout(() => {
        form.reset();
        setCoverPreviewUrl(null);
        setSelectedPdfName(null);
        setUploadSuccess(false);
        navigate('/scientific-journal');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error uploading journal:', error);
      toast({
        title: "خطأ في تحميل المجلة",
        description: `حدث خطأ: ${error.message || "خطأ غير متوقع"}. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentStep("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              className="flex items-center"
              onClick={() => navigate('/scientific-journal')}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى المجلة العلمية
            </Button>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500">
              رفع مجلة علمية جديدة (ملف واحد كامل)
            </h1>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <div className="mb-4 text-center">
              <p className="text-white/80 text-sm">
                الحد الأقصى لحجم ملف PDF: <span className="text-green-400 font-bold">5 جيجابايت</span>
              </p>
              <p className="text-white/60 text-xs mt-1">
                الحد الأقصى لحجم صورة الغلاف: 100 ميجابايت
              </p>
              <p className="text-blue-400 text-xs mt-1">
                ✓ رفع ملف واحد كامل بدون تجزئة مع ضمان الحفظ في قاعدة البيانات
              </p>
            </div>

            {/* شريط التقدم المحسن */}
            {isUploading && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between text-white">
                  <span>{currentStep}</span>
                  <span>{uploadProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-purple-500 h-4 rounded-full flex items-center justify-center"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {uploadProgress > 10 && (
                      <span className="text-white text-xs font-bold">
                        {uploadProgress.toFixed(0)}%
                      </span>
                    )}
                  </motion.div>
                </div>
                <p className="text-white/80 text-sm text-center">
                  {selectedPdfName && `رفع ${selectedPdfName} - ${formatFileSize(form.watch("pdfFile")?.size || 0)} كملف واحد كامل`}
                </p>
              </div>
            )}

            {/* رسالة النجاح */}
            {uploadSuccess && (
              <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">تم رفع المجلة بنجاح!</p>
                <p className="text-green-300 text-sm">سيتم تحويلك إلى المجلة العلمية خلال ثوانٍ...</p>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المجلة</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنواناً للمجلة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف المجلة (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل وصفاً للمجلة"
                          className="min-h-[80px]" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مؤلف المجلة</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم مؤلف المجلة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>القسم</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="physics">الفيزياء</SelectItem>
                          <SelectItem value="chemistry">الكيمياء</SelectItem>
                          <SelectItem value="biology">الأحياء</SelectItem>
                          <SelectItem value="mathematics">الرياضيات</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>صورة الغلاف (حتى 100 ميجابايت)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            {...fieldProps}
                          />
                          {coverPreviewUrl && (
                            <div className="mt-2 border rounded-md p-2">
                              <img
                                src={coverPreviewUrl}
                                alt="Preview"
                                className="max-h-[200px] mx-auto object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>ملف المجلة (PDF - حتى 5 جيجابايت - ملف واحد كامل)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfFileChange}
                            {...fieldProps}
                          />
                          {selectedPdfName && (
                            <div className="mt-2 border rounded-md p-3 flex items-center justify-between bg-green-500/10 border-green-500/30">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-300 truncate">{selectedPdfName}</span>
                                <span className="text-xs text-green-400">
                                  ✓ مقبول - حجم الملف: {formatFileSize(form.watch("pdfFile")?.size || 0)} - سيتم رفعه كملف واحد كامل
                                </span>
                              </div>
                              <FileText className="h-5 w-5 text-purple-400" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isUploading || uploadSuccess} 
                  className="w-full bg-purple-500 hover:bg-purple-600 mt-6"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جارٍ الرفع... (ملف واحد كامل مع ضمان الحفظ)
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      تم الرفع بنجاح
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      رفع المجلة (حتى 5 جيجابايت - ملف واحد كامل)
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UploadJournalPage;
