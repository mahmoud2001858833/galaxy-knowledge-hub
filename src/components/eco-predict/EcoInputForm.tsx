import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplets, Car, Trash2, MapPin, Sun, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConsumptionData {
  electricity: number;
  water: number;
  transport: number;
  fuelType: string;
  waste: number;
}

interface EcoInputFormProps {
  consumptionData: ConsumptionData;
  setConsumptionData: React.Dispatch<React.SetStateAction<ConsumptionData>>;
  location: string;
  setLocation: (value: string) => void;
  energySource: string;
  setEnergySource: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const EcoInputForm: React.FC<EcoInputFormProps> = ({
  consumptionData,
  setConsumptionData,
  location,
  setLocation,
  energySource,
  setEnergySource,
  onAnalyze,
  isLoading
}) => {
  const inputFields = [
    { key: 'electricity', label: 'استهلاك الكهرباء (كيلوواط/شهر)', icon: Zap, color: 'text-yellow-400' },
    { key: 'water', label: 'استهلاك المياه (لتر/شهر)', icon: Droplets, color: 'text-blue-400' },
    { key: 'transport', label: 'المسافة المقطوعة (كم/شهر)', icon: Car, color: 'text-purple-400' },
    { key: 'waste', label: 'النفايات (كجم/شهر)', icon: Trash2, color: 'text-orange-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 shadow-2xl"
    >
      <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        إدخال بيانات الاستهلاك
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputFields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label className="text-gray-300 flex items-center gap-2">
              <field.icon className={`w-4 h-4 ${field.color}`} />
              {field.label}
            </Label>
            <Input
              type="number"
              value={consumptionData[field.key as keyof ConsumptionData] || ''}
              onChange={(e) => setConsumptionData(prev => ({
                ...prev,
                [field.key]: parseFloat(e.target.value) || 0
              }))}
              className="bg-slate-800/50 border-slate-600 text-white focus:border-emerald-500 transition-colors"
              placeholder="0"
            />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label className="text-gray-300 flex items-center gap-2">
            <Car className="w-4 h-4 text-purple-400" />
            نوع الوقود
          </Label>
          <Select
            value={consumptionData.fuelType}
            onValueChange={(value) => setConsumptionData(prev => ({ ...prev, fuelType: value }))}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="اختر نوع الوقود" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="gasoline">بنزين</SelectItem>
              <SelectItem value="diesel">ديزل</SelectItem>
              <SelectItem value="electric">كهربائي</SelectItem>
              <SelectItem value="hybrid">هجين</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <Label className="text-gray-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            الموقع الجغرافي
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="اختر الموقع" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="jordan">الأردن</SelectItem>
              <SelectItem value="saudi">السعودية</SelectItem>
              <SelectItem value="uae">الإمارات</SelectItem>
              <SelectItem value="egypt">مصر</SelectItem>
              <SelectItem value="kuwait">الكويت</SelectItem>
              <SelectItem value="qatar">قطر</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2 md:col-span-2"
        >
          <Label className="text-gray-300 flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            مصدر الطاقة الرئيسي
          </Label>
          <Select value={energySource} onValueChange={setEnergySource}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="اختر مصدر الطاقة" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="grid">شبكة الكهرباء العامة</SelectItem>
              <SelectItem value="solar">طاقة شمسية</SelectItem>
              <SelectItem value="hybrid">نظام هجين</SelectItem>
              <SelectItem value="generator">مولد ديزل</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6"
      >
        <Button
          onClick={onAnalyze}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              تحليل وتوقع البصمة البيئية
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default EcoInputForm;
