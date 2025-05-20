
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  
  // المساعدة في التمرير التلقائي عند تحميل المكون
  useEffect(() => {
    if (isAutoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  return (
    <div className="flex-1 h-full w-full bg-gradient-to-br from-slate-950 to-purple-950/90 flex flex-col overflow-hidden relative rounded-lg shadow-lg">
      {/* Chat header */}
      <div className="p-3 border-b border-white/10 bg-purple-900/40 flex items-center justify-between shadow-md backdrop-blur-md">
        <div className="flex items-center">
          <div className="h-10 w-10 mr-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center border-2 border-purple-500/30">
            {selectedContact.avatar_url ? (
              <img src={selectedContact.avatar_url} alt={selectedContact.username} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold">
                {selectedContact.username ? selectedContact.username[0].toUpperCase() : '?'}
              </span>
            )}
            {selectedContact.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-teal-500 border-2 border-purple-900 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-white text-lg">{selectedContact.username}</h3>
            <p className="text-xs text-teal-300">{selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}</p>
          </div>
        </div>
        
        {/* Call buttons */}
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-purple-900/20 hover:bg-purple-800/40 text-purple-300" title="مكالمة صوتية">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-purple-900/20 hover:bg-purple-800/40 text-purple-300" title="مكالمة فيديو">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-purple-900/20 hover:bg-purple-800/40 text-purple-300" title="معلومات">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation buttons */}
      {messages.length > 5 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed left-4 bottom-24 z-10 flex flex-col gap-2"
        >
          <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full bg-purple-900/40 border-purple-500/30 hover:bg-purple-800/50 h-8 w-8 shadow-md"
            onClick={scrollToTop}
            title="التنقل لأول الرسائل"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full bg-purple-900/40 border-purple-500/30 hover:bg-purple-800/50 h-8 w-8 shadow-md"
            onClick={scrollToBottom}
            title="التنقل لآخر الرسائل"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Messages area with improved scrolling */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea 
          className="h-full px-4 py-6 overflow-y-auto bg-[linear-gradient(rgba(30,10,60,0.4),rgba(20,10,40,0.6))]" 
          onScroll={(e) => {
            const target = e.currentTarget;
            const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
            setIsAutoScroll(isScrolledNearBottom);
          }}
        >
          <div className="space-y-2 min-h-full pb-2">
            <div ref={messagesStartRef} />
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex items-center justify-center py-20"
              >
                <div className="text-center bg-purple-900/20 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20">
                  <MessageSquare className="h-16 w-16 text-purple-500/40 mx-auto mb-4" />
                  <p className="text-white/80 text-lg mb-2">ابدأ المحادثة مع {selectedContact.username}</p>
                  <p className="text-purple-300/60 text-sm">أرسل رسالة للبدء في التواصل</p>
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
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-white/10 bg-purple-900/40 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="اكتب رسالة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-purple-800/20 border-purple-700/30 text-white rounded-full px-4 py-6 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
            className="bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 rounded-full h-12 w-12 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMessageSending ? (
              <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
