
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Info, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface OrganInfo {
  id: string;
  name: string;
  description: string;
  function: string;
  components: string[];
  position: { x: number; y: number; width: number; height: number };
}

const InteractiveHumanBody = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [showChest, setShowChest] = useState(false);
  const [showBrain, setShowBrain] = useState(false);

  // بيانات الأعضاء
  const organs: OrganInfo[] = [
    {
      id: 'head',
      name: 'الرأس والدماغ',
      description: 'مركز التحكم الرئيسي في الجسم',
      function: 'التحكم في جميع وظائف الجسم والتفكير والذاكرة',
      components: ['المخ', 'المخيخ', 'جذع الدماغ', 'الغدة النخامية'],
      position: { x: 180, y: 20, width: 80, height: 100 }
    },
    {
      id: 'chest',
      name: 'القفص الصدري',
      description: 'يحتوي على القلب والرئتين',
      function: 'حماية الأعضاء الحيوية وعملية التنفس',
      components: ['القلب', 'الرئة اليمنى', 'الرئة اليسرى', 'الأضلاع'],
      position: { x: 160, y: 130, width: 120, height: 140 }
    },
    {
      id: 'heart',
      name: 'القلب',
      description: 'مضخة الدم الرئيسية في الجسم',
      function: 'ضخ الدم إلى جميع أنحاء الجسم',
      components: ['الأذين الأيمن', 'الأذين الأيسر', 'البطين الأيمن', 'البطين الأيسر'],
      position: { x: 190, y: 160, width: 40, height: 50 }
    },
    {
      id: 'lungs',
      name: 'الرئتان',
      description: 'أعضاء التنفس الرئيسية',
      function: 'تبادل الأكسجين وثاني أكسيد الكربون',
      components: ['الحويصلات الهوائية', 'الشعب الهوائية', 'الرغامى'],
      position: { x: 170, y: 150, width: 100, height: 80 }
    },
    {
      id: 'stomach',
      name: 'المعدة',
      description: 'عضو هضم الطعام',
      function: 'هضم الطعام وامتصاص العناصر الغذائية',
      components: ['الغشاء المخاطي', 'العضلات الملساء', 'الغدد المعدية'],
      position: { x: 180, y: 280, width: 60, height: 80 }
    },
    {
      id: 'liver',
      name: 'الكبد',
      description: 'أكبر غدة في الجسم',
      function: 'تنقية الدم وإنتاج الصفراء',
      components: ['الفص الأيمن', 'الفص الأيسر', 'المرارة'],
      position: { x: 200, y: 260, width: 80, height: 60 }
    }
  ];

  // رسم جسم الإنسان
  const drawHumanBody = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // مسح الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // تطبيق التكبير والإزاحة
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x, offset.y);

    // رسم الخلفية
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 400, 600);

    // رسم الجسم الأساسي
    drawBodyOutline(ctx);
    
    // رسم الأعضاء
    organs.forEach(organ => {
      drawOrgan(ctx, organ);
    });

    // رسم التفاصيل الخاصة
    if (showChest) {
      drawOpenChest(ctx);
    }
    if (showBrain) {
      drawBrainDetails(ctx);
    }

    ctx.restore();
  };

  const drawBodyOutline = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';

    // رسم الرأس
    ctx.beginPath();
    ctx.arc(220, 70, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // رسم الجذع
    ctx.beginPath();
    ctx.rect(180, 120, 80, 200);
    ctx.fill();
    ctx.stroke();

    // رسم الذراعان
    ctx.beginPath();
    ctx.rect(120, 140, 60, 20);
    ctx.rect(260, 140, 60, 20);
    ctx.fill();
    ctx.stroke();

    // رسم الساقان
    ctx.beginPath();
    ctx.rect(190, 320, 25, 100);
    ctx.rect(225, 320, 25, 100);
    ctx.fill();
    ctx.stroke();
  };

  const drawOrgan = (ctx: CanvasRenderingContext2D, organ: OrganInfo) => {
    const { x, y, width, height } = organ.position;
    
    ctx.fillStyle = getOrganColor(organ.id);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    if (organ.id === 'heart') {
      // رسم القلب بشكل خاص
      drawHeart(ctx, x, y, width, height);
    } else if (organ.id === 'head') {
      // رسم الدماغ
      ctx.beginPath();
      ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // رسم عادي
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fill();
      ctx.stroke();
    }

    // إضافة نص العضو
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(organ.name, x + width/2, y - 5);
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.bezierCurveTo(x, y + height/2, x, y, x + width/4, y);
    ctx.bezierCurveTo(x + width/2, y, x + width/2, y, x + 3*width/4, y);
    ctx.bezierCurveTo(x + width, y, x + width, y + height/2, x + width/2, y + height);
    ctx.fill();
    ctx.stroke();
  };

  const drawOpenChest = (ctx: CanvasRenderingContext2D) => {
    // رسم القلب والرئتين بشكل مفصل
    ctx.fillStyle = 'rgba(255, 68, 68, 0.8)';
    ctx.beginPath();
    ctx.arc(220, 180, 25, 0, Math.PI * 2);
    ctx.fill();

    // رسم الرئتين
    ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
    ctx.beginPath();
    ctx.ellipse(190, 170, 20, 30, 0, 0, Math.PI * 2);
    ctx.ellipse(250, 170, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBrainDetails = (ctx: CanvasRenderingContext2D) => {
    // رسم أجزاء الدماغ
    ctx.fillStyle = 'rgba(255, 105, 180, 0.8)';
    ctx.beginPath();
    ctx.arc(220, 70, 35, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(138, 43, 226, 0.8)';
    ctx.beginPath();
    ctx.arc(220, 90, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const getOrganColor = (organId: string): string => {
    const colors: { [key: string]: string } = {
      head: 'rgba(255, 105, 180, 0.6)',
      chest: 'rgba(135, 206, 235, 0.6)',
      heart: 'rgba(255, 68, 68, 0.8)',
      lungs: 'rgba(255, 182, 193, 0.6)',
      stomach: 'rgba(255, 165, 0, 0.6)',
      liver: 'rgba(139, 69, 19, 0.6)'
    };
    return colors[organId] || 'rgba(128, 128, 128, 0.6)';
  };

  // معالجة النقر على الكانفاس
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x * zoom) / zoom;
    const y = (event.clientY - rect.top - offset.y * zoom) / zoom;

    // البحث عن العضو المنقور عليه
    const clickedOrgan = organs.find(organ => {
      const { x: ox, y: oy, width, height } = organ.position;
      return x >= ox && x <= ox + width && y >= oy && y <= oy + height;
    });

    if (clickedOrgan) {
      setSelectedOrgan(clickedOrgan);
      
      // ميزات خاصة للأعضاء
      if (clickedOrgan.id === 'chest') {
        setShowChest(!showChest);
      } else if (clickedOrgan.id === 'head') {
        setShowBrain(!showBrain);
      }
    }
  };

  // معالجة السحب
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // التكبير والتصغير
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setShowChest(false);
    setShowBrain(false);
  };

  // رسم الكانفاس عند التغيير
  useEffect(() => {
    drawHumanBody();
  }, [zoom, offset, showChest, showBrain]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          جسم الإنسان التفاعلي
        </h2>
        <p className="text-white/70">
          انقر على أي عضو لاستكشاف تفاصيله ووظائفه
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <Button onClick={handleZoomIn} className="bg-green-600 hover:bg-green-700">
          <ZoomIn className="w-4 h-4 mr-2" />
          تكبير
        </Button>
        <Button onClick={handleZoomOut} className="bg-green-600 hover:bg-green-700">
          <ZoomOut className="w-4 h-4 mr-2" />
          تصغير
        </Button>
        <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700">
          <RotateCcw className="w-4 h-4 mr-2" />
          إعادة تعيين
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/20 border-green-500/30">
            <CardContent className="p-6">
              <canvas
                ref={canvasRef}
                width={400}
                height={600}
                className="border border-green-500/30 rounded-lg cursor-grab active:cursor-grabbing w-full max-w-md mx-auto"
                style={{ imageRendering: 'pixelated' }}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </CardContent>
          </Card>
        </div>

        {/* نافذة المعلومات */}
        <AnimatePresence>
          {selectedOrgan && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-80"
            >
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <Info className="w-5 h-5 mr-2 text-green-400" />
                      {selectedOrgan.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrgan(null)}
                      className="text-white/70 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">الوصف:</h4>
                      <p className="text-white/80 text-sm">{selectedOrgan.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">الوظيفة:</h4>
                      <p className="text-white/80 text-sm">{selectedOrgan.function}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">المكونات:</h4>
                      <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                        {selectedOrgan.components.map((component, index) => (
                          <li key={index}>{component}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedOrgan.id === 'chest' && (
                      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          💡 انقر على القفص الصدري لفتحه ورؤية القلب والرئتين!
                        </p>
                      </div>
                    )}

                    {selectedOrgan.id === 'head' && (
                      <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                        <p className="text-purple-300 text-sm">
                          🧠 انقر على الرأس لاستكشاف أجزاء الدماغ!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-white/60 text-sm">
        <p>استخدم عجلة الماوس للتكبير والتصغير • اسحب لتحريك العرض</p>
      </div>
    </div>
  );
};

export default InteractiveHumanBody;
