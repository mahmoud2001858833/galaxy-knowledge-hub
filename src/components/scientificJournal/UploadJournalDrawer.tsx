
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { SubjectType } from '@/components/shared/types/educationalContentTypes';
import { Loader2, Upload, FileText } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون العنوان 3 أحرف على الأقل" }),
  description: z.string().optional(),
  author: z.string().min(3, { message: "يجب أن يكون اسم المؤلف 3 أحرف على الأقل" }),
  subject: z.enum(['physics', 'chemistry', 'biology', 'mathematics']),
  coverImage: z.instanceof(File).refine(
    (file) => file.size < 5 * 1024 * 1024, // 5MB
    { message: "حجم صورة الغلاف يجب أن يكون أقل من 5 ميجابايت" }
  ),
  pdfFile: z.instanceof(File).refine(
    (file) => file.size < 20 * 1024 * 1024, // 20MB
    { message: "حجم ملف PDF يجب أن يكون أقل من 20 ميجابايت" }
  ).refine(
    (file) => file.type === 'application/pdf',
    { message: "يجب أن يكون الملف بصيغة PDF" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const UploadJournalDrawer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the scientific_journals bucket exists when component mounts
    const checkBucket = async () => {
      try {
        const { data: bucketExists } = await supabase.storage.getBucket('scientific_journals');
        
        if (!bucketExists) {
          console.log("Creating scientific_journals bucket");
          const { error: createBucketError } = await supabase.storage.createBucket('scientific_journals', {
            public: true,
            fileSizeLimit: 20971520, // 20MB
          });
          
          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError);
          } else {
            console.log("Created scientific_journals bucket successfully");
          }
        } else {
          console.log("scientific_journals bucket already exists");
        }
      } catch (error) {
        console.error("Error checking bucket:", error);
      }
    };
    
    checkBucket();
  }, []);

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

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Set the file in the form
    form.setValue("coverImage", file);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedPdfName(file.name);
    form.setValue("pdfFile", file);
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    console.log("بدء تحميل المجلة:", data);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ في تحميل المجلة",
          description: "يجب تسجيل الدخول أولاً لرفع المجلات",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Upload cover image to storage
      const coverExt = data.coverImage.name.split('.').pop();
      const coverFileName = `cover_${uuidv4()}.${coverExt}`;
      const coverFilePath = `${data.subject}/${coverFileName}`;

      console.log("جاري رفع صورة الغلاف إلى:", coverFilePath);

      const { error: coverUploadError } = await supabase.storage
        .from('scientific_journals')
        .upload(coverFilePath, data.coverImage);

      if (coverUploadError) {
        console.error("خطأ في رفع صورة الغلاف:", coverUploadError);
        throw coverUploadError;
      }

      console.log("تم رفع صورة الغلاف بنجاح");

      // Upload PDF file to storage
      const pdfFileName = `pdf_${uuidv4()}.pdf`;
      const pdfFilePath = `${data.subject}/${pdfFileName}`;

      console.log("جاري رفع ملف PDF إلى:", pdfFilePath);

      const { error: pdfUploadError } = await supabase.storage
        .from('scientific_journals')
        .upload(pdfFilePath, data.pdfFile);

      if (pdfUploadError) {
        console.error("خطأ في رفع ملف PDF:", pdfUploadError);
        throw pdfUploadError;
      }

      console.log("تم رفع ملف PDF بنجاح");

      // Get the public URLs
      const { data: coverPublicUrlData } = supabase.storage
        .from('scientific_journals')
        .getPublicUrl(coverFilePath);

      const { data: pdfPublicUrlData } = supabase.storage
        .from('scientific_journals')
        .getPublicUrl(pdfFilePath);

      console.log("URL العام لصورة الغلاف:", coverPublicUrlData.publicUrl);
      console.log("URL العام لملف PDF:", pdfPublicUrlData.publicUrl);

      // Store metadata in the database
      const { error: dbError } = await supabase
        .from('scientific_journals')
        .insert({
          title: data.title,
          description: data.description || null,
          subject: data.subject,
          author: data.author,
          cover_image_url: coverPublicUrlData.publicUrl,
          pdf_url: pdfPublicUrlData.publicUrl,
          created_by: user.id,
        });

      if (dbError) {
        console.error("خطأ في حفظ بيانات المجلة:", dbError);
        throw dbError;
      }

      console.log("تم حفظ بيانات المجلة بنجاح");

      toast({
        title: "تم رفع المجلة بنجاح",
        description: "تمت إضافة المجلة إلى المكتبة العلمية",
      });

      // Reset form and close drawer
      form.reset();
      setCoverPreviewUrl(null);
      setSelectedPdfName(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error uploading journal:', error);
      toast({
        title: "خطأ في تحميل المجلة",
        description: error.message || "حدث خطأ أثناء رفع المجلة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Form submission handler that properly prevents default behavior
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="group bg-purple-500 hover:bg-purple-600">
          <Upload className="mr-2 h-4 w-4" />
          رفع مجلة علمية
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-right">رفع مجلة علمية جديدة</DrawerTitle>
          <DrawerDescription className="text-right">
            أضف مجلة علمية جديدة إلى المكتبة العلمية لمشاركتها مع الطلاب والمعلمين
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4">
          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6 text-right">
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
                    <FormLabel>صورة الغلاف</FormLabel>
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
                    <FormLabel>ملف المجلة (PDF)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfFileChange}
                          {...fieldProps}
                        />
                        {selectedPdfName && (
                          <div className="mt-2 border rounded-md p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-300 truncate">{selectedPdfName}</span>
                            <FileText className="h-5 w-5 text-purple-400" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <DrawerFooter>
                <Button type="submit" disabled={isUploading} className="w-full bg-purple-500 hover:bg-purple-600">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جارٍ الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      رفع المجلة
                    </>
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">إلغاء</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default UploadJournalDrawer;
