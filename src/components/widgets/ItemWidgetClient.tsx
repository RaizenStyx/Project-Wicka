'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, Gem, Star, Wheat, Flame, Scroll, Droplet, Sparkles } from 'lucide-react'
import SecureImage from '../profile/SecureImage'
import { WidgetCollectionItem, WidgetClientProps } from '@/app/types/database'
import Image from 'next/image'

type Category = 'crystals' | 'herbs' | 'candles' | 'runes' | 'oils'

export default function ItemWidgetClient({ items }: WidgetClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('crystals')
  const [selectedItem, setSelectedItem] = useState<WidgetCollectionItem | null>(null)
  const [activeTab, setActiveTab] = useState<'owned' | 'wishlisted'>('owned')

  // 1. Filter by Category
  const categoryItems = items.filter(i => i.type === activeCategory)

  // 2. Filter by Tab (Satchel vs Wishlist)
  const displayedItems = categoryItems.filter((item) => {
    if (activeTab === 'owned') return item.is_owned;
    if (activeTab === 'wishlisted') return item.is_wishlisted;
    return false;
  });

  // Helper to get color for grid placeholders
  const getItemColor = (item: WidgetCollectionItem) => {
      if (item.data.color) return item.data.color;
      switch (item.type) {
          case 'herbs': return '#4ade80'; // Green
          case 'runes': return '#94a3b8'; // Slate
          case 'oils': return '#fbbf24';  // Amber
          default: return '#a855f7';      // Purple fallback
      }
  }

  // Helper to get Category Icon
  const CategoryIcon = () => {
      switch (activeCategory) {
          case 'crystals': return <Gem className="w-4 h-4 text-purple-400" />
          case 'herbs': return <Wheat className="w-4 h-4 text-green-400" />
          case 'candles': return <Flame className="w-4 h-4 text-orange-400" />
          case 'runes': return <Scroll className="w-4 h-4 text-slate-400" />
          case 'oils': return <Droplet className="w-4 h-4 text-yellow-400" />
      }
  }

  return (
    <div className="relative min-h-[380px] overflow-hidden flex flex-col bg-slate-900/50"> 
      
      {/* 1. CATEGORY SELECTOR (New Header) */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1 border-b border-slate-800">
         <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(['crystals', 'herbs', 'candles', 'runes', 'oils'] as Category[]).map(cat => (
                <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedItem(null); }}
                    className={`p-2 rounded-lg transition-all ${
                        activeCategory === cat 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                    title={cat.charAt(0).toUpperCase() + cat.slice(1)}
                >
                    {cat === 'crystals' && <Gem size={14} />}
                    {cat === 'herbs' && <Wheat size={14} />}
                    {cat === 'candles' && <Flame size={14} />}
                    {cat === 'runes' && <Scroll size={14} />}
                    {cat === 'oils' && <Droplet size={14} />}
                </button>
            ))}
         </div>
      </div>

      {/* 2. TAB TOGGLES (Satchel vs Wishlist) */}
      <div className="flex border-b border-slate-800 bg-slate-900/30">
         <button
            onClick={() => { setActiveTab('owned'); setSelectedItem(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
               activeTab === 'owned' 
                 ? 'text-purple-300 bg-purple-500/10 border-b-2 border-purple-500' 
                 : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
         >
            <Sparkles className="w-3 h-3" /> Collection
            <span className={`text-[9px] ${activeTab === 'owned' ? 'opacity-100' : 'opacity-60'}`}>
                ({categoryItems.filter(i => i.is_owned).length})
            </span>
         </button>
         <button
            onClick={() => { setActiveTab('wishlisted'); setSelectedItem(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
               activeTab === 'wishlisted' 
                 ? 'text-amber-300 bg-amber-500/10 border-b-2 border-amber-500' 
                 : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
         >
            <Star className="w-3 h-3" /> Wishlist 
            <span className={`text-[9px] ${activeTab === 'wishlisted' ? 'opacity-100' : 'opacity-60'}`}>
                ({categoryItems.filter(i => i.is_wishlisted).length})
            </span>
         </button>
      </div>

      <div className="flex-1 relative p-3">
        <AnimatePresence mode="wait">
            
            {/* VIEW A: THE GRID */}
            {!selectedItem ? (
            <motion.div
                key={`grid-${activeCategory}-${activeTab}`} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
            >
                {displayedItems.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                    {displayedItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`group relative aspect-square w-full overflow-hidden rounded-lg border bg-slate-900 transition-colors cursor-pointer ${
                            activeTab === 'wishlisted' 
                              ? 'border-slate-800 hover:border-amber-500/50' 
                              : 'border-slate-700 hover:border-purple-500'
                        }`}
                        title={item.data.name}
                    >
                        {item.user_image_url ? (
                        <SecureImage
                            path={item.user_image_url}
                            alt={item.data.name}
                            className="h-full w-full object-cover"
                        />
                        ) : (
                        <div
                            className="h-full w-full opacity-50 transition-opacity group-hover:opacity-100"
                            style={{ backgroundColor: getItemColor(item) }}
                        />
                        )}
                        
                        {activeTab === 'wishlisted' && (
                            <div className="absolute top-0.5 right-0.5">
                                <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
                            </div>
                        )}
                    </button>
                    ))}

                    <Link
                    href={`/sanctuary?view=${activeCategory}`} // Smart Link
                    className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-700 text-slate-600 transition-all hover:border-purple-500/50 hover:bg-slate-800 hover:text-purple-400"
                    >
                    <Plus className="h-4 w-4" />
                    </Link>
                </div>
                ) : (
                <div className="py-8 text-center">
                    <p className="mb-2 text-xs text-slate-500">
                        {activeTab === 'owned' ? `No ${activeCategory} collected.` : "Wishlist empty."}
                    </p>
                    <Link
                        href="/sanctuary"
                        className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
                    >
                    Go to Sanctuary &rarr;
                    </Link>
                </div>
                )}
            </motion.div>
            ) : (

            /* VIEW B: THE MINI DETAIL */
            <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex h-full flex-col"
            >
                {/* Header with Back Button */}
                <div 
                    className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 pb-2 mb-2"
                    style={{ borderTop: `2px solid ${getItemColor(selectedItem)}` }} 
                >
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <CategoryIcon />
                <span className="truncate font-serif text-sm font-medium text-slate-200">
                    {selectedItem.data.name}
                </span>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col">
                    <div className="mb-3 w-full h-32 rounded overflow-hidden border border-slate-800 bg-slate-900 relative">
                        {selectedItem.user_image_url ? (
                            <SecureImage 
                                path={selectedItem.user_image_url} 
                                alt={selectedItem.data.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : selectedItem.data.image_url ? (
                             <Image 
                                src={selectedItem.data.image_url} 
                                alt={selectedItem.data.name} 
                                className="w-full h-full object-cover opacity-80"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900/50 text-center p-4">
                                <p className="text-[10px] text-slate-500">
                                    No image available.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                            {selectedItem.data.meaning ? "Meaning" : "Description"}
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                            {selectedItem.data.meaning || selectedItem.data.description || "No details available."}
                        </p>
                    </div>
                    
                    {/* Footer Link */}
                    <Link 
                        href={`/sanctuary?open=${selectedItem.data.id}`}
                        className="mt-auto block w-full rounded border border-slate-700 py-1.5 text-center text-[10px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                    >
                        Open in Grimoire
                    </Link>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}