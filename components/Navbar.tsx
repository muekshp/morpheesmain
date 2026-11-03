'use client';

import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Settings,
  Shield,
  LogOut,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  onOpenSettings?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Navbar({
  onOpenSettings,
  onToggleMobileMenu,
  isMobileMenuOpen,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const notifications = [
    {
      id: 1,
      title: 'Retail market forecast completed',
      time: '12 min ago',
      desc: '1.2M agents reached 92% consensus on pricing elasticity.',
      unread: true,
    },
    {
      id: 2,
      title: 'Agent cluster updated to v4.2',
      time: '1 hour ago',
      desc: 'Monte Carlo simulation accuracy boosted by 14%.',
      unread: true,
    },
    {
      id: 3,
      title: 'Supply chain stress test archived',
      time: '2 days ago',
      desc: 'Exported report downloaded in PDF format.',
      unread: false,
    },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`relative z-30 h-12 w-full border-b backdrop-blur-md px-5 flex items-center justify-between select-none transition-colors duration-200 ${
        isDark
          ? 'border-white/[0.07] bg-[#090b0e]/85 text-white'
          : 'border-slate-200 bg-white/90 text-slate-900 shadow-sm'
      }`}
    >
      {/* Left: Brand Logo & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className={`md:hidden p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2 cursor-pointer group">
          {/* Custom 8-pointed starburst / agent icon */}
          <div
            className={`relative flex items-center justify-center w-7 h-7 transition-transform group-hover:rotate-45 duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold text-[17px] tracking-tight font-sans ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              MORPH
            </span>
            <span className={`font-extrabold text-[17px] tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>AI</span>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle, Notifications & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Dark / Light Theme Switcher */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isDark
              ? 'bg-white/[0.05] border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 shadow-sm'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={`relative p-2 rounded-lg transition-colors focus:outline-none ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-current" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-xl border shadow-2xl p-3 text-sm z-50 ${
                isDark
                  ? 'bg-[#12161d] border-white/10 shadow-black/80 text-white'
                  : 'bg-white border-slate-200 shadow-slate-300 text-slate-800'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 mb-2 border-b ${
                  isDark ? 'border-white/5' : 'border-slate-100'
                }`}
              >
                <span
                  className={`font-semibold text-xs tracking-wider uppercase ${
                    isDark ? 'text-zinc-200' : 'text-slate-700'
                  }`}
                >
                  Notifications
                </span>
                <button
                  onClick={() => setUnreadNotifications(0)}
                  className={`text-xs transition-colors ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg transition-colors border cursor-pointer ${
                      isDark
                        ? 'bg-white/[0.03] hover:bg-white/[0.06] border-transparent hover:border-white/5'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-zinc-400">{n.time}</span>
                    </div>
                    <p
                      className={`text-[11px] mt-1 leading-relaxed ${
                        isDark ? 'text-zinc-400' : 'text-slate-600'
                      }`}
                    >
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full transition-all text-sm group ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
            }`}
          >
            {/* Avatar Circle with initials "MP" */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs border shadow-sm ${
                isDark
                  ? 'bg-[#272e3b] text-white border-white/10'
                  : 'bg-slate-800 text-white border-slate-300'
              }`}
            >
              MP
            </div>
            <span
              className={`font-normal text-xs hidden sm:inline ${
                isDark ? 'text-zinc-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-950'
              }`}
            >
              Mukesh Prajapat
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isDark ? 'text-zinc-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
              }`}
            />
          </button>

          {/* User Profile Dropdown */}
          {showUserMenu && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl py-1.5 text-sm z-50 ${
                isDark
                  ? 'bg-[#12161d] border-white/10 shadow-black/80'
                  : 'bg-white border-slate-200 shadow-slate-300'
              }`}
            >
              <div className={`px-3.5 py-2.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Mukesh Prajapat
                </p>
                <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  mukesh9587826831@gmail.com
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Pro Tier • 1.2M Agents
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings?.();
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    alert('Data Privacy & Security: All simulation graphs are encrypted and isolated.');
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  Privacy & Data Security
                </button>
              </div>

              <div className={`pt-1 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 flex items-center gap-2.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
