
import React, { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ArrowUp, ArrowDown, Send, Phone, Video, Info, ChevronUp, ChevronDown, Smile } from 'lucide-react';
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
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollAreaRef = useRef<any>(null);

  useEffect(() => {
    if (isAutoScroll && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isAutoScroll, scrollToBottom]);

  const handleScroll = (e: any) => {
    const target = e.currentTarget;
    const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setIsAutoScroll(isScrolledNearBottom);
    
    // Show/hide scroll buttons based on scroll position
    const shouldShowButtons = target.scrollHeight > target.clientHeight + 200;
    setShowScrollButtons(shouldShowButtons);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-lg shadow-2xl">
      {/* Enhanced chat header with new colors */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-gray-700/50 bg-gradient-to-r from-emerald-800/50 to-teal-800/50 backdrop-blur-md shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className={`${isMobile ? 'h-10 w-10 mr-3' : 'h-12 w-12 mr-3'} rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-emerald-400/30 shadow-lg relative`}>
              {selectedContact.avatar_url ? (
                <img src={selectedContact.avatar_url} alt={selectedContact.username} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  {selectedContact.username ? selectedContact.username[0].toUpperCase() : '؟'}
                </span>
              )}
              {selectedContact.isOnline && (
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-gray-900 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-white truncate ${isMobile ? 'text-sm' : 'text-lg'}`}>{selectedContact.username}</h3>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-emerald-300`}>{selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}</p>
            </div>
          </div>
          
          {/* Enhanced call buttons */}
          <div className={`flex ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={`rounded-full bg-emerald-800/30 hover:bg-emerald-700/40 text-emerald-300 border border-emerald-500/20 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} title="مكالمة صوتية">
              <Phone className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={`rounded-full bg-emerald-800/30 hover:bg-emerald-700/40 text-emerald-300 border border-emerald-500/20 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} title="مكالمة فيديو">
              <Video className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={`rounded-full bg-emerald-800/30 hover:bg-emerald-700/40 text-emerald-300 border border-emerald-500/20 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} title="معلومات">
              <Info className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced messages area with better scrolling */}
      <div className="flex-1 overflow-hidden relative">
        {/* Floating scroll navigation for mobile */}
        {isMobile && showScrollButtons && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-gray-800/80 border-gray-600/30 hover:bg-gray-700/80 backdrop-blur-sm text-white px-3 py-1 text-xs"
              onClick={scrollToTop}
              title="الانتقال لأول الرسائل"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              أعلى
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-gray-800/80 border-gray-600/30 hover:bg-gray-700/80 backdrop-blur-sm text-white px-3 py-1 text-xs"
              onClick={scrollToBottom}
              title="الانتقال لآخر الرسائل"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              أسفل
            </Button>
          </div>
        )}

        {/* Desktop floating buttons */}
        {!isMobile && showScrollButtons && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-2"
          >
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full bg-gray-800/80 border-gray-600/30 hover:bg-gray-700/80 h-10 w-10 shadow-md backdrop-blur-sm"
              onClick={scrollToTop}
              title="الانتقال لأول الرسائل"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full bg-gray-800/80 border-gray-600/30 hover:bg-gray-700/80 h-10 w-10 shadow-md backdrop-blur-sm"
              onClick={scrollToBottom}
              title="الانتقال لآخر الرسائل"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        <ScrollArea 
          ref={scrollAreaRef}
          className={`h-full ${isMobile ? 'px-2 py-3' : 'px-4 py-4'} overflow-y-auto bg-gradient-to-b from-gray-900/50 to-slate-900/70 backdrop-blur-sm`} 
          onScroll={handleScroll}
        >
          <div className={`space-y-2 min-h-full ${isMobile ? 'pb-4' : 'pb-6'}`}>
            <div ref={messagesStartRef} />
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`h-full flex items-center justify-center ${isMobile ? 'py-8' : 'py-16'}`}
              >
                <div className={`text-center bg-gray-800/40 backdrop-blur-sm ${isMobile ? 'p-4' : 'p-6'} rounded-xl border border-gray-600/30 shadow-lg max-w-sm mx-auto`}>
                  <MessageSquare className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-emerald-500/60 mx-auto mb-3`} />
                  <p className={`text-white/80 ${isMobile ? 'text-sm' : 'text-base'} mb-2 font-medium`}>ابدأ المحادثة مع {selectedContact.username}</p>
                  <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>أرسل رسالة للبدء في التواصل</p>
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

      {/* Enhanced message input with new design */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-slate-800/50 backdrop-blur-md`}>
        <form onSubmit={handleSendMessage} className={`flex items-end ${isMobile ? 'gap-2' : 'gap-3'}`}>
          <div className="flex-1">
            <Input
              placeholder="اكتب رسالة..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`bg-gray-700/50 border-gray-600/50 text-white rounded-xl ${isMobile ? 'px-3 py-3 text-sm min-h-[44px]' : 'px-4 py-3'} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner resize-none backdrop-blur-sm`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          {!isMobile && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="bg-gray-700/50 hover:bg-gray-600/50 rounded-xl h-10 w-10 shrink-0 text-gray-300"
            >
              <Smile className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isMessageSending}
            className={`bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl ${isMobile ? 'h-11 w-11 min-w-[44px]' : 'h-10 w-10'} flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shrink-0`}
          >
            {isMessageSending ? (
              <div className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} border-2 border-t-transparent border-white rounded-full animate-spin`} />
            ) : (
              <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
