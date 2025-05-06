
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from 'lucide-react';
import { SubjectType } from '@/components/shared/types/educationalContentTypes';

const formSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون العنوان 3 أحرف على الأقل" }),
  description: z.string().optional(),
  subject: z.enum(['physics', 'chemistry', 'biology', 'mathematics']),
  image: z.instanceof(File).refine(
    (file) => file.size < 5 * 1024 * 1024, // 5MB
    { message: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" }
  ),
});

export type ImageUploadFormValues = z.infer<typeof formSchema>;

interface ImageUploadFormProps {
  onSubmit: (data: ImageUploadFormValues) => Promise<void>;
  isUploading: boolean;
}

const ImageUploadForm = ({ onSubmit, isUploading }: ImageUploadFormProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ImageUploadFormValues>({
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

  const handleFormSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6 text-right">
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
      </form>
    </Form>
  );
};

export default ImageUploadForm;
