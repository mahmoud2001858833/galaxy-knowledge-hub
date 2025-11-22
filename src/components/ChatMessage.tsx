import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Bot, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Source {
  bookName: string;
  subject: string;
  pageNumber?: string;
  fileUrl?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  imageUrl?: string;
  onViewSource?: (source: Source) => void;
}

export default function ChatMessage({ role, content, sources, imageUrl, onViewSource }: ChatMessageProps) {
  const isUser = role === "user";
  const { toast } = useToast();

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `educational-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "✅ تم التحميل",
        description: "تم تحميل الصورة بنجاح",
      });
    } catch (error) {
      toast({
        title: "⚠️ فشل التحميل",
        description: "حدث خطأ أثناء تحميل الصورة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-primary" : "bg-secondary"
      }`}>
        {isUser ? <User className="w-5 h-5 text-primary-foreground" /> : <Bot className="w-5 h-5 text-secondary-foreground" />}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <Card className={`${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <div className="p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
            
            {imageUrl && (
              <div className="mt-4 space-y-2">
                <img 
                  src={imageUrl} 
                  alt="Generated educational image" 
                  className="rounded-lg border-2 border-border max-w-full h-auto"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadImage}
                  className="w-full"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الصورة
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {sources && sources.length > 0 && (
          <div className="mt-2 space-y-2">
            {sources.map((source, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {source.bookName}
                  {source.pageNumber && ` - ص ${source.pageNumber}`}
                </Badge>
                {source.fileUrl && onViewSource && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewSource(source)}
                    className="h-6 px-2 text-xs"
                  >
                    <BookOpen className="w-3 h-3 ml-1" />
                    عرض المصدر
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
