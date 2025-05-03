
import React from 'react';
import { motion } from 'framer-motion';

const mathematicians = [
  { 
    id: 1,
    name: "الخوارزمي",
    description: "مؤسس علم الجبر وصاحب كتاب الجبر والمقابلة، أحد أهم العلماء المسلمين في القرون الوسطى",
    achievements: ["تأسيس علم الجبر", "تطوير علم الحساب", "إدخال نظام الأرقام الهندي العربي"]
  },
  { 
    id: 2, 
    name: "إسحاق نيوتن", 
    description: "عالم رياضيات وفيزيائي إنجليزي، اشتهر بوضع قوانين الحركة والجاذبية",
    achievements: ["حساب التفاضل والتكامل", "قوانين الحركة", "نظرية الجاذبية العامة"] 
  },
  { 
    id: 3, 
    name: "ليونارد أويلر", 
    description: "عالم رياضيات سويسري، قدم مساهمات مهمة في علوم الرياضيات المختلفة",
    achievements: ["دالة أويلر", "رمز باي (π)", "حل مشكلة الجسور السبعة"] 
  },
  { 
    id: 4, 
    name: "كارل فريدريش غاوس", 
    description: "عالم رياضيات ألماني لقب بأمير الرياضيات، له إسهامات كبيرة في نظرية الأعداد",
    achievements: ["نظرية الأعداد", "الهندسة الإقليدية", "الإحصاء"] 
  },
  { 
    id: 5, 
    name: "أرخميدس", 
    description: "عالم رياضيات وفيزيائي ومهندس يوناني، من أهم علماء الرياضيات في العصر القديم",
    achievements: ["حساب قيمة باي تقريبا", "مبدأ الطفو", "مبدأ الرافعة"] 
  },
  { 
    id: 6, 
    name: "خيام نيسابوري", 
    description: "عالم رياضيات وفلكي وشاعر فارسي، اشتهر بحل المعادلات التربيعية والتكعيبية",
    achievements: ["حل المعادلات التكعيبية", "إصلاح التقويم الفارسي", "الشعر والفلسفة"] 
  },
  { 
    id: 7, 
    name: "أبو الوفاء البوزجاني", 
    description: "عالم رياضيات وفلكي عربي، طور علم المثلثات وأدخل مفاهيم جديدة",
    achievements: ["تطوير علم المثلثات", "حساب جيب التمام وظل التمام", "نظريات هندسية"] 
  },
  { 
    id: 8, 
    name: "مريم ميرزاخاني", 
    description: "أول امرأة تحصل على ميدالية فيلدز، أهم جائزة في الرياضيات",
    achievements: ["نظرية الأسطح الهندسية", "ديناميكا الفضاءات المعقدة", "جائزة فيلدز 2014"] 
  },
  { 
    id: 9, 
    name: "إيمي نوثر", 
    description: "عالمة رياضيات ألمانية وُصفت بأنها أهم امرأة في تاريخ الرياضيات",
    achievements: ["نظرية نوثر", "الجبر المجرد", "نظرية الحلقات"] 
  }
];

const MathematiciansGallery = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="w-12 h-1 bg-space-neon-blue/50 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">علماء الرياضيات</h2>
        <div className="w-12 h-1 bg-space-neon-blue/50 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
        {mathematicians.map((mathematician) => (
          <motion.div 
            key={mathematician.id}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-space-neon-blue/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: mathematician.id * 0.1 }}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src="https://www.edutrapedia.com/resources/thumbs/article_photos/Noj7cPv62g-571.jpg_729x410.jpg" 
                alt={mathematician.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-2">{mathematician.name}</h3>
              <p className="text-white/70 mb-4 text-sm">{mathematician.description}</p>
              
              <div className="space-y-1">
                <h4 className="text-space-neon-blue text-sm font-medium mb-1">أهم الإنجازات:</h4>
                <ul className="list-disc list-inside marker:text-space-neon-blue space-y-1">
                  {mathematician.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-white/80 text-sm">{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MathematiciansGallery;
