
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContactCardProps {
  contact: any;
  isSelected: boolean;
  onClick: () => void;
}

const ContactCard = ({ contact, isSelected, onClick }: ContactCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center ${isMobile ? 'p-3' : 'p-3'} rounded-xl transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-emerald-600/40 to-teal-600/40 border-2 border-emerald-500/60 shadow-lg'
          : 'hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-slate-700/30 border-2 border-transparent hover:border-emerald-500/30'
      } backdrop-blur-sm`}
    >
      <div className="relative">
        <Avatar className={`${isMobile ? 'h-12 w-12 ml-3' : 'h-12 w-12 ml-3'} border-2 border-gray-600/40 shadow-lg`}>
          {contact.avatar_url ? (
            <AvatarImage src={contact.avatar_url} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-lg font-bold text-white">
              {contact.username[0]}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Enhanced online status indicator */}
        <div className={`absolute -bottom-1 -right-1 ${isMobile ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'} rounded-full border-2 border-gray-800 ${
          contact.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
        } shadow-lg`} />
      </div>
      
      <div className="truncate text-right flex flex-col flex-1 min-w-0">
        <div className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-sm'} truncate`}>
          {contact.username}
        </div>
        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-white/60 truncate max-w-full mt-1`}>
          {contact.isOnline ? (
            <span className="text-emerald-400 font-medium">متصل الآن</span>
          ) : (
            new Date(contact.lastActivity).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          )}
        </div>
      </div>
      
      {/* Visual indicator for selected state */}
      {isSelected && (
        <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full ml-2 shadow-lg"></div>
      )}
    </motion.button>
  );
};

export default ContactCard;
