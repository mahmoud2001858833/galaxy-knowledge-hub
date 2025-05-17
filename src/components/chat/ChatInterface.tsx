
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ArrowUp, ArrowDown, Send, Phone, Video, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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
    <div className="flex-1 bg-gradient-to-br from-blue-950/60 to-purple-950/60 backdrop-blur-md flex flex-col overflow-hidden relative border border-blue-500/20 rounded-lg shadow-lg">
      {/* رأس المحادثة */}
      <div className="p-3 border-b border-white/10 bg-blue-900/40 flex items-center justify-between shadow-md backdrop-blur-md">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 border-2 border-blue-500/30">
            {selectedContact.avatar_url ? (
              <AvatarImage src={selectedContact.avatar_url} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
                {selectedContact.username ? selectedContact.username[0].toUpperCase() : '?'}
              </AvatarFallback>
            )}
            {selectedContact.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900 animate-pulse" />
            )}
          </Avatar>
          <div>
            <h3 className="font-medium text-white">{selectedContact.username}</h3>
            <p className="text-xs text-blue-300">{selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}</p>
          </div>
        </div>
        
        {/* أزرار المكالمة والفيديو والمعلومات */}
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-blue-900/20 hover:bg-blue-800/40 text-blue-300" title="مكالمة صوتية">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-blue-900/20 hover:bg-blue-800/40 text-blue-300" title="مكالمة فيديو">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-blue-900/20 hover:bg-blue-800/40 text-blue-300" title="معلومات">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* أزرار التنقل في الرسائل */}
      {messages.length > 5 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed left-4 bottom-24 z-10 flex flex-col gap-2"
        >
          <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50 h-8 w-8 shadow-md"
            onClick={scrollToTop}
            title="التنقل لأول الرسائل"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50 h-8 w-8 shadow-md"
            onClick={scrollToBottom}
            title="التنقل لآخر الرسائل"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* منطقة الرسائل */}
      <ScrollArea 
        className="flex-1 px-4 py-6 overflow-y-auto bg-[url('/chat-pattern.png')] bg-repeat bg-opacity-5" 
        onScroll={(e) => {
          const target = e.currentTarget;
          const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
          setIsAutoScroll(isScrolledNearBottom);
        }}
      >
        <div className="space-y-2 min-h-full">
          <div ref={messagesStartRef} />
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex items-center justify-center py-20"
            >
              <div className="text-center bg-blue-900/20 backdrop-blur-sm p-8 rounded-xl border border-blue-500/20">
                <MessageSquare className="h-16 w-16 text-blue-500/40 mx-auto mb-4" />
                <p className="text-white/80 text-lg mb-2">ابدأ المحادثة مع {selectedContact.username}</p>
                <p className="text-blue-300/60 text-sm">أرسل رسالة للبدء في التواصل</p>
              </div>
            </motion.div>
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

      {/* إدخال الرسائل */}
      <div className="p-3 border-t border-white/10 bg-blue-900/40 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="اكتب رسالة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-blue-800/20 border-blue-700/30 text-white rounded-full px-4 py-6 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
