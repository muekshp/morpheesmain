'use client';

import React from 'react';
import { Tag, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface PricingViewProps {
  onSelectPlan: (plan: string) => void;
}

export default function PricingView({ onSelectPlan }: PricingViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      desc: 'Ideal for prototyping and evaluating simple scenario models.',
      features: [
        'Up to 100K autonomous agents',
        '3 simulations per day',
        'PDF & Markdown text parsing',
        'Standard Monte Carlo analysis',
        'Community support',
      ],
      cta: 'Current Plan',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per month',
      desc: 'For high-growth businesses and strategy teams demanding real-time multi-agent depth.',
      features: [
        'Up to 2.5M autonomous agents',
        'Unlimited simulations',
        'Full PDF, Table & CSV OCR extraction',
        '10,000 Monte Carlo stochastic cycles',
        'Competitor response latency prediction',
        'Export Markdown, PDF & JSON reports',
        'Priority agent swarm cluster',
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
    },
    {
      name: 'Enterprise Swarm',
      price: '$299',
      period: 'per month',
      desc: 'Dedicated private infrastructure for Fortune 500 decision intelligence.',
      features: [
        'Up to 10M+ autonomous agent swarms',
        'Custom domain-specific persona weights',
        'On-premise / VPC cloud deployment',
        'ERP & Snowflake pipeline webhooks',
        'SLA guaranteed execution under 10s',
        'Dedicated ML simulation engineer',
      ],
      cta: 'Contact Enterprise',
      highlight: false,
    },
  ];

  return (
    <div
      className={`h-full overflow-y-auto p-6 sm:p-10 space-y-8 max-w-5xl mx-auto transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isDark
              ? 'text-white bg-white/10 border-white/15'
              : 'text-slate-800 bg-slate-100 border-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Predictive Decision Intelligence
        </div>
        <h1
          className={`text-3xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}
        >
          Simple, Transparent Pricing
        </h1>
        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}
        >
          Scale your scenario simulations from individual tactical decisions to enterprise-wide market stress testing.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl flex flex-col justify-between transition-all relative border ${
              p.highlight
                ? isDark
                  ? 'bg-gradient-to-b from-[#181f2c] to-[#10141b] border-2 border-white/30 shadow-2xl shadow-white/5 ring-1 ring-white/20'
                  : 'bg-white border-2 border-slate-900 shadow-xl ring-1 ring-slate-900/10'
                : isDark
                ? 'bg-[#12161f]/80 border-white/10'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {p.highlight && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-md ${
                  isDark ? 'bg-white text-zinc-950' : 'bg-slate-900 text-white'
                }`}
              >
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3
                  className={`text-base font-bold ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {p.name}
                </h3>
                <p
                  className={`text-[11px] mt-1 min-h-[32px] ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}
                >
                  {p.desc}
                </p>
              </div>

              <div className="flex items-baseline gap-1 pt-1">
                <span
                  className={`text-3xl font-extrabold ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {p.price}
                </span>
                <span
                  className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}
                >
                  /{p.period}
                </span>
              </div>

              <div
                className={`pt-3 border-t space-y-2.5 ${
                  isDark ? 'border-white/5' : 'border-slate-100'
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-semibold tracking-wider ${
                    isDark ? 'text-zinc-400' : 'text-slate-500'
                  }`}
                >
                  Included Capabilities:
                </span>
                <ul className="space-y-2">
                  {p.features.map((feat, fi) => (
                    <li
                      key={fi}
                      className={`flex items-start gap-2 text-xs ${
                        isDark ? 'text-zinc-300' : 'text-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onSelectPlan(p.name)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                  p.highlight
                    ? isDark
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-md'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                    : isDark
                    ? 'bg-white/[0.08] hover:bg-white/15 text-white border border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
