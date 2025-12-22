import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Waves, Radio, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WavesAndSoundSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [simulationType, setSimulationType] = useState<'wave' | 'doppler' | 'interference'>('wave');
  const [dopplerSpeed, setDopplerSpeed] = useState(30);
  const [time, setTime] = useState(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // Calculate wavelength
  const speedOfSound = 343; // m/s
  const wavelength = speedOfSound / frequency;

  // Play sound
  const toggleSound = useCallback(() => {
    if (isSoundPlaying) {
      oscillatorRef.current?.stop();
      oscillatorRef.current = null;
      setIsSoundPlaying(false);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.type = waveType;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.start();
      
      oscillatorRef.current = oscillator;
      setIsSoundPlaying(true);
    }
  }, [isSoundPlaying, frequency, waveType]);

  // Update oscillator when parameters change
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
      oscillatorRef.current.type = waveType;
    }
  }, [frequency, waveType]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (simulationType === 'wave') {
        // Draw main wave
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const phase = (x / 100) * (frequency / 100) - time * 3;
          let y = centerY;

          switch (waveType) {
            case 'sine':
              y = centerY + amplitude * Math.sin(phase);
              break;
            case 'square':
              y = centerY + amplitude * Math.sign(Math.sin(phase));
              break;
            case 'triangle':
              y = centerY + amplitude * (2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1);
              break;
            case 'sawtooth':
              y = centerY + amplitude * (2 * ((phase / (2 * Math.PI)) % 1) - 1);
              break;
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw particles moving with wave
        ctx.fillStyle = '#fbbf24';
        for (let x = 50; x < width; x += 80) {
          const phase = (x / 100) * (frequency / 100) - time * 3;
          let y = centerY;

          switch (waveType) {
            case 'sine':
              y = centerY + amplitude * Math.sin(phase);
              break;
            case 'square':
              y = centerY + amplitude * Math.sign(Math.sin(phase));
              break;
            case 'triangle':
              y = centerY + amplitude * (2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1);
              break;
            case 'sawtooth':
              y = centerY + amplitude * (2 * ((phase / (2 * Math.PI)) % 1) - 1);
              break;
          }

          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`الموجة ${waveType === 'sine' ? 'الجيبية' : waveType === 'square' ? 'المربعة' : waveType === 'triangle' ? 'المثلثية' : 'المنشارية'}`, width / 2, 30);

        // Draw wavelength indicator
        const waveWidth = 100 / (frequency / 440);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(100, centerY - amplitude - 30);
        ctx.lineTo(100, centerY + amplitude + 30);
        ctx.moveTo(100 + waveWidth, centerY - amplitude - 30);
        ctx.lineTo(100 + waveWidth, centerY + amplitude + 30);
        ctx.stroke();
        ctx.setLineDash([]);

        // Wavelength arrow
        ctx.beginPath();
        ctx.moveTo(100, centerY - amplitude - 20);
        ctx.lineTo(100 + waveWidth, centerY - amplitude - 20);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.font = '14px Arial';
        ctx.fillText('λ', 100 + waveWidth / 2, centerY - amplitude - 35);

      } else if (simulationType === 'doppler') {
        // Doppler effect simulation
        const sourceX = width / 2 + Math.sin(time) * 200;
        const sourceY = centerY;

        // Draw sound source (ambulance)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sourceX - 40, sourceY - 20, 80, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚑', sourceX, sourceY + 5);

        // Draw expanding circles (sound waves)
        const velocity = Math.cos(time) * dopplerSpeed;
        
        for (let i = 1; i <= 8; i++) {
          const baseRadius = i * 40 + (time * 50) % 40;
          
          // Waves are compressed in front, stretched behind
          const frontRadius = baseRadius - velocity * i * 0.5;
          const backRadius = baseRadius + velocity * i * 0.5;
          
          const opacity = Math.max(0, 1 - i / 8);
          
          // Front waves (compressed - higher frequency)
          ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sourceX + velocity * 3, sourceY, Math.max(10, frontRadius), -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
          
          // Back waves (stretched - lower frequency)
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.beginPath();
          ctx.arc(sourceX - velocity * 3, sourceY, Math.max(10, backRadius), Math.PI / 2, -Math.PI / 2);
          ctx.stroke();
        }

        // Observer
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(100, centerY, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('👤', 100, centerY + 7);

        // Info
        const observerFreq = frequency * (speedOfSound / (speedOfSound - velocity));
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('تأثير دوبلر', width / 2, 30);
        ctx.font = '14px Arial';
        ctx.fillText(`التردد المصدر: ${frequency} Hz`, width / 2, height - 50);
        ctx.fillText(`التردد المُلاحظ: ${observerFreq.toFixed(0)} Hz`, width / 2, height - 30);

      } else if (simulationType === 'interference') {
        // Wave interference
        const source1X = width / 3;
        const source2X = (2 * width) / 3;
        const sourceY = height / 2;

        // Draw sources
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(source1X, sourceY, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(source2X, sourceY, 15, 0, 2 * Math.PI);
        ctx.fill();

        // Calculate interference pattern
        const resolution = 4;
        for (let x = 0; x < width; x += resolution) {
          for (let y = 0; y < height; y += resolution) {
            const d1 = Math.sqrt((x - source1X) ** 2 + (y - sourceY) ** 2);
            const d2 = Math.sqrt((x - source2X) ** 2 + (y - sourceY) ** 2);
            
            const wave1 = Math.sin(d1 / 20 - time * 3);
            const wave2 = Math.sin(d2 / 20 - time * 3);
            const combined = (wave1 + wave2) / 2;
            
            const intensity = Math.abs(combined);
            const hue = combined > 0 ? 120 : 0; // Green for constructive, red for destructive
            
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${intensity * 0.5})`;
            ctx.fillRect(x, y, resolution, resolution);
          }
        }

        // Labels
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('تداخل الموجات', width / 2, 30);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#22c55e';
        ctx.fillText('أخضر: تداخل بنّاء', 100, height - 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('أحمر: تداخل هدّام', width - 100, height - 20);
      }

      setTime(prev => prev + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frequency, amplitude, waveType, simulationType, dopplerSpeed, time]);

  const resetSimulation = () => {
    setTime(0);
    setFrequency(440);
    setAmplitude(50);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/scientific-simulations')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          العودة
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          مختبر الموجات والصوت
        </h1>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-blue-500/30 p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-lg bg-slate-900"
            />
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                onClick={toggleSound}
                className={isSoundPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                <Volume2 className="w-5 h-5 mr-2" />
                {isSoundPlaying ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-blue-500 text-blue-400"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-blue-500/30 p-4">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              لوحة التحكم
            </h3>

            {/* Simulation Type */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">نوع المحاكاة</label>
              <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as any)}>
                <TabsList className="grid grid-cols-3 bg-slate-700">
                  <TabsTrigger value="wave" className="text-xs">موجة</TabsTrigger>
                  <TabsTrigger value="doppler" className="text-xs">دوبلر</TabsTrigger>
                  <TabsTrigger value="interference" className="text-xs">تداخل</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {simulationType === 'wave' && (
              <>
                {/* Wave Type */}
                <div className="mb-6">
                  <label className="block text-sm text-slate-300 mb-2">شكل الموجة</label>
                  <Tabs value={waveType} onValueChange={(v) => setWaveType(v as any)}>
                    <TabsList className="grid grid-cols-2 bg-slate-700">
                      <TabsTrigger value="sine" className="text-xs">جيبية</TabsTrigger>
                      <TabsTrigger value="square" className="text-xs">مربعة</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid grid-cols-2 bg-slate-700 mt-1">
                      <TabsTrigger value="triangle" className="text-xs">مثلثية</TabsTrigger>
                      <TabsTrigger value="sawtooth" className="text-xs">منشارية</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Amplitude */}
                <div className="mb-6">
                  <label className="block text-sm text-slate-300 mb-2">
                    السعة: {amplitude} px
                  </label>
                  <Slider
                    value={[amplitude]}
                    onValueChange={(v) => setAmplitude(v[0])}
                    min={10}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Frequency */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                التردد: {frequency} Hz
              </label>
              <Slider
                value={[frequency]}
                onValueChange={(v) => setFrequency(v[0])}
                min={100}
                max={2000}
                step={10}
                className="w-full"
              />
            </div>

            {simulationType === 'doppler' && (
              <div className="mb-6">
                <label className="block text-sm text-slate-300 mb-2">
                  سرعة المصدر: {dopplerSpeed} m/s
                </label>
                <Slider
                  value={[dopplerSpeed]}
                  onValueChange={(v) => setDopplerSpeed(v[0])}
                  min={5}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-800/50 border-green-500/30 p-4">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <Waves className="w-5 h-5" />
              المعلومات
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">التردد:</span>
                <span className="text-green-300">{frequency} Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الطول الموجي:</span>
                <span className="text-blue-300">{wavelength.toFixed(3)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سرعة الصوت:</span>
                <span className="text-yellow-300">{speedOfSound} m/s</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300 leading-relaxed">
                {simulationType === 'wave' && 
                  'الموجات الصوتية هي اهتزازات ميكانيكية تنتشر في الوسط. تتميز بالتردد والسعة والطول الموجي.'}
                {simulationType === 'doppler' && 
                  'تأثير دوبلر: يتغير التردد المُلاحظ عندما يتحرك المصدر أو المراقب. يُضغط أمام المصدر ويتمدد خلفه.'}
                {simulationType === 'interference' && 
                  'تداخل الموجات: عندما تلتقي موجتان، تتجمعان (تداخل بنّاء) أو تتلاشيان (تداخل هدّام).'}
              </p>
            </div>
          </Card>

          {/* Formulas */}
          <Card className="bg-slate-800/50 border-purple-500/30 p-4">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5" />
              القوانين
            </h3>
            
            <div className="space-y-2 text-sm font-mono">
              <div className="p-2 bg-slate-700/50 rounded text-center">
                v = f × λ
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-center">
                f' = f × (v ± v₀) / (v ∓ vₛ)
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-center">
                y = A × sin(2πft)
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WavesAndSoundSimulation;
