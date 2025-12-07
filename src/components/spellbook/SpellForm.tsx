'use client'

import { createSpell } from '@/app/actions/spell-actions'
import { useState } from 'react'
import { Plus, X, Sparkles, Scroll, Lock, Eye, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

export default function SpellForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // We use a single string state to manage the 3 options
  // Options: 'private' | 'profile' | 'community'
  const [visibility, setVisibility] = useState('private')

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    // Map the single visibility state to the two database booleans
    const isPrivate = visibility === 'private'
    const isPublished = visibility === 'community'

    formData.set('is_private', isPrivate ? 'on' : 'off')
    formData.set('is_published', isPublished ? 'on' : 'off')

    const result = await createSpell(formData)
    
    setLoading(false)

    if (result?.error) {
        alert(result.error)
    } else {
        setIsOpen(false)
        setVisibility('private') // Reset to default
    }
  }

  return (
    <div className="mb-8">
      <p>Add a way to prevent initiate role to not post to community</p>
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

                {/* Ingredients */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Ingredients</label>
                  <input name="ingredients" type="text" placeholder="e.g. Salt, Black Candle, Obsidian" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-700" />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Ritual / Steps</label>
                  <textarea name="content" rows={5} required placeholder="Describe the ritual..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none resize-none placeholder:text-slate-700 font-serif" />
                </div>


                {/* NEW VISIBILITY SELECTOR */}
                <div>
                   <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Visibility Level</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      
                      {/* Option 1: Private */}
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

                      {/* Option 2: Profile Only */}
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

                      {/* Option 3: Community */}
                      <div 
                        onClick={() => setVisibility('community')}
                        className={clsx(
                            "cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all",
                            visibility === 'community' ? "bg-purple-900/30 border-purple-500 text-purple-100" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                         <Globe className="w-5 h-5" />
                         <span className="text-xs font-bold">Community</span>
                         <span className="text-[10px] text-center opacity-70">Publish to Library</span>
                      </div>

                   </div>
                </div>

                <div className="pt-2">
                    <button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 cursor-pointer">
                       {loading ? 'Scribing...' : <><Sparkles className="w-4 h-4" /> Add Page</>}
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


                

    