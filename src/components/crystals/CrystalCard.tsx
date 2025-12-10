'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crystal } from '@/app/types/crystal'
import { toggleCrystalCollection } from '@/app/actions/crystals'

interface CardProps {
  crystal: Crystal
  isCollected: boolean
  onToggle: (status: boolean) => void
  onClick: () => void
}

export default function CrystalCard({ crystal, isCollected, onToggle, onClick }: CardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCollectionClick = async (e: React.MouseEvent) => {
    
    e.stopPropagation()

    if (isLoading) return
    setIsLoading(true)
    
    // Optimistic update
    onToggle(!isCollected) 

    try {
      await toggleCrystalCollection(crystal.id, isCollected)
    } catch (error) {
      console.error('Failed to toggle crystal', error)
      onToggle(isCollected) 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      layout
      onClick={onClick} // 👈 Clicking anywhere else opens the modal
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group/card relative flex flex-col cursor-pointer overflow-hidden rounded-xl border bg-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
        isCollected ? 'border-purple-500/50 shadow-purple-900/20' : 'border-slate-800 hover:border-slate-700'
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
          
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
            {crystal.element}
          </span>
        </div>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-3">
          {crystal.meaning}
        </p>

        {/* The Action Button */}
        <button
          onClick={handleCollectionClick} // Uses the specific handler with stopPropagation
          disabled={isLoading}
          className={`group/btn relative z-10 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-all cursor-pointer ${
            isCollected
              ? 'border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
              : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isCollected ? (
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
      {isCollected && (
        <div 
          className="pointer-events-none absolute inset-0 opacity-5" 
          style={{ backgroundColor: crystal.color }}
        />
      )}
    </motion.div>
  )
}