'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

// Define a loose type that covers both Herbs and Deities
interface GrimoireItem {
  id: string
  name: string
  description?: string
  image_url?: string | null
  
  // Herb specific
  latin_name?: string
  element?: string
  medical_uses?: string | string[] // Handle if it comes as string or array
  magical_uses?: string[]

  // Deity specific
  pantheon?: string
  domain?: string[]
  symbols?: string[]
}

interface GrimoireModalProps {
  isOpen: boolean
  onClose: () => void
  item: GrimoireItem | null
}

export default function GrimoireModal({ isOpen, onClose, item }: GrimoireModalProps) {
  if (!isOpen || !item) return null

  // Helper to determine the "accent color" based on data
  const getAccentColor = () => {
    if (item.element === 'Fire') return '#ef4444' // Red
    if (item.element === 'Water') return '#3b82f6' // Blue
    if (item.element === 'Earth') return '#10b981' // Green
    if (item.element === 'Air') return '#fbbf24' // Yellow
    if (item.pantheon) return '#a855f7' // Purple for Deities
    return '#64748b' // Slate default
  }

  const accentColor = getAccentColor()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 bg-slate-950 shadow-2xl"
            style={{ borderColor: accentColor }}
          >
            {/* Header Image */}
            <div className="relative h-48 w-full bg-slate-900">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover opacity-80" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-700" />
                </div>
              )}
              
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 to-transparent p-6 pt-12">
                <h2 className="font-serif text-3xl text-white">{item.name}</h2>
                {item.latin_name && <p className="text-sm italic text-slate-400">{item.latin_name}</p>}
                {item.pantheon && <p className="text-sm font-bold uppercase tracking-wider text-purple-400">{item.pantheon}</p>}
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              
              {/* Description */}
              <p className="mb-6 leading-relaxed text-slate-300">
                {item.description || "No description available in the archives."}
              </p>

              {/* --- SECTION: HERB SPECIFIC --- */}
              {item.magical_uses && (
                <div className="mb-6">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Magical Uses</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.magical_uses.map((use) => (
                      <span key={use} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.medical_uses && (
                <div className="mb-6 rounded-lg border border-red-900/30 bg-red-950/10 p-4">
                   <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-red-400">Medicinal Notes</h3>
                   <p className="text-sm text-red-200/80">{item.medical_uses}</p>
                </div>
              )}

              {/* --- SECTION: DEITY SPECIFIC --- */}
              {item.domain && (
                <div className="mb-6">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Domains</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.domain.map((d) => (
                      <span key={d} className="rounded-md border border-purple-500/30 bg-purple-900/20 px-2 py-1 text-xs text-purple-200">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.symbols && (
                <div className="mb-6">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Symbols</h3>
                  <p className="text-sm text-slate-300">{item.symbols.join(', ')}</p>
                </div>
              )}

              {/* Action Button (Placeholder for now) */}
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-3 font-medium text-slate-900 transition-colors hover:bg-white">
                <Sparkles className="h-4 w-4" />
                {item.domain ? (
                    <p>Worship Deity</p>
                ) : (
                    <p>Add to Sanctuary</p>
                )
                }
                
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}