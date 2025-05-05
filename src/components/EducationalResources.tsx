
import React from 'react';
import { Book, FileImage, FilePdf, Upload, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

const EducationalResources = () => {
  return (
    <motion.div 
      className="w-full py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500">
          مصادر تعليمية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
          {/* Visual Library */}
          <Link to="/visual-library">
            <Card className="h-32 overflow-hidden relative hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500/20 to-blue-700/30 border-blue-500/20">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-4">
                <div className="flex flex-col items-center">
                  <FileImage className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="text-xl font-bold text-white">المكتبة المرئية</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Scientific Journal */}
          <Link to="/scientific-journal">
            <Card className="h-32 overflow-hidden relative hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500/20 to-purple-700/30 border-purple-500/20">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-4">
                <div className="flex flex-col items-center">
                  <FilePdf className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-xl font-bold text-white">المجلة العلمية</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Study Organization */}
          <Link to="/study-organization">
            <Card className="h-32 overflow-hidden relative hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500/20 to-green-700/30 border-green-500/20">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-4">
                <div className="flex flex-col items-center">
                  <Book className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="text-xl font-bold text-white">تنظيم الدراسة</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Chat Rooms */}
          <Link to="/chat-rooms">
            <Card className="h-32 overflow-hidden relative hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500/20 to-cyan-700/30 border-cyan-500/20">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-4">
                <div className="flex flex-col items-center">
                  <MessageSquare className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="text-xl font-bold text-white">غرف المحادثة</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationalResources;
