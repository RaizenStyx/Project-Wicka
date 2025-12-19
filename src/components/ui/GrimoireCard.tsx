'use client'

import { motion } from 'framer-motion'
import { Sparkles, Star, Check, Image as ImageIcon } from 'lucide-react'

interface GrimoireCardProps {
  id: string
  title: string
  subtitle?: string
  image?: string | null
  color?: string
  
  isOwned: boolean
  isWishlisted: boolean
  
  onToggleOwned: (e: React.MouseEvent) => void
  onToggleWishlist: (e: React.MouseEvent) => void
  onClick: () => void // Opens Modal
}

export default function GrimoireCard({ 
  title, subtitle, image, color = '#a855f7', 
  isOwned, isWishlisted, 
  onToggleOwned, 
  onToggleWishlist, 
  onClick 
}: GrimoireCardProps) {

const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation() // Stop card from opening modal
    e.preventDefault()  // Prevent any weird default browser behaviors
    action()
}

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
          <img src={image} alt={title} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900/50">
             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: color }} />
             <ImageIcon className="h-8 w-8 text-slate-700" />
          </div>
        )}
        
        {/* ACTION: WISHLIST (Top Right) */}
        <button 
        onClick={(e) => handleAction(e, onToggleWishlist as () => void)}
        className={`absolute right-2 top-2 rounded-full p-2 backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted ? 'bg-amber-500/20 text-amber-400' : 'bg-black/40 text-slate-400 hover:bg-black/60 hover:text-white'
          }`}
        >
          <Star className={`h-4 w-4 ${isWishlisted ? 'fill-amber-400' : ''}`} />
        </button>
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
        
        <div className="flex-1" /> {/* Spacer */}

        {/* SANCTUARY BUTTON */}
      <button
        onClick={(e) => handleAction(e, onToggleOwned as () => void)}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
            isOwned 
              ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
              : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-800'
          }`}
        >
          {isOwned ? (
            <> <Check className="h-3 w-3" /> In Sanctuary </>
          ) : (
            <> <Sparkles className="h-3 w-3" /> Add to Sanctuary </>
          )}
        </button>
      </div>
    </motion.div>
  )
}