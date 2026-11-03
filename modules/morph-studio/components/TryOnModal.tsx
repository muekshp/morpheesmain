'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  Camera,
  Sparkles,
  Download,
  Laptop,
  Eye,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  User,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import { SareeItem, TryOnState } from '../types';
import { BASE_MODEL_IMAGE, processVirtualTryOn } from '../services/tryOnService';
import { generateVirtualTryOnComposite } from '../services/fabricDrapingEngine';
import { optimizeImageForUpload, optimizeBase64Image } from '../services/imageUtils';
import CameraCaptureView from './CameraCaptureView';

interface TryOnModalProps {
  isOpen: boolean;
  saree: SareeItem | null;
  tryOnState: TryOnState;
  progressText: string;
  progressPercent: number;
  onClose: () => void;
  onStartTryOn: () => void;
  onReset: () => void;
}

export default function TryOnModal({
  isOpen,
  saree,
  onClose,
}: TryOnModalProps) {
  // Modal states
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [tryOnResultPhoto, setTryOnResultPhoto] = useState<string | null>(null);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [generationSource, setGenerationSource] = useState<'gemini-ai' | 'canvas' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !saree) return null;

  const currentSubjectPhoto = activePhoto || BASE_MODEL_IMAGE;
  const isCompleted = !!tryOnResultPhoto;
  const isUserPhoto = !!activePhoto;

  // Handler for uploading from computer
  const handleComputerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Read file as Data URL immediately
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawUrl = event.target?.result as string;
      if (!rawUrl) return;

      // 2. Set active photo immediately so user sees their photo right away
      setActivePhoto(rawUrl);
      setTryOnResultPhoto(null);
      setShowOptionsSheet(false);
      setIsProcessing(true);
      setProgressPercent(15);
      setProgressStep('Photo uploaded! Preparing virtual drape...');

      // 3. Optimize image asynchronously for AI synthesis
      try {
        const optimized = await optimizeImageForUpload(file, 800);
        await runVirtualTryOn(optimized || rawUrl);
      } catch (err) {
        console.warn('Optimization error, using raw URL:', err);
        await runVirtualTryOn(rawUrl);
      }
    };

    reader.readAsDataURL(file);
    // Reset file input value so user can select the same file again if desired
    e.target.value = '';
  };

  // Handler for camera capture
  const handleCameraPhoto = async (dataUrl: string) => {
    setActivePhoto(dataUrl);
    setTryOnResultPhoto(null);
    setIsCapturingCamera(false);
    setShowOptionsSheet(false);
    setIsProcessing(true);
    setProgressPercent(15);
    setProgressStep('Camera photo captured! Preparing virtual drape...');

    try {
      const optimized = await optimizeBase64Image(dataUrl, 800);
      await runVirtualTryOn(optimized || dataUrl);
    } catch {
      await runVirtualTryOn(dataUrl);
    }
  };

  // Virtual Try-on execution with Gemini AI and seamless Canvas fallback
  // Real Vertex AI Virtual Try-On Execution
  const runVirtualTryOn = async (photoToTryOn: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(20);
    setProgressStep('Analyzing body posture & framing...');

    try {
      setProgressStep('Connecting to Vertex AI Imagen 3 (us-central1)...');
      setProgressPercent(45);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50s timeout

      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhoto: photoToTryOn,
          sareeImageUrl: saree.imageUrl,
          sareeName: saree.name,
          sareeCategory: saree.category,
          accentColor: saree.accentColor,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.image) {
        setProgressStep('AI Virtual try-on generated successfully!');
        setProgressPercent(100);
        await new Promise((r) => setTimeout(r, 400));
        setTryOnResultPhoto(data.image);
        setGenerationSource('gemini-ai');
        try {
          const previous = JSON.parse(localStorage.getItem('morph_tryon_history') || '[]');
          const history = Array.isArray(previous) ? previous : [];
          history.unshift({ id: `${Date.now()}-${saree.id}`, name: saree.name, imageUrl: saree.imageUrl, createdAt: new Date().toISOString() });
          localStorage.setItem('morph_tryon_history', JSON.stringify(history.slice(0, 50)));
        } catch (historyError) {
          console.warn('Could not save try-on history:', historyError);
        }
      } else {
        const errorDetail = data.error || `Vertex AI generation failed (HTTP ${res.status})`;
        console.error('Vertex AI Try-on Error:', errorDetail);
        setTryOnResultPhoto(null);
        setProgressStep('Vertex AI image generation failed.');
        setErrorMessage(errorDetail);
      }
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'Vertex AI Imagen 3 request timed out after 50 seconds.'
        : (err instanceof Error ? err.message : 'Generation failed');
      console.error('Vertex AI generation error:', err);
      setTryOnResultPhoto(null);
      setProgressStep('Vertex AI request failed.');
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgressPercent(100);
    }
  };

  const handleDownloadResult = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tryOnResultPhoto) return;
    const link = document.createElement('a');
    link.href = tryOnResultPhoto;
    link.download = `morph-tryon-${saree.id}.jpg`;
    link.click();
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTryOnResultPhoto(null);
    setShowOriginalComparison(false);
    setShowOptionsSheet(false);
    setActivePhoto(null);
    setGenerationSource(null);
    setErrorMessage(null);
  };

  // Current image to display in viewport
  const displayImage = isCompleted
    ? showOriginalComparison
      ? currentSubjectPhoto
      : tryOnResultPhoto
    : currentSubjectPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Sibling Backdrop - Clicking outside closes modal safely */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Card - Events stop propagation so modal never closes unexpectedly */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[96vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all border border-neutral-200/90 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input for computer upload (inside modal so clicks never bubble to backdrop) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onClick={(e) => e.stopPropagation()}
          onChange={handleComputerUpload}
          className="hidden"
        />

        {/* If Camera is active, show the live Camera Capture View */}
        {isCapturingCamera ? (
          <CameraCaptureView
            onCapture={handleCameraPhoto}
            onCancel={() => setIsCapturingCamera(false)}
            onFallbackUpload={() => {
              setIsCapturingCamera(false);
              fileInputRef.current?.click();
            }}
          />
        ) : (
          <>
            {/* Top Bar with Down Chevron Button & Outfit Pill */}
            <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-100 dark:border-neutral-800/80 shrink-0">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-neutral-200/70 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: saree.accentColor }}
                />
                <span className="truncate max-w-[160px] font-semibold">{saree.name}</span>
              </div>

              <div className="w-8" />
            </div>

            {/* Central Model / User Photo Viewport - Sized to guarantee zero button cutoff */}
            <div className="relative w-full py-2 sm:py-3 px-3 bg-neutral-100/70 dark:bg-neutral-950/60 flex items-center justify-center shrink-0">
              <div className="relative h-[210px] sm:h-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-neutral-200/80 dark:border-neutral-800 bg-neutral-200/60 dark:bg-neutral-900">
                <Image
                  src={displayImage}
                  alt={isCompleted ? `Virtual Try-On: ${saree.name}` : isUserPhoto ? 'Your Uploaded Photo' : 'Model Canvas'}
                  fill
                  unoptimized={displayImage.startsWith('data:')}
                  sizes="(max-width: 640px) 180px, 220px"
                  className={`object-cover transition-all duration-500 ${
                    isProcessing ? 'scale-105 filter blur-xs' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                  priority
                />

                {/* Neural Scanning Animation Overlay during processing */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-blue-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-10 text-white animate-fade-in">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_2s_infinite]" />

                    <div className="w-10 h-10 rounded-full bg-white/95 dark:bg-neutral-900/90 shadow-xl flex items-center justify-center mb-2 animate-spin">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="font-semibold text-[11px] drop-shadow-md mb-2 px-2">{progressStep}</p>
                    <div className="w-36 bg-white/30 h-1.5 rounded-full overflow-hidden backdrop-blur-xs">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                {isUserPhoto && !isCompleted && !isProcessing && (
                  <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Your Photo Uploaded</span>
                  </div>
                )}

                {isCompleted && !isProcessing && (
                  <div className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {showOriginalComparison
                        ? 'Original Photo'
                        : generationSource === 'gemini-ai'
                        ? 'AI Generated Look'
                        : 'Draped Look'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Vertex AI Generation Error Notice */}
            {errorMessage && (
              <div className="mx-3 my-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 text-xs shrink-0 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-[11px] text-red-700 dark:text-red-300">
                      Vertex AI Generation Error
                    </p>
                    <p className="text-[10.5px] mt-1 leading-relaxed text-neutral-800 dark:text-neutral-200 font-mono break-words bg-red-500/5 dark:bg-red-950/40 p-2 rounded-lg border border-red-500/20">
                      {errorMessage}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setErrorMessage(null);
                        runVirtualTryOn(currentSubjectPhoto);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-medium shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Retry Vertex AI Generation</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setErrorMessage(null);
                    }}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs px-1 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions Section - 100% VISIBLE WITH CLEAR PHOTO UPLOAD & CAMERA OPTIONS */}
            <div className="p-3 sm:p-4 bg-white dark:bg-neutral-900 flex flex-col gap-2.5 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
              {!isCompleted ? (
                <>
                  {/* If user clicked 'Try on you' or option selector is active */}
                  {showOptionsSheet ? (
                    <div className="flex flex-col gap-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          Select photo to try on:
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptionsSheet(false);
                          }}
                          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-[11px] underline cursor-pointer"
                        >
                          Back
                        </button>
                      </div>

                      {/* 2 Clear Options: Computer Upload & Camera Capture */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Option 1: Computer Upload */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95 text-white shadow-md transition-all group cursor-pointer disabled:opacity-60"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-transform">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">Upload Computer</span>
                          <span className="text-[10px] text-white/80">From gallery</span>
                        </button>

                        {/* Option 2: Live Camera */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCapturingCamera(true);
                          }}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-95 text-white shadow-md transition-all group cursor-pointer border border-neutral-700/60 disabled:opacity-60"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-500/25 text-purple-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">Take with Camera</span>
                          <span className="text-[10px] text-neutral-300">Live selfie</span>
                        </button>
                      </div>

                      {/* Demo Model Fallback */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={(e) => {
                          e.stopPropagation();
                          runVirtualTryOn(BASE_MODEL_IMAGE);
                        }}
                        className="text-center text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-0.5 cursor-pointer disabled:opacity-50"
                      >
                        ⚡ Or try instantly on Demo Model
                      </button>
                    </div>
                  ) : (
                    /* Initial View with Primary 'Try on you' Button (Matching Image 3) */
                    <div className="flex flex-col gap-2">
                      {/* Big prominent 'Try on you' button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOptionsSheet(true);
                        }}
                        className="w-full py-3 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <Sparkles className="w-4 h-4 fill-white/80" />
                        <span>Try on you</span>
                        <ArrowRight className="w-4 h-4 ml-0.5" />
                      </button>

                      {/* Direct Quick-Upload & Camera Buttons directly below */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <Laptop className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload photo</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCapturingCamera(true);
                          }}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-purple-500" />
                          <span>Open camera</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Completed State: Result Controls */
                <div className="flex flex-col gap-2 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Toggle Before / After */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOriginalComparison((prev) => !prev);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium py-2 px-3 rounded-2xl text-xs transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>{showOriginalComparison ? 'Show Try-On' : 'View Original'}</span>
                    </button>

                    {/* Download Look */}
                    <button
                      type="button"
                      onClick={handleDownloadResult}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-2 px-3 rounded-2xl shadow-md text-xs transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Save Look</span>
                    </button>
                  </div>

                  {/* Retake or try another photo */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Laptop className="w-3 h-3" />
                      <span>Upload Another</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCapturingCamera(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Retake Camera</span>
                    </button>
                  </div>

                  {/* Reset & Back to results */}
                  <div className="flex items-center justify-between pt-1 px-1 text-[11px]">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="text-[#1a73e8] dark:text-blue-400 font-medium hover:underline cursor-pointer"
                    >
                      Back to results
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
