'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Crystal } from '@/app/types/database'
import { updateCrystalState } from '@/app/actions/crystal-actions'

interface CardProps {
  crystal: Crystal
  isOwned: boolean
  isWishlisted: boolean
  onUpdate: (state: { isOwned: boolean; isWishlisted: boolean }) => void
  onClick: () => void
}

export default function CrystalCard({ crystal, isOwned, isWishlisted, onUpdate, onClick }: CardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async (newState: { isOwned: boolean; isWishlisted: boolean }) => {
    if (isLoading) return
    setIsLoading(true)
    onUpdate(newState)
    try {
      await updateCrystalState(crystal.id, newState)
    } catch (error) {
      console.error('Failed to update crystal', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group/card relative flex flex-col cursor-pointer overflow-hidden rounded-xl bg-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
      // STYLE: The "U" shaped border logic
      style={{
        borderLeft: `2px solid ${crystal.color}`,
        borderRight: `2px solid ${crystal.color}`,
        borderBottom: `2px solid ${crystal.color}`,
        borderTop: 'none' // No top border
      }}
    >
      {/* 1. TOP BANNER IMAGE */}
      <div className="h-32 w-full relative overflow-hidden bg-slate-950">
        {crystal.image_url ? (
            <img 
                src={crystal.image_url} 
                alt={crystal.name} 
                className="w-full h-full object-cover opacity-90 group-hover/card:scale-105 transition-transform duration-500" 
            />
        ) : (
            // Fallback if image fails or missing
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <ImageIcon className="w-8 h-8 text-slate-700" />
            </div>
        )}
        
        {/* Overlay gradient so text/icons pop if they overlap */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />

        {/* Wishlist Star - Absolute positioned on the image now */}
        <button
            onClick={(e) => {
                e.stopPropagation()
                handleUpdate({ isOwned, isWishlisted: !isWishlisted })
            }}
            disabled={isLoading}
            className={`absolute top-2 right-2 rounded-full p-2 transition-colors backdrop-blur-md ${
               isWishlisted 
                 ? 'text-amber-400 bg-black/40' 
                 : 'text-slate-300 hover:text-white bg-black/20 hover:bg-black/40'
            }`}
        >
             <Star className={`w-4 h-4 ${isWishlisted ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* 2. CARD CONTENT */}
      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="mb-2">
          <h3 className="font-serif text-xl font-medium text-slate-100 group-hover/card:text-purple-300 transition-colors">
            {crystal.name}
          </h3>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {crystal.element}
          </span>
        </div>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
          {crystal.meaning}
        </p>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleUpdate({ isOwned: !isOwned, isWishlisted })
          }}
          disabled={isLoading}
          className={`group/btn relative z-10 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-all cursor-pointer ${
            isOwned
              ? 'border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
              : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isOwned ? (
            <> <Sparkles className="w-4 h-4" /> In Collection </>
          ) : (
            <> <span>+</span> Add to Collection </>
          )}
        </button>
      </div>
    </motion.div>
  )
}