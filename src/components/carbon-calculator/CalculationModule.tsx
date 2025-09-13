import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  inputs: ModuleInput[];
  formula: string;
  emissionFactor: number;
  unit: string;
  source: string;
  sourceUrl: string;
}

export interface ModuleInput {
  id: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  unit?: string;
  options?: string[];
  placeholder?: string;
  required: boolean;
}

interface ModuleInstance {
  id: string;
  values: Record<string, any>;
  result: number;
}

interface CalculationModuleProps {
  module: ModuleData;
  instances: ModuleInstance[];
  onUpdateInstance: (moduleId: string, instanceId: string, values: Record<string, any>) => void;
  onAddInstance: (moduleId: string) => void;
  onRemoveInstance: (moduleId: string, instanceId: string) => void;
}

const CalculationModule: React.FC<CalculationModuleProps> = ({
  module,
  instances,
  onUpdateInstance,
  onAddInstance,
  onRemoveInstance
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateEmissions = (values: Record<string, any>): number => {
    // Basic calculation: multiply input values by emission factor
    const baseValue = Object.values(values).reduce((acc, val) => {
      if (typeof val === 'number') return acc + val;
      return acc;
    }, 0);
    
    return baseValue * module.emissionFactor;
  };

  const handleInputChange = (instanceId: string, inputId: string, value: any) => {
    const instance = instances.find(i => i.id === instanceId);
    if (!instance) return;

    const newValues = { ...instance.values, [inputId]: value };
    onUpdateInstance(module.id, instanceId, newValues);
  };

  const getTotalEmissions = (): number => {
    return instances.reduce((total, instance) => {
      return total + calculateEmissions(instance.values);
    }, 0);
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <module.icon className="w-6 h-6 text-blue-400" />
            <div>
              <CardTitle className="text-white text-lg">{module.title}</CardTitle>
              <CardDescription className="text-white/70">{module.description}</CardDescription>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-blue-400" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium mb-1">المصدر:</p>
                  <p className="text-sm">{module.source}</p>
                  <p className="text-sm mt-1">المعادلة: {module.formula}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {instances.map((instance, index) => (
          <div key={instance.id} className="border border-white/10 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">
                {instances.length > 1 ? `${module.title} #${index + 1}` : module.title}
              </h4>
              {instances.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveInstance(module.id, instance.id)}
                  className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {module.inputs.map((input) => (
                <div key={input.id} className="space-y-2">
                  <Label className="text-white text-sm">
                    {input.label}
                    {input.unit && <span className="text-white/60 mr-1">({input.unit})</span>}
                  </Label>
                  
                  {input.type === 'number' && (
                    <Input
                      type="number"
                      value={instance.values[input.id] || ''}
                      onChange={(e) => handleInputChange(instance.id, input.id, parseFloat(e.target.value) || 0)}
                      placeholder={input.placeholder}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  )}
                  
                  {input.type === 'select' && (
                    <Select
                      value={instance.values[input.id] || ''}
                      onValueChange={(value) => handleInputChange(instance.id, input.id, value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="اختر..." />
                      </SelectTrigger>
                      <SelectContent>
                        {input.options?.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-white/80 text-sm">الانبعاثات لهذا العنصر:</span>
              <span className="text-green-400 font-bold">
                {calculateEmissions(instance.values).toFixed(2)} كج CO₂e
              </span>
            </div>
          </div>
        ))}
        
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
           <Button
            variant="outline"
            onClick={() => onAddInstance(module.id)}
            className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة مثيل آخر
          </Button>
          
          <div className="text-right">
            <p className="text-white/80 text-sm">إجمالي الانبعاثات:</p>
            <p className="text-green-400 font-bold text-lg">
              {getTotalEmissions().toFixed(2)} كج CO₂e سنوياً
            </p>
          </div>
        </div>
        
        <div className="text-xs text-white/60 text-center pt-2 border-t border-white/10">
          المصدر: <a href={module.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            {module.source}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationModule;