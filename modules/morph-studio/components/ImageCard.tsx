'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { SareeItem } from '../types';

interface ImageCardProps {
  saree: SareeItem;
  onTryOn: (saree: SareeItem) => void;
}

export default function ImageCard({ saree, onTryOn }: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isDataUrl = saree.imageUrl.startsWith('data:');

  return (
    <div
      onClick={() => onTryOn(saree)}
      className="group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900/90 shadow-sm hover:shadow-2xl transition-all duration-300 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 select-none flex flex-col"
    >
      {/* 3:4 Aspect Ratio Container matching high-end catalog */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-200/50 dark:bg-neutral-800/50">
        {/* Shimmer skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-pulse" />
        )}

        <Image
          src={saree.imageUrl}
          alt={saree.name || 'Ethnic Wear Look'}
          fill
          unoptimized={isDataUrl}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          referrerPolicy="no-referrer"
          priority={false}
        />

        {/* Soft bottom vignette overlay for pill button contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Floating "Try it on" Pill Button (Centered at bottom, exact replica of Image 2) */}
        <div className="absolute bottom-3.5 sm:bottom-4 inset-x-0 flex justify-center px-3 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTryOn(saree);
            }}
            className="group/btn inline-flex items-center gap-1.5 sm:gap-2 bg-white/95 hover:bg-white text-[#1a73e8] dark:text-[#1a73e8] font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 transform group-hover:scale-105 active:scale-95 border border-white/60"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1a73e8] fill-[#1a73e8]" />
            <span className="tracking-tight font-medium">Try it on</span>
          </button>
        </div>
      </div>
    </div>
  );
}
