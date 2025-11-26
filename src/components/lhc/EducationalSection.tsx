import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { educationalContent } from '@/data/lhc-educational-content';
import { Button } from '@/components/ui/button';

export const EducationalSection = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div 
      className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <BookOpen className="text-primary" />
        القسم التعليمي
      </h3>

      <div className="space-y-4">
        {educationalContent.map((item, index) => (
          <motion.div
            key={item.id}
            className="border border-border rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Button
              variant="ghost"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="w-full justify-between p-4 hover:bg-accent/50"
            >
              <span className="font-semibold text-foreground">{item.title}</span>
              {expandedId === item.id ? (
                <ChevronUp className="text-primary" />
              ) : (
                <ChevronDown className="text-muted-foreground" />
              )}
            </Button>

            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-background/50 space-y-4">
                    <p className="text-foreground/90 leading-relaxed">{item.content}</p>
                    
                    {item.facts && item.facts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-primary text-sm">حقائق مهمة:</h4>
                        <ul className="space-y-2">
                          {item.facts.map((fact, i) => (
                            <motion.li
                              key={i}
                              className="flex items-start gap-2 text-sm text-foreground/80"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <span className="text-primary mt-1">•</span>
                              <span>{fact}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p className="text-sm text-foreground/80 text-center">
          ⚠️ هذه المحاكاة تبسيط تعليمي وليست تمثيلاً علمياً دقيقاً لفيزياء الجسيمات
        </p>
      </motion.div>
    </motion.div>
  );
};
