import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Feather, ArrowRight } from "lucide-react";
import ArabicScholars from "./ArabicScholars";
import ArabicPoets from "./ArabicPoets";

const LiteraryReview = () => {
  const [activeView, setActiveView] = useState<"menu" | "scholars" | "poets" | "article">("menu");

  if (activeView === "scholars") {
    return (
      <div>
        <Button 
          onClick={() => setActiveView("menu")}
          className="mb-6 bg-white/10 hover:bg-white/20"
        >
          <ArrowRight className="ml-2" />
          العودة
        </Button>
        <ArabicScholars />
      </div>
    );
  }

  if (activeView === "poets") {
    return (
      <div>
        <Button 
          onClick={() => setActiveView("menu")}
          className="mb-6 bg-white/10 hover:bg-white/20"
        >
          <ArrowRight className="ml-2" />
          العودة
        </Button>
        <ArabicPoets />
      </div>
    );
  }

  if (activeView === "article") {
    return (
      <div>
        <Button 
          onClick={() => setActiveView("menu")}
          className="mb-6 bg-white/10 hover:bg-white/20"
        >
          <ArrowRight className="ml-2" />
          العودة
        </Button>
        <PoetryEvolutionArticle />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-pink-900 to-purple-950 p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block mb-6"
          >
            <BookOpen className="w-20 h-20 text-pink-400 mx-auto drop-shadow-[0_0_25px_rgba(244,114,182,0.5)]" />
          </motion.div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            النقد الأدبي
          </h1>
          <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            استكشف عوالم النقد والأدب العربي
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 h-full">
              <Users className="w-16 h-16 text-cyan-400 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              <h3 className="text-2xl font-bold text-white mb-4 text-center">موسوعة علماء اللغة العربية</h3>
              <p className="text-white/80 text-center mb-6">
                تعرف على أبرز علماء اللغة ومساهماتهم في علوم العربية
              </p>
              <Button
                onClick={() => setActiveView("scholars")}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 text-lg rounded-2xl"
              >
                استكشف الآن
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 h-full">
              <Feather className="w-16 h-16 text-purple-400 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
              <h3 className="text-2xl font-bold text-white mb-4 text-center">شعراء العرب</h3>
              <p className="text-white/80 text-center mb-6">
                رحلة في عالم الشعراء العرب وأشعارهم عبر العصور
              </p>
              <Button
                onClick={() => setActiveView("poets")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-lg rounded-2xl"
              >
                استكشف الآن
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 h-full">
              <BookOpen className="w-16 h-16 text-orange-400 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]" />
              <h3 className="text-2xl font-bold text-white mb-4 text-center">تطور الشعر</h3>
              <p className="text-white/80 text-center mb-6">
                دراسة علمية فلسفية في مسار الوعي الشعري
              </p>
              <Button
                onClick={() => setActiveView("article")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg rounded-2xl"
              >
                اقرأ المقالة
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const PoetryEvolutionArticle = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/30 shadow-2xl"
      dir="rtl"
    >
      <h2 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
        تطور الشعر: من الطقس إلى الفكر
      </h2>
      <p className="text-center text-xl text-white/70 mb-12">دراسة علمية فلسفية في مسار الوعي الشعري</p>
      
      <div className="space-y-12 text-white/90 text-lg leading-relaxed">
        <section>
          <h3 className="text-3xl font-bold text-orange-400 mb-6 border-r-4 border-orange-400 pr-4">المقدمة</h3>
          <p className="mb-4">
            الشعر مش مجرّد ترف لغوي أو زينة أدبية، بل هو سجلّ الوعي الإنساني في رحلته الطويلة من الغريزة إلى الفكرة.
            منذ اللحظة الأولى التي أصدر فيها الإنسان إيقاعاً منتظماً أو أنشودة بدائية، بدأ يعبّر عن ذاته من خلال الصوت، ثم اللغة، ثم الصورة.
          </p>
          <p>
            تاريخ الشعر هو تاريخ التحوّل من الغناء الجماعي إلى التجربة الفردية، ومن الميثولوجيا إلى الفلسفة، ومن الإيقاع إلى المعنى.
          </p>
        </section>

        <section className="bg-white/5 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 border-r-4 border-cyan-400 pr-4">
            أولًا: الشعر كظاهرة إنسانية بدائية
          </h3>
          <p className="mb-4">
            قبل ظهور الكتابة بزمن طويل، كان الشعر جزء من الطقوس الجماعية، سواء في الصيد أو العبادة أو الحرب.
            علماء الأنثروبولوجيا بيحكوا إن الإنسان استخدم الإيقاع لتنظيم التجربة الجماعية، فالإيقاع كان بمثابة لغة ما قبل اللغة، لغة عاطفية بترمز للخوف، والفرح، والدهشة.
          </p>
          <p className="font-bold text-xl text-cyan-300">
            من وجهة فلسفية، كان الشعر نوعاً من "التفكير الغنائي"، اللي يسبق التفكير المنطقي.
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold text-purple-400 mb-6 border-r-4 border-purple-400 pr-4">
            ثانياً: من الأسطورة إلى الفلسفة
          </h3>
          <p className="mb-4">
            مع نشوء الحضارات القديمة، صار الشعر يحمل المعنى، مو بس الإيقاع.
            في ملحمة جلجامش، أوّل نص شعري معروف، بتظهر الأسئلة الفلسفية الكبرى: الموت، الخلود، والبحث عن المعنى.
          </p>
          <div className="bg-white/5 rounded-2xl p-6">
            <p className="italic">
              أفلاطون شافه خطر لأنه يغذي العاطفة، وأرسطو شافه ضروري لأنه "يحاكي الحقيقة رمزياً".
              من هون بدأت العلاقة الجدلية بين الشاعر والفيلسوف، بين الصورة والفكرة.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-pink-400 mb-6 border-r-4 border-pink-400 pr-4">
            ثالثًا: الشعر واللغة — من الصوت إلى الرمز
          </h3>
          <p className="mb-4">
            مع ظهور الكتابة، صارت اللغة هي المحور. الشاعر ما عاد ينقل الغناء، صار يصنع الرمز.
          </p>
          <p>
            في علم اللغة الحديث، بيشوف ياكبسون إن الشعر هو "انحراف منظّم" عن اللغة اليومية، يعني بيخلق دلالة من خلال المفارقة والانزياح.
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold text-indigo-400 mb-6 border-r-4 border-indigo-400 pr-4">
            رابعًا: الشعر كوعي ذاتي — من الكلاسيكية إلى الرومانسية
          </h3>
          <p className="mb-4">
            خلال العصور الوسطى، ظل الشعر خاضعاً للسلطة الدينية والاجتماعية، لكن مع النهضة، انقلبت الموازين.
            الشعر صار تجربة فردية، صوت الذات ضد السلطة.
          </p>
          <div className="bg-white/5 rounded-2xl p-6">
            <p className="font-bold text-xl text-indigo-300">
              هذا التحوّل مثّل نقلة من الوعي الجمعي إلى الوعي الفردي، ومن الانسجام مع الطبيعة إلى الصراع معها.
            </p>
          </div>
        </section>

        <section className="bg-white/5 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-red-400 mb-6 border-r-4 border-red-400 pr-4">
            خامسًا: الشعر الحديث — بين الحرية والقلق
          </h3>
          <p className="mb-4">
            مع القرن العشرين، دخل الشعر مرحلة جديدة. انهارت الأشكال التقليدية، وتحرر الوزن والقافية.
            صارت القصيدة تبحث عن المعنى وسط عالم مضطرب: حروب، اغتراب، انهيار القيم.
          </p>
          <p className="italic">
            الشعر الحديث يعكس مأزق الإنسان الوجودي: البحث عن معنى في عالم بلا مركز.
            هو صرخة، وحلم، وتأمل — مزيج من العلم والجنون.
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold text-green-400 mb-6 border-r-4 border-green-400 pr-4">
            سادسًا: الشعر الرقمي والمستقبل الفلسفي
          </h3>
          <p className="mb-4">
            اليوم، بالعصر الرقمي، الشعر قاعد يدخل مرحلة جديدة كلياً. القصيدة صارت تفاعلية، تُقرأ وتُسمع وتُشاهد.
          </p>
          <p>
            علمياً، دراسات الأعصاب (neuroaesthetics) بتوضح إن الدماغ البشري يتفاعل مع الشعر بطريقة فريدة، بيدمج بين الذاكرة والعاطفة والموسيقى.
            وهذا بيؤكد إن الشعر، حتى في زمن الآلة، هو فعل إنساني بامتياز.
          </p>
        </section>

        <section className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-orange-400 mb-6 border-r-4 border-orange-400 pr-4">الخاتمة</h3>
          <p className="mb-4">
            تطور الشعر هو تطور الوعي البشري من الغريزة إلى الفكرة، من الصوت إلى الرمز، ومن الجماعة إلى الذات.
            هو وثيقة لغوية وجمالية عن كيفية تفكير الإنسان عبر العصور.
          </p>
          <p className="text-2xl font-bold text-center text-orange-300 my-6">
            الشعر مش مجرد شكل أدبي، بل شكل من أشكال الوجود.
          </p>
          <p className="text-center italic">
            هو اللغة التي يتحدث بها الإنسان مع نفسه حين لا تكفيه كل لغات العالم.
          </p>
        </section>

        <section className="bg-white/10 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 border-r-4 border-cyan-400 pr-4">المراجع العربية</h3>
          <ul className="space-y-3 text-white/80">
            <li>1. الجرجاني، عبد القاهر. دلائل الإعجاز. تحقيق محمود شاكر، دار المدني، 1981</li>
            <li>2. ابن طباطبا العلوي. عيار الشعر. تحقيق عباس عبد الساتر، دار صادر، 2002</li>
            <li>3. ابن قتيبة الدينوري. الشعر والشعراء. دار الحديث، القاهرة، 2006</li>
            <li>4. أدونيس. زمن الشعر. دار العودة، بيروت، 1972</li>
            <li>5. إحسان عباس. اتجاهات الشعر العربي المعاصر. دار الشروق، 1996</li>
            <li>6. نازك الملائكة. قضايا الشعر المعاصر. دار العلم للملايين، 1962</li>
            <li>7. يوسف الخال. الحداثة في الشعر العربي. المؤسسة العربية للدراسات والنشر، 1980</li>
            <li>8. الجابري، محمد عابد. تكوين العقل العربي. مركز دراسات الوحدة العربية، 1984</li>
            <li>9. عبد الله الغذامي. الخطيئة والتكفير: من البنيوية إلى التشريحية. النادي الأدبي، جدة، 1985</li>
            <li>10. أدونيس. الثابت والمتحول. دار العودة، بيروت، 1974</li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
};

export default LiteraryReview;
