'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Camera, Sparkles } from 'lucide-react'
import { Crystal } from '@/app/types/crystal'
import { toggleCrystalCollection } from '@/app/actions/crystals'

interface CrystalModalProps {
  crystal: Crystal
  isOpen: boolean
  onClose: () => void
  isCollected: boolean
  userImage?: string | null
}

export default function CrystalModal({ 
  crystal, 
  isOpen, 
  onClose, 
  isCollected, 
  userImage 
}: CrystalModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'my-crystal'>('info')
  
  // Local state for the toggle button inside the modal
  const [collectedState, setCollectedState] = useState(isCollected)

  const handleToggle = async () => {
    setCollectedState(!collectedState)
    await toggleCrystalCollection(crystal.id, collectedState)
  }

  // Placeholder for future implementation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       console.log("File selected:", e.target.files[0])
       // TODO: 1. Upload to Supabase Storage
       // TODO: 2. Get Public URL
       // TODO: 3. Call Server Action to update 'user_image_url' in 'user_crystal_collection'
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
              style={{ backgroundColor: crystal.color }} // Fallback color
            >
               {/* Pattern Overlay to make it look "Witchy" */}
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
                
                {/* Main Action Button */}
                <button
                  onClick={handleToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    collectedState 
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {collectedState ? (
                    <>
                      <Sparkles className="w-3 h-3" /> Collected
                    </>
                  ) : (
                    "Add to Collection"
                  )}
                </button>
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
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Chakra</h4>
                            <p className="text-white">Third Eye, Crown (Placeholder, need to column to DB)</p> 
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Zodiac</h4>
                            <p className="text-white">Aquarius, Pisces (Placeholder, need to column to DB)</p> 
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    {collectedState ? (
                        <div className="w-full">
                            <div>Image upload will go here for personal images of your own crystals</div>
                            {/* {userImage ? (
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
                            )} */}
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