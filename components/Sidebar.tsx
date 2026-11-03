'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  CreditCard,
  Settings,
  TrendingUp,
  Shirt,
  Gem,
  Footprints,
  BriefcaseBusiness,
  Watch,
  Clock3,
  Gift,
  House,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const API_CREDITS_USED = 2450;
const API_CREDITS_TOTAL = 5000;

export default function Sidebar({
  currentTab,
  onSelectTab,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const navGroups = [
    [{ id: 'morph-studio', label: 'Studio', icon: Sparkles }],
    [
      { id: 'try-on-saree', label: 'Try On Saree', icon: Shirt },
      { id: 'try-on-kurti', label: 'Try On Kurti', icon: Shirt },
      { id: 'try-on-lehenga', label: 'Try On Lehenga', icon: Gem },
      { id: 'try-on-western', label: 'Try On Western Wear', icon: Shirt },
      { id: 'try-on-men', label: 'Try On Mens Wear', icon: Shirt },
      { id: 'try-on-footwear', label: 'Try On Footwear', icon: Footprints },
      { id: 'try-on-jewellery', label: 'Try On Jewellery', icon: Gem },
      { id: 'try-on-accessories', label: 'Try On Accessories', icon: BriefcaseBusiness },
    ],
    [
      { id: 'my-uploads', label: 'My Uploads', icon: House },
      { id: 'try-on-history', label: 'Try-On History', icon: Clock3 },
      { id: 'product-catalog', label: 'Product Catalog', icon: Gift },
      { id: 'api-integration', label: 'API Integration', icon: Watch },
      { id: 'documentation', label: 'Documentation', icon: BookOpen },
      { id: 'usage-billing', label: 'Usage & Billing', icon: CreditCard },
    ],
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile?.();
  };

  const creditPercent = Math.round((API_CREDITS_USED / API_CREDITS_TOTAL) * 100);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col h-full border-r transition-all duration-300 md:relative md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          isDark
            ? 'border-white/[0.07] bg-[#0f1117]'
            : 'border-slate-200 bg-white shadow-sm'
        }`}
      >
        {/* Nav Items */}
        <nav className="flex-1 px-4 pt-4 space-y-2 overflow-y-auto">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={groupIndex > 0 ? 'border-t border-slate-100 pt-2' : ''}>
              {group.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all text-left ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-violet-50 text-violet-700 border border-violet-100'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? isDark ? 'text-blue-400' : 'text-violet-600'
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
                );
              })}
            </div>
          ))}

          {/* Settings separate */}
          <button
            onClick={() => { onOpenSettings(); onCloseMobile?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span>Settings</span>
          </button>
        </nav>

        {/* API Credits Footer */}
        <div className={`px-4 py-4 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              API Credits
            </span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {API_CREDITS_USED.toLocaleString()}
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              / {API_CREDITS_TOTAL.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
          <button
            onClick={() => handleNavClick('usage-billing')}
            className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold border transition-all ${
              isDark
                ? 'border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400'
                : 'border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            Upgrade Plan
          </button>
        </div>
      </aside>
    </>
  );
}
