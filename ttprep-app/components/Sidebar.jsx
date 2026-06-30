'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { useState } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'practice', label: 'Practice Tests', icon: FileText, href: '/practice-test' },
  { id: 'vocab', label: 'Vocab Builder', icon: Layers, href: '/vocab-builder' },
  { id: 'classes', label: 'Classes', icon: GraduationCap, href: '/classes' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700">
          <span className="text-base font-bold text-white">A</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Ascend</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2">
          <Flame size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">14-day streak</span>
        </div>
        <div className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white">
            AK
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Aisha Karimova</p>
            <p className="text-xs text-slate-400">Student</p>
          </div>
          <Settings size={16} className="shrink-0 text-slate-400" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
            A
          </div>
          <span className="font-semibold text-white">Ascend</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-white">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="relative h-full w-72">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-4 z-10 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            {navContent}
          </div>
          <div onClick={() => setMobileOpen(false)} className="flex-1 bg-black/50" />
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:flex">{navContent}</aside>
    </>
  );
}
