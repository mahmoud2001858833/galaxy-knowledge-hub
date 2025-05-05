
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface Scientist {
  id: number;
  name: string;
  birthYear: string;
  deathYear: string;
  contribution: string;
  description: string;
  imageUrl: string;
}

const PhysicsScientists = () => {
  const scientists: Scientist[] = [
    {
      id: 1,
      name: "ألبرت أينشتاين",
      birthYear: "1879",
      deathYear: "1955",
      contribution: "النظرية النسبية",
      description: "فيزيائي نظري ألماني المولد، اشتهر بتطوير النظرية النسبية، وهي إحدى الركائز الأساسية للفيزياء الحديثة. كما ساهم في تطوير ميكانيكا الكم والإحصاء الميكانيكي والكونيات.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 2,
      name: "إسحاق نيوتن",
      birthYear: "1643",
      deathYear: "1727",
      contribution: "قوانين الحركة والجاذبية",
      description: "فيزيائي ورياضي إنجليزي اشتهر بقوانين الحركة وقانون الجذب العام. تعتبر أعماله حجر الأساس للفيزياء الكلاسيكية والميكانيكا.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 3,
      name: "نيلز بور",
      birthYear: "1885",
      deathYear: "1962",
      contribution: "نموذج الذرة",
      description: "فيزيائي دنماركي قدم نموذجاً للذرة يتضمن نظرية للإلكترونات المدارية حول النواة، وهو أحد الأسس الرئيسية لميكانيكا الكم.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 4,
      name: "ماكس بلانك",
      birthYear: "1858",
      deathYear: "1947",
      contribution: "نظرية الكم",
      description: "فيزيائي ألماني اشتهر بنظرية الكم التي تنص على أن الطاقة المنبعثة والممتصة تكون على شكل كميات منفصلة تُسمى الكوانتا.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 5,
      name: "ماري كوري",
      birthYear: "1867",
      deathYear: "1934",
      contribution: "النشاط الإشعاعي",
      description: "عالمة فيزياء وكيمياء بولندية فرنسية، اشتهرت بأبحاثها حول النشاط الإشعاعي واكتشاف عنصري البولونيوم والراديوم.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 6,
      name: "ريتشارد فاينمان",
      birthYear: "1918",
      deathYear: "1988",
      contribution: "الديناميكا الكهربائية الكمية",
      description: "فيزيائي أمريكي معروف بمساهماته في الديناميكا الكهربائية الكمية والفيزياء الجسيمية ومبادئ الميكانيكا الكمية.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 7,
      name: "ستيفن هوكينج",
      birthYear: "1942",
      deathYear: "2018",
      contribution: "الثقوب السوداء والنظريات الكونية",
      description: "عالم فيزياء نظرية بريطاني، قام بأبحاث مهمة في مجال الثقوب السوداء والنسبية العامة والكونيات.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    },
    {
      id: 8,
      name: "جيمس كلارك ماكسويل",
      birthYear: "1831",
      deathYear: "1879",
      contribution: "معادلات ماكسويل للكهرومغناطيسية",
      description: "فيزيائي اسكتلندي طوّر نظرية الكهرومغناطيسية الكلاسيكية، ووحّد الكهرباء والمغناطيسية والضوء.",
      imageUrl: "https://oktamam.com/wp-content/uploads/2023/08/1681209899php8OqvF2.jpeg.webp"
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-glow-purple mb-2">علماء الفيزياء</h2>
        <p className="text-white/70">تعرف على أبرز العلماء الذين غيروا وجه الفيزياء عبر التاريخ</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {scientists.map((scientist, index) => (
          <motion.div 
            key={scientist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className="col-span-1"
          >
            <Card className="h-full overflow-hidden glass-card border-subject-physics-primary/30 hover:shadow-glow-purple transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
                <img 
                  src={scientist.imageUrl} 
                  alt={scientist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 relative">
                <div className="absolute -top-10 right-4 bg-subject-physics-primary text-white text-sm py-1 px-3 rounded-full z-20">
                  {scientist.birthYear} - {scientist.deathYear}
                </div>
                <h3 className="text-xl font-bold mb-1 text-subject-physics-primary">
                  {scientist.name}
                </h3>
                <p className="text-white/80 text-sm mb-3">
                  {scientist.contribution}
                </p>
                <p className="text-white/70 text-sm">
                  {scientist.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PhysicsScientists;
