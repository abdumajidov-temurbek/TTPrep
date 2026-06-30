'use client';

/*
 * ToptierPrep.jsx — comprehensive single-file demo of the Toptierprep DSAT
 * platform, built to the uploaded UI spec. Every major page is wired into one
 * navigable app so the whole product can be clicked through for a pitch:
 *   Dashboard · Practice · Question Bank · Contests · Leaderboards · Vocabulary
 *   · Admin, plus fullscreen Test/Session, Results, and Contest Results views.
 *
 * AI is woven throughout per the spec: a global floating AI Tutor (answers
 * student questions on every screen), an "Explain with AI" + "Why did I choose
 * this?" reasoning tool inside the Results deep-dive, and a slide-out AI chat
 * with a dual-view explanation toggle inside the Question Bank session.
 *
 * This is a DEMO COMPOSITION. For the real Next.js app, split each section into
 * its own file and wire with the App Router instead of local view-state.
 * All data is mock; AI replies are canned. No backend logic.
 */

import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  Database,
  Swords,
  Trophy,
  BookOpen,
  UserCog,
  Flame,
  Settings,
  Menu,
  X,
  Target,
  Pencil,
  Play,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  MessageSquare,
  Share2,
  Medal,
  Crown,
  Brain,
  Lightbulb,
  Search,
  Award,
  Gift,
  Globe,
  MapPin,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Activity,
  Megaphone,
  Inbox,
  Star,
  CheckCircle,
  TrendingUp,
  Zap,
  Users,
  Check,
  Plus,
  Clock,
  Calculator,
  Layers,
  RotateCw,
  RotateCcw,
  Sparkles,
  Send,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
  ListChecks,
  Timer,
  GraduationCap,
  Flag,
  Hourglass,
  SlidersHorizontal,
  PenLine,
  LayoutGrid,
  Wind,
  Anchor,
  Wrench,
  BookMarked,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts';

/* ============================== Shared tokens ============================== */
const accent = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', solid: 'bg-indigo-600', ring: 'stroke-indigo-600', soft: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', solid: 'bg-emerald-600', ring: 'stroke-emerald-500', soft: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', solid: 'bg-amber-500', ring: 'stroke-amber-500', soft: 'text-amber-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', solid: 'bg-violet-600', ring: 'stroke-violet-500', soft: 'text-violet-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', solid: 'bg-rose-600', ring: 'stroke-rose-500', soft: 'text-rose-600' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', solid: 'bg-sky-600', ring: 'stroke-sky-500', soft: 'text-sky-600' },
};

const diffBadge = {
  Easy: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  Hard: 'bg-rose-50 text-rose-700',
};

const sourceBadge = {
  'College Board': 'bg-sky-50 text-sky-700 border-sky-200',
  Toptierprep: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

/* A reusable SVG circular score ring. */
function ScoreRing({ value, max, label, sublabel, colorKey = 'indigo', size = 132 }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = c * (1 - pct);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            className={accent[colorKey].ring}
            strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
        </div>
      </div>
      {label && <span className="text-sm font-medium text-slate-600 mt-2">{label}</span>}
    </div>
  );
}

/* ============================ Global AI Tutor ============================ */
const aiSeed = [
  { id: 1, role: 'assistant', text: "Hi! I'm your Toptierprep AI Tutor. I can explain any question, break down a tricky concept, or help you plan what to study next. What are you working on?" },
];

const aiCanned = [
  "Let's work through it step by step:\n\n1. Pin down exactly what the question is asking for.\n2. Rule out choices that contradict the passage or the math.\n3. Test the remaining options against the most specific detail.\n\nWant me to apply this to a specific question?",
  "Good question. Here's how I'd approach it:\n\n1. Identify the structure — is it asking for a value, an inference, or a relationship?\n2. Translate the key sentence into your own words.\n3. Match that against each option and eliminate aggressively.\n\nTell me the question number and I'll go deeper.",
  "Here's the intuition:\n\n• The trap answer usually looks right but overstates or flips one detail.\n• The correct answer is fully supported with nothing extra.\n\nWant a worked example from your last practice set?",
];

const aiSuggestions = ['Explain this step by step', 'What should I study next?', 'Give me a hint'];

function AITutor({ contextLabel = null, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState(aiSeed);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { id: Date.now(), role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = aiCanned[Math.floor(Math.random() * aiCanned.length)];
      setMessages((p) => [...p, { id: Date.now() + 1, role: 'assistant', text: reply }]);
      setTyping(false);
    }, 1100);
  };

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <span className="hidden sm:inline-block bg-white text-slate-700 text-sm font-medium px-3.5 py-2 rounded-full shadow-md border border-slate-200">
          Ask your AI Tutor
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI tutor"
          className="relative h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center transition hover:scale-105 shrink-0"
        >
          <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-60" />
          <Brain size={22} className="relative text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-40 bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden font-sans">
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Tutor</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
            </p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-slate-400 hover:text-white transition">
          <X size={18} />
        </button>
      </div>

      {contextLabel && (
        <div className="px-5 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 w-fit px-2.5 py-1 rounded-full">
            <FileText size={11} /> {contextLabel}
          </div>
        </div>
      )}

      <div className="h-80 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mr-2">
                <Brain size={12} className="text-white" />
              </div>
            )}
            <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mr-2">
              <Brain size={12} className="text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-5 pb-2 flex gap-2 overflow-x-auto">
        {aiSuggestions.map((p) => (
          <button key={p} onClick={() => send(p)} className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition whitespace-nowrap">
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask about any question..."
          className="flex-1 text-sm px-3.5 py-2.5 rounded-full bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white outline-none transition"
        />
        <button onClick={() => send(input)} aria-label="Send" className="h-9 w-9 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition">
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}

/* ================================= Sidebar ================================= */
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'practice', label: 'Practice', icon: FileText },
  { id: 'qbank', label: 'Question Bank', icon: Database },
  { id: 'contests', label: 'Contests', icon: Swords },
  { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
  { id: 'vocab', label: 'Vocabulary', icon: BookOpen },
];

function Sidebar({ activeView, setActiveView, isAdmin, setIsAdmin }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (id) => { setActiveView(id); setMobileOpen(false); };

  const body = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Toptierprep</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button key={item.id} onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-800">
          <p className="px-3.5 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Staff</p>
          <button onClick={() => go('admin')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeView === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}>
            <UserCog size={18} strokeWidth={2} />
            Admin Panel
          </button>
        </div>
      </nav>

      <div className="px-3 pb-5">
        <div className="flex items-center gap-2 px-3.5 py-2 mb-2 rounded-xl bg-slate-800">
          <Flame size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">7-day streak</span>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-indigo-300"><Zap size={12} /> 4,820</span>
        </div>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">AK</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Aisha Karimova</p>
            <p className="text-xs text-slate-400">Student · Tashkent</p>
          </div>
          <Settings size={16} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center"><GraduationCap size={16} className="text-white" /></div>
          <span className="text-white font-semibold">Toptierprep</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-white"><Menu size={22} /></button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full relative">
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><X size={20} /></button>
            {body}
          </div>
          <div onClick={() => setMobileOpen(false)} className="flex-1 bg-black bg-opacity-50" />
        </div>
      )}

      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0">{body}</aside>
    </>
  );
}

/* ================================ Dashboard ================================ */
const todayTasks = {
  ai: [
    { id: 1, type: 'Practice Test', tag: 'indigo', title: 'Adaptive RW Module 2', deadline: 'Today, 9:00 PM' },
    { id: 2, type: 'Question Bank', tag: 'violet', title: '15 Algebra drills (Medium)', deadline: 'Tomorrow' },
  ],
  teacher: [
    { id: 3, type: 'Practice Test', tag: 'indigo', title: 'Full-Length Test #4', deadline: 'Fri, Jul 4', from: 'Mr. Aliyev' },
    { id: 4, type: 'Vocabulary', tag: 'emerald', title: 'DSAT Words: Unit 7 quiz', deadline: 'Sat, Jul 5', from: 'Ms. Yusupova' },
  ],
};

const qotd = [
  { id: 'eng', subject: 'English', icon: BookOpen, color: 'violet', skill: 'Craft & Structure', q: 'Which choice completes the text with the most logical transition?' },
  { id: 'math', subject: 'Math', icon: Calculator, color: 'sky', skill: 'Linear Equations', q: 'If 3x − 7 = 2x + 5, what is the value of x?' },
];

const dashTrend = [
  { name: 'Test 1', score: 1180 }, { name: 'Test 2', score: 1230 }, { name: 'Test 3', score: 1210 },
  { name: 'Test 4', score: 1290 }, { name: 'Test 5', score: 1320 }, { name: 'Test 6', score: 1360 },
];

function TaskCard({ t }) {
  const a = accent[t.tag];
  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.bg} ${a.text}`}>{t.type}</span>
        <ChevronRight size={15} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-900 leading-snug">{t.title}</p>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
        <Clock size={12} /> {t.deadline}{t.from ? ` · ${t.from}` : ''}
      </div>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [targetScore, setTargetScore] = useState(1500);
  const [editTarget, setEditTarget] = useState(false);
  const [examDays, setExamDays] = useState(38);
  const [editExam, setEditExam] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [showSticky, setShowSticky] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      {/* Sticky unfinished-exam notification */}
      {showSticky && (
        <div className="flex items-center gap-3 bg-rose-600 text-white rounded-2xl px-4 py-3 mb-5 shadow-sm">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium flex-1">You have an unfinished exam (Karimova) — Full-Length Test #3, 42% complete.</p>
          <button onClick={() => onNavigate('session')} className="text-xs font-semibold bg-white text-rose-600 px-3.5 py-1.5 rounded-lg hover:bg-rose-50 transition shrink-0">
            Complete Now
          </button>
          <button onClick={() => setShowSticky(false)} aria-label="Dismiss" className="text-rose-200 hover:text-white shrink-0"><X size={16} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Good afternoon, Aisha 👋</h1>
          <p className="text-sm text-slate-500 mt-1">You're on a 7-day streak. Let's keep it going.</p>
        </div>
        <button onClick={() => setTaskModal(true)}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5">
          <Play size={16} /> Start today's task
        </button>
      </div>

      {/* Top metric row: countdown + target + streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <Hourglass size={64} className="absolute -right-3 -bottom-3 text-white opacity-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-100">Exam Countdown</span>
            <button onClick={() => setEditExam((v) => !v)} aria-label="Edit countdown" className="text-indigo-100 hover:text-white"><Pencil size={13} /></button>
          </div>
          {editExam ? (
            <div className="flex items-center gap-2 mt-2">
              <input type="number" value={examDays} onChange={(e) => setExamDays(Number(e.target.value))}
                className="w-20 bg-white/20 rounded-lg px-2 py-1 text-2xl font-bold text-white outline-none" />
              <button onClick={() => setEditExam(false)} className="text-xs bg-white text-indigo-600 px-2.5 py-1 rounded-md font-semibold">Save</button>
            </div>
          ) : (
            <p className="text-3xl font-bold mt-1">{examDays} <span className="text-base font-medium text-indigo-100">days</span></p>
          )}
          <p className="text-xs text-indigo-200 mt-1">until Digital SAT · Aug 23</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Target Score</span>
            <button onClick={() => setEditTarget((v) => !v)} aria-label="Edit target" className="text-slate-400 hover:text-slate-600"><Pencil size={13} /></button>
          </div>
          {editTarget ? (
            <div className="flex items-center gap-2 mt-2">
              <input type="number" value={targetScore} onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-2xl font-bold text-slate-900 outline-none focus:border-indigo-400" />
              <button onClick={() => setEditTarget(false)} className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-md font-semibold">Save</button>
            </div>
          ) : (
            <p className="text-3xl font-bold text-slate-900 mt-1">{targetScore}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium"><Target size={12} /> 140 points to go</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <span className="text-xs font-medium text-slate-500">Current Estimate</span>
          <p className="text-3xl font-bold text-slate-900 mt-1">1360</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium"><ArrowUpRight size={12} /> +180 since you started</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Question of the Day */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Flame size={16} className="text-amber-500" /> Question of the Day</h2>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">7-day streak 🔥</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {qotd.map((q) => {
                const Icon = q.icon; const a = accent[q.color];
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-7 w-7 rounded-lg ${a.solid} flex items-center justify-center`}><Icon size={14} className="text-white" /></div>
                      <span className="text-sm font-semibold text-slate-900">{q.subject}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${a.bg} ${a.text}`}>{q.skill}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug mb-3 line-clamp-2">{q.q}</p>
                    <button onClick={() => onNavigate('session')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">Solve now <ArrowRight size={13} /></button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score Trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-900">Score Trend</h2>
              <button onClick={() => onNavigate('results')} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">View Analytics <ChevronRight size={14} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Last 6 practice tests</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashTrend} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1100, 1450]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Side: study tracking */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Study Tracking</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Study time today</span>
                  <span className="text-sm font-semibold text-slate-900">1h 47m</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{ width: '72%' }} /></div>
                <p className="text-xs text-slate-400 mt-1">Goal: 2h 30m</p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Weekly total</span>
                  <span className="text-sm font-semibold text-slate-900">9h 12m</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 font-medium"><Flame size={12} /> 7-day study streak</div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center">
                    <div className={`h-8 rounded-md ${i < 5 ? 'bg-indigo-500' : i === 5 ? 'bg-indigo-300' : 'bg-slate-100'}`} />
                    <span className="text-[10px] text-slate-400">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2"><Brain size={16} className="text-indigo-300" /><h2 className="text-sm font-semibold">AI Study Plan</h2></div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">Your weakest domain this week is <span className="text-white font-medium">Systems of Equations</span> (54% accuracy). I've queued a targeted drill set.</p>
            <button onClick={() => onNavigate('qbank')} className="w-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
              Start recommended drills <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Start today's task modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setTaskModal(false)} className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-3xl">
              <h3 className="text-lg font-semibold text-slate-900">Today's Tasks</h3>
              <button onClick={() => setTaskModal(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Brain size={15} className="text-indigo-600" /> AI Study Plan</h4>
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">See more</button>
                </div>
                <div className="space-y-2.5">{todayTasks.ai.map((t) => <TaskCard key={t.id} t={t} />)}</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><GraduationCap size={15} className="text-violet-600" /> Teacher's Tasks</h4>
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">See more</button>
                </div>
                <div className="space-y-2.5">{todayTasks.teacher.map((t) => <TaskCard key={t.id} t={t} />)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ Shared question data ============================ */
const examQuestions = [
  { id: 1, domain: 'Information and Ideas', skill: 'Central Ideas', difficulty: 'Medium', source: 'College Board', timeTarget: 75, correct: 'C',
    passage: "Marine biologists have long assumed that coral reefs respond to rising ocean temperatures in a uniformly negative way. Recent fieldwork near Palau, however, suggests that some coral colonies actively adjust the algae living within their tissue, swapping in heat-tolerant strains as water temperatures climb. The finding has prompted several research teams to revisit decades-old models of coral vulnerability.",
    question: 'Which choice best states the main purpose of the text?',
    options: [{ label: 'A', text: 'To describe a new method for measuring ocean temperature' }, { label: 'B', text: 'To explain why coral reefs are disappearing worldwide' }, { label: 'C', text: 'To present a finding that complicates an existing assumption about coral' }, { label: 'D', text: 'To argue that climate change has little effect on marine ecosystems' }],
    exp: { A: 'No measurement method is described — temperature is only context.', B: 'The text is about adaptation, not disappearance; this misses the point.', C: 'Correct. The "however" pivots from an old assumption to a complicating finding.', D: 'Too strong — the text never dismisses climate effects.' },
    official: 'The text first states a long-held assumption, then uses "however" to introduce fieldwork that complicates it. The main purpose is therefore to present a finding that challenges an established view.' },
  { id: 2, domain: 'Craft and Structure', skill: 'Transitions', difficulty: 'Easy', source: 'Toptierprep', timeTarget: 50, correct: 'B',
    passage: "Before the printing press, books were copied by hand, a process that could take a single scribe several months. Gutenberg's mechanical press could produce hundreds of identical pages in a day. ______, the spread of written knowledge across Europe accelerated dramatically.",
    question: 'Which choice completes the text with the most logical transition?',
    options: [{ label: 'A', text: 'However' }, { label: 'B', text: 'As a result' }, { label: 'C', text: 'For example' }, { label: 'D', text: 'In contrast' }],
    exp: { A: 'Signals contrast, but the ideas agree — faster printing caused faster spread.', B: 'Correct. The acceleration is a direct consequence of the press.', C: 'No example relationship — the second clause is an effect, not an instance.', D: 'Contrast is wrong; the two ideas are cause and effect.' },
    official: 'The press enabling faster production is the cause; the accelerated spread of knowledge is the effect. A cause-and-effect transition ("As a result") is required.' },
  { id: 3, domain: 'Standard English Conventions', skill: 'Subject-Verb Agreement', difficulty: 'Medium', source: 'College Board', timeTarget: 60, correct: 'C',
    passage: "The research committee, after reviewing dozens of grant applications, ______ to extend the submission deadline by two weeks.",
    question: 'Which choice conforms to the conventions of Standard English?',
    options: [{ label: 'A', text: 'have decided' }, { label: 'B', text: 'deciding' }, { label: 'C', text: 'decided' }, { label: 'D', text: 'was deciding' }],
    exp: { A: '"Committee" is singular, so "have" is wrong.', B: 'A participle leaves the sentence without a main verb.', C: 'Correct. Singular past-tense verb agreeing with "committee."', D: 'Awkward and shifts to a progressive aspect the sentence doesn\'t need.' },
    official: 'The singular collective noun "committee" needs a singular verb, and the sentence requires a finite main verb. "Decided" satisfies both.' },
  { id: 4, domain: 'Expression of Ideas', skill: 'Rhetorical Synthesis', difficulty: 'Medium', source: 'Toptierprep', timeTarget: 80, correct: 'B',
    passage: "Notes:\n• Community gardens increase access to fresh produce in low-income areas.\n• A 2019 study found a 23% increase in vegetable consumption among participating households.\n• Gardens create shared spaces that strengthen social ties.\nThe student wants to emphasize the nutritional impact of community gardens.",
    question: 'Which choice most effectively accomplishes this goal?',
    options: [{ label: 'A', text: 'Community gardens give neighbors a reason to spend time together.' }, { label: 'B', text: 'A 2019 study linked community gardens to a 23% rise in vegetable consumption.' }, { label: 'C', text: 'Community gardens have grown more popular in recent years.' }, { label: 'D', text: 'Many cities offer grants to help residents start gardens.' }],
    exp: { A: 'Emphasizes social ties, not nutrition.', B: 'Correct. Directly cites the nutritional outcome the goal asks for.', C: 'Off-goal — popularity, not nutrition.', D: 'About funding, not nutritional impact.' },
    official: 'The goal is nutritional impact. Only the choice citing increased vegetable consumption directly addresses nutrition.' },
  { id: 5, domain: 'Craft and Structure', skill: 'Word in Context', difficulty: 'Hard', source: 'College Board', timeTarget: 70, correct: 'B',
    passage: "Ramanujan's notebooks, filled with formulas he derived with almost no formal training, continue to ______ mathematicians a century after his death, many of whom still find new applications for his work.",
    question: 'Which choice completes the text with the most logical and precise word?',
    options: [{ label: 'A', text: 'confuse' }, { label: 'B', text: 'fascinate' }, { label: 'C', text: 'discourage' }, { label: 'D', text: 'overwhelm' }],
    exp: { A: 'Negative; clashes with the admiring tone.', B: 'Correct. Matches ongoing admiration and continued study.', C: 'Opposite of the engaged interest described.', D: 'Implies being defeated, not drawn in.' },
    official: 'The sentence describes sustained, admiring interest. "Fascinate" precisely captures that ongoing positive engagement.' },
  { id: 6, domain: 'Information and Ideas', skill: 'Central Ideas', difficulty: 'Medium', source: 'Toptierprep', timeTarget: 75, correct: 'B',
    passage: "In 2021, a team exploring the Mariana Trench recorded an anglerfish producing a bioluminescent flash pattern that did not match known prey-attraction behavior. The team hypothesizes that the flashes instead serve as communication between individuals in total darkness.",
    question: 'Which choice best states the central idea of the text?',
    options: [{ label: 'A', text: 'Anglerfish are more common in the trench than believed.' }, { label: 'B', text: 'A newly observed light pattern may serve a communicative function.' }, { label: 'C', text: 'Researchers confirmed anglerfish communicate using light.' }, { label: 'D', text: 'Bioluminescence was only recently discovered in deep-sea fish.' }],
    exp: { A: 'Population is never discussed.', B: 'Correct. Captures the hypothesis about a communicative role.', C: 'Too strong — it is a hypothesis, not confirmed.', D: 'Bioluminescence is assumed known, not newly discovered.' },
    official: 'The text reports a new observation and a tentative hypothesis. "May serve a communicative function" reflects that appropriately hedged central idea.' },
  { id: 7, domain: 'Craft and Structure', skill: 'Transitions', difficulty: 'Easy', source: 'College Board', timeTarget: 50, correct: 'B',
    passage: "Solar panel efficiency has climbed nearly 30% over the past decade. ______, the cost of installing a residential solar system has fallen by more than half over the same period.",
    question: 'Which choice completes the text with the most logical transition?',
    options: [{ label: 'A', text: 'Nevertheless' }, { label: 'B', text: 'Meanwhile' }, { label: 'C', text: 'Otherwise' }, { label: 'D', text: 'Specifically' }],
    exp: { A: 'No contradiction between the two trends.', B: 'Correct. Two parallel developments over the same period.', C: 'Conditional sense doesn\'t fit.', D: 'The second clause is not a specific instance of the first.' },
    official: 'Two simultaneous, parallel trends are described. "Meanwhile" correctly signals concurrence.' },
  { id: 8, domain: 'Standard English Conventions', skill: 'Modifiers', difficulty: 'Hard', source: 'Toptierprep', timeTarget: 65, correct: 'A',
    passage: "Few instruments demand as much physical control as the oboe, ______ a reed so narrow that even small changes in air pressure affect its tone.",
    question: 'Which choice conforms to the conventions of Standard English?',
    options: [{ label: 'A', text: 'which has' }, { label: 'B', text: 'having' }, { label: 'C', text: 'it has' }, { label: 'D', text: 'has' }],
    exp: { A: 'Correct. A relative clause properly attaches the detail to "oboe."', B: 'Dangling participle; ambiguous attachment.', C: 'Creates a comma splice (two independent clauses).', D: 'No subject for the verb — fragmentary.' },
    official: 'A relative clause introduced by "which has" correctly modifies "oboe" without creating a splice or fragment.' },
];

/* =============================== Practice page =============================== */
const practiceTabs = [
  { id: 'diagnostic', label: 'Diagnostic', desc: 'Format preview · 10 Qs/module' },
  { id: 'full', label: 'Full-Length', desc: 'Adaptive & timed simulation' },
  { id: 'section', label: 'Section Tests', desc: 'Math-only or RW-only' },
];

const practiceTests = [
  { id: 1, title: 'Practice Test #1', difficulty: 'Medium', updated: 'Jun 2026', duration: '2h 14m', lastScore: 1290, lastAttempt: 'Jun 18', attempted: true, comments: 42 },
  { id: 2, title: 'Practice Test #2', difficulty: 'Hard', updated: 'Jun 2026', duration: '2h 14m', lastScore: null, lastAttempt: null, attempted: false, comments: 17 },
  { id: 3, title: 'Practice Test #3', difficulty: 'Medium', updated: 'May 2026', duration: '2h 14m', lastScore: null, lastAttempt: null, attempted: false, comments: 8, inProgress: true },
  { id: 4, title: 'Practice Test #4', difficulty: 'Easy', updated: 'May 2026', duration: '2h 14m', lastScore: 1340, lastAttempt: 'Jun 10', attempted: true, comments: 63 },
  { id: 5, title: 'Practice Test #5', difficulty: 'Hard', updated: 'Apr 2026', duration: '2h 14m', lastScore: 1210, lastAttempt: 'Jun 2', attempted: true, comments: 29 },
  { id: 6, title: 'Practice Test #6', difficulty: 'Medium', updated: 'Apr 2026', duration: '2h 14m', lastScore: null, lastAttempt: null, attempted: false, comments: 11 },
];

function FilterPill({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
      <span className="text-xs text-slate-400">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="text-xs font-medium text-slate-700 outline-none bg-transparent cursor-pointer">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Practice({ onNavigate }) {
  const [tab, setTab] = useState('full');
  const [diff, setDiff] = useState('All');
  const [status, setStatus] = useState('All');
  const [recency, setRecency] = useState('Newest');
  const [sectionMode, setSectionMode] = useState('Math');
  const [timed, setTimed] = useState(true);

  let list = practiceTests.filter((t) =>
    (diff === 'All' || t.difficulty === diff) &&
    (status === 'All' || (status === 'Attempted' ? t.attempted : !t.attempted))
  );
  if (recency === 'Oldest') list = [...list].reverse();

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Practice</h1>
      <p className="text-sm text-slate-500 mb-6">Select a test, track progress, and simulate the real exam.</p>

      {/* Continue test banner */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl px-5 py-4 mb-6 shadow-sm">
        <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><Play size={20} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Continue: Practice Test #3</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="h-1.5 w-32 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: '42%' }} /></div>
            <span className="text-xs text-indigo-100">42% · 38:12 left</span>
          </div>
        </div>
        <button onClick={() => onNavigate('session')} className="text-sm font-semibold bg-white text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition shrink-0">Resume</button>
      </div>

      {/* Performance snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center"><BarChart3 size={22} className="text-indigo-600" /></div>
          <div>
            <p className="text-xs text-slate-500">Estimated Score Range</p>
            <p className="text-2xl font-bold text-slate-900">1320 – 1380</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full"><CheckCircle size={13} /> High Confidence</span>
          <span className="text-xs text-slate-400">Based on your last 4 attempts</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {practiceTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-left p-4 rounded-2xl border-2 transition ${tab === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-sm font-semibold text-slate-900">{t.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Section-test mode controls */}
      {tab === 'section' && (
        <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Section:</span>
          {['Math', 'Reading & Writing'].map((m) => (
            <button key={m} onClick={() => setSectionMode(m)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${sectionMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{m}</button>
          ))}
          <span className="text-xs font-medium text-slate-500 ml-2">Mode:</span>
          <button onClick={() => setTimed((v) => !v)} className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
            <span className={`h-4 w-7 rounded-full relative transition ${timed ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${timed ? 'translate-x-3.5' : 'translate-x-0.5'}`} /></span>
            {timed ? 'Timed' : 'Untimed'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Filter size={14} /> Filters</span>
        <FilterPill label="Difficulty" options={['All', 'Easy', 'Medium', 'Hard']} value={diff} onChange={setDiff} />
        <FilterPill label="Status" options={['All', 'Not Attempted', 'Attempted']} value={status} onChange={setStatus} />
        <FilterPill label="Sort" options={['Newest', 'Oldest']} value={recency} onChange={setRecency} />
      </div>

      {/* Test cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{t.title}</h3>
                  {t.inProgress && <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">In progress</span>}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffBadge[t.difficulty]}`}>{t.difficulty}</span>
                  <span className="text-xs text-slate-400">Updated {t.updated}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {t.duration}</span>
                </div>
              </div>
            </div>
            {t.attempted ? (
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 p-2.5 bg-slate-50 rounded-lg">
                <span>Last score: <span className="font-semibold text-slate-900">{t.lastScore}</span></span>
                <span>Last attempt: <span className="font-medium text-slate-700">{t.lastAttempt}</span></span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mb-4 p-2.5 bg-slate-50 rounded-lg">Not attempted yet</div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('session')} className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                <Play size={15} /> {t.inProgress ? 'Resume Exam' : 'Start Exam'}
              </button>
              {t.attempted && (
                <button onClick={() => onNavigate('results')} className="text-sm font-medium text-slate-600 border border-slate-200 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition">Results</button>
              )}
              <button className="flex items-center gap-1 text-sm font-medium text-slate-500 border border-slate-200 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition">
                <MessageSquare size={14} /> {t.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== Session AI drawer (right slide-out) ===================== */
function SessionAIDrawer({ open, onClose, contextLabel }) {
  const [messages, setMessages] = useState([{ id: 1, role: 'assistant', text: "I'm right here while you work. Ask me to clarify the question, a choice, or the explanation." }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  const send = (text) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { id: Date.now(), role: 'user', text }]);
    setInput(''); setTyping(true);
    setTimeout(() => { setMessages((p) => [...p, { id: Date.now() + 1, role: 'assistant', text: aiCanned[Math.floor(Math.random() * aiCanned.length)] }]); setTyping(false); }, 1000);
  };
  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900">
        <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><Brain size={15} className="text-white" /></div><div><p className="text-sm font-semibold text-white">AI Tutor</p><p className="text-xs text-emerald-400">Online</p></div></div>
        <button onClick={onClose} aria-label="Close AI" className="text-slate-400 hover:text-white"><X size={18} /></button>
      </div>
      {contextLabel && <div className="px-5 pt-3"><div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 w-fit px-2.5 py-1 rounded-full"><FileText size={11} /> {contextLabel}</div></div>}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>{m.text}</div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" /><span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.15s' }} /><span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.3s' }} /></div></div>}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} placeholder="Ask the AI..." className="flex-1 text-sm px-3.5 py-2.5 rounded-full bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-300 outline-none" />
        <button onClick={() => send(input)} aria-label="Send" className="h-9 w-9 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"><Send size={15} className="text-white" /></button>
      </div>
    </div>
  );
}

/* ===================== Test / Question Bank session (fullscreen) ===================== */
const SESSION_SECONDS = 32 * 60;

function TestSession({ mode = 'exam', onExit, onFinish }) {
  const isQB = mode === 'qbank';
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [crossed, setCrossed] = useState({});
  const [elim, setElim] = useState(false);
  const [time, setTime] = useState(SESSION_SECONDS);
  const [timerOn, setTimerOn] = useState(true);
  const [palette, setPalette] = useState(false);
  const [mView, setMView] = useState('passage');
  const [aiOpen, setAiOpen] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const [expTab, setExpTab] = useState('guide');

  useEffect(() => { const t = setInterval(() => setTime((x) => (x > 0 ? x - 1 : 0)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { setShowExp(false); }, [idx]);

  const q = examQuestions[idx];
  const answeredCount = Object.keys(answers).length;
  const urgent = time <= 300;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pick = (l) => { if (crossed[`${q.id}-${l}`]) return; setAnswers((p) => ({ ...p, [q.id]: l })); };
  const cross = (l, e) => { e.stopPropagation(); setCrossed((p) => ({ ...p, [`${q.id}-${l}`]: !p[`${q.id}-${l}`] })); };

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0"><GraduationCap size={17} className="text-white" /></div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{isQB ? 'Question Bank Session' : 'SAT Practice — Reading & Writing'}</p>
            <p className="text-xs text-slate-500">{isQB ? 'Custom drill · 8 questions' : 'Module 1 of 2'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <button onClick={() => setTimerOn((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
            {timerOn ? <Clock size={15} className="text-slate-500" /> : <EyeOff size={15} className="text-slate-400" />}
            <span className={`font-mono text-sm font-semibold tabular-nums ${urgent && timerOn ? 'text-rose-600' : 'text-slate-700'}`}>{timerOn ? fmt(time) : 'Hidden'}</span>
          </button>
          <button className="hidden sm:inline-flex text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Directions</button>
          <button onClick={onFinish} className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition">{isQB ? 'Finish Session' : 'Save & Exit'}</button>
        </div>
      </div>

      {/* QB metadata header */}
      {isQB && (
        <div className="flex items-center gap-2 px-4 lg:px-6 py-2.5 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <span className="shrink-0 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">{q.skill}</span>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${diffBadge[q.difficulty]}`}>Level {q.difficulty === 'Easy' ? 1 : q.difficulty === 'Medium' ? 2 : 3} · {q.difficulty}</span>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${sourceBadge[q.source]}`}>{q.source}</span>
          <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-slate-500 ml-1"><Timer size={12} /> Target {q.timeTarget}s</span>
        </div>
      )}

      {/* Mobile tabs */}
      <div className="lg:hidden flex border-b border-slate-200">
        <button onClick={() => setMView('passage')} className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition ${mView === 'passage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Passage</button>
        <button onClick={() => setMView('question')} className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition ${mView === 'question' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Question</button>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={`${mView === 'passage' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-1/2 lg:border-r border-slate-200 overflow-y-auto p-6 lg:p-10`}>
          <span className="inline-block w-fit text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-4">{q.domain}</span>
          <p className="text-slate-800 leading-relaxed whitespace-pre-line">{q.passage}</p>
        </div>

        <div className={`${mView === 'question' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-1/2 overflow-y-auto bg-slate-50`}>
          <div className="flex-1 p-6 lg:p-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-900 text-white text-xs font-bold">{idx + 1}</span>
                <button onClick={() => setFlagged((p) => ({ ...p, [q.id]: !p[q.id] }))} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition ${flagged[q.id] ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                  <Flag size={13} className={flagged[q.id] ? 'fill-amber-500 text-amber-500' : ''} /> Mark for Review
                </button>
              </div>
              <button onClick={() => setElim((v) => !v)} aria-label="Answer eliminator" className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${elim ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}><span className="line-through">ABC</span></button>
            </div>

            <p className="text-slate-900 font-medium mb-6 leading-relaxed">{q.question}</p>

            <div className="space-y-3">
              {q.options.map((opt) => {
                const key = `${q.id}-${opt.label}`;
                const isCrossed = crossed[key];
                const selected = answers[q.id] === opt.label;
                const isCorrect = isQB && showExp && opt.label === q.correct;
                const isWrongPick = isQB && showExp && selected && opt.label !== q.correct;
                return (
                  <div key={opt.label} className="flex items-center gap-2">
                    <button onClick={() => pick(opt.label)} disabled={isCrossed}
                      className={`flex-1 flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 transition ${
                        isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrongPick ? 'border-rose-400 bg-rose-50' : selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
                      } ${isCrossed ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <span className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-full border-2 text-xs font-semibold ${
                        isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : isWrongPick ? 'border-rose-400 bg-rose-400 text-white' : selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                      }`}>{opt.label}</span>
                      <span className={`text-sm text-slate-800 ${isCrossed ? 'line-through text-slate-400' : ''}`}>{opt.text}</span>
                      {isCorrect && <CheckCircle size={16} className="ml-auto text-emerald-500 shrink-0" />}
                    </button>
                    {elim && <button onClick={(e) => cross(opt.label, e)} aria-label="Cross out" className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full border border-slate-300 text-slate-400 hover:border-rose-400 hover:text-rose-500 transition">{isCrossed ? <RotateCcw size={13} /> : <X size={13} />}</button>}
                  </div>
                );
              })}
            </div>

            {/* QB explanation toggle */}
            {isQB && (
              <div className="mt-6">
                <button onClick={() => setShowExp((v) => !v)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  <Lightbulb size={16} /> {showExp ? 'Hide explanation' : 'Reveal explanation'}
                </button>
                {showExp && (
                  <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex border-b border-slate-200">
                      <button onClick={() => setExpTab('guide')} className={`flex-1 py-2.5 text-xs font-semibold transition ${expTab === 'guide' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>In-Depth Guide</button>
                      <button onClick={() => setExpTab('official')} className={`flex-1 py-2.5 text-xs font-semibold transition ${expTab === 'official' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Full Explanation</button>
                    </div>
                    <div className="p-4">
                      {expTab === 'guide' ? (
                        <div className="space-y-2.5">
                          {q.options.map((opt) => (
                            <div key={opt.label} className="flex gap-2.5">
                              <span className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${opt.label === q.correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{opt.label}</span>
                              <p className="text-xs text-slate-600 leading-relaxed">{q.exp[opt.label]}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1"><BookMarked size={12} /> Official explanation (College Board)</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{q.official}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="relative flex items-center justify-between px-4 lg:px-6 py-3 border-t border-slate-200">
        <button onClick={() => { setIdx(Math.max(0, idx - 1)); setPalette(false); }} disabled={idx === 0} className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-30 hover:text-slate-900 transition"><ChevronLeft size={16} /> Back</button>
        <button onClick={() => setPalette((v) => !v)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition">Question {idx + 1} of {examQuestions.length} <LayoutGrid size={14} /></button>
        {idx === examQuestions.length - 1 ? (
          <button onClick={onFinish} className="flex items-center gap-1 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full transition">Finish <Check size={16} /></button>
        ) : (
          <button onClick={() => { setIdx(Math.min(examQuestions.length - 1, idx + 1)); setPalette(false); }} className="flex items-center gap-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition">Next <ChevronRight size={16} /></button>
        )}

        {palette && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">{answeredCount} of {examQuestions.length} answered</p>
            <div className="grid grid-cols-4 gap-2">
              {examQuestions.map((qq, i) => (
                <button key={qq.id} onClick={() => { setIdx(i); setPalette(false); }} className={`relative h-9 w-9 rounded-lg text-xs font-semibold flex items-center justify-center border-2 transition ${i === idx ? 'border-indigo-600 bg-indigo-600 text-white' : answers[qq.id] ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {i + 1}{flagged[qq.id] && <Flag size={9} className="absolute -top-1.5 -right-1.5 fill-amber-500 text-amber-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right-edge AI tab + drawer */}
      {!aiOpen && (
        <button onClick={() => setAiOpen(true)} className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-l-xl py-3 px-2 shadow-lg flex flex-col items-center gap-1.5 transition">
          <Brain size={18} /><span className="text-[10px] font-semibold [writing-mode:vertical-rl]">AI Tutor</span>
        </button>
      )}
      <SessionAIDrawer open={aiOpen} onClose={() => setAiOpen(false)} contextLabel={`Q${idx + 1} · ${q.skill}`} />

      {/* Exit (corner) */}
      <button onClick={onExit} className="hidden" aria-hidden />
    </div>
  );
}

/* ================================ Results page ================================ */
function buildModule(total, wrong, omit) {
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    if (omit.includes(n)) return 'omitted';
    if (wrong.includes(n)) return 'incorrect';
    return 'correct';
  });
}
const resultModules = [
  { name: 'Reading & Writing — Module 1', cells: buildModule(27, [4, 11, 19], [25, 26, 27]) },
  { name: 'Reading & Writing — Module 2', cells: buildModule(27, [7, 14, 22, 27], [24, 25, 26]) },
  { name: 'Math — Module 1', cells: buildModule(22, [9, 16], [20, 21, 22]) },
  { name: 'Math — Module 2', cells: buildModule(22, [5, 12, 18, 21], [22]) },
];

const resultLeaderboard = [
  { rank: 1, name: 'Nilufar R.', score: 1540 },
  { rank: 2, name: 'Jin-ho P.', score: 1510 },
  { rank: 3, name: 'Aisha K.', score: 1420, you: true },
  { rank: 4, name: 'Daniyar B.', score: 1390 },
  { rank: 5, name: 'Madina Y.', score: 1370 },
];

const domainAccuracy = [
  { domain: 'Algebra', acc: 88, color: 'emerald' },
  { domain: 'Advanced Math', acc: 71, color: 'amber' },
  { domain: 'Problem Solving & Data', acc: 79, color: 'sky' },
  { domain: 'Geometry & Trig', acc: 54, color: 'rose', weakest: true },
  { domain: 'Craft & Structure', acc: 84, color: 'emerald' },
  { domain: 'Information & Ideas', acc: 76, color: 'violet' },
];

const gridColors = {
  correct: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500',
  incorrect: 'bg-rose-500 hover:bg-rose-600 border-rose-500',
  omitted: 'bg-slate-200 hover:bg-slate-300 border-slate-200',
};

function QuestionDetailModal({ q, status, onClose, onAddRedo }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [aiVerdict, setAiVerdict] = useState(null);
  const [redoAdded, setRedoAdded] = useState(false);
  const wrongPick = q.options.find((o) => o.label !== q.correct)?.label;
  const yourChoice = status === 'correct' ? q.correct : status === 'incorrect' ? wrongPick : null;

  const analyzeReasoning = () => {
    if (!reasoning.trim()) return;
    setAiVerdict("I see what happened. You locked onto a detail that felt relevant, but it actually supports a trap choice. The key is that the question asks for the *primary* purpose — so a locally-true statement isn't enough; it has to capture the whole text. Re-read the pivot sentence and notice how it reframes everything before it. That points you to the correct answer.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div onClick={onClose} className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-3xl w-full max-w-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-slate-900 text-white text-sm font-bold flex items-center justify-center">{q.id}</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{q.skill}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === 'correct' ? 'bg-emerald-50 text-emerald-700' : status === 'incorrect' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                {status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : 'Omitted'}
              </span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Left rail: AI tools */}
          <div className="lg:w-44 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 space-y-2 bg-slate-50">
            <button onClick={() => setAiOpen((v) => !v)} className={`w-full flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl transition ${aiOpen ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'}`}>
              <Brain size={15} /> Explain with AI
            </button>
            {status === 'incorrect' && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium px-1"><Lightbulb size={12} /> Try "Why did I choose this?" below</div>
            )}
            <button onClick={() => { setRedoAdded(true); onAddRedo && onAddRedo(); }} className={`w-full flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl transition ${redoAdded ? 'bg-emerald-50 text-emerald-700' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}`}>
              {redoAdded ? <CheckCircle size={15} /> : <Plus size={15} />} {redoAdded ? 'Added to Redo' : 'Add to Redo'}
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 pt-1"><Clock size={12} /> Time spent: 1m 12s</div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 min-w-0">
            <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-line">{q.passage}</p>
            <p className="text-sm font-semibold text-slate-900 mb-4">{q.question}</p>

            <div className="space-y-2 mb-5">
              {q.options.map((opt) => {
                const isCorrect = opt.label === q.correct;
                const isYours = opt.label === yourChoice;
                return (
                  <div key={opt.label} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 ${isCorrect ? 'border-emerald-500 bg-emerald-50' : isYours ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}>
                    <span className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-emerald-500 text-white' : isYours ? 'bg-rose-400 text-white' : 'bg-slate-200 text-slate-600'}`}>{opt.label}</span>
                    <span className="text-sm text-slate-800 flex-1">{opt.text}</span>
                    {isCorrect && <span className="text-xs font-semibold text-emerald-600 shrink-0">Correct</span>}
                    {isYours && !isCorrect && <span className="text-xs font-semibold text-rose-600 shrink-0">Your answer</span>}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Why each choice</p>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.label} className="flex gap-2.5">
                    <span className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${opt.label === q.correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{opt.label}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{q.exp[opt.label]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why did I choose this? (incorrect only) */}
            {status === 'incorrect' && (
              <div className="border border-indigo-200 bg-indigo-50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5 mb-2"><Lightbulb size={15} /> Why did I choose this?</p>
                <p className="text-xs text-indigo-700 mb-2.5">Tell the AI your reasoning, and it'll pinpoint exactly where your logic went wrong.</p>
                <textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} rows={2} placeholder="I picked B because I thought..." className="w-full text-sm px-3 py-2 rounded-xl border border-indigo-200 focus:border-indigo-400 outline-none resize-none mb-2" />
                <button onClick={analyzeReasoning} className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg transition">Analyze my reasoning</button>
                {aiVerdict && (
                  <div className="mt-3 flex gap-2.5 bg-white rounded-xl p-3 border border-indigo-100">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0"><Brain size={13} className="text-white" /></div>
                    <p className="text-xs text-slate-700 leading-relaxed">{aiVerdict}</p>
                  </div>
                )}
              </div>
            )}

            {/* Explain with AI inline panel */}
            {aiOpen && (
              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-2"><Brain size={15} className="text-indigo-600" /> AI explanation</p>
                <p className="text-xs text-slate-600 leading-relaxed">{q.official} The fastest path here: read the pivot, predict the answer in your own words before looking at the choices, then match. Want me to drill you on three more questions with this exact skill?</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Results({ onNavigate }) {
  const [modalQ, setModalQ] = useState(null);
  const [hovered, setHovered] = useState(null);

  const openCell = (modIdx, n, st) => {
    const q = examQuestions[(n - 1) % examQuestions.length];
    setModalQ({ q, status: st });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Test Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">Practice Test #1 · Completed Jun 18</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 bg-white px-4 py-2.5 rounded-xl hover:bg-slate-50 transition w-fit">
          <Share2 size={15} /> Share / Export Report
        </button>
      </div>

      {/* Score overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="text-center sm:border-r border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Total Score</p>
            <p className="text-5xl font-bold text-slate-900">1420</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center justify-center gap-1"><ArrowUpRight size={13} /> +130 vs last test</p>
          </div>
          <div className="flex justify-center"><ScoreRing value={730} max={800} label="Math" colorKey="indigo" /></div>
          <div className="flex justify-center"><ScoreRing value={690} max={800} label="Reading & Writing" colorKey="violet" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: domain accuracy + grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Domain & Skill Accuracy</h2>
            <div className="space-y-3">
              {domainAccuracy.map((d) => {
                const a = accent[d.color];
                return (
                  <div key={d.domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 flex items-center gap-2">{d.domain}{d.weakest && <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Weakest</span>}</span>
                      <span className="text-sm font-semibold text-slate-900">{d.acc}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${a.solid} rounded-full`} style={{ width: `${d.acc}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => onNavigate('qbank')} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 py-2.5 rounded-xl transition">
              <Target size={15} /> Practice Geometry & Trig in Question Bank
            </button>
          </div>

          {/* Interactive question grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Question Review</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Correct</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> Incorrect</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-300" /> Omitted</span>
              </div>
            </div>
            <div className="space-y-5">
              {resultModules.map((mod, mi) => (
                <div key={mi}>
                  <p className="text-xs font-semibold text-slate-600 mb-2">{mod.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.cells.map((st, ci) => {
                      const n = ci + 1;
                      const key = `${mi}-${n}`;
                      return (
                        <button key={key} onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)} onClick={() => openCell(mi, n, st)}
                          className={`relative h-7 w-7 rounded-md border text-[10px] font-semibold text-white flex items-center justify-center transition ${gridColors[st]}`}>
                          {st === 'omitted' ? <span className="text-slate-400">{n}</span> : n}
                          {hovered === key && (
                            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md shadow-lg">Q{n} · {st} · click to review</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: leaderboard + next steps */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Top Scorers</h2>
            <div className="space-y-2">
              {resultLeaderboard.map((s) => (
                <div key={s.rank} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${s.you ? 'bg-indigo-50 border border-indigo-200' : ''}`}>
                  <span className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${s.rank === 1 ? 'bg-amber-400 text-white' : s.rank === 2 ? 'bg-slate-300 text-white' : s.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>{s.rank}</span>
                  <span className={`text-sm flex-1 ${s.you ? 'font-semibold text-indigo-900' : 'text-slate-700'}`}>{s.name}{s.you && ' (You)'}</span>
                  <span className="text-sm font-semibold text-slate-900">{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2"><Sparkles size={16} className="text-indigo-300" /><h2 className="text-sm font-semibold">Recommended Next</h2></div>
            <p className="text-sm text-slate-300 leading-relaxed mb-1">Based on a 1420, your next best step is:</p>
            <p className="text-base font-semibold mb-3">Practice Test #5 (Hard)</p>
            <button onClick={() => onNavigate('session')} className="w-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">Start next test <ArrowRight size={14} /></button>
          </div>
        </div>
      </div>

      {modalQ && <QuestionDetailModal q={modalQ.q} status={modalQ.status} onClose={() => setModalQ(null)} />}
    </div>
  );
}

/* ============================== Question Bank ============================== */
const qbankHierarchy = {
  English: [
    { domain: 'Information & Ideas', skills: ['Central Ideas', 'Inferences', 'Command of Evidence'] },
    { domain: 'Craft & Structure', skills: ['Words in Context', 'Text Structure', 'Cross-Text Connections'] },
    { domain: 'Expression of Ideas', skills: ['Rhetorical Synthesis', 'Transitions'] },
    { domain: 'Standard English Conventions', skills: ['Boundaries', 'Form, Structure & Sense'] },
  ],
  Math: [
    { domain: 'Algebra', skills: ['Linear equations (1 var)', 'Linear equations (2 var)', 'Systems of Equations'] },
    { domain: 'Advanced Math', skills: ['Nonlinear functions', 'Quadratics', 'Exponential growth'] },
    { domain: 'Problem-Solving & Data', skills: ['Ratios & Rates', 'Percentages', 'Probability & Statistics'] },
    { domain: 'Geometry & Trig', skills: ['Area & Volume', 'Triangles', 'Circles', 'Trigonometry'] },
  ],
};

function QuestionBank({ onNavigate }) {
  const [subject, setSubject] = useState('Math');
  const [openDomain, setOpenDomain] = useState('Geometry & Trig');
  const [selSkills, setSelSkills] = useState(['Triangles', 'Circles']);
  const [sources, setSources] = useState(['College Board', 'Toptierprep']);
  const [diffs, setDiffs] = useState([2, 3]);
  const [qScore, setQScore] = useState(4);
  const [desmos, setDesmos] = useState(true);
  const [status, setStatus] = useState(['Unsolved']);
  const [keybook, setKeybook] = useState(true);
  const [volume, setVolume] = useState(20);
  const [timed, setTimed] = useState(false);

  const toggle = (arr, set, val) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const poolEstimate = 40 + selSkills.length * 23 + diffs.length * 11;

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 pb-28 font-sans">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Question Bank</h1>
      <p className="text-sm text-slate-500 mb-6">Build a custom drill from any combination of skills, sources, and difficulty.</p>

      {/* Sources */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
        <p className="text-sm font-semibold text-slate-900 mb-3">Content Sources</p>
        <div className="flex flex-wrap gap-3">
          {['College Board', 'Toptierprep'].map((s) => {
            const on = sources.includes(s);
            return (
              <button key={s} onClick={() => toggle(sources, setSources, s)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition ${on ? sourceBadge[s] : 'border-slate-200 text-slate-400'}`}>
                <span className={`h-4 w-4 rounded flex items-center justify-center ${on ? 'bg-current' : 'border border-slate-300'}`}>{on && <Check size={11} className="text-white" />}</span>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Subject + hierarchy */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-4">
            {['English', 'Math'].map((s) => (
              <button key={s} onClick={() => { setSubject(s); setOpenDomain(null); }}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition ${subject === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
            ))}
          </div>

          <p className="text-xs text-slate-500 mb-3">Select multiple domains and skills. Click a domain to expand.</p>
          <div className="space-y-2">
            {qbankHierarchy[subject].map((d) => {
              const expanded = openDomain === d.domain;
              const selectedInDomain = d.skills.filter((s) => selSkills.includes(s)).length;
              return (
                <div key={d.domain} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenDomain(expanded ? null : d.domain)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-900">{d.domain}{selectedInDomain > 0 && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{selectedInDomain} selected</span>}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded && (
                    <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {d.skills.map((s) => {
                        const on = selSkills.includes(s);
                        return (
                          <button key={s} onClick={() => toggle(selSkills, setSelSkills, s)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition ${on ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <span className={`h-4 w-4 shrink-0 rounded flex items-center justify-center ${on ? 'bg-indigo-600' : 'border border-slate-300'}`}>{on && <Check size={11} className="text-white" />}</span>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4"><SlidersHorizontal size={15} /> Advanced Filters</p>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Difficulty</p>
              <div className="flex gap-2">
                {[{ n: 1, l: 'Easy' }, { n: 2, l: 'Medium' }, { n: 3, l: 'Hard' }].map((d) => (
                  <button key={d.n} onClick={() => toggle(diffs, setDiffs, d.n)} className={`flex-1 text-xs font-medium py-2 rounded-lg border transition ${diffs.includes(d.n) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{d.l}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1"><p className="text-xs font-medium text-slate-500">Question Score</p><span className="text-xs font-semibold text-indigo-600">≥ {qScore} / 7</span></div>
              <input type="range" min={1} max={7} value={qScore} onChange={(e) => setQScore(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Desmos questions</span>
              <button onClick={() => setDesmos((v) => !v)} className={`h-5 w-9 rounded-full relative transition ${desmos ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${desmos ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Status</p>
              <div className="space-y-1.5">
                {['Solved', 'Unsolved', 'Marked for Review', 'Redo List'].map((s) => {
                  const on = status.includes(s);
                  return (
                    <button key={s} onClick={() => toggle(status, setStatus, s)} className="w-full flex items-center gap-2.5 text-sm text-slate-600">
                      <span className={`h-4 w-4 shrink-0 rounded flex items-center justify-center ${on ? 'bg-indigo-600' : 'border border-slate-300'}`}>{on && <Check size={11} className="text-white" />}</span>
                      {s === 'Redo List' ? <span className="flex items-center gap-1">{s} <RotateCcw size={11} className="text-rose-500" /></span> : s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-600">Include Keybook questions</span>
              <button onClick={() => setKeybook((v) => !v)} className={`h-5 w-9 rounded-full relative transition ${keybook ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${keybook ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating checkout bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 px-5 lg:px-8 py-3.5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Database size={16} className="text-indigo-600" />
            <span className="text-slate-500">Matching pool:</span>
            <span className="font-semibold text-slate-900">~{poolEstimate} questions</span>
            <span className="text-slate-400 hidden sm:inline">· {selSkills.length} skills · {sources.length} sources</span>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Volume:</span>
              {[10, 20, 30].map((v) => (
                <button key={v} onClick={() => setVolume(v)} className={`text-xs font-semibold h-8 w-9 rounded-lg border transition ${volume === v ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{v}</button>
              ))}
            </div>
            <button onClick={() => setTimed((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
              <span className={`h-4 w-7 rounded-full relative transition ${timed ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${timed ? 'translate-x-3.5' : 'translate-x-0.5'}`} /></span>
              {timed ? 'Timed' : 'Untimed'}
            </button>
            <button onClick={() => onNavigate('qbankSession')} className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition flex items-center gap-1.5">
              <Play size={15} /> Start Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================ Contests ================================ */
const catBadge = {
  'Math Hard': 'bg-rose-50 text-rose-700',
  'RW Hard': 'bg-violet-50 text-violet-700',
  Desmos: 'bg-sky-50 text-sky-700',
};

const contests = [
  { id: 1, title: 'Desmos Speed Run #4', cat: 'Desmos', diff: 'Hard', closesIn: '2d 4h', urgency: 35, prize: 'Pro Week + Badge', joined: 184, slots: 'Open', status: 'open' },
  { id: 2, title: 'Advanced Logic Trap #12', cat: 'RW Hard', diff: 'Hard', closesIn: '18h', urgency: 78, prize: '500 bonus XP', joined: 212, slots: '38 slots left', status: 'open' },
  { id: 3, title: 'Hard Math Sprint #9', cat: 'Math Hard', diff: 'Hard', closesIn: '5h', urgency: 92, prize: 'Top 3: Amazon voucher', joined: 301, slots: '12 slots left', status: 'open' },
  { id: 4, title: 'Geometry Gauntlet #7', cat: 'Math Hard', diff: 'Hard', closesIn: 'Closed', urgency: 100, prize: 'Completed', joined: 256, slots: 'Closed', status: 'done', yourScore: '18/20' },
];

const contestLeaders = [
  { rank: 1, name: 'Jin-ho P.', pts: 2980 },
  { rank: 2, name: 'Nilufar R.', pts: 2840 },
  { rank: 3, name: 'Lukas M.', pts: 2710 },
  { rank: 4, name: 'Aisha K.', pts: 2480, you: true },
  { rank: 5, name: 'Sofia G.', pts: 2390 },
];

function Contests({ onNavigate }) {
  const [tab, setTab] = useState('weekly');
  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-slate-900">Contests & Challenges</h1>
        <Swords size={20} className="text-rose-500" />
      </div>
      <p className="text-sm text-slate-500 mb-6">High-difficulty, timed challenges. Beat the clock, dodge the traps, climb the ranks.</p>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {[{ id: 'weekly', l: 'Weekly' }, { id: 'seasonal', l: 'Seasonal' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2 text-sm font-medium rounded-lg transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contests.map((c) => (
            <div key={c.id} className={`rounded-2xl border p-5 transition ${c.status === 'done' ? 'border-slate-200 bg-white opacity-90' : 'border-slate-200 bg-white hover:shadow-md'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catBadge[c.cat]}`}>{c.cat}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffBadge[c.diff]}`}>{c.diff}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">{c.title}</h3>

              <div className="flex items-center gap-1.5 mb-2 text-xs">
                <Gift size={13} className="text-amber-500" />
                <span className="text-slate-500">Prize:</span>
                <span className="font-semibold text-slate-900">{c.prize}</span>
              </div>

              {c.status === 'open' ? (
                <>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1 text-slate-500"><Clock size={12} /> Closes in {c.closesIn}</span>
                    <span className="text-slate-400">{c.joined} joined · {c.slots}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full ${c.urgency > 80 ? 'bg-rose-500' : c.urgency > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${c.urgency}%` }} />
                  </div>
                  <button onClick={() => onNavigate('session')} className="w-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                    <Zap size={15} /> Enter Contest
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4"><CheckCircle size={13} className="text-emerald-500" /> You scored <span className="font-semibold text-slate-900">{c.yourScore}</span></div>
                  <button onClick={() => onNavigate('contestResults')} className="w-full text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                    View Results <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Weekly Leaders</h2>
            <p className="text-xs text-slate-400 mb-4">Top 5 this cycle</p>
            <div className="space-y-2">
              {contestLeaders.map((l) => (
                <div key={l.rank} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${l.you ? 'bg-indigo-50 border border-indigo-200' : ''}`}>
                  <span className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${l.rank === 1 ? 'bg-amber-400 text-white' : l.rank === 2 ? 'bg-slate-300 text-white' : l.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>{l.rank}</span>
                  <span className={`text-sm flex-1 ${l.you ? 'font-semibold text-indigo-900' : 'text-slate-700'}`}>{l.name}{l.you && ' (You)'}</span>
                  <span className="text-sm font-semibold text-slate-900">{l.pts}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('leaderboards')} className="mt-4 w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1">Full leaderboard <ChevronRight size={14} /></button>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-rose-500 rounded-2xl p-5 text-white">
            <Award size={28} className="mb-2" />
            <p className="text-sm font-semibold mb-1">Your XP this week</p>
            <p className="text-3xl font-bold">1,240 XP</p>
            <p className="text-xs text-amber-100 mt-1">Earned from accuracy + speed across 3 contests</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Contest Results ============================ */
const contestMissed = [
  { n: 5, skill: 'Systems of Equations', yourTime: 142, topTime: 68 },
  { n: 12, skill: 'Quadratics', yourTime: 98, topTime: 71 },
];
const contestHistory = [
  { name: '#6', score: 14 }, { name: '#7', score: 16 }, { name: '#8', score: 15 }, { name: '#9', score: 18 },
];

function ContestResults({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <button onClick={() => onNavigate('contests')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"><ChevronLeft size={16} /> Back to Contests</button>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Geometry Gauntlet #7 — Results</h1>
      <p className="text-sm text-slate-500 mb-6">Hard Math · 20 questions · 30-minute limit</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Competitive Standing</h2>
          <div className="flex items-end justify-center gap-3 mb-6">
            {[{ rank: 2, name: 'Nilufar R.', h: 'h-20', c: 'bg-slate-300' }, { rank: 1, name: 'Jin-ho P.', h: 'h-28', c: 'bg-amber-400' }, { rank: 3, name: 'Lukas M.', h: 'h-16', c: 'bg-orange-400' }].map((p) => (
              <div key={p.rank} className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 mb-1">{p.name.split(' ')[0][0]}{p.name.split(' ')[1][0]}</div>
                <span className="text-xs text-slate-500 mb-1">{p.name.split(' ')[0]}</span>
                <div className={`w-20 ${p.h} ${p.c} rounded-t-xl flex items-start justify-center pt-2`}>
                  {p.rank === 1 ? <Crown size={18} className="text-white" /> : <span className="text-white font-bold">{p.rank}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <Globe size={18} className="mx-auto text-indigo-600 mb-1" />
              <p className="text-2xl font-bold text-slate-900">#42</p>
              <p className="text-xs text-slate-500">Global Rank</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <MapPin size={18} className="mx-auto text-emerald-600 mb-1" />
              <p className="text-2xl font-bold text-slate-900">#5</p>
              <p className="text-xs text-slate-500">in Uzbekistan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center">
          <ScoreRing value={18} max={20} label="18 Correct · 2 Incorrect" sublabel="/ 20" colorKey="emerald" />
          <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500"><Hourglass size={14} /> Finished in <span className="font-semibold text-slate-900">24m 18s</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Missed Questions & Time Analysis</h2>
          <div className="space-y-3">
            {contestMissed.map((m) => (
              <div key={m.n} className="p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-900"><span className="h-6 w-6 rounded-md bg-rose-500 text-white text-xs font-bold flex items-center justify-center">{m.n}</span> {m.skill}</span>
                  <button onClick={() => onNavigate('qbank')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Review</button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1"><span className="text-slate-500">Your time</span><span className="font-semibold text-rose-600">{m.yourTime}s</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{ width: '100%' }} /></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1"><span className="text-slate-500">Top 10% avg</span><span className="font-semibold text-emerald-600">{m.topTime}s</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(m.topTime / m.yourTime) * 100}%` }} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5 mb-1"><Sparkles size={15} /> Weakness identified</p>
            <p className="text-xs text-indigo-700 mb-3">You struggled with Systems of Equations under time pressure — you spent 2× the top-10% time on it.</p>
            <button onClick={() => onNavigate('qbank')} className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 w-fit">
              <Target size={14} /> Practice Systems of Equations
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Rewards & Milestones</h2>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 mb-3">
              <Zap size={20} className="text-amber-500" />
              <div><p className="text-lg font-bold text-slate-900">+420 XP</p><p className="text-xs text-slate-500">awarded this contest</p></div>
            </div>
            <div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-1.5"><Award size={14} className="text-violet-500" /> Hard Mode Wins</span><span className="font-semibold text-slate-900">4 / 5</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1"><div className="h-full bg-violet-500 rounded-full" style={{ width: '80%' }} /></div>
            <p className="text-xs text-slate-400">1 more win to unlock the "Hard Mode Master" badge</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Contest History</h2>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contestHistory} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {contestHistory.map((e, i) => <Cell key={i} fill={i === contestHistory.length - 1 ? '#4f46e5' : '#c7d2fe'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Leaderboards ============================== */
const lbData = [
  { rank: 1, name: 'Jin-ho Park', country: '🇰🇷', pts: 9840, acc: 96, time: '38s' },
  { rank: 2, name: 'Nilufar Rashidova', country: '🇺🇿', pts: 9510, acc: 94, time: '41s' },
  { rank: 3, name: 'Lukas Müller', country: '🇩🇪', pts: 9320, acc: 93, time: '44s' },
  { rank: 4, name: 'Sofia Gonzalez', country: '🇪🇸', pts: 8970, acc: 91, time: '47s' },
  { rank: 5, name: 'Chen Wei', country: '🇨🇳', pts: 8810, acc: 92, time: '45s' },
  { rank: 6, name: 'Amara Okafor', country: '🇳🇬', pts: 8640, acc: 90, time: '49s' },
  { rank: 7, name: 'Yuki Tanaka', country: '🇯🇵', pts: 8520, acc: 89, time: '46s' },
  { rank: 8, name: 'Omar Haddad', country: '🇦🇪', pts: 8390, acc: 88, time: '50s' },
];

function Leaderboards() {
  const [tab, setTab] = useState('weekly');
  const [scope, setScope] = useState('Global');
  const [scoreType, setScoreType] = useState('Overall Score');
  const medalColor = (r) => r === 1 ? 'text-amber-400' : r === 2 ? 'text-slate-400' : 'text-orange-400';

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 pb-24 font-sans">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-slate-900">Leaderboards</h1>
        <Trophy size={20} className="text-amber-500" />
      </div>
      <p className="text-sm text-slate-500 mb-6">See where you stand against the world.</p>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-4">
        {[{ id: 'weekly', l: 'Weekly' }, { id: 'monthly', l: 'Monthly' }, { id: 'yearly', l: 'Yearly · Hall of Fame' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.l}</button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
          {['Global', 'Country'].map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${scope === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
          ))}
        </div>
        {scope === 'Country' && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Globe size={14} className="text-slate-400" />
            <select className="text-xs font-medium text-slate-700 outline-none bg-transparent cursor-pointer"><option>Uzbekistan 🇺🇿</option><option>South Korea 🇰🇷</option><option>Germany 🇩🇪</option><option>Turkey 🇹🇷</option></select>
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <BarChart3 size={14} className="text-slate-400" />
          <select value={scoreType} onChange={(e) => setScoreType(e.target.value)} className="text-xs font-medium text-slate-700 outline-none bg-transparent cursor-pointer"><option>Overall Score</option><option>Contest Points</option></select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rank</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Points</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right hidden sm:table-cell">Accuracy</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right hidden md:table-cell">Avg Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lbData.map((u) => (
                <tr key={u.rank} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    {u.rank <= 3 ? <Medal size={20} className={medalColor(u.rank)} /> : <span className="text-sm font-semibold text-slate-500 pl-1.5">{u.rank}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0">{u.name.split(' ')[0][0]}{u.name.split(' ')[1][0]}</div>
                      <span className="text-sm font-medium text-slate-900">{u.name}</span>
                      <span className="text-sm">{u.country}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-slate-900">{u.pts.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600 hidden sm:table-cell">{u.acc}%</td>
                  <td className="px-5 py-3.5 text-right text-sm text-slate-500 hidden md:table-cell">{u.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-slate-900 px-5 lg:px-8 py-3.5 z-30">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <span className="text-sm font-bold text-white pl-1">#42</span>
          <div className="h-8 w-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">AK</div>
          <span className="text-sm font-medium text-white flex-1">Aisha Karimova (You) 🇺🇿</span>
          <span className="text-sm font-semibold text-white">6,240</span>
          <span className="text-xs text-emerald-400 hidden sm:flex items-center gap-1"><ArrowUpRight size={13} /> up 8 this week</span>
        </div>
      </div>
    </div>
  );
}

/* ================================ Vocabulary ================================ */
const vocabLibraries = [
  { id: 'common', name: 'Most Common DSAT Words', count: 300, tier: 'Curated', priority: true, color: 'indigo' },
  { id: 'academic', name: 'Academic', count: 220, tier: 'Medium', color: 'violet' },
  { id: 'science', name: 'Science', count: 180, tier: 'Advanced', color: 'sky' },
  { id: 'economics', name: 'Economics', count: 140, tier: 'Advanced', color: 'emerald' },
  { id: 'transitions', name: 'Transitions', count: 90, tier: 'Basic', color: 'amber' },
];

const vocabCards = [
  { id: 1, word: 'Ephemeral', pos: 'adj', def: 'Lasting for a very short time.', ex: 'Internet fame is often ephemeral.', syn: ['Fleeting', 'Transient'], ant: ['Permanent', 'Enduring'], conf: ['Ethereal', 'Esoteric'], icon: Wind, grad: 'from-violet-400 to-indigo-600' },
  { id: 2, word: 'Pragmatic', pos: 'adj', def: 'Dealing with things sensibly and realistically.', ex: 'She took a pragmatic approach to the deadline.', syn: ['Practical', 'Sensible'], ant: ['Idealistic', 'Impractical'], conf: ['Dogmatic', 'Pedantic'], icon: Wrench, grad: 'from-indigo-400 to-violet-600' },
  { id: 3, word: 'Ubiquitous', pos: 'adj', def: 'Present or found everywhere.', ex: 'Smartphones are ubiquitous in classrooms.', syn: ['Omnipresent', 'Pervasive'], ant: ['Rare', 'Scarce'], conf: ['Ambiguous', 'Iniquitous'], icon: Globe, grad: 'from-sky-400 to-indigo-600' },
  { id: 4, word: 'Meticulous', pos: 'adj', def: 'Showing great attention to detail.', ex: 'His meticulous notes saved hours of review.', syn: ['Thorough', 'Precise'], ant: ['Careless', 'Sloppy'], conf: ['Ridiculous', 'Miraculous'], icon: ListChecks, grad: 'from-amber-400 to-rose-500' },
  { id: 5, word: 'Tenacious', pos: 'adj', def: 'Holding firmly to a course of action.', ex: 'Her tenacious studying paid off.', syn: ['Persistent', 'Determined'], ant: ['Yielding', 'Irresolute'], conf: ['Tedious', 'Tentative'], icon: Anchor, grad: 'from-emerald-400 to-sky-500' },
];

function VocabFlashcards() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const c = vocabCards[i];
  const Icon = c.icon;
  const next = () => { setFlip(false); setI((x) => (x + 1) % vocabCards.length); };
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-slate-500 mb-3">Card {i + 1} of {vocabCards.length} · Most Common DSAT Words</p>
      <div className="w-full max-w-md h-96" style={{ perspective: '1500px' }}>
        <div onClick={() => setFlip((f) => !f)} className="relative w-full h-full cursor-pointer transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
            <span className="absolute top-5 left-5 text-xs font-medium text-slate-400 italic">{c.pos}</span>
            <div className={`h-28 w-28 rounded-3xl bg-gradient-to-br ${c.grad} flex items-center justify-center mb-6`}><Icon size={48} className="text-white" strokeWidth={1.5} /></div>
            <h2 className="text-3xl font-semibold text-slate-900">{c.word}</h2>
            <div className="absolute bottom-5 flex items-center gap-1.5 text-xs text-slate-400"><RotateCw size={12} /> Tap to flip</div>
          </div>
          <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-7 flex flex-col" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{c.word}</h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">{c.def}</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-3"><p className="text-xs text-slate-500 italic">{c.ex}</p></div>
            <div className="space-y-2 text-xs">
              <div><span className="font-semibold text-slate-400 uppercase tracking-wide">Synonyms </span>{c.syn.map((s) => <span key={s} className="inline-block text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mr-1">{s}</span>)}</div>
              <div><span className="font-semibold text-slate-400 uppercase tracking-wide">Antonyms </span>{c.ant.map((s) => <span key={s} className="inline-block text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full mr-1">{s}</span>)}</div>
              <div><span className="font-semibold text-slate-400 uppercase tracking-wide">Confusions </span>{c.conf.map((s) => <span key={s} className="inline-block text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mr-1">{s}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={next} className="flex items-center gap-1.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-xl transition"><X size={15} /> Don't know</button>
        <button onClick={next} className="flex items-center gap-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition"><Check size={15} /> Know it</button>
      </div>
      <p className="text-xs text-slate-400 mt-3">"Know it" schedules a longer review interval · "Don't know" repeats it this session</p>
    </div>
  );
}

const quizTypes = [
  { id: 1, name: 'Meaning MCQ', desc: 'Pick the correct definition', icon: BookOpen, color: 'indigo' },
  { id: 2, name: 'Sentence Completion', desc: 'Fill in the blank, SAT-style', icon: PenLine, color: 'violet' },
  { id: 3, name: 'Synonym / Antonym Match', desc: 'Match related or opposite meanings', icon: Layers, color: 'emerald' },
  { id: 4, name: 'Mixed Timed Quiz', desc: 'All formats, against the clock', icon: Timer, color: 'rose' },
];

const myWords = [
  { word: 'Ephemeral', mastery: 80 }, { word: 'Ubiquitous', mastery: 45 }, { word: 'Pragmatic', mastery: 100 },
  { word: 'Meticulous', mastery: 60 }, { word: 'Ambivalent', mastery: 30 }, { word: 'Tenacious', mastery: 90 },
];

function Vocabulary() {
  const [tab, setTab] = useState('flashcards');
  const [lib, setLib] = useState('common');
  const [range, setRange] = useState('1–50');

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Vocabulary</h1>
      <p className="text-sm text-slate-500 mb-6">Master DSAT words with active recall and spaced repetition.</p>

      {/* Libraries */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {vocabLibraries.map((l) => {
          const a = accent[l.color]; const on = lib === l.id;
          return (
            <button key={l.id} onClick={() => setLib(l.id)} className={`text-left p-4 rounded-2xl border-2 transition relative ${on ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              {l.priority && <span className="absolute top-2 right-2"><Star size={14} className="fill-amber-400 text-amber-400" /></span>}
              <div className={`h-8 w-8 rounded-lg ${a.solid} flex items-center justify-center mb-2`}><BookMarked size={15} className="text-white" /></div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{l.name}</p>
              <p className="text-xs text-slate-400 mt-1">{l.count} words · {l.tier}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {[{ id: 'flashcards', l: 'Flashcards' }, { id: 'quiz', l: 'Quiz' }, { id: 'mywords', l: 'My Words' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2 text-sm font-medium rounded-lg transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.l}</button>
        ))}
      </div>

      {tab === 'flashcards' && <VocabFlashcards />}

      {tab === 'quiz' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-slate-500">Word range:</span>
            {['1–50', '51–100', '200–230'].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${range === r ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{r}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizTypes.map((q) => {
              const Icon = q.icon; const a = accent[q.color];
              return (
                <button key={q.id} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition text-left">
                  <div className={`h-11 w-11 rounded-xl ${a.solid} flex items-center justify-center shrink-0`}><Icon size={20} className="text-white" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-slate-900">{q.name}</p><p className="text-xs text-slate-500 mt-0.5">{q.desc}</p></div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'mywords' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Saved Words · Mastery</h2>
            <div className="space-y-3">
              {myWords.map((w) => (
                <div key={w.word} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-900 w-28 shrink-0">{w.word}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${w.mastery === 100 ? 'bg-emerald-500' : w.mastery >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${w.mastery}%` }} /></div>
                  <span className="text-xs font-semibold text-slate-500 w-10 text-right">{w.mastery}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white text-center">
              <Hourglass size={24} className="mx-auto mb-2" />
              <p className="text-4xl font-bold">12</p>
              <p className="text-sm text-indigo-100 mt-1">words due for review today</p>
              <button className="mt-3 w-full text-sm font-semibold bg-white text-indigo-600 py-2.5 rounded-xl hover:bg-indigo-50 transition">Review now</button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <p className="text-3xl font-bold text-slate-900">68</p>
              <p className="text-sm text-slate-500">words mastered</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================ Admin Panel ================================ */
const adminGrowth = [
  { name: 'Jan', users: 1200 }, { name: 'Feb', users: 1850 }, { name: 'Mar', users: 2600 },
  { name: 'Apr', users: 3400 }, { name: 'May', users: 4900 }, { name: 'Jun', users: 6800 },
];
const adminGeo = [
  { country: 'Uzbekistan', users: 2140, pct: 31 }, { country: 'South Korea', users: 1520, pct: 22 },
  { country: 'Turkey', users: 980, pct: 14 }, { country: 'Germany', users: 720, pct: 11 },
  { country: 'United States', users: 640, pct: 9 }, { country: 'Other', users: 800, pct: 13 },
];
const adminUsers = [
  { name: 'Aisha Karimova', email: 'aisha.k@email.com', plan: 'Pro', status: 'Active', tests: 24 },
  { name: 'Daniyar Bekov', email: 'daniyar.b@email.com', plan: 'Free', status: 'Active', tests: 11 },
  { name: 'Madina Yusupova', email: 'madina.y@email.com', plan: 'Pro', status: 'Active', tests: 38 },
  { name: 'Bekzod T.', email: 'bekzod.t@email.com', plan: 'Free', status: 'Inactive', tests: 4 },
  { name: 'Nilufar R.', email: 'nilufar.r@email.com', plan: 'Pro+', status: 'Active', tests: 61 },
];
const adminTickets = [
  { id: 1, subject: 'Timer didn’t pause on Test #3', user: 'Daniyar B.', cat: 'Bug', age: '2h' },
  { id: 2, subject: 'Requesting refund for Pro', user: 'Otabek Y.', cat: 'Billing', age: '5h' },
  { id: 3, subject: 'Question 14 has two correct answers', user: 'Madina Y.', cat: 'Content', age: '1d' },
];

function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [paidToggles, setPaidToggles] = useState({ 1: true, 2: false, 3: true });
  const [announcement, setAnnouncement] = useState('');

  const tabs = [
    { id: 'overview', l: 'Overview', icon: Activity },
    { id: 'users', l: 'Users', icon: Users },
    { id: 'content', l: 'Content', icon: FileText },
    { id: 'feedback', l: 'Feedback', icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">Staff only</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">Platform health, users, content, and quality control.</p>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon size={15} /> {t.l}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[{ l: 'Total Users', v: '6,800', s: '+1,900 this month', icon: Users, c: 'indigo' }, { l: 'Active (30d)', v: '4,120', s: '61% of total', icon: Activity, c: 'emerald' }, { l: 'MRR', v: '$18.4k', s: '+12% MoM', icon: DollarSign, c: 'violet' }, { l: 'Pro Conversion', v: '23%', s: '+3pts', icon: TrendingUp, c: 'amber' }].map((s) => {
              const Icon = s.icon; const a = accent[s.c];
              return (
                <div key={s.l} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className={`h-9 w-9 rounded-xl ${a.solid} flex items-center justify-center mb-3`}><Icon size={17} className="text-white" /></div>
                  <p className="text-xl font-bold text-slate-900">{s.v}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.s}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">User Growth</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adminGrowth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs><linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} /><stop offset="100%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2.5} fill="url(#adminFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2"><Globe size={16} className="text-indigo-600" /> Geography</h2>
              <div className="space-y-3">
                {adminGeo.map((g) => (
                  <div key={g.country}>
                    <div className="flex items-center justify-between mb-1 text-xs"><span className="text-slate-600">{g.country}</span><span className="font-semibold text-slate-900">{g.users.toLocaleString()}</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${g.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl px-3 py-2"><Search size={15} className="text-slate-400" /><input placeholder="Search users by name or email..." className="flex-1 text-sm bg-transparent outline-none" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Plan</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right hidden md:table-cell">Tests</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {adminUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.plan === 'Free' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-700'}`}>{u.plan}</span></td>
                    <td className="px-4 py-3.5"><span className={`flex items-center gap-1.5 text-xs font-medium ${u.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />{u.status}</span></td>
                    <td className="px-4 py-3.5 text-right text-sm text-slate-600 hidden md:table-cell">{u.tests}</td>
                    <td className="px-5 py-3.5 text-right"><button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View profile</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Test Management</h2>
              <div className="space-y-2.5">
                {[{ id: 1, name: 'Practice Test #1', took: 1240, avg: 1290 }, { id: 2, name: 'Practice Test #2', took: 860, avg: 1180 }, { id: 3, name: 'Practice Test #3', took: 540, avg: 1240 }].map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                    <div className="flex-1"><p className="text-sm font-medium text-slate-900">{t.name}</p><p className="text-xs text-slate-400">{t.took} attempts · avg {t.avg}</p></div>
                    <span className="text-xs text-slate-500">{paidToggles[t.id] ? 'Paid' : 'Free'}</span>
                    <button onClick={() => setPaidToggles((p) => ({ ...p, [t.id]: !p[t.id] }))} className={`h-5 w-9 rounded-full relative transition ${paidToggles[t.id] ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${paidToggles[t.id] ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-500" /> Most-Failed Questions</h2>
              <div className="space-y-2">
                {[{ q: 'PT#2 · Q14 · Systems of Equations', fail: 72 }, { q: 'PT#5 · Q9 · Circles', fail: 68 }, { q: 'PT#1 · Q22 · Inference', fail: 61 }].map((f) => (
                  <div key={f.q} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50"><span className="text-xs text-slate-700">{f.q}</span><span className="text-xs font-semibold text-rose-600">{f.fail}% fail</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><Megaphone size={15} className="text-violet-600" /> Announcement</h2>
            <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={4} placeholder="Write an update or maintenance notice..." className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none resize-none mb-3" />
            <button className="w-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition">Schedule / Publish</button>
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2"><Inbox size={15} className="text-indigo-600" /> Support Tickets</h2>
            <div className="space-y-2.5">
              {adminTickets.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200">
                  <div className="flex-1"><p className="text-sm font-medium text-slate-900">{t.subject}</p><p className="text-xs text-slate-400">{t.user} · {t.age} ago</p></div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.cat === 'Bug' ? 'bg-rose-50 text-rose-700' : t.cat === 'Billing' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>{t.cat}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><Flag size={15} className="text-rose-500" /> Question Reports</h2>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50">
                <span className="text-sm text-slate-700">PT#2 · Q14 — "two correct answers"</span>
                <button className="text-xs font-semibold text-rose-600">Resolve</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><MessageSquare size={15} className="text-violet-600" /> Comment Moderation</h2>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-600 flex-1">"This test was way harder than the real thing 😩" — on PT#5</p>
                <button className="text-xs font-semibold text-emerald-600">Approve</button>
                <button className="text-xs font-semibold text-rose-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================================== App ===================================== */
export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  // Fullscreen test / question-bank session (no sidebar, matching real Bluebook)
  if (activeView === 'session' || activeView === 'qbankSession') {
    return (
      <TestSession
        mode={activeView === 'qbankSession' ? 'qbank' : 'exam'}
        onExit={() => setActiveView('dashboard')}
        onFinish={() => setActiveView(activeView === 'qbankSession' ? 'qbank' : 'results')}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 min-w-0">
        {activeView === 'dashboard' && <Dashboard onNavigate={setActiveView} />}
        {activeView === 'practice' && <Practice onNavigate={setActiveView} />}
        {activeView === 'qbank' && <QuestionBank onNavigate={setActiveView} />}
        {activeView === 'contests' && <Contests onNavigate={setActiveView} />}
        {activeView === 'contestResults' && <ContestResults onNavigate={setActiveView} />}
        {activeView === 'leaderboards' && <Leaderboards />}
        {activeView === 'vocab' && <Vocabulary />}
        {activeView === 'results' && <Results onNavigate={setActiveView} />}
        {activeView === 'admin' && <AdminPanel />}
      </div>
      <AITutor />
    </div>
  );
}
