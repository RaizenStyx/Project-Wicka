'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Activity, Sparkles } from 'lucide-react'
import { clearNotifications } from '@/app/actions/notifications'
import { clsx } from 'clsx'

interface ResonanceLinkProps {
  count: number
  handle: string
}

export default function ResonanceLink({ count, handle }: ResonanceLinkProps) {
  const [isPending, startTransition] = useTransition()
  
  // If we are currently "clearing" (pending), show 0 to make it feel instant
  const displayCount = isPending ? 0 : count
  const hasResonance = displayCount > 0

  const handleClick = () => {
    if (hasResonance) {
      startTransition(async () => {
        await clearNotifications()
      })
    }
  }

  return (
    <Link 
      href={`/u/${handle}`} 
      onClick={handleClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group/item"
    >
      <div className="relative">
        {hasResonance ? (
          <div className="relative">
             {/* The Glowing Active Icon */}
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          </div>
        ) : (
          /* The Dormant Icon */
          <Activity className="w-4 h-4 text-slate-400 group-hover/item:text-purple-400 transition-colors" />
        )}
      </div>

      <div className="flex-1">
        <p className={clsx(
            "text-xs transition-colors",
            hasResonance ? "text-purple-200 font-medium" : "text-slate-300"
        )}>
          {hasResonance ? "Astral Resonance" : "Energy is Still"}
        </p>
      </div>

      {hasResonance && (
        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/50 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(168,85,247,0.3)]">
          +{displayCount}
        </span>
      )}
    </Link>
  )
}