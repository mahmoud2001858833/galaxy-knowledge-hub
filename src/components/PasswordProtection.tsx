import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CORRECT_PASSWORD = "mahmoud200";

interface PasswordProtectionProps {
  onSuccess: () => void;
}

export default function PasswordProtection({ onSuccess }: PasswordProtectionProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onSuccess();
    } else {
      toast({
        title: "كلمة السر خاطئة",
        description: "يرجى إدخال كلمة السر الصحيحة",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">المصادر المرفوعة</CardTitle>
          <CardDescription>
            يرجى إدخال كلمة السر للدخول
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
