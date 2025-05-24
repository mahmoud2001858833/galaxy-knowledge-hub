
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
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isMobile ? 'mb-4' : 'mb-6'} w-full`}
    >
      {/* Enhanced sender avatar for mobile */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-10 w-10'} border-2 border-purple-700/40 shadow-lg`}>
            {contact?.avatar_url ? (
              <AvatarImage src={contact.avatar_url} alt={contact?.username || 'مستخدم'} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-violet-800 text-white text-sm font-bold">
                {contact?.username ? contact.username[0].toUpperCase() : '؟'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
      
      {/* Enhanced message content for mobile */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} ${isMobile ? 'max-w-[80%]' : 'max-w-[75%]'}`}>
        {!isCurrentUser && (
          <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-white/80 mb-2 font-medium px-2`}>
            {contact?.username || 'مستخدم'}
          </span>
        )}
        <div
          className={`${isMobile ? 'px-4 py-3 text-base leading-relaxed' : 'px-6 py-4'} rounded-2xl shadow-lg ${
            isCurrentUser
              ? 'rounded-br-md bg-gradient-to-r from-teal-600 to-cyan-700 text-white'
              : 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-bl-md'
          } break-words max-w-full`}
        >
          <span className={isMobile ? 'text-base' : ''}>{message.message_text}</span>
        </div>
        <div className={`flex items-center ${isMobile ? 'mt-2' : 'mt-2'} mx-2 gap-1`}>
          <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-white/60 font-medium`}>
            {formatMessageTime(message.created_at)}
          </span>
          {isCurrentUser && (
            <div className="flex items-center ml-1">
              <Check className={`${isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3'} text-emerald-400`} />
              <Check className={`${isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3'} text-emerald-400 -ml-1.5`} />
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced current user avatar for mobile */}
      {isCurrentUser && (
        <div className="flex-shrink-0 ml-3">
          <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-10 w-10'} border-2 border-teal-700/40 shadow-lg`}>
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user?.username || 'أنت'} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-teal-600 to-cyan-800 text-white text-sm font-bold">
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
