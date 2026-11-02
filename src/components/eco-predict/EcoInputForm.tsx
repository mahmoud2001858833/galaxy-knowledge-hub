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
      className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-card-foreground mb-1 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          بيانات الاستهلاك المتقدمة
        </h2>
        <p className="text-xs text-muted-foreground mt-1">12+ مدخلاً دقيقاً لحساب وتحليل أثرك البيئي والتنبؤ به</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy & Water */}
        <VoiceNumberInput label="استهلاك الكهرباء" value={consumptionData.electricity} onChange={update('electricity')} icon={Zap} iconColor="text-primary" unit="ك.و.س/شهر" placeholder="500" />
        <VoiceNumberInput label="استهلاك المياه" value={consumptionData.water} onChange={update('water')} icon={Droplets} iconColor="text-primary" unit="لتر/شهر" placeholder="15000" />

        {/* Transport */}
        <VoiceNumberInput label="المسافة بالسيارة" value={consumptionData.transport} onChange={update('transport')} icon={Car} iconColor="text-primary" unit="كم/شهر" placeholder="1000" />
        <VoiceNumberInput label="رحلات الطيران سنوياً" value={consumptionData.flightsPerYear} onChange={update('flightsPerYear')} icon={Plane} iconColor="text-primary" unit="رحلة" placeholder="2" />

        {/* Waste & Lifestyle */}
        <VoiceNumberInput label="النفايات" value={consumptionData.waste} onChange={update('waste')} icon={Trash2} iconColor="text-primary" unit="كج/شهر" placeholder="50" />
        <VoiceNumberInput label="نسبة إعادة التدوير" value={consumptionData.recyclingRate} onChange={update('recyclingRate')} icon={Trash2} iconColor="text-primary" unit="0-100%" placeholder="30" />

        {/* Household */}
        <VoiceNumberInput label="عدد أفراد المنزل" value={consumptionData.householdSize} onChange={update('householdSize')} icon={Users} iconColor="text-primary" unit="فرد" placeholder="4" />
        <VoiceNumberInput label="مساحة المنزل" value={consumptionData.homeArea} onChange={update('homeArea')} icon={HomeIcon} iconColor="text-primary" unit="م²" placeholder="150" />

        {/* Diet & Shopping */}
        <VoiceNumberInput label="وجبات اللحم الأحمر أسبوعياً" value={consumptionData.meatMealsPerWeek} onChange={update('meatMealsPerWeek')} icon={Beef} iconColor="text-primary" unit="وجبة" placeholder="3" />
        <VoiceNumberInput label="مشتريات شهرية (ملابس/أجهزة)" value={consumptionData.shoppingFrequency} onChange={update('shoppingFrequency')} icon={ShoppingBag} iconColor="text-primary" unit="عدد" placeholder="5" />

        {/* AC */}
        <VoiceNumberInput label="ساعات تشغيل التكييف" value={consumptionData.acHoursPerDay} onChange={update('acHoursPerDay')} icon={Zap} iconColor="text-primary" unit="ساعة/يوم" placeholder="6" />

        <div className="space-y-2">
          <Label className="text-card-foreground text-sm font-semibold flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            نوع الوقود
          </Label>
          <Select value={consumptionData.fuelType} onValueChange={(value) => setConsumptionData(prev => ({ ...prev, fuelType: value }))}>
            <SelectTrigger className="bg-background border-border text-foreground rounded-2xl">
              <SelectValue placeholder="اختر نوع الوقود" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="gasoline">بنزين</SelectItem>
              <SelectItem value="diesel">ديزل</SelectItem>
              <SelectItem value="electric">كهربائي</SelectItem>
              <SelectItem value="hybrid">هجين</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-card-foreground text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            الموقع الجغرافي
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="bg-background border-border text-foreground rounded-2xl">
              <SelectValue placeholder="اختر الموقع" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="jordan">الأردن</SelectItem>
              <SelectItem value="saudi">السعودية</SelectItem>
              <SelectItem value="uae">الإمارات</SelectItem>
              <SelectItem value="egypt">مصر</SelectItem>
              <SelectItem value="kuwait">الكويت</SelectItem>
              <SelectItem value="qatar">قطر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-card-foreground text-sm font-semibold flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            مصدر الطاقة الرئيسي
          </Label>
          <Select value={energySource} onValueChange={setEnergySource}>
            <SelectTrigger className="bg-background border-border text-foreground rounded-2xl">
              <SelectValue placeholder="اختر مصدر الطاقة" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="grid">شبكة الكهرباء العامة</SelectItem>
              <SelectItem value="solar">طاقة شمسية</SelectItem>
              <SelectItem value="hybrid">نظام هجين</SelectItem>
              <SelectItem value="generator">مولد ديزل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={onAnalyze}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-2xl shadow-sm text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جاري التحليل والتنبؤ الذكي...
            </>
          ) : (
            <>تحليل وتوقع البصمة البيئية</>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default EcoInputForm;
