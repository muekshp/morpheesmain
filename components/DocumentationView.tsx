'use client';

import React from 'react';
import { BookOpen, Bot, Terminal, FileCode } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function DocumentationView() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`h-full overflow-y-auto p-6 sm:p-10 space-y-8 max-w-4xl mx-auto transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="space-y-2">
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isDark
              ? 'text-white bg-white/10 border-white/15'
              : 'text-slate-800 bg-slate-100 border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Technical Architecture & Guides
        </div>
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}
        >
          MORPH AI Documentation
        </h1>
        <p
          className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}
        >
          Learn how Morph AI parses unstructured documents into high-dimensional agent state machines
          and generates probabilistic forecasts.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: The Multi-Agent Protocol */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isDark
              ? 'bg-[#12161f]/80 border-white/10 text-white'
              : 'bg-white border-slate-200 shadow-sm text-slate-900'
          }`}
        >
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-500" />
            1. Autonomous Multi-Agent Swarm Modeling
          </h3>
          <p
            className={`text-xs leading-relaxed ${
              isDark ? 'text-zinc-300' : 'text-slate-600'
            }`}
          >
            Morph AI instantiates up to millions of autonomous micro-agents. Each agent is seeded
            with a behavioral objective function (e.g. price sensitivity, enterprise risk aversion,
            inventory turnover mandate) extracted directly from your input data and economic models.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Persona Diversity
              </span>
              <span className={`text-[11px] mt-1 block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Demographic, behavioral, and organizational heterogeneity.
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Game-Theoretic Equil.
              </span>
              <span className={`text-[11px] mt-1 block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Agents react recursively to competitor counter-moves.
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Consensus Dynamics
              </span>
              <span className={`text-[11px] mt-1 block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Statistical convergence across millions of parallel interactions.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Document Ingestion */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isDark
              ? 'bg-[#12161f]/80 border-white/10 text-white'
              : 'bg-white border-slate-200 shadow-sm text-slate-900'
          }`}
        >
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-500" />
            2. Supported Ingestion Formats & Data Hygiene
          </h3>
          <p
            className={`text-xs leading-relaxed ${
              isDark ? 'text-zinc-300' : 'text-slate-600'
            }`}
          >
            Our ingestion pipeline accepts PDF (unstructured text & tables), Markdown, plain TXT,
            CSV, and financial models. Sensitive proprietary data is scrubbed client-side prior to
            state initialization.
          </p>
          <ul
            className={`text-xs space-y-1.5 list-disc list-inside ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}
          >
            <li>PDF (Up to 100MB): Executive memos, industry market reports, earnings transcripts</li>
            <li>Markdown / TXT: Product requirement specs, user feedback logs, policy drafts</li>
            <li>CSV / JSON: Churn metrics, transaction logs, supplier lead times</li>
          </ul>
        </div>

        {/* Section 3: REST API & Webhooks */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isDark
              ? 'bg-[#12161f]/80 border-white/10 text-white'
              : 'bg-white border-slate-200 shadow-sm text-slate-900'
          }`}
        >
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-500" />
            3. Automated Simulation API
          </h3>
          <p
            className={`text-xs leading-relaxed ${
              isDark ? 'text-zinc-300' : 'text-slate-600'
            }`}
          >
            Trigger simulations programmatically from your CI/CD or ERP pipelines using the Morph
            REST endpoint:
          </p>
          <div
            className={`p-3 rounded-xl border font-mono text-[11px] overflow-x-auto ${
              isDark
                ? 'bg-black/60 border-white/10 text-zinc-300'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <code>
              {`curl -X POST https://api.morphai.internal/v1/simulate \\
  -H "Authorization: Bearer morph_live_sec_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "report_uri": "s3://reports/Q4_Market_Forecast.pdf",
    "prompt": "Evaluate competitor pricing counter-strike",
    "agent_nodes": 1200000
  }'`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
