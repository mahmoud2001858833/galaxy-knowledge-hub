import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Layers, 
  Download, 
  Cpu, 
  Printer, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Code2, 
  FileText, 
  Wrench, 
  ChevronRight,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface CapstoneProject {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'متوسط' | 'متقدم' | 'احترافي';
  estimatedCost: string;
  buildTime: string;
  description: string;
  digitalTwinModel: {
    degreesOfFreedom: string;
    payload: string;
    power: string;
    actuators: string;
  };
  stlFiles: {
    fileName: string;
    partName: string;
    infill: string;
    material: string;
    printTime: string;
  }[];
  bom: {
    item: string;
    qty: string;
    spec: string;
  }[];
  wiringPins: {
    component: string;
    pinController: string;
    voltage: string;
  }[];
  codeSnippet: string;
}

export const CAPSTONE_PROJECTS: CapstoneProject[] = [
  {
    id: 'color-sorting-arm',
    title: 'الذراع الروبوتية فارزة الألوان بالرؤية الحاسوبية',
    subtitle: '4-DOF Vision-Guided Robotic Manipulator & Sorter',
    category: 'الروبوتات الصناعية والرؤية',
    difficulty: 'متقدم',
    estimatedCost: '45 - 65 $',
    buildTime: '8 - 12 ساعة عمل',
    description: 'ذراع آلية رباعية المحاور تعتمد على كاميرا الويب وخوارزمية تجزئة الألوان (HSV Segmentation) لرصد المكعبات الملونة على خط الإنتاج، حساب الحركيات العكسية، والتقاط كل مكعب وإيداعه في الصندوق المناسب له تلقائياً.',
    digitalTwinModel: {
      degreesOfFreedom: '4 مفاصل دوارة + قابض متوازي (4-DOF + Gripper)',
      payload: '250 جرام في أقصى امتداد (Reach: 28cm)',
      power: '5V 4A DC Power Supply (External Rail)',
      actuators: '4x MG996R Metal Gear Servos + 1x SG90 Micro Servo'
    },
    stlFiles: [
      { fileName: 'arm_base_turntable.stl', partName: 'قاعدة الذراع الدوارة مع حامل الرولمانلي', infill: '30%', material: 'PLA+', printTime: '3.5 ساعات' },
      { fileName: 'shoulder_link_heavy.stl', partName: 'وصلة الكتف الرئيسية المقواة', infill: '40%', material: 'PETG / PLA+', printTime: '4.2 ساعات' },
      { fileName: 'forearm_bracket.stl', partName: 'حامل الساعد ومفصل الكوع', infill: '30%', material: 'PLA+', printTime: '2.8 ساعات' },
      { fileName: 'parallel_gripper_claws.stl', partName: 'مخالب القابض المتوازي المسنن', infill: '50%', material: 'PETG', printTime: '2.1 ساعات' }
    ],
    bom: [
      { item: 'متحكم سيرفوهات I2C (PCA9685)', qty: '1', spec: '16-Channel 12-bit PWM Controller' },
      { item: 'محركات سيرفو معدنية (MG996R)', qty: '4', spec: '11kg/cm Torque @ 6V' },
      { item: 'محرك سيرفو صغير (SG90)', qty: '1', spec: 'للقابض الميكانيكي' },
      { item: 'كاميرا رؤية حاسوبية (ESP32-CAM أو USB HD)', qty: '1', spec: '720p 30FPS Wide Angle' },
      { item: 'مسامير وصواميل M3 و M4', qty: '1 طقم', spec: 'طول 10mm - 25mm مع صواميل تأمين' }
    ],
    wiringPins: [
      { component: 'PCA9685 SDA', pinController: 'ESP32 GPIO 21 / Arduino A4', voltage: '3.3V / 5V' },
      { component: 'PCA9685 SCL', pinController: 'ESP32 GPIO 22 / Arduino A5', voltage: '3.3V / 5V' },
      { component: 'External Servo Power', pinController: 'PCA9685 V+ Screw Terminal', voltage: '5V - 6V 4A' },
      { component: 'Camera Module', pinController: 'USB Host / Serial TX-RX', voltage: '5V 1A' }
    ],
    codeSnippet: `// Python / OpenCV & Inverse Kinematics snippet
import cv2
import numpy as np

def detect_colored_cube(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    lower_red = np.array([0, 120, 70])
    upper_red = np.array([10, 255, 255])
    mask = cv2.inRange(hsv, lower_red, upper_red)
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv2.contourArea)
        M = cv2.moments(c)
        if M["m00"] > 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            return cx, cy
    return None`
  },
  {
    id: 'autonomous-delivery-rover',
    title: 'روبوت التوصيل ذاتي القيادة بالليدار والرؤية',
    subtitle: 'Autonomous Mobile Robot (AMR) with 2D LiDAR SLAM',
    category: 'المركبات ذاتية القيادة والملاحة',
    difficulty: 'احترافي',
    estimatedCost: '110 - 160 $',
    buildTime: '15 - 20 ساعة عمل',
    description: 'منصة روبوتية متنقلة ذات ملاحة مستقلة ترسم خرائط المبنى بتقنية SLAM وتتفادى العقبات الديناميكية، مزودة بحجرة حمولة لنقل العينات الطبية أو الطرود داخل المدارس والمستشفيات.',
    digitalTwinModel: {
      degreesOfFreedom: 'حركة هولونومية ثنائية الأبعاد (X, Y, Theta)',
      payload: '3.5 كجم حمولة في الحجرة الداخلية',
      power: 'بطارية ليثيوم أيون 12V 3S 3000mAh',
      actuators: '4x DC Geared Motors with Optical Encoders'
    },
    stlFiles: [
      { fileName: 'amr_base_chassis_bottom.stl', partName: 'الهيكل السفلي الحامل للبطارية والمحركات', infill: '35%', material: 'PETG / ABS', printTime: '6.5 ساعات' },
      { fileName: 'lidar_elevated_tower.stl', partName: 'برج تثبيت مستشعر الليزر المرتفع', infill: '30%', material: 'PLA+', printTime: '2.5 ساعات' },
      { fileName: 'cargo_bay_hinged_door.stl', partName: 'باب حجرة التوصيل مع مزلاج كهرومغناطيسي', infill: '25%', material: 'PLA+', printTime: '3.0 ساعات' },
      { fileName: 'ultrasonic_ring_bumpers.stl', partName: 'حوامل الحساسات فوق الصوتية المحيطية', infill: '40%', material: 'TPU مرن أو PLA+', printTime: '2.0 ساعات' }
    ],
    bom: [
      { item: 'مستشعر ليدار 360 درجة (RPLIDAR A1)', qty: '1', spec: '12m Range, 5.5Hz Scan Rate' },
      { item: 'معالج حافة (Raspberry Pi 4 أو Jetson Nano)', qty: '1', spec: '4GB RAM لتشغيل ROS 2' },
      { item: 'متحكم محركات تيار مستمر (L298N أو TB6612FNG)', qty: '2', spec: 'ثنائي القناة مع متحكم التشفير' },
      { item: 'محركات مع مشفرات نبضية (Encoder Motors)', qty: '4', spec: '12V 250RPM مع Hall Sensor' },
      { item: 'وحدة قياس القصور الذاتي (MPU-6050)', qty: '1', spec: '6-Axis Gyro + Accelerometer' }
    ],
    wiringPins: [
      { component: 'RPLiDAR A1 USB', pinController: 'Raspberry Pi USB 3.0', voltage: '5V 0.5A' },
      { component: 'Motor Encoders A/B', pinController: 'Arduino / ESP32 Pins D2, D3, D18, D19 (Interrupts)', voltage: '5V' },
      { component: 'MPU6050 I2C', pinController: 'ESP32 GPIO 21/22', voltage: '3.3V' },
      { component: 'Motor Driver Logic', pinController: 'PWM Pins D5, D6, D9, D10', voltage: 'Logic 5V, Motor 12V' }
    ],
    codeSnippet: `// ROS 2 Nav2 Costmap & Velocity Publisher Node
import rclpy
from geometry_msgs.msg import Twist

def navigate_to_target(linear_speed, angular_z):
    cmd = Twist()
    cmd.linear.x = float(linear_speed)
    cmd.angular.z = float(angular_z)
    cmd_vel_pub.publish(cmd)
    # Odometry feedback loop calculates trajectory correction`
  },
  {
    id: 'smart-iot-weather-station',
    title: 'محطة المراقبة البيئية والإنذار المبكر IoT',
    subtitle: 'Solar-Powered Smart Environmental Telemetry Node',
    category: 'إنترنت الأشياء والأنظمة المدمجة',
    difficulty: 'متوسط',
    estimatedCost: '35 - 50 $',
    buildTime: '6 - 8 ساعات عمل',
    description: 'محطة مراقبة طقس وبيئة ذكية تعمل بالطاقة الشمسية، تقيس الحرارة، الرطوبة، الضغط الجوي، ونسبة تلوث الهواء، وتنشر القراءات سحابياً مع تشغيل نظام إنذار مبكر عند تسرب الغازات.',
    digitalTwinModel: {
      degreesOfFreedom: 'ثابتة مع قبة استشعار محيطية',
      payload: 'درع ستيفنسون المقاوم للعوامل الجوية',
      power: 'لوح شمسي 5V 1A + دائرة شحن TP4056 وبطارية 18650',
      actuators: 'Buzzer إنذار + شاشة عرض محلية + بوابات MQTT'
    },
    stlFiles: [
      { fileName: 'stevenson_screen_louvers.stl', partName: 'فتحات التهوية لحماية الحساسات من المطر والشمس', infill: '25%', material: 'PETG مقاوم للحرارة', printTime: '4.8 ساعات' },
      { fileName: 'solar_panel_top_mount.stl', partName: 'غطاء تثبيت اللوح الشمسي بزاوية 35 درجة', infill: '30%', material: 'PETG', printTime: '3.2 ساعات' },
      { fileName: 'internal_circuit_bracket.stl', partName: 'قاعدة تثبيت بطاقة ESP32 وبطارية الليثيوم', infill: '20%', material: 'PLA+', printTime: '1.9 ساعات' }
    ],
    bom: [
      { item: 'متحكم ESP32 Wi-Fi / Bluetooth', qty: '1', spec: 'NodeMCU Dual Core' },
      { item: 'حساس حرارة ورطوبة دقيق (DHT22 / SHT30)', qty: '1', spec: 'الدقة: ±0.5°C' },
      { item: 'حساس جودة الهواء والغازات (MQ-135)', qty: '1', spec: 'كشف ثاني أكسيد الكربون والدخان' },
      { item: 'شاشة عرض رقمية (OLED 0.96")', qty: '1', spec: 'I2C Interface 128x64' },
      { item: 'دائرة شحن بالطاقة الشمسية (TP4056)', qty: '1', spec: 'مع حماية تفريغ البطارية' }
    ],
    wiringPins: [
      { component: 'DHT22 Data', pinController: 'ESP32 GPIO 4', voltage: '3.3V' },
      { component: 'MQ-135 Analog Out', pinController: 'ESP32 ADC1 GPIO 34', voltage: '5V' },
      { component: 'OLED Display (SDA/SCL)', pinController: 'ESP32 GPIO 21 / 22', voltage: '3.3V' },
      { component: 'Buzzer Alarm', pinController: 'ESP32 GPIO 15', voltage: '3.3V' }
    ],
    codeSnippet: `// ESP32 Deep-Sleep & MQTT Telemetry Publisher
#include <WiFi.h>
#include <PubSubClient.h>

void enter_deep_sleep(uint64_t seconds) {
  Serial.println("[SLEEP] Entering power-saving deep sleep...");
  esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
  esp_deep_sleep_start();
}`
  },
  {
    id: 'ai-sentry-turret',
    title: 'برج الحراسة الذكي بالتعرف على الوجوه والإيماءات',
    subtitle: 'AI Pan-Tilt Face Tracking Sentry & Gesture Unit',
    category: 'الذكاء الاصطناعي والتفاعل البشري الروبوتي',
    difficulty: 'متقدم',
    estimatedCost: '40 - 60 $',
    buildTime: '6 - 9 ساعات عمل',
    description: 'برج محوري بحركتين (أفقية وعمودية) مزود بكاميرا ذكاء اصطناعي يتعرف على الوجوه المصرح لها، يوجه ليزر التحديد أو مصباح الإضاءة نحو الهدف أوتوماتيكياً، ويستجيب لإيماءات يد المستخدم للتحكم عن بُعد.',
    digitalTwinModel: {
      degreesOfFreedom: 'محور أفقي 180° + محور عمودي 120° (Pan & Tilt)',
      payload: 'كاميرا مدمجة + مؤشر ليزري + مصفوفة NeoPixel',
      power: '5V 2.5A USB Adapter',
      actuators: '2x SG90 / MG90S High-Precision Servos'
    },
    stlFiles: [
      { fileName: 'pan_tilt_base_pedestal.stl', partName: 'قاعدة البرج الحاملة لمحرك الدوران الأفقي', infill: '30%', material: 'PLA+', printTime: '2.4 ساعات' },
      { fileName: 'tilt_bracket_camera_holder.stl', partName: 'حامل الكاميرا ومحرك الدوران العمودي', infill: '30%', material: 'PLA+', printTime: '2.0 ساعات' },
      { fileName: 'laser_lens_diffuser.stl', partName: 'غطاء العدسة ومؤشر التصويب', infill: '20%', material: 'PLA+', printTime: '1.2 ساعات' }
    ],
    bom: [
      { item: 'محركات سيرفو معدنية (MG90S)', qty: '2', spec: 'عزم 2.2kg/cm' },
      { item: 'كاميرا ESP32-CAM أو USB Webcam', qty: '1', spec: 'OV2640 2 Megapixels' },
      { item: 'حلقة إضاءة ذكية (NeoPixel Ring 8 LEDs)', qty: '1', spec: 'WS2812B RGB Addressable' },
      { item: 'مؤشر ليزر أو مصباح كشاف LED', qty: '1', spec: '5V 5mW Red/Green' }
    ],
    wiringPins: [
      { component: 'Pan Servo Signal', pinController: 'ESP32 GPIO 12', voltage: '5V' },
      { component: 'Tilt Servo Signal', pinController: 'ESP32 GPIO 13', voltage: '5V' },
      { component: 'NeoPixel Ring Data', pinController: 'ESP32 GPIO 14', voltage: '5V' },
      { component: 'Laser Emitter', pinController: 'ESP32 GPIO 27', voltage: '5V' }
    ],
    codeSnippet: `// Proportional Tracking Loop in Python / C++
float error_x = target_x - frame_center_x;
float error_y = target_y - frame_center_y;

pan_angle += error_x * Kp_pan;
tilt_angle += error_y * Kp_tilt;
pan_servo.write(constrain(pan_angle, 0, 180));
tilt_servo.write(constrain(tilt_angle, 30, 150));`
  },
  {
    id: 'hexapod-walking-robot',
    title: 'الروبوت السداسي الأرجل البيوميميتيكي (Hexapod)',
    subtitle: '18-DOF Bio-Inspired Multi-Terrain Walking Robot',
    category: 'الروبوتات الحيوية والمشي متعدد التضاريس',
    difficulty: 'احترافي',
    estimatedCost: '140 - 200 $',
    buildTime: '20 - 28 ساعة عمل',
    description: 'روبوت مستوحى من حركة الحشرات بستة أرجل وكل رجل تمتلك 3 مفاصل (Coxa, Femur, Tibia)، مما يتيح له تسلق العوائق، صعود السلالم، والمشي على التضاريس الوعرة بثبات ديناميكي مذهل.',
    digitalTwinModel: {
      degreesOfFreedom: '18 محرك سيرفو (3 محركات لكل ساق × 6 أرجل)',
      payload: '1.2 كجم وزن ذاتي + 800 جرام حمولة إضافية',
      power: 'بطارية ليثيوم 7.4V 2S 4000mAh مع منظم تيار 5V 15A',
      actuators: '18x MG996R / DS3218 Digital Servos'
    },
    stlFiles: [
      { fileName: 'hexapod_main_body_top.stl', partName: 'الهيكل العلوي لجسم الروبوت', infill: '35%', material: 'PETG / Carbon-PLA', printTime: '7.5 ساعات' },
      { fileName: 'hexapod_main_body_bottom.stl', partName: 'الهيكل السفلي الحامل للبطاريات والمتحكم', infill: '35%', material: 'PETG', printTime: '6.8 ساعات' },
      { fileName: 'coxa_femur_leg_joint.stl', partName: 'مفصل الفخذ (تطبع 6 مرات)', infill: '50%', material: 'PETG صلب', printTime: '4.5 ساعات' },
      { fileName: 'tibia_foot_rubber_pad.stl', partName: 'طرف الساق الملامس للأرض (تطبع 6 مرات)', infill: '100%', material: 'TPU مرن مانع للانزلاق', printTime: '3.0 ساعات' }
    ],
    bom: [
      { item: 'محركات رقمية عالية العزم (MG996R/DS3218)', qty: '18', spec: 'عزم لا يقل عن 13kg/cm' },
      { item: 'متحكمات PCA9685 مزدوجة', qty: '2', spec: 'للتحكم بـ 18 محرك عبر I2C' },
      { item: 'معالج مركزي (ESP32-S3 أو Raspberry Pi)', qty: '1', spec: 'لحساب حركيات المشي العكسية' },
      { item: 'منظم جهد خافض عالي التيار (UBEC 5V 15A)', qty: '1', spec: 'لتغذية الـ 18 محرك دون انقطاع' }
    ],
    wiringPins: [
      { component: 'PCA9685 #1 (Address 0x40)', pinController: 'ESP32 I2C Pins (Legs 1-3)', voltage: '5V VCC / 6V Servos' },
      { component: 'PCA9685 #2 (Address 0x41)', pinController: 'ESP32 I2C Pins (Legs 4-6)', voltage: '5V VCC / 6V Servos' },
      { component: 'UBEC High-Power Rail', pinController: 'Battery 7.4V -> 6V to Servo V+', voltage: '6V 15A Peak' }
    ],
    codeSnippet: `// Tripod Gait Walking Algorithm & Inverse Kinematics
void tripod_gait_step(float step_length, float step_height) {
  // Group A: Legs 1, 3, 5 (Stance & Push)
  // Group B: Legs 2, 4, 6 (Swing & Lift)
  calculate_leg_ik(leg1, target_x, target_y, target_z);
  calculate_leg_ik(leg2, swing_x, swing_y, lift_z);
  update_all_18_servos();
}`
  }
];

export const DigitalTwinProjects: React.FC = () => {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('color-sorting-arm');
  const [activeTab, setActiveTab] = useState<'overview' | 'stl' | 'bom' | 'code'>('overview');

  const activeProject = CAPSTONE_PROJECTS.find(p => p.id === selectedProjectId) || CAPSTONE_PROJECTS[0];

  const handleDownloadSTL = (fileName: string) => {
    toast({
      title: "🚀 جاري تحضير ملف الطباعة ثلاثية الأبعاد",
      description: `تم توليد حزمة ${fileName} مع إعدادات التقطيع (Slicer Preset: 0.2mm, Infill Recommended).`
    });
  };

  const handleDownloadAll = () => {
    toast({
      title: "📦 تم تجهيز حزمة المشروع الكاملة!",
      description: `تتضمن ملفات STL، مخطط الدوائر Fritzing، والكود المصدري الكامل لمشروع: ${activeProject.title}.`
    });
  };

  return (
    <div className="space-y-8 text-right">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/30">
            <Box className="w-3.5 h-3.5" />
            <span>مشروع التوأم الرقمي والطباعة ثلاثية الأبعاد (Digital Twin to Physical 3D)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            5 مشاريع كابستون واقعية تجمع بين الروبوتات والذكاء الاصطناعي
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
            صمم وحاكي روبوتك على المنصة أولاً، ثم حمّل ملفات الطباعة ثلاثية الأبعاد (STL) والمخططات لتصنيعه وتجميعه حقيقة في مختبر مدرستك أو منزلك.
          </p>
        </div>

        <Button
          onClick={handleDownloadAll}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl font-bold gap-2 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>تحميل حزمة المشروع الحالية بالكامل</span>
        </Button>
      </div>

      {/* Projects Horizontal Slider / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {CAPSTONE_PROJECTS.map(project => {
          const isSelected = project.id === selectedProjectId;
          return (
            <motion.div
              key={project.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProjectId(project.id)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all text-right space-y-2 flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500 shadow-lg ring-2 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <Badge variant="outline" className="text-[10px] border-slate-200 dark:border-slate-700">
                  {project.difficulty}
                </Badge>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {project.title}
                </h4>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>{project.estimatedCost}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">عرض التفاصيل ←</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Project Detail Card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Project Header Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-bold text-xs">
                {activeProject.category}
              </Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300 text-xs">
                زمن البناء: {activeProject.buildTime}
              </Badge>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                التكلفة التقديرية: {activeProject.estimatedCost}
              </Badge>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {activeProject.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">
              {activeProject.subtitle}
            </p>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              نظرة عامة والتوأم الرقمي
            </button>
            <button
              onClick={() => setActiveTab('stl')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'stl'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ملفات الطباعة 3D (STL)
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bom'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              قائمة القطع والتوصيل (BOM)
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الكود والخوارزمية
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Digital Twin Specs */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {activeProject.description}
            </p>

            {/* Digital Twin Specifications Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">درجات الحرية (DOF):</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeProject.digitalTwinModel.degreesOfFreedom}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">قدرة الحمولة (Payload):</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeProject.digitalTwinModel.payload}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">نظام التغذية الكهربائية:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeProject.digitalTwinModel.power}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">المحركات والمشغلات:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeProject.digitalTwinModel.actuators}
                </span>
              </div>
            </div>

            {/* 3D Printing Workflow Guideline */}
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs space-y-2">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 text-sm">
                <Printer className="w-4 h-4 text-blue-600" />
                إرشادات الطباعة ثلاثية الأبعاد والتجميع الميكانيكي:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                تم تصميم جميع القطع بحيث تتوافق مع طابعات FDM الشائعة (مثل Ender 3، Prusa، Bambu Lab). يُنصح بطباعة الوصلات الحاملة للأوزان بخامة PETG أو PLA+ مع تعبئة Infill لا تقل عن 35% واستخدام 4 طبقات جدارية (Wall Perimeters) لتحمل الإجهادات الحركية الناتجة عن عزم المحركات.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: 3D STL Files */}
        {activeTab === 'stl' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>جميع القطع مصممة ببرنامج CAD ومعايرة لخلوص التجميع (Tolerance: 0.25mm)</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{activeProject.stlFiles.length} ملفات جاهزة للطباعة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProject.stlFiles.map((stl, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {stl.fileName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {stl.material}
                      </Badge>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {stl.partName}
                    </p>
                    <div className="flex gap-3 text-[11px] text-slate-500 pt-1">
                      <span>نسبة الملء: {stl.infill}</span>
                      <span>•</span>
                      <span>وقت الطباعة المقدر: {stl.printTime}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadSTL(stl.fileName)}
                    className="w-full text-xs rounded-xl font-bold gap-1.5 border-slate-300 dark:border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل ملف {stl.fileName}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: BOM and Wiring */}
        {activeTab === 'bom' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* BOM Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-500" />
                قائمة المكونات والقطع (Bill of Materials):
              </h4>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">القطعة</th>
                      <th className="p-3">العدد</th>
                      <th className="p-3">المواصفة الفنية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/60">
                    {activeProject.bom.map((b, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{b.item}</td>
                        <td className="p-3 font-mono">{b.qty}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{b.spec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wiring Pinout Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                مخطط توصيل المنافذ (Pinout Wiring Schema):
              </h4>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">المكون</th>
                      <th className="p-3">منفذ المتحكم</th>
                      <th className="p-3">الجهد الكهربائي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/60">
                    {activeProject.wiringPins.map((w, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{w.component}</td>
                        <td className="p-3 font-mono text-cyan-600 dark:text-cyan-400">{w.pinController}</td>
                        <td className="p-3 font-mono text-amber-600 dark:text-amber-400">{w.voltage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Code */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                خوارزمية التحكم الأساسية للمشروع:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(activeProject.codeSnippet);
                  toast({ title: "تم نسخ الكود بنجاح!" });
                }}
                className="text-xs rounded-xl"
              >
                نسخ الكود المصدري
              </Button>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-cyan-400 overflow-x-auto dir-ltr text-left">
              <pre className="whitespace-pre">
                {activeProject.codeSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
