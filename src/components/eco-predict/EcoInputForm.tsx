import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplets, Car, Trash2, MapPin, Sun, Loader2, Users, Home as HomeIcon, Plane, ShoppingBag, Beef } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VoiceNumberInput from '@/components/eco/VoiceNumberInput';

export interface ConsumptionData {
  electricity: number;
  water: number;
  transport: number;
  fuelType: string;
  waste: number;
  // New advanced inputs
  householdSize: number;
  homeArea: number;
  flightsPerYear: number;
  meatMealsPerWeek: number;
  recyclingRate: number; // 0-100 %
  shoppingFrequency: number; // monthly purchases
  acHoursPerDay: number;
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
  const update = (key: keyof ConsumptionData) => (v: number) =>
    setConsumptionData(prev => ({ ...prev, [key]: v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 shadow-2xl"
    >
      <h2 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        إدخال بيانات الاستهلاك المتقدمة
      </h2>
      <p className="text-xs text-gray-400 mb-6">12+ مدخلاً للحصول على تحليل دقيق · 🎤 يدعم الإدخال الصوتي</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy & Water */}
        <VoiceNumberInput label="استهلاك الكهرباء" value={consumptionData.electricity} onChange={update('electricity')} icon={Zap} iconColor="text-yellow-400" unit="ك.و.س/شهر" placeholder="500" />
        <VoiceNumberInput label="استهلاك المياه" value={consumptionData.water} onChange={update('water')} icon={Droplets} iconColor="text-blue-400" unit="لتر/شهر" placeholder="15000" />

        {/* Transport */}
        <VoiceNumberInput label="المسافة بالسيارة" value={consumptionData.transport} onChange={update('transport')} icon={Car} iconColor="text-purple-400" unit="كم/شهر" placeholder="1000" />
        <VoiceNumberInput label="رحلات الطيران سنوياً" value={consumptionData.flightsPerYear} onChange={update('flightsPerYear')} icon={Plane} iconColor="text-cyan-400" unit="رحلة" placeholder="2" />

        {/* Waste & Lifestyle */}
        <VoiceNumberInput label="النفايات" value={consumptionData.waste} onChange={update('waste')} icon={Trash2} iconColor="text-orange-400" unit="كج/شهر" placeholder="50" />
        <VoiceNumberInput label="نسبة إعادة التدوير" value={consumptionData.recyclingRate} onChange={update('recyclingRate')} icon={Trash2} iconColor="text-emerald-400" unit="0-100%" placeholder="30" />

        {/* Household */}
        <VoiceNumberInput label="عدد أفراد المنزل" value={consumptionData.householdSize} onChange={update('householdSize')} icon={Users} iconColor="text-pink-400" unit="فرد" placeholder="4" />
        <VoiceNumberInput label="مساحة المنزل" value={consumptionData.homeArea} onChange={update('homeArea')} icon={HomeIcon} iconColor="text-indigo-400" unit="م²" placeholder="150" />

        {/* Diet & Shopping */}
        <VoiceNumberInput label="وجبات اللحم الأحمر أسبوعياً" value={consumptionData.meatMealsPerWeek} onChange={update('meatMealsPerWeek')} icon={Beef} iconColor="text-red-400" unit="وجبة" placeholder="3" />
        <VoiceNumberInput label="مشتريات شهرية (ملابس/إلكترونيات)" value={consumptionData.shoppingFrequency} onChange={update('shoppingFrequency')} icon={ShoppingBag} iconColor="text-fuchsia-400" unit="عدد" placeholder="5" />

        {/* AC */}
        <VoiceNumberInput label="ساعات تشغيل التكييف" value={consumptionData.acHoursPerDay} onChange={update('acHoursPerDay')} icon={Zap} iconColor="text-sky-400" unit="ساعة/يوم" placeholder="6" />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
          <Label className="text-gray-300 flex items-center gap-2">
            <Car className="w-4 h-4 text-purple-400" />
            نوع الوقود
          </Label>
          <Select value={consumptionData.fuelType} onValueChange={(value) => setConsumptionData(prev => ({ ...prev, fuelType: value }))}>
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

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
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

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2 md:col-span-2">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <Button
          onClick={onAnalyze}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جاري التحليل المتقدم...
            </>
          ) : (
            <>تحليل وتوقع البصمة البيئية</>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default EcoInputForm;
