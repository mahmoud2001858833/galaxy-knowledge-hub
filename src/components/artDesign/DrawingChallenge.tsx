import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Upload, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const DrawingChallenge = () => {
  const [challengeActive, setChallengeActive] = useState(false);

  const handleStartChallenge = () => {
    toast.info("ميزة التحدي قيد التطوير - قريباً!");
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
              onClick={handleStartChallenge}
              className="gap-2"
            >
              <Trophy className="w-5 h-5" />
              ابدأ التحدي
            </Button>
            <p className="text-sm text-muted-foreground">
              يتطلب وجود متحدٍ آخر معك في الغرفة
            </p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">كيف يعمل التحدي؟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1️⃣ انضم أنت وزميلك إلى غرفة التحدي</p>
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
};

export default DrawingChallenge;
