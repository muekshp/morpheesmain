'use client';

import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does Morph AI generate 1.2M agents?',
      a: 'Morph AI uses high-throughput vector state discretization. Rather than running 1.2M separate heavy LLMs, it constructs a dense Markov-tensor network of heterogeneous persona weights governed by Gemini 3.8 Flash coordinator nodes.',
    },
    {
      q: 'What types of reports can I upload?',
      a: 'Any text-based document including PDF industry analyses, market research decks, financial earnings transcripts, customer churn logs, or Markdown specs.',
    },
    {
      q: 'Can I export the simulation for presentations?',
      a: 'Yes, full reports can be downloaded in structured Markdown or printed/saved as PDF, containing executive summaries, quantitative metrics, and strategic priority playbooks.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col border transition-colors ${
          isDark
            ? 'bg-[#0e1218] border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isDark ? 'border-white/[0.08] bg-[#12161f]/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isDark
                  ? 'bg-white/10 border-white/15 text-white'
                  : 'bg-slate-900 border-slate-900 text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Help & Support
              </h3>
              <p
                className={`text-[11px] ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Frequently asked questions and technical assistance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FAQs */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[60vh]">
          {faqs.map((f, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border space-y-1.5 ${
                isDark
                  ? 'bg-white/[0.03] border-white/5'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {f.q}
              </h4>
              <p
                className={`leading-relaxed text-[11px] ${
                  isDark ? 'text-zinc-300' : 'text-slate-600'
                }`}
              >
                {f.a}
              </p>
            </div>
          ))}

          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark
                ? 'bg-gradient-to-r from-white/[0.04] to-white/[0.02] border-white/10'
                : 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Need Enterprise Simulation Advice?
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Talk to our quantitative modeling research team.
              </span>
            </div>
            <a
              href="mailto:support@morphai.internal"
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                isDark
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Contact
            </a>
          </div>
        </div>

        <div
          className={`p-4 border-t flex justify-end ${
            isDark ? 'border-white/[0.08] bg-[#12161f]/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-white/[0.08] text-white hover:bg-white/15'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
