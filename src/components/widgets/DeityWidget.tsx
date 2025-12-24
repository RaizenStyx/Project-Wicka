'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Flame, Sparkles, Edit2, Check, X } from 'lucide-react'

// Simple presets to make it easy for users to start
const PRESETS = [
  { id: 'hecate', name: 'Hecate', title: 'Goddess of Magic', icon: '🌙' },
  { id: 'odin', name: 'Odin', title: 'The Allfather', icon: '👁️' },
  { id: 'freya', name: 'Freya', title: 'Goddess of Love & War', icon: '🗡️' },
  { id: 'cernunnos', name: 'Cernunnos', title: 'Lord of the Wild', icon: '🦌' },
  { id: 'custom', name: 'Custom', title: 'Personal Deity', icon: '✨' }
]

export default function DeityWidget() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [candleLit, setCandleLit] = useState(false)
  
  // Data State
  const [deityData, setDeityData] = useState<any>(null)
  
  // Form State
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id)
  const [customName, setCustomName] = useState('')

  const supabase = createClient()

  // 1. Fetch initial preference
  useEffect(() => {
    async function loadDeity() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()

      const savedDeity = profile?.preferences?.deity
      
      if (savedDeity) {
        setDeityData(savedDeity)
        setMode('view')
      } else {
        setMode('edit') // Force setup if nothing saved
      }
      setLoading(false)
    }
    loadDeity()
  }, [])

  // 2. Save Function
  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Construct the object to save
    let newDeityData
    if (selectedPreset === 'custom') {
      newDeityData = { name: customName, title: 'Patron Deity', icon: '✨', id: 'custom' }
    } else {
      newDeityData = PRESETS.find(p => p.id === selectedPreset)
    }

    // Get current prefs first to avoid overwriting widget_order
    const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()

    const currentPrefs = profile?.preferences || {}

    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: { 
            ...currentPrefs, 
            deity: newDeityData // Saving to a new key in the JSON
        }
      })
      .eq('id', user.id)

    if (!error) {
      setDeityData(newDeityData)
      setMode('view')
    }
    setLoading(false)
  }

  if (loading && !deityData) return <div className="h-40 rounded-xl bg-slate-900/50 animate-pulse" />

  // --- EDIT / SETUP MODE ---
  if (mode === 'edit') {
    return (
        <h3>under construction</h3>

    //   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
    //     <h3 className="text-purple-400 font-serif text-lg mb-4 flex items-center gap-2">
    //        <Sparkles size={18} /> Setup Altar
    //     </h3>
        
    //     <div className="space-y-4">
    //       <div>
    //         <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Select Deity</label>
    //         <div className="grid grid-cols-3 gap-2">
    //           {PRESETS.slice(0, 4).map(p => (
    //             <button
    //               key={p.id}
    //               onClick={() => setSelectedPreset(p.id)}
    //               className={`p-2 rounded text-sm transition-colors border ${
    //                 selectedPreset === p.id 
    //                 ? 'bg-purple-900/50 border-purple-500 text-purple-200' 
    //                 : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
    //               }`}
    //             >
    //               {p.name}
    //             </button>
    //           ))}
    //           <button
    //               onClick={() => setSelectedPreset('custom')}
    //               className={`col-span-2 p-2 rounded text-sm transition-colors border ${
    //                 selectedPreset === 'custom' 
    //                 ? 'bg-purple-900/50 border-purple-500 text-purple-200' 
    //                 : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
    //               }`}
    //             >
    //               Custom
    //           </button>
    //         </div>
    //       </div>

    //       {selectedPreset === 'custom' && (
    //         <input 
    //           type="text" 
    //           placeholder="Enter Name (e.g. Loki)"
    //           className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
    //           value={customName}
    //           onChange={(e) => setCustomName(e.target.value)}
    //         />
    //       )}

    //       <div className="flex gap-2 pt-2">
    //         <button 
    //           onClick={handleSave}
    //           className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm py-2 rounded-lg font-medium transition-colors"
    //         >
    //           Confirm
    //         </button>
    //         {deityData && (
    //           <button onClick={() => setMode('view')} className="p-2 text-slate-400 hover:text-slate-200">
    //             Cancel
    //           </button>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    )
  }

  // --- VIEW / ALTAR MODE ---
  return (
    <div className={`
      relative overflow-hidden rounded-xl border p-6 transition-all duration-700
      ${candleLit 
        ? 'bg-gradient-to-t from-orange-950/30 to-slate-900 border-orange-900/50 shadow-[0_0_30px_-5px_rgba(251,146,60,0.1)]' 
        : 'bg-slate-900 border-slate-800'
      }
    `}>
      {/* Edit Button */}
      <button 
        onClick={() => setMode('edit')}
        className="absolute top-3 right-3 text-slate-600 hover:text-purple-400 transition-colors"
      >
        <Edit2 size={14} />
      </button>

      <div className="text-center">
        <div className="text-4xl mb-3 drop-shadow-md">{deityData.icon}</div>
        <h3 className="font-serif text-xl text-slate-200">{deityData.name}</h3>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">{deityData.title}</p>
        
        {/* Interactive Candle Button */}
        <button
          onClick={() => setCandleLit(!candleLit)}
          className={`
            group relative inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-500
            ${candleLit 
              ? 'bg-orange-500/10 text-orange-200 ring-1 ring-orange-500/50' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 cursor-pointer'
            }
          `}
        >
          <Flame 
            size={16} 
            className={`transition-all duration-700 ${candleLit ? 'fill-orange-500 text-orange-500 animate-pulse' : 'text-slate-500'}`} 
          />
          <span>{candleLit ? 'Offering Made' : 'Light Candle'}</span>
          
          {/* Candle Glow Effect */}
          {candleLit && (
             <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full" />
          )}
        </button>
      </div>
    </div>
  )
}