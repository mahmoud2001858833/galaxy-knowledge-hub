
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
          {contact?.avatar_url ? (
            <AvatarImage src={contact.avatar_url} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
              {contact?.username?.[0] || '?'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm max-w-[75%] ${
            isCurrentUser
              ? 'bg-messenger-blue text-white rounded-tr-none'
              : 'bg-gray-200 dark:bg-gray-700 dark:text-white text-black rounded-tl-none'
          }`}
          style={isCurrentUser ? 
            { background: 'linear-gradient(135deg, #00B2FF 0%, #006AFF 100%)' } : 
            {} 
          }
        >
          {message.message_text}
        </div>
        <span className="text-xs text-white/40 mt-1 mx-1">
          {new Date(message.created_at).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
              {user?.username?.[0] || '?'}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
