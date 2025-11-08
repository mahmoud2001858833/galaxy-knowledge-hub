import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Upload, Bot, Users, Trophy, Lightbulb, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import StarField from "@/components/StarField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentArtProjects from "@/components/artDesign/StudentArtProjects";
import AIForArt from "@/components/artDesign/AIForArt";
import ArtistsGallery from "@/components/artDesign/ArtistsGallery";
import ArtChallenge from "@/components/artDesign/ArtChallenge";
import RateYourArt from "@/components/artDesign/RateYourArt";
import DrawingTips from "@/components/artDesign/DrawingTips";

const ArtDesign = () => {
  const [activeTab, setActiveTab] = useState("projects");

  const tabs = [
    { id: "projects", label: "مشاريع الطلاب", icon: Upload },
    { id: "ai", label: "الذكاء الاصطناعي للفن", icon: Bot },
    { id: "artists", label: "الفنانون", icon: Users },
    { id: "challenge", label: "تحدي فني", icon: Trophy },
    { id: "rate", label: "قيّم عملك الفني", icon: Star },
    { id: "tips", label: "نصائح الرسم", icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <SEO
        title="الفن والتصميم"
        description="منصة تعليمية شاملة للفن والتصميم - مشاريع الطلاب، الذكاء الاصطناعي، الفنانون العالميون، تحديات الرسم ونصائح احترافية"
        keywords="فن، تصميم، رسم، فنانون، تحدي رسم، ذكاء اصطناعي، مشاريع فنية"
      />
      <StarField />
      <Navbar />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              الفن والتصميم
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            استكشف عالم الفن والإبداع - شارك مشاريعك، تعلم من الفنانين العالميين، وتحدى زملاءك في الرسم
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-card/50 backdrop-blur-sm p-2 rounded-xl">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="projects">
            <StudentArtProjects />
          </TabsContent>

          <TabsContent value="ai">
            <AIForArt />
          </TabsContent>

          <TabsContent value="artists">
            <ArtistsGallery />
          </TabsContent>

          <TabsContent value="challenge">
            <ArtChallenge />
          </TabsContent>

          <TabsContent value="rate">
            <RateYourArt />
          </TabsContent>

          <TabsContent value="tips">
            <DrawingTips />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ArtDesign;
