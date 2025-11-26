import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CHEMICALS, Chemical } from '@/data/virtual-lab-data';
import { FlaskConical, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChemicalSelectorProps {
  selectedChemicals: Chemical[];
  onAddChemical: (chemical: Chemical) => void;
  onRemoveChemical: (chemicalId: string) => void;
}

export const ChemicalSelector = ({
  selectedChemicals,
  onAddChemical,
  onRemoveChemical
}: ChemicalSelectorProps) => {
  const getDangerColor = (level: string) => {
    switch (level) {
      case 'danger': return 'destructive';
      case 'caution': return 'secondary';
      default: return 'default';
    }
  };

  const getDangerLabel = (level: string) => {
    switch (level) {
      case 'danger': return 'خطر';
      case 'caution': return 'تحذير';
      default: return 'آمن';
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Chemicals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            المواد المحددة ({selectedChemicals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedChemicals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لم يتم تحديد أي مواد كيميائية
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedChemicals.map((chemical) => (
                <motion.div
                  key={chemical.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge 
                    variant={getDangerColor(chemical.danger_level)}
                    className="gap-2 py-2 px-3"
                  >
                    <span>{chemical.nameAr}</span>
                    <span className="font-mono text-xs">{chemical.formula}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={() => onRemoveChemical(chemical.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Chemicals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">المواد المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {CHEMICALS.map((chemical) => {
                const isSelected = selectedChemicals.some(c => c.id === chemical.id);
                
                return (
                  <motion.div
                    key={chemical.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => !isSelected && onAddChemical(chemical)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: chemical.color }}
                              />
                              <span className="font-semibold text-sm">{chemical.nameAr}</span>
                              <Badge variant="outline" className="text-xs">
                                {chemical.formula}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge 
                                variant={getDangerColor(chemical.danger_level)}
                                className="text-xs"
                              >
                                {getDangerLabel(chemical.danger_level)}
                              </Badge>
                              <span>{chemical.state === 'solid' ? '🧊 صلب' : 
                                     chemical.state === 'liquid' ? '💧 سائل' : 
                                     chemical.state === 'gas' ? '💨 غاز' : '🌊 محلول'}</span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant={isSelected ? "secondary" : "default"}
                            disabled={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddChemical(chemical);
                            }}
                          >
                            {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
