import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Newspaper } from "lucide-react";
import schoolMagazineLogo from "@/assets/school-magazine-logo.png";

const SchoolMagazineSection = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="py-8 w-full"
      dir="rtl"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-white to-pink-500">
          مجلة مدرسة عنبه
        </h2>
        <div className="w-12 h-1 bg-rose-500/50 mx-auto mt-3"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onClick={() => navigate("/school-magazine")}
        className="group relative w-full h-[500px] rounded-2xl overflow-hidden cursor-pointer border-2 border-rose-500/30 hover:border-rose-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/20"
      >
        {/* Background with magazine logo */}
        <div className="absolute inset-0">
          <img
            src={schoolMagazineLogo}
            alt="مجلة مدرسة عنبه"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/95 via-rose-900/70 to-transparent"></div>
        </div>

        {/* Animated Background Gradient */}

        {/* Content Container */}
        <div className="relative h-full p-8 flex flex-col items-center justify-center text-center z-10">
          {/* Icon with Gradient Background */}
          <motion.div
            className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-2xl"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 },
            }}
          >
            <Newspaper className="w-12 h-12 text-white" />
          </motion.div>

          <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-rose-300 transition-colors duration-300">
            مجلة مدرسة عنبه الثانوية الشاملة للبنين
          </h3>

          <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-xl">
            آخر الأخبار والفعاليات والإنجازات المدرسية في مكان واحد. تابع كل جديد
            في مدرستك
          </p>

        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-pink-500 opacity-20 blur-xl"></div>
        </div>

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={{ x: "-100%", skewX: -20 }}
          whileHover={{
            x: "200%",
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
        >
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default SchoolMagazineSection;
