'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Camera, Sparkles, Star } from 'lucide-react'
import { Crystal } from '@/app/types/database'
import { updateCrystalState } from '@/app/actions/crystals'

interface CrystalModalProps {
  crystal: Crystal
  isOpen: boolean
  onClose: () => void
  isOwned: boolean
  isWishlisted: boolean
  onUpdate: (state: { isOwned: boolean; isWishlisted: boolean }) => void
  userImage?: string | null
}

export default function CrystalModal({ 
  crystal, 
  isOpen, 
  onClose, 
  isOwned,
  isWishlisted,
  onUpdate,
  userImage 
}: CrystalModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'my-crystal'>('info')
  const [isLoading, setIsLoading] = useState(false)
  
  // Unified handler for both buttons
  const handleUpdate = async (newState: { isOwned: boolean; isWishlisted: boolean }) => {
    if (isLoading) return
    setIsLoading(true)

    onUpdate(newState) // Optimistic update parent

    try {
        await updateCrystalState(crystal.id, newState)
    } catch (err) {
        console.error(err)
    } finally {
        setIsLoading(false)
    }
  }

  // Placeholder for image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       console.log("File selected:", e.target.files[0])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
          >
            {/* Header / Banner */}
            <div 
              className="relative h-32 w-full overflow-hidden"
              style={{ backgroundColor: crystal.color }} 
            >
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
               
               <button 
                 onClick={onClose}
                 className="absolute right-4 top-4 rounded-full bg-black/20 p-1 text-white hover:bg-black/40 transition-colors cursor-pointer"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
              {/* Title Section */}
              <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="font-serif text-3xl text-white drop-shadow-lg">{crystal.name}</h2>
                    <span className="text-sm text-purple-300 font-medium tracking-wide uppercase">{crystal.element} Element</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Wishlist Button (Small) */}
                    <button
                        onClick={() => handleUpdate({ isOwned, isWishlisted: !isWishlisted })}
                        disabled={isLoading}
                        className={`rounded-full p-2 transition-colors border cursor-pointer ${
                            isWishlisted 
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Star className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Collection Button (Main) */}
                    <button
                    onClick={() => handleUpdate({ isOwned: !isOwned, isWishlisted })}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isOwned 
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                    >
                    {isOwned ? (
                        <> <Sparkles className="w-3 h-3" /> Collected </>
                    ) : (
                        "Add to Collection"
                    )}
                    </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 mb-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-2 px-4 text-sm font-medium transition-colors relative cursor-pointer ${
                    activeTab === 'info' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Grimoire Info
                  {activeTab === 'info' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
                </button>
                <button
                  onClick={() => setActiveTab('my-crystal')}
                  className={`pb-2 px-4 text-sm font-medium transition-colors relative cursor-pointer ${
                    activeTab === 'my-crystal' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  My Crystal
                  {activeTab === 'my-crystal' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'info' ? (
                  <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                    <p>{crystal.meaning}</p>
                    {/* Placeholder data */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Chakra</h4>
                            <p className="text-white">Third Eye, Crown (Placeholder for now)</p> 
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Zodiac</h4>
                            <p className="text-white">Aquarius, Pisces (Placeholder for now)</p> 
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    {isOwned ? (
                        <div className="w-full">
                            {/* PLACEHOLDER: Image Upload Logic */}
                             {userImage ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700">
                                    <img src={userImage} alt="My Crystal" className="object-cover w-full h-full" />
                                    <button className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                         Change Photo
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500">
                                         <Camera className="w-6 h-6" />
                                    </div>
                                    <p className="text-slate-300 text-sm mb-1">Upload your crystal</p>
                                    <p className="text-slate-500 text-xs mb-4">Show off your personal stone</p>
                                    
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs rounded-lg transition-colors">
                                         <Upload className="w-3 h-3" />
                                         Select Image
                                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-8">
                            <p>You must add this crystal to your collection <br /> before you can upload photos.</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}