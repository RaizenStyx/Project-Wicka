'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' 
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Clock, BookOpen } from 'lucide-react'
import { formatDistanceToNow, addHours } from 'date-fns'
import { banishDeity, extendInvocation } from '@/app/actions/deity-invocation-actions'
import OfferingButton from '@/components/deities/OfferingButton'
import DeityModal from '@/components/deities/DeityModal'

interface Props {
  invokedDeity: any | null 
  roster: any[] 
  userDeityState: Record<string, any> 
}

export default function DeityAltarView({ invokedDeity, roster, userDeityState }: Props) {
  const [selectedDeity, setSelectedDeity] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const getTimeRemaining = () => {
    if (!invokedDeity?.last_invoked_at) return ''
    const endTime = addHours(new Date(invokedDeity.last_invoked_at), 24)
    return formatDistanceToNow(endTime)
  }

  // --- ACTIONS ---

  // Helper to sync Sidebar Widget + Main Page
  const notifyStateChange = () => {
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('deity-state-changed'))
      }
      router.refresh()
  }

  const handleBanishActive = async () => {
      if (!invokedDeity) return

      // 1. CONFIRMATION
      if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to end your invocation of ${invokedDeity.deities.name}? This will break the connection.`)) {
          return
      }

      setLoading(true)
      // 2. SERVER ACTION
      await banishDeity(invokedDeity.deities.id)
      
      // 3. UPDATE WIDGET & PAGE
      notifyStateChange()
      setLoading(false)
  }

  const handleExtendActive = async () => {
      if (!invokedDeity) return
      setLoading(true)
      await extendInvocation(invokedDeity.deities.id)
      notifyStateChange()
      setLoading(false)
  }

  // --- MODAL HANDLERS ---

  const handleOpenRosterItem = (item: any) => {
    setSelectedDeity(item.deities)
    setIsModalOpen(true)
  }

  const handleOpenInvoked = () => {
    if (!invokedDeity) return
    setSelectedDeity(invokedDeity.deities)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[50vh] flex flex-col items-center justify-center p-8 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/50">
        <div className="absolute inset-0 z-0">
            {invokedDeity ? (
                 <div className="w-full h-full bg-gradient-to-b from-purple-900/20 via-slate-950 to-slate-950" />
            ) : (
                 <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-50" />
            )}
        </div>

        <div className="relative z-10 text-center max-w-2xl w-full">
            <AnimatePresence mode="wait">
                {invokedDeity ? (
                    <motion.div 
                        key="invoked"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center"
                    >
                        {/* THE CARD */}
                        <div className="relative w-48 h-72 mb-8 rounded-xl shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] overflow-hidden border border-purple-500/30 group cursor-pointer"
                             onClick={handleOpenInvoked}
                        >
                             <Image 
                                src={invokedDeity.deities.image_url} 
                                alt={invokedDeity.deities.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                             <div className="absolute bottom-4 left-0 right-0 text-center">
                                <span className="text-purple-200 font-serif text-xl">{invokedDeity.deities.name}</span>
                             </div>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-purple-400 mb-2">
                            {invokedDeity.deities.name} is Present
                        </h2>
                        
                        {/* CONTROLS */}
                        <div className="flex flex-wrap gap-4 justify-center mt-8">
                            <OfferingButton 
                                deityId={invokedDeity.deities.id}
                                lastOfferingAt={invokedDeity.last_offering_at}
                                onUpdate={notifyStateChange}
                            />

                             <button 
                                onClick={handleBanishActive}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-colors disabled:opacity-50"
                             >
                                <X size={18} />
                                <span>End Invocation</span>
                             </button>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-widest">
                            <Clock size={12} />
                            <span>Remains for {getTimeRemaining()}</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="mx-auto w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                            <BookOpen className="text-slate-700" size={32} />
                        </div>
                        <h2 className="text-3xl font-serif text-slate-300">The Altar is Quiet</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Select a deity from your Roster below to begin an invocation.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </section>

      {/* ROSTER SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-lg font-serif text-slate-400">Your Roster</h3>
            <span className="text-xs text-slate-600 uppercase tracking-wider">{roster.length} Deities</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 px-2 snap-x custom-scrollbar">
            {roster.map((item) => (
                <button
                    key={item.deity_id}
                    onClick={() => handleOpenRosterItem(item)}
                    className="flex-shrink-0 snap-start w-32 group relative"
                >
                    <div className={`
                        aspect-[3/4] rounded-lg overflow-hidden border mb-3 transition-all duration-300
                        ${invokedDeity?.deity_id === item.deity_id 
                            ? 'border-purple-500 ring-2 ring-purple-500/20' 
                            : 'border-slate-800 group-hover:border-slate-600'
                        }
                    `}>
                        <Image 
                            src={item.deities.image_url} 
                            alt={item.deities.name}
                            width={200} height={300}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                         {invokedDeity?.deity_id === item.deity_id && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
                        )}
                    </div>
                    <p className="text-sm font-medium text-center truncate text-slate-400 group-hover:text-slate-200">
                        {item.deities.name}
                    </p>
                </button>
            ))}

            <a href="/deities" className="flex-shrink-0 snap-start w-32 flex flex-col gap-3">
                <div className="aspect-[3/4] rounded-lg border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center text-slate-600 hover:text-purple-400 hover:border-purple-500/50 transition-colors">
                    <span className="text-2xl">+</span>
                </div>
                <p className="text-sm text-slate-500 text-center">Add Deity</p>
            </a>
        </div>
      </section>

      {/* MODAL */}
      <DeityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deity={selectedDeity ? { ...selectedDeity, id: selectedDeity.id } : null}
        
        // Pass dynamic Invocation status
        isInvoked={selectedDeity?.id === invokedDeity?.deity_id}
        
        isOwned={false} 
        lastInvokedAt={selectedDeity?.id === invokedDeity?.deity_id ? invokedDeity?.last_invoked_at : null}
        lastOfferingAt={selectedDeity?.id === invokedDeity?.deity_id ? invokedDeity?.last_offering_at : null}
      />
    </div>
  )
}