'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, CloudSun } from 'lucide-react';

export default function WelcomeBanner() {
  const [greeting, setGreeting] = useState({ text: 'Welcome, Initiate', icon: Sparkles });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    
    if (hour < 5) {
      setGreeting({ text: 'The Witching Hour', icon: Moon });
    } else if (hour < 12) {
      setGreeting({ text: 'Morning Rise', icon: CloudSun });
    } else if (hour < 18) {
      setGreeting({ text: 'Sun High', icon: Sun });
    } else {
      setGreeting({ text: 'Moon High', icon: Moon });
    }
  }, []);

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) return null; 
  
  const Icon = greeting.icon;

  return (
    <div className="w-full max-w-lg mx-auto mb-8 mt-4 px-4">
      <div className="relative overflow-hidden flex items-center justify-center gap-3 py-3 px-8 rounded-full bg-gradient-to-r from-slate-900/80 via-purple-900/40 to-slate-900/80 border border-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)] backdrop-blur-md ">
    
        <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />

        <Icon className="w-5 h-5 text-purple-400 animate-pulse" />
        
        <span className="font-serif text-lg md:text-xl font-medium tracking-wide text-slate-200">
          {greeting.text}
        </span>
        
        <Icon className="w-5 h-5 text-purple-400 transform scale-x-[-1] animate-pulse" />
      </div>
    </div>
  );
    

}