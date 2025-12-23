'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, CloudSun, Star } from 'lucide-react';

interface WelcomeBannerProps {
  username?: string | null;
  role?: string | null;
  sign?: string | null;
  planet?: string | null;
}

export default function WelcomeBanner({ username, role, sign, planet }: WelcomeBannerProps) {
  // 1. Store only the raw data (time of day) in state
  const [timeOfDay, setTimeOfDay] = useState<'night' | 'morning' | 'afternoon' | 'evening'>('night');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    
    if (hour < 5) setTimeOfDay('night');
    else if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  if (!mounted) return null; 

  // 2. Derive the Icon and Text from the state
  const getTimeConfig = () => {
    switch(timeOfDay) {
      case 'morning': return { text: 'Morning Rise', Icon: CloudSun };
      case 'afternoon': return { text: 'Sun High', Icon: Sun };
      case 'evening': return { text: 'Moon High', Icon: Moon };
      default: return { text: 'The Witching Hour', Icon: Moon };
    }
  }

  const { text: timeText, Icon: TimeIcon } = getTimeConfig();

  // 3. Fallback logic for the main message
  const mainMessage = sign && planet 
    ? `Welcome, ${username || 'Initiate'}. As a ${sign}, your ruling planet is ${planet}.`
    : `Welcome, ${username || 'Initiate'}. The energies are shifting.`;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 mt-4 px-4">
      <div className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-purple-900/30 to-slate-900/90 border border-purple-500/20 shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)] backdrop-blur-md">
    
        <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />

        {/* Left Side: Personalization */}
        <div className="flex items-center gap-3 z-10 text-center md:text-left">
           {sign ? <Star className="hidden md:block w-5 h-5 text-purple-400 shrink-0" /> : <Sparkles className="hidden md:block w-5 h-5 text-purple-400 shrink-0" />}
           
           <div className="flex flex-col">
             <span className="font-serif text-lg font-medium tracking-wide text-slate-200">
               {mainMessage}
             </span>
             {role && role !== 'initiate' && (
                <span className="text-xs uppercase tracking-widest text-purple-400/80 font-bold">
                  {role} of Nyxus
                </span>
             )}
           </div>
        </div>

        {/* Right Side: Time Indicator */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/50 border border-white/5 shrink-0">
           <TimeIcon className="w-4 h-4 text-amber-200/80" />
           <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
             {timeText}
           </span>
        </div>
        
      </div>
    </div>
  );
}