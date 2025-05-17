
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
  // تنسيق التاريخ والوقت
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {/* صورة المرسل (تظهر فقط للرسائل المستلمة) */}
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
          {contact?.avatar_url ? (
            <AvatarImage src={contact.avatar_url} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
              {contact?.username?.[0] || '؟'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      
      {/* محتوى الرسالة */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs text-white/70 mb-1 mr-1">
            {contact?.username || 'مستخدم'}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-lg max-w-[75%] ${
            isCurrentUser
              ? 'rounded-br-none messenger-gradient text-white'
              : 'bg-gray-200 dark:bg-gray-700 dark:text-white text-black rounded-bl-none'
          }`}
        >
          {message.message_text}
        </div>
        <span className="text-xs text-white/50 mt-1 mx-1">
          {formatMessageTime(message.created_at)}
        </span>
      </div>
      
      {/* صورة المستخدم (تظهر فقط للرسائل المرسلة) */}
      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
          {user?.avatar_url ? (
            <AvatarImage src={user.avatar_url} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
              {user?.username?.[0] || '؟'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
