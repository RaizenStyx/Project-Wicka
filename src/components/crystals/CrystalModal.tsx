'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Camera, Sparkles, Star, Disc, Moon, Loader2 } from 'lucide-react'
import { Crystal } from '@/app/types/database'
import { updateCrystalState, saveUserCrystalImage } from '@/app/actions/crystal-actions'
import { createClient } from '@/app/utils/supabase/client' 
import SecureImage from '../features/SecureImage'

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
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'info' | 'my-crystal'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch Signed URL
  useEffect(() => {
    async function fetchSignedUrl() {
        if (!userImage) {
            setDisplayUrl(null)
            return
        }

        if (userImage.startsWith('blob:')) {
            setDisplayUrl(userImage)
            return
        }

        const { data, error } = await supabase.storage
            .from('user_uploads')
            .createSignedUrl(userImage, 3600)

        if (data?.signedUrl) {
            setDisplayUrl(data.signedUrl)
        }
    }

    if (isOpen) {
        fetchSignedUrl()
    }
  }, [userImage, isOpen, supabase]) // Added supabase to dependency array

  const handleUpdate = async (newState: { isOwned: boolean; isWishlisted: boolean }) => {
    if (isLoading) return
    setIsLoading(true)
    onUpdate(newState) 
    try {
        await updateCrystalState(crystal.id, newState)
    } catch (err) {
        console.error(err)
    } finally {
        setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    setIsUploading(true)

    try {
        // CHANGE 3: Now this works because the client can read the auth cookie!
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            throw new Error("User not found - are you logged in?")
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${crystal.id}_${Date.now()}.${fileExt}`
        
        // This path matches your RLS policy (user_id/filename)
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('user_uploads')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        await saveUserCrystalImage(crystal.id, filePath)

        const objectUrl = URL.createObjectURL(file)
        setDisplayUrl(objectUrl)

    } catch (error) {
        console.error("Error uploading image:", error)
        alert("Failed to upload image. Please try again.")
    } finally {
        setIsUploading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ 
              borderColor: crystal.color,
              boxShadow: `0 0 40px -10px ${crystal.color}40`
            }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 bg-slate-950"
          >
            {/* Header / Banner */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <div className="absolute inset-0 opacity-50" style={{ backgroundColor: crystal.color }} />
              
              {/* CONDITIONAL LOGIC FOR BANNER IMAGE */}
              {userImage ? (
                <div className="absolute inset-0 w-full h-full opacity-80">
                    <SecureImage path={userImage} alt={crystal.name} className="w-full h-full object-cover" />
                </div>
              ) : crystal.image_url ? (
                <img 
                  src={crystal.image_url} 
                  alt={crystal.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              ) : null}

              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-black/40 p-1 text-white hover:bg-black/60 transition-colors cursor-pointer z-10 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
              <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="font-serif text-3xl text-white drop-shadow-lg mb-2">{crystal.name}</h2>
                    <span 
                      className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md border border-white/10 shadow-sm"
                      style={{ 
                        backgroundColor: crystal.color,
                        color: '#ffffff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }} 
                    >
                      {crystal.element} Element
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleUpdate({ isOwned, isWishlisted: !isWishlisted })}
                        disabled={isLoading}
                        className={`rounded-full p-2 transition-colors border cursor-pointer ${
                            isWishlisted 
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                            : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                    >
                        <Star className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    <button
                    onClick={() => handleUpdate({ isOwned: !isOwned, isWishlisted })}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        isOwned 
                        ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                        : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
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
                  {activeTab === 'info' && (
                    <motion.div 
                        layoutId="tab" 
                        className="absolute bottom-0 left-0 w-full h-0.5" 
                        style={{ backgroundColor: crystal.color }} 
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('my-crystal')}
                  className={`pb-2 px-4 text-sm font-medium transition-colors relative cursor-pointer ${
                    activeTab === 'my-crystal' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  My Crystal
                  {activeTab === 'my-crystal' && (
                    <motion.div 
                        layoutId="tab" 
                        className="absolute bottom-0 left-0 w-full h-0.5" 
                        style={{ backgroundColor: crystal.color }} 
                    />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'info' ? (
                  <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                    <p>{crystal.meaning}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400">
                                <Disc className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Chakra</h4>
                                <p className="text-white text-sm font-medium">{crystal.chakra || 'Unknown'}</p> 
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-slate-400">
                                <Moon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Zodiac</h4>
                                <p className="text-white text-sm font-medium">{crystal.zodiac || 'Unknown'}</p> 
                            </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    {isOwned ? (
                        <div className="w-full">
                             {displayUrl ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700 group">
                                    <img src={displayUrl} alt="My Crystal" className="object-cover w-full h-full" />
                                    
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <div className="bg-black/80 text-white text-xs px-3 py-2 rounded backdrop-blur-md flex items-center gap-2">
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {isUploading ? "Uploading..." : "Change Photo"}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                    </label>
                                </div>
                            ) : (
                                <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500">
                                         {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                                    </div>
                                    <p className="text-slate-300 text-sm mb-1">{isUploading ? 'Uploading...' : 'Upload your crystal'}</p>
                                    <p className="text-slate-500 text-xs mb-4">Show off your personal stone</p>
                                    
                                    <label 
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition-colors border text-white font-medium hover:brightness-110"
                                        style={{ 
                                            backgroundColor: `${crystal.color}20`, 
                                            borderColor: `${crystal.color}50`
                                        }}
                                    >
                                         <Upload className="w-3 h-3" />
                                         Select Image
                                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
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