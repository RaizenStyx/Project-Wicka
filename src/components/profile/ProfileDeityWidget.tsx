import Image from 'next/image'
import { Flame, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  invocation: {
    last_invoked_at: string | null
  }
  deity: {
    name: string
    pantheon: string
    image_url: string
    domain: string[]
  }
}

export default function ProfileDeityWidget({ invocation, deity }: Props) {
    return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-500/30 group h-[280px] flex flex-col">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={deity.image_url} 
          alt={deity.name}
          className="w-full h-full object-cover opacity-30 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40 grayscale group-hover:grayscale-0" 
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-orange-900/10" />
      </div>

      {/* Animated glow effect */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-500/20 blur-3xl rounded-full" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full p-5">
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-gradient-to-r from-orange-950/80 to-red-950/80 px-3 py-1.5 backdrop-blur-md shadow-lg shadow-orange-500/20">
            <Flame size={14} className="text-orange-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-orange-200">Active Rite</span>
          </div>
        </div>

          
          {/* Pantheon Label */}
          <div className="inline-block">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-widest">
              {deity.pantheon}
            </span>
          </div>
          

        {/* Spacer to push content down */}
        <div className="flex-1" />
        
        {/* Main Content - Bottom Section */}
        <div className="space-y-3">

          {/* Deity Name */}
          <h3 className="font-serif text-4xl font-bold text-white drop-shadow-2xl leading-none tracking-tight">
            {deity.name}
          </h3>
          
          {/* Domain Tags */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {deity.domain?.slice(0, 4).map((d) => (
              <span 
                key={d} 
                className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/30"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Invocation Timer - Footer */}
          <div className="flex items-center gap-2 border-t border-white/10 pt-3 mt-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/50 backdrop-blur-sm">
              <Clock size={14} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-400">
              Last invoked{' '}
              <span className="text-white font-semibold">
                {invocation.last_invoked_at ? formatDistanceToNow(invocation.last_invoked_at) : 'unknown'}
              </span>
              {' '}ago
            </p>
          </div>
        </div>

      </div>

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-purple-500/30 transition-all duration-300 pointer-events-none" />
    </div>
  )
}