'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Sparkles } from 'lucide-react'
import { Crystal } from '@/app/types/database'
import { updateCrystalState } from '@/app/actions/crystals'

interface CardProps {
  crystal: Crystal
  isOwned: boolean
  isWishlisted: boolean
  onUpdate: (state: { isOwned: boolean; isWishlisted: boolean }) => void
  onClick: () => void
}

export default function CrystalCard({ crystal, isOwned, isWishlisted, onUpdate, onClick }: CardProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Helper to unify the update logic
  const handleUpdate = async (newState: { isOwned: boolean; isWishlisted: boolean }) => {
    if (isLoading) return
    setIsLoading(true)

    // Optimistic UI update
    onUpdate(newState)

    try {
      await updateCrystalState(crystal.id, newState)
    } catch (error) {
      console.error('Failed to update crystal', error)
      // Revert to old props on failure (requires parent to pass fresh props, or we just accept the optimistic UI might be wrong briefly)
      // Ideally, onUpdate in parent handles the rollback, but for now we just catch the error.
    } finally {
      setIsLoading(false)
    }
  }

  const handleCollectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleUpdate({ isOwned: !isOwned, isWishlisted })
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleUpdate({ isOwned, isWishlisted: !isWishlisted })
  }

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group/card relative flex flex-col cursor-pointer overflow-hidden rounded-xl border bg-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
        isOwned 
          ? 'border-purple-500/50 shadow-purple-900/20' 
          : isWishlisted 
            ? 'border-amber-500/30' 
            : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Decorative colored line */}
      <div 
        className="h-1 w-full" 
        style={{ backgroundColor: crystal.color }} 
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-serif text-xl font-medium text-slate-100 group-hover/card:text-purple-300 transition-colors">
            {crystal.name}
          </h3>
          
          {/* Wishlist Star Button */}
          <button
            onClick={handleWishlistClick}
            disabled={isLoading}
            className={`rounded-full p-1.5 transition-colors z-20 cursor-pointer ${
               isWishlisted 
                 ? 'text-amber-400 bg-amber-400/10' 
                 : 'text-slate-600 hover:text-amber-200 hover:bg-slate-800'
            }`}
          >
             <Star className={`w-4 h-4 ${isWishlisted ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
        
        <div className="mb-4">
           <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
             {crystal.element}
           </span>
        </div>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-3">
          {crystal.meaning}
        </p>

        {/* The Action Button */}
        <button
          onClick={handleCollectionClick}
          disabled={isLoading}
          className={`group/btn relative z-10 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-all cursor-pointer ${
            isOwned
              ? 'border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
              : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isOwned ? (
            <>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-lg"
              >
                ✨
              </motion.span>
              In Collection
            </>
          ) : (
            <>
              <span>+</span> Add to Collection
            </>
          )}
        </button>
      </div>
      
      {/* Dynamic Glow Effect when collected */}
      {isOwned && (
        <div 
          className="pointer-events-none absolute inset-0 opacity-5" 
          style={{ backgroundColor: crystal.color }}
        />
      )}
    </motion.div>
  )
}