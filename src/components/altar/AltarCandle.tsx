'use client'

import { lightCandle } from '@/app/actions/altar-actions'
import { Flame } from 'lucide-react'
import { useState } from 'react'

interface AltarItemProps {
  id: string
  active_since: string
  duration_minutes: number
  position_x: number
  position_y: number
}

export default function AltarCandle({ item }: { item: AltarItemProps }) {
  const [loading, setLoading] = useState(false)

  // 1. Calculate Burn Percentage
  const startTime = new Date(item.active_since).getTime()
  const now = new Date().getTime()
  const elapsedMs = now - startTime
  const durationMs = item.duration_minutes * 60 * 1000
  
  // Math: What % of the candle is left? (Clamped between 0 and 100)
  let percentageLeft = 100 - ((elapsedMs / durationMs) * 100)
  if (percentageLeft < 0) percentageLeft = 0
  if (percentageLeft > 100) percentageLeft = 100

  const isBurnedOut = percentageLeft <= 0

  const handleLight = async () => {
    setLoading(true)
    await lightCandle()
    setLoading(false)
  }

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center group"
      style={{ 
        left: `${item.position_x}%`, 
        top: `${item.position_y}%`,
        width: '80px', // Candle Width
        height: '200px' // Max Candle Height
      }}
    >
      
      {/* --- FLAME AREA --- */}
      <div className="relative w-full flex justify-center h-10 -mb-1 z-10">
        {!isBurnedOut && (
          <div className="relative">
            <Flame className="absolute left-1/2 -translate-x-1/2 w-6 h-6 text-orange-400 animate-pulse z-20" />
             {/* Core Flame */}
             <div className="w-4 h-8 bg-orange-400 rounded-full blur-[2px] animate-pulse absolute bottom-0 left-1/2 -translate-x-1/2" />
             {/* Outer Glow */}
             <div className="w-8 h-12 bg-orange-500/30 rounded-full blur-xl animate-bounce absolute bottom-0 left-1/2 -translate-x-1/2" />
             {/* Inner White Hot */}
             <div className="w-2 h-4 bg-white rounded-full blur-[1px] absolute bottom-1 left-1/2 -translate-x-1/2" />
          </div>
        )}
      </div>

      {/* --- WAX BODY --- */}
      <div className="w-16 bg-slate-900/20 rounded-b-lg relative flex flex-col justify-end overflow-visible">
          {/* This div is the actual wax. Height is dynamic. */}
          <div 
            className="w-full bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg shadow-lg relative transition-all duration-1000 ease-in-out border-x border-amber-300/50"
            style={{ height: `${percentageLeft}%`, minHeight: '10px' }}
          >
             {/* Wick */}
             <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-black/50" />
             
             {/* Dripping Wax Effect (CSS decoration) */}
             <div className="absolute top-0 left-2 w-1 h-4 bg-amber-100 rounded-full opacity-80" />
             <div className="absolute top-0 right-3 w-1.5 h-6 bg-amber-100 rounded-full opacity-60" />
          </div>
      </div>

      {/* --- BASE / HOLDER --- */}
      <div className="w-24 h-4 bg-stone-800 rounded-full mt-[-2px] shadow-xl border-t border-stone-700 z-0" />

      {/* --- CONTROLS (Hover) --- */}
      <div className="absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity">
         {isBurnedOut ? (
           <button onClick={handleLight} disabled={loading} className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded border border-slate-600 hover:bg-slate-700">
             {loading ? 'Lighting...' : 'Replace Candle'}
           </button>
         ) : (
           <div className="text-center bg-black/50 px-2 py-1 rounded text-[10px] text-white">
             {Math.floor(percentageLeft)}% Remaining
           </div>
         )}
      </div>

    </div>
  )
}