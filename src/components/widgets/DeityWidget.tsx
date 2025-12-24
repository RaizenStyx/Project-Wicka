'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Flame, Sparkles, Edit2, Search, BookOpen } from 'lucide-react'
import { formatDistanceToNow, addHours, isAfter } from 'date-fns'

// Define the shape of the data we get from the join
interface UserDeity {
  id: string; 
  deity_id: string;
  is_patron: boolean;
  last_offering_at: string | null;
  deities: {
    name: string;
    title: string;
    // Add icon/image here 
  }
}

export default function DeityWidget() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  
  // Data State
  const [activePatron, setActivePatron] = useState<UserDeity | null>(null)
  const [customDeity, setCustomDeity] = useState<any>(null) // Fallback for custom names
  
  // Offering State
  const [offeringActive, setOfferingActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  // Search State
  const [userCollection, setUserCollection] = useState<UserDeity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')

  const supabase = createClient()

  // 1. INITIAL LOAD
  useEffect(() => {
    loadWidgetData()
  }, [])

  // 2. CHECK OFFERING STATUS (Run every minute)
  useEffect(() => {
    const checkTimer = () => {
      let lastTime = null
      
      if (activePatron?.last_offering_at) {
        lastTime = new Date(activePatron.last_offering_at)
      } else if (customDeity?.last_offering_at) {
        lastTime = new Date(customDeity.last_offering_at)
      }

      if (lastTime) {
        // Offerings last 24 hours
        const endTime = addHours(lastTime, 24)
        if (isAfter(endTime, new Date())) {
          setOfferingActive(true)
          setTimeLeft(formatDistanceToNow(endTime) + ' left')
        } else {
          setOfferingActive(false)
          setTimeLeft('')
        }
      } else {
        setOfferingActive(false)
      }
    }

    checkTimer()
    const interval = setInterval(checkTimer, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [activePatron, customDeity])

  const loadWidgetData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // A. Check user_deities for a "Patron"
    const { data: dbPatron } = await supabase
      .from('user_deities')
      .select('*, deities(name, title)')
      .eq('user_id', user.id)
      .eq('is_patron', true)
      .maybeSingle() // Use maybeSingle to avoid errors if none exists

    if (dbPatron) {
      setActivePatron(dbPatron)
      setCustomDeity(null)
      setMode('view')
    } else {
      // B. If no DB Patron, check Preferences for Custom
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()
      
      const customPref = profile?.preferences?.deity
      if (customPref) {
        setCustomDeity(customPref)
        setActivePatron(null)
        setMode('view')
      } else {
        setMode('edit')
      }
    }
    setLoading(false)
  }

  // 3. FETCH USER'S COLLECTION (For Search Mode)
  const fetchCollection = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch owned OR wishlisted deities
    const { data } = await supabase
      .from('user_deities')
      .select('*, deities(name, title)')
      .eq('user_id', user.id)
      .or('is_owned.eq.true,is_wishlisted.eq.true')
    
    if (data) {
      setUserCollection(data)
    }
  }

  // Trigger fetch when entering edit mode
  useEffect(() => {
    if (mode === 'edit') fetchCollection()
  }, [mode])

  // 4. SAVE SELECTION (DB DEITY)
  const selectPatron = async (rowId: string) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Reset old patrons
    await supabase
      .from('user_deities')
      .update({ is_patron: false })
      .eq('user_id', user.id)

    // 2. Set new patron
    await supabase
      .from('user_deities')
      .update({ is_patron: true })
      .eq('id', rowId)

    // 3. Clear custom preference (so DB takes priority)
    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
    const currentPrefs = profile?.preferences || {}
    const { deity, ...rest } = currentPrefs; // Remove deity key
    
    await supabase
      .from('profiles')
      .update({ preferences: rest })
      .eq('id', user.id)

    await loadWidgetData()
    setMode('view')
  }

  // 5. SAVE SELECTION (CUSTOM)
  const saveCustomDeity = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Reset any DB patrons
    await supabase
      .from('user_deities')
      .update({ is_patron: false })
      .eq('user_id', user.id)

    // 2. Save to Preferences
    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
    const currentPrefs = profile?.preferences || {}
    const newCustomData = { name: customName, title: 'Personal Deity', id: 'custom', last_offering_at: null }

    await supabase
      .from('profiles')
      .update({ preferences: { ...currentPrefs, deity: newCustomData } })
      .eq('id', user.id)

    await loadWidgetData()
    setMode('view')
  }

  // 6. MAKE OFFERING (Light Candle)
  const makeOffering = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const now = new Date().toISOString()

    if (activePatron) {
      // Update DB Timestamp
      await supabase
        .from('user_deities')
        .update({ last_offering_at: now })
        .eq('id', activePatron.id)
      
      // Optimistic update
      setActivePatron({ ...activePatron, last_offering_at: now })
    } else if (customDeity) {
      // Update Preference JSON
      const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
      const currentPrefs = profile?.preferences || {}
      
      const updatedDeity = { ...customDeity, last_offering_at: now }
      
      await supabase
        .from('profiles')
        .update({ preferences: { ...currentPrefs, deity: updatedDeity } })
        .eq('id', user.id)
      
      setCustomDeity(updatedDeity)
    }
  }

  // --- FILTER FOR SEARCH ---
  const filteredCollection = userCollection.filter(item => 
    item.deities.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && !activePatron && !customDeity) return <div className="h-40 rounded-xl bg-slate-900/50 animate-pulse" />

  // --- EDIT MODE ---
  if (mode === 'edit') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-purple-400 font-serif text-lg mb-4 flex items-center gap-2">
           <Sparkles size={18} /> Select Patron
        </h3>
        
        {!showCustomInput ? (
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Search your collection..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {userCollection.length === 0 && (
                       <p className="text-xs text-slate-500 p-2">You haven't added any deities to your collection yet.</p>
                    )}
                    
                    {filteredCollection.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => selectPatron(item.id)}
                            className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors text-left group"
                        >
                            <span className="text-slate-200 text-sm font-medium">{item.deities.name}</span>
                            <span className="text-xs text-slate-500 group-hover:text-purple-400">
                                {item.deities.title}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                    <button 
                        onClick={() => setShowCustomInput(true)}
                        className="text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                        <Edit2 size={12} /> Use Custom Name instead
                    </button>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                 <input 
                    type="text" 
                    placeholder="Enter Custom Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                />
                <div className="flex gap-2">
                    <button 
                        onClick={saveCustomDeity}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm py-2 rounded-lg font-medium"
                        disabled={!customName.trim()}
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={() => setShowCustomInput(false)}
                        className="px-3 py-2 text-slate-400 hover:text-slate-200 text-sm"
                    >
                        Back
                    </button>
                </div>
            </div>
        )}
      </div>
    )
  }

  // --- VIEW MODE ---
  // Determine display data
  const displayName = activePatron ? activePatron.deities.name : customDeity?.name
  const displayTitle = activePatron ? activePatron.deities.title : customDeity?.title

  return (
    <div className={`
      relative overflow-hidden rounded-xl border p-6 transition-all duration-700
      ${offeringActive 
        ? 'bg-gradient-to-t from-orange-950/30 to-slate-900 border-orange-900/50 shadow-[0_0_30px_-5px_rgba(251,146,60,0.1)]' 
        : 'bg-slate-900 border-slate-800'
      }
    `}>
      <button 
        onClick={() => setMode('edit')}
        className="absolute top-3 right-3 text-slate-600 hover:text-purple-400 transition-colors"
      >
        <Edit2 size={14} />
      </button>

      <div className="text-center">
        {/* Simple Icon Placeholder */}
        <div className="text-4xl mb-3 drop-shadow-md flex justify-center text-purple-200">
             <BookOpen />
        </div>
        
        <h3 className="font-serif text-xl text-slate-200">{displayName}</h3>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">{displayTitle}</p>
        
        <button
          onClick={makeOffering}
          disabled={offeringActive}
          className={`
            group relative inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-500
            ${offeringActive 
              ? 'bg-orange-500/10 text-orange-200 ring-1 ring-orange-500/50 cursor-default' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 cursor-pointer'
            }
          `}
        >
          <Flame 
            size={16} 
            className={`transition-all duration-700 ${offeringActive ? 'fill-orange-500 text-orange-500 animate-pulse' : 'text-slate-500'}`} 
          />
          <span>{offeringActive ? 'Offering Active' : 'Light Candle'}</span>
          
          {offeringActive && <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full" />}
        </button>

        {/* Timer Text */}
        {offeringActive && (
            <p className="text-[10px] text-orange-500/60 mt-2 font-medium tracking-wide animate-pulse">
                {timeLeft} remaining
            </p>
        )}
      </div>
    </div>
  )
}