'use client';

import {
  Flame,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  CheckCircle2,
  Lock,
  Calculator,
  BookOpen,
  Layers,
  Timer,
  ArrowUpRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Lookup tables instead of dynamically-built class strings (e.g. `bg-${accent}-50`)
// so every Tailwind class this file uses is a complete, static, literal string.
const accentStyles = {
  indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-600' },
  amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-600' },
  violet: { bg: 'bg-violet-50', iconBg: 'bg-violet-600' },
  rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-600' },
};

const statusStyles = {
  completed: { icon: CheckCircle2, ring: 'bg-emerald-500', text: 'text-emerald-600' },
  active: { icon: Sparkles, ring: 'bg-indigo-600', text: 'text-indigo-600' },
  upcoming: { icon: Clock, ring: 'bg-slate-300', text: 'text-slate-500' },
  locked: { icon: Lock, ring: 'bg-slate-200', text: 'text-slate-400' },
};

const stats = [
  { id: 'xp', label: 'Total XP', value: '2,840', sub: '360 to Level 13', icon: Zap, accent: 'indigo', progress: 78 },
  { id: 'streak', label: 'Day Streak', value: '14', sub: 'Personal best: 21', icon: Flame, accent: 'amber' },
  { id: 'score', label: 'Est. SAT Score', value: '1340', sub: '+220 since Feb', icon: TrendingUp, accent: 'emerald' },
  { id: 'goal', label: 'Weekly Goal', value: '4 / 6', sub: 'sessions this week', icon: Target, accent: 'violet', progress: 67 },
];

const studyPlan = [
  { id: 1, title: 'Reading Foundations', status: 'completed', meta: '92% accuracy' },
  { id: 2, title: 'Algebra Core Concepts', status: 'active', meta: '60% complete' },
  { id: 3, title: 'Grammar & Syntax Mastery', status: 'upcoming', meta: 'Starts after Algebra' },
  { id: 4, title: 'Essay Writing Techniques', status: 'locked', meta: 'Locked' },
];

const homework = [
  { id: 1, title: 'Practice Set: Linear Equations', cls: 'SAT Math · Mr. Aliyev', due: 'Due today', urgent: true },
  { id: 2, title: 'IELTS Speaking Part 2 Recording', cls: 'IELTS Prep · Ms. Yusupova', due: 'Due tomorrow', urgent: false },
  { id: 3, title: 'Vocabulary Quiz: Unit 7', cls: 'AP English · Mr. Carter', due: 'Due Friday', urgent: false },
];

const quickStart = [
  { id: 1, label: 'Math Practice', meta: '15 Qs · 20 min', icon: Calculator, accent: 'indigo' },
  { id: 2, label: 'Reading & Writing', meta: '12 Qs · 18 min', icon: BookOpen, accent: 'violet' },
  { id: 3, label: 'Vocabulary Drill', meta: '20 words · 10 min', icon: Layers, accent: 'amber' },
  { id: 4, label: 'Full Mock Test', meta: 'Timed · 2 hr', icon: Timer, accent: 'rose' },
];

const scoreTrend = [
  { name: 'Feb', score: 1120 },
  { name: 'Mar', score: 1180 },
  { name: 'Apr', score: 1230 },
  { name: 'May', score: 1280 },
  { name: 'Jun', score: 1340 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Good afternoon, Aisha 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here's where your prep stands today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-xl w-fit">
          <Sparkles size={15} />
          AI plan updated 2h ago
        </div>
      </div>

      {/* Gamified stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          const a = accentStyles[s.accent];
          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className={`h-9 w-9 rounded-xl ${a.iconBg} flex items-center justify-center mb-3`}>
                <Icon size={17} className="text-white" />
              </div>
              <p className="text-xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              {typeof s.progress === 'number' && (
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2.5">
                  <div
                    className={`h-full ${a.iconBg} rounded-full`}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Study Plan roadmap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                Your AI Study Plan
              </h2>
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                View full plan <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {studyPlan.map((step, idx) => {
                const st = statusStyles[step.status];
                const StepIcon = st.icon;
                const isLast = idx === studyPlan.length - 1;
                return (
                  <div key={step.id} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full ${st.ring} flex items-center justify-center shrink-0`}>
                        <StepIcon size={15} className="text-white" />
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                    </div>
                    <div className={`flex-1 ${isLast ? '' : 'pb-5'}`}>
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            step.status === 'locked' ? 'text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {step.title}
                        </p>
                        {step.status === 'active' && (
                          <button className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition">
                            Resume
                          </button>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${st.text}`}>{step.meta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick start */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Start Practice</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickStart.map((q) => {
                const Icon = q.icon;
                const a = accentStyles[q.accent];
                return (
                  <button
                    key={q.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 ${a.bg} hover:border-slate-300 hover:-translate-y-0.5 transition-all text-left`}
                  >
                    <div className={`h-9 w-9 rounded-lg ${a.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{q.label}</p>
                      <p className="text-xs text-slate-500">{q.meta}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Upcoming homework */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Upcoming Homework</h2>
            <div className="space-y-3">
              {homework.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 leading-snug">{h.title}</p>
                    {h.urgent && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{h.cls}</p>
                  <p className={`text-xs font-medium mt-1.5 ${h.urgent ? 'text-rose-600' : 'text-slate-400'}`}>
                    {h.due}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Score trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-900">Score Trend</h2>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                <ArrowUpRight size={13} /> +220
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Last 5 practice tests</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3, fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
