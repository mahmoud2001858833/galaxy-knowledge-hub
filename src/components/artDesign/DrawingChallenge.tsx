import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Upload, Clock, Users, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Room {
  id: string;
  room_number: string;
  challenge_prompt: string;
  status: string;
  player1_id: string;
  player2_id: string | null;
  room_created_by: string;
  created_at: string;
}

const DrawingChallenge = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showOptions) {
      fetchRooms();
    }
  }, [showOptions]);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("drawing_challenges")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      toast.error("فشل تحميل الغرف");
    }
  };

  const generateRoomNumber = () => {
    return `ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const createRoom = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      // Get AI prompt
      const { data: promptData, error: promptError } = await supabase.functions.invoke(
        "drawing-challenge-prompt"
      );

      if (promptError) throw promptError;

      const roomNumber = generateRoomNumber();
      const { data, error } = await supabase
        .from("drawing_challenges")
        .insert({
          room_number: roomNumber,
          challenge_prompt: promptData.prompt,
          player1_id: user.id,
          room_created_by: user.id,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`تم إنشاء الغرفة رقم: ${roomNumber}`);
      navigate(`/drawing-challenge/${data.id}`);
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error("فشل إنشاء الغرفة");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const { error } = await supabase
        .from("drawing_challenges")
        .update({
          player2_id: user.id,
          status: "in_progress",
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        })
        .eq("id", roomId);

      if (error) throw error;

      toast.success("انضممت إلى الغرفة بنجاح!");
      navigate(`/drawing-challenge/${roomId}`);
    } catch (error: any) {
      console.error("Error joining room:", error);
      toast.error("فشل الانضمام إلى الغرفة");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!showOptions) {
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
              تحدي الرسم
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              تحدى زميلك في الرسم! الذكاء الاصطناعي سيعطيكما فكرة، وسيحكم على الأعمال
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">30 دقيقة</h3>
                  <p className="text-sm text-muted-foreground">وقت التحدي</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">رفع العمل</h3>
                  <p className="text-sm text-muted-foreground">قبل انتهاء الوقت</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">تقييم الذكاء الاصطناعي</h3>
                  <p className="text-sm text-muted-foreground">اختيار الفائز</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <Button
                size="lg"
                onClick={() => setShowOptions(true)}
                className="gap-2"
              >
                <Trophy className="w-5 h-5" />
                ابدأ التحدي
              </Button>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">كيف يعمل التحدي؟</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1️⃣ أنشئ غرفة جديدة أو انضم لغرفة موجودة</p>
                <p>2️⃣ الذكاء الاصطناعي سيعطيكما موضوعاً للرسم</p>
                <p>3️⃣ لديكما 30 دقيقة لإكمال الرسم</p>
                <p>4️⃣ ارفعا أعمالكما قبل انتهاء الوقت</p>
                <p>5️⃣ الذكاء الاصطناعي سيقيم الأعمال ويختار الفائز</p>
                <p>6️⃣ يمكنكما طلب نصائح لتحسين مهاراتكما</p>
              </CardContent>
            </Card>
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
            <Users className="w-6 h-6 text-primary" />
            اختر طريقة التحدي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              size="lg"
              variant="outline"
              onClick={createRoom}
              disabled={loading}
              className="h-32 flex flex-col gap-2"
            >
              <Plus className="w-8 h-8" />
              <span>إنشاء غرفة جديدة</span>
              <span className="text-xs text-muted-foreground">سيتم توليد رقم الغرفة تلقائياً</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={fetchRooms}
              className="h-32 flex flex-col gap-2"
            >
              <Users className="w-8 h-8" />
              <span>الانضمام لغرفة موجودة</span>
              <span className="text-xs text-muted-foreground">ابحث عن الغرف المتاحة</span>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ابحث عن غرفة برقمها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد غرف متاحة حالياً
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <Card key={room.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{room.room_number}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {room.challenge_prompt}
                          </p>
                        </div>
                        <Button onClick={() => joinRoom(room.id)} disabled={loading}>
                          انضم
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowOptions(false)}
            className="w-full"
          >
            رجوع
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DrawingChallenge;
