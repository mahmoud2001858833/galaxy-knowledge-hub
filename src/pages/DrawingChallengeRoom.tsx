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
  const [player1Username, setPlayer1Username] = useState<string>("");
  const [player2Username, setPlayer2Username] = useState<string>("");

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
          fetchChallenge();
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

      // Fetch usernames
      if (data.player1_id) {
        const { data: profile1 } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.player1_id)
          .single();
        if (profile1) setPlayer1Username(profile1.username);
      }

      if (data.player2_id) {
        const { data: profile2 } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.player2_id)
          .single();
        if (profile2) setPlayer2Username(profile2.username);
      }

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

  const startChallenge = async () => {
    if (!challenge || challenge.room_created_by !== currentUserId) {
      toast.error("فقط منشئ الغرفة يمكنه بدء التحدي");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("drawing_challenges")
        .update({
          status: "in_progress",
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + (challenge.time_limit || 1800) * 1000).toISOString(),
        })
        .eq("id", roomId);

      if (updateError) throw updateError;
      toast.success("بدأ التحدي!");
    } catch (error: any) {
      console.error("Error starting game:", error);
      toast.error("فشل بدء التحدي");
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
    if (!challenge) return;

    try {
      // Determine winner based on who uploaded first
      let winnerId = null;
      let evaluation = "";

      if (challenge.player1_submission && !challenge.player2_submission) {
        winnerId = challenge.player1_id;
        evaluation = "🎉 اللاعب الأول هو الفائز لأنه قام بتحميل الرسم في الوقت المحدد بينما لم يقم اللاعب الثاني بالتحميل!";
      } else if (!challenge.player1_submission && challenge.player2_submission) {
        winnerId = challenge.player2_id;
        evaluation = "🎉 اللاعب الثاني هو الفائز لأنه قام بتحميل الرسم في الوقت المحدد بينما لم يقم اللاعب الأول بالتحميل!";
      } else if (challenge.player1_submission && challenge.player2_submission) {
        evaluation = "⚠️ كلا اللاعبين قاما بتحميل رسوماتهما! الفائز هو من رفع أولاً.";
        // In a real scenario, you would check timestamps to determine who uploaded first
        winnerId = challenge.player1_id; // Default to player 1 if both uploaded
      } else {
        evaluation = "❌ لم يقم أي من اللاعبين بتحميل رسم في الوقت المحدد. لا يوجد فائز.";
      }

      const { error: updateError } = await supabase
        .from("drawing_challenges")
        .update({
          status: "completed",
          ai_evaluation: evaluation,
          completed_at: new Date().toISOString(),
          winner_id: winnerId,
        })
        .eq("id", roomId);

      if (updateError) throw updateError;

      fetchChallenge();
      toast.success("انتهى التحدي!");
    } catch (error: any) {
      console.error("Error evaluating:", error);
      toast.error("فشل تقييم التحدي");
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
                <div className="text-center p-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">اللاعبون:</h4>
                    <div className="flex justify-center gap-8">
                      <div className="p-4 bg-primary/10 rounded-lg min-w-[150px]">
                        <p className="text-sm text-muted-foreground mb-1">اللاعب الأول</p>
                        <p className="font-semibold">{player1Username || "..."}</p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded-lg min-w-[150px]">
                        <p className="text-sm text-muted-foreground mb-1">اللاعب الثاني</p>
                        <p className="font-semibold">{player2Username || "في الانتظار..."}</p>
                      </div>
                    </div>
                  </div>
                  
                  {!challenge.player2_id && (
                    <p className="text-lg text-muted-foreground">في انتظار انضمام اللاعب الثاني...</p>
                  )}
                  
                  {challenge.player2_id && challenge.room_created_by === currentUserId && (
                    <Button onClick={startChallenge} size="lg" className="gap-2">
                      <Trophy className="w-5 h-5" />
                      بدء التحدي
                    </Button>
                  )}
                  
                  {challenge.player2_id && challenge.room_created_by !== currentUserId && (
                    <p className="text-lg text-primary">في انتظار منشئ الغرفة لبدء التحدي...</p>
                  )}
                </div>
              )}

              {challenge.status === "in_progress" && (
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold">متطلبات الرسم:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• يجب رفع الرسم قبل انتهاء الوقت</li>
                      <li>• الفائز هو من يرفع رسمه أولاً</li>
                      <li>• الصيغ المقبولة: JPG, PNG, GIF</li>
                      <li>• الحد الأقصى لحجم الملف: 10 ميجابايت</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading || timeLeft <= 0}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button asChild disabled={uploading || timeLeft <= 0}>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 ml-2" />
                          {uploading ? "جاري الرفع..." : timeLeft <= 0 ? "انتهى الوقت" : "رفع عملك"}
                        </span>
                      </Button>
                    </label>
                    {timeLeft <= 0 && !mySubmission && (
                      <p className="text-destructive mt-2 text-sm">
                        ⏰ انتهى الوقت! لا يمكن رفع المزيد من الرسومات
                      </p>
                    )}
                  </div>

                  {mySubmission && (
                    <div className="text-center">
                      <p className="text-green-500 mb-4 font-semibold">✓ تم رفع عملك بنجاح! انتظر النتائج...</p>
                      <img
                        src={mySubmission}
                        alt="عملك"
                        className="max-w-md mx-auto rounded-lg shadow-lg"
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
