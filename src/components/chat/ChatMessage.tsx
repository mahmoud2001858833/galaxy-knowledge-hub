
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMessageProps {
  message: any;
  isCurrentUser: boolean;
  contact: any;
  user: any;
}

const ChatMessage = ({ message, isCurrentUser, contact, user }: ChatMessageProps) => {
  const isMobile = useIsMobile();
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const messageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={messageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isMobile ? 'mb-3' : 'mb-4'} w-full px-2`}
    >
      {/* Enhanced sender avatar */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} border-2 border-emerald-500/40 shadow-lg`}>
            {contact?.avatar_url ? (
              <AvatarImage src={contact.avatar_url} alt={contact?.username || 'مستخدم'} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold">
                {contact?.username ? contact.username[0].toUpperCase() : '؟'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
      
      {/* Enhanced message content */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} ${isMobile ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
        {!isCurrentUser && (
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-emerald-300 mb-1 font-medium px-2`}>
            {contact?.username || 'مستخدم'}
          </span>
        )}
        <div
          className={`${isMobile ? 'px-3 py-2.5 text-sm leading-relaxed' : 'px-4 py-3'} rounded-2xl shadow-lg backdrop-blur-sm ${
            isCurrentUser
              ? 'rounded-br-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-400/30'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-bl-md border border-emerald-400/30'
          } break-words max-w-full transition-all duration-200 hover:shadow-xl`}
        >
          <span className={isMobile ? 'text-sm' : 'text-base'}>{message.message_text}</span>
        </div>
        <div className={`flex items-center ${isMobile ? 'mt-1' : 'mt-2'} mx-2 gap-1`}>
          <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 font-medium`}>
            {formatMessageTime(message.created_at)}
          </span>
          {isCurrentUser && (
            <div className="flex items-center ml-1">
              <Check className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} text-blue-400`} />
              <Check className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} text-blue-400 -ml-1.5`} />
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced current user avatar */}
      {isCurrentUser && (
        <div className="flex-shrink-0 ml-3">
          <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} border-2 border-blue-500/40 shadow-lg`}>
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user?.username || 'أنت'} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold">
                {user?.username ? user.username[0].toUpperCase() : 'أنت'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
