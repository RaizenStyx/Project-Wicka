'use client'

import { createSpell } from '@/app/actions/spell-actions'
import { useState } from 'react'
import { Plus, X, Scroll, Lock, Eye, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import SmartIngredientSelector from './SmartIngredientSelector'

export default function SpellForm({ userRole }: {userRole: string}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [visibility, setVisibility] = useState('private')

  const [isRitual, setIsRitual] = useState(false)
  const [selectedCrystals, setSelectedCrystals] = useState<string[]>([])
  const [selectedHerbs, setSelectedHerbs] = useState<string[]>([])
  const [selectedCandles, setSelectedCandles] = useState<string[]>([])
  // New State
  const [selectedOils, setSelectedOils] = useState<string[]>([])
  const [selectedRunes, setSelectedRunes] = useState<string[]>([])

  const handleSubmit = async (formData: FormData) => {
    // --- NEW VALIDATION CHECK ---
    if (isRitual) {
      const hasEarth = selectedCrystals.length > 0 || selectedHerbs.length > 0;
      const hasFire = selectedCandles.length > 0;

      if (!hasEarth || !hasFire) {
        alert("A Ritual requires active components to be performed.\n\nPlease link at least:\n- One Earth Element (Crystal or Herb)\n- One Fire Element (Candle)");
        return; 
      }
    }
    setLoading(true)
    
    // 1. Handle Visibility
    const isPrivate = visibility === 'private'
    const isPublished = visibility === 'community'
    formData.set('is_private', isPrivate ? 'on' : 'off')
    formData.set('is_published', isPublished ? 'on' : 'off')

    // 2. INJECT NEW DATA INTO FORMDATA
    formData.set('is_ritual', isRitual ? 'true' : 'false')
    formData.set('linked_crystals', JSON.stringify(selectedCrystals))
    formData.set('linked_herbs', JSON.stringify(selectedHerbs))
    formData.set('linked_candles', JSON.stringify(selectedCandles))
    formData.set('linked_essential_oils', JSON.stringify(selectedOils))
    formData.set('linked_runes', JSON.stringify(selectedRunes))

    const result = await createSpell(formData)
    
    setLoading(false)

    if (result?.error) {
        alert(result.error)
    } else {
        setIsOpen(false)
        // Reset Form State
        setVisibility('private') 
        setIsRitual(false)
        setSelectedCrystals([])
        setSelectedHerbs([])
        setSelectedCandles([])
        setSelectedOils([])
        setSelectedRunes([])
    }
  }

  const canPublish = userRole !== 'initiate';

  return (
    <div className="mb-8">
      <AnimatePresence mode='wait'>
        {!isOpen ? (
          <motion.button 
            key="button"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-full py-5 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/30 text-slate-500 hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-900/10 transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <div className="p-2 rounded-full bg-slate-800 group-hover:bg-purple-500/20 transition-colors">
                 <Plus className="w-5 h-5 group-hover:text-purple-400" />
            </div>
            <span className="font-serif">Scribe new intention...</span>
          </motion.button>
        ) : (
          <motion.div 
            key="form"
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl shadow-black/50">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-purple-500" />
                    New Spell Entry
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white cursor-pointer transition-colors p-1 hover:bg-slate-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form action={handleSubmit} className="space-y-5">
                
                {/* --- TITLE & METADATA --- */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Title</label>
                  <input name="title" required type="text" placeholder="e.g. Protection Jar" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Intent</label>
                    <input name="intent" type="text" placeholder="e.g. Warding" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Moon Phase</label>
                    <select name="moon_phase" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none cursor-pointer">
                      <option value="Any">Any Phase</option>
                      <option value="New Moon">New Moon</option>
                      <option value="Waxing">Waxing</option>
                      <option value="Full Moon">Full Moon</option>
                      <option value="Waning">Waning</option>
                    </select>
                  </div>
                </div>

                {/* --- NEW RITUAL TOGGLE --- */}
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="isRitual"
                        checked={isRitual}
                        onChange={(e) => setIsRitual(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 bg-slate-800 border-slate-600 cursor-pointer"
                    />
                    <div>
                        <label htmlFor="isRitual" className="text-sm font-bold text-slate-300 cursor-pointer">Mark as Ritual</label>
                        <p className="text-xs text-slate-500">Rituals can be performed on the interactive Altar (Coming Soon).</p>
                    </div>
                </div>

                {/* --- SMART SELECTORS --- */}
                <div className="space-y-2 border-l-2 border-slate-800 pl-4">
                    <SmartIngredientSelector 
                        tableName="crystals"
                        label="Link Crystals (Earth/North)"
                        selectedIds={selectedCrystals}
                        onSelectionChange={setSelectedCrystals}
                    />
                    <SmartIngredientSelector 
                        tableName="herbs"
                        label="Link Herbs (Earth/North)"
                        selectedIds={selectedHerbs}
                        onSelectionChange={setSelectedHerbs}
                    />
                    <SmartIngredientSelector 
                        tableName="candles"
                        label="Link Candles (Fire/South)"
                        selectedIds={selectedCandles}
                        onSelectionChange={setSelectedCandles}
                    />
                    <SmartIngredientSelector 
                        tableName="essential_oils"
                        label="Link Essential Oils"
                        selectedIds={selectedOils}
                        onSelectionChange={setSelectedOils}
                    />
                    <SmartIngredientSelector
                        tableName="runes"
                        label="Link Runes"
                        selectedIds={selectedRunes}
                        onSelectionChange={setSelectedRunes}
                    />
                </div>


                {/* --- CUSTOM INGREDIENTS (Legacy Text) --- */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Other Ingredients / Notes</label>
                  <input name="ingredients" type="text" placeholder="e.g. Personal items, specific oils..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-700" />
                </div>

                {/* --- CONTENT --- */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Ritual / Steps</label>
                  <textarea name="content" rows={5} required placeholder="Describe the ritual..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none resize-none placeholder:text-slate-700 font-serif" />
                </div>


                {/* --- VISIBILITY SELECTOR --- */}
                <div>
                   <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Visibility Level</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div 
                        onClick={() => setVisibility('private')}
                        className={clsx(
                            "cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all",
                            visibility === 'private' ? "bg-slate-800 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                          <Lock className="w-5 h-5" />
                          <span className="text-xs font-bold">Private</span>
                          <span className="text-[10px] text-center opacity-70">Only visible to you</span>
                      </div>

                      <div 
                        onClick={() => setVisibility('profile')}
                        className={clsx(
                            "cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all",
                            visibility === 'profile' ? "bg-slate-800 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                          <Eye className="w-5 h-5" />
                          <span className="text-xs font-bold">Public (Profile)</span>
                          <span className="text-[10px] text-center opacity-70">Visible on your profile</span>
                      </div>

                      <div 
                        onClick={() => {
                            if (canPublish) setVisibility('community')
                            else alert("You must advance beyond Initiate to publish spells.")
                        }}
                        className={clsx(
                            "border rounded-lg p-3 flex flex-col items-center gap-2 transition-all",
                            visibility === 'community' 
                                ? "bg-purple-900/30 border-purple-500 text-purple-100" 
                                : "bg-slate-950 border-slate-800 text-slate-500",
                            canPublish ? "cursor-pointer hover:border-slate-700" : "opacity-50 cursor-not-allowed"
                        )}
                      >
                          <Globe className="w-5 h-5" />
                          <span className="text-xs font-bold">Community</span>
                          <span className="text-[10px] text-center opacity-70">
                              {canPublish ? "Publish to Library" : "Locked (Initiate)"}
                          </span>
                      </div>
                   </div>
                </div>

                <div className="pt-2">
                    <button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 cursor-pointer">
                       {loading ? 'Scribing...' : <><Scroll className="w-4 h-4" /> Add Page</>}
                    </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}