import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface CreateNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateNewsDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateNewsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مصرح");

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      let imageUrl = null;
      let videoUrl = null;

      // Upload image if provided
      if (imageFile) {
        const imageExt = imageFile.name.split(".").pop();
        const imagePath = `${user.id}/${Date.now()}.${imageExt}`;
        const { error: imageError } = await supabase.storage
          .from("project-images")
          .upload(imagePath, imageFile);

        if (imageError) throw imageError;

        const { data: { publicUrl } } = supabase.storage
          .from("project-images")
          .getPublicUrl(imagePath);

        imageUrl = publicUrl;
      }

      // Upload video if provided
      if (videoFile) {
        const videoExt = videoFile.name.split(".").pop();
        const videoPath = `${user.id}/${Date.now()}.${videoExt}`;
        const { error: videoError } = await supabase.storage
          .from("lesson-videos")
          .upload(videoPath, videoFile);

        if (videoError) throw videoError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-videos")
          .getPublicUrl(videoPath);

        videoUrl = publicUrl;
      }

      // Insert news
      const { error } = await supabase.from("school_news").insert({
        title,
        description,
        image_url: imageUrl,
        video_url: videoUrl,
        author_name: profile?.username || "مدير النظام",
        author_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "نجاح",
        description: "تم رفع الخبر بنجاح",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setVideoFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفع الخبر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>رفع خبر جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان الخبر *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="أدخل عنوان الخبر"
            />
          </div>

          <div>
            <Label htmlFor="description">وصف الخبر *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="أدخل تفاصيل الخبر"
              className="min-h-32"
            />
          </div>

          <div>
            <Label htmlFor="image">صورة (اختياري)</Label>
            <div className="mt-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="video">فيديو (اختياري)</Label>
            <div className="mt-2">
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  رفع الخبر
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
