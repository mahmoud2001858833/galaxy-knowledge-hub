import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

interface BuilderPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  onPublish: (slug: string) => void;
  isPublished: boolean;
  publishUrl?: string;
}

export const BuilderPublishDialog = ({
  open,
  onOpenChange,
  projectTitle,
  onPublish,
  isPublished,
  publishUrl,
}: BuilderPublishDialogProps) => {
  const [customSlug, setCustomSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0621-\u064Aa-z0-9-]/g, '')
      .substring(0, 50);
  };

  const handlePublish = () => {
    const slug = customSlug || generateSlug(projectTitle);
    if (!slug) {
      toast.error("يرجى إدخال عنوان صالح");
      return;
    }
    onPublish(slug);
    onOpenChange(false);
  };

  const handleCopy = async () => {
    if (!publishUrl) return;
    try {
      await navigator.clipboard.writeText(publishUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل نسخ الرابط");
    }
  };

  if (isPublished && publishUrl) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>🎉 المشروع منشور!</DialogTitle>
            <DialogDescription>
              مشروعك متاح الآن على الإنترنت
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>رابط المشروع</Label>
              <div className="flex gap-2 mt-2">
                <Input value={publishUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publishUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                تم
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>نشر المشروع</DialogTitle>
          <DialogDescription>
            اجعل مشروعك متاحاً على الإنترنت
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="slug">عنوان URL المخصص (اختياري)</Label>
            <Input
              id="slug"
              placeholder={generateSlug(projectTitle)}
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="mt-2"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground mt-1">
              سيكون الرابط: your-domain.com/published/{customSlug || generateSlug(projectTitle)}
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📝 ملاحظة</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• سيكون المشروع متاحاً لأي شخص لديه الرابط</li>
              <li>• يمكنك تحديث المشروع في أي وقت</li>
              <li>• يمكنك إلغاء النشر لاحقاً</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              نشر الآن
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
