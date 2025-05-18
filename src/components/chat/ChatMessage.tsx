
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: any;
  isCurrentUser: boolean;
  contact: any;
  user: any;
}

const ChatMessage = ({ message, isCurrentUser, contact, user }: ChatMessageProps) => {
  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Animation variants for message appearance
  const messageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={messageVariants}
      transition={{ duration: 0.3 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {/* Sender avatar (only for received messages) */}
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
          {contact?.avatar_url ? (
            <AvatarImage src={contact.avatar_url} alt={contact?.username || 'مستخدم'} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
              {contact?.username ? contact.username[0].toUpperCase() : '؟'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      
      {/* Message content */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs text-white/70 mb-1 mr-1">
            {contact?.username || 'مستخدم'}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-lg max-w-[75%] ${
            isCurrentUser
              ? 'rounded-br-none bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 dark:text-white text-black rounded-bl-none'
          } break-words`}
        >
          {message.message_text}
        </div>
        <span className="text-xs text-white/50 mt-1 mx-1 dir-rtl">
          {formatMessageTime(message.created_at)}
        </span>
      </div>
      
      {/* User avatar (only for sent messages) */}
      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
          {user?.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user?.username || 'أنت'} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
              {user?.username ? user.username[0].toUpperCase() : '؟'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
