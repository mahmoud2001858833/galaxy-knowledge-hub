import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Play, Copy, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const CODE_EXAMPLES = {
  python: `# مثال بسيط بلغة Python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")`,
  
  cpp: `// مثال بسيط بلغة C++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    
    // حساب مجموع الأعداد من 1 إلى 10
    int sum = 0;
    for(int i = 1; i <= 10; i++) {
        sum += i;
    }
    
    cout << "Sum = " << sum << endl;
    return 0;
}`,
  
  php: `<?php
// مثال بسيط بلغة PHP
echo "Hello from PHP!\\n";

// حساب مضروب عدد
function factorial($n) {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}

for ($i = 1; $i <= 5; $i++) {
    echo "factorial($i) = " . factorial($i) . "\\n";
}
?>`
};

export const CodeExecutor = () => {
  const [code, setCode] = useState(CODE_EXAMPLES.python);
  const [language, setLanguage] = useState<'python' | 'cpp' | 'php'>('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (newLanguage: 'python' | 'cpp' | 'php') => {
    setLanguage(newLanguage);
    setCode(CODE_EXAMPLES[newLanguage]);
    setOutput('');
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error("يرجى كتابة الكود أولاً");
      return;
    }

    setIsRunning(true);
    setOutput('جاري التنفيذ...');

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language }
      });

      if (error) throw error;

      if (data.error) {
        setOutput(`❌ خطأ في التنفيذ:\n${data.error}`);
        toast.error("فشل تنفيذ الكود");
      } else {
        setOutput(`✅ النتيجة:\n${data.result || 'تم التنفيذ بنجاح بدون مخرجات'}`);
        toast.success("تم التنفيذ بنجاح");
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      setOutput(`❌ خطأ: ${error.message}`);
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ الكود");
  };

  const handleClear = () => {
    setCode('');
    setOutput('');
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Select value={language} onValueChange={(val) => handleLanguageChange(val as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">
              <span className="flex items-center gap-2">
                🐍 Python
              </span>
            </SelectItem>
            <SelectItem value="cpp">
              <span className="flex items-center gap-2">
                ⚙️ C++
              </span>
            </SelectItem>
            <SelectItem value="php">
              <span className="flex items-center gap-2">
                🐘 PHP
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          نسخ
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          مسح
        </Button>

        <Button onClick={executeCode} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري التنفيذ...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              تنفيذ
            </>
          )}
        </Button>
      </div>

      {/* Code Editor */}
      <Card className="flex-1 p-0 overflow-hidden">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`اكتب كود ${language === 'python' ? 'Python' : language === 'cpp' ? 'C++' : 'PHP'} هنا...`}
          className="h-full min-h-[300px] font-mono text-sm border-0 resize-none rounded-none"
          dir="ltr"
        />
      </Card>

      {/* Output */}
      {output && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">📤 المخرجات:</h3>
          <ScrollArea className="h-[200px]">
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/50 p-3 rounded">
              {output}
            </pre>
          </ScrollArea>
        </Card>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
        💡 نصيحة: يمكنك تنفيذ كود Python و C++ و PHP مباشرة من خلال هذه الواجهة. الكود يُنفذ على خادم آمن ومعزول.
      </div>
    </div>
  );
};
