
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
import { Loader2, Upload } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون العنوان 3 أحرف على الأقل" }),
  description: z.string().optional(),
  subject: z.enum(['physics', 'chemistry', 'biology', 'mathematics']),
  image: z.instanceof(File).refine(
    (file) => file.size < 5 * 1024 * 1024, // 5MB
    { message: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const UploadImageDrawer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // تأكد من وجود bucket للصور التعليمية عند تحميل المكون
    const checkBucket = async () => {
      try {
        console.log("التحقق من وجود مجلد التخزين للصور التعليمية");
        const { data: buckets } = await supabase.storage.listBuckets();
        
        // البحث عن وجود bucket باسم 'educational_images'
        const bucketExists = buckets?.some(bucket => bucket.name === 'educational_images');
        
        if (!bucketExists) {
          console.log("إنشاء مجلد تخزين جديد للصور التعليمية");
          const { error: createBucketError } = await supabase.storage.createBucket('educational_images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (createBucketError) {
            console.error("خطأ في إنشاء مجلد التخزين:", createBucketError);
            
            // إنشاء سياسات الوصول إذا كان الخطأ متعلقًا بها
            if (createBucketError.message.includes('policy')) {
              console.log("جاري محاولة إنشاء مجلد التخزين بطريقة أخرى");
              // يمكن إضافة معالجة خاصة هنا إذا لزم الأمر
            }
          } else {
            console.log("تم إنشاء مجلد التخزين للصور التعليمية بنجاح");
          }
        } else {
          console.log("مجلد التخزين للصور التعليمية موجود بالفعل");
        }
      } catch (error) {
        console.error("خطأ في التحقق من مجلد التخزين:", error);
      }
    };
    
    checkBucket();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "physics",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // معاينة الصورة
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // تعيين الملف في النموذج
    form.setValue("image", file);
  };

  const onSubmit = async (data: FormValues) => {
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
        setIsUploading(false);
        return;
      }

      // رفع الصورة إلى التخزين
      const fileExt = data.image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${data.subject}/${fileName}`;

      console.log("جاري رفع الصورة إلى:", filePath);

      // التحقق من وجود bucket
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'educational_images');

      if (!bucketExists) {
        console.log("إنشاء مجلد تخزين جديد للصور التعليمية قبل الرفع");
        await supabase.storage.createBucket('educational_images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      }

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('educational_images')
        .upload(filePath, data.image);

      if (uploadError) {
        console.error("خطأ في رفع الصورة:", uploadError);
        throw uploadError;
      }

      console.log("تم رفع الصورة بنجاح");

      // الحصول على الرابط العام
      const { data: publicUrlData } = supabase.storage
        .from('educational_images')
        .getPublicUrl(filePath);

      console.log("URL العام للصورة:", publicUrlData.publicUrl);

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
        throw dbError;
      }

      console.log("تم حفظ بيانات الصورة بنجاح");

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تمت إضافة الصورة إلى المكتبة المرئية",
      });

      // إعادة تعيين النموذج وإغلاق الدرج
      form.reset();
      setPreviewUrl(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في تحميل الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }} className="space-y-6 text-right">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الصورة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنواناً للصورة" {...field} />
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
                    <FormLabel>وصف الصورة (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل وصفاً للصورة"
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
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>الصورة</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          {...fieldProps}
                        />
                        {previewUrl && (
                          <div className="mt-2 border rounded-md p-2">
                            <img
                              src={previewUrl}
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
            
              <DrawerFooter>
                <Button type="submit" disabled={isUploading} className="w-full bg-blue-500 hover:bg-blue-600">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جارٍ الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      رفع الصورة
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

export default UploadImageDrawer;
