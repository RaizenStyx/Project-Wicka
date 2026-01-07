'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame, BookOpen, History, Image as ImageIcon, Sparkles, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow, addHours } from 'date-fns'
import { invokeDeity, banishDeity } from '@/app/actions/deity-invocation-actions'
import { createClient } from '@/app/utils/supabase/client'
import OfferingButton from './OfferingButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  deity: any
  
  // State flags
  isInvoked: boolean
  isOwned: boolean 
  isWishlisted: boolean // NEW PROP
  lastInvokedAt?: string | null
  lastOfferingAt?: string | null
  
  // Handlers
  onToggleWishlist: () => void // NEW PROP
}

export default function DeityModal({ 
  isOpen, 
  onClose, 
  deity, 
  isInvoked, 
  isOwned, 
  isWishlisted,
  lastInvokedAt, 
  lastOfferingAt,
  onToggleWishlist 
}: Props) {
  const [activeTab, setActiveTab] = useState<'grimoire' | 'ritual' | 'gallery'>('grimoire')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([]) 
  const [mounted, setMounted] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
        const targetTab = isInvoked ? 'ritual' : 'grimoire'
        setActiveTab(targetTab)
        if (targetTab === 'ritual') {
            fetchHistory()
        }
    }
  }, [isOpen, isInvoked])

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
        .from('deity_invocations')
        .select('*')
        .eq('user_id', user.id)
        .eq('deity_id', deity.id)
        .order('started_at', { ascending: false })
        .limit(10)
    if (data) setHistory(data)
  }

  const notifyStateChange = () => {
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('deity-state-changed'))
      }
      router.refresh()
  }

  const handleInvoke = async () => {
    setLoading(true)
    await invokeDeity(deity.id)
    notifyStateChange()
    setLoading(false)
    router.push('/sanctuary?view=altar')
    setActiveTab('ritual') 
    fetchHistory() 
  }

  const handleBanish = async () => {
    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to end your invocation of ${deity.name}? This will break the connection.`)) {
        return
    }
    setLoading(true)
    await banishDeity(deity.id)
    notifyStateChange()
    setLoading(false)
    onClose()
  }

  // Wrapper for the wishlist toggle to handle loading state/UI feedback if needed
  const handleAddToRoster = async () => {
      setLoading(true)
      await onToggleWishlist()
      setLoading(false)
  }

  if (!isOpen || !deity || !mounted) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        {/* MODAL CONTAINER */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]"
        >
            
            {/* LEFT SIDE */}
            <div className="w-full md:w-1/3 bg-slate-950 relative flex flex-col flex-shrink-0">
                <div className="relative h-40 md:h-full w-full">
                    <Image src={deity.image_url} alt={deity.name} fill className="object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full md:hidden backdrop-blur-sm z-10"><X size={18} /></button>
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                        <h2 className="text-2xl md:text-3xl font-serif text-white drop-shadow-lg leading-none mb-1">{deity.name}</h2>
                        <p className="text-purple-300 text-sm font-medium uppercase tracking-wider">{deity.pantheon}</p>
                    </div>
                </div>

                <div className="p-3 md:p-4 border-t border-slate-900 bg-slate-950">
                    
                    {/* --- ACTION BUTTON LOGIC --- */}
                    {!isInvoked ? (
                        <>
                            {/* STATE 1: Not in Roster -> Add to Roster */}
                            {!isWishlisted && (
                                <button onClick={handleAddToRoster} disabled={loading} className="w-full py-2 md:py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-sm md:text-base font-medium hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
                                    <PlusCircle size={16} />
                                    {loading ? 'Adding...' : 'Add to Roster'}
                                </button>
                            )}

                            {/* STATE 2: In Roster -> Invoke */}
                            {isWishlisted && (
                                <button onClick={handleInvoke} disabled={loading} className="w-full py-2 md:py-3 rounded-lg bg-gradient-to-r from-purple-900 to-slate-900 border border-purple-500/50 text-purple-100 text-sm md:text-base font-medium hover:from-purple-800 hover:to-slate-800 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]">
                                    <Sparkles size={16} />
                                    {loading ? 'Invoking...' : 'Invoke Deity'}
                                </button>
                            )}
                        </>
                    ) : (
                         /* STATE 3: Invoked -> Show Timer */
                         <div className="text-center p-2 rounded border border-purple-900/50 bg-purple-900/10">
                            <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-1">Currently Invoked</p>
                            <p className="text-white font-serif text-sm md:text-base">
                                {lastInvokedAt && formatDistanceToNow(addHours(new Date(lastInvokedAt), 24))} remaining
                            </p>
                         </div>
                    )}

                </div>
            </div>

            {/* RIGHT SIDE - CONTENT AREA */}
            <div className="flex-1 flex flex-col bg-slate-900 min-h-0">
                {/* Header (Tabs) */}
                <div className="flex items-center border-b border-slate-800 px-2 pt-2 bg-slate-900 flex-shrink-0">
                    <TabButton icon={<BookOpen size={14} />} label="Grimoire" active={activeTab === 'grimoire'} onClick={() => setActiveTab('grimoire')} />
                    <TabButton icon={<Flame size={14} />} label="Ritual" active={activeTab === 'ritual'} onClick={() => { setActiveTab('ritual'); fetchHistory(); }} />
                    
                    {/* GALLERY TAB: Now strictly controlled by isOwned */}
                    <TabButton 
                        icon={<ImageIcon size={14} />} 
                        label="Gallery" 
                        active={activeTab === 'gallery'} 
                        onClick={() => setActiveTab('gallery')} 
                        disabled={!isOwned} 
                        locked={!isOwned} 
                    />
                    
                    <button onClick={onClose} className="hidden md:block ml-auto p-3 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    
                    {activeTab === 'grimoire' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 pb-6">
                            <div className="space-y-6">
                                <div><h3 className="text-lg font-serif text-slate-200 mb-2">Lore</h3><p className="text-slate-400 text-sm leading-relaxed">{deity.description}</p></div>
                                <div><h3 className="text-lg font-serif text-slate-200 mb-2">Domains</h3><p className="text-slate-400 text-sm">{deity.domain?.join(', ')}</p></div>
                                <div><h3 className="text-lg font-serif text-slate-200 mb-2">Symbols</h3><p className="text-slate-400 text-sm">{deity.symbols?.join(', ')}</p></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ritual' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 pb-6">
                             {isInvoked && (
                                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 mb-6">
                                    <h3 className="text-purple-200 font-serif mb-4 flex items-center gap-2"><Flame size={18} className="text-purple-400" />Current Invocation</h3>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <OfferingButton 
                                                deityId={deity.id} 
                                                lastOfferingAt={lastOfferingAt || null} 
                                                onUpdate={notifyStateChange}
                                            />
                                        </div>

                                        <button onClick={handleBanish} className="px-4 py-3 rounded-full bg-slate-900 hover:bg-red-950/30 text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-900/50 transition-colors">
                                            Banish
                                        </button>
                                    </div>
                                </div>
                             )}
                             <div>
                                <h3 className="text-lg font-serif text-slate-200 mb-4 flex items-center gap-2"><History size={16} /> Past Invocations</h3>
                                {history.length === 0 && <p className="text-slate-500 text-sm">No recorded rituals.</p>}
                                {history.map(h => (
                                    <div key={h.id} className="p-3 mb-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                                        <span className="text-slate-400 text-sm">{new Date(h.started_at).toLocaleDateString()}</span>
                                        <span className="text-slate-600 text-xs">Recorded</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    
                     {activeTab === 'gallery' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in pb-6">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600"><ImageIcon size={32} /></div>
                            <h3 className="text-slate-300 font-medium">Personal Altar Image</h3>
                            <p className="text-slate-500 text-sm max-w-xs">Upload coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

function TabButton({ icon, label, active, onClick, disabled, locked }: any) {
    return (
        <button onClick={onClick} disabled={disabled} className={`flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium border-b-2 transition-colors relative flex-1 md:flex-none justify-center ${active ? 'border-purple-500 text-purple-200' : 'border-transparent text-slate-500 hover:text-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {icon} <span className="hidden md:inline">{label}</span> <span className="md:hidden">{label === 'Grimoire' ? 'Lore' : label}</span>
            {locked && <span className="absolute top-1 right-1 text-[8px] bg-slate-800 text-slate-500 px-1 rounded">LOCKED</span>}
        </button>
    )
}