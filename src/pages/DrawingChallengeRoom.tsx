import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Upload, Trophy, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import StarField from "@/components/StarField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DrawingChallengeRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [uploading, setUploading] = useState(false);
  const [mySubmission, setMySubmission] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchChallenge();
    
    const channel = supabase
      .channel(`challenge-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drawing_challenges",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setChallenge(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (challenge?.status === "in_progress" && challenge?.end_time) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(challenge.end_time).getTime();
        const remaining = Math.max(0, Math.floor((end - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          evaluateChallenge();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [challenge]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from("drawing_challenges")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      setChallenge(data);

      // Check if current user has already submitted
      if (data.player1_id === currentUserId && data.player1_submission) {
        setMySubmission(data.player1_submission);
      } else if (data.player2_id === currentUserId && data.player2_submission) {
        setMySubmission(data.player2_submission);
      }
    } catch (error: any) {
      console.error("Error fetching challenge:", error);
      toast.error("فشل تحميل التحدي");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
      const filePath = `challenge-submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      const updateField = challenge.player1_id === currentUserId
        ? "player1_submission"
        : "player2_submission";

      const { error: updateError } = await supabase
        .from("drawing_challenges")
        .update({ [updateField]: publicUrl })
        .eq("id", roomId);

      if (updateError) throw updateError;

      setMySubmission(publicUrl);
      toast.success("تم رفع عملك بنجاح!");
    } catch (error: any) {
      console.error("Error uploading:", error);
      toast.error("فشل رفع العمل");
    } finally {
      setUploading(false);
    }
  };

  const evaluateChallenge = async () => {
    try {
      const { data: player1Profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", challenge.player1_id)
        .single();

      const { data: player2Profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", challenge.player2_id)
        .single();

      const { data: evaluationData, error: evalError } = await supabase.functions.invoke(
        "drawing-challenge-evaluate",
        {
          body: {
            prompt: challenge.challenge_prompt,
            player1Name: player1Profile?.username || "اللاعب الأول",
            player2Name: player2Profile?.username || "اللاعب الثاني",
          },
        }
      );

      if (evalError) throw evalError;

      const { error: updateError } = await supabase
        .from("drawing_challenges")
        .update({
          status: "completed",
          ai_evaluation: evaluationData.evaluation,
          completed_at: new Date().toISOString(),
        })
        .eq("id", roomId);

      if (updateError) throw updateError;

      toast.success("انتهى التحدي! جاري عرض النتائج...");
    } catch (error: any) {
      console.error("Error evaluating:", error);
      toast.error("فشل تقييم الأعمال");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!challenge) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <SEO title="غرفة التحدي" description="تحدي الرسم المباشر" />
      <StarField />
      <Navbar />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/art-design")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  غرفة رقم: {challenge.room_number}
                </div>
                {challenge.status === "in_progress" && (
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Clock className="w-6 h-6" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <h3 className="text-xl font-bold mb-2">الموضوع المطلوب:</h3>
                <p className="text-lg">{challenge.challenge_prompt}</p>
              </div>

              {challenge.status === "waiting" && (
                <div className="text-center p-6">
                  <p className="text-lg">في انتظار انضمام اللاعب الثاني...</p>
                </div>
              )}

              {challenge.status === "in_progress" && (
                <div className="space-y-4">
                  {!mySubmission ? (
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button asChild disabled={uploading}>
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 ml-2" />
                            {uploading ? "جاري الرفع..." : "رفع عملك"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-green-500 mb-4">✓ تم رفع عملك بنجاح</p>
                      <img
                        src={mySubmission}
                        alt="عملك"
                        className="max-w-md mx-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {challenge.status === "completed" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenge.player1_submission && (
                      <div>
                        <h4 className="font-semibold mb-2">اللاعب الأول</h4>
                        <img
                          src={challenge.player1_submission}
                          alt="عمل اللاعب الأول"
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                    {challenge.player2_submission && (
                      <div>
                        <h4 className="font-semibold mb-2">اللاعب الثاني</h4>
                        <img
                          src={challenge.player2_submission}
                          alt="عمل اللاعب الثاني"
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <Card className="bg-primary/5">
                    <CardHeader>
                      <CardTitle>تقييم الذكاء الاصطناعي</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{challenge.ai_evaluation}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default DrawingChallengeRoom;
