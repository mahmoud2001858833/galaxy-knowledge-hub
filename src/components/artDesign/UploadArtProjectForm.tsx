import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  artistName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  projectTitle: z.string().min(3, "عنوان المشروع يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  image: z.any().refine((files) => files?.length > 0, "يجب رفع صورة"),
});

interface UploadArtProjectFormProps {
  onSuccess: () => void;
}

const UploadArtProjectForm = ({ onSuccess }: UploadArtProjectFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setUploading(true);

    try {
      const file = values.image[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("educational_images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("educational_images")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("art_projects").insert({
        artist_name: values.artistName,
        project_title: values.projectTitle,
        description: values.description,
        image_url: publicUrl,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      toast.success("تم رفع المشروع بنجاح!");
      form.reset();
      setImagePreview("");
      onSuccess();
    } catch (error: any) {
      toast.error("فشل رفع المشروع");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="artistName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الفنان</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم الفنان" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان المشروع</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان المشروع" {...field} />
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
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل وصف المشروع"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>صورة المشروع</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    onChange(e.target.files);
                    handleImageChange(e);
                  }}
                  {...field}
                />
              </FormControl>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="معاينة"
                    className="w-full max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? "جاري الرفع..." : "رفع المشروع"}
        </Button>
      </form>
    </Form>
  );
};

export default UploadArtProjectForm;
