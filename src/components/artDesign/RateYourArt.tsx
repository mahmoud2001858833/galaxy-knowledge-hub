import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Upload, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RateYourArt = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `art-rating/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      toast.success("تم رفع العمل بنجاح!");
    } catch (error: any) {
      console.error("Error uploading:", error);
      toast.error("فشل رفع العمل");
    } finally {
      setIsUploading(false);
    }
  };

  const evaluateArt = async () => {
    if (!uploadedImage || !description.trim()) {
      toast.error("يرجى رفع العمل وكتابة وصف له");
      return;
    }

    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("rate-your-art", {
        body: { 
          imageUrl: uploadedImage,
          description: description.trim()
        }
      });

      if (error) throw error;

      setEvaluation(data.evaluation);
      toast.success("تم تقييم عملك!");
    } catch (error: any) {
      console.error("Error evaluating:", error);
      toast.error("فشل تقييم العمل");
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetEvaluation = () => {
    setUploadedImage(null);
    setDescription("");
    setEvaluation(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            قيّم عملك الفني
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            ارفع عملك الفني واحصل على تقييم شامل من الذكاء الاصطناعي مع نقاط القوة والضعف
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!evaluation ? (
            <>
              {!uploadedImage ? (
                <div className="space-y-4">
                  <div className="text-center p-12 border-2 border-dashed border-border rounded-lg">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      اضغط لرفع عملك الفني أو تصميمك
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="art-rate-upload"
                    />
                    <label htmlFor="art-rate-upload">
                      <Button asChild disabled={isUploading}>
                        <span className="cursor-pointer gap-2">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جاري الرفع...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              اختر الملف
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={uploadedImage}
                      alt="عملك الفني"
                      className="max-w-md mx-auto rounded-lg shadow-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      اكتب وصفاً لعملك الفني (اختياري)
                    </label>
                    <Textarea
                      placeholder="صف عملك الفني، الفكرة، التقنيات المستخدمة، أو أي معلومات تساعد في التقييم..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={evaluateArt}
                      disabled={isEvaluating}
                      size="lg"
                      className="gap-2"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جاري التقييم...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          احصل على التقييم
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setUploadedImage(null)}
                      variant="outline"
                      size="lg"
                    >
                      تغيير الصورة
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={uploadedImage}
                  alt="عملك الفني"
                  className="max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>

              {description && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">وصفك للعمل:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{description}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    تقييم الذكاء الاصطناعي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{evaluation}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button onClick={resetEvaluation} variant="outline" size="lg">
                  تقييم عمل جديد
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RateYourArt;
