
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactCardProps {
  contact: any;
  isSelected: boolean;
  onClick: () => void;
}

const ContactCard = ({ contact, isSelected, onClick }: ContactCardProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-lg transition-all ${
      isSelected
        ? 'bg-indigo-600/20 border border-indigo-500/40'
        : 'hover:bg-indigo-900/20 border border-transparent'
    }`}
  >
    <div className="relative">
      <Avatar className="h-12 w-12 ml-3 border-2 border-slate-700/40">
        {contact.avatar_url ? (
          <AvatarImage src={contact.avatar_url} />
        ) : (
          <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-lg">
            {contact.username[0]}
          </AvatarFallback>
        )}
      </Avatar>
      
      {/* Online status indicator */}
      <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
        contact.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
      }`} />
    </div>
    
    <div className="truncate text-right flex flex-col flex-1">
      <div className="font-medium text-white text-sm">{contact.username}</div>
      <div className="text-xs text-white/50 truncate max-w-[180px]">
        {new Date(contact.lastActivity).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </div>
    </div>
  </motion.button>
);

export default ContactCard;
