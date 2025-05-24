
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ArrowUp, ArrowDown, Send, Phone, Video, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAutoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-slate-950 to-purple-950/90 rounded-lg shadow-xl">
      {/* Enhanced mobile chat header */}
      <div className={`${isMobile ? 'p-4' : 'p-4'} border-b border-white/10 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-md shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className={`${isMobile ? 'h-12 w-12 mr-3' : 'h-12 w-12 mr-3'} rounded-full bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center border-2 border-purple-500/30 shadow-lg relative`}>
              {selectedContact.avatar_url ? (
                <img src={selectedContact.avatar_url} alt={selectedContact.username} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-lg'}`}>
                  {selectedContact.username ? selectedContact.username[0].toUpperCase() : '؟'}
                </span>
              )}
              {selectedContact.isOnline && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-teal-500 border-2 border-purple-900 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-white truncate ${isMobile ? 'text-lg' : 'text-lg'}`}>{selectedContact.username}</h3>
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-teal-300`}>{selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}</p>
            </div>
          </div>
          
          {/* Enhanced call buttons for mobile */}
          <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={`rounded-full bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 border border-purple-500/20 ${isMobile ? 'h-10 w-10' : 'h-10 w-10'}`} title="مكالمة صوتية">
              <Phone className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
            <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={`rounded-full bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 border border-purple-500/20 ${isMobile ? 'h-10 w-10' : 'h-10 w-10'}`} title="مكالمة فيديو">
              <Video className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
            <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={`rounded-full bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 border border-purple-500/20 ${isMobile ? 'h-10 w-10' : 'h-10 w-10'}`} title="معلومات">
              <Info className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced navigation buttons for mobile */}
      {messages.length > 3 && (
        <div className="relative">
          {isMobile ? (
            // Mobile navigation bar
            <div className="flex justify-center gap-3 p-3 bg-purple-900/30 border-b border-white/10">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-purple-900/40 border-purple-500/30 hover:bg-purple-800/50 flex items-center gap-2 px-4 py-2"
                onClick={scrollToTop}
                title="الانتقال لأول الرسائل"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm">الأعلى</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-purple-900/40 border-purple-500/30 hover:bg-purple-800/50 flex items-center gap-2 px-4 py-2"
                onClick={scrollToBottom}
                title="الانتقال لآخر الرسائل"
              >
                <ChevronDown className="h-4 w-4" />
                <span className="text-sm">الأسفل</span>
              </Button>
            </div>
          ) : (
            // Desktop floating buttons
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed left-4 bottom-24 z-10 flex flex-col gap-2"
            >
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-purple-900/40 border-purple-500/30 hover:bg-purple-800/50 h-10 w-10 shadow-md"
                onClick={scrollToTop}
                title="الانتقال لأول الرسائل"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-purple-900/40 border-purple-500/30 hover:bg-purple-800/50 h-10 w-10 shadow-md"
                onClick={scrollToBottom}
                title="الانتقال لآخر الرسائل"
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Enhanced messages area for mobile */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea 
          className={`h-full ${isMobile ? 'px-3 py-4' : 'px-4 py-6'} overflow-y-auto bg-[linear-gradient(rgba(20,10,40,0.4),rgba(10,5,25,0.6))]`} 
          onScroll={(e) => {
            const target = e.currentTarget;
            const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
            setIsAutoScroll(isScrolledNearBottom);
          }}
        >
          <div className={`space-y-4 min-h-full ${isMobile ? 'pb-2' : 'pb-2'}`}>
            <div ref={messagesStartRef} />
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`h-full flex items-center justify-center ${isMobile ? 'py-12' : 'py-20'}`}
              >
                <div className={`text-center bg-purple-900/20 backdrop-blur-sm ${isMobile ? 'p-6' : 'p-8'} rounded-xl border border-purple-500/20 shadow-lg max-w-sm mx-auto`}>
                  <MessageSquare className={`${isMobile ? 'h-14 w-14' : 'h-16 w-16'} text-purple-500/40 mx-auto mb-4`} />
                  <p className={`text-white/80 ${isMobile ? 'text-lg' : 'text-lg'} mb-2 font-medium`}>ابدأ المحادثة مع {selectedContact.username}</p>
                  <p className={`text-purple-300/60 ${isMobile ? 'text-sm' : 'text-sm'}`}>أرسل رسالة للبدء في التواصل</p>
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

      {/* Enhanced message input for mobile */}
      <div className={`${isMobile ? 'p-4' : 'p-4'} border-t border-white/10 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-md`}>
        <form onSubmit={handleSendMessage} className={`flex items-end ${isMobile ? 'gap-3' : 'gap-3'}`}>
          <Input
            placeholder="اكتب رسالة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`flex-1 bg-purple-800/30 border-purple-700/30 text-white rounded-2xl ${isMobile ? 'px-4 py-4 text-base min-h-[48px]' : 'px-6 py-6'} focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner resize-none`}
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
            className={`bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 rounded-full ${isMobile ? 'h-12 w-12 min-w-[48px]' : 'h-12 w-12'} flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shrink-0`}
          >
            {isMessageSending ? (
              <div className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'} border-2 border-t-transparent border-white rounded-full animate-spin`} />
            ) : (
              <Send className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
