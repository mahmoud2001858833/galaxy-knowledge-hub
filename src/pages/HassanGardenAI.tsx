import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Brain, Monitor, Cpu, Users, Heart, Dumbbell, BookOpen, Sparkles, Zap, Trophy, Star, Globe, ChevronLeft, ChevronRight, Maximize, Minimize, Database, BarChart3, MessageSquare, Award, Layers, Target, Settings, AlertTriangle, Lightbulb, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ───────── slide data ───────── */
interface Slide {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: React.ReactNode;
  contentEn: React.ReactNode;
  bg: string;           // tailwind gradient
  icon: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 'cover',
    titleAr: 'حديقة الحسن للعلوم',
    titleEn: 'Al-Hassan Science Garden',
    bg: 'from-violet-950 via-fuchsia-950 to-violet-950',
    icon: <Brain className="w-20 h-20" />,
    contentAr: (
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Brain className="w-20 h-20 text-white" />
        </div>
        <h1 className="text-[64px] font-black leading-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-white to-fuchsia-300">
          قسم الذكاء الاصطناعي التفاعلي
        </h1>
        <p className="text-[28px] text-white/60 font-light">حديقة الحسن للعلوم</p>
        <div className="mt-4 px-8 py-3 rounded-full bg-white/10 text-white/80 text-[22px]">
          تصوّر مشروع تعليمي تفاعلي
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Brain className="w-20 h-20 text-white" />
        </div>
        <h1 className="text-[64px] font-black leading-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-white to-fuchsia-300">
          Interactive AI Section
        </h1>
        <p className="text-[28px] text-white/60 font-light">Al-Hassan Science Garden</p>
        <div className="mt-4 px-8 py-3 rounded-full bg-white/10 text-white/80 text-[22px]">
          An Interactive Educational Project Concept
        </div>
      </div>
    ),
  },
  {
    id: 'idea',
    titleAr: 'الفكرة العامة',
    titleEn: 'General Idea',
    bg: 'from-blue-950 via-indigo-950 to-blue-950',
    icon: <Target className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col gap-8 h-full justify-center px-16">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[48px] font-bold text-white">الفكرة العامة</h2>
        </div>
        <p className="text-[28px] text-white/80 leading-relaxed">
          يهدف قسم الذكاء الاصطناعي إلى تقديم <span className="text-cyan-400 font-semibold">تجربة تعليمية تفاعلية</span>، تمكّن الطالب من فهم الذكاء الاصطناعي عملياً من خلال بناء نموذج خاص به خطوة بخطوة.
        </p>
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <p className="text-[26px] text-violet-300 font-semibold text-center">
            "التعلّم من خلال التجربة والتأثير المباشر"
          </p>
          <p className="text-[22px] text-white/50 text-center mt-3">
            حيث يرى الطالب أثر كل قرار يتخذه على تطور النموذج
          </p>
        </div>
        <div className="flex gap-4 justify-center mt-2">
          {['إدخال البيانات', 'التدريب', 'التفاعل', 'إنتاج وكيل AI'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[20px] font-bold">{i+1}</div>
              <span className="text-[20px] text-white/70">{s}</span>
              {i < 3 && <ChevronLeft className="w-5 h-5 text-white/30" />}
            </div>
          ))}
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col gap-8 h-full justify-center px-16">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[48px] font-bold text-white">General Idea</h2>
        </div>
        <p className="text-[28px] text-white/80 leading-relaxed">
          The AI section aims to deliver an <span className="text-cyan-400 font-semibold">interactive educational experience</span>, enabling students to understand AI practically by building their own model step by step.
        </p>
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <p className="text-[26px] text-violet-300 font-semibold text-center">
            "Learning Through Experimentation & Direct Impact"
          </p>
          <p className="text-[22px] text-white/50 text-center mt-3">
            The student sees the effect of every decision on the model's development
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'journey-1',
    titleAr: 'رحلة الطالب (١)',
    titleEn: 'Student Journey (1)',
    bg: 'from-emerald-950 via-teal-950 to-emerald-950',
    icon: <Sparkles className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col gap-6 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white mb-2">🚀 رحلة الطالب داخل القسم</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            { num: '1', title: 'شاشة البداية', desc: 'تعريف بسيط بالذكاء الاصطناعي مع عرض بصري لحاسوب بسيط بدون ذكاء', icon: <Monitor className="w-8 h-8" />, color: 'from-blue-500 to-cyan-500' },
            { num: '2', title: 'اختيار المجال وإدخال البيانات', desc: 'يختار الطالب مجالاً (تعليمي، صحي، شخصي، رياضي) ويدخل بيانات التدريب', icon: <Database className="w-8 h-8" />, color: 'from-green-500 to-emerald-500' },
            { num: '3', title: 'بناء البيئة التعليمية', desc: 'النظام يحلل البيانات وينشئ بيئة مخصصة مع عرض تقدم AI ونسبة الفهم', icon: <Layers className="w-8 h-8" />, color: 'from-purple-500 to-violet-500' },
            { num: '4', title: 'لحظة الإدراك ⚡', desc: 'AI يتحول من مخزن معلومات إلى نظام يفهم ويحلل - المرحلة المفصلية!', icon: <Zap className="w-8 h-8" />, color: 'from-amber-500 to-orange-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 flex gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <div className="text-[24px] font-bold text-white mb-1">{item.title}</div>
                <div className="text-[18px] text-white/60 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col gap-6 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white mb-2">🚀 Student Journey</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            { title: 'Introduction Screen', desc: 'Simple AI intro with visual of a basic computer without intelligence', icon: <Monitor className="w-8 h-8" />, color: 'from-blue-500 to-cyan-500' },
            { title: 'Domain & Data Input', desc: 'Student selects domain (Education, Health, Personal, Sports) and enters training data', icon: <Database className="w-8 h-8" />, color: 'from-green-500 to-emerald-500' },
            { title: 'Learning Environment', desc: 'System analyzes data and creates a personalized environment with progress tracking', icon: <Layers className="w-8 h-8" />, color: 'from-purple-500 to-violet-500' },
            { title: 'Awakening Moment ⚡', desc: 'AI transforms from data store to an understanding, analyzing system - the pivotal stage!', icon: <Zap className="w-8 h-8" />, color: 'from-amber-500 to-orange-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 flex gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <div className="text-[24px] font-bold text-white mb-1">{item.title}</div>
                <div className="text-[18px] text-white/60 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'awakening',
    titleAr: 'لحظة الإدراك',
    titleEn: 'Awakening Moment',
    bg: 'from-amber-950 via-orange-950 to-amber-950',
    icon: <Zap className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col items-center justify-center gap-8 h-full px-16">
        <h2 className="text-[48px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
          ⚡ لحظة الإدراك — Awakening Moment
        </h2>
        <p className="text-[26px] text-white/70 text-center max-w-[1400px]">المرحلة الأهم حيث يتحول الذكاء الاصطناعي من مجرد مخزن معلومات إلى نظام يفهم ويحلل</p>
        <div className="flex items-center gap-12 mt-4">
          <div className="text-center">
            <div className="w-40 h-40 rounded-3xl bg-gray-700/50 flex items-center justify-center mb-4 border-2 border-gray-600">
              <Monitor className="w-20 h-20 text-gray-400" />
            </div>
            <p className="text-[22px] text-white/40">قبل: جهاز عادي</p>
            <p className="text-[18px] text-white/30">يعرض بيانات فقط</p>
          </div>
          <div className="text-[60px]">→</div>
          <div className="text-center">
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/40 border-2 border-amber-400">
              <Brain className="w-20 h-20 text-white" />
            </div>
            <p className="text-[22px] text-amber-300 font-bold">بعد: مفكر ذكي!</p>
            <p className="text-[18px] text-white/50">يتوقع ويحلل ويجيب</p>
          </div>
        </div>
        <div className="flex gap-6 mt-6">
          {['التوقع 📈', 'الإجابة 💬', 'التحليل 🔍'].map((s, i) => (
            <div key={i} className="px-8 py-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[22px] text-amber-300">{s}</div>
          ))}
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col items-center justify-center gap-8 h-full px-16">
        <h2 className="text-[48px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
          ⚡ Awakening Moment
        </h2>
        <p className="text-[26px] text-white/70 text-center max-w-[1400px]">The most critical stage where AI transforms from a data store to a system that understands and analyzes</p>
        <div className="flex items-center gap-12 mt-4">
          <div className="text-center">
            <div className="w-40 h-40 rounded-3xl bg-gray-700/50 flex items-center justify-center mb-4 border-2 border-gray-600">
              <Monitor className="w-20 h-20 text-gray-400" />
            </div>
            <p className="text-[22px] text-white/40">Before: Basic Device</p>
            <p className="text-[18px] text-white/30">Displays data only</p>
          </div>
          <div className="text-[60px]">→</div>
          <div className="text-center">
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/40 border-2 border-amber-400">
              <Brain className="w-20 h-20 text-white" />
            </div>
            <p className="text-[22px] text-amber-300 font-bold">After: Smart Thinker!</p>
            <p className="text-[18px] text-white/50">Predicts, analyzes, responds</p>
          </div>
        </div>
        <div className="flex gap-6 mt-6">
          {['Prediction 📈', 'Response 💬', 'Analysis 🔍'].map((s, i) => (
            <div key={i} className="px-8 py-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[22px] text-amber-300">{s}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'journey-2',
    titleAr: 'رحلة الطالب (٢)',
    titleEn: 'Student Journey (2)',
    bg: 'from-cyan-950 via-blue-950 to-cyan-950',
    icon: <MessageSquare className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col gap-6 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white mb-2">🎯 المراحل المتقدمة</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { num: '5', title: 'التدريب التفاعلي', desc: 'أسئلة تحليلية تُولّد تلقائياً بناءً على بيانات الطالب. كل إجابة = إجراء يؤثر على دقة النموذج وسلوكه.', icon: <MessageSquare className="w-8 h-8" />, color: 'from-cyan-500 to-blue-500' },
            { num: '6', title: 'إنتاج الوكيل الذكي', desc: 'AI خاص باسم الطالب مع QR Code ورابط مباشر و ID خاص. يمكنه التفاعل بالسؤال والجواب.', icon: <Cpu className="w-8 h-8" />, color: 'from-violet-500 to-fuchsia-500' },
            { num: '7', title: 'التنافس والتحفيز', desc: 'لوحة متصدرين، نظام نقاط وترتيب وجوائز. إمكانية العودة لتطوير النموذج ومقارنته.', icon: <Trophy className="w-8 h-8" />, color: 'from-amber-500 to-yellow-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-8 border border-white/10 flex flex-col gap-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="text-[26px] font-bold text-white">{item.title}</div>
              <div className="text-[19px] text-white/60 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-2">
          <p className="text-[22px] text-cyan-300 text-center font-semibold">
            🤖 المرشد الذكي (AI Guide) يرافق الطالب في كل خطوة — يشرح ويطرح أسئلة ويعطي أدوات تطوير
          </p>
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col gap-6 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white mb-2">🎯 Advanced Stages</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { title: 'Interactive Training', desc: 'Auto-generated analytical questions based on student data. Each answer is an action affecting model accuracy.', icon: <MessageSquare className="w-8 h-8" />, color: 'from-cyan-500 to-blue-500' },
            { title: 'AI Agent Production', desc: 'Personalized AI with student\'s name, QR Code, direct link & unique ID. Capable of Q&A interaction.', icon: <Cpu className="w-8 h-8" />, color: 'from-violet-500 to-fuchsia-500' },
            { title: 'Competition & Rewards', desc: 'Leaderboard, points system, rankings & awards. Return to improve and compare models.', icon: <Trophy className="w-8 h-8" />, color: 'from-amber-500 to-yellow-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-8 border border-white/10 flex flex-col gap-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="text-[26px] font-bold text-white">{item.title}</div>
              <div className="text-[19px] text-white/60 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-2">
          <p className="text-[22px] text-cyan-300 text-center font-semibold">
            🤖 AI Guide accompanies the student at every step — explains, asks questions & provides development tools
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'screens',
    titleAr: 'الشاشات المطلوبة',
    titleEn: 'Required Screens',
    bg: 'from-purple-950 via-violet-950 to-purple-950',
    icon: <Layers className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col gap-8 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white">📱 الشاشات المطلوبة</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: 1, name: 'شاشة البداية', color: 'bg-blue-500/20 border-blue-400/30' },
            { num: 2, name: 'اختيار المجال', color: 'bg-green-500/20 border-green-400/30' },
            { num: 3, name: 'إدخال البيانات', color: 'bg-cyan-500/20 border-cyan-400/30' },
            { num: 4, name: 'البيئة التعليمية', color: 'bg-purple-500/20 border-purple-400/30' },
            { num: 5, name: 'لحظة الإدراك', color: 'bg-amber-500/20 border-amber-400/30' },
            { num: 6, name: 'التدريب التفاعلي', color: 'bg-orange-500/20 border-orange-400/30' },
            { num: 7, name: 'شاشة النتائج', color: 'bg-pink-500/20 border-pink-400/30' },
            { num: 8, name: 'الوكيل الذكي (AI Agent)', color: 'bg-violet-500/20 border-violet-400/30' },
            { num: 9, name: 'الترتيب والمقارنة', color: 'bg-yellow-500/20 border-yellow-400/30' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-5 border flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[20px] font-bold text-white/80 flex-shrink-0">{s.num}</div>
              <span className="text-[22px] text-white/80">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col gap-8 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white">📱 Required Screens</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: 1, name: 'Introduction', color: 'bg-blue-500/20 border-blue-400/30' },
            { num: 2, name: 'Domain Selection', color: 'bg-green-500/20 border-green-400/30' },
            { num: 3, name: 'Data Input', color: 'bg-cyan-500/20 border-cyan-400/30' },
            { num: 4, name: 'Learning Environment', color: 'bg-purple-500/20 border-purple-400/30' },
            { num: 5, name: 'Awakening Moment', color: 'bg-amber-500/20 border-amber-400/30' },
            { num: 6, name: 'Interactive Training', color: 'bg-orange-500/20 border-orange-400/30' },
            { num: 7, name: 'Results Screen', color: 'bg-pink-500/20 border-pink-400/30' },
            { num: 8, name: 'AI Agent', color: 'bg-violet-500/20 border-violet-400/30' },
            { num: 9, name: 'Leaderboard', color: 'bg-yellow-500/20 border-yellow-400/30' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-5 border flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[20px] font-bold text-white/80 flex-shrink-0">{s.num}</div>
              <span className="text-[22px] text-white/80">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'tech',
    titleAr: 'المتطلبات التقنية',
    titleEn: 'Technical Requirements',
    bg: 'from-slate-950 via-gray-950 to-slate-950',
    icon: <Settings className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col gap-8 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white">⚙️ المتطلبات التقنية</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-[28px] font-bold text-blue-400 mb-6 flex items-center gap-3"><Cpu className="w-8 h-8" /> Hardware (الأجهزة)</h3>
            <ul className="space-y-3">
              {['خادم مركزي (Server)', 'GPU (كرت شاشة للتسريع)', 'أجهزة عرض (شاشات تفاعلية)', 'أجهزة طلاب (Tablets أو PCs)', 'شبكة إنترنت داخلية قوية'].map((item, i) => (
                <li key={i} className="text-[21px] text-white/70 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-[28px] font-bold text-green-400 mb-6 flex items-center gap-3"><Layers className="w-8 h-8" /> Software (البرمجيات)</h3>
            <ul className="space-y-3">
              {['منصة ويب تفاعلية', 'قاعدة بيانات (لتخزين بيانات الطلاب)', 'نماذج AI جاهزة (Pre-trained Models)', 'نظام توليد أسئلة', 'نظام تتبع التقدم'].map((item, i) => (
                <li key={i} className="text-[21px] text-white/70 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col gap-8 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white">⚙️ Technical Requirements</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-[28px] font-bold text-blue-400 mb-6 flex items-center gap-3"><Cpu className="w-8 h-8" /> Hardware</h3>
            <ul className="space-y-3">
              {['Central Server', 'GPU (for acceleration)', 'Interactive displays', 'Student devices (Tablets/PCs)', 'Strong internal network'].map((item, i) => (
                <li key={i} className="text-[21px] text-white/70 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-[28px] font-bold text-green-400 mb-6 flex items-center gap-3"><Layers className="w-8 h-8" /> Software</h3>
            <ul className="space-y-3">
              {['Interactive web platform', 'Database (student data storage)', 'Pre-trained AI models', 'Question generation system', 'Progress tracking system'].map((item, i) => (
                <li key={i} className="text-[21px] text-white/70 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'note',
    titleAr: 'ملاحظة مهمة',
    titleEn: 'Important Note',
    bg: 'from-red-950 via-rose-950 to-red-950',
    icon: <AlertTriangle className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col items-center justify-center gap-8 h-full px-20">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-14 h-14 text-white" />
        </div>
        <h2 className="text-[48px] font-bold text-white">⚠️ ملاحظة مهمة</h2>
        <div className="bg-white/5 rounded-2xl p-10 border border-red-400/20 max-w-[1200px]">
          <p className="text-[26px] text-white/80 leading-relaxed text-center">
            هذا النظام يعتمد على <span className="text-red-300 font-bold">نماذج ذكاء اصطناعي مدرّبة مسبقاً (Pre-trained Models)</span>
          </p>
          <p className="text-[24px] text-white/60 leading-relaxed text-center mt-6">
            وذلك لأن تدريب نماذج AI من الصفر يتطلب:
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="px-8 py-4 rounded-xl bg-red-500/10 border border-red-400/30 text-[22px] text-red-300">💰 تكلفة عالية جداً</div>
            <div className="px-8 py-4 rounded-xl bg-red-500/10 border border-red-400/30 text-[22px] text-red-300">🖥️ موارد حوسبة ضخمة</div>
          </div>
          <p className="text-[26px] text-amber-300 font-semibold text-center mt-8">
            ✨ الهدف هنا تعليمي تفاعلي، وليس تدريب نموذج حقيقي من الصفر
          </p>
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col items-center justify-center gap-8 h-full px-20">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-14 h-14 text-white" />
        </div>
        <h2 className="text-[48px] font-bold text-white">⚠️ Important Note</h2>
        <div className="bg-white/5 rounded-2xl p-10 border border-red-400/20 max-w-[1200px]">
          <p className="text-[26px] text-white/80 leading-relaxed text-center">
            This system relies on <span className="text-red-300 font-bold">Pre-trained AI Models</span>
          </p>
          <p className="text-[24px] text-white/60 leading-relaxed text-center mt-6">
            Because training AI models from scratch requires:
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="px-8 py-4 rounded-xl bg-red-500/10 border border-red-400/30 text-[22px] text-red-300">💰 Very high cost</div>
            <div className="px-8 py-4 rounded-xl bg-red-500/10 border border-red-400/30 text-[22px] text-red-300">🖥️ Massive computing resources</div>
          </div>
          <p className="text-[26px] text-amber-300 font-semibold text-center mt-8">
            ✨ The goal is interactive education, not real model training from scratch
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'ideas',
    titleAr: 'أفكار للتطوير',
    titleEn: 'Development Ideas',
    bg: 'from-fuchsia-950 via-pink-950 to-fuchsia-950',
    icon: <Lightbulb className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col gap-6 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white">💡 أفكار مقترحة للتطوير المستقبلي</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🏅', title: 'نظام شارات', desc: 'مكافآت "مبتكر AI" و "خبير بيانات" عند إنجاز مراحل' },
            { icon: '⚔️', title: 'تحدي بين الطلاب', desc: 'مسابقة أسبوعية لمقارنة دقة النماذج مع جوائز' },
            { icon: '🎨', title: 'معرض النماذج', desc: 'صفحة عامة لعرض نماذج الطلاب مع تقييم الزملاء' },
            { icon: '📄', title: 'تصدير PDF', desc: 'تقرير احترافي يوثق رحلة الطالب ونتائج نموذجه' },
            { icon: '📚', title: 'ربط بالمواد الدراسية', desc: 'صحي → أحياء، رياضي → رياضيات، تعليمي → فيزياء' },
            { icon: '🧬', title: 'محاكاة الشبكة العصبية', desc: 'عرض بصري تفاعلي لكيفية عمل الشبكات أثناء التدريب' },
            { icon: '👨‍🏫', title: 'وضع المعلم', desc: 'لوحة تحكم للمعلم لمتابعة تقدم الطلاب ونماذجهم' },
            { icon: '🌐', title: 'مشاركة عالمية', desc: 'نشر الوكيل الذكي ومشاركته مع العالم عبر رابط' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-start gap-4">
              <span className="text-[32px] flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-[22px] font-bold text-white">{item.title}</div>
                <div className="text-[18px] text-white/55 mt-1">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col gap-6 h-full justify-center px-16">
        <h2 className="text-[44px] font-bold text-white">💡 Future Development Ideas</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🏅', title: 'Badge System', desc: '"AI Innovator" & "Data Expert" rewards upon completion' },
            { icon: '⚔️', title: 'Student Challenges', desc: 'Weekly competitions comparing model accuracy with prizes' },
            { icon: '🎨', title: 'Model Gallery', desc: 'Public page showcasing student models with peer reviews' },
            { icon: '📄', title: 'PDF Export', desc: 'Professional report documenting the student\'s AI journey' },
            { icon: '📚', title: 'Subject Linking', desc: 'Health → Biology, Sports → Math, Education → Physics' },
            { icon: '🧬', title: 'Neural Network Sim', desc: 'Interactive visual showing how networks work during training' },
            { icon: '👨‍🏫', title: 'Teacher Mode', desc: 'Dashboard for teachers to track student progress & models' },
            { icon: '🌐', title: 'Global Sharing', desc: 'Publish and share your AI agent worldwide via link' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-start gap-4">
              <span className="text-[32px] flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-[22px] font-bold text-white">{item.title}</div>
                <div className="text-[18px] text-white/55 mt-1">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'end',
    titleAr: 'شكراً لكم',
    titleEn: 'Thank You',
    bg: 'from-violet-950 via-fuchsia-950 to-violet-950',
    icon: <Star className="w-16 h-16" />,
    contentAr: (
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Star className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-[56px] font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-white to-fuchsia-300">
          شكراً لكم
        </h2>
        <p className="text-[28px] text-white/60">حديقة الحسن للعلوم — قسم الذكاء الاصطناعي التفاعلي</p>
        <div className="flex gap-4 mt-4">
          <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[20px] text-white/50">🤖 نحو مستقبل تعليمي ذكي</div>
        </div>
      </div>
    ),
    contentEn: (
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Star className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-[56px] font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-white to-fuchsia-300">
          Thank You
        </h2>
        <p className="text-[28px] text-white/60">Al-Hassan Science Garden — Interactive AI Section</p>
        <div className="flex gap-4 mt-4">
          <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[20px] text-white/50">🤖 Towards a Smart Educational Future</div>
        </div>
      </div>
    ),
  },
];

/* ───────── Presentation Component ───────── */
const HassanGardenAI = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const total = slides.length;

  const goTo = useCallback((i: number) => {
    if (i >= 0 && i < total) setCurrentSlide(i);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goTo(currentSlide + 1); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); goTo(currentSlide - 1); }
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentSlide, goTo, isFullscreen]);

  // Scale calculation
  useEffect(() => {
    const calc = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const sx = rect.width / 1920;
      const sy = rect.height / 1080;
      setScale(Math.min(sx, sy));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [isFullscreen]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div ref={containerRef} className={`min-h-screen bg-gray-950 text-white flex flex-col ${isFullscreen ? '' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top bar - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="bg-gray-950/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between z-50">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white/60 hover:text-white">
            {lang === 'ar' ? <><ArrowRight className="w-4 h-4 ml-1" /> الرئيسية</> : <>Home <ArrowLeft className="w-4 h-4 ml-1" /></>}
          </Button>
          <h1 className="text-sm font-bold text-white/80">
            {lang === 'ar' ? '🤖 حديقة الحسن — تصوّر قسم الذكاء الاصطناعي' : '🤖 Al-Hassan Garden — AI Section Concept'}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} className="text-white/60 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1" />{lang === 'ar' ? 'EN' : 'عربي'}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white/60">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Thumbnail sidebar - hidden on mobile and fullscreen */}
        {!isFullscreen && (
          <div className="hidden md:flex flex-col w-44 bg-gray-900/50 border-l border-white/5 overflow-y-auto py-3 px-2 gap-2">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video flex-shrink-0 ${i === currentSlide ? 'border-violet-400 shadow-lg shadow-violet-500/20' : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${s.bg}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-white/80 font-bold text-center px-1 leading-tight">{lang === 'ar' ? s.titleAr : s.titleEn}</span>
                </div>
                <div className="absolute bottom-0.5 left-0.5 text-[8px] text-white/40 bg-black/40 rounded px-1">{i + 1}</div>
              </button>
            ))}
          </div>
        )}

        {/* Slide canvas */}
        <div ref={wrapperRef} className="flex-1 relative overflow-hidden bg-black" onClick={(e) => {
          if (!wrapperRef.current) return;
          const rect = wrapperRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width / 2) goTo(currentSlide + 1);
          else goTo(currentSlide - 1);
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + lang}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute"
              style={{
                width: 1920,
                height: 1080,
                left: '50%',
                top: '50%',
                marginLeft: -960,
                marginTop: -540,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <div className={`w-full h-full bg-gradient-to-br ${slide.bg} p-0`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {lang === 'ar' ? slide.contentAr : slide.contentEn}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur rounded-full px-4 py-2 z-10">
            <button onClick={(e) => { e.stopPropagation(); goTo(currentSlide - 1); }} disabled={currentSlide === 0}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all">
              {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="text-sm text-white/60 font-mono min-w-[60px] text-center">{currentSlide + 1} / {total}</span>
            <button onClick={(e) => { e.stopPropagation(); goTo(currentSlide + 1); }} disabled={currentSlide === total - 1}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all">
              {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {isFullscreen && (
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center ml-2">
                <Minimize className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Slide dots */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={`rounded-full transition-all ${i === currentSlide ? 'w-6 h-2 bg-violet-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HassanGardenAI;
