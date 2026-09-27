import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { 
  Bot, 
  Cpu, 
  Zap, 
  Layers, 
  Code2, 
  Radar, 
  Eye, 
  Play, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Activity, 
  Compass, 
  Gauge, 
  Terminal,
  Settings2,
  Box,
  BrainCircuit,
  Binary,
  Radio, 
  Swords, 
  Printer,
  Copy,
  Download,
  Target,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import roboticsHeroBg from '@/assets/robotics-ai-section.jpg';
import { RoboticsPathways } from '@/components/robotics/RoboticsPathways';
import { HardwareCircuitSandbox } from '@/components/robotics/HardwareCircuitSandbox';
import { AIVisionPlayground } from '@/components/robotics/AIVisionPlayground';
import { CodeArenaMaze } from '@/components/robotics/CodeArenaMaze';
import { DigitalTwinProjects } from '@/components/robotics/DigitalTwinProjects';
import { RoboticsSidebar } from '@/components/robotics/RoboticsSidebar';
import { AIRoboticsExplainer } from '@/components/robotics/AIRoboticsExplainer';

export const RoboticsSection: React.FC = () => {
  const { toast } = useToast();

  // Main Tab State
  const [activeMainTab, setActiveMainTab] = useState<string>('pathways');

  // Robotic Arm Kinematics State
  const [theta1, setTheta1] = useState(45); // Base angle (deg)
  const [theta2, setTheta2] = useState(-30); // Shoulder angle (deg)
  const [theta3, setTheta3] = useState(60); // Elbow angle (deg)
  const [gripper, setGripper] = useState(40); // Gripper openness %
  const [isAutomated, setIsAutomated] = useState(false);

  // AMR / LiDAR Simulator State
  const [robotX, setRobotX] = useState(200);
  const [robotY, setRobotY] = useState(150);
  const [robotHeading, setRobotHeading] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [lidarRange, setLidarRange] = useState(120);

  // Vision AI State
  const [detectionConfidence, setDetectionConfidence] = useState(94.8);
  const [selectedTarget, setSelectedTarget] = useState<'partA' | 'partB' | 'gear' | 'defect'>('partA');
  const [isScanning, setIsScanning] = useState(true);

  // Code Playground State
  const [activeCodeTab, setActiveCodeTab] = useState<'ros2' | 'python' | 'vision'>('ros2');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[ROS2_CORE] Initializing ROS 2 Humble node: /robot_arm_controller...',
    '[TOPIC] Publishing joint_states at 50Hz to /joint_states',
    '[HARDWARE] Connected to 6-DOF Industrial Manipulator on /dev/ttyUSB0',
    '[READY] Ready for motion trajectory planning.'
  ]);

  const armCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lidarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // End-effector Cartesian Coordinates calculation (Forward Kinematics)
  const L1 = 110; // Upper arm length
  const L2 = 90;  // Forearm length
  const L3 = 50;  // End-effector length

  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = (theta2 * Math.PI) / 180;
  const rad3 = (theta3 * Math.PI) / 180;

  // Approximate 3D projection
  const endX = Math.round(L1 * Math.cos(rad1) + L2 * Math.cos(rad1 + rad2) + L3 * Math.cos(rad1 + rad2 + rad3));
  const endY = Math.round(L1 * Math.sin(rad1) + L2 * Math.sin(rad1 + rad2) + L3 * Math.sin(rad1 + rad2 + rad3));
  const endZ = Math.round(80 + L1 * Math.sin(rad2) + L2 * Math.sin(rad2 + rad3));

  // Automated Arm Oscillation
  useEffect(() => {
    if (!isAutomated) return;
    const interval = setInterval(() => {
      setTheta1(prev => (prev >= 110 ? 10 : prev + 2));
      setTheta2(prev => Math.sin(Date.now() / 600) * 35);
      setTheta3(prev => Math.cos(Date.now() / 800) * 45);
    }, 50);
    return () => clearInterval(interval);
  }, [isAutomated]);

  // Autopilot for LiDAR Mobile Robot
  useEffect(() => {
    if (!isAutopilot) return;
    const interval = setInterval(() => {
      setRobotHeading(prev => prev + 0.04);
      setRobotX(prev => {
        const nextX = prev + Math.cos(robotHeading) * 3;
        if (nextX > 400 || nextX < 70) {
          setRobotHeading(h => h + Math.PI / 2);
          return prev;
        }
        return nextX;
      });
      setRobotY(prev => {
        const nextY = prev + Math.sin(robotHeading) * 3;
        if (nextY > 260 || nextY < 60) {
          setRobotHeading(h => h + Math.PI / 2);
          return prev;
        }
        return nextY;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isAutopilot, robotHeading]);

  // Draw Robotic Arm on HTML5 Canvas
  useEffect(() => {
    const canvas = armCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseOriginX = canvas.width / 2;
    const baseOriginY = canvas.height - 60;

    // Draw Floor Grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, baseOriginY + 20);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Heavy Robot Base Mounting Pedestal
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(baseOriginX - 45, baseOriginY, 90, 20, 6);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Base Joint Turret
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(baseOriginX, baseOriginY, 20, Math.PI, 0);
    ctx.fill();

    // Forward Kinematics Joint Coordinates
    const j1x = baseOriginX;
    const j1y = baseOriginY - 15;

    const j2x = j1x + L1 * Math.cos(rad1);
    const j2y = j1y - L1 * Math.sin(rad1);

    const j3x = j2x + L2 * Math.cos(rad1 + rad2);
    const j3y = j2y - L2 * Math.sin(rad1 + rad2);

    const eex = j3x + L3 * Math.cos(rad1 + rad2 + rad3);
    const eey = j3y - L3 * Math.sin(rad1 + rad2 + rad3);

    // Link 1 (Upper Arm - Heavy Aluminum Extrusion)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(j1x, j1y);
    ctx.lineTo(j2x, j2y);
    ctx.stroke();

    // Link 1 Center Accent Core
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(j1x, j1y);
    ctx.lineTo(j2x, j2y);
    ctx.stroke();

    // Joint 2 (Shoulder Pivot & Servo Ring)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(j2x, j2y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Link 2 (Forearm)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(j2x, j2y);
    ctx.lineTo(j3x, j3y);
    ctx.stroke();

    // Joint 3 (Elbow Pivot)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(j3x, j3y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Link 3 (Wrist)
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(j3x, j3y);
    ctx.lineTo(eex, eey);
    ctx.stroke();

    // Gripper / Tool End-Effector
    ctx.save();
    ctx.translate(eex, eey);
    ctx.rotate(- (rad1 + rad2 + rad3));

    // Gripper Base Mount
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-8, -4, 16, 8, 2);
    ctx.fill();

    // Gripper Left & Right Claws with aperture calculation
    const clawSpan = (gripper / 100) * 16 + 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;

    // Left Claw
    ctx.beginPath();
    ctx.moveTo(-4, -clawSpan / 2);
    ctx.lineTo(14, -clawSpan / 2);
    ctx.lineTo(18, -clawSpan / 4);
    ctx.stroke();

    // Right Claw
    ctx.beginPath();
    ctx.moveTo(-4, clawSpan / 2);
    ctx.lineTo(14, clawSpan / 2);
    ctx.lineTo(18, clawSpan / 4);
    ctx.stroke();

    // Target laser dot from End-effector
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(22, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw Joint Axis Annotations
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px Cairo, monospace';
    ctx.fillText(`J1 (${theta1}°)`, j1x + 10, j1y + 10);
    ctx.fillText(`J2 (${theta2}°)`, j2x + 10, j2y - 10);
    ctx.fillText(`J3 (${theta3}°)`, j3x + 10, j3y - 10);
  }, [theta1, theta2, theta3, gripper]);

  // Draw Autonomous Mobile Robot & 360° LiDAR on HTML5 Canvas
  useEffect(() => {
    const canvas = lidarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const obstacles = [
      { x: 90, y: 70, w: 50, h: 50, label: 'مستودع A' },
      { x: 340, y: 80, w: 60, h: 50, label: 'محطة الشحن' },
      { x: 120, y: 220, w: 45, h: 45, label: 'منصة وزن' },
      { x: 310, y: 210, w: 55, h: 45, label: 'عائق أسطواني' }
    ];

    const renderLidar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark Radar Grid Background
      ctx.fillStyle = '#060d1b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Concentric Radar Rings
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;
      [40, 80, 120, 160, 200].forEach(r => {
        ctx.beginPath();
        ctx.arc(robotX, robotY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(robotX - 210, robotY);
      ctx.lineTo(robotX + 210, robotY);
      ctx.moveTo(robotX, robotY - 210);
      ctx.lineTo(robotX, robotY + 210);
      ctx.stroke();

      // Rotating Laser Sweep Beam (360 Ray Cast Simulation)
      const rayCount = 64;
      const angleStep = (Math.PI * 2) / rayCount;

      for (let i = 0; i < rayCount; i++) {
        const rayAngle = i * angleStep;
        let hitDist = lidarRange;

        // Check intersection with all obstacles
        for (let d = 10; d < lidarRange; d += 8) {
          const checkX = robotX + Math.cos(rayAngle) * d;
          const checkY = robotY + Math.sin(rayAngle) * d;

          // Wall checks
          if (checkX <= 10 || checkX >= canvas.width - 10 || checkY <= 10 || checkY >= canvas.height - 10) {
            hitDist = d;
            break;
          }

          // Obstacle boxes check
          const hitsObstacle = obstacles.some(
            obs => checkX >= obs.x && checkX <= obs.x + obs.w && checkY >= obs.y && checkY <= obs.y + obs.h
          );
          if (hitsObstacle) {
            hitDist = d;
            break;
          }
        }

        const hitX = robotX + Math.cos(rayAngle) * hitDist;
        const hitY = robotY + Math.sin(rayAngle) * hitDist;

        // Draw laser ray
        ctx.strokeStyle = hitDist < lidarRange ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(robotX, robotY);
        ctx.lineTo(hitX, hitY);
        ctx.stroke();

        // Point cloud return dot
        if (hitDist < lidarRange) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(hitX, hitY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Obstacle Boxes
      obstacles.forEach(obs => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h / 2 + 3);
      });

      // AMR Body
      ctx.save();
      ctx.translate(robotX, robotY);
      ctx.rotate(robotHeading);

      // Robot Chassis
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-20, -15, 40, 30, 6);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heading Arrow
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(8, -6);
      ctx.lineTo(8, 6);
      ctx.closePath();
      ctx.fill();

      // Rotating LiDAR Sensor Puck
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animFrame = requestAnimationFrame(renderLidar);
    };

    renderLidar();
    return () => cancelAnimationFrame(animFrame);
  }, [robotX, robotY, robotHeading, lidarRange]);

  // Code Runner Simulation
  const handleRunCode = () => {
    const timestamp = new Date().toLocaleTimeString('ar-JO');
    if (activeCodeTab === 'ros2') {
      setTerminalOutput([
        `[${timestamp}] [INFO] ros2 run galaxy_robotics arm_motion_planner`,
        `[${timestamp}] [TRAJECTORY] Planned cubic polynomial path in 14ms`,
        `[${timestamp}] [EXECUTE] Moving 6 joints to target (X: ${endX}, Y: ${endY}, Z: ${endZ})`,
        `[${timestamp}] [FEEDBACK] Goal tolerance reached (error: 0.002mm). Task Success!`
      ]);
    } else if (activeCodeTab === 'python') {
      setTerminalOutput([
        `[${timestamp}] $ python3 inverse_kinematics.py`,
        `[${timestamp}] Computing Denavit-Hartenberg (D-H) Transformation Matrices...`,
        `[${timestamp}] Joint Angles Calculated: theta1=${theta1}°, theta2=${theta2}°, theta3=${theta3}°`,
        `[${timestamp}] Singularity check passed. Jacobian Condition Number: 1.042 (Optimal).`
      ]);
    } else {
      setTerminalOutput([
        `[${timestamp}] [YOLOv8-ROBOTICS] Loading weights /models/industrial_parts.engine...`,
        `[${timestamp}] [INFERENCE] Frame processed in 4.2ms (238 FPS)`,
        `[${timestamp}] [DETECT] 1x Gear Assembly (conf: ${(detectionConfidence / 100).toFixed(3)})`,
        `[${timestamp}] [ACTION] Grasping pose calculated: Quat(0.0, 0.707, 0.0, 0.707)`
      ]);
    }
    toast({
      title: '🚀 تم تنفيذ الكود',
      description: 'تم إرسال الأوامر بنجاح إلى طرفية الروبوت الافتراضية.'
    });
  };

  const handleCopyCode = () => {
    let codeStr = '';
    if (activeCodeTab === 'ros2') {
      codeStr = `import rclpy\nfrom rclpy.node import Node\nfrom sensor_msgs.msg import JointState\n\nclass ArmControllerNode(Node):\n    def __init__(self):\n        super().__init__('robot_arm_controller')\n        self.publisher_ = self.create_publisher(JointState, '/joint_states', 10)\n        self.timer = self.create_timer(0.02, self.publish_joint_angles)\n        self.get_logger().info('Manipulator controller online.')\n\n    def publish_joint_angles(self):\n        msg = JointState()\n        msg.name = ['base', 'shoulder', 'elbow']\n        msg.position = [${(theta1 * Math.PI / 180).toFixed(2)}, ${(theta2 * Math.PI / 180).toFixed(2)}, ${(theta3 * Math.PI / 180).toFixed(2)}]\n        self.publisher_.publish(msg)`;
    } else if (activeCodeTab === 'python') {
      codeStr = `import numpy as np\n\ndef compute_dh_matrix(theta, d, a, alpha):\n    return np.array([\n        [np.cos(theta), -np.sin(theta)*np.cos(alpha),  np.sin(theta)*np.sin(alpha), a*np.cos(theta)],\n        [np.sin(theta),  np.cos(theta)*np.cos(alpha), -np.cos(theta)*np.sin(alpha), a*np.sin(theta)],\n        [0,              np.sin(alpha),                np.cos(alpha),               d],\n        [0,              0,                            0,                           1]\n    ])\n\nT01 = compute_dh_matrix(np.radians(${theta1}), 0, 110, 0)\nT12 = compute_dh_matrix(np.radians(${theta2}), 0, 90,  0)\nT23 = compute_dh_matrix(np.radians(${theta3}), 0, 50,  0)\nT03 = T01 @ T12 @ T23\nprint(f"End Effector Position: X={T03[0,3]:.1f}, Y={T03[1,3]:.1f}")`;
    } else {
      codeStr = `from ultralytics import YOLO\nimport cv2\n\nmodel = YOLO('industrial_robotics_detector.pt')\nresults = model.predict(source=0, conf=0.85, show=False)\n\nfor box in results[0].boxes:\n    cls_id = int(box.cls[0])\n    confidence = float(box.conf[0])\n    print(f"Detected Component {cls_id} with confidence: {confidence:.2%}")`;
    }
    navigator.clipboard.writeText(codeStr);
    toast({
      title: '📋 تم نسخ الكود',
      description: 'تم نسخ الكود البرمجي بنجاح إلى الحافظة.'
    });
  };

  const handleResetArm = () => {
    setIsAutomated(false);
    setTheta1(45);
    setTheta2(-30);
    setTheta3(60);
    setGripper(40);
  };

  const handleApplyAIPreset = (actionData: any) => {
    if (!actionData) return;
    if (actionData.t1 !== undefined) setTheta1(actionData.t1);
    if (actionData.t2 !== undefined) setTheta2(actionData.t2);
    if (actionData.t3 !== undefined) setTheta3(actionData.t3);
    if (actionData.g !== undefined) setGripper(actionData.g);
    if (actionData.range !== undefined) setLidarRange(actionData.range);
  };

  const handleResetAll = () => {
    setIsAutomated(false);
    setIsAutopilot(false);
    setTheta1(45);
    setTheta2(-30);
    setTheta3(60);
    setGripper(40);
    setRobotX(200);
    setRobotY(150);
    setRobotHeading(0);
    setLidarRange(120);
    toast({
      title: '🔄 تمت إعادة الضبط بالكامل',
      description: 'تمت استعادة الإعدادات الأولية لكافة المحاكيات.'
    });
  };

  // Inverse Kinematics 2D Planar Solver for Arms
  const solveInverseKinematics = (targetX: number, targetY: number) => {
    const distSq = targetX * targetX + targetY * targetY;
    const cosTheta2 = (distSq - L1 * L1 - L2 * L2) / (2 * L1 * L2);

    if (cosTheta2 < -1 || cosTheta2 > 1) {
      toast({
        title: '⚠️ الهدف خارج مجال حركة الذراع (Unreachable)',
        description: 'المسافة المطلوبة أبعد من الامتداد الفيزيائي للذراع.',
        variant: 'destructive'
      });
      return;
    }

    const sinTheta2 = Math.sqrt(1 - cosTheta2 * cosTheta2);
    const calculatedTheta2 = Math.round((Math.atan2(sinTheta2, cosTheta2) * 180) / Math.PI);

    const k1 = L1 + L2 * cosTheta2;
    const k2 = L2 * sinTheta2;
    const calculatedTheta1 = Math.round(((Math.atan2(targetY, targetX) - Math.atan2(k2, k1)) * 180) / Math.PI);

    setTheta1(Math.min(180, Math.max(0, calculatedTheta1)));
    setTheta2(Math.min(90, Math.max(-90, calculatedTheta2)));

    toast({
      title: '🎯 تم حل الحركيات العكسية بنجاح!',
      description: `حُسبت الزوايا تلقائياً: θ₁=${calculatedTheta1}° و θ₂=${calculatedTheta2}° للوصول للنقطة (${targetX}, ${targetY})`,
    });
  };

  const handleTargetDetected = (x: number, y: number, color: string) => {
    // Map normalized visual coordinate to arm joint angles in real time
    const mappedTheta1 = Math.round((x / 640) * 140 + 20);
    const mappedTheta2 = Math.round((y / 420) * 60 - 30);
    setTheta1(mappedTheta1);
    setTheta2(mappedTheta2);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir="rtl">
      <SEO
        title="قسم الروبوتات والذكاء الاصطناعي والأتمتة | ذروة العلم"
        description="مختبرات افتراضية هندسية لمحاكاة حركيات الأذرع الروبوتية (Kinematics)، برمجة أنظمة ROS 2 و Python، وملاحة الروبوتات المستقلة بالـ LiDAR والذكاء الاصطناعي."
        keywords="روبوتات, ذكاء اصطناعي, Inverse Kinematics, ROS2, Python, LiDAR, الرؤية الحاسوبية, أتمتة صناعية, ذروة العلم"
      />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            قسم الروبوتات والذكاء الاصطناعي
          </span>
        </div>

        {/* Hero Section Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-blue-500/30 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left/Main Text Column */}
            <div className="lg:col-span-7 p-8 sm:p-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30">
                <Cpu className="w-4 h-4 animate-spin-slow" />
                <span>الجيل القادم من الهندسة التطبيقية 2.0</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                قسم الروبوتات والذكاء الاصطناعي والأتمتة الذكية
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm sm:leading-relaxed">
                بيئة تعليمية وهندسية تفاعلية متكاملة تدمج الحركيات المباشرة والعكسية (Forward & Inverse Kinematics)، أنظمة الملاحة الذاتية عبر مستشعرات LiDAR، برمجة روبوتات ROS 2 ومتحكمات Python، والشبكات العصبية للرؤية الحاسوبية، مدعومة بمعلم ذكي يشرح كل خيار بدقة وتفصيل.
              </p>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-blue-600 dark:text-blue-300 border-blue-500/30 px-2.5 py-1 text-xs">
                  <Layers className="w-3.5 h-3.5 ml-1.5" /> 4 مسارات معتمدة
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 px-2.5 py-1 text-xs">
                  <Cpu className="w-3.5 h-3.5 ml-1.5" /> محاكي Wokwi والدوائر
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 px-2.5 py-1 text-xs">
                  <Radar className="w-3.5 h-3.5 ml-1.5" /> 360° LiDAR & SLAM
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-purple-600 dark:text-purple-300 border-purple-500/30 px-2.5 py-1 text-xs">
                  <BrainCircuit className="w-3.5 h-3.5 ml-1.5" /> رؤية YOLOv8
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-amber-600 dark:text-amber-300 border-amber-500/30 px-2.5 py-1 text-xs">
                  <Swords className="w-3.5 h-3.5 ml-1.5" /> حلبة منافسات المتاهة
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 px-2.5 py-1 text-xs">
                  <Printer className="w-3.5 h-3.5 ml-1.5" /> 5 مشاريع توأم رقمي
                </Badge>
              </div>
            </div>

            {/* Right Bespoke Image Column */}
            <div className="lg:col-span-5 h-56 sm:h-72 lg:h-full relative overflow-hidden">
              <img
                src={roboticsHeroBg}
                alt="قسم الروبوتات والذكاء الاصطناعي"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-transparent to-white dark:to-[#060919]/90" />
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE: Side Navigation + Content Area Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Side Navigation Sidebar (Right side in RTL) */}
          <RoboticsSidebar
            activeTab={activeMainTab}
            onSelectTab={setActiveMainTab}
            onResetAll={handleResetAll}
          />

          {/* Active Lab Content Area */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {/* Elegant AI Explainer & Co-Pilot (Dedicated to every single option) */}
            <AIRoboticsExplainer
              sectionKey={activeMainTab}
              onApplyPreset={handleApplyAIPreset}
            />

            {/* TAB 1: Pathways */}
            {activeMainTab === 'pathways' && (
              <div className="space-y-6">
                <RoboticsPathways onLaunchLab={(lab) => {
                  if (lab === 'wokwi') setActiveMainTab('wokwi');
                  else if (lab === 'kinematics') setActiveMainTab('arm');
                  else if (lab === 'vision') setActiveMainTab('vision');
                  else if (lab === 'arena') setActiveMainTab('arena');
                  else if (lab === 'digital-twin') setActiveMainTab('digital-twin');
                }} />
              </div>
            )}

            {/* TAB 2: Hardware Circuit Sandbox */}
            {activeMainTab === 'wokwi' && (
              <div className="space-y-6">
                <HardwareCircuitSandbox />
              </div>
            )}

            {/* TAB 3: Robotic Arm Kinematics */}
            {activeMainTab === 'arm' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Canvas Simulator Visualizer */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          محاكاة حركيات الذراع الروبوتية في الوقت الحقيقي
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isAutomated ? "destructive" : "default"}
                          onClick={() => setIsAutomated(!isAutomated)}
                          className="text-xs rounded-xl"
                        >
                          {isAutomated ? 'إيقاف الحركة الآلية' : 'تشغيل مسار آلي'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleResetArm}
                          className="text-xs rounded-xl border-slate-200 dark:border-slate-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة ضبط
                        </Button>
                      </div>
                    </div>

                    {/* Canvas */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                      <canvas
                        ref={armCanvasRef}
                        width={560}
                        height={380}
                        className="w-full max-w-[560px] h-auto"
                      />
                      {/* Overlay Coordinates HUD */}
                      <div className="absolute top-4 start-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 text-xs font-mono space-y-1 shadow-sm">
                        <div className="text-slate-500 dark:text-slate-400">نقطة العمل (TCP):</div>
                        <div className="text-blue-600 dark:text-blue-400 font-bold">X: {endX} mm</div>
                        <div className="text-cyan-600 dark:text-cyan-400 font-bold">Y: {endY} mm</div>
                        <div className="text-purple-600 dark:text-purple-400 font-bold">Z: {endZ} mm</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block">زاوية القاعدة (θ₁)</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">{theta1}°</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block">زاوية الكتف (θ₂)</span>
                        <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">{theta2}°</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block">زاوية الكوع (θ₃)</span>
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">{theta3}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Controls Column */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        لوحة التحكم بالمفاصل والمحركات المؤازرة (Servos)
                      </h3>
                    </div>

                    {/* Slider 1: Theta 1 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">مفصل القاعدة θ₁ (Base Joint)</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{theta1}°</span>
                      </div>
                      <Slider
                        value={[theta1]}
                        min={0}
                        max={180}
                        step={1}
                        onValueChange={vals => setTheta1(vals[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>0°</span>
                        <span>90°</span>
                        <span>180°</span>
                      </div>
                    </div>

                    {/* Slider 2: Theta 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">مفصل الكتف θ₂ (Shoulder Joint)</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{theta2}°</span>
                      </div>
                      <Slider
                        value={[theta2]}
                        min={-90}
                        max={90}
                        step={1}
                        onValueChange={vals => setTheta2(vals[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>-90°</span>
                        <span>0°</span>
                        <span>+90°</span>
                      </div>
                    </div>

                    {/* Slider 3: Theta 3 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">مفصل الكوع θ₃ (Elbow Joint)</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400">{theta3}°</span>
                      </div>
                      <Slider
                        value={[theta3]}
                        min={-90}
                        max={120}
                        step={1}
                        onValueChange={vals => setTheta3(vals[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>-90°</span>
                        <span>0°</span>
                        <span>+120°</span>
                      </div>
                    </div>

                    {/* Slider 4: Gripper */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">فتحة القابض الميكانيكي (Gripper)</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400">{gripper}%</span>
                      </div>
                      <Slider
                        value={[gripper]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={vals => setGripper(vals[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Inverse Kinematics Interactive Solver for Students */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs space-y-2.5">
                      <div className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-500" />
                        حاسبة الحركيات العكسية التفاعلية (IK Target Solver):
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        انقر على أحد أهداف المهام التصنيعية وسيقوم الخوارزم بحساب وحل زوايا المفاصل تلقائياً:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => solveInverseKinematics(140, 90)}
                          className="text-[11px] h-7 px-2.5 rounded-lg border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                        >
                          الهدف 1: (X: 140, Y: 90)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => solveInverseKinematics(70, 150)}
                          className="text-[11px] h-7 px-2.5 rounded-lg border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                        >
                          الهدف 2: (X: 70, Y: 150)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => solveInverseKinematics(180, 50)}
                          className="text-[11px] h-7 px-2.5 rounded-lg border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                        >
                          الهدف 3: (X: 180, Y: 50)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Autonomous Mobile Robot (LiDAR AMR) */}
            {activeMainTab === 'amr' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* LiDAR Viewport */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Radar className="w-5 h-5 text-cyan-500 animate-spin-slow" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          الملاحة الذاتية ومسح البيئة بالليدار (360° 2D LiDAR SLAM)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isAutopilot ? "destructive" : "default"}
                          onClick={() => setIsAutopilot(!isAutopilot)}
                          className="text-xs rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          <Navigation className="w-3.5 h-3.5 ml-1" />
                          {isAutopilot ? 'إيقاف القيادة الذاتية' : 'تفعيل القيادة الذاتية'}
                        </Button>
                      </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                      <canvas
                        ref={lidarCanvasRef}
                        width={480}
                        height={320}
                        className="w-full max-w-[480px] h-auto"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        أزرار التوجيه المباشر للروبوت:
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRobotHeading(h => h - 0.2)}
                          className="rounded-xl border-slate-300 dark:border-slate-700"
                        >
                          دوران يسار ↺
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRobotX(x => Math.min(420, Math.max(60, x + Math.cos(robotHeading) * 20)));
                            setRobotY(y => Math.min(270, Math.max(50, y + Math.sin(robotHeading) * 20)));
                          }}
                          className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                        >
                          تقدم للأمام ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRobotX(x => Math.min(420, Math.max(60, x - Math.cos(robotHeading) * 20)));
                            setRobotY(y => Math.min(270, Math.max(50, y - Math.sin(robotHeading) * 20)));
                          }}
                          className="rounded-xl border-slate-300 dark:border-slate-700"
                        >
                          تراجع للخلف ↓
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRobotHeading(h => h + 0.2)}
                          className="rounded-xl border-slate-300 dark:border-slate-700"
                        >
                          دوران يمين ↻
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sensor & SLAM Config */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Settings2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        معايير مستشعر الليزر وخوارزمية تجنب العقبات
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">مدى شعاع الليدار (Range)</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{lidarRange} cm</span>
                      </div>
                      <Slider
                        value={[lidarRange]}
                        min={60}
                        max={200}
                        step={5}
                        onValueChange={vals => setLidarRange(vals[0])}
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">حالة الاتصال والبيانات الحية:</h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">موقع الروبوت X, Y</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(robotX)}, {Math.round(robotY)}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الاتجاه (Heading)</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round((robotHeading * 180) / Math.PI)}°</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-xs space-y-2">
                        <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          خوارزمية الملاحة (A* Search & DWA):
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                          يقوم المعالج على متن الروبوت ببناء خريطة شبكية إشغالية (Occupancy Grid Map) وحساب أقصر مسار خالي من الاصطدام وتحديث مصفوفة السرعات الخطية والزاوية بمعدل 50 مرة في الثانية.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI Vision Playground */}
            {activeMainTab === 'vision' && (
              <div className="space-y-6">
                <AIVisionPlayground onTargetDetected={handleTargetDetected} />
              </div>
            )}

            {/* TAB 6: Code Arena & Maze */}
            {activeMainTab === 'arena' && (
              <div className="space-y-6">
                <CodeArenaMaze />
              </div>
            )}

            {/* TAB 7: Digital Twin & 3D STL Capstones */}
            {activeMainTab === 'digital-twin' && (
              <div className="space-y-6">
                <DigitalTwinProjects />
              </div>
            )}

            {/* TAB 8: ROS 2 & Python Code Studio */}
            {activeMainTab === 'code' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Code Editor Panel */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          محرر برمجة الروبوتات الصناعية
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyCode}
                          className="text-xs rounded-xl border-slate-300 dark:border-slate-700"
                        >
                          <Copy className="w-3.5 h-3.5 ml-1" /> نسخ الكود
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRunCode}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 ml-1" /> تنفيذ الكود
                        </Button>
                      </div>
                    </div>

                    {/* Code Tabs */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveCodeTab('ros2')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          activeCodeTab === 'ros2'
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        ROS 2 Node (Python)
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('python')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          activeCodeTab === 'python'
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Kinematics Solver
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('vision')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          activeCodeTab === 'vision'
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        YOLOv8 Vision AI
                      </button>
                    </div>

                    {/* Syntax Code Display */}
                    <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto dir-ltr text-left">
                      {activeCodeTab === 'ros2' && (
                        <pre className="text-emerald-400">
{`import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState

class ArmControllerNode(Node):
    def __init__(self):
        super().__init__('robot_arm_controller')
        self.publisher_ = self.create_publisher(JointState, '/joint_states', 10)
        self.timer = self.create_timer(0.02, self.publish_joint_angles)
        self.get_logger().info('Manipulator controller online.')

    def publish_joint_angles(self):
        msg = JointState()
        msg.name = ['base', 'shoulder', 'elbow']
        msg.position = [${(theta1 * Math.PI / 180).toFixed(2)}, ${(theta2 * Math.PI / 180).toFixed(2)}, ${(theta3 * Math.PI / 180).toFixed(2)}]
        self.publisher_.publish(msg)`}
                        </pre>
                      )}

                      {activeCodeTab === 'python' && (
                        <pre className="text-cyan-400">
{`import numpy as np

def compute_dh_matrix(theta, d, a, alpha):
    """Denavit-Hartenberg standard matrix transformation"""
    return np.array([
        [np.cos(theta), -np.sin(theta)*np.cos(alpha),  np.sin(theta)*np.sin(alpha), a*np.cos(theta)],
        [np.sin(theta),  np.cos(theta)*np.cos(alpha), -np.cos(theta)*np.sin(alpha), a*np.sin(theta)],
        [0,              np.sin(alpha),                np.cos(alpha),               d],
        [0,              0,                            0,                           1]
    ])

T01 = compute_dh_matrix(np.radians(${theta1}), 0, 110, 0)
T12 = compute_dh_matrix(np.radians(${theta2}), 0, 90,  0)
T23 = compute_dh_matrix(np.radians(${theta3}), 0, 50,  0)
T03 = T01 @ T12 @ T23
print(f"End Effector Position: X={T03[0,3]:.1f}, Y={T03[1,3]:.1f}")`}
                        </pre>
                      )}

                      {activeCodeTab === 'vision' && (
                        <pre className="text-amber-400">
{`from ultralytics import YOLO
import cv2

model = YOLO('industrial_robotics_detector.pt')
results = model.predict(source=0, conf=0.85, show=False)

for box in results[0].boxes:
    cls_id = int(box.cls[0])
    confidence = float(box.conf[0])
    print(f"Detected Component {cls_id} with confidence: {confidence:.2%}")
    # Convert pixel coords to robot base frame coordinates
    robot_x, robot_y = camera_to_robot_transform(box.xywh[0])`}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* Live Terminal Output */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Terminal className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        طرفية النظام التفاعلية (Live Terminal)
                      </h3>
                    </div>

                    <div className="h-72 rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto space-y-2 dir-ltr text-left">
                      {terminalOutput.map((line, idx) => (
                        <div key={idx} className="leading-relaxed">
                          {line.includes('INFO') && <span className="text-cyan-400">{line}</span>}
                          {line.includes('Success') && <span className="text-emerald-400 font-bold">{line}</span>}
                          {line.includes('Joint') && <span className="text-purple-400">{line}</span>}
                          {!line.includes('INFO') && !line.includes('Success') && !line.includes('Joint') && (
                            <span className="text-slate-300">{line}</span>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center gap-1 text-slate-500 pt-2">
                        <span className="text-emerald-400">$</span>
                        <span className="animate-pulse">_</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      💡 تتيح هذه البيئة للطلبة والمهندسين اختبار خوارزميات التحكم الفوري، وحساب مصفوفات الدوران، وإرسال أوامر الحركة مباشرة عبر معايير ROS2 الصناعية.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoboticsSection;
