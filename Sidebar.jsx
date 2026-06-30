'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  GraduationCap,
  Flame,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'practice', label: 'Practice Tests', icon: FileText },
  { id: 'vocab', label: 'Vocab Builder', icon: Layers },
  { id: 'classes', label: 'Classes', icon: GraduationCap },
];

// Self-contained nav: manages its own "active" state so it works standalone.
// Swap setActiveItem/onClick for Next.js <Link href> + usePathname() when wiring
// this into the real app router.
export default function Sidebar({ activeItem: initialActive = 'dashboard' } = {}) {
  const [activeItem, setActiveItem] = useState(initialActive);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base">A</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Ascend</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <div className="flex items-center gap-2 px-3.5 py-2 mb-2 rounded-xl bg-slate-800">
          <Flame size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">14-day streak</span>
        </div>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Aisha Karimova</p>
            <p className="text-xs text-slate-400">Student</p>
          </div>
          <Settings size={16} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <span className="text-white font-semibold">Ascend</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-white">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full relative">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
            >
              <X size={20} />
            </button>
            {navContent}
          </div>
          <div
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-black bg-opacity-50"
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0">
        {navContent}
      </aside>
    </>
  );
}
