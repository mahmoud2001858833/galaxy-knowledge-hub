
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users } from 'lucide-react';
import PrivateChat from './PrivateChat';
import GroupChat from './GroupChat';

interface ChatTabsProps {
  user: any;
}

const ChatTabs = ({ user }: ChatTabsProps) => {
  const [activeTab, setActiveTab] = useState('private');

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-gray-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-emerald-800/50 to-teal-800/50 backdrop-blur-sm border-b border-emerald-500/20 p-4">
          <TabsList className="grid w-full grid-cols-2 bg-emerald-900/30 border border-emerald-500/30">
            <TabsTrigger 
              value="private" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-300 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              المحادثات الخاصة
            </TabsTrigger>
            <TabsTrigger 
              value="group" 
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white text-teal-300 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              المحادثات الجماعية
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="private" className="flex-1 m-0">
          <PrivateChat user={user} />
        </TabsContent>

        <TabsContent value="group" className="flex-1 m-0">
          <GroupChat user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatTabs;
