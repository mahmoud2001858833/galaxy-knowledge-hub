import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Upload, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ArtChallenge = () => {
  const [challengePrompt, setChallengePrompt] = useState<string | null>(null);
  const [isGettingPrompt, setIsGettingPrompt] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);

  const startChallenge = async () => {
    setIsGettingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke("art-service", { body: { action: "challenge-prompt" } });
      
      if (error) throw error;
      
      setChallengePrompt(data.prompt);
      toast.success("تم الحصول على التحدي!");
    } catch (error: any) {
      console.error("Error getting challenge:", error);
      toast.error("فشل الحصول على التحدي");
    } finally {
      setIsGettingPrompt(false);
    }
  };

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
      const filePath = `art-challenge/${fileName}`;

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
    if (!uploadedImage || !challengePrompt) return;

    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("art-service", {
        body: { action: "challenge-evaluate", imageUrl: uploadedImage, prompt: challengePrompt }
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

  const resetChallenge = () => {
    setChallengePrompt(null);
    setUploadedImage(null);
    setEvaluation(null);
  };

  if (!challengePrompt) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              تحدي فني
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              احصل على فكرة إبداعية من الذكاء الاصطناعي وارسمها، ثم احصل على تقييم شامل
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">فكرة إبداعية</h3>
                  <p className="text-sm text-muted-foreground">من الذكاء الاصطناعي</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">ارسم وارفع</h3>
                  <p className="text-sm text-muted-foreground">عملك الفني</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">تقييم شامل</h3>
                  <p className="text-sm text-muted-foreground">من الذكاء الاصطناعي</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={startChallenge}
                disabled={isGettingPrompt}
                className="gap-2"
              >
                {isGettingPrompt ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    ابدأ التحدي
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            تحديك الفني
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">التحدي:</h3>
              <p className="text-lg">{challengePrompt}</p>
            </CardContent>
          </Card>

          {!uploadedImage ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                ارسم هذا التحدي ثم ارفع عملك الفني
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="art-upload"
              />
              <label htmlFor="art-upload">
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
                        رفع العمل
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          ) : !evaluation ? (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={uploadedImage}
                  alt="عملك الفني"
                  className="max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="text-center">
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
                      <CheckCircle className="w-5 h-5" />
                      احصل على التقييم
                    </>
                  )}
                </Button>
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
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle>تقييم الذكاء الاصطناعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{evaluation}</p>
                </CardContent>
              </Card>
              <div className="text-center">
                <Button onClick={resetChallenge} variant="outline">
                  تحدي جديد
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ArtChallenge;
