'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import GrimoireDashboard from '../spellbook/GrimoireDashboard'
import GrimoireModal from '../spellbook/GrimoireModal'
import { updateCrystalState, saveUserCrystalImage } from '@/app/actions/crystal-actions'
import { updateHerbState, saveUserHerbImage } from '@/app/actions/herb-actions'
import { updateCandleState, saveUserCandleImage } from '@/app/actions/candle-actions'
import { updateRuneState, saveUserRuneImage } from '@/app/actions/rune-actions'
import { updateOilState, saveUserOilImage } from '@/app/actions/oil-actions'

import { createClient } from '@/app/utils/supabase/client'
import { Sparkles, Star } from 'lucide-react'

interface Props {
  crystals: any[]; crystalState: any;
  herbs: any[]; herbState: any;
  candles: any[]; candleState: any;
  runes: any[]; runeState: any;
  oils: any[]; oilState: any;
}

type Tab = 'crystals' | 'herbs' | 'candles' | 'runes' | 'oils'

export default function SanctuaryTabs({ 
  crystals, crystalState, 
  herbs, herbState, 
  candles, candleState,
  runes, runeState,
  oils, oilState
}: Props) {

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<Tab>('crystals')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  // --- LOCAL STATE FOR OPTIMISTIC UPDATES ---
  const [localCrystalState, setLocalCrystalState] = useState(crystalState)
  const [localHerbState, setLocalHerbState] = useState(herbState)
  const [localCandleState, setLocalCandleState] = useState(candleState)
  const [localRuneState, setLocalRuneState] = useState(runeState)
  const [localOilState, setLocalOilState] = useState(oilState)

  useEffect(() => { setLocalCrystalState(crystalState) }, [crystalState])
  useEffect(() => { setLocalHerbState(herbState) }, [herbState])
  useEffect(() => { setLocalCandleState(candleState) }, [candleState])
  useEffect(() => { setLocalRuneState(runeState) }, [runeState])
  useEffect(() => { setLocalOilState(oilState) }, [oilState])

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
      // NEW: Runes Context
      case 'runes': return { 
          items: runes, 
          state: localRuneState, 
          setter: setLocalRuneState, 
          action: updateRuneState,
          saveImageAction: saveUserRuneImage, 
          category: 'rune' as const,         
          filters: ["Freya's Aett", "Heimdall's Aett", "Tyr's Aett"],
          filterKey: 'aett'
      }
      // NEW: Oils Context
      case 'oils': return { 
          items: oils, 
          state: localOilState, 
          setter: setLocalOilState, 
          action: updateOilState,
          saveImageAction: saveUserOilImage, 
          category: 'oil' as const,         
          filters: [], // Oils are diverse, search is usually better than filters
          filterKey: 'magical_uses'
      }
      default: return null
    }
  }

  // --- URL SYNC ---
  useEffect(() => {
    const openId = searchParams.get('open')
    if (!openId) {
        if (isModalOpen) setIsModalOpen(false) 
        return
    }

    // A. Helper to find item and its category
    const findItem = (id: string) => {
        const c = crystals.find(i => i.id === id); if (c) return { item: c, tab: 'crystals' as Tab }
        const h = herbs.find(i => i.id === id);    if (h) return { item: h, tab: 'herbs' as Tab }
        const ca = candles.find(i => i.id === id); if (ca) return { item: ca, tab: 'candles' as Tab }
        const r = runes.find(i => i.id === id);    if (r) return { item: r, tab: 'runes' as Tab }
        const o = oils.find(i => i.id === id);     if (o) return { item: o, tab: 'oils' as Tab }
        return null
    }

    const match = findItem(openId)

    if (match) {
        setActiveTab(match.tab)
        setSelectedItem(match.item)
        setIsModalOpen(true)
    }
  }, [searchParams, crystals, herbs, candles, runes, oils])


  const context = getContext()

  // --- LOGIC: Toggle Ownership ---
  const handleToggleOwned = async (id: string) => {
    if (!context) return
    const { state, setter, action } = context
    
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

  // --- IMAGE UPLOAD ---
  const handleImageUpload = async (file: File) => {
    if (!context || !selectedItem) throw new Error("No context or item selected")
    
    const { saveImageAction, setter } = context
    const id = selectedItem.id

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not logged in")

    const fileExt = file.name.split('.').pop()
    const fileName = `${id}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, file)

    if (uploadError) throw uploadError

    await saveImageAction(id, filePath)

    setter((prev: any) => ({
        ...prev,
        [id]: { ...prev[id], userImage: filePath }
    }))
    
    return filePath
  }

  // --- DATA PREP ---
  let displayedItems = context?.items.filter((item: any) => context.state[item.id]?.isOwned) || []
  let wishlistItems = context?.items.filter((item: any) => context.state[item.id]?.isWishlisted) || []

  const handleItemClick = (item: any) => {
    if (activeTab === 'candles') {
       item = { ...item, magical_uses: item.associations }
    }
    setSelectedItem(item)
    setIsModalOpen(true)
    router.push(`${pathname}?open=${item.id}`, { scroll: false })
  }

  const handleCloseModal = () => {
      setIsModalOpen(false)
      router.push(pathname, { scroll: false })
  }

  const selectedState = selectedItem && context 
    ? (context.state[selectedItem.id] || { isOwned: false, isWishlisted: false }) 
    : { isOwned: false, isWishlisted: false }

  return (
    <div>
      {/* SCROLLABLE CATEGORY NAVIGATION */}
        <div className="mb-8 relative group">
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth">
            {['crystals', 'herbs', 'candles', 'runes', 'oils'].map((tab) => (
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
            key={activeTab} 
            title="Sanctuary Collection" 
            description="Your collected items."
            items={displayedItems}
            filterCategories={context?.filters || []}
            filterKey={context?.filterKey || ''}
            mode="modal"
            onItemClick={handleItemClick}
            
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
                    description="Items you wish to acquire."
                    items={wishlistItems}
                    filterCategories={context?.filters || []}
                    filterKey={context?.filterKey || ''}
                    mode="modal"
                    onItemClick={handleItemClick}
                    
                    userState={context?.state}
                    onToggleOwned={handleToggleOwned}
                    onToggleWishlist={handleToggleWishlist}
                />
            </div>
            </>
            )}
        
      {/* MODAL */}
      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        category={context?.category || 'general'}
        
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