'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Scroll, Search } from 'lucide-react'
import { clsx } from 'clsx'
import SpellCard from '@/components/spellbook/SpellCard'
import CommonRitualCard from '../spellbook/CommonRitualCard'
import { ExtendedSpell, CommonRitual } from '@/app/types/database'

interface GrimoireFeedProps {
  communitySpells: ExtendedSpell[]
  commonRituals: CommonRitual[]
}

type Tab = 'community' | 'crafted'

export default function GrimoireFeed({ communitySpells, commonRituals }: GrimoireFeedProps) {
  const [activeTab, setActiveTab] = useState<Tab>('community')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter Logic
  const filteredSpells = communitySpells.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.intent?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRituals = commonRituals.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.intent?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* 1. THE TOGGLE (Tab System) */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 inline-flex shadow-lg shadow-black/20 backdrop-blur-sm">
           
           {/* Tab 1: Community */}
           <button
             onClick={() => setActiveTab('community')}
             className={clsx(
               "px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer",
               activeTab === 'community' 
                 ? "bg-purple-600 text-white shadow-md shadow-purple-900/30" 
                 : "text-slate-400 hover:text-white hover:bg-slate-800"
             )}
           >
             <Users className="w-4 h-4" />
             Community
           </button>

           {/* Tab 2: Crafted (Curated) */}
           <button
             onClick={() => setActiveTab('crafted')}
             className={clsx(
               "px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer",
               activeTab === 'crafted' 
                 ? "bg-amber-600 text-white shadow-md shadow-amber-900/30" 
                 : "text-slate-400 hover:text-white hover:bg-slate-800"
             )}
           >
             <Scroll className="w-4 h-4" />
             Arcane Archives
           </button>
        </div>
      </div>

      {/* 2. SEARCH BAR (Works for both tabs) */}
      <div className="max-w-md mx-auto mb-16 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
             <Search className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'community' ? "Search community intentions..." : "Search ancient rituals..."}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-3 pl-10 pr-4 text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-600"
          />
      </div>

      {/* 3. THE GRID CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === 'community' ? (
           <motion.div 
             key="community-grid"
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.2 }}
           >
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSpells.map((spell) => (
                    <SpellCard 
                       key={spell.id} 
                       spell={spell} 
                       readOnly={true}
                       showAuthor={true}
                    />
                ))}
              </div>
              {filteredSpells.length === 0 && <EmptyState tab="community" />}
           </motion.div>
        ) : (
           <motion.div 
             key="crafted-grid"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             transition={{ duration: 0.2 }}
           >
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRituals.map((ritual) => (
                    <CommonRitualCard 
                       key={ritual.id} 
                       ritual={ritual} 
                    />
                ))}
              </div>
              {filteredRituals.length === 0 && <EmptyState tab="crafted" />}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple Helper for Empty States
function EmptyState({ tab }: { tab: string }) {
    return (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
           <h3 className="text-slate-400 text-xl font-serif mb-2">
               {tab === 'community' ? "The Archives are Silent" : "No Rituals Found"}
           </h3>
           <p className="text-slate-600">Try adjusting your search terms.</p>
        </div>
    )
}