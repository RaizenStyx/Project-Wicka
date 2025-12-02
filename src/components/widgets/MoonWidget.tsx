import React from 'react';
import WidgetFrame from './WidgetFrame';
import { Sparkles } from 'lucide-react';
import { Moon } from 'lunarphase-js'
import Link from 'next/link';

const MoonWidget = () => {
  // 1. Get current date
  const now = new Date();

  // 2. Calculate Phase Data (Instant, no API fetch)
  const phase = Moon.lunarPhase(now);
  const phaseEmoji = Moon.lunarPhaseEmoji(now);
  
  // 2. CALCULATE ILLUMINATION MANUALLY
  // The library's 'Age' is not Illumination. We need a math helper.
  const getMoonIllumination = (date: Date) => {
    const synodic = 29.53058867; // Length of a lunar cycle in days
    const msPerDay = 86400000;
    const baseDate = new Date('2000-01-06T18:14:00'); // Known New Moon
    
    // Calculate days passed
    const diff = date.getTime() - baseDate.getTime();
    const daysPassed = diff / msPerDay;
    
    // Where are we in the cycle? (0 to 29.53)
    const age = daysPassed % synodic;
    
    // Convert age to illumination percentage (0 to 100)
    // Formula: (1 - cos(angle)) / 2
    // We map the age (0 to 29.5) to an angle (0 to 2PI)
    const angle = (age / synodic) * 2 * Math.PI;
    const illumination = (1 - Math.cos(angle)) / 2;
    
    return (illumination * 100).toFixed(0);
  };

  const illumination = getMoonIllumination(now);
  
  // "Witchy" logic: Is it a powerful time?
  const isFullMoon = phase === 'Full';
  const isNewMoon = phase === 'New';

  return (
    // We override the background here for that special gradient look
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
      <div className="text-6xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform duration-500 cursor-pointer">
        <Link href={'/moon'}> {phaseEmoji}</Link>
      </div>

      {/* Text Info */}
      <div className="space-y-1">
        <div className="text-xl font-serif text-slate-100 font-medium">
          {phase}
        </div>
        <div className="text-sm text-slate-500">
          {illumination}% Illuminated
        </div>
      </div>

      {/* Contextual Witchy Tip */}
      <div className="pt-4 border-t border-slate-800/50 mt-4">
        <p className="text-xs text-purple-300 italic">
          {isFullMoon 
            ? "Energy is high. Perfect for charging crystals & manifestation." 
            : isNewMoon 
            ? "A time for new beginnings. Set your intentions."
            : "Focus on daily rituals and grounding."}
        </p>
      </div>
    </div>
    </WidgetFrame>
  );
};

export default MoonWidget;