'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Star, Plus } from 'lucide-react'
import Link from 'next/link'

// You can import your full CrystalCard here if you want full functionality (modals, etc.),
// but for this example, I'll use a display-only card to keep it clean.

export default function SanctuaryTabs({ initialCrystals }: { initialCrystals: any[] }) {
  const [activeTab, setActiveTab] = useState<'crystals' | 'herbs' | 'deities'>('crystals')

  // 1. Split the data based on flags
  // Note: An item can technically be in BOTH lists if your DB allows it, 
  // so we filter independently.
  const ownedCrystals = initialCrystals.filter(c => c.is_owned)
  const wishlistCrystals = initialCrystals.filter(c => c.is_wishlisted)

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
                className="space-y-12"
            >
                {/* --- SECTION 1: MY COLLECTION --- */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-serif text-slate-200">My Collection</h2>
                        <span className="text-xs font-bold bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full ml-2">
                            {ownedCrystals.length}
                        </span>
                    </div>

                    {ownedCrystals.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {ownedCrystals.map(item => (
                                <div key={item.id} className="group relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-purple-500/50 transition-colors">
                                    {/* Image Area */}
                                    <div className="aspect-square relative bg-slate-950">
                                        <img 
                                            src={item.user_image_url || item.crystals.image_url} 
                                            alt={item.crystals.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                        />
                                        {/* Overlay Gradient for Text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                                        
                                        <div className="absolute bottom-3 left-3">
                                            <h3 className="text-white font-serif font-bold text-lg leading-none mb-1">{item.crystals.name}</h3>
                                            <p className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">{item.crystals.element}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* "Add New" Placeholder Card */}
                            <Link href="/crystals" className="group flex flex-col items-center justify-center aspect-square rounded-xl border border-dashed border-slate-800 hover:border-purple-500 hover:bg-slate-900/50 transition-all">
                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-xs text-slate-500 font-medium">Add Crystal</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-center">
                            <p className="text-slate-500 text-sm mb-4">You haven't collected any crystals yet.</p>
                            <Link href="/crystals" className="text-purple-400 text-sm hover:underline">Browse the Database &rarr;</Link>
                        </div>
                    )}
                </section>


                {/* --- SECTION 2: WISHLIST --- */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-t border-slate-800 pt-8">
                        <Star className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-serif text-slate-200">Wishlist</h2>
                        <span className="text-xs font-bold bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full ml-2">
                            {wishlistCrystals.length}
                        </span>
                    </div>

                    {wishlistCrystals.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {wishlistCrystals.map(item => (
                                <div key={item.id} className="group relative rounded-lg bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-colors">
                                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                                        <img 
                                            src={item.crystals.image_url} 
                                            alt={item.crystals.name}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity grayscale group-hover:grayscale-0" 
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-slate-300 font-medium text-sm truncate">{item.crystals.name}</h3>
                                        <p className="text-[10px] text-slate-500 truncate">{item.crystals.meaning}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600 italic">Your wishlist is empty.</p>
                    )}
                </section>

            </motion.div>
        )}

        {/* --- PLACEHOLDERS FOR FUTURE TABS --- */}
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