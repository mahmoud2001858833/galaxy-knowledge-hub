
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ArrowUp, ArrowDown, Send } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  selectedContact: any;
  messages: any[];
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isMessageSending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesStartRef: React.RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  scrollToTop: () => void;
  isAutoScroll: boolean;
  setIsAutoScroll: (isAutoScroll: boolean) => void;
  user: any;
}

const ChatInterface = ({
  selectedContact,
  messages,
  message,
  setMessage,
  handleSendMessage,
  isMessageSending,
  messagesEndRef,
  messagesStartRef,
  scrollToBottom,
  scrollToTop,
  isAutoScroll,
  setIsAutoScroll,
  user
}: ChatInterfaceProps) => {
  return (
    <div className="flex-1 bg-gradient-to-br from-blue-950/60 to-purple-950/60 backdrop-blur-md flex flex-col overflow-hidden relative">
      {/* Chat header */}
      <div className="p-3 border-b border-white/10 bg-blue-900/30 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 border-2 border-blue-500/30">
            {selectedContact.avatar_url ? (
              <AvatarImage src={selectedContact.avatar_url} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
                {selectedContact.username[0]}
              </AvatarFallback>
            )}
            {selectedContact.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900" />
            )}
          </Avatar>
          <div>
            <h3 className="font-medium text-white">{selectedContact.username}</h3>
            <p className="text-xs text-blue-300">{selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}</p>
          </div>
        </div>
      </div>

      {/* Navigation arrows for messages */}
      <div className="fixed left-4 bottom-24 z-10 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="outline" 
          className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50 h-8 w-8"
          onClick={scrollToTop}
          title="التنقل لأول الرسائل"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="outline" 
          className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50 h-8 w-8"
          onClick={scrollToBottom}
          title="التنقل لآخر الرسائل"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea 
        className="flex-1 px-4 py-6 overflow-y-auto" 
        onScroll={(e) => {
          const target = e.currentTarget;
          const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
          setIsAutoScroll(isScrolledNearBottom);
        }}
      >
        <div className="space-y-2 min-h-full">
          <div ref={messagesStartRef} />
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center py-10">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-blue-500/40 mx-auto mb-2" />
                <p className="text-white/50">ابدأ المحادثة مع {selectedContact.username}</p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map(message => (
                <ChatMessage 
                  key={message.id}
                  message={message}
                  isCurrentUser={message.sender_id === user?.id}
                  contact={selectedContact}
                  user={user}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-3 border-t border-white/10 bg-blue-900/30">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="اكتب رسالة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-blue-800/20 border-blue-700/30 text-white rounded-full px-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isMessageSending}
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 flex items-center justify-center shadow-md"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
