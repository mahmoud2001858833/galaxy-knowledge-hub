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
import { Database, Check } from "lucide-react";
import { toast } from "sonner";

interface SupabaseConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (url: string, anonKey: string) => void;
  currentUrl?: string;
  currentKey?: string;
}

export const SupabaseConnectDialog = ({
  open,
  onOpenChange,
  onConnect,
  currentUrl = "",
  currentKey = "",
}: SupabaseConnectDialogProps) => {
  const [url, setUrl] = useState(currentUrl);
  const [anonKey, setAnonKey] = useState(currentKey);
  const [isConnected, setIsConnected] = useState(!!currentUrl && !!currentKey);

  const handleConnect = () => {
    if (!url || !anonKey) {
      toast.error("يرجى إدخال جميع البيانات");
      return;
    }

    if (!url.includes('supabase.co')) {
      toast.error("يرجى إدخال رابط Supabase صحيح");
      return;
    }

    onConnect(url, anonKey);
    setIsConnected(true);
    toast.success("تم الربط بنجاح مع Supabase");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            ربط قاعدة بيانات Supabase
          </DialogTitle>
          <DialogDescription>
            اربط مشروعك بقاعدة بيانات Supabase لتفعيل ميزات المصادقة والتخزين
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isConnected && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">متصل بقاعدة البيانات</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase Project URL</Label>
            <Input
              id="supabase-url"
              placeholder="https://xxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              يمكنك إيجاد الرابط في إعدادات مشروعك في Supabase
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabase-key">Supabase Anon Key</Label>
            <Input
              id="supabase-key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              dir="ltr"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              المفتاح العام (Anon Key) من إعدادات API
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              💡 كيف تحصل على البيانات؟
            </h4>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. افتح لوحة تحكم Supabase</li>
              <li>2. اذهب إلى Project Settings → API</li>
              <li>3. انسخ Project URL و anon/public key</li>
              <li>4. الصقها هنا</li>
            </ol>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button onClick={handleConnect} className="flex-1">
              {isConnected ? "تحديث الاتصال" : "ربط الآن"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
