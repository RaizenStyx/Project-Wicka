'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { updateCrystalState, saveUserCrystalImage } from '@/app/actions/crystal-actions'
import { updateHerbState, saveUserHerbImage } from '@/app/actions/herb-actions'
import { updateDeityState, saveUserDeityImage } from '@/app/actions/deity-actions'
import { updateCandleState, saveUserCandleImage } from '@/app/actions/candle-actions'
import { createClient } from '@/app/utils/supabase/client'
import { Sparkles, Star } from 'lucide-react'

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
  const supabase = createClient()

  // --- LOCAL STATE FOR OPTIMISTIC UPDATES ---
  const [localCrystalState, setLocalCrystalState] = useState(crystalState)
  const [localHerbState, setLocalHerbState] = useState(herbState)
  const [localDeityState, setLocalDeityState] = useState(deityState)
  const [localCandleState, setLocalCandleState] = useState(candleState)

  useEffect(() => { setLocalCrystalState(crystalState) }, [crystalState])
  useEffect(() => { setLocalHerbState(herbState) }, [herbState])
  useEffect(() => { setLocalDeityState(deityState) }, [deityState])
  useEffect(() => { setLocalCandleState(candleState) }, [candleState])

// --- HELPER: Get Current Context ---
  const getContext = () => {
    switch (activeTab) {
      case 'crystals': return { 
          items: crystals, 
          state: localCrystalState, 
          setter: setLocalCrystalState, 
          action: updateCrystalState,
          saveImageAction: saveUserCrystalImage, 
          category: 'crystal' as const,          
          filters: ['Earth', 'Fire', 'Water', 'Air'],
          filterKey: 'element'
      }
      case 'herbs': return { 
          items: herbs, 
          state: localHerbState, 
          setter: setLocalHerbState, 
          action: updateHerbState,
          saveImageAction: saveUserHerbImage, 
          category: 'herb' as const,          
          filters: ['Earth', 'Fire', 'Water', 'Air'],
          filterKey: 'element'
      }
      case 'deities': return { 
          items: deities, 
          state: localDeityState, 
          setter: setLocalDeityState, 
          action: updateDeityState,
          saveImageAction: saveUserDeityImage, 
          category: 'deity' as const,          
          filters: ['Greek', 'Norse', 'Egyptian'],
          filterKey: 'pantheon'
      }
      case 'candles': return { 
          items: candles, 
          state: localCandleState, 
          setter: setLocalCandleState, 
          action: updateCandleState,
          saveImageAction: saveUserCandleImage, 
          category: 'general' as const,         
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
    
    // Default to null for userImage
    const current = state[id] || { isOwned: false, isWishlisted: false, userImage: null }
    const newState = { ...current, isOwned: !current.isOwned }
    
    setter((prev: any) => ({ ...prev, [id]: newState }))
    await action(id, { isOwned: newState.isOwned, isWishlisted: newState.isWishlisted })
  }

  // --- LOGIC: Toggle Wishlist ---
  const handleToggleWishlist = async (id: string) => {
    if (!context) return
    const { state, setter, action } = context
    
    const current = state[id] || { isOwned: false, isWishlisted: false, userImage: null }
    const newState = { ...current, isWishlisted: !current.isWishlisted }
    
    setter((prev: any) => ({ ...prev, [id]: newState }))
    await action(id, { isOwned: newState.isOwned, isWishlisted: newState.isWishlisted })
  }

  // --- NEW: Unified Image Upload Handler ---
  const handleImageUpload = async (file: File) => {
    if (!context || !selectedItem) throw new Error("No context or item selected")
    
    const { saveImageAction, setter } = context
    const id = selectedItem.id

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not logged in")

    // 2. Upload to Supabase
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, file)

    if (uploadError) throw uploadError

    // 3. Save to DB using the specific action for this tab
    await saveImageAction(id, filePath)

    // 4. Update Local State
    setter((prev: any) => ({
        ...prev,
        [id]: { ...prev[id], userImage: filePath }
    }))
    
    return filePath
  }

  // --- DATA PREP ---
  // Get items, filter only owned ones, and map if necessary
  let displayedItems = context?.items.filter((item: any) => context.state[item.id]?.isOwned) || []
  let wishlistItems = context?.items.filter((item: any) => context.state[item.id]?.isWishlisted) || []

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
      {/* SCROLLABLE CATEGORY NAVIGATION */}
        <div className="mb-8 relative group">
        {/* The Scroll Container */}
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth">
            {['crystals', 'herbs', 'deities', 'candles', 'runes', 'oils'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`
                flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all border border-slate-700 cursor-pointer
                ${
                    activeTab === tab
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40'
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
                `}
            >
                {tab}
            </button>
            ))}
        </div>
  
    {/* Visual hint that there is more content (Fade on the right) */}
    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none md:hidden" />
    </div>

        {/* === OWNED SECTION === */}
      <div className="min-h-[400px]">
        <div className="relative flex items-center py-8">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="mx-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-300">
            <Sparkles className="h-18 w-18" /> 
        </span>
        <div className="flex-grow border-t border-slate-800"></div>
        </div>
         <GrimoireDashboard 
            // Key forces re-render when tab changes so search/filters reset
            key={activeTab} 
            title="Sanctuary Collection" 
            description="Your collected items and such and a longer description can be placed here."
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

      {/* === WISHLIST SECTION === */}
        {wishlistItems.length > 0 && (
            <>
            <div className="min-h-[400px]">
                <div className="relative flex items-center py-8 mt-8">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="mx-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-400">
                    <Star className="h-18 w-18" />             
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
                </div>
                <GrimoireDashboard 
                    key={activeTab} 
                    title="Manifestation List" 
                    description="Your wishlisted items and such and a longer description can be placed here."
                    items={wishlistItems}
                    filterCategories={context?.filters || []}
                    filterKey={context?.filterKey || ''}
                    mode="modal"
                    onItemClick={handleItemClick}
                    
                    // Pass the Correct Props
                    userState={context?.state}
                    onToggleOwned={handleToggleOwned}
                    onToggleWishlist={handleToggleWishlist}
                />
            </div>
            </>
            )}
        {/* {isModalOpen && (
            <div className="fixed top-20 left-10 z-[100] bg-black border border-red-500 p-4 text-xs font-mono text-red-400 max-w-sm">
                <p>DEBUG MODAL PROPS:</p>
                <p>Item ID: {selectedItem?.id}</p>
                <p>Has Context? {context ? 'Yes' : 'No'}</p>
                <p>Is Owned? {String(selectedState.isOwned)}</p>
                <p>User Image Prop: {String(selectedState.userImage)}</p>
            </div>
        )} */}
      {/* MODAL */}
      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        category={context?.category || 'general'}
        // Pass State & Handlers
        isOwned={selectedState.isOwned}
        isWishlisted={selectedState.isWishlisted}
        userImage={selectedState.userImage}
        onToggleOwned={() => selectedItem && handleToggleOwned(selectedItem.id)}
        onToggleWishlist={() => selectedItem && handleToggleWishlist(selectedItem.id)}
        onImageUpload={handleImageUpload} 
      />
    </div>
  )
}