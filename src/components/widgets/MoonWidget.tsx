'use client';

import React, { useEffect, useState } from 'react';
import WidgetFrame from './WidgetFrame'; // Assuming this exists in your project
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getMoonData, MoonData } from '@/app/lib/astrology';


const MoonWidget = () => {
  const [data, setData] = useState<MoonData | null>(null);

  useEffect(() => {
    // client-side calculation to ensure timezone consistency
    setData(getMoonData(new Date()));
  }, []);

  // Show a loading skeleton while calculating (prevents hydration mismatch)
  if (!data) return (
    <WidgetFrame title="Current Moon" className="animate-pulse bg-slate-900/50 border-white/10 h-[200px]">...loading </WidgetFrame>
  );

  const { phaseName, illumination, zodiacSign, emoji } = data;
  const isFullMoon = phaseName === "Full Moon";
  const isNewMoon = phaseName === "New Moon";

  return (
    <WidgetFrame title="Current Moon" className="bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/20">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4 shadow-lg relative overflow-hidden group">
      
        {/* Glow Effect for Full Moon */}
        {isFullMoon && (
          <div className="absolute inset-0 bg-purple-500/10 blur-xl animate-pulse" />
        )}

        {/* Header */}
        <h3 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Current Phase
        </h3>

        {/* Main Visual */}
        <div className="relative z-10">
            <Link href={'/moon'} className="block transition-transform duration-500 hover:scale-110"> 
                <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    {emoji}
                </div>
            </Link>
        </div>

        {/* Text Info */}
        <div className="space-y-1 relative z-10">
          <div className="text-xl font-serif text-slate-100 font-medium">
            {phaseName}
          </div>
          
          {/* New Feature: "in Zodiac" */}
          <div className="text-sm font-medium text-purple-300">
            in {zodiacSign}
          </div>

          <div className="text-xs text-slate-500">
            {illumination}% Illuminated
          </div>
        </div>

        {/* Contextual Witchy Tip */}
        <div className="pt-4 border-t border-slate-800/50 mt-4 relative z-10">
          <p className="text-xs text-slate-400 italic">
            {isFullMoon 
              ? "Charge your crystals tonight." 
              : isNewMoon 
              ? "Set intentions for the cycle."
              : `Focus on ${zodiacSign} energy.`}
          </p>
        </div>
      </div>
    </WidgetFrame>
  );
};

export default MoonWidget;