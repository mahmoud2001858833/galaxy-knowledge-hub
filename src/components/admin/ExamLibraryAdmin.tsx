import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert } from "lucide-react";
import { fetchIsAdmin } from "@/lib/examCreator/library";
import LibraryManager from "./exam-library/LibraryManager";
import AllExamsPanel from "./exam-library/AllExamsPanel";

/**
 * بوابة لوحة الأدمن في الواجهة ضعيفة (كلمة مرور في المتصفح)، فلا نعتمد عليها هنا:
 * كل عمليات هذه الصفحة محمية في قاعدة البيانات بدور admin الحقيقي (user_roles + RLS).
 */
export default function ExamLibraryAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => { fetchIsAdmin().then(setIsAdmin).catch(() => setIsAdmin(false)); }, []);

  if (isAdmin === null) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />;

  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="text-right" dir="rtl">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription className="space-y-2 text-sm leading-relaxed">
          <p><b>حسابك الحالي ليس أدمن على قاعدة البيانات.</b> لرفع ملفات المكتبة ورؤية كل الامتحانات سجّل الدخول بحساب يملك دور admin.</p>
          <p>لمنح الدور لحساب (من SQL Editor في Supabase):</p>
          <pre dir="ltr" className="overflow-x-auto rounded bg-muted p-2 text-left text-xs">{`insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'YOUR_EMAIL'
on conflict (user_id, role) do nothing;`}</pre>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div dir="rtl" className="space-y-4 text-right">
      <div>
        <h2 className="text-2xl font-black">مكتبة ملفات الامتحانات</h2>
        <p className="text-sm text-muted-foreground">ما ترفعه هنا ويُنشر يظهر لكل المستخدمين في «إنشاء الامتحانات» ليختاروه بلا رفع، ويمكنهم دمجه مع ملفاتهم.</p>
      </div>
      <Tabs defaultValue="library">
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 bg-muted text-muted-foreground">
          <TabsTrigger value="library">ملفات المكتبة</TabsTrigger>
          <TabsTrigger value="exams">كل الامتحانات المُنشأة</TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="mt-4"><LibraryManager /></TabsContent>
        <TabsContent value="exams" className="mt-4"><AllExamsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
