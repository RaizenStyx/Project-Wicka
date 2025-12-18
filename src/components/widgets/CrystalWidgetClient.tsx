'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, Gem, Star } from 'lucide-react'
import { Crystal } from '@/app/types/database'
import SecureImage from '../features/SecureImage'

interface CollectionItem {
  id: string
  user_image_url: string | null
  is_owned: boolean      
  is_wishlisted: boolean 
  crystals: Crystal
}

interface WidgetClientProps {
  collection: CollectionItem[]
}

export default function CrystalWidgetClient({ collection }: WidgetClientProps) {
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null)
  const [activeTab, setActiveTab] = useState<'owned' | 'wishlisted'>('owned')

  // Filter the list based on the active tab
  const displayedItems = collection.filter((item) => {
    if (activeTab === 'owned') return item.is_owned;
    if (activeTab === 'wishlisted') return item.is_wishlisted;
    return false;
  });

  return (
    <div className="relative min-h-[320px] overflow-hidden flex flex-col"> 
      
      {/* 1. THE TABS */}
      <div className="flex border-b border-slate-800 bg-slate-900/50">
         <button
            onClick={() => { setActiveTab('owned'); setSelectedItem(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${
               activeTab === 'owned' 
                 ? 'text-purple-300 bg-purple-500/10 border-b-2 border-purple-500' 
                 : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
         >
            <Gem className="w-3 h-3" /> Satchel
            <span className={`  items-center justify-center text-[10px] font-bold uppercase ${ 
                activeTab === 'owned' 
                 ? 'opacity-100' 
                 : 'opacity-1'
            }`}
            >({displayedItems.length})</span>
         </button>
         <button
            onClick={() => { setActiveTab('wishlisted'); setSelectedItem(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${
               activeTab === 'wishlisted' 
                 ? 'text-amber-300 bg-amber-500/10 border-b-2 border-amber-500' 
                 : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
         >
            <Star className="w-3 h-3" /> Wishlist 
            <span className={`  items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${ 
                activeTab === 'wishlisted' 
                 ? 'opacity-100' 
                 : 'opacity-0'
            }`}
            >({displayedItems.length})</span>
         </button>
      </div>

      <div className="flex-1 relative p-3">
        <AnimatePresence mode="wait">
            
            {/* VIEW 1: THE GRID */}
            {!selectedItem ? (
            <motion.div
                key={`grid-${activeTab}`} // Unique key forces re-render animation on tab switch
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
                        title={item.crystals.name}
                    >
                        {item.user_image_url ? (
                        <SecureImage
                            path={item.user_image_url}
                            alt={item.crystals.name}
                            className="h-full w-full object-cover"
                        />
                        ) : (
                        <div
                            className="h-full w-full opacity-50 transition-opacity group-hover:opacity-100"
                            style={{ backgroundColor: item.crystals.color }}
                        />
                        )}
                        
                        {/* Tiny badge for wishlist items to distinguish them if needed */}
                        {activeTab === 'wishlisted' && (
                            <div className="absolute top-0.5 right-0.5">
                                <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
                            </div>
                        )}
                    </button>
                    ))}

                    <Link
                    href="/crystals"
                    className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-700 text-slate-600 transition-all hover:border-purple-500/50 hover:bg-slate-800 hover:text-purple-400"
                    >
                    <Plus className="h-4 w-4" />
                    </Link>
                </div>
                ) : (
                <div className="py-8 text-center">
                    <p className="mb-2 text-xs text-slate-500">
                        {activeTab === 'owned' ? "Your satchel is empty." : "No wishes yet."}
                    </p>
                    <Link
                    href="/crystals"
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
                    >
                    Browse Grimoire &rarr;
                    </Link>
                </div>
                )}
            </motion.div>
            ) : (

            /* VIEW 2: THE MINI DETAIL (SWAPPED IN) */
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
                    style={{ borderTop: `2px solid ${selectedItem.crystals.color}` }} 
                >
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="truncate font-serif text-sm font-medium text-slate-200">
                    {selectedItem.crystals.name}
                </span>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col">
                    {/* UPDATE: Image Display Logic */}
                    <div className="mb-3 w-full h-32 rounded overflow-hidden border border-slate-800 bg-slate-900 relative">
                        {selectedItem.user_image_url ? (
                            <SecureImage 
                                path={selectedItem.user_image_url} 
                                alt={selectedItem.crystals.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            // Fallback if no image uploaded
                            <div className="w-full h-full flex items-center justify-center bg-slate-900/50 text-center p-4">
                                <p className="text-[10px] text-slate-500">
                                    {selectedItem.is_owned 
                                       ? "No personal photo uploaded." 
                                       : "Add to collection to upload photo."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Mini Stats */}
                    <div className="mb-3 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="rounded bg-slate-900 px-2 py-1.5 border border-slate-800">
                            <span className="block text-slate-500">Element</span>
                            <span className="font-medium text-slate-300">{selectedItem.crystals.element}</span>
                        </div>
                        <div className="rounded bg-slate-900 px-2 py-1.5 border border-slate-800">
                            <span className="block text-slate-500">Meaning</span>
                            <span className="truncate font-medium text-slate-300" title={selectedItem.crystals.meaning}>
                                {selectedItem.crystals.meaning}
                            </span>
                        </div>
                    </div>
                    
                    {/* Footer Link */}
                    <Link 
                        href={`/crystals?open=${selectedItem.crystals.id}`}
                        className="mt-auto block w-full rounded border border-slate-700 py-1.5 text-center text-[10px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                    >
                        View Full Entry
                    </Link>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}