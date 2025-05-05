
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

const BiologyScientists = () => {
  const scientists: Scientist[] = [
    {
      id: 1,
      name: "تشارلز داروين",
      birthYear: "1809",
      deathYear: "1882",
      contribution: "نظرية التطور",
      description: "عالم طبيعة إنجليزي، اشتهر بنظرية التطور عن طريق الانتقاء الطبيعي، التي أصبحت الركيزة الأساسية لعلم الأحياء الحديث.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 2,
      name: "لويس باستور",
      birthYear: "1822",
      deathYear: "1895",
      contribution: "علم الأحياء الدقيقة واللقاحات",
      description: "عالم فرنسي قدم إسهامات كبيرة في مجال الكيمياء والأحياء المجهرية. اشتهر باكتشافاته في مجال اللقاحات والبسترة ومبدأ التخمر.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 3,
      name: "جريجور مندل",
      birthYear: "1822",
      deathYear: "1884",
      contribution: "علم الوراثة",
      description: "راهب وعالم نمساوي، يُعتبر مؤسس علم الوراثة الحديث. اكتشف القوانين الأساسية للوراثة من خلال تجاربه على نبات البازلاء.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 4,
      name: "روبرت كوخ",
      birthYear: "1843",
      deathYear: "1910",
      contribution: "بكتريولوجيا وعلم الأمراض المعدية",
      description: "طبيب ألماني، أسس علم البكتيريا وطور طرق المختبرات الحديثة. اكتشف بكتيريا السل والجمرة الخبيثة والكوليرا.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 5,
      name: "روزاليند فرانكلين",
      birthYear: "1920",
      deathYear: "1958",
      contribution: "بنية الحمض النووي DNA",
      description: "عالمة بريطانية ساهمت بشكل كبير في فهم بنية الحمض النووي DNA من خلال أشعة X للانعراج البلوري.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 6,
      name: "جيمس واتسون",
      birthYear: "1928",
      deathYear: "حي",
      contribution: "تركيب الحمض النووي DNA",
      description: "عالم أمريكي معروف باكتشافه مع فرانسيس كريك للبنية الحلزونية المزدوجة للحمض النووي DNA، ما أحدث ثورة في علم الأحياء الجزيئي.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 7,
      name: "جين جوديل",
      birthYear: "1934",
      deathYear: "حية",
      contribution: "دراسات الشمبانزي وعلم الرئيسيات",
      description: "عالمة بريطانية متخصصة في دراسة سلوك الشمبانزي. قدمت إسهامات كبيرة في فهم سلوك الرئيسيات والحفاظ على الحياة البرية.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    },
    {
      id: 8,
      name: "ألكسندر فلمنج",
      birthYear: "1881",
      deathYear: "1955",
      contribution: "اكتشاف البنسلين",
      description: "طبيب وعالم أحياء دقيقة اسكتلندي، اشتهر باكتشافه للبنسلين، وهو أول مضاد حيوي في العالم، مما أنقذ ملايين الأرواح.",
      imageUrl: "https://images.for9a.com/thumb/max-800-auto-100-webp/ol/blog/2019/05/27/638x400-71538985491phpKctLgx.jpeg"
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-glow-green mb-2">علماء الأحياء</h2>
        <p className="text-white/70">تعرف على أبرز العلماء الذين غيروا وجه علم الأحياء عبر التاريخ</p>
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
            <Card className="h-full overflow-hidden glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
                <img 
                  src={scientist.imageUrl} 
                  alt={scientist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 relative">
                <div className="absolute -top-10 right-4 bg-subject-biology-primary text-white text-sm py-1 px-3 rounded-full z-20">
                  {scientist.birthYear} - {scientist.deathYear}
                </div>
                <h3 className="text-xl font-bold mb-1 text-subject-biology-primary">
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

export default BiologyScientists;
