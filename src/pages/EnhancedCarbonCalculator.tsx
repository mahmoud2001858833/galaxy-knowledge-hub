import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, BarChart3, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CalculationModule from '@/components/carbon-calculator/CalculationModule';
import { calculationModules } from '@/components/carbon-calculator/modules';
import GlobalComparisonChart from '@/components/eco/GlobalComparisonChart';
import { generateSustainabilityPdf, GLOBAL_CO2_BENCHMARKS } from '@/lib/sustainabilityPdf';

interface ModuleInstance {
  id: string;
  values: Record<string, any>;
  result: number;
}

const EnhancedCarbonCalculator = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  
  const [moduleInstances, setModuleInstances] = useState<Record<string, ModuleInstance[]>>({});

  const handleUpdateInstance = (moduleId: string, instanceId: string, values: Record<string, any>) => {
    setModuleInstances(prev => ({
      ...prev,
      [moduleId]: prev[moduleId]?.map(instance => 
        instance.id === instanceId 
          ? { ...instance, values, result: calculateEmissions(moduleId, values) }
          : instance
      ) || []
    }));
  };

  const handleAddInstance = (moduleId: string) => {
    const newInstance: ModuleInstance = {
      id: `${moduleId}-${Date.now()}`,
      values: {},
      result: 0
    };
    
    setModuleInstances(prev => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), newInstance]
    }));
  };

  const handleRemoveInstance = (moduleId: string, instanceId: string) => {
    setModuleInstances(prev => ({
      ...prev,
      [moduleId]: prev[moduleId]?.filter(instance => instance.id !== instanceId) || []
    }));
  };

  const calculateEmissions = (moduleId: string, values: Record<string, any>): number => {
    const module = calculationModules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const baseValue = Object.values(values).reduce((acc, val) => {
      if (typeof val === 'number') return acc + val;
      return acc;
    }, 0);
    
    return baseValue * module.emissionFactor;
  };

  // Initialize instances for modules that don't have any
  React.useEffect(() => {
    calculationModules.forEach(module => {
      if (!moduleInstances[module.id]) {
        handleAddInstance(module.id);
      }
    });
  }, []);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    calculationModules.forEach(module => {
      const instances = moduleInstances[module.id] || [];
      const moduleTotal = instances.reduce((sum, instance) => sum + instance.result, 0);
      totals[module.category] = (totals[module.category] || 0) + moduleTotal;
    });
    
    return totals;
  }, [moduleInstances]);

  const totalEmissions = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-green-950 to-cyan-950 p-4" dir={dir}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/environmental-sustainability')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>

          <Button
            onClick={() => {
              const totalTons = totalEmissions / 1000;
              generateSustainabilityPdf({
                title: 'Advanced Carbon Footprint Report',
                subtitle: `${calculationModules.length} calculation modules · Comprehensive analysis`,
                headlineMetric: { label: 'Total Annual Emissions', value: `${totalTons.toFixed(2)} t CO2e/yr` },
                sections: [
                  {
                    title: 'Category Breakdown (kg CO2e/yr)',
                    rows: Object.entries(categoryTotals).map(([cat, val]) => [cat, val.toFixed(2)]),
                  },
                ],
                comparison: [
                  { label: 'You', value: totalTons, unit: 't CO2/yr' },
                  ...GLOBAL_CO2_BENCHMARKS,
                ],
                recommendations: [
                  'Switch to renewable energy sources (solar/wind) for electricity',
                  'Reduce red meat consumption to 1-2 meals per week',
                  'Use public transport, carpool, or shift to electric vehicles',
                  'Improve home insulation to reduce heating/cooling needs',
                  'Recycle and compost to reduce waste emissions',
                ],
                footer: `Carbon Calculator · ${new Date().toLocaleString()}`,
              }, `carbon-footprint-${Date.now()}.pdf`);
              toast({ title: 'تم تنزيل التقرير', description: 'تقرير PDF شامل جاهز' });
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Download className="w-4 h-4 ml-2" />
            تحميل تقرير PDF
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-green-400">
              حاسبة البصمة الكربونية المتقدمة
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            احسب انبعاثاتك الكربونية بدقة من خلال +25 وحدة حساب متخصصة
          </p>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                ملخص النتائج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(categoryTotals).map(([category, total]) => (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {total.toFixed(1)}
                    </div>
                    <div className="text-white/70 text-sm">{category}</div>
                  </div>
                ))}
              </div>
              <div className="text-center pt-4 border-t border-white/20">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {(totalEmissions / 1000).toFixed(2)} طن CO₂e
                </div>
                <div className="text-white/70">إجمالي الانبعاثات السنوية</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {totalEmissions > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <GlobalComparisonChart userValue={totalEmissions / 1000} unit="طن CO₂/سنة" />
          </motion.div>
        )}

        {/* Calculation Modules */}
        <div className="space-y-6">
          {calculationModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CalculationModule
                module={module}
                instances={moduleInstances[module.id] || []}
                onUpdateInstance={handleUpdateInstance}
                onAddInstance={handleAddInstance}
                onRemoveInstance={handleRemoveInstance}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCarbonCalculator;