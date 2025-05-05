
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const scientists = [
  {
    name: "أنطوان لافوازييه",
    years: "1743 - 1794",
    contribution: "أبو الكيمياء الحديثة، وواضع قانون حفظ المادة، طور نظرية الاحتراق وتصنيف العناصر الكيميائية.",
    discoveries: ["قانون حفظ المادة", "تفسير عملية الاحتراق", "تصنيف العناصر الكيميائية"],
    nationality: "فرنسي"
  },
  {
    name: "جون دالتون",
    years: "1766 - 1844",
    contribution: "مؤسس النظرية الذرية الحديثة، حدد مفهوم الذرات والجزيئات وقدم نموذجاً للذرة.",
    discoveries: ["النظرية الذرية", "قانون النسب المتعددة", "قانون الضغط الجزئي"],
    nationality: "بريطاني"
  },
  {
    name: "ماري كوري",
    years: "1867 - 1934",
    contribution: "اكتشفت عناصر البولونيوم والراديوم، وطورت نظرية النشاط الإشعاعي، حازت على جائزة نوبل مرتين.",
    discoveries: ["اكتشاف البولونيوم", "اكتشاف الراديوم", "نظرية النشاط الإشعاعي"],
    nationality: "بولندية-فرنسية"
  },
  {
    name: "ديميتري مندليف",
    years: "1834 - 1907",
    contribution: "مبتكر الجدول الدوري للعناصر، تنبأ بوجود عناصر جديدة وخصائصها.",
    discoveries: ["الجدول الدوري", "تنبؤات العناصر الجديدة", "قانون الدورية"],
    nationality: "روسي"
  },
  {
    name: "روبرت بويل",
    years: "1627 - 1691",
    contribution: "أحد مؤسسي الكيمياء الحديثة، صاغ قانون بويل وقدم مفهوم العناصر الكيميائية.",
    discoveries: ["قانون بويل", "تعريف العنصر الكيميائي", "تجارب الغازات"],
    nationality: "أيرلندي"
  },
  {
    name: "جابر بن حيان",
    years: "722 - 815",
    contribution: "أحد مؤسسي علم الكيمياء، طور العديد من الأدوات والمعدات المعملية، وأسس الكيمياء التجريبية.",
    discoveries: ["تقنيات التقطير", "حمض الكبريتيك", "تحضير الأحماض"],
    nationality: "عربي"
  },
];

const ChemistryScientists = () => {
  return (
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-cyan-400 mb-6 text-center text-glow-cyan"
      >
        علماء الكيمياء
      </motion.h2>
      
      <div className="mb-6 text-white/80 text-center">
        <p>استكشف إنجازات وإسهامات أبرز علماء الكيمياء عبر التاريخ</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scientists.map((scientist, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="h-full bg-blue-900/20 border-cyan-900/30 overflow-hidden shadow-glow-sm shadow-cyan-500/10">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-glow-sm shadow-cyan-500/20">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYYeicpqHLfxEoRF1mR5aUn8bda5xZKp_50w&s" 
                      alt={scientist.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <CardTitle className="text-cyan-400 text-center text-glow-cyan">{scientist.name}</CardTitle>
                <div className="flex justify-center space-x-2 space-x-reverse mt-1">
                  <Badge variant="outline" className="border-cyan-800/50 text-cyan-300">
                    {scientist.years}
                  </Badge>
                  <Badge className="bg-cyan-700/30 text-cyan-200">
                    {scientist.nationality}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-right mb-4">{scientist.contribution}</p>
                <div className="space-y-2">
                  <p className="text-cyan-400 font-semibold">أهم الاكتشافات:</p>
                  <ul className="list-disc list-inside text-white/80 pr-2 space-y-1">
                    {scientist.discoveries.map((discovery, idx) => (
                      <li key={idx}>{discovery}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300"
                  variant="ghost"
                >
                  <span>المزيد من المعلومات</span>
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChemistryScientists;
