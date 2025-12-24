import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, BookOpen, Beaker } from 'lucide-react';

interface InfoItem {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

interface Formula {
  name: string;
  formula: string;
  description?: string;
}

interface InfoSectionProps {
  data?: InfoItem[];
  formulas?: Formula[];
  facts?: string[];
  explanation?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  data,
  formulas,
  facts,
  explanation,
}) => {
  const [showFacts, setShowFacts] = useState(false);

  return (
    <div className="space-y-4">
      {/* Data Display */}
      {data && data.length > 0 && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {data.map((item, index) => (
            <motion.div 
              key={index}
              className="flex justify-between items-center p-2 rounded-lg bg-slate-700/30"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-slate-400 text-sm">{item.label}:</span>
              <span className={`font-mono font-medium ${item.color || 'text-blue-300'}`}>
                {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
                {item.unit && <span className="text-slate-500 ml-1">{item.unit}</span>}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Explanation */}
      {explanation && (
        <motion.div 
          className="p-3 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-lg border border-slate-600/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
          </div>
        </motion.div>
      )}

      {/* Formulas */}
      {formulas && formulas.length > 0 && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
            <Beaker className="w-4 h-4" />
            <span>المعادلات</span>
          </div>
          {formulas.map((item, index) => (
            <div 
              key={index}
              className="p-2 bg-slate-700/40 rounded-lg"
            >
              <div className="font-mono text-sm text-center text-green-300 mb-1">
                {item.formula}
              </div>
              {item.description && (
                <div className="text-xs text-slate-500 text-center">{item.description}</div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Fun Facts */}
      {facts && facts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button 
            onClick={() => setShowFacts(!showFacts)}
            className="flex items-center justify-between w-full p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span>حقائق علمية</span>
            </div>
            {showFacts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showFacts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  {facts.map((fact, index) => (
                    <motion.div 
                      key={index}
                      className="p-2 text-xs text-slate-300 bg-slate-800/50 rounded-lg border-l-2 border-amber-500/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      ✨ {fact}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default InfoSection;
