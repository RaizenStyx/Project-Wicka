'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CrystalDashboard from '@/components/crystals/CrystalDashboard' 
import { Crystal } from '@/app/types/database'

// 1. INTERFACE: Match the Supabase Join structure
interface SanctuaryItem {
  id: string 
  is_owned: boolean
  is_wishlisted: boolean
  user_image_url?: string | null
  crystals: Crystal 
}

export default function SanctuaryTabs({ initialCrystals }: { initialCrystals: SanctuaryItem[] }) {
  const [activeTab, setActiveTab] = useState<'crystals' | 'herbs' | 'deities'>('crystals')

  // --- DATA TRANSFORMATION LOGIC ---

  // 1. Filter: Select only items that belong in the Sanctuary
  const sanctuaryItems = useMemo(() => {
    return initialCrystals.filter(c => c.is_owned || c.is_wishlisted)
  }, [initialCrystals])

  // 2. Extract: Pull the NESTED crystal object out to the top level
  const dashboardCrystals = useMemo(() => {
    return sanctuaryItems.map((item) => {
        // We return the inner 'crystals' object because that's what the Dashboard expects
        return item.crystals
    })
  }, [sanctuaryItems])

  // 3. Map: Create the 'UserState' map
  const dashboardStateMap = useMemo(() => {
    const map: Record<string, { isOwned: boolean; isWishlisted: boolean; userImage?: string | null }> = {}
    
    sanctuaryItems.forEach(item => {
      // Key must be item.crystals.id (the ID of the crystal), not item.id (the collection row ID)
      if (item.crystals?.id) {
          map[item.crystals.id] = {
            isOwned: item.is_owned,
            isWishlisted: item.is_wishlisted,
            userImage: item.user_image_url
          }
      }
    })
    return map
  }, [sanctuaryItems])

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-8 border-b border-slate-800 mb-8 overflow-x-auto">
        {['crystals', 'herbs', 'deities'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${
              activeTab === tab ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode='wait'>
        {activeTab === 'crystals' && (
            <motion.div 
                key="crystals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >

                {dashboardCrystals.length > 0 ? (
                    <CrystalDashboard 
                        initialCrystals={dashboardCrystals} 
                        initialStateMap={dashboardStateMap} 
                    />
                ) : (
                    <div className="p-12 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                        <p>No crystals found in your sanctuary.</p>
                    </div>
                )}
            </motion.div>
        )}

        {/* Placeholders */}
        {activeTab === 'herbs' && (
            <motion.div key="herbs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="p-12 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                    <p>Herbs coming soon...</p>
                </div>
            </motion.div>
        )}
        
        {activeTab === 'deities' && (
            <motion.div key="deities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="p-12 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                    <p>Deities coming soon...</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


