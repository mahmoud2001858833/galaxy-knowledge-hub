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
  Sparkles,
  Gauge,
  SlidersHorizontal,
  Compass,
  ArrowRight
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
    description: 'قراءة حساس HC-SR04 وتحريك ذراع السيرفو تلقائياً وفق المسافة المقاسة مع إطلاق تنبيه ضوئي ورسائل تسلسلية.',
    wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
    code: `// Arduino Uno - Ultrasonic Smart Radar System
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
    radarServo.write(145); // Obstacle avoidance position
  } else {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    radarServo.write(45);  // Free path position
  }
  delay(100);
}`
  },
  {
    id: 'pid-line-follower',
    name: 'روبوت تتبع الخط التناسبي (PID Line Follower)',
    board: 'arduino',
    description: 'خوارزمية تحكم تناسبية PID مع مصفوفة حساسات الأشعة تحت الحمراء IR لتعديل سرعة المحركين ENA و ENB بسلاسة.',
    wokwiUrl: 'https://wokwi.com/projects/new/arduino-nano',
    code: `// Arduino Nano - High-Speed PID Line Follower
const int LEFT_IR = A0;
const int CENTER_IR = A1;
const int RIGHT_IR = A2;
const int ENA = 5;  // Left Motor PWM
const int ENB = 6;  // Right Motor PWM
const int IN1 = 7;
const int IN2 = 8;

float Kp = 2.4, Kd = 1.1;
int lastError = 0;
int baseSpeed = 160;

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  Serial.println("[ROBOT] PID Line Follower Active.");
}

void loop() {
  int lVal = analogRead(LEFT_IR) > 500 ? 1 : 0;
  int cVal = analogRead(CENTER_IR) > 500 ? 1 : 0;
  int rVal = analogRead(RIGHT_IR) > 500 ? 1 : 0;

  int error = (rVal * 2) - (lVal * 2);
  int pidAdjustment = (Kp * error) + (Kd * (error - lastError));
  lastError = error;

  int leftMotorSpeed = constrain(baseSpeed + pidAdjustment, 0, 255);
  int rightMotorSpeed = constrain(baseSpeed - pidAdjustment, 0, 255);

  analogWrite(ENA, leftMotorSpeed);
  analogWrite(ENB, rightMotorSpeed);
  delay(20);
}`
  },
  {
    id: 'esp32-oled-iot',
    name: 'محطة ESP32 وشاشة OLED وبث MQTT السحابي',
    board: 'esp32',
    description: 'قراءة الحساسات وعرض البيانات على شاشة I2C SSD1306 وبث القياسات الحية عبر بروتوكول MQTT و Wi-Fi.',
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
    id: 'joystick-arm-control',
    name: 'تحكم الذراع بمقبض أنالوج تناظري (Dual Joystick)',
    board: 'arduino',
    description: 'قراءة محوري X و Y من مقبض التحكم التناظري لتحريك مفاصل السيرفو بدقة ونعومة عبر تحويل ADC إلى زوايا.',
    wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
    code: `// Arduino Uno - 2-Axis Joystick Robotic Arm Controller
#include <Servo.h>

const int JOY_X = A0;
const int JOY_Y = A1;
const int BASE_SERVO_PIN = 3;
const int ARM_SERVO_PIN = 5;

Servo baseServo;
Servo armServo;

int baseAngle = 90;
int armAngle = 45;

void setup() {
  Serial.begin(115200);
  baseServo.attach(BASE_SERVO_PIN);
  armServo.attach(ARM_SERVO_PIN);
  baseServo.write(baseAngle);
  armServo.write(armAngle);
}

void loop() {
  int xVal = analogRead(JOY_X);
  int yVal = analogRead(JOY_Y);

  if (xVal > 600 && baseAngle < 175) baseAngle += 2;
  if (xVal < 400 && baseAngle > 5)   baseAngle -= 2;
  if (yVal > 600 && armAngle < 160)  armAngle += 2;
  if (yVal < 400 && armAngle > 10)   armAngle -= 2;

  baseServo.write(baseAngle);
  armServo.write(armAngle);
  Serial.printf("[SERVO] Base: %d deg | Arm: %d deg\\n", baseAngle, armAngle);
  delay(30);
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

  // Virtual Oscilloscope Canvas Ref
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Serial Terminal Log
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[INIT] Virtual Microcontroller Core initialized.',
    '[POWER] 5.0V / 3.3V Power Rails Stabilized.',
    '[GPIO] PWM Timers configured (50Hz Servo Base).',
    '[SIM] Ready for real-time hardware cycle execution.'
  ]);

  const activeSketch = PRESET_SKETCHES.find(s => s.id === selectedSketchId) || PRESET_SKETCHES[0];

  // PWM Calculation
  // Servo standard: 50 Hz (Period T = 20ms).
  // 0 deg = 1.0ms pulse, 90 deg = 1.5ms pulse, 180 deg = 2.0ms pulse.
  const pulseWidthMs = Number((1.0 + (servoAngle / 180.0) * 1.0).toFixed(2));
  const dutyCyclePercent = Number(((pulseWidthMs / 20.0) * 100).toFixed(1));

  // Simulation loop reacting to sensor slider
  useEffect(() => {
    if (!isRunning) return;

    if (activeSketch.id === 'ultrasonic-servo') {
      if (ultrasonicDistance < 30) {
        setRedLed(true);
        setGreenLed(false);
        setServoAngle(145);
      } else {
        setRedLed(false);
        setGreenLed(true);
        setServoAngle(45);
      }
    } else if (activeSketch.id === 'pid-line-follower') {
      setGreenLed(true);
      setYellowLed(true);
      setServoAngle(Math.min(180, Math.max(0, Math.round(90 + (ultrasonicDistance - 45) * 1.8))));
    } else if (activeSketch.id === 'esp32-oled-iot') {
      setBlueLed(true);
      setGreenLed(true);
      setRedLed(simTemperature > 35);
      setYellowLed(simHumidity > 70);
    } else if (activeSketch.id === 'joystick-arm-control') {
      setYellowLed(true);
      setBlueLed(true);
      setServoAngle(Math.round((ultrasonicDistance / 150) * 180));
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
          `[${timeStr}] Dist: ${ultrasonicDistance}cm | Servo: ${servoAngle}° | Pulse: ${pulseWidthMs}ms | LED: ${isAlert ? 'RED (OBSTACLE)' : 'GREEN (CLEAR)'}`
        ]);
      } else if (activeSketch.id === 'pid-line-follower') {
        setSerialLogs(prev => [
          ...prev.slice(-15),
          `[${timeStr}] [PID] IR_Center=1, Error=0, ENA=160, ENB=160 | Heading: ${servoAngle}°`
        ]);
      } else if (activeSketch.id === 'esp32-oled-iot') {
        setSerialLogs(prev => [
          ...prev.slice(-15),
          `[${timeStr}] [MQTT PUB] Topic: galaxy/sensors -> {"temp": ${simTemperature}, "humid": ${simHumidity}, "rssi": -62dBm}`
        ]);
      } else if (activeSketch.id === 'joystick-arm-control') {
        setSerialLogs(prev => [
          ...prev.slice(-15),
          `[${timeStr}] [JOYSTICK] ADC_X: ${Math.round(ultrasonicDistance * 6.8)}, Servo_Target: ${servoAngle}°`
        ]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, activeSketch.id, ultrasonicDistance, servoAngle, simTemperature, simHumidity, pulseWidthMs]);

  // Draw Live Virtual Oscilloscope (PWM Wave Analyzer)
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark Oscilloscope Grid
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;

      // Horizontal Divs
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      // Vertical Divs
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Zero baseline
      const baselineY = canvas.height - 25;
      const highY = 25;

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(canvas.width, baselineY);
      ctx.stroke();

      // Render Square Wave: Period = 120px (representing 20ms)
      const periodPx = 140;
      const highPx = Math.max(8, (pulseWidthMs / 20.0) * periodPx);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      phase = (phase + 1) % periodPx;

      for (let x = -periodPx; x < canvas.width + periodPx; x += periodPx) {
        const startX = x - phase;
        // Rising edge
        ctx.moveTo(startX, baselineY);
        ctx.lineTo(startX, highY);
        // High pulse
        ctx.lineTo(startX + highPx, highY);
        // Falling edge
        ctx.lineTo(startX + highPx, baselineY);
        // Low remainder
        ctx.lineTo(startX + periodPx, baselineY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Annotations
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Cairo, monospace';
      ctx.fillText(`CH1: 5.0V / Div • 5ms / Div • f=50Hz (T=20ms)`, 10, 15);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`t_on = ${pulseWidthMs} ms  |  Duty = ${dutyCyclePercent}%`, 10, canvas.height - 8);

      animFrame = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animFrame);
  }, [pulseWidthMs, dutyCyclePercent]);

  const copyCode = () => {
    navigator.clipboard.writeText(activeSketch.code);
    toast({
      title: "تم نسخ الكود البرمجي ✨",
      description: "يمكنك لصقه مباشرة داخل بيئة Arduino IDE أو Wokwi."
    });
  };

  return (
    <div className="space-y-6 text-right w-full">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl text-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>مختبر العتاد المدمج والأوسيلوسكوب الذكي</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            المختبر الافتراضي للدوائر الإلكترونية ومتحكمات Arduino & ESP32
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            برمج واختبر الدوائر والحساسات ومحركات السيرفو مع راسم الإشارة (Oscilloscope) لتحليل إشارات PWM بدقة كهربائية متناهية.
          </p>
        </div>

        {/* Wokwi Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant={showWokwiEmbed ? 'default' : 'outline'}
            onClick={() => setShowWokwiEmbed(!showWokwiEmbed)}
            className="text-xs rounded-xl font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{showWokwiEmbed ? 'عرض لوحة التجارب الافتراضية' : 'تضمين بيئة Wokwi السحابية'}</span>
          </Button>
          <a
            href={activeSketch.wokwiUrl || 'https://wokwi.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
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
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
              selectedSketchId === sketch.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 border-emerald-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
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
        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 p-2 shadow-2xl">
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
        /* Built-in Virtual Breadboard & Instruments Visualizer (Wide Horizontal Landscape) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Virtual Hardware Breadboard & Oscilloscope */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                <h4 className="font-bold text-sm sm:text-base text-white">
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
                    setServoAngle(45);
                    setSimTemperature(25.6);
                    setSimHumidity(54.2);
                  }}
                  className="rounded-xl text-xs border-slate-700 hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة تعيين
                </Button>
              </div>
            </div>

            {/* Microcontroller Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/25 text-blue-400 border border-blue-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-white">
                    {activeSketch.board === 'esp32' ? 'ESP32 Wi-Fi NodeMCU (Dual Core 240MHz)' : 'Arduino Uno R3 (ATmega328P)'}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-mono">
                    GPIO Logic: 3.3V/5V • Clock: 16MHz • PWM Channels: 6x
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
                {isRunning ? '● RUNNING 50Hz' : '○ HALTED'}
              </Badge>
            </div>

            {/* Interactive Component Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. LEDs Bank */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 block">
                  مصفوفة مصابيح LED والحالة المنطقية:
                </span>
                <div className="flex items-center justify-around py-1">
                  {/* Red LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      redLed 
                        ? 'bg-rose-500 border-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.9)] animate-pulse' 
                        : 'bg-rose-950/40 border-rose-900/50'
                    }`} />
                    <span className="text-[9px] text-slate-400 font-mono">D13 (Red)</span>
                  </div>

                  {/* Green LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      greenLed 
                        ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.9)]' 
                        : 'bg-emerald-950/40 border-emerald-900/50'
                    }`} />
                    <span className="text-[9px] text-slate-400 font-mono">D12 (Green)</span>
                  </div>

                  {/* Blue LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      blueLed 
                        ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.9)]' 
                        : 'bg-cyan-950/40 border-cyan-900/50'
                    }`} />
                    <span className="text-[9px] text-slate-400 font-mono">D2 (Blue)</span>
                  </div>

                  {/* Yellow LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      yellowLed 
                        ? 'bg-amber-500 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.9)]' 
                        : 'bg-amber-950/40 border-amber-900/50'
                    }`} />
                    <span className="text-[9px] text-slate-400 font-mono">D5 (Yellow)</span>
                  </div>
                </div>
              </div>

              {/* 2. Micro Servo Angle Gauge */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">محرك السيرفو المؤازر (SG90):</span>
                  <span className="text-amber-400 font-mono font-bold">{servoAngle}°</span>
                </div>
                <div className="relative h-16 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center relative shadow-inner">
                    <motion.div
                      animate={{ rotate: servoAngle - 90 }}
                      transition={{ type: "spring", stiffness: 120, damping: 15 }}
                      className="w-1.5 h-8 bg-amber-400 rounded-full origin-bottom absolute bottom-7 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    />
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 z-10" />
                  </div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0° (1.0ms)</span>
                  <span>90° (1.5ms)</span>
                  <span>180° (2.0ms)</span>
                </div>
              </div>

              {/* 3. Ultrasonic Distance Sensor Slider */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
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
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">شاشة العرض I2C OLED (0.96"):</span>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 font-mono">
                    Addr: 0x3C
                  </Badge>
                </div>
                <div className="h-16 rounded-lg bg-black border border-slate-800 p-2 font-mono text-[9px] text-cyan-400 flex flex-col justify-between shadow-inner">
                  <div className="flex justify-between border-b border-cyan-950 pb-0.5">
                    <span>GALAXY ROBOTICS</span>
                    <span className="animate-pulse">● WI-FI</span>
                  </div>
                  <div className="space-y-0.5">
                    <div>DIST: {ultrasonicDistance} cm {ultrasonicDistance < 30 ? '[ALERT]' : '[CLEAR]'}</div>
                    <div>SERVO: {servoAngle}° | PWM: {pulseWidthMs}ms</div>
                  </div>
                  <div className="text-[8px] text-slate-500 flex justify-between">
                    <span>T: {simTemperature}°C</span>
                    <span>H: {simHumidity}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Virtual Oscilloscope (PWM Waveform Analyzer) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>راسم الإشارة الرقمي (Virtual Oscilloscope — PWM Pin 6):</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  T_high: <strong className="text-cyan-300">{pulseWidthMs} ms</strong> ({dutyCyclePercent}%)
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <canvas
                  ref={oscCanvasRef}
                  width={640}
                  height={130}
                  className="w-full h-[130px] block"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 <strong>فائدة تعليمية:</strong> محركات السيرفو تستقبل نبضة بعرض يتراوح بين 1.0 مللي ثانية (الزاوية 0°) إلى 2.0 مللي ثانية (الزاوية 180°) كل 20 مللي ثانية (بتردد 50Hz).
              </p>
            </div>
          </div>

          {/* Right Column (5 cols): Code Editor & Serial Monitor */}
          <div className="lg:col-span-5 space-y-5 text-white">
            {/* Code Panel */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">
                    الكود المصدري للدائرة (C++ / Arduino)
                  </h4>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCode}
                  className="rounded-xl text-xs gap-1 border-slate-700 hover:bg-slate-800 h-8"
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
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h5 className="font-bold text-xs text-white">
                    الشاشة التسلسلية (Serial Monitor @ 115200 Baud)
                  </h5>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSerialLogs(['[CLEARED] Monitor reset.'])}
                  className="text-[10px] h-7 px-2 text-slate-400 hover:text-white"
                >
                  مسح السجل
                </Button>
              </div>

              <div className="h-44 rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-y-auto space-y-1 dir-ltr text-left">
                {serialLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    {log.includes('RED') || log.includes('ALERT') ? (
                      <span className="text-rose-400 font-semibold">{log}</span>
                    ) : log.includes('GREEN') || log.includes('CLEAR') ? (
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
