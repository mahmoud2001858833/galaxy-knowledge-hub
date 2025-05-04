
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const scientists = [
  {
    name: "جابر بن حيّان",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Jabir_ibn_Hayyan.jpg/440px-Jabir_ibn_Hayyan.jpg",
    era: "721-815",
    contributions: "مؤسس الكيمياء العربية. اشتهر باكتشافاته في التقطير والتبلور والتنقية. طور أدوات مثل الأنبيق."
  },
  {
    name: "أنطوان لافوازييه",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Antoine_lavoisier_color.jpg/440px-Antoine_lavoisier_color.jpg",
    era: "1743-1794",
    contributions: "أبو الكيمياء الحديثة. صاغ قانون حفظ المادة وساهم في فهم الاحتراق والتنفس."
  },
  {
    name: "ماري كوري",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/440px-Marie_Curie_c1920.jpg",
    era: "1867-1934",
    contributions: "اكتشفت عنصري البولونيوم والراديوم وطورت نظرية النشاط الإشعاعي. أول شخص يحصل على جائزتي نوبل في مجالين مختلفين."
  },
  {
    name: "ديمتري مندليف",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/DIMendeleevCab.jpg/440px-DIMendeleevCab.jpg",
    era: "1834-1907",
    contributions: "مبتكر الجدول الدوري للعناصر. تنبأ بوجود عناصر لم تكن معروفة بعد وبخصائصها."
  },
  {
    name: "لينوس باولنج",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Linus_Pauling_1962.jpg/440px-Linus_Pauling_1962.jpg",
    era: "1901-1994",
    contributions: "رائد في فهم الرابطة الكيميائية. حاصل على جائزتي نوبل: في الكيمياء والسلام."
  },
  {
    name: "روزالند فرانكلين",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Rosalind_Franklin.jpg/440px-Rosalind_Franklin.jpg",
    era: "1920-1958",
    contributions: "ساهمت بشكل كبير في فهم بنية الحمض النووي DNA من خلال تصوير الأشعة السينية."
  },
  {
    name: "ألفرد نوبل",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Alfred_Nobel3.jpg/440px-Alfred_Nobel3.jpg",
    era: "1833-1896",
    contributions: "اخترع الديناميت والعديد من المتفجرات. أسس جوائز نوبل، بما في ذلك جائزة نوبل في الكيمياء."
  },
  {
    name: "دوروثي هودجكين",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Hodgkin.jpeg/440px-Hodgkin.jpeg",
    era: "1910-1994",
    contributions: "رائدة في تقنية التبلور بالأشعة السينية. حددت بنية البنسلين والإنسولين وفيتامين B12."
  },
  {
    name: "عمر الخيام",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Omar_Khayyam2.JPG",
    era: "1048-1131",
    contributions: "إلى جانب كونه شاعرًا ورياضيًا، ساهم في علم الكيمياء القديمة وفي تطوير الشعر الفارسي."
  }
];

const ChemistryScientists = () => {
  return (
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-cyan-400 mb-6 text-center"
      >
        علماء الكيمياء
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scientists.map((scientist, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="h-full overflow-hidden border-cyan-800/20 bg-blue-950/30 hover:border-cyan-700/40 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-400 text-xl">{scientist.name}</CardTitle>
                <span className="text-white/60 text-sm">{scientist.era}</span>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="aspect-[4/3] mb-4 overflow-hidden rounded-md">
                  <img 
                    src={scientist.image} 
                    alt={scientist.name} 
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <p className="text-white/80 text-sm">{scientist.contributions}</p>
              </CardContent>
              <CardFooter>
                <div className="w-full text-center">
                  <span className="inline-block px-3 py-1 text-xs bg-blue-900/40 text-cyan-300 rounded-full">
                    عالم كيمياء
                  </span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChemistryScientists;
