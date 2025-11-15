import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  onViewSource?: (source: Source) => void;
}

export default function ChatMessage({ role, content, sources, onViewSource }: ChatMessageProps) {
  const isUser = role === "user";

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
