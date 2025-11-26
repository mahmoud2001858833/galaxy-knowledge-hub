import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface SpectrumDisplayProps {
  currentFrequency: number;
  onFrequencyChange: (freq: number) => void;
}

const SpectrumDisplay = ({ currentFrequency, onFrequencyChange }: SpectrumDisplayProps) => {
  const spectrumRanges = [
    { name: 'موجات الراديو', start: 0, end: 1, color: 'rgb(220, 20, 60)', applications: ['الراديو', 'التلفزيون', 'الاتصالات اللاسلكية'] },
    { name: 'الموجات الميكروية', start: 1, end: 300, color: 'rgb(255, 140, 0)', applications: ['الميكروويف', 'الرادار', 'الأقمار الصناعية'] },
    { name: 'الأشعة تحت الحمراء', start: 300, end: 430000, color: 'rgb(255, 215, 0)', applications: ['التصوير الحراري', 'أجهزة التحكم', 'التدفئة'] },
    { name: 'الضوء المرئي', start: 430000, end: 770000, color: 'linear-gradient(to right, rgb(255,0,0), rgb(255,127,0), rgb(255,255,0), rgb(0,255,0), rgb(0,0,255), rgb(75,0,130), rgb(148,0,211))', applications: ['الرؤية', 'الإضاءة', 'الألياف البصرية'] },
    { name: 'الأشعة فوق البنفسجية', start: 770000, end: 30000000, color: 'rgb(138, 43, 226)', applications: ['التعقيم', 'الكشف عن التزييف', 'العلاج الطبي'] },
    { name: 'الأشعة السينية', start: 30000000, end: 30000000000, color: 'rgb(75, 0, 130)', applications: ['التصوير الطبي', 'الأمن', 'تحليل المواد'] },
    { name: 'أشعة غاما', start: 30000000000, end: 100000000000, color: 'rgb(25, 25, 112)', applications: ['العلاج الإشعاعي', 'التعقيم', 'علم الفلك'] }
  ];

  const getPosition = (freq: number) => {
    // Logarithmic scale for better visualization
    const logMin = Math.log10(0.001);
    const logMax = Math.log10(100000000000);
    const logFreq = Math.log10(freq);
    return ((logFreq - logMin) / (logMax - logMin)) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">الطيف الكهرومغناطيسي الكامل</h3>
          
          {/* Spectrum Bar */}
          <div className="relative h-24 rounded-lg overflow-hidden mb-8">
            <div className="absolute inset-0 flex">
              {spectrumRanges.map((range, index) => {
                const width = ((Math.log10(range.end) - Math.log10(range.start)) / (Math.log10(100000000000) - Math.log10(0.001))) * 100;
                return (
                  <div
                    key={index}
                    className="h-full cursor-pointer transition-all hover:brightness-110"
                    style={{
                      width: `${width}%`,
                      background: range.color
                    }}
                    onClick={() => onFrequencyChange((range.start + range.end) / 2)}
                  />
                );
              })}
            </div>
            
            {/* Current position indicator */}
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${getPosition(currentFrequency)}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                {currentFrequency.toFixed(2)} THz
              </div>
            </motion.div>
          </div>

          {/* Spectrum Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spectrumRanges.map((range, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-lg border border-border bg-background/50 cursor-pointer hover:bg-background/80 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onFrequencyChange((range.start + range.end) / 2)}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className="w-full h-2 rounded-full mb-3"
                  style={{ background: range.color }}
                />
                <h4 className="font-bold text-foreground mb-2">{range.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {range.start.toExponential(1)} - {range.end.toExponential(1)} Hz
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">التطبيقات:</p>
                  {range.applications.map((app, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {app}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Educational Information */}
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">حقائق علمية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">العلاقة بين التردد والطول الموجي</h4>
              <p className="text-sm text-muted-foreground">λ = c / f</p>
              <p className="text-xs text-muted-foreground mt-2">حيث c هي سرعة الضوء (3×10⁸ m/s)</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-foreground mb-2">طاقة الفوتون</h4>
              <p className="text-sm text-muted-foreground">E = h × f</p>
              <p className="text-xs text-muted-foreground mt-2">حيث h هو ثابت بلانك (6.626×10⁻³⁴ J·s)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpectrumDisplay;
