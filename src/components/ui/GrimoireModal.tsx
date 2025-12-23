'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Sparkles, Image as ImageIcon, Star, Check, 
  Loader2, Upload, Camera, Disc, Moon, Sun, Flame, Wheat 
} from 'lucide-react' // Added specific icons
import { createClient } from '@/app/utils/supabase/client'

interface GrimoireModalProps {
  isOpen: boolean
  onClose: () => void
  item: any | null
  
  // NEW: Tell the modal what kind of item this is
  category: 'crystal' | 'herb' | 'deity' | 'general' 

  // User State & Actions
  isOwned: boolean
  isWishlisted: boolean
  userImage?: string | null
  onToggleOwned: () => void
  onToggleWishlist: () => void
  onImageUpload: (file: File) => Promise<string>
}

export default function GrimoireModal({ 
  isOpen, onClose, item, category = 'general',
  isOwned, isWishlisted, userImage,
  onToggleOwned, onToggleWishlist, onImageUpload
}: GrimoireModalProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'lore' | 'journey'>('lore')
  const [isUploading, setIsUploading] = useState(false)
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)

  useEffect(() => {
        if (isOpen) {
            if (userImage) {
                setActiveTab('journey')
            } else {
                setActiveTab('lore')
            }
        }
    }, [isOpen, userImage])

  // --- IMAGE LOGIC ---
  useEffect(() => {
    async function fetchSignedUrl() {
        if (!userImage) { setDisplayUrl(null); return }
        if (userImage.startsWith('blob:')) { setDisplayUrl(userImage); return }
        
        const { data } = await supabase.storage
            .from('user_uploads')
            .createSignedUrl(userImage, 3600)
        if (data?.signedUrl) setDisplayUrl(data.signedUrl)
    }
    if (isOpen) fetchSignedUrl()
  }, [userImage, isOpen, supabase])



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setIsUploading(true)
    try {
        const objectUrl = URL.createObjectURL(file)
        setDisplayUrl(objectUrl)
        await onImageUpload(file)
    } catch (error) {
        console.error("Upload failed", error)
        setDisplayUrl(null)
    } finally {
        setIsUploading(false)
    }
  }

  if (!isOpen || !item) return null

  const accentColor = item.color || '#a855f7'

  // Helper for generic lists
  const renderList = (label: string, data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null
    const list = Array.isArray(data) ? data.join(', ') : data
    return (
      <div className="mb-4">
        <h4 className="font-bold text-slate-200">{label}</h4>
        <p className="text-sm text-slate-400">{list}</p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 bg-slate-950 shadow-2xl"
            style={{ borderColor: accentColor }}
          >
             {/* IMAGE HEADER */}
             <div className="relative h-48 w-full bg-slate-900">
              {activeTab === 'journey' && displayUrl ? (
                 <img src={displayUrl} alt="My Personal Item" className="h-full w-full object-cover opacity-90" />
              ) : item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover opacity-80" />
              ) : (
                 <div className="flex h-full items-center justify-center"><ImageIcon className="h-12 w-12 text-slate-700" /></div>
              )}
              
              <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 cursor-pointer z-10"><X className="h-5 w-5" /></button>
              
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 to-transparent p-6 pt-12">
                 <h2 className="font-serif text-3xl text-white drop-shadow-md">{item.name}</h2>
                 <div className="flex gap-2 text-sm font-bold uppercase tracking-wider text-purple-400">
                    {/* Show Element if it exists */}
                    {item.element && <span>{item.element}</span>}
                 </div>
              </div>
            </div>

            {/* TABS HEADER */}
            <div className="flex border-b border-slate-800 px-6 pt-2">
                <button onClick={() => setActiveTab('lore')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === 'lore' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  Lore <motion.div animate={{ opacity: activeTab === 'lore' ? 1 : 0 }} className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: accentColor }} />
                </button>
                <button onClick={() => setActiveTab('journey')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === 'journey' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  My Journey <motion.div animate={{ opacity: activeTab === 'journey' ? 1 : 0 }} className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: accentColor }} />
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="max-h-[50vh] overflow-y-auto p-6 min-h-[300px]">
              
              {/* === LORE TAB (DYNAMIC CONTENT) === */}
              {activeTab === 'lore' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    
                    {/* 1. CRYSTAL LAYOUT */}
                    {category === 'crystal' && (
                        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                            <p>{item.meaning || item.description}</p>
                            
                            {/* The Grid from your Old System */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {/* Chakra Box */}
                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400">
                                        <Disc className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Chakra</h4>
                                        <p className="text-white text-sm font-medium">{item.chakra || 'Unknown'}</p> 
                                    </div>
                                </div>
                                {/* Zodiac Box */}
                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400">
                                        <Moon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Zodiac</h4>
                                        <p className="text-white text-sm font-medium">{item.zodiac || 'Unknown'}</p> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. HERB LAYOUT (Example structure) */}
                    {category === 'herb' && (
                        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                            <p>{item.description}</p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400"><Sun className="w-4 h-4" /></div>
                                    <div>
                                        <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Latin Name?</h4>
                                        <p className="text-white text-sm font-medium">{item.latin_name || 'Unknown'}</p> 
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400"><Wheat className="w-4 h-4" /></div>
                                    <div>
                                        <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Parts Used</h4>
                                        <p className="text-white text-sm font-medium">{item.parts_used || 'All'}</p> 
                                    </div>
                                </div>
                            </div>
                             {/* Specific Herb Lists */}
                            <div className="mt-6">
                                {renderList('Medical Uses', item.medical_uses)}
                                {renderList('Magical Uses', item.magical_uses)}
                            </div>
                        </div>
                    )}

                    {/* 3. DEITY LAYOUT (Example structure) */}
                    {category === 'deity' && (
                        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                            <p>{item.description}</p>
                            {/* Pantheon/Domain Grid */}
                            <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400"><Flame className="w-4 h-4" /></div>
                                    <div>
                                        <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Pantheon</h4>
                                        <p className="text-white text-sm font-medium">{item.pantheon}</p> 
                                    </div>
                                </div>
                            </div>
                            {renderList('Domains', item.domain)}
                            {renderList('Symbols', item.symbols)}
                        </div>
                    )}

                    {/* 4. FALLBACK / GENERAL LAYOUT */}
                    {category === 'general' && (
                        <div className="space-y-4">
                            <p className="mb-6 leading-relaxed text-slate-300">{item.description || item.meaning}</p>
                            {renderList('Associations', item.associations)}
                        </div>
                    )}

                </motion.div>
              )}

              {/* === JOURNEY TAB (MY UPLOADS) === */}
              {activeTab === 'journey' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex flex-col h-full">
                    {!isOwned ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <Sparkles className="w-12 h-12 text-slate-700" />
                            <p className="text-slate-400 max-w-xs">You must add this item to your Sanctuary before you can record your journey or upload photos.</p>
                            <button onClick={onToggleOwned} className="text-purple-400 hover:underline">Add to Sanctuary</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
                                {displayUrl ? (
                                    <div className="space-y-3">
                                        <p className="text-green-400 text-sm font-medium flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Image Uploaded</p>
                                        <label className="cursor-pointer text-xs text-slate-500 hover:text-white transition-colors">
                                            Click to replace image
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="mb-3 rounded-full bg-slate-800 p-3 text-slate-400">
                                            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                                        </div>
                                        <p className="text-sm text-slate-300">Upload your personal photo</p>
                                        <label className="mt-4 cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition-colors border text-white font-medium hover:brightness-110" style={{ backgroundColor: `${accentColor}20`, borderColor: `${accentColor}50` }}>
                                            <Upload className="w-3 h-3" /> Select Image
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                  </motion.div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 border-t border-slate-800 p-4 bg-slate-950">
                <button onClick={onToggleOwned} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors cursor-pointer ${isOwned ? 'bg-purple-900/50 text-purple-200 hover:bg-purple-900/70' : 'bg-slate-100 text-slate-900 hover:bg-white'}`}>
                  {isOwned ? <><Check className="h-4 w-4" /> In Sanctuary</> : <><Sparkles className="h-4 w-4" /> Add to Sanctuary</>}
                </button>
                <button onClick={onToggleWishlist} className={`flex items-center justify-center rounded-lg border px-4 transition-colors cursor-pointer ${isWishlisted ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}>
                   <Star className={`h-5 w-5 ${isWishlisted ? 'fill-amber-400' : ''}`} />
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}