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
  Pause,
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
  Navigation,
  SlidersHorizontal,
  Flag,
  Plus,
  Trash2,
  Flame,
  Workflow,
  AlertTriangle,
  Move,
  Maximize2
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

interface Waypoint {
  id: number;
  label: string;
  theta1: number;
  theta2: number;
  theta3: number;
  gripper: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export const RoboticsSection: React.FC = () => {
  const { toast } = useToast();

  // Layout View Mode: 'horizontal' (Panoramic widescreen) or 'vertical' (Side-by-side)
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal');

  // Main Tab State
  const [activeMainTab, setActiveMainTab] = useState<string>('pathways');

  // -------------------------------------------------------------
  // ROBOTIC ARM KINEMATICS STATE & PHYSICS
  // -------------------------------------------------------------
  const [theta1, setTheta1] = useState(45); // Base angle (deg)
  const [theta2, setTheta2] = useState(-30); // Shoulder angle (deg)
  const [theta3, setTheta3] = useState(60); // Elbow angle (deg)
  const [gripper, setGripper] = useState(40); // Gripper openness %
  const [isAutomated, setIsAutomated] = useState(false);
  const [deliveredCount, setDeliveredCount] = useState(0);

  // Physical Workpiece for Pick-and-Place
  const [workpiece, setWorkpiece] = useState({
    x: 160,
    y: 330,
    isGrasped: false,
    isDelivered: false
  });

  // Waypoints for Teach & Repeat
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 1, label: 'موضع الاستعداد (Home)', theta1: 45, theta2: -30, theta3: 60, gripper: 40 },
    { id: 2, label: 'فوق القطعة (Approach)', theta1: 75, theta2: -10, theta3: 20, gripper: 80 }
  ]);
  const [isPlayingTrajectory, setIsPlayingTrajectory] = useState(false);

  // -------------------------------------------------------------
  // AMR / LIDAR & SLAM SIMULATOR STATE
  // -------------------------------------------------------------
  const [robotX, setRobotX] = useState(180);
  const [robotY, setRobotY] = useState(160);
  const [robotHeading, setRobotHeading] = useState(0);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [lidarRange, setLidarRange] = useState(130);
  const [targetGoal, setTargetGoal] = useState<{ x: number; y: number } | null>(null);
  const [exploredPercent, setExploredPercent] = useState(25);
  const [linearVelocity, setLinearVelocity] = useState(0);
  const [angularVelocity, setAngularVelocity] = useState(0);

  // Dynamic Obstacles in Warehouse
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { id: 1, x: 90, y: 70, w: 55, h: 50, label: 'مستودع A' },
    { id: 2, x: 480, y: 80, w: 60, h: 55, label: 'محطة الشحن' },
    { id: 3, x: 130, y: 250, w: 50, h: 50, label: 'منصة وزن' },
    { id: 4, x: 440, y: 240, w: 55, h: 50, label: 'حاوية تفريغ' }
  ]);

  // -------------------------------------------------------------
  // CODE PLAYGROUND & ROS 2 STATE
  // -------------------------------------------------------------
  const [activeCodeTab, setActiveCodeTab] = useState<'ros2' | 'python' | 'vision'>('ros2');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[ROS2_CORE] Initializing ROS 2 Humble node: /robot_arm_controller...',
    '[TOPIC] Publishing joint_states at 50Hz to /joint_states',
    '[HARDWARE] Connected to 6-DOF Industrial Manipulator on /dev/ttyUSB0',
    '[READY] Ready for motion trajectory planning.'
  ]);

  const armCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lidarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Link Lengths (mm / px)
  const L1 = 120; // Upper arm length
  const L2 = 100; // Forearm length
  const L3 = 55;  // End-effector length

  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = (theta2 * Math.PI) / 180;
  const rad3 = (theta3 * Math.PI) / 180;

  // Approximate 3D Cartesian coordinates
  const endX = Math.round(L1 * Math.cos(rad1) + L2 * Math.cos(rad1 + rad2) + L3 * Math.cos(rad1 + rad2 + rad3));
  const endY = Math.round(L1 * Math.sin(rad1) + L2 * Math.sin(rad1 + rad2) + L3 * Math.sin(rad1 + rad2 + rad3));
  const endZ = Math.round(90 + L1 * Math.sin(rad2) + L2 * Math.sin(rad2 + rad3));

  // Denavit-Hartenberg (D-H) Transformation Matrix elements (T03)
  const r11 = Number((Math.cos(rad1 + rad2 + rad3)).toFixed(3));
  const r12 = Number((-Math.sin(rad1 + rad2 + rad3)).toFixed(3));
  const r21 = Number((Math.sin(rad1 + rad2 + rad3)).toFixed(3));
  const r22 = Number((Math.cos(rad1 + rad2 + rad3)).toFixed(3));

  // Singularity Detector (Jacobian Determinant approximation)
  // Arm enters singularity when theta2 reaches 0 (fully outstretched) or +/-180 (folded)
  const jacobianDet = Math.abs(Math.sin(rad2));
  const isSingularity = jacobianDet < 0.12;

  // -------------------------------------------------------------
  // ROBOTIC ARM RENDERER & INTERACTIVE GRASPING
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = armCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseOriginX = canvas.width / 2;
    const baseOriginY = canvas.height - 70;

    // Floor Grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, baseOriginY + 25);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Pedestal Base
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(baseOriginX - 55, baseOriginY, 110, 25, 8);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Turret
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(baseOriginX, baseOriginY, 24, Math.PI, 0);
    ctx.fill();

    // Forward Kinematics Joint Coordinates
    const j1x = baseOriginX;
    const j1y = baseOriginY - 20;

    const j2x = j1x + L1 * Math.cos(rad1);
    const j2y = j1y - L1 * Math.sin(rad1);

    const j3x = j2x + L2 * Math.cos(rad1 + rad2);
    const j3y = j2y - L2 * Math.sin(rad1 + rad2);

    const eex = j3x + L3 * Math.cos(rad1 + rad2 + rad3);
    const eey = j3y - L3 * Math.sin(rad1 + rad2 + rad3);

    // Target Collection Container on Floor (Left side in RTL or Right side in coords)
    const binX = baseOriginX + 160;
    const binY = baseOriginY - 25;
    const binW = 85;
    const binH = 50;

    // Draw Target Bin
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(binX, binY, binW, binH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '10px Cairo, sans-serif';
    ctx.fillText('حاوية الفرز 🎯', binX + 12, binY + 28);

    // Workpiece (Industrial Cube)
    let currentCubeX = workpiece.x;
    let currentCubeY = workpiece.y;

    // Grasping Logic: If gripper is closed (< 35%) and end effector is close (< 32px), attach cube!
    const distToCube = Math.hypot(eex - currentCubeX, eey - currentCubeY);

    if (distToCube < 32 && gripper <= 35 && !workpiece.isDelivered) {
      if (!workpiece.isGrasped) {
        setWorkpiece(prev => ({ ...prev, isGrasped: true }));
      }
    }

    if (workpiece.isGrasped) {
      currentCubeX = eex;
      currentCubeY = eey + 12;

      // Drop Logic: If gripper opens (> 50%) while over bin
      if (gripper > 50) {
        setWorkpiece(prev => ({ ...prev, isGrasped: false }));

        if (eex >= binX && eex <= binX + binW && eey >= binY - 40 && eey <= binY + binH) {
          // Delivered successfully!
          setWorkpiece(prev => ({ ...prev, isDelivered: true, x: binX + 30, y: binY + 25 }));
          setDeliveredCount(c => c + 1);
          toast({
            title: '🎉 رائع! تم إتمام نقل القطعة بنجاح',
            description: `أودعت القطعة في حاوية التجميع. إجمالي القطع المنقولة: ${deliveredCount + 1}`
          });

          // Spawn new workpiece after 1.8 seconds
          setTimeout(() => {
            setWorkpiece({
              x: baseOriginX - 160,
              y: baseOriginY - 10,
              isGrasped: false,
              isDelivered: false
            });
          }, 1800);
        }
      }
    }

    // Draw Workpiece
    ctx.save();
    ctx.fillStyle = workpiece.isGrasped ? '#f59e0b' : '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(currentCubeX - 12, currentCubeY - 12, 24, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Workpiece label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px Cairo, sans-serif';
    ctx.fillText('RFID', currentCubeX - 10, currentCubeY + 3);
    ctx.restore();

    // Link 1 (Upper Arm)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(j1x, j1y);
    ctx.lineTo(j2x, j2y);
    ctx.stroke();

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(j1x, j1y);
    ctx.lineTo(j2x, j2y);
    ctx.stroke();

    // Joint 2 (Shoulder Pivot)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(j2x, j2y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Link 2 (Forearm)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(j2x, j2y);
    ctx.lineTo(j3x, j3y);
    ctx.stroke();

    // Joint 3 (Elbow Pivot)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(j3x, j3y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Link 3 (Wrist)
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(j3x, j3y);
    ctx.lineTo(eex, eey);
    ctx.stroke();

    // Gripper / Tool End-Effector
    ctx.save();
    ctx.translate(eex, eey);
    ctx.rotate(-(rad1 + rad2 + rad3));

    // Gripper Mount
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-10, -5, 20, 10, 3);
    ctx.fill();

    // Claws
    const clawSpan = (gripper / 100) * 18 + 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;

    // Left Claw
    ctx.beginPath();
    ctx.moveTo(-5, -clawSpan / 2);
    ctx.lineTo(16, -clawSpan / 2);
    ctx.lineTo(20, -clawSpan / 4);
    ctx.stroke();

    // Right Claw
    ctx.beginPath();
    ctx.moveTo(-5, clawSpan / 2);
    ctx.lineTo(16, clawSpan / 2);
    ctx.lineTo(20, clawSpan / 4);
    ctx.stroke();

    // Laser Targeting Beam
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser Dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(60, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Joint Angle Labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px Cairo, monospace';
    ctx.fillText(`θ₁: ${theta1}°`, j1x + 12, j1y + 12);
    ctx.fillText(`θ₂: ${theta2}°`, j2x + 12, j2y - 12);
    ctx.fillText(`θ₃: ${theta3}°`, j3x + 12, j3y - 12);
  }, [theta1, theta2, theta3, gripper, workpiece, deliveredCount]);

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

  // -------------------------------------------------------------
  // AUTONOMOUS MOBILE ROBOT (AMR & 360° LIDAR SLAM)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = lidarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const renderLidar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radar Dark Grid
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Concentric Range Rings
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;
      [50, 100, 150, 200, 250].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(robotX, robotY, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '9px monospace';
        ctx.fillText(`${(idx + 1) * 0.5}m`, robotX + r - 15, robotY - 4);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(robotX - 250, robotY);
      ctx.lineTo(robotX + 250, robotY);
      ctx.moveTo(robotX, robotY - 250);
      ctx.lineTo(robotX, robotY + 250);
      ctx.stroke();

      // Draw Planned Path to Target Goal (if any)
      if (targetGoal) {
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(robotX, robotY);
        ctx.lineTo(targetGoal.x, targetGoal.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Flag
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(targetGoal.x, targetGoal.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = '10px Cairo, sans-serif';
        ctx.fillText('الهدف 🚩', targetGoal.x + 8, targetGoal.y - 8);
      }

      // 360° LiDAR Ray Cast Sweep
      const rayCount = 72;
      const angleStep = (Math.PI * 2) / rayCount;

      for (let i = 0; i < rayCount; i++) {
        const rayAngle = i * angleStep;
        let hitDist = lidarRange;
        let hitX = robotX + Math.cos(rayAngle) * lidarRange;
        let hitY = robotY + Math.sin(rayAngle) * lidarRange;
        let isHitObstacle = false;

        // Step ray
        for (let d = 10; d < lidarRange; d += 6) {
          const checkX = robotX + Math.cos(rayAngle) * d;
          const checkY = robotY + Math.sin(rayAngle) * d;

          // Wall checks
          if (checkX <= 15 || checkX >= canvas.width - 15 || checkY <= 15 || checkY >= canvas.height - 15) {
            hitDist = d;
            hitX = checkX;
            hitY = checkY;
            isHitObstacle = true;
            break;
          }

          // Obstacles check
          const hit = obstacles.some(
            obs => checkX >= obs.x && checkX <= obs.x + obs.w && checkY >= obs.y && checkY <= obs.y + obs.h
          );
          if (hit) {
            hitDist = d;
            hitX = checkX;
            hitY = checkY;
            isHitObstacle = true;
            break;
          }
        }

        // Draw Ray Line
        ctx.strokeStyle = isHitObstacle ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(robotX, robotY);
        ctx.lineTo(hitX, hitY);
        ctx.stroke();

        // Draw LiDAR Hit Point (Point Cloud)
        if (isHitObstacle) {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(hitX, hitY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Obstacle Boxes
      obstacles.forEach(obs => {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px Cairo, sans-serif';
        ctx.fillText(obs.label, obs.x + 8, obs.y + obs.h / 2 + 3);
      });

      // Draw Autonomous Mobile Robot (AMR Body)
      ctx.save();
      ctx.translate(robotX, robotY);
      ctx.rotate(robotHeading);

      // Chassis
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-22, -16, 44, 32, 6);
      ctx.fill();
      ctx.stroke();

      // Left & Right Drive Wheels
      ctx.fillStyle = '#334155';
      ctx.fillRect(-15, -20, 30, 4);
      ctx.fillRect(-15, 16, 30, 4);

      // Spinning LiDAR Puck
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Heading Arrow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      ctx.restore();

      animFrame = requestAnimationFrame(renderLidar);
    };

    renderLidar();
    return () => cancelAnimationFrame(animFrame);
  }, [robotX, robotY, robotHeading, lidarRange, obstacles, targetGoal]);

  // Autopilot Loop (Navigate towards Goal or Wander)
  useEffect(() => {
    if (!isAutopilot && !targetGoal) {
      setLinearVelocity(0);
      setAngularVelocity(0);
      return;
    }

    const interval = setInterval(() => {
      if (targetGoal) {
        // Navigate towards goal
        const dx = targetGoal.x - robotX;
        const dy = targetGoal.y - robotY;
        const dist = Math.hypot(dx, dy);

        if (dist < 15) {
          setTargetGoal(null);
          setLinearVelocity(0);
          setAngularVelocity(0);
          toast({
            title: '🏁 وصل الروبوت إلى الهدف بنجاح!',
            description: 'تمت الملاحة الذاتية بدقة مع تفادي كافة العوائق بالليدار.'
          });
          return;
        }

        const desiredHeading = Math.atan2(dy, dx);
        let headingDiff = desiredHeading - robotHeading;
        while (headingDiff > Math.PI) headingDiff -= 2 * Math.PI;
        while (headingDiff < -Math.PI) headingDiff += 2 * Math.PI;

        setRobotHeading(h => h + headingDiff * 0.15);
        setRobotX(x => x + Math.cos(robotHeading) * 3);
        setRobotY(y => y + Math.sin(robotHeading) * 3);
        setLinearVelocity(0.42);
        setAngularVelocity(Number((headingDiff * 0.15 * 50).toFixed(1)));
        setExploredPercent(p => Math.min(96, p + 0.3));
      } else if (isAutopilot) {
        // Autonomous exploration loop
        setRobotHeading(prev => prev + 0.03);
        setRobotX(prev => {
          const nextX = prev + Math.cos(robotHeading) * 2.5;
          if (nextX > 540 || nextX < 50) {
            setRobotHeading(h => h + Math.PI / 2);
            return prev;
          }
          return nextX;
        });
        setRobotY(prev => {
          const nextY = prev + Math.sin(robotHeading) * 2.5;
          if (nextY > 320 || nextY < 50) {
            setRobotHeading(h => h + Math.PI / 2);
            return prev;
          }
          return nextY;
        });
        setLinearVelocity(0.35);
        setAngularVelocity(1.5);
        setExploredPercent(p => Math.min(96, p + 0.2));
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isAutopilot, targetGoal, robotX, robotY, robotHeading]);

  // Handle Canvas Click to Set Navigation Goal
  const handleLidarCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = lidarCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    setTargetGoal({ x: Math.round(clickX), y: Math.round(clickY) });
    toast({
      title: '🎯 تم تحديد وجهة الملاحة الجديدة',
      description: `الإحداثيات: X=${Math.round(clickX)}, Y=${Math.round(clickY)} - جاري التخطيط بالـ A* والليدار.`
    });
  };

  // Add Dynamic Obstacle
  const handleAddObstacle = () => {
    const newId = obstacles.length + 1;
    const newObs: Obstacle = {
      id: newId,
      x: Math.round(150 + Math.random() * 300),
      y: Math.round(100 + Math.random() * 150),
      w: 50,
      h: 50,
      label: `طرد جديد #${newId}`
    };
    setObstacles(prev => [...prev, newObs]);
    toast({
      title: '📦 تم وضع عائق ديناميكي جديد في المستودع',
      description: 'سيقوم الليدار برصده وتعديل المسار فوراً.'
    });
  };

  // Automated Pick & Place Trajectory Routine
  const handleRunPickAndPlaceSequence = () => {
    setIsPlayingTrajectory(true);
    (toast as any).info('🚀 بدأت دورة الالتقاط والنقل الأوتوماتيكية...');

    // Step 1: Open gripper & approach workpiece
    setTheta1(60);
    setTheta2(-15);
    setTheta3(40);
    setGripper(90);

    setTimeout(() => {
      // Step 2: Drop on cube and grab
      setGripper(20);
      (toast as any).info('🧲 تم التقاط المكعب وتأمين المقبض.');

      setTimeout(() => {
        // Step 3: Lift up
        setTheta2(-40);
        setTheta3(60);

        setTimeout(() => {
          // Step 4: Swing to bin
          setTheta1(120);
          setTheta2(-10);
          setTheta3(30);

          setTimeout(() => {
            // Step 5: Release into bin
            setGripper(85);
            setIsPlayingTrajectory(false);
          }, 1000);
        }, 1000);
      }, 900);
    }, 1100);
  };

  // Save current joint pose as Waypoint
  const handleSaveWaypoint = () => {
    const newId = waypoints.length + 1;
    const newWp: Waypoint = {
      id: newId,
      label: `نقطة المسار P${newId}`,
      theta1,
      theta2,
      theta3,
      gripper
    };
    setWaypoints(prev => [...prev, newWp]);
    toast({
      title: `✅ تم حفظ النقطة P${newId}`,
      description: `θ₁=${theta1}°, θ₂=${theta2}°, θ₃=${theta3}°, G=${gripper}%`
    });
  };

  // Play Recorded Waypoints
  const handlePlayWaypoints = () => {
    if (waypoints.length === 0) return;
    setIsPlayingTrajectory(true);
    (toast as any).info('▶️ جاري تشغيل التسلسل الحركي المسجل (Teach & Repeat)...');

    waypoints.forEach((wp, index) => {
      setTimeout(() => {
        setTheta1(wp.theta1);
        setTheta2(wp.theta2);
        setTheta3(wp.theta3);
        setGripper(wp.gripper);
        if (index === waypoints.length - 1) {
          setIsPlayingTrajectory(false);
          (toast as any).success('🎉 اكتمل تنفيذ مسار الحركة بنجاح!');
        }
      }, index * 1200);
    });
  };

  // Code actions
  const handleCopyCode = () => {
    let codeStr = '';
    if (activeCodeTab === 'ros2') {
      codeStr = `import rclpy\nfrom rclpy.node import Node\nfrom sensor_msgs.msg import JointState\n\nclass ArmControllerNode(Node):\n    def __init__(self):\n        super().__init__('robot_arm_controller')\n        self.publisher_ = self.create_publisher(JointState, '/joint_states', 10)\n        self.timer = self.create_timer(0.02, self.publish_joint_angles)\n        self.get_logger().info('Manipulator controller online.')\n\n    def publish_joint_angles(self):\n        msg = JointState()\n        msg.name = ['base', 'shoulder', 'elbow']\n        msg.position = [${(theta1 * Math.PI / 180).toFixed(2)}, ${(theta2 * Math.PI / 180).toFixed(2)}, ${(theta3 * Math.PI / 180).toFixed(2)}]\n        self.publisher_.publish(msg)`;
    } else if (activeCodeTab === 'python') {
      codeStr = `import numpy as np\n\ndef compute_dh_matrix(theta, d, a, alpha):\n    return np.array([\n        [np.cos(theta), -np.sin(theta)*np.cos(alpha),  np.sin(theta)*np.sin(alpha), a*np.cos(theta)],\n        [np.sin(theta),  np.cos(theta)*np.cos(alpha), -np.cos(theta)*np.sin(alpha), a*np.sin(theta)],\n        [0,              np.sin(alpha),                np.cos(alpha),               d],\n        [0,              0,                            0,                           1]\n    ])\n\nT01 = compute_dh_matrix(np.radians(${theta1}), 0, 120, 0)\nT12 = compute_dh_matrix(np.radians(${theta2}), 0, 100,  0)\nT23 = compute_dh_matrix(np.radians(${theta3}), 0, 55,  0)\nT03 = T01 @ T12 @ T23\nprint(f"End Effector Position: X={T03[0,3]:.1f}, Y={T03[1,3]:.1f}")`;
    } else {
      codeStr = `from ultralytics import YOLO\nimport cv2\n\nmodel = YOLO('industrial_robotics_detector.pt')\nresults = model.predict(source=0, conf=0.85, show=False)\n\nfor box in results[0].boxes:\n    cls_id = int(box.cls[0])\n    confidence = float(box.conf[0])\n    print(f"Detected Component {cls_id} with confidence: {confidence:.2%}")`;
    }
    navigator.clipboard.writeText(codeStr);
    toast({
      title: '📋 تم نسخ الكود البرمجي',
      description: 'الكود جاهز للتنفيذ في ROS 2 أو بيئة بايثون.'
    });
  };

  const handleRunCode = () => {
    const timestamp = new Date().toLocaleTimeString('ar-JO');
    setTerminalOutput(prev => [
      ...prev,
      `[${timestamp}] [EXEC] Running active node script...`,
      `[${timestamp}] [SUCCESS] Nodes connected. Publishing JointState: [${theta1}°, ${theta2}°, ${theta3}°]`
    ]);
    toast({
      title: '🚀 تم تنفيذ الكود',
      description: 'تم إرسال أوامر المفاصل لطرفية الروبوت الافتراضية بنجاح.'
    });
  };

  const handleResetArm = () => {
    setIsAutomated(false);
    setIsPlayingTrajectory(false);
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
    setIsPlayingTrajectory(false);
    setTheta1(45);
    setTheta2(-30);
    setTheta3(60);
    setGripper(40);
    setRobotX(180);
    setRobotY(160);
    setRobotHeading(0);
    setLidarRange(130);
    setTargetGoal(null);
    toast({
      title: '🔄 تمت إعادة الضبط بالكامل',
      description: 'تمت استعادة الإعدادات الأولية لكافة المختبرات.'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950" dir="rtl">
      <SEO
        title="مختبرات الروبوتات والذكاء الاصطناعي والأتمتة | ذروة العلم 2.0"
        description="مختبرات افتراضية هندسية لمحاكاة حركيات الأذرع الروبوتية (Kinematics)، برمجة أنظمة ROS 2 و Python، وملاحة الروبوتات المستقلة بالـ LiDAR والذكاء الاصطناعي."
        keywords="روبوتات, ذكاء اصطناعي, Inverse Kinematics, ROS2, Python, LiDAR, الرؤية الحاسوبية, أتمتة صناعية, ذروة العلم"
      />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <Link to="/" className="hover:text-cyan-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-white font-bold">
            قسم الروبوتات والذكاء الاصطناعي 2.0
          </span>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 shadow-2xl shadow-cyan-950/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                <Cpu className="w-4 h-4 animate-spin-slow text-cyan-400" />
                <span>الجيل القادم من الهندسة التطبيقية 2.0</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug">
                قسم الروبوتات والذكاء الاصطناعي والأتمتة
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                بيئة تعليمية وهندسية متكاملة تدمج الحركيات المباشرة والعكسية (Kinematics)، أنظمة الملاحة الذاتية عبر مستشعرات LiDAR و SLAM، محاكيات الدوائر ومتحكمات ESP32/Arduino، وبرمجة روبوتات ROS 2، مصممة في عرض أفقي رحب ومفيد للطالب.
              </p>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="bg-slate-900/80 text-blue-300 border-blue-500/40 px-2.5 py-1 text-xs">
                  <Layers className="w-3.5 h-3.5 ml-1.5" /> 4 مسارات معتمدة
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-emerald-300 border-emerald-500/40 px-2.5 py-1 text-xs">
                  <Cpu className="w-3.5 h-3.5 ml-1.5" /> محاكي Wokwi والأوسيلوسكوب
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-cyan-300 border-cyan-500/40 px-2.5 py-1 text-xs">
                  <Radar className="w-3.5 h-3.5 ml-1.5" /> 360° LiDAR & A* Navigation
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-purple-300 border-purple-500/40 px-2.5 py-1 text-xs">
                  <BrainCircuit className="w-3.5 h-3.5 ml-1.5" /> رؤية YOLOv8
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-amber-300 border-amber-500/40 px-2.5 py-1 text-xs">
                  <Swords className="w-3.5 h-3.5 ml-1.5" /> حلبة منافسات المتاهة
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-indigo-300 border-indigo-500/40 px-2.5 py-1 text-xs">
                  <Printer className="w-3.5 h-3.5 ml-1.5" /> 5 مشاريع توأم رقمي
                </Badge>
              </div>
            </div>

            <div className="lg:col-span-5 h-52 sm:h-64 lg:h-full relative overflow-hidden">
              <img
                src={roboticsHeroBg}
                alt="قسم الروبوتات والذكاء الاصطناعي"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-slate-950/90" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN WORKSPACE: HORIZONTAL PANORAMIC OR VERTICAL SIDEBAR */}
        {/* ======================================================== */}
        {layoutMode === 'horizontal' ? (
          /* HORIZONTAL PANORAMIC VIEW ("العرض العرضي البانورامي") */
          <div className="w-full space-y-6">
            {/* 1. Horizontal Navigation Deck (Keeps the full list of 8 labs intact in a horizontal ribbon) */}
            <RoboticsSidebar
              activeTab={activeMainTab}
              onSelectTab={setActiveMainTab}
              onResetAll={handleResetAll}
              layoutMode="horizontal"
              onToggleLayoutMode={setLayoutMode}
            />

            {/* 2. Dedicated AI Explainer & Co-Pilot */}
            <AIRoboticsExplainer
              sectionKey={activeMainTab}
              onApplyPreset={handleApplyAIPreset}
            />

            {/* 3. Active Experiment Workspace (100% Full Width Widescreen) */}
            <div className="w-full space-y-6">
              {/* TAB 1: Pathways */}
              {activeMainTab === 'pathways' && (
                <RoboticsPathways onLaunchLab={(lab) => {
                  if (lab === 'wokwi') setActiveMainTab('wokwi');
                  else if (lab === 'kinematics') setActiveMainTab('arm');
                  else if (lab === 'vision') setActiveMainTab('vision');
                  else if (lab === 'arena') setActiveMainTab('arena');
                  else if (lab === 'digital-twin') setActiveMainTab('digital-twin');
                }} />
              )}

              {/* TAB 2: Hardware Circuit Sandbox & Oscilloscope */}
              {activeMainTab === 'wokwi' && (
                <HardwareCircuitSandbox />
              )}

              {/* TAB 3: Robotic Arm Kinematics & Pick-and-Place (Widescreen Landscape) */}
              {activeMainTab === 'arm' && (
                <div className="space-y-6">
                  {/* Top Action Ribbon for Arm */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                        <Bot className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-bold text-white block">مختبر الذراع الروبوتية ونقل القطع (Pick & Place)</span>
                        <span className="text-slate-400 text-[11px]">حساب الحركيات العكسية، مصفوفات التحويل D-H، وتفادي النقاط الانفرادية</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleRunPickAndPlaceSequence}
                        disabled={isPlayingTrajectory}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-1 shadow-md shadow-emerald-600/20"
                      >
                        <Play className="w-3.5 h-3.5 ml-1 fill-current" />
                        تحدي النقل الآلي للقطعة (Auto Pick & Place)
                      </Button>

                      <Button
                        size="sm"
                        variant={isAutomated ? "destructive" : "outline"}
                        onClick={() => setIsAutomated(!isAutomated)}
                        className="text-xs rounded-xl border-slate-700"
                      >
                        {isAutomated ? 'إيقاف التذبذب' : 'مسار تذبذبي'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetArm}
                        className="text-xs rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة تعيين
                      </Button>
                    </div>
                  </div>

                  {/* Dual Column Widescreen Setup */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (7 cols): High-Def Kinematics Canvas + Telemetry */}
                    <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                          <h3 className="font-bold text-sm sm:text-base text-white">
                            المحاكاة الحية للذراع الصناعية والتقاط المكعب
                          </h3>
                        </div>

                        {/* Singularity Alert Badge */}
                        {isSingularity ? (
                          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] animate-pulse">
                            ⚠️ نقطة انفرادية (Singularity Warning)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                            ✓ مجال حركة آمن وطبيعي
                          </Badge>
                        )}
                      </div>

                      {/* Canvas Container */}
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                        <canvas
                          ref={armCanvasRef}
                          width={720}
                          height={400}
                          className="w-full max-w-[720px] h-auto block"
                        />

                        {/* Coordinates HUD Overlay */}
                        <div className="absolute top-4 start-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs font-mono space-y-1 shadow-lg text-slate-200">
                          <div className="text-slate-400 text-[11px] font-bold">إحداثيات نقطة العمل (TCP):</div>
                          <div className="text-blue-400 font-bold">X: {endX} mm</div>
                          <div className="text-cyan-400 font-bold">Y: {endY} mm</div>
                          <div className="text-purple-400 font-bold">Z: {endZ} mm</div>
                          <div className="text-emerald-400 font-bold pt-1 border-t border-slate-700 text-[10px]">
                            القطع المنقولة: {deliveredCount}
                          </div>
                        </div>

                        {/* Singularity Notice Overlay */}
                        {isSingularity && (
                          <div className="absolute bottom-4 inset-x-4 bg-rose-950/80 backdrop-blur-md border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-200 text-center">
                            💡 <strong>تنبيه هندسي للطالب:</strong> مفصل الكتف θ₂ يقترب من الصفر مما يؤدي إلى امتداد كامل للذراع وفقدان مصفوفة الجاكوبي (Jacobian Determinant) لرتبتها الكاملة!
                          </div>
                        )}
                      </div>

                      {/* Angle Metrics Grid */}
                      <div className="grid grid-cols-4 gap-3 text-center text-xs">
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">مفصل القاعدة (θ₁)</span>
                          <span className="text-base font-black text-blue-400 font-mono">{theta1}°</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">مفصل الكتف (θ₂)</span>
                          <span className="text-base font-black text-cyan-400 font-mono">{theta2}°</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">مفصل الكوع (θ₃)</span>
                          <span className="text-base font-black text-purple-400 font-mono">{theta3}°</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">فتحة القابض</span>
                          <span className="text-base font-black text-amber-400 font-mono">{gripper}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (5 cols): Controls, D-H Matrix, Teach & Repeat */}
                    <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Sliders className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          التحكم المباشر والمصفوفات الحركية (D-H Matrix)
                        </h3>
                      </div>

                      {/* Sliders */}
                      <div className="space-y-3.5">
                        {/* Slider 1: Theta 1 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">مفصل القاعدة θ₁ (Base Angle)</span>
                            <span className="font-mono text-blue-400">{theta1}°</span>
                          </div>
                          <Slider
                            value={[theta1]}
                            min={0}
                            max={180}
                            step={1}
                            onValueChange={vals => setTheta1(vals[0])}
                          />
                        </div>

                        {/* Slider 2: Theta 2 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">مفصل الكتف θ₂ (Shoulder Angle)</span>
                            <span className="font-mono text-cyan-400">{theta2}°</span>
                          </div>
                          <Slider
                            value={[theta2]}
                            min={-90}
                            max={90}
                            step={1}
                            onValueChange={vals => setTheta2(vals[0])}
                          />
                        </div>

                        {/* Slider 3: Theta 3 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">مفصل الكوع θ₃ (Elbow Angle)</span>
                            <span className="font-mono text-purple-400">{theta3}°</span>
                          </div>
                          <Slider
                            value={[theta3]}
                            min={-90}
                            max={120}
                            step={1}
                            onValueChange={vals => setTheta3(vals[0])}
                          />
                        </div>

                        {/* Slider 4: Gripper */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">فتحة القابض (Gripper Claws)</span>
                            <span className="font-mono text-amber-400">{gripper}%</span>
                          </div>
                          <Slider
                            value={[gripper]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={vals => setGripper(vals[0])}
                          />
                        </div>
                      </div>

                      {/* Denavit-Hartenberg Live Matrix Display */}
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">مصفوفة التحويل المتجانسة T₀³:</span>
                          <span className="font-mono text-[10px] text-slate-400">Homogeneous D-H 4x4</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-slate-900 font-mono text-[10px] text-center">
                          <span className="text-cyan-400">{r11}</span>
                          <span className="text-cyan-400">{r12}</span>
                          <span className="text-slate-500">0.00</span>
                          <span className="text-emerald-400 font-bold">{endX}</span>

                          <span className="text-cyan-400">{r21}</span>
                          <span className="text-cyan-400">{r22}</span>
                          <span className="text-slate-500">0.00</span>
                          <span className="text-emerald-400 font-bold">{endY}</span>

                          <span className="text-slate-500">0.00</span>
                          <span className="text-slate-500">0.00</span>
                          <span className="text-cyan-400">1.00</span>
                          <span className="text-emerald-400 font-bold">{endZ}</span>

                          <span className="text-slate-500">0.00</span>
                          <span className="text-slate-500">0.00</span>
                          <span className="text-slate-500">0.00</span>
                          <span className="text-slate-300 font-bold">1.00</span>
                        </div>
                      </div>

                      {/* Waypoint Sequencer (Teach & Repeat) */}
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Workflow className="w-3.5 h-3.5 text-blue-400" />
                            برمجة المسار المتسلسل (Teach & Repeat):
                          </span>
                          <span className="text-[10px] text-slate-400">{waypoints.length} نقاط مسجلة</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveWaypoint}
                            className="text-xs h-7 rounded-lg border-slate-700 hover:bg-slate-800"
                          >
                            <Plus className="w-3 h-3 ml-1 text-cyan-400" />
                            حفظ الوضعية الحالية
                          </Button>
                          <Button
                            size="sm"
                            onClick={handlePlayWaypoints}
                            disabled={isPlayingTrajectory}
                            className="text-xs h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                          >
                            <Play className="w-3 h-3 ml-1 fill-current" />
                            تشغيل المسار المسجل
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setWaypoints([])}
                            className="text-[11px] h-7 px-2 text-slate-400 hover:text-rose-400"
                          >
                            مسح
                          </Button>
                        </div>

                        {waypoints.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {waypoints.map((wp, idx) => (
                              <Badge key={wp.id} variant="outline" className="text-[10px] border-slate-700 bg-slate-900 text-slate-300">
                                P{idx + 1}: ({wp.theta1}°, {wp.theta2}°, {wp.theta3}°)
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Autonomous Mobile Robot (LiDAR AMR & SLAM - Widescreen) */}
              {activeMainTab === 'amr' && (
                <div className="space-y-6">
                  {/* Top Action Ribbon for AMR */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Radar className="w-4 h-4 animate-spin-slow" />
                      </span>
                      <div>
                        <span className="font-bold text-white block">مختبر الملاحة بالليدار وتخطيط المسارات (A* SLAM)</span>
                        <span className="text-slate-400 text-[11px]">انقر في أي مكان على الخريطة لتحديد نقطة الهدف 🚩 وسيقوم الروبوت بتفادي العقبات</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddObstacle}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-xl font-bold gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة صندوق عائق
                      </Button>

                      <Button
                        size="sm"
                        variant={isAutopilot ? "destructive" : "default"}
                        onClick={() => setIsAutopilot(!isAutopilot)}
                        className="text-xs rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                      >
                        <Navigation className="w-3.5 h-3.5 ml-1" />
                        {isAutopilot ? 'إيقاف التجوال التلقائي' : 'تفعيل الاستكشاف الذاتي'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRobotX(180);
                          setRobotY(160);
                          setRobotHeading(0);
                          setTargetGoal(null);
                        }}
                        className="text-xs rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5 ml-1" /> إعادة تموضع
                      </Button>
                    </div>
                  </div>

                  {/* Dual Column Widescreen Setup */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (7 cols): High-Def LiDAR Radar Canvas */}
                    <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Radar className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                          <h3 className="font-bold text-sm sm:text-base text-white">
                            مسح البيئة ثنائي الأبعاد بالليدار (360° LiDAR Point Cloud)
                          </h3>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px]">
                          انقر على الخريطة لتحديد الهدف 🎯
                        </Badge>
                      </div>

                      {/* Canvas Container */}
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center cursor-crosshair">
                        <canvas
                          ref={lidarCanvasRef}
                          width={720}
                          height={400}
                          onClick={handleLidarCanvasClick}
                          className="w-full max-w-[720px] h-auto block"
                        />
                      </div>

                      {/* Manual Steering Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                        <span className="text-slate-400">التوجيه اليدوي للروبوت (Teleoperation):</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRobotHeading(h => h - 0.2)}
                            className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
                          >
                            دوران يسار ↺
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setRobotX(x => Math.min(540, Math.max(50, x + Math.cos(robotHeading) * 20)));
                              setRobotY(y => Math.min(320, Math.max(50, y + Math.sin(robotHeading) * 20)));
                            }}
                            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                          >
                            تقدم للأمام ↑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRobotX(x => Math.min(540, Math.max(50, x - Math.cos(robotHeading) * 20)));
                              setRobotY(y => Math.min(320, Math.max(50, y - Math.sin(robotHeading) * 20)));
                            }}
                            className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
                          >
                            تراجع للخلف ↓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRobotHeading(h => h + 0.2)}
                            className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
                          >
                            دوران يمين ↻
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (5 cols): Sensor Telemetry, SLAM Progress, Mission Tasks */}
                    <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Settings2 className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          لوحة قياسات المستشعرات وبناء الخريطة (Telemetry)
                        </h3>
                      </div>

                      {/* Slider: LiDAR Range */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">مدى شعاع الليزر (LiDAR Max Range)</span>
                          <span className="font-mono text-cyan-400">{lidarRange} cm</span>
                        </div>
                        <Slider
                          value={[lidarRange]}
                          min={60}
                          max={220}
                          step={5}
                          onValueChange={vals => setLidarRange(vals[0])}
                        />
                      </div>

                      {/* Sensor Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">موقع الروبوت (X, Y)</span>
                          <span className="font-mono font-bold text-white text-sm">
                            {Math.round(robotX)}, {Math.round(robotY)}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">زاوية التوجيه (Heading)</span>
                          <span className="font-mono font-bold text-cyan-400 text-sm">
                            {Math.round((robotHeading * 180) / Math.PI) % 360}°
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">السرعة الخطية (v)</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {linearVelocity} m/s
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">السرعة الزاوية (ω)</span>
                          <span className="font-mono font-bold text-purple-400 text-sm">
                            {angularVelocity} rad/s
                          </span>
                        </div>
                      </div>

                      {/* SLAM Exploration Progress */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">نسبة مساحة المستودع المستكشفة (Occupancy Grid):</span>
                          <span className="font-mono font-bold text-cyan-400">{Math.round(exploredPercent)}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${exploredPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Educational Note */}
                      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-slate-300 leading-relaxed">
                        💡 <strong>فائدة تعليمية:</strong> يعتمد نظام SLAM على خوارزمية ICP (Iterative Closest Point) لمطابقة قراءات شعاع الليزر المتتالية وبناء خريطة المستودع دون الحاجة لنظام GPS الداخلي.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AI Vision Playground */}
              {activeMainTab === 'vision' && (
                <AIVisionPlayground />
              )}

              {/* TAB 6: Code Arena & Maze */}
              {activeMainTab === 'arena' && (
                <CodeArenaMaze />
              )}

              {/* TAB 7: Digital Twin & 3D STL Capstones */}
              {activeMainTab === 'digital-twin' && (
                <DigitalTwinProjects />
              )}

              {/* TAB 8: ROS 2 & Python Code Studio */}
              {activeMainTab === 'code' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Code Editor Panel */}
                    <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-purple-400" />
                          <h3 className="font-bold text-sm sm:text-base text-white">
                            محرر برمجة الروبوتات الصناعية (ROS 2 & Python)
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyCode}
                            className="text-xs rounded-xl border-slate-700 hover:bg-slate-800"
                          >
                            <Copy className="w-3.5 h-3.5 ml-1" /> نسخ الكود
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleRunCode}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 ml-1 fill-current" /> تنفيذ الكود
                          </Button>
                        </div>
                      </div>

                      {/* Code Tabs */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveCodeTab('ros2')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeCodeTab === 'ros2'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          ROS 2 Node (Python)
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('python')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeCodeTab === 'python'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Kinematics Solver
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('vision')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeCodeTab === 'vision'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          YOLOv8 Vision AI
                        </button>
                      </div>

                      {/* Code Display */}
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

T01 = compute_dh_matrix(np.radians(${theta1}), 0, 120, 0)
T12 = compute_dh_matrix(np.radians(${theta2}), 0, 100,  0)
T23 = compute_dh_matrix(np.radians(${theta3}), 0, 55,  0)
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
    print(f"Detected Component {cls_id} with confidence: {confidence:.2%}")`}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Right: Live Terminal & ROS2 rqt_graph visualizer */}
                    <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Terminal className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          طرفية النظام التفاعلية (Live Terminal)
                        </h3>
                      </div>

                      <div className="h-64 rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto space-y-2 dir-ltr text-left">
                        {terminalOutput.map((line, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {line.includes('INFO') && <span className="text-cyan-400">{line}</span>}
                            {line.includes('SUCCESS') && <span className="text-emerald-400 font-bold">{line}</span>}
                            {line.includes('TOPIC') && <span className="text-purple-400">{line}</span>}
                            {!line.includes('INFO') && !line.includes('SUCCESS') && !line.includes('TOPIC') && (
                              <span className="text-slate-300">{line}</span>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-1 text-slate-500 pt-2">
                          <span className="text-emerald-400">$</span>
                          <span className="animate-pulse">_</span>
                        </div>
                      </div>

                      {/* ROS 2 Node Graph Visualization */}
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-bold text-white">مخطط شبكة ROS 2 (rqt_graph):</span>
                          <span className="font-mono text-[10px] text-cyan-400">3 Nodes • 2 Topics</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-around text-center text-[10px] font-mono">
                          <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300">
                            /camera_node
                          </div>
                          <span className="text-cyan-400">→ /image_raw →</span>
                          <div className="p-2 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300">
                            /arm_planner
                          </div>
                          <span className="text-emerald-400">→ /joint_states →</span>
                          <div className="p-2 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300">
                            /hardware_driver
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CLASSIC VERTICAL SIDEBAR LAYOUT (When user explicitly toggles) */
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <RoboticsSidebar
              activeTab={activeMainTab}
              onSelectTab={setActiveMainTab}
              onResetAll={handleResetAll}
              layoutMode="vertical"
              onToggleLayoutMode={setLayoutMode}
            />

            <div className="flex-1 w-full min-w-0 space-y-6">
              <AIRoboticsExplainer
                sectionKey={activeMainTab}
                onApplyPreset={handleApplyAIPreset}
              />

              {activeMainTab === 'pathways' && (
                <RoboticsPathways onLaunchLab={(lab) => {
                  if (lab === 'wokwi') setActiveMainTab('wokwi');
                  else if (lab === 'kinematics') setActiveMainTab('arm');
                  else if (lab === 'vision') setActiveMainTab('vision');
                  else if (lab === 'arena') setActiveMainTab('arena');
                  else if (lab === 'digital-twin') setActiveMainTab('digital-twin');
                }} />
              )}
              {activeMainTab === 'wokwi' && <HardwareCircuitSandbox />}
              {activeMainTab === 'arm' && (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
                  <h4 className="font-bold text-white text-base">مختبر الذراع الروبوتية</h4>
                  <p className="text-xs text-slate-400">بدل إلى العرض العرضي البانورامي من الشريط الجانبي للاستمتاع بالمحاكاة الكاملة وحاوية النقل.</p>
                  <Button onClick={() => setLayoutMode('horizontal')} className="bg-cyan-600 text-white text-xs rounded-xl">
                    تفعيل العرض العرضي البانورامي 🖥️
                  </Button>
                </div>
              )}
              {activeMainTab === 'amr' && (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
                  <h4 className="font-bold text-white text-base">مختبر الملاحة بالليدار</h4>
                  <p className="text-xs text-slate-400">بدل إلى العرض العرضي البانورامي للتحكم بكامل شاشة الرادار ومسارات A*.</p>
                  <Button onClick={() => setLayoutMode('horizontal')} className="bg-cyan-600 text-white text-xs rounded-xl">
                    تفعيل العرض العرضي البانورامي 🖥️
                  </Button>
                </div>
              )}
              {activeMainTab === 'vision' && <AIVisionPlayground />}
              {activeMainTab === 'arena' && <CodeArenaMaze />}
              {activeMainTab === 'digital-twin' && <DigitalTwinProjects />}
              {activeMainTab === 'code' && (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
                  <h4 className="font-bold text-white text-base">استوديو ROS 2 المتقدم</h4>
                  <Button onClick={() => setLayoutMode('horizontal')} className="bg-cyan-600 text-white text-xs rounded-xl">
                    تفعيل العرض العرضي البانورامي 🖥️
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RoboticsSection;
