'use client'

import { motion } from 'framer-motion'
import { Sparkles, Flame, Star, Check, Image as ImageIcon, Camera } from 'lucide-react'
import { CANDLE_NAMES, KNOWN_PANTHEONS } from '@/app/utils/constants'

interface GrimoireCardProps {
  id: string
  title: string
  subtitle?: string
  image?: string | null
  color?: string
  
  // User State
  isOwned: boolean
  isWishlisted: boolean
  hasUserImage?: boolean
  
  onToggleOwned: () => void
  onToggleWishlist: () => void
  onClick: () => void 
}

export default function GrimoireCard({ 
  title, subtitle, image, color = '#a855f7', 
  isOwned, isWishlisted, hasUserImage,
  onToggleOwned, onToggleWishlist, onClick 
}: GrimoireCardProps) {

  const handleAction = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation() 
      e.preventDefault() 
      action()
  }

  const isCandle = CANDLE_NAMES.includes(title);
  const isDeity = KNOWN_PANTHEONS.includes(subtitle || '');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      whileHover={{ y: -5 }}
      layout
      onClick={onClick}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl bg-slate-900 shadow-lg transition-all hover:shadow-xl hover:shadow-purple-900/20"
      style={{ borderBottom: `2px solid ${color}` }}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
        {image ? (
      <img 
        src={image} 
        alt={title} 
        className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" 
      />
    ) : (
      <div className="relative flex h-full w-full items-center justify-center bg-slate-900/50 overflow-hidden">
        
        {/* Background Glow (matches the item color) */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ backgroundColor: color || '#334155' }} 
        />

        {isCandle ? (
          /* --- CSS CANDLE RENDERER --- */
          <div className="relative flex flex-col items-center justify-end h-32 w-full">
            {/* The Flame (Animated) */}
            <div className="relative -mb-1 z-10">
              <div className="w-4 h-6 bg-orange-300 rounded-[50%] blur-[2px] animate-pulse origin-bottom" />
              <div className="absolute top-1 left-1 w-2 h-3 bg-white rounded-[50%] blur-[1px] opacity-80" />
            </div>
            
            {/* The Candle Wax */}
            <div 
              className="w-12 h-24 rounded-t-lg shadow-inner relative"
              style={{ 
                backgroundColor: color,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' // Gives it a 3D cylindrical look
              }}
            >
               {/* Wax Drip (Optional Detail) */}
               <div className="absolute top-0 right-2 w-2 h-6 bg-white/10 rounded-b-full" />
            </div>

            {/* Reflection/Pool at bottom */}
            <div 
               className="absolute -bottom-2 w-16 h-4 blur-md opacity-60 rounded-[50%]"
               style={{ backgroundColor: color }}
            />
          </div>
        ) : (
          /* --- FALLBACK ICON (For Crystals/Herbs with no image) --- */
          <div className="z-10 text-slate-700">
             {/* You can swap this icon based on logic too if you wanted */}
             <ImageIcon className="h-10 w-10 opacity-50" />
          </div>
        )}
      </div>
    )}
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => handleAction(e, onToggleWishlist)}
          className={`absolute right-2 top-2 rounded-full p-2 backdrop-blur-md transition-all cursor-pointer ${
              isWishlisted ? 'bg-amber-500/20 text-amber-400' : 'bg-black/40 text-slate-400 hover:bg-black/60 hover:text-white'
            }`}
        >
          <Star className={`h-4 w-4 ${isWishlisted ? 'fill-amber-400' : ''}`} />
        </button>

        {/* NEW: Has User Image Indicator */}
        {hasUserImage && (
             <div className="absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-purple-300 backdrop-blur-md">
                <Camera className="h-3 w-3" />
             </div>
        )}
      </div>

      {/* TEXT SECTION */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <h3 className="font-serif text-lg font-medium text-slate-100 group-hover:text-purple-300">{title}</h3>
          {subtitle && (
            <span 
              className="mt-1 inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"
              style={{ borderColor: `${color}30`, backgroundColor: `${color}10` }}
            >
              {subtitle}
            </span>
          )}
        </div>
        
        <div className="flex-1" />

        {/* SANCTUARY BUTTON */}
        {isDeity ? (
          <div className="text-xs text-slate-500 mb-1 italic flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-400" />
            Deity Card
            <Sparkles className="h-3 w-3 text-purple-400" />
          </div>
        ) : (
          <button
          onClick={(e) => handleAction(e, onToggleOwned)}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
            isOwned 
              ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
              : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-800'
          }`}
        >
          {isOwned ? (
            <>
              <Check className="h-3 w-3" />
              Remove from Sanctuary
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              Add to Sanctuary
            </>
          )}
        </button>
        )}
      </div>
    </motion.div>
  )
}