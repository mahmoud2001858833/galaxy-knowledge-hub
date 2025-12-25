import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Wind, Brain, Utensils, Activity } from 'lucide-react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationControls from '@/components/simulations/SimulationControls';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const HumanBodySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationType, setSimulationType] = useState<'circulatory' | 'respiratory' | 'nervous' | 'digestive'>('circulatory');
  const [time, setTime] = useState(0);

  const quizQuestions = [
    {
      question: 'ما هي وظيفة القلب الرئيسية؟',
      options: ['ضخ الدم إلى جميع أنحاء الجسم', 'هضم الطعام', 'إنتاج الأكسجين', 'تخزين الطاقة'],
      correctIndex: 0,
      explanation: 'القلب هو مضخة عضلية تضخ الدم المؤكسج إلى الجسم وتستقبل الدم غير المؤكسج من الأوردة'
    },
    {
      question: 'أين يحدث تبادل الغازات في الجهاز التنفسي؟',
      options: ['في القصبة الهوائية', 'في الحويصلات الهوائية', 'في الأنف', 'في البلعوم'],
      correctIndex: 1,
      explanation: 'الحويصلات الهوائية هي أكياس صغيرة في الرئتين يحدث فيها تبادل O₂ و CO₂ مع الدم'
    },
    {
      question: 'ما هو الجزء المسؤول عن التفكير في الدماغ؟',
      options: ['المخيخ', 'جذع الدماغ', 'القشرة المخية', 'النخاع المستطيل'],
      correctIndex: 2,
      explanation: 'القشرة المخية هي الطبقة الخارجية للدماغ وهي مسؤولة عن التفكير والذاكرة واتخاذ القرارات'
    },
    {
      question: 'ما هو العضو الذي يفرز حمض الهيدروكلوريك؟',
      options: ['الكبد', 'المعدة', 'البنكرياس', 'الأمعاء الدقيقة'],
      correctIndex: 1,
      explanation: 'المعدة تفرز حمض الهيدروكلوريك (HCl) لهضم البروتينات وقتل البكتيريا'
    },
    {
      question: 'كم مرة ينبض القلب في الدقيقة تقريباً؟',
      options: ['20-40 مرة', '60-100 مرة', '150-200 مرة', '300-400 مرة'],
      correctIndex: 1,
      explanation: 'معدل نبض القلب الطبيعي للبالغين في الراحة هو 60-100 نبضة في الدقيقة'
    }
  ];

  const getFormulas = () => {
    switch (simulationType) {
      case 'circulatory':
        return [
          { name: 'النتاج القلبي', formula: 'CO = SV × HR', description: 'حجم الضربة × معدل النبض' },
          { name: 'ضغط الدم', formula: 'BP = CO × TPR', description: 'النتاج القلبي × المقاومة الطرفية' }
        ];
      case 'respiratory':
        return [
          { name: 'حجم التنفس', formula: 'V = TV × RR', description: 'حجم المد × معدل التنفس' },
          { name: 'تبادل الغازات', formula: 'O₂ ⇌ CO₂', description: 'في الحويصلات الهوائية' }
        ];
      case 'nervous':
        return [
          { name: 'سرعة السيال', formula: 'v = d/t', description: 'المسافة / الزمن' },
          { name: 'جهد الفعل', formula: '-70mV → +30mV', description: 'تغير الجهد الكهربائي' }
        ];
      case 'digestive':
        return [
          { name: 'الهضم الكيميائي', formula: 'بروتين → أحماض أمينية', description: 'تكسير الروابط الببتيدية' },
          { name: 'الامتصاص', formula: 'غذاء → دم', description: 'عبر جدار الأمعاء' }
        ];
    }
  };

  const facts = [
    'القلب يضخ حوالي 7,500 لتر من الدم يومياً',
    'الرئتان تحتويان على حوالي 300 مليون حويصلة هوائية',
    'الدماغ يستهلك 20% من طاقة الجسم رغم أنه 2% من وزنه',
    'الأمعاء الدقيقة يصل طولها إلى 6 أمتار',
    'الإشارات العصبية تنتقل بسرعة تصل إلى 120 م/ث'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      // خلفية متدرجة
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, '#1a0a1e');
      gradient.addColorStop(1, '#0a0a12');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // نجوم
      for (let i = 0; i < 40; i++) {
        const x = (i * 137.5 + time * 0.3) % canvas.width;
        const y = (i * 73.3) % canvas.height;
        const alpha = 0.2 + Math.sin(time * 2 + i) * 0.15;
        ctx.fillStyle = `rgba(255, 100, 150, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (simulationType === 'circulatory') drawCirculatory(ctx, canvas);
      else if (simulationType === 'respiratory') drawRespiratory(ctx, canvas);
      else if (simulationType === 'nervous') drawNervous(ctx, canvas);
      else if (simulationType === 'digestive') drawDigestive(ctx, canvas);

      if (isPlaying) setTime(prev => prev + 0.03);
      animationId = requestAnimationFrame(animate);
    };

    const drawCirculatory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // القلب مع توهج
      const heartBeat = 1 + Math.sin(time * 5) * 0.12;
      
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#e74c3c';
      
      const heartGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 * heartBeat);
      heartGradient.addColorStop(0, '#ff6b6b');
      heartGradient.addColorStop(0.7, '#c0392b');
      heartGradient.addColorStop(1, '#8b0000');
      
      ctx.fillStyle = heartGradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 45 * heartBeat);
      ctx.bezierCurveTo(centerX - 55 * heartBeat, centerY - 22 * heartBeat, centerX - 55 * heartBeat, centerY - 65 * heartBeat, centerX, centerY - 35 * heartBeat);
      ctx.bezierCurveTo(centerX + 55 * heartBeat, centerY - 65 * heartBeat, centerX + 55 * heartBeat, centerY - 22 * heartBeat, centerX, centerY + 45 * heartBeat);
      ctx.fill();
      ctx.shadowBlur = 0;

      // الشرايين (أحمر)
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#e74c3c';
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 35);
      ctx.quadraticCurveTo(centerX, centerY - 110, centerX - 110, centerY - 160);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 35);
      ctx.quadraticCurveTo(centerX, centerY - 110, centerX + 110, centerY - 160);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 45);
      ctx.quadraticCurveTo(centerX - 90, centerY + 110, centerX - 130, centerY + 160);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 45);
      ctx.quadraticCurveTo(centerX + 90, centerY + 110, centerX + 130, centerY + 160);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // الأوردة (أزرق)
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 8;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#3498db';
      
      ctx.beginPath();
      ctx.moveTo(centerX - 160, centerY - 130);
      ctx.quadraticCurveTo(centerX - 90, centerY - 90, centerX - 35, centerY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + 160, centerY - 130);
      ctx.quadraticCurveTo(centerX + 90, centerY - 90, centerX + 35, centerY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // كريات الدم المتحركة
      for (let i = 0; i < 8; i++) {
        const t = ((time * 0.5 + i * 0.125) % 1);
        const x = centerX + (t - 0.5) * 220;
        const y = centerY - 35 - t * 130;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6b6b';
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // العناوين
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('القلب', centerX, centerY + 80);
      
      ctx.fillStyle = '#e74c3c';
      ctx.font = '14px Arial';
      ctx.fillText('شريان (دم مؤكسج)', centerX - 110, centerY - 175);
      
      ctx.fillStyle = '#3498db';
      ctx.fillText('وريد (دم غير مؤكسج)', centerX + 110, centerY - 145);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('الجهاز الدوري', canvas.width / 2, 45);
    };

    const drawRespiratory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const breathPhase = Math.sin(time * 2);
      const lungExpansion = 1 + breathPhase * 0.18;

      // القصبة الهوائية
      const tracheaGradient = ctx.createLinearGradient(centerX - 18, 80, centerX + 18, 80);
      tracheaGradient.addColorStop(0, '#bdc3c7');
      tracheaGradient.addColorStop(0.5, '#ecf0f1');
      tracheaGradient.addColorStop(1, '#bdc3c7');
      ctx.fillStyle = tracheaGradient;
      ctx.fillRect(centerX - 18, 80, 36, 110);

      // الشعب الهوائية
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, 190);
      ctx.quadraticCurveTo(centerX - 55, 210, centerX - 110, 265);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, 190);
      ctx.quadraticCurveTo(centerX + 55, 210, centerX + 110, 265);
      ctx.stroke();

      // الرئتان مع توهج
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#e8b4b8';
      
      const lungGradient = ctx.createRadialGradient(centerX - 130, 335, 20, centerX - 130, 335, 140 * lungExpansion);
      lungGradient.addColorStop(0, '#f8c4c8');
      lungGradient.addColorStop(1, '#d4a5a5');
      ctx.fillStyle = lungGradient;
      ctx.beginPath();
      ctx.ellipse(centerX - 130, 335, 100 * lungExpansion, 145 * lungExpansion, 0, 0, Math.PI * 2);
      ctx.fill();

      const lungGradient2 = ctx.createRadialGradient(centerX + 130, 335, 20, centerX + 130, 335, 140 * lungExpansion);
      lungGradient2.addColorStop(0, '#f8c4c8');
      lungGradient2.addColorStop(1, '#d4a5a5');
      ctx.fillStyle = lungGradient2;
      ctx.beginPath();
      ctx.ellipse(centerX + 130, 335, 100 * lungExpansion, 145 * lungExpansion, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // الحويصلات الهوائية
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const lx = centerX - 130 + Math.cos(angle) * 60 * lungExpansion;
        const ly = 335 + Math.sin(angle) * 85 * lungExpansion;
        ctx.fillStyle = '#c4a5a5';
        ctx.beginPath();
        ctx.arc(lx, ly, 18, 0, Math.PI * 2);
        ctx.fill();

        const rx = centerX + 130 + Math.cos(angle) * 60 * lungExpansion;
        const ry = 335 + Math.sin(angle) * 85 * lungExpansion;
        ctx.beginPath();
        ctx.arc(rx, ry, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // جزيئات O₂ (شهيق)
      if (breathPhase > 0) {
        for (let i = 0; i < 6; i++) {
          const y = 60 + breathPhase * 120 + i * 22;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#3498db';
          ctx.fillStyle = '#3498db';
          ctx.beginPath();
          ctx.arc(centerX - 6 + Math.sin(time + i) * 6, y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('O₂', centerX - 6, y + 3);
        }
      }

      // جزيئات CO₂ (زفير)
      if (breathPhase < 0) {
        for (let i = 0; i < 6; i++) {
          const y = 190 - breathPhase * 120 - i * 22;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#95a5a6';
          ctx.fillStyle = '#95a5a6';
          ctx.beginPath();
          ctx.arc(centerX + 6 + Math.sin(time + i) * 6, y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px Arial';
          ctx.fillText('CO₂', centerX + 6, y + 3);
        }
      }

      ctx.fillStyle = '#fff';
      ctx.font = '15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('القصبة الهوائية', centerX, 70);
      ctx.fillText('الرئة اليسرى', centerX - 130, 490);
      ctx.fillText('الرئة اليمنى', centerX + 130, 490);
      ctx.font = 'bold 22px Arial';
      ctx.fillText('الجهاز التنفسي', canvas.width / 2, 35);
      ctx.font = '16px Arial';
      ctx.fillStyle = breathPhase > 0 ? '#3498db' : '#95a5a6';
      ctx.fillText(breathPhase > 0 ? '🌬️ شهيق' : '💨 زفير', canvas.width / 2, 58);
    };

    const drawNervous = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;

      // الدماغ مع توهج
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#e8c4c4';
      const brainGradient = ctx.createRadialGradient(centerX, 130, 20, centerX, 130, 110);
      brainGradient.addColorStop(0, '#f8d4d4');
      brainGradient.addColorStop(1, '#d4a5a5');
      ctx.fillStyle = brainGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, 130, 115, 90, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // تفاصيل الدماغ
      ctx.strokeStyle = '#c4a5a5';
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(centerX - 50 + i * 22, 110 + Math.sin(i) * 25, 30, 0, Math.PI);
        ctx.stroke();
      }

      // الحبل الشوكي
      const spinalGradient = ctx.createLinearGradient(centerX - 14, 200, centerX + 14, 200);
      spinalGradient.addColorStop(0, '#d4c4b8');
      spinalGradient.addColorStop(0.5, '#f0e6d3');
      spinalGradient.addColorStop(1, '#d4c4b8');
      ctx.fillStyle = spinalGradient;
      ctx.fillRect(centerX - 14, 200, 28, 270);

      // الأعصاب
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f1c40f';
      
      const nervePoints = [
        { y: 240, length: 95 },
        { y: 310, length: 120 },
        { y: 380, length: 140 },
        { y: 450, length: 110 }
      ];

      nervePoints.forEach((nerve, i) => {
        ctx.beginPath();
        ctx.moveTo(centerX - 14, nerve.y);
        ctx.lineTo(centerX - 14 - nerve.length, nerve.y + 35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + 14, nerve.y);
        ctx.lineTo(centerX + 14 + nerve.length, nerve.y + 35);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // إشارات عصبية متحركة
      if (isPlaying) {
        const signalY = 200 + ((time * 110) % 270);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f39c12';
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(centerX, signalY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        nervePoints.forEach((nerve, i) => {
          const progress = ((time * 2.5 + i * 0.5) % 1);
          const sx = centerX - 14 - nerve.length * progress;
          const sy = nerve.y + 35 * progress;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#e74c3c';
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.arc(sx, sy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الدماغ', centerX, 55);
      ctx.fillText('الحبل الشوكي', centerX, 490);
      ctx.fillText('الأعصاب الطرفية', centerX - 120, 395);
      ctx.font = 'bold 22px Arial';
      ctx.fillText('الجهاز العصبي', canvas.width / 2, 30);
    };

    const drawDigestive = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;

      // الفم
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#e8b4b8';
      ctx.fillStyle = '#e8b4b8';
      ctx.beginPath();
      ctx.ellipse(centerX, 70, 48, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // المريء
      const esophGradient = ctx.createLinearGradient(centerX - 15, 95, centerX + 15, 95);
      esophGradient.addColorStop(0, '#c4a5a5');
      esophGradient.addColorStop(0.5, '#d4a5a5');
      esophGradient.addColorStop(1, '#c4a5a5');
      ctx.fillStyle = esophGradient;
      ctx.fillRect(centerX - 15, 95, 30, 90);

      // المعدة مع توهج
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#e8c4c4';
      const stomachGradient = ctx.createRadialGradient(centerX - 35, 225, 20, centerX - 35, 225, 80);
      stomachGradient.addColorStop(0, '#f8d4d4');
      stomachGradient.addColorStop(1, '#d4a5a5');
      ctx.fillStyle = stomachGradient;
      ctx.beginPath();
      ctx.ellipse(centerX - 35, 225, 80, 58, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // الأمعاء الدقيقة
      ctx.strokeStyle = '#d4a5a5';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - 35, 285);
      for (let i = 0; i < 7; i++) {
        const x = centerX - 90 + (i % 2) * 110;
        const y = 320 + i * 28;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // الأمعاء الغليظة
      ctx.strokeStyle = '#c0a5a5';
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.moveTo(centerX + 95, 445);
      ctx.lineTo(centerX + 115, 350);
      ctx.lineTo(centerX + 115, 305);
      ctx.quadraticCurveTo(centerX + 115, 280, centerX, 280);
      ctx.quadraticCurveTo(centerX - 115, 280, centerX - 115, 305);
      ctx.lineTo(centerX - 115, 445);
      ctx.stroke();

      // جزيئات الطعام المتحركة
      if (isPlaying) {
        const food1Y = 70 + (time * 25) % 120;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8b4513';
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(centerX, food1Y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const food2X = centerX - 25 + Math.sin(time * 2) * 15;
        const food2Y = 225 + Math.sin(time * 3) * 25;
        ctx.fillStyle = '#a0522d';
        ctx.beginPath();
        ctx.arc(food2X, food2Y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('الفم', centerX + 58, 75);
      ctx.fillText('المريء', centerX + 22, 135);
      ctx.fillText('المعدة', centerX + 58, 225);
      ctx.fillText('الأمعاء الدقيقة', centerX + 35, 365);
      ctx.fillText('الأمعاء الغليظة', centerX - 175, 365);
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('الجهاز الهضمي', canvas.width / 2, 30);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, simulationType, time]);

  const getExplanation = () => {
    switch (simulationType) {
      case 'circulatory': return 'الجهاز الدوري ينقل الدم المؤكسج من القلب عبر الشرايين إلى الأنسجة، ثم يعيد الدم غير المؤكسج عبر الأوردة إلى القلب ثم الرئتين.';
      case 'respiratory': return 'الجهاز التنفسي يدخل الأكسجين إلى الجسم ويخرج ثاني أكسيد الكربون. تبادل الغازات يحدث في الحويصلات الهوائية في الرئتين.';
      case 'nervous': return 'الجهاز العصبي ينقل الإشارات الكهربائية بين الدماغ وأجزاء الجسم المختلفة بسرعة فائقة للتحكم في جميع وظائف الجسم.';
      case 'digestive': return 'الجهاز الهضمي يحلل الطعام ميكانيكياً وكيميائياً لاستخراج المغذيات التي يحتاجها الجسم ويمتصها في الأمعاء الدقيقة.';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (simulationType) {
      case 'circulatory': return Heart;
      case 'respiratory': return Wind;
      case 'nervous': return Brain;
      case 'digestive': return Utensils;
    }
  };

  return (
    <SimulationLayout
      title="أجهزة جسم الإنسان"
      titleGradient="from-red-400 to-pink-400"
      backgroundGradient="from-slate-900 via-red-900/30 to-slate-900"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <SimulationCard className="lg:col-span-2" color="red">
          <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg" />
        </SimulationCard>

        <div className="space-y-4">
          <SimulationCard title="الجهاز" icon={getIcon()} color="red">
            <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
              <TabsList className="grid grid-cols-2 gap-1 bg-slate-800/50">
                <TabsTrigger value="circulatory" className="text-xs data-[state=active]:bg-red-600">
                  <Heart className="h-3 w-3 ml-1" />
                  الدوري
                </TabsTrigger>
                <TabsTrigger value="respiratory" className="text-xs data-[state=active]:bg-red-600">
                  <Wind className="h-3 w-3 ml-1" />
                  التنفسي
                </TabsTrigger>
                <TabsTrigger value="nervous" className="text-xs data-[state=active]:bg-red-600">
                  <Brain className="h-3 w-3 ml-1" />
                  العصبي
                </TabsTrigger>
                <TabsTrigger value="digestive" className="text-xs data-[state=active]:bg-red-600">
                  <Utensils className="h-3 w-3 ml-1" />
                  الهضمي
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </SimulationCard>

          <SimulationControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => setTime(0)}
            primaryColor="red"
          />

          <SimulationCard title="المعلومات العلمية" icon={Activity} color="pink" delay={0.2}>
            <InfoSection
              explanation={getExplanation()}
              formulas={getFormulas()}
              facts={facts}
            />
          </SimulationCard>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <QuizSection questions={quizQuestions} title="اختبر معلوماتك في أجهزة جسم الإنسان" />
      </motion.div>
    </SimulationLayout>
  );
};

export default HumanBodySimulation;
