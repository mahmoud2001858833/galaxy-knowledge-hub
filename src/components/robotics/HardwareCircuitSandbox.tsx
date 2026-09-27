import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  Terminal, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  Maximize2, 
  Minimize2,
  Copy,
  Radio,
  Eye,
  Activity,
  Code2,
  Wifi,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface PresetSketch {
  id: string;
  name: string;
  board: 'esp32' | 'arduino';
  description: string;
  wokwiUrl?: string;
  code: string;
}

const PRESET_SKETCHES: PresetSketch[] = [
  {
    id: 'ultrasonic-servo',
    name: 'رادار الموجات فوق الصوتية وتوجيه السيرفو',
    board: 'arduino',
    description: 'قراءة حساس HC-SR04 وتحريك ذراع السيرفو تلقائياً وفق المسافة المقاسة مع إطلاق تنبيه ضوئي.',
    wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
    code: `// Arduino Uno - Ultrasonic Smart Radar
#include <Servo.h>

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int SERVO_PIN = 6;
const int RED_LED = 13;
const int GREEN_LED = 12;

Servo radarServo;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  radarServo.attach(SERVO_PIN);
  Serial.println("[RADAR] Ultrasonic Sweep Initialized.");
}

void loop() {
  // Trigger ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  if (distanceCm < 30) {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    radarServo.write(145); // Block position
  } else {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    radarServo.write(45); // Free path
  }
  delay(100);
}`
  },
  {
    id: 'esp32-oled-iot',
    name: 'محطة ESP32 وشاشة OLED اللاسلكية',
    board: 'esp32',
    description: 'قراءة الحساسات وعرض البيانات على شاشة I2C SSD1306 وبثها عبر Wi-Fi و MQTT.',
    wokwiUrl: 'https://wokwi.com/projects/new/esp32',
    code: `// ESP32 NodeMCU - Smart IoT Telemetry Station
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

float temperature = 24.5;
float humidity = 58.0;
int batteryLevel = 94;

void setup() {
  Serial.begin(115200);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(10, 10);
  display.println("GALAXY ROBOTICS");
  display.println("ESP32 IoT Node Online");
  display.display();
  Serial.println("[ESP32] Wi-Fi Connected. IP: 192.168.1.104");
}

void loop() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("STATUS: ONLINE (MQTT)");
  display.setCursor(0, 16);
  display.printf("TEMP: %.1f C", temperature);
  display.setCursor(0, 30);
  display.printf("HUMID: %.1f %%", humidity);
  display.setCursor(0, 44);
  display.printf("BATTERY: %d %%", batteryLevel);
  display.display();
  delay(500);
}`
  },
  {
    id: 'motor-pwm',
    name: 'التحكم بسرعات المحركات بنظام PWM والتسارع',
    board: 'arduino',
    description: 'توليد نبضات PWM دقيقة للتحكم بمحركات السيرفو والـ DC مع تنظيم السرعة تدريجياً.',
    wokwiUrl: 'https://wokwi.com/projects/new/arduino-nano',
    code: `// L298N Motor Driver PWM Controller
const int ENA = 5;  // PWM speed
const int IN1 = 3;  // Direction 1
const int IN2 = 4;  // Direction 2

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  // Forward accelerate
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  for (int speed = 0; speed <= 255; speed += 15) {
    analogWrite(ENA, speed);
    Serial.print("Motor PWM Speed: ");
    Serial.println(speed);
    delay(50);
  }
  delay(500);
}`
  }
];

export const HardwareCircuitSandbox: React.FC = () => {
  const { toast } = useToast();
  const [selectedSketchId, setSelectedSketchId] = useState<string>('ultrasonic-servo');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  
  // Interactive Breadboard Simulation States
  const [ultrasonicDistance, setUltrasonicDistance] = useState<number>(45); // cm
  const [servoAngle, setServoAngle] = useState<number>(45); // deg
  const [redLed, setRedLed] = useState<boolean>(false);
  const [greenLed, setGreenLed] = useState<boolean>(true);
  const [blueLed, setBlueLed] = useState<boolean>(false);
  const [yellowLed, setYellowLed] = useState<boolean>(false);
  const [simTemperature, setSimTemperature] = useState<number>(25.6);
  const [simHumidity, setSimHumidity] = useState<number>(54.2);
  const [showWokwiEmbed, setShowWokwiEmbed] = useState<boolean>(false);

  // Serial Terminal Log
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[INIT] Virtual Microcontroller Core initialized.',
    '[POWER] 5.0V / 3.3V Power Rails Stabilized.',
    '[GPIO] Pins 9, 10, 6, 12, 13 configured.',
    '[SIM] Ready for real-time cycle execution.'
  ]);

  const activeSketch = PRESET_SKETCHES.find(s => s.id === selectedSketchId) || PRESET_SKETCHES[0];

  // Simulation loop reacting to sensor slider
  useEffect(() => {
    if (!isRunning) return;

    if (activeSketch.id === 'ultrasonic-servo') {
      if (ultrasonicDistance < 30) {
        setRedLed(true);
        setGreenLed(false);
        setServoAngle(140);
      } else {
        setRedLed(false);
        setGreenLed(true);
        setServoAngle(40);
      }
    } else if (activeSketch.id === 'esp32-oled-iot') {
      setBlueLed(true);
      setGreenLed(true);
      setRedLed(simTemperature > 35);
      setYellowLed(simHumidity > 70);
    } else if (activeSketch.id === 'motor-pwm') {
      setServoAngle(Math.round((ultrasonicDistance / 400) * 180));
      setYellowLed(true);
    }
  }, [ultrasonicDistance, isRunning, activeSketch.id, simTemperature, simHumidity]);

  // Periodic Serial Stream
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString('ar-JO');
      if (activeSketch.id === 'ultrasonic-servo') {
        const isAlert = ultrasonicDistance < 30;
        setSerialLogs(prev => [
          ...prev.slice(-15),
          `[${timeStr}] Dist: ${ultrasonicDistance}cm | Servo: ${servoAngle}° | LED: ${isAlert ? 'RED (OBSTACLE)' : 'GREEN (CLEAR)'}`
        ]);
      } else if (activeSketch.id === 'esp32-oled-iot') {
        setSerialLogs(prev => [
          ...prev.slice(-15),
          `[${timeStr}] [MQTT PUB] Topic: galaxy/sensors -> {"temp": ${simTemperature}, "humid": ${simHumidity}, "rssi": -62dBm}`
        ]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, activeSketch.id, ultrasonicDistance, servoAngle, simTemperature, simHumidity]);

  const copyCode = () => {
    navigator.clipboard.writeText(activeSketch.code);
    toast({
      title: "تم نسخ الكود البرمجي ✨",
      description: "يمكنك لصقه مباشرة داخل بيئة Arduino IDE أو Wokwi."
    });
  };

  return (
    <div className="space-y-8 text-right">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>محاكي العتاد المدمج (Browser-Based Hardware Simulation)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            المختبر الافتراضي للدوائر الإلكترونية ومتحكمات Arduino & ESP32
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
            قم ببرمجة واختبار الدوائر والحساسات والمحركات مباشرة في المتصفح دون الحاجة لشراء قطع مادية في البداية.
          </p>
        </div>

        {/* Wokwi Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showWokwiEmbed ? 'default' : 'outline'}
            onClick={() => setShowWokwiEmbed(!showWokwiEmbed)}
            className="text-xs rounded-xl font-bold gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{showWokwiEmbed ? 'عرض لوحة التجارب الافتراضية' : 'تضمين بيئة Wokwi السحابية'}</span>
          </Button>
          <a
            href={activeSketch.wokwiUrl || 'https://wokwi.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <span>فتح Wokwi الخارجي</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Preset Sketch Selector Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {PRESET_SKETCHES.map(sketch => (
          <button
            key={sketch.id}
            onClick={() => setSelectedSketchId(sketch.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedSketchId === sketch.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/40'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sketch.name}</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/20">
              {sketch.board}
            </Badge>
          </button>
        ))}
      </div>

      {/* Main Interactive Workstation */}
      {showWokwiEmbed ? (
        /* Wokwi Cloud Embedded Simulator */
        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 shadow-2xl">
          <div className="p-3 bg-slate-900 rounded-2xl flex items-center justify-between text-xs text-slate-300 mb-2 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Wokwi Cloud Simulation Sandbox — {activeSketch.board.toUpperCase()}
            </span>
            <span className="text-slate-500">Live WebAssembly Core</span>
          </div>
          <div className="w-full h-[620px] rounded-2xl overflow-hidden bg-slate-900">
            <iframe
              src={activeSketch.wokwiUrl || 'https://wokwi.com/projects/new/arduino-uno'}
              title="Wokwi Hardware Simulator"
              className="w-full h-full border-0"
              allow="camera; microphone"
            />
          </div>
        </div>
      ) : (
        /* Built-in Virtual Breadboard & Instrument Visualizer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Virtual Hardware Breadboard & Components */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  لوحة التجارب والمكونات التفاعلية (Virtual Breadboard)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isRunning ? 'destructive' : 'default'}
                  onClick={() => setIsRunning(!isRunning)}
                  className="rounded-xl text-xs font-bold gap-1"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'إيقاف مؤقت' : 'تشغيل الدائرة'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUltrasonicDistance(45);
                    setSimTemperature(25.6);
                    setSimHumidity(54.2);
                  }}
                  className="rounded-xl text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة تعيين
                </Button>
              </div>
            </div>

            {/* Virtual Board Layout Visualizer */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-6 text-white space-y-6">
              {/* Microcontroller Emblem */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">
                      {activeSketch.board === 'esp32' ? 'ESP32 Wi-Fi NodeMCU (Dual Core 240MHz)' : 'Arduino Uno R3 (ATmega328P)'}
                    </h5>
                    <p className="text-[11px] text-slate-400 font-mono">
                      GPIO Logic: 3.3V/5V • Clock: 16MHz • Flash: 4MB
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-xs">
                  {isRunning ? 'STATUS: EXECUTING' : 'STATUS: HALTED'}
                </Badge>
              </div>

              {/* Component Rows: LEDs, Servo, Ultrasonic, OLED */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. LEDs Bank */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">
                    مصفوفة مصابيح LED والحالة المنطقية:
                  </span>
                  <div className="flex items-center justify-around py-2">
                    {/* Red LED */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                        redLed 
                          ? 'bg-rose-500 border-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.9)] animate-pulse' 
                          : 'bg-rose-950/40 border-rose-900/50'
                      }`} />
                      <span className="text-[10px] text-slate-400 font-mono">D13 (Red)</span>
                    </div>

                    {/* Green LED */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                        greenLed 
                          ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.9)]' 
                          : 'bg-emerald-950/40 border-emerald-900/50'
                      }`} />
                      <span className="text-[10px] text-slate-400 font-mono">D12 (Green)</span>
                    </div>

                    {/* Blue LED */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                        blueLed 
                          ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.9)]' 
                          : 'bg-cyan-950/40 border-cyan-900/50'
                      }`} />
                      <span className="text-[10px] text-slate-400 font-mono">D2 (Blue)</span>
                    </div>

                    {/* Yellow LED */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                        yellowLed 
                          ? 'bg-amber-500 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.9)]' 
                          : 'bg-amber-950/40 border-amber-900/50'
                      }`} />
                      <span className="text-[10px] text-slate-400 font-mono">D5 (Yellow)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Micro Servo Angle Gauge */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">محرك السيرفو المؤازر (SG90):</span>
                    <span className="text-amber-400 font-mono font-bold">{servoAngle}°</span>
                  </div>
                  {/* Visual Servo Arm Dial */}
                  <div className="relative h-20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center relative shadow-inner">
                      {/* Rotating Horn Needle */}
                      <motion.div
                        animate={{ rotate: servoAngle - 90 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="w-1.5 h-10 bg-amber-400 rounded-full origin-bottom absolute bottom-8 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      />
                      <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-600 z-10" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0° (أدنى)</span>
                    <span>90° (منتصف)</span>
                    <span>180° (أقصى)</span>
                  </div>
                </div>

                {/* 3. Ultrasonic Distance Sensor Slider */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">مستشعر المسافة (HC-SR04):</span>
                    <span className="text-cyan-400 font-mono font-bold">{ultrasonicDistance} سم</span>
                  </div>
                  <Slider
                    value={[ultrasonicDistance]}
                    min={4}
                    max={150}
                    step={1}
                    onValueChange={vals => setUltrasonicDistance(vals[0])}
                    className="py-1"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="text-rose-400 font-semibold">عائق قريب (&lt;30cm)</span>
                    <span className="text-emerald-400 font-semibold">مسار آمن (&gt;30cm)</span>
                  </div>
                </div>

                {/* 4. OLED SSD1306 Display Simulation */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">شاشة العرض I2C OLED (0.96"):</span>
                    <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 font-mono">
                      Addr: 0x3C
                    </Badge>
                  </div>
                  {/* OLED Screen simulation */}
                  <div className="h-20 rounded-lg bg-black border-2 border-slate-700 p-2 font-mono text-[10px] text-cyan-400 flex flex-col justify-between shadow-inner">
                    <div className="flex justify-between border-b border-cyan-950 pb-0.5">
                      <span>GALAXY ROBOTICS</span>
                      <span className="animate-pulse">● WI-FI</span>
                    </div>
                    <div className="space-y-0.5">
                      <div>DIST: {ultrasonicDistance} cm {ultrasonicDistance < 30 ? '[WARN]' : '[SAFE]'}</div>
                      <div>SERVO: {servoAngle} DEG | PWM: OK</div>
                    </div>
                    <div className="text-[9px] text-slate-400 flex justify-between">
                      <span>T: {simTemperature}°C</span>
                      <span>H: {simHumidity}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & Serial Monitor */}
          <div className="lg:col-span-5 space-y-6">
            {/* Code Panel */}
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-500" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    الكود المصدري للدائرة (C++ / Arduino)
                  </h4>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCode}
                  className="rounded-xl text-xs gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </Button>
              </div>

              {/* Code Pre container */}
              <div className="h-64 rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto dir-ltr text-left">
                <pre className="text-emerald-400 whitespace-pre">
                  {activeSketch.code}
                </pre>
              </div>
            </div>

            {/* Serial Monitor Console */}
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-500" />
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    الشاشة التسلسلية (Serial Monitor @ 115200 Baud)
                  </h5>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSerialLogs(['[CLEARED] Monitor reset.'])}
                  className="text-[11px] h-7 px-2 text-slate-500"
                >
                  مسح السجل
                </Button>
              </div>

              <div className="h-44 rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-y-auto space-y-1 dir-ltr text-left">
                {serialLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    {log.includes('RED') || log.includes('WARN') ? (
                      <span className="text-rose-400 font-semibold">{log}</span>
                    ) : log.includes('GREEN') || log.includes('SAFE') ? (
                      <span className="text-emerald-400">{log}</span>
                    ) : (
                      <span className="text-slate-300">{log}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
