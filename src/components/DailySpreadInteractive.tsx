'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { clsx } from 'clsx'

type TarotCard = {
  id: number
  name: string
  image_url: string | null
  meaning_upright: string | null
  arcana_type: string
}

interface Props {
  cards: TarotCard[]
  isNew: boolean // <--- Added Prop
}

export default function DailySpreadInteractive({ cards, isNew }: Props) {
  // If it's NEW, start at 0. If it's old (revisit), start at 3 (show all).
  const [revealedCount, setRevealedCount] = useState(isNew ? 0 : 3)

  const handleDraw = () => {
    if (revealedCount < 3) {
      setRevealedCount((prev) => prev + 1)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto min-h-[600px]">
      
      {/* --- THE DECK --- */}
      {/* Only show the deck if there are cards left to draw */}
      {/* This div controls the height */}
      <div className="mb-12 relative h-auto w-40">
        {revealedCount < 3 ? (
          <motion.button
            layout // This helps smooth layout changes when it disappears
            onClick={handleDraw}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full h-full relative cursor-pointer group"
          >
            <div className="absolute top-1 left-1 w-full h-full bg-indigo-900 rounded-xl border border-indigo-700/50" />
            <div className="absolute top-2 left-2 w-full h-full bg-indigo-900 rounded-xl border border-indigo-700/50" />
            
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-950 to-purple-950 rounded-xl border-2 border-indigo-400/30 shadow-[0_0_15px_rgba(167,139,250,0.3)] flex items-center justify-center overflow-hidden">
               <div className="opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-purple-900 to-transparent w-full h-full absolute" />
               <span className="text-4xl text-indigo-300/50 font-serif z-10">✦</span>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-8 w-full text-center text-sm text-indigo-300 font-medium tracking-widest"
            >
              DRAW CARD
            </motion.p>
          </motion.button>
        ) : (
           // Placeholder to keep spacing roughly consistent, or remove entirely if you prefer
           <div className="w-40 flex items-center justify-center">
             <span className="text-slate-600/50 text-sm italic">Spread Complete</span>
           </div>
        )}
      </div>

      {/* --- THE SPREAD --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {cards.map((card, index) => (
          <div key={card.id} className="relative h-[450px] flex justify-center">
            {index < revealedCount && (
              <TarotCardReveal 
                card={card} 
                index={index} 
                animateEntry={isNew} // Only fly in if it's a fresh draw
              />
            )}
            
            {/* Ghost Slot (Only show if we haven't revealed it yet) */}
            {index >= revealedCount && (
              <div className="w-64 h-full border border-slate-800/50 bg-slate-900/20 rounded-xl flex items-center justify-center">
                <span className="text-slate-800 text-6xl">?</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

// --- Sub-component ---
function TarotCardReveal({ card, index, animateEntry }: { card: TarotCard, index: number, animateEntry: boolean }) {
  const [isFlipped, setIsFlipped] = useState(!animateEntry) // If not animating entry, start flipped

  // Animation Variants
  const variants = {
    hidden: { 
      y: -200, 
      opacity: 0, 
      scale: 0.5, 
      rotateY: 180 
    },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      rotateY: isFlipped ? 0 : 180 
    },
    // Static variant for revisits (just fade in, no flying)
    static: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    }
  }

  return (
    <motion.div
      initial={animateEntry ? "hidden" : "static"} // Choose starting point
      animate={animateEntry ? "visible" : "static"} // Choose end point
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20, 
        delay: animateEntry ? 0.1 : 0 // No delay on revisit
      }}
      onAnimationComplete={() => setIsFlipped(true)}
      className="w-64 h-full relative preserve-3d cursor-pointer"
      style={{ perspective: 1000 }}
    >
      {/* FRONT (Face) */}
      <div 
        className={clsx(
          "absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl bg-slate-900",
        )}
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
      >
        {card.image_url ? (
            <Image src={card.image_url} alt={card.name} fill className="object-cover" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <h3 className="text-xl font-bold text-purple-200">{card.name}</h3>
                <p className="mt-4 text-xs text-slate-400">{card.meaning_upright}</p>
            </div>
        )}
        
        <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-3 text-center">
             <h3 className="text-lg font-bold text-purple-100">{card.name}</h3>
             <p className="text-xs text-purple-300 uppercase">{card.arcana_type}</p>
        </div>
      </div>

      {/* BACK */}
      <div 
        className="absolute inset-0 w-full h-full backface-hidden rounded-xl bg-indigo-950 border-2 border-indigo-500/50"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
         <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl text-indigo-300/20">✦</span>
         </div>
      </div>
    </motion.div>
  )
}