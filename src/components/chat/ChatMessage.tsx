
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check } from 'lucide-react';

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

  // Animation variants
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
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-6 w-full`}
    >
      {/* Sender avatar (only for received messages) */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <Avatar className="h-10 w-10 border-2 border-purple-700/40 shadow-lg">
            {contact?.avatar_url ? (
              <AvatarImage src={contact.avatar_url} alt={contact?.username || 'مستخدم'} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-violet-800 text-white">
                {contact?.username ? contact.username[0].toUpperCase() : '؟'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
      
      {/* Message content */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {!isCurrentUser && (
          <span className="text-sm text-white/80 mb-1 font-medium px-2">
            {contact?.username || 'مستخدم'}
          </span>
        )}
        <div
          className={`px-6 py-4 rounded-2xl shadow-lg ${
            isCurrentUser
              ? 'rounded-br-none bg-gradient-to-r from-teal-600 to-cyan-700 text-white'
              : 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-bl-none'
          } break-words`}
        >
          {message.message_text}
        </div>
        <div className="flex items-center mt-2 mx-2 gap-1">
          <span className="text-xs text-white/60">
            {formatMessageTime(message.created_at)}
          </span>
          {isCurrentUser && (
            <div className="flex items-center">
              <Check className="h-3 w-3 text-emerald-400" />
              <Check className="h-3 w-3 text-emerald-400 -ml-1.5" />
            </div>
          )}
        </div>
      </div>
      
      {/* Current user avatar (only for sent messages) */}
      {isCurrentUser && (
        <div className="flex-shrink-0 ml-3">
          <Avatar className="h-10 w-10 border-2 border-teal-700/40 shadow-lg">
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user?.username || 'أنت'} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-teal-600 to-cyan-800 text-white">
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
