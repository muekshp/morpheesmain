'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, SwitchCamera, AlertCircle, Upload } from 'lucide-react';

interface CameraCaptureViewProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
  onFallbackUpload: () => void;
}

export default function CameraCaptureView({
  onCapture,
  onCancel,
  onFallbackUpload,
}: CameraCaptureViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraSession, setCameraSession] = useState(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera is not supported on this browser or device.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isCancelled) {
              videoRef.current?.play().catch(() => {});
              setIsReady(true);
            }
          };
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const error = err as Error;
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setCameraError(
              'Camera permission was denied. Please allow camera access in your browser or upload a photo.'
            );
          } else {
            setCameraError(
              'Unable to access camera. Please check your camera permissions or upload an image from your computer.'
            );
          }
        }
      }
    }

    initCamera();

    return () => {
      isCancelled = true;
      stopStream();
    };
  }, [facingMode, cameraSession, stopStream]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front facing for natural selfie feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
    stopStream();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCameraSession((prev) => prev + 1);
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[460px] bg-neutral-950 flex flex-col items-center justify-between p-4 text-white overflow-hidden select-none">
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between z-20">
        <button
          type="button"
          onClick={() => {
            stopStream();
            onCancel();
          }}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs sm:text-sm font-semibold tracking-wide bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {capturedPhoto ? 'Review Photo' : 'Live Camera'}
        </span>

        {!capturedPhoto && !cameraError && (
          <button
            type="button"
            onClick={toggleCamera}
            title="Switch Camera"
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 text-white"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        )}
        {(capturedPhoto || cameraError) && <div className="w-10 h-10" />}
      </div>

      {/* Main Viewport */}
      <div className="relative w-full flex-1 flex items-center justify-center my-3 overflow-hidden rounded-2xl bg-neutral-900 border border-white/10">
        {capturedPhoto ? (
          // Captured Snapshot Preview
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedPhoto}
            alt="Captured user selfie"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : cameraError ? (
          // Camera Access Error State with Fallback to File Upload
          <div className="p-6 text-center max-w-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold mb-1">Camera Not Available</h4>
            <p className="text-xs text-neutral-300 mb-5 leading-relaxed">{cameraError}</p>
            <button
              type="button"
              onClick={() => {
                stopStream();
                onFallbackUpload();
              }}
              className="inline-flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload from Computer Instead</span>
            </button>
          </div>
        ) : (
          // Live Video Stream with Human Outline Guide
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isReady ? 'opacity-100' : 'opacity-0'
              } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 gap-2">
                <RefreshCw className="w-7 h-7 text-blue-400 animate-spin" />
                <span className="text-xs text-neutral-300">Starting camera preview...</span>
              </div>
            )}

            {/* Subtle Human Framing Overlay Guide */}
            {isReady && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-white/40 rounded-full mb-8 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center">
                  <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                    Position your face & shoulders
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Shutter & Action Controls */}
      <div className="w-full pb-2 pt-1 flex items-center justify-center gap-4 z-20">
        {capturedPhoto ? (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 max-w-[150px] inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs sm:text-sm py-3 px-4 rounded-full border border-white/10 transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmPhoto}
              className="flex-1 max-w-[180px] inline-flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs sm:text-sm py-3 px-5 rounded-full shadow-lg transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Use This Photo</span>
            </button>
          </>
        ) : !cameraError ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={!isReady}
              title="Capture Photo"
              className="w-16 h-16 rounded-full border-4 border-white p-1 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-6 h-6 text-neutral-900" />
              </div>
            </button>
            <span className="text-[11px] text-neutral-400">Tap to capture</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
