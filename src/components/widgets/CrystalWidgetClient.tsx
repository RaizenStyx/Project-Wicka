'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, Camera, Upload } from 'lucide-react'
import { Crystal } from '@/app/types/crystal'

interface CollectionItem {
  id: string
  user_image_url: string | null
  crystals: Crystal
}

interface WidgetClientProps {
  collection: CollectionItem[]
}

export default function CrystalWidgetClient({ collection }: WidgetClientProps) {
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null)

  // Placeholder upload logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       console.log("Widget Upload:", e.target.files[0])
    }
  }

  return (
    <div className="relative min-h-[280px] overflow-hidden"> 
      {/* min-h-[280px] ensures the widget doesn't collapse/jump in height 
         too drastically when switching views 
      */}

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: THE GRID */}
        {!selectedItem ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-3"
          >
            {collection.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {collection.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group relative aspect-square w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 transition-colors hover:border-purple-500 cursor-pointer"
                    title={item.crystals.name}
                  >
                    {item.user_image_url ? (
                      <img
                        src={item.user_image_url}
                        alt={item.crystals.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full opacity-50 transition-opacity group-hover:opacity-100"
                        style={{ backgroundColor: item.crystals.color }}
                      />
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
                <p className="mb-2 text-xs text-slate-500">Your satchel is empty.</p>
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
                className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-3 py-2"
                style={{ borderTopColor: selectedItem.crystals.color }} // Subtle hint of color
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
            <div className="flex flex-1 flex-col p-3">
                
                {/* The Image Area */}
                {/* <div className="group relative mb-3 aspect-video w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                    {selectedItem.user_image_url ? (
                         <img 
                            src={selectedItem.user_image_url} 
                            alt="My Crystal" 
                            className="h-full w-full object-cover" 
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-slate-600">
                             <div 
                                className="absolute inset-0 opacity-10"
                                style={{ backgroundColor: selectedItem.crystals.color }}
                             />
                             <Camera className="mb-1 h-5 w-5 opacity-50" />
                             <span className="text-[10px]">No photo yet</span>
                        </div>
                    )} */}

                    {/* Quick Upload Overlay */}
                    {/* <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity backdrop-blur-sm group-hover:opacity-100">
                        <Upload className="mb-1 h-5 w-5 text-white" />
                        <span className="text-[10px] font-bold text-white">Change Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div> */}
                <div>Image upload will go here for personal images of your own crystals</div>

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
  )
}