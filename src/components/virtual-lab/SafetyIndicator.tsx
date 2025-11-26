import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Chemical } from '@/data/virtual-lab-data';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyIndicatorProps {
  selectedChemicals: Chemical[];
}

export const SafetyIndicator = ({ selectedChemicals }: SafetyIndicatorProps) => {
  const dangerousChemicals = selectedChemicals.filter(c => c.danger_level === 'danger');
  const cautionChemicals = selectedChemicals.filter(c => c.danger_level === 'caution');
  
  const overallDanger = dangerousChemicals.length > 0 ? 'danger' : 
                        cautionChemicals.length > 0 ? 'caution' : 'safe';

  const getDangerIcon = () => {
    switch (overallDanger) {
      case 'danger': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'caution': return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getDangerLabel = () => {
    switch (overallDanger) {
      case 'danger': return 'خطر عالي';
      case 'caution': return 'تحذير';
      default: return 'آمن';
    }
  };

  const safetyTips = [
    '🥽 ارتدِ نظارات السلامة دائماً',
    '🧤 استخدم القفازات المناسبة',
    '🥼 ارتدِ معطف المختبر',
    '💨 تأكد من التهوية الجيدة',
    '🚿 اعرف موقع دش الطوارئ',
    '🧯 تعرف على موقع طفاية الحريق',
    '📖 اقرأ ملصقات التحذير',
    '🚫 لا تأكل أو تشرب في المختبر'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getDangerIcon()}
            مؤشرات السلامة
          </span>
          <Badge 
            variant={overallDanger === 'danger' ? 'destructive' : 
                    overallDanger === 'caution' ? 'secondary' : 'default'}
          >
            {getDangerLabel()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {overallDanger === 'danger' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              تحذير! تتعامل مع مواد خطرة. التزم بإجراءات السلامة.
            </AlertDescription>
          </Alert>
        )}

        {overallDanger === 'caution' && (
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              احذر! بعض المواد المستخدمة تتطلب عناية خاصة.
            </AlertDescription>
          </Alert>
        )}

        {overallDanger === 'safe' && selectedChemicals.length > 0 && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              المواد المحددة آمنة نسبياً. التزم بإجراءات السلامة العامة.
            </AlertDescription>
          </Alert>
        )}

        {/* Chemical Warnings */}
        {selectedChemicals.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">تحذيرات المواد:</p>
            <div className="space-y-2">
              {dangerousChemicals.map((chemical) => (
                <div 
                  key={chemical.id}
                  className="p-2 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold">{chemical.nameAr}</span>
                    <Badge variant="destructive" className="text-xs">خطر</Badge>
                  </div>
                </div>
              ))}
              {cautionChemicals.map((chemical) => (
                <div 
                  key={chemical.id}
                  className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">{chemical.nameAr}</span>
                    <Badge variant="secondary" className="text-xs">تحذير</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Tips */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">نصائح السلامة:</p>
          <div className="grid grid-cols-1 gap-2">
            {safetyTips.slice(0, 4).map((tip, index) => (
              <div 
                key={index}
                className="p-2 rounded-lg bg-muted/50 text-xs"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
