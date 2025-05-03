
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Mathematician {
  id: string;
  name: string;
  arabicName: string;
  years: string;
  description: string;
  contributions: string[];
  imageUrl: string;
}

const mathematicians: Mathematician[] = [
  {
    id: '1',
    name: 'Pythagoras',
    arabicName: 'فيثاغورس',
    years: '570-495 BCE',
    description: 'فيلسوف وعالم رياضيات إغريقي، اشتهر بنظرية فيثاغورس في الهندسة والتي تنص على أن مربع طول الوتر في المثلث القائم الزاوية يساوي مجموع مربعي طولي الضلعين الآخرين.',
    contributions: [
      'نظرية فيثاغورس',
      'النسب الموسيقية الرياضية',
      'الأعداد المثلثية'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1599508704512-4a91fd9fe86e?q=80&w=1935&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Carl Friedrich Gauss',
    arabicName: 'كارل فريدريش غاوس',
    years: '1777-1855',
    description: 'غاوس، الملقب بـ "أمير الرياضيات"، كان عالم رياضيات وفيزيائي ألماني قدم مساهمات مهمة في العديد من المجالات بما في ذلك نظرية الأعداد والإحصاء والتحليل الرياضي والهندسة التفاضلية والجيوديسيا والكهرومغناطيسية وعلم البصريات وعلم الفلك.',
    contributions: [
      'نظرية الأعداد',
      'الهندسة غير الإقليدية',
      'طريقة المربعات الصغرى',
      'نظرية الاحتمالات'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Leonhard Euler',
    arabicName: 'ليونهارد أويلر',
    years: '1707-1783',
    description: 'أويلر كان عالم رياضيات وفيزيائي سويسري قدم مساهمات مهمة في مجالات متنوعة في الرياضيات مثل حساب التفاضل والتكامل ونظرية الرسوم البيانية. يعتبر أحد أكثر علماء الرياضيات إنتاجاً في التاريخ.',
    contributions: [
      'صيغة أويلر: e^(iπ) + 1 = 0',
      'نظرية الرسوم البيانية',
      'حساب التفاضل والتكامل',
      'نظرية الأعداد'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1635070037426-ec63a4db1913?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Isaac Newton',
    arabicName: 'إسحاق نيوتن',
    years: '1643-1727',
    description: 'نيوتن كان عالم رياضيات وفيزيائي وفلكي إنجليزي، يُعتبر أحد أهم العلماء في تاريخ البشرية. اشتهر بصياغته لقوانين الحركة وقانون الجاذبية العام، وكان له إسهامات مهمة في حساب التفاضل والتكامل.',
    contributions: [
      'حساب التفاضل والتكامل',
      'ميكانيكا نيوتن',
      'قانون الجذب العام',
      'نظرية الضوء واللون'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1624853287784-9077848d2a7d?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Al-Khwarizmi',
    arabicName: 'محمد بن موسى الخوارزمي',
    years: 'c. 780-850',
    description: 'الخوارزمي، عالم رياضيات وفلك وجغرافيا من العصر الذهبي للإسلام، يعتبر مؤسس علم الجبر. اشتقت كلمة "الجبر" من عنوان كتابه، واشتقت كلمة "algorithm" (خوارزمية) من اسمه.',
    contributions: [
      'تأسيس علم الجبر',
      'إدخال الأرقام الهندية-العربية إلى العالم الغربي',
      'تطوير مفهوم اللوغاريتمات',
      'تطوير علم المثلثات'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1644999743640-ddf1359e1fe9?q=80&w=1935&auto=format&fit=crop',
  },
  {
    id: '6',
    name: 'Emmy Noether',
    arabicName: 'إيمي نويثر',
    years: '1882-1935',
    description: 'نويثر كانت عالمة رياضيات ألمانية قدمت مساهمات أساسية في مجالات الجبر المجرد ونظرية الزمر والفيزياء النظرية. اعتبرها أينشتاين "أهم عالمة رياضيات في تاريخ تطور الجبر العالي".',
    contributions: [
      'نظرية نويثر',
      'الجبر المجرد',
      'نظرية الزمر',
      'الفيزياء النظرية'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1513745405033-9b7a0cb2b4d9?q=80&w=1965&auto=format&fit=crop',
  },
];

const MathematiciansGallery: React.FC = () => {
  const [selectedMathematician, setSelectedMathematician] = useState<Mathematician | null>(null);
  
  const handleCardClick = (mathematician: Mathematician) => {
    setSelectedMathematician(mathematician);
  };
  
  const closeDetails = () => {
    setSelectedMathematician(null);
  };
  
  const renderMathematicianCards = () => {
    return mathematicians.map((mathematician, index) => (
      <motion.div
        key={mathematician.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
        onClick={() => handleCardClick(mathematician)}
      >
        <div className="relative overflow-hidden rounded-2xl cursor-pointer hover-glow">
          {/* Dimmed background image */}
          <div className="h-64 bg-space-cosmic-black relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"
              style={{ backgroundImage: `url(${mathematician.imageUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-space-cosmic-black via-transparent to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <h3 className="text-xl font-bold text-white mb-1 text-right">
              {mathematician.arabicName}
            </h3>
            <h4 className="text-space-neon-blue text-sm mb-2 text-right">
              {mathematician.name}
            </h4>
            <p className="text-white/70 text-sm text-right">
              {mathematician.years}
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white/80 text-xs bg-white/10 px-3 py-1 rounded-full">
                اضغط للتفاصيل
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    ));
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-right">علماء الرياضيات</h2>
      
      {selectedMathematician ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="relative h-64 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedMathematician.imageUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-space-cosmic-black/80"></div>
            
            <button
              className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm"
              onClick={closeDetails}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="absolute bottom-4 right-4 text-right">
              <h1 className="text-3xl font-bold text-white mb-1">
                {selectedMathematician.arabicName}
              </h1>
              <h2 className="text-space-neon-blue font-medium">
                {selectedMathematician.name} | {selectedMathematician.years}
              </h2>
            </div>
          </div>
          
          <div className="p-6 text-right">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">نبذة تعريفية</h3>
              <p className="text-white/80 leading-relaxed">
                {selectedMathematician.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">أهم المساهمات</h3>
              <ul className="list-disc list-inside space-y-1 text-white/80">
                {selectedMathematician.contributions.map((contribution, index) => (
                  <li key={index}>{contribution}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMathematicianCards()}
        </div>
      )}
    </div>
  );
};

export default MathematiciansGallery;
