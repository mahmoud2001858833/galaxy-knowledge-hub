import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface Conversation {
  id: string;
  title: string;
  first_message: string;
  created_at: string;
  updated_at: string;
}

interface ConversationsGridProps {
  conversations: Conversation[];
  onConversationClick: (conversationId: string) => void;
}

export const ConversationsGrid = ({ conversations, onConversationClick }: ConversationsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {conversations.map((conversation, index) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50"
            onClick={() => onConversationClick(conversation.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-2 mb-1">
                    {conversation.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {conversation.first_message}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
