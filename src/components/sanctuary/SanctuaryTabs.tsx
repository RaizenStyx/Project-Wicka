'use client'

import { useState } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { updateCrystalState } from '@/app/actions/crystal-actions'
import { updateHerbState } from '@/app/actions/herb-actions'
import { updateDeityState } from '@/app/actions/deity-actions'
import { updateCandleState } from '@/app/actions/candle-actions'

interface Props {
  crystals: any[]; crystalState: any;
  herbs: any[]; herbState: any;
  deities: any[]; deityState: any;
  candles: any[]; candleState: any;
}

type Tab = 'crystals' | 'herbs' | 'deities' | 'candles'

export default function SanctuaryTabs({ 
  crystals, crystalState, 
  herbs, herbState, 
  deities, deityState, 
  candles, candleState 
}: Props) {
  
  const [activeTab, setActiveTab] = useState<Tab>('crystals')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // --- LOCAL STATE FOR OPTIMISTIC UPDATES ---
  const [localCrystalState, setLocalCrystalState] = useState(crystalState)
  const [localHerbState, setLocalHerbState] = useState(herbState)
  const [localDeityState, setLocalDeityState] = useState(deityState)
  const [localCandleState, setLocalCandleState] = useState(candleState)

// --- HELPER: Get Current Context ---
  const getContext = () => {
    switch (activeTab) {
      case 'crystals': return { 
          items: crystals, 
          state: localCrystalState, 
          setter: setLocalCrystalState, 
          action: updateCrystalState,
          filters: ['Earth', 'Fire', 'Water', 'Air'],
          filterKey: 'element'
      }
      case 'herbs': return { 
          items: herbs, 
          state: localHerbState, 
          setter: setLocalHerbState, 
          action: updateHerbState,
          filters: ['Earth', 'Fire', 'Water', 'Air'],
          filterKey: 'element'
      }
      case 'deities': return { 
          items: deities, 
          state: localDeityState, 
          setter: setLocalDeityState, 
          action: updateDeityState,
          filters: ['Greek', 'Norse', 'Egyptian'],
          filterKey: 'pantheon'
      }
      case 'candles': return { 
          items: candles, 
          state: localCandleState, 
          setter: setLocalCandleState, 
          action: updateCandleState,
          filters: [],
          filterKey: 'associations'
      }
      default: return null
    }
  }

  const context = getContext()

  // --- LOGIC: Toggle Ownership ---
  const handleToggleOwned = async (id: string) => {
    if (!context) return
    const { state, setter, action } = context
    
    const current = state[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isOwned: !current.isOwned }
    
    setter((prev: any) => ({ ...prev, [id]: newState }))
    await action(id, newState)
  }

  // --- LOGIC: Toggle Wishlist ---
  const handleToggleWishlist = async (id: string) => {
    if (!context) return
    const { state, setter, action } = context
    
    const current = state[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isWishlisted: !current.isWishlisted }
    
    setter((prev: any) => ({ ...prev, [id]: newState }))
    await action(id, newState)
  }

  // --- DATA PREP ---
  // Get items, filter only owned ones, and map if necessary
  let displayedItems = context?.items.filter((item: any) => context.state[item.id]?.isOwned) || []
  
  // Candle Fix for display
  if (activeTab === 'candles') {
    displayedItems = displayedItems.map((c: any) => ({ ...c, name: c.color, color: c.hex_code }))
  }

  const handleItemClick = (item: any) => {
    if (activeTab === 'candles') {
       item = { ...item, magical_uses: item.associations }
    }
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  // Calculate Modal State
  const selectedState = selectedItem && context 
    ? (context.state[selectedItem.id] || { isOwned: false, isWishlisted: false }) 
    : { isOwned: false, isWishlisted: false }

  return (
    <div>
      {/* TABS NAVIGATION */}
      <div className="mb-8 flex justify-center border-b border-slate-800">
        {['crystals', 'herbs', 'deities', 'candles'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-purple-500 text-purple-200' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[400px]">
         <GrimoireDashboard 
            // Key forces re-render when tab changes so search/filters reset
            key={activeTab} 
            title="" 
            description=""
            items={displayedItems}
            filterCategories={context?.filters || []}
            filterKey={context?.filterKey || ''}
            mode="modal"
            onItemClick={handleItemClick}
            
            // Pass the Correct Props
            userState={context?.state}
            onToggleOwned={handleToggleOwned}
            onToggleWishlist={handleToggleWishlist}
          />

        {displayedItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl mt-4">
               <p>Your {activeTab} sanctuary is empty.</p>
               <p className="text-sm mt-2">Visit the database to add items.</p>
            </div>
        )}
      </div>

      {/* MODAL */}
      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        
        // Pass State & Handlers
        isOwned={selectedState.isOwned}
        isWishlisted={selectedState.isWishlisted}
        onToggleOwned={() => selectedItem && handleToggleOwned(selectedItem.id)}
        onToggleWishlist={() => selectedItem && handleToggleWishlist(selectedItem.id)}
      />
    </div>
  )
}