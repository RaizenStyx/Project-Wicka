'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Image as ImageIcon, Star, Check } from 'lucide-react'

interface GrimoireModalProps {
  isOpen: boolean
  onClose: () => void
  item: any | null
  
  // These are now required as per SanctuaryTabs
  isOwned: boolean
  isWishlisted: boolean
  onToggleOwned: () => void
  onToggleWishlist: () => void
}

export default function GrimoireModal({ 
  isOpen, onClose, item, 
  isOwned, isWishlisted, onToggleOwned, onToggleWishlist 
}: GrimoireModalProps) {
  if (!isOpen || !item) return null

  // Helper for arrays (medical uses, symbols, etc)
  const renderList = (label: string, data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    const list = Array.isArray(data) ? data.join(', ') : data;
    return (
      <div className="mb-4">
        <h4 className="font-bold text-slate-200">{label}</h4>
        <p className="text-sm text-slate-400">{list}</p>
      </div>
    )
  }

  const accentColor = item.color || '#a855f7'; 

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 bg-slate-950 shadow-2xl"
            style={{ borderColor: accentColor }}
          >
            {/* IMAGE HEADER */}
             <div className="relative h-48 w-full bg-slate-900">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover opacity-80" />
              ) : (
                <div className="flex h-full items-center justify-center"><ImageIcon className="h-12 w-12 text-slate-700" /></div>
              )}
              <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"><X className="h-5 w-5" /></button>
              
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 to-transparent p-6 pt-12">
                <h2 className="font-serif text-3xl text-white">{item.name}</h2>
                <div className="flex gap-2 text-sm font-bold uppercase tracking-wider text-purple-400">
                    {item.pantheon && <span>{item.pantheon}</span>}
                    {item.element && <span>{item.element}</span>}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <p className="mb-6 leading-relaxed text-slate-300">{item.description}</p>
              
              {/* Dynamic Details */}
              {renderList('Magical Uses', item.magical_uses)}
              {renderList('Medical Uses', item.medical_uses)}
              {renderList('Domains', item.domain)}
              {renderList('Symbols', item.symbols)}
              {renderList('Associations', item.associations)}

              {/* ACTION BUTTONS */}
              <div className="mt-8 flex gap-3 border-t border-slate-800 pt-6">
                
                {/* 1. Sanctuary Button */}
                <button 
                  onClick={onToggleOwned}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors ${
                    isOwned 
                    ? 'bg-purple-900/50 text-purple-200 hover:bg-purple-900/70' 
                    : 'bg-slate-100 text-slate-900 hover:bg-white'
                  }`}
                >
                  {isOwned ? <><Check className="h-4 w-4" /> In Sanctuary</> : <><Sparkles className="h-4 w-4" /> Add to Sanctuary</>}
                </button>

                {/* 2. Wishlist Button */}
                <button 
                  onClick={onToggleWishlist}
                  className={`flex items-center justify-center rounded-lg border px-4 transition-colors ${
                    isWishlisted 
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' 
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                  }`}
                >
                   <Star className={`h-5 w-5 ${isWishlisted ? 'fill-amber-400' : ''}`} />
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}