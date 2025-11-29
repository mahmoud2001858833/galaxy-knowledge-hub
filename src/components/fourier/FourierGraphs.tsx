import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Waves } from 'lucide-react';

interface FourierGraphsProps {
  originalData: Array<{x: number, y: number}>;
  approximationData: Array<{x: number, y: number}>;
  discontinuities: number[];
  gibbsPoints: Array<{x: number, overshoot: number}>;
}

const FourierGraphs: React.FC<FourierGraphsProps> = ({
  originalData,
  approximationData,
  discontinuities,
  gibbsPoints,
}) => {
  // دمج البيانات للرسم
  const mergedData = originalData.map((point, index) => ({
    x: point.x,
    original: point.y,
    approximation: approximationData[index]?.y || null,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold">x = {payload[0].payload.x.toFixed(3)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(3)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* الرسم الأول: الدالة الأصلية */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              الدالة الأصلية f(x)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="x"
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Line
                  type="monotone"
                  dataKey="original"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  dot={false}
                  name="f(x)"
                  isAnimationActive={true}
                  animationDuration={800}
                />
                {/* نقاط عدم الاستمرار */}
                {discontinuities.map((disc, index) => {
                  const point = mergedData.find(p => Math.abs(p.x - disc) < 0.1);
                  if (point) {
                    return (
                      <ReferenceDot
                        key={`disc-${index}`}
                        x={point.x}
                        y={point.original}
                        r={6}
                        fill="hsl(0, 84%, 60%)"
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* الرسم الثاني: تقريب فورييه */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Waves className="w-5 h-5 text-purple-500" />
              تقريب فورييه Sₙ(x)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="x"
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Line
                  type="monotone"
                  dataKey="approximation"
                  stroke="hsl(271, 91%, 65%)"
                  strokeWidth={2}
                  dot={false}
                  name="Sₙ(x)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                {/* نقاط ظاهرة غيبس */}
                {gibbsPoints.map((gibbs, index) => {
                  const point = mergedData.find(p => Math.abs(p.x - gibbs.x) < 0.1);
                  if (point) {
                    return (
                      <ReferenceDot
                        key={`gibbs-${index}`}
                        x={point.x}
                        y={point.approximation}
                        r={7}
                        fill="hsl(0, 84%, 60%)"
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FourierGraphs;
