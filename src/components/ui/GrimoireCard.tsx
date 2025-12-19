'use client'

import { motion } from 'framer-motion'
import { Sparkles, Star, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface GrimoireCardProps {
  title: string
  subtitle?: string // e.g., Element, Pantheon, Latin Name
  image?: string | null
  color?: string // dynamic border color
  
  // Interaction props
  href?: string // If provided, card is a Link
  onClick?: () => void // If provided, card triggers modal
  
  // Gamification props (Optional)
  isOwned?: boolean
  isWishlisted?: boolean
  onToggleCollect?: (e: React.MouseEvent) => void
}

export default function GrimoireCard({ 
  title, subtitle, image, color = '#a855f7', 
  href, onClick, 
  isOwned, isWishlisted, onToggleCollect 
}: GrimoireCardProps) {

  const CardContent = (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20"
      style={{ borderBottom: `2px solid ${color}` }}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900/50">
             {/* If no image, show a colored overlay based on the item's color */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: color }} />
             <ImageIcon className="h-8 w-8 text-slate-700" />
          </div>
        )}
        
        {/* Wishlist Button (Only shows if onToggleCollect is passed) */}
        {onToggleCollect && (
          <button 
            onClick={onToggleCollect}
            className="absolute right-2 top-2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            {isOwned ? <Sparkles className="h-4 w-4 text-purple-400" /> : <Star className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* TEXT SECTION */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-slate-100 group-hover:text-purple-300">{title}</h3>
        </div>
        
        {subtitle && (
          <span 
            className="inline-block w-fit rounded bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500"
            style={{ borderColor: `${color}40` }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )

  // RENDER: Wraps content in Link if href exists, otherwise uses div with onClick
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout>
      {href ? (
        <Link href={href} className="block h-full">
          {CardContent}
        </Link>
      ) : (
        <div onClick={onClick} className="h-full cursor-pointer">
          {CardContent}
        </div>
      )}
    </motion.div>
  )
}