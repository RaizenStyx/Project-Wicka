'use client'

import { lightCandleInSlot, lightCandleById } from '@/app/actions/altar-actions' // Ensure this exists
import { Flame } from 'lucide-react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

export default function AltarCandle({ item, details }: { item: any, details: any }) {
  const [loading, setLoading] = useState(false)
  const [isLit, setIsLit] = useState(false) // Simple local state for now

  // Use the fetched color, or fallback to white
  const candleColor = details?.hex_code || '#e2e8f0'; 

  // --- TIME LOGIC ---
  useEffect(() => {
    if (!item.active_since) {
        setIsLit(false);
        return;
    }

    const startTime = new Date(item.active_since).getTime();
    const now = new Date().getTime();
    const sixHoursMs = 6 * 60 * 60 * 1000; // 6 Hours

    // If start time was valid and it hasn't been 6 hours yet -> It is lit.
    if (startTime > 0 && (now - startTime < sixHoursMs)) {
        setIsLit(true);
    } else {
        setIsLit(false);
    }
  }, [item.active_since]); // Re-run when DB updates

  const handleLight = async () => {
     if (isLit) return; 
     
     setLoading(true);
     
     if (item.slot) {
         // Ritual Mode: Light by Slot
         await lightCandleInSlot(item.slot);
     } else {
         // Free Mode: Light by ID (THE FIX)
         await lightCandleById(item.id);
     }
     
     setLoading(false);
  }
  

  return (
    <div className="relative group cursor-pointer" onClick={handleLight}>
      {/* Candle Body */}
      <div 
        className="w-8 h-24 rounded-sm shadow-lg border-x border-black/10 relative overflow-hidden"
        style={{ backgroundColor: candleColor }}
      >
         {/* Wax Gradient Overlay for 3D roundness */}
         <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
         
         {/* Top "Pool" of wax */}
         <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-full blur-[1px]" />
      </div>

      {/* Wick */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-black/60" />

      {/* Flame Logic */}
      <div className={clsx("absolute -top-8 left-1/2 -translate-x-1/2 transition-opacity duration-500", isLit ? "opacity-100" : "opacity-0")}>
         <div className="relative">
            <Flame className="w-8 h-8 text-orange-400 animate-pulse fill-orange-500" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500 blur-md animate-pulse" />
         </div>
      </div>
      
      {/* Hover Label */}
      <div className="absolute -top-45 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
        {details?.name || 'Candle'}
      </div>
    </div>
  )
}