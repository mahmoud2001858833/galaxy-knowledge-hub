
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminControlProps {
  onAdminAccess: () => void;
  onMemberAccess?: () => void;
  isAdminMode: boolean;
}

const AdminControl: React.FC<AdminControlProps> = ({ onAdminAccess, onMemberAccess, isAdminMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyPassword = () => {
    setIsLoading(true);
    if (password === "mahmoud200") {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "تم تفعيل وضع المشرف",
      });
      onAdminAccess();
      setIsOpen(false);
    } else if (password === "mahmoud20") {
      toast({
        title: "تم تسجيل الدخول",
        description: "تم الدخول كعضو",
      });
      onMemberAccess?.();
      setIsOpen(false);
    } else {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    }
    setIsLoading(false);
    setPassword("");
  };

  return (
    <>
      <Button
        variant={isAdminMode ? "destructive" : "outline"}
        size="sm"
        className={isAdminMode ? "bg-red-600" : ""}
        onClick={() => isAdminMode ? onAdminAccess() : setIsOpen(true)}
      >
        {isAdminMode ? (
          <>
            <Trash className="w-4 h-4 mr-2" />
            إيقاف وضع المشرف
          </>
        ) : (
          "دخول"
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تسجيل دخول المشرف</DialogTitle>
            <DialogDescription className="text-right">
              يرجى إدخال كلمة المرور للدخول إلى وضع المشرف
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 my-4">
            <Input
              placeholder="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerifyPassword();
                }
              }}
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleVerifyPassword}
              disabled={!password || isLoading}
            >
              {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminControl;
