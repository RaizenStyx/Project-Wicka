'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Sparkles, Flame, Loader2 } from 'lucide-react'
import Image from 'next/image'
import DeityModal from '@/components/deities/DeityModal'
import { updateDeityState } from '@/app/actions/deity-actions'
import { banishDeity } from '@/app/actions/deity-invocation-actions'

// Types
interface WidgetDeity {
  deity_id: string;
  is_invoked: boolean;
  last_invoked_at: string | null;
  last_offering_at: string | null;
  is_owned: boolean;
  is_wishlisted: boolean; 
  deities: {
    id: string;
    name: string;
    title: string;
    image_url: string;
    pantheon: string;
    domain: string[];
    description: string;
    symbols: string[];
  }
}

export default function DeityWidget() {
  const [loading, setLoading] = useState(true)
  const [invokedDeity, setInvokedDeity] = useState<WidgetDeity | null>(null)
  const [roster, setRoster] = useState<WidgetDeity[]>([])
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isBanishing, setIsBanishing] = useState(false)
  
  // Modal State
  const [selectedDeity, setSelectedDeity] = useState<WidgetDeity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const supabase = createClient()
  const banishAttempted = useRef(false) // Prevent double-firing banish

  useEffect(() => {
    fetchWidgetData()
  }, [])

  // 3. LISTEN FOR GLOBAL UPDATES
  useEffect(() => {
      const handleStateChange = () => {
          fetchWidgetData();
      };

      window.addEventListener('deity-state-changed', handleStateChange);
      return () => {
          window.removeEventListener('deity-state-changed', handleStateChange);
      };
  }, []);

  // --- OPTIMIZED TIMER & AUTO-BANISH LOGIC ---
  useEffect(() => {
    if (!invokedDeity?.last_invoked_at) return

    const calculateTime = async () => {
        const now = new Date().getTime()
        const start = new Date(invokedDeity.last_invoked_at!).getTime()
        const end = start + (24 * 60 * 60 * 1000) // 24 hours in ms
        const diff = end - now

        if (diff <= 0) {
            // TIME EXPIRED
            if (!banishAttempted.current) {
                console.log("Invocation expired. Banishing...")
                banishAttempted.current = true
                setIsBanishing(true)
                try {
                    await banishDeity(invokedDeity.deity_id)
                    // Short delay to allow DB propagation before refresh
                    setTimeout(() => {
                        fetchWidgetData()
                        banishAttempted.current = false // Reset for next time
                        setIsBanishing(false)
                    }, 1000)
                } catch (err) {
                    console.error("Auto-banish failed:", err)
                    setIsBanishing(false)
                }
            }
            setTimeLeft('Expiring...')
        } else {
            // COUNTDOWN
            const h = Math.floor(diff / (1000 * 60 * 60))
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            setTimeLeft(`${h}h ${m}m`)
        }
    }

    // Run immediately, then every minute
    calculateTime()
    const interval = setInterval(calculateTime, 60000)

    return () => clearInterval(interval)
  }, [invokedDeity])


  // --- OPTIMIZED FETCHING ---
  const fetchWidgetData = async () => {
    // Only show loading on initial mount, not on silent refreshes
    if (!invokedDeity && roster.length === 0) setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Run queries in parallel for speed
    const [activeReq, listReq] = await Promise.all([
        supabase
            .from('user_deities')
            .select('*, deities(*)')
            .eq('user_id', user.id)
            .eq('is_invoked', true)
            .maybeSingle(),
        
        supabase
            .from('user_deities')
            .select('*, deities(*)')
            .eq('user_id', user.id)
            .eq('is_wishlisted', true)
            .neq('is_invoked', true)
            .order('created_at', { ascending: false })
    ])

    if (activeReq.data) {
        setInvokedDeity(activeReq.data)
        // Reset banish ref if we successfully fetched a new active deity
        banishAttempted.current = false 
    } else {
        setInvokedDeity(null)
    }
    
    if (listReq.data) setRoster(listReq.data)
    
    setLoading(false)
  }

  const openModal = (item: WidgetDeity) => {
    setSelectedDeity(item)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
      setIsModalOpen(false)
      fetchWidgetData() 
  }

  const handleToggleWishlist = async (deityId: string) => {
      if (!selectedDeity) return

      const newVal = !selectedDeity.is_wishlisted
      
      // Optimistic Update
      setSelectedDeity({ ...selectedDeity, is_wishlisted: newVal })

      await updateDeityState(deityId, { 
          isOwned: selectedDeity.is_owned, 
          isWishlisted: newVal 
      })

      fetchWidgetData()
  }

  if (loading) return <div className="h-48 rounded-xl bg-slate-900/50 animate-pulse border border-slate-800" />

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-500">
        
        {/* --- VIEW A: INVOKED STATE --- */}
        {invokedDeity ? (
             <div className="relative p-6 flex flex-col items-center text-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-slate-900 pointer-events-none" />
                
                <div className="relative mb-3 group cursor-pointer" onClick={() => openModal(invokedDeity)}>
                     <div className="w-20 h-20 rounded-full border-2 border-purple-500 p-1 shadow-[0_0_20px_#a855f7]">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image 
                                src={invokedDeity.deities.image_url} 
                                alt={invokedDeity.deities.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                     </div>
                     <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700">
                        <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
                     </div>
                </div>

                <h3 className="font-serif text-xl text-purple-200">{invokedDeity.deities.name}</h3>
                <p className="text-xs text-purple-400/70 uppercase tracking-widest mb-4">Invocation Active</p>

                <div className="w-full bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 backdrop-blur-sm relative overflow-hidden">
                    {isBanishing ? (
                        <div className="flex items-center justify-center gap-2 text-orange-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Banishing...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-slate-400">Time Remaining</p>
                            <p className="font-mono text-sm text-slate-200">{timeLeft}</p>
                        </>
                    )}
                </div>

                <button 
                    onClick={() => openModal(invokedDeity)}
                    className="absolute top-2 right-2 text-slate-600 hover:text-purple-400"
                >
                    <Sparkles size={14} />
                </button>
             </div>
        ) : (
            /* --- VIEW B: ROSTER (CAROUSEL) --- */
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-slate-200 flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-400" /> 
                        Spirit Roster
                    </h3>
                    <span className="text-xs text-slate-500">{roster.length} Avail</span>
                </div>

                {roster.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">
                        <p>No deities in roster.</p>
                        <a href="/deities" className="text-purple-400 hover:underline">Explore Pantheon</a>
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x custom-scrollbar">
                        {roster.map((item) => (
                            <button 
                                key={item.deity_id}
                                onClick={() => openModal(item)}
                                className="flex-shrink-0 snap-start w-16 flex flex-col items-center gap-1 group"
                            >
                                <div className="w-14 h-14 rounded-full border border-slate-700 overflow-hidden group-hover:border-purple-500 transition-colors">
                                    <Image 
                                        src={item.deities.image_url} 
                                        alt={item.deities.name} 
                                        width={56} height={56} 
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100"
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 truncate w-full text-center group-hover:text-purple-300">
                                    {item.deities.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* REUSABLE MODAL */}
        <DeityModal 
            isOpen={isModalOpen}
            onClose={handleModalClose}
            deity={selectedDeity?.deities}
            isInvoked={selectedDeity?.is_invoked || false}
            isOwned={selectedDeity?.is_owned || false}
            isWishlisted={selectedDeity?.is_wishlisted || false}
            lastInvokedAt={selectedDeity?.last_invoked_at}
            lastOfferingAt={selectedDeity?.last_offering_at}
            onToggleWishlist={() => selectedDeity && handleToggleWishlist(selectedDeity.deity_id)}
        />
    </div>
  )
}