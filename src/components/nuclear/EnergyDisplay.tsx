import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

export const EnergyDisplay = () => {
  const comparisons = [
    {
      title: 'الانشطار النووي',
      color: 'from-green-500 to-emerald-500',
      energy: '200 MeV',
      example: '1 كجم يورانيوم = 2.7 مليون كجم فحم',
      icon: '⚛️'
    },
    {
      title: 'الاندماج النووي',
      color: 'from-purple-500 to-blue-500',
      energy: '17.6 MeV',
      example: '1 كجم ديوتيريوم = 8 مليون كجم بترول',
      icon: '⭐'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          مقارنة الطاقة المنطلقة
        </h3>
        <p className="text-sm text-muted-foreground">
          التفاعلات النووية تطلق طاقة هائلة مقارنة بالتفاعلات الكيميائية
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparisons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur p-6"
          >
            {/* خلفية متدرجة */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
            
            <div className="relative">
              <div className="text-4xl mb-3">{item.icon}</div>
              
              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
              
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">طاقة لكل تفاعل</div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.energy}
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">مثال توضيحي</div>
                  <div className="text-sm font-medium">{item.example}</div>
                </div>
              </div>
            </div>

            {/* تأثير التوهج */}
            <motion.div
              className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-20`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* مقارنة بصرية */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          <h4 className="text-lg font-bold">مقارنة كثافة الطاقة</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-32 text-sm text-muted-foreground">احتراق الخشب</div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: 0 }}
                animate={{ width: '1%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="w-20 text-xs text-right">~15 MJ/kg</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 text-sm text-muted-foreground">احتراق البترول</div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: 0 }}
                animate={{ width: '3%' }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
            <div className="w-20 text-xs text-right">~45 MJ/kg</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium text-green-400">الانشطار النووي</div>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1, delay: 0.9 }}
              />
            </div>
            <div className="w-20 text-xs text-right font-bold">~80 TJ/kg</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium text-purple-400">الاندماج النووي</div>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 1.1 }}
              />
            </div>
            <div className="w-20 text-xs text-right font-bold">~340 TJ/kg</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          💡 التفاعلات النووية تطلق طاقة أكبر بـ <span className="text-yellow-400 font-bold">مليون مرة</span> من التفاعلات الكيميائية!
        </div>
      </div>
    </div>
  );
};
