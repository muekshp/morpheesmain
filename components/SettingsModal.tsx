'use client';

import React, { useState } from 'react';
import { X, Settings, CheckCircle2, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dataRetention, setDataRetention] = useState('ephemeral');
  const [concurrency, setConcurrency] = useState('high');
  const [saved, setSaved] = useState(false);

  const [serviceAccountInput, setServiceAccountInput] = useState('');
  const [isSavingSA, setIsSavingSA] = useState(false);
  const [serviceAccountStatus, setServiceAccountStatus] = useState('Ready to connect');

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const handleSaveServiceAccount = async () => {
    if (!serviceAccountInput.trim()) return;
    setIsSavingSA(true);
    setServiceAccountStatus('Connecting...');
    try {
      const res = await fetch('/api/save-service-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonContent: serviceAccountInput }),
      });
      const data = await res.json();
      if (data.success) {
        setServiceAccountStatus(`Connected! Project: ${data.projectId}`);
        setServiceAccountInput('');
      } else {
        setServiceAccountStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setServiceAccountStatus(`Error: ${err.message || 'Failed'}`);
    } finally {
      setIsSavingSA(false);
    }
  };

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
              <Settings className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Simulation Engine Settings
              </h3>
              <p
                className={`text-[11px] ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Manage agent compute and privacy options
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Privacy & Storage */}
          <div className="space-y-2">
            <label
              className={`font-semibold block ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Document & Data Privacy Policy
            </label>
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="retention"
                  value="ephemeral"
                  checked={dataRetention === 'ephemeral'}
                  onChange={() => setDataRetention('ephemeral')}
                  className={isDark ? 'accent-white' : 'accent-slate-900'}
                />
                <div>
                  <span
                    className={`font-medium block ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Zero-Data Retention (Ephemeral)
                  </span>
                  <span
                    className={`text-[10px] ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}
                  >
                    Reports and agent dialogue logs are wiped immediately after simulation completion.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="retention"
                  value="vault"
                  checked={dataRetention === 'vault'}
                  onChange={() => setDataRetention('vault')}
                  className={isDark ? 'accent-white' : 'accent-slate-900'}
                />
                <div>
                  <span
                    className={`font-medium block ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Encrypted Team Vault (30 Days)
                  </span>
                  <span
                    className={`text-[10px] ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}
                  >
                    Retain simulation branches for team replay and time-series variance analysis.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Engine Parameters */}
          <div
            className={`space-y-2 pt-2 border-t ${
              isDark ? 'border-white/5' : 'border-slate-100'
            }`}
          >
            <label
              className={`font-semibold block ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Agent Swarm Concurrency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['standard', 'high', 'ultra'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConcurrency(lvl)}
                  className={`p-2.5 rounded-xl border text-center uppercase tracking-wider text-[10px] font-bold transition-all ${
                    concurrency === lvl
                      ? isDark
                        ? 'bg-white/15 border-white text-white'
                        : 'bg-slate-900 border-slate-900 text-white'
                      : isDark
                      ? 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* User profile info */}
          <div
            className={`p-3 rounded-xl border space-y-1 ${
              isDark
                ? 'bg-white/[0.03] border-white/5'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-semibold ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Active Account
            </span>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Mukesh Prajapat
            </p>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Pro License • Unlimited 1.2M Agent Simulations
            </p>
          </div>

          {/* GCP Service Account JSON Key Configuration */}
          <div
            className={`space-y-2 pt-2 border-t ${
              isDark ? 'border-white/5' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`font-semibold block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                🔑 GCP Service Account JSON Key
              </label>
              <span className="text-[10px] text-emerald-500 font-medium">
                {serviceAccountStatus}
              </span>
            </div>
            <p className={`text-[10.5vpx] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Paste your downloaded service account JSON content here to enable unlimited Vertex AI virtual try-on without quota limits.
            </p>
            <textarea
              rows={4}
              value={serviceAccountInput}
              onChange={(e) => setServiceAccountInput(e.target.value)}
              placeholder={`{\n  "type": "service_account",\n  "project_id": "apniapi",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "..."\n}`}
              className={`w-full p-2.5 rounded-xl text-[10px] font-mono border resize-none focus:outline-none transition-colors ${
                isDark
                  ? 'bg-black/40 border-white/10 text-white placeholder-zinc-600 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600'
              }`}
            />
            <button
              type="button"
              onClick={handleSaveServiceAccount}
              disabled={isSavingSA || !serviceAccountInput.trim()}
              className="w-full py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSavingSA ? 'Connecting...' : 'Connect Service Account Key'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between ${
            isDark ? 'border-white/[0.08] bg-[#12161f]/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
