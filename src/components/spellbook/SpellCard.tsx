'use client'

import { deleteSpell, updateSpell, Spell } from '@/app/actions/spell-actions'
import { Lock, Globe, Moon, Pencil, Save, X, Flame, Eye } from 'lucide-react' 
import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

// Extend Spell type to include profile
interface ExtendedSpell extends Spell {
  profiles?: { username: string, handle: string, role: string }
}

interface SpellCardProps {
  spell: ExtendedSpell
  readOnly?: boolean 
  showAuthor?: boolean
  userRole?: string
}

export default function SpellCard({ 
  spell, 
  readOnly = false, 
  showAuthor = false, 
  userRole = spell.profiles?.role || 'initiate' 
}: SpellCardProps) {
  
  const [isBurning, setIsBurning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const canPublish = userRole !== 'initiate';

  // Helper to determine current visibility state
  const getInitialVisibility = () => {
      if (spell.is_published) return 'community';
      if (spell.is_private) return 'private';
      return 'profile';
  }

  const [editVisibility, setEditVisibility] = useState(getInitialVisibility())

  const handleUpdate = async (formData: FormData) => {
    try {
        setIsLoading(true)
        
        // 1. Map our UI state to the Database Flags
        const isPrivate = editVisibility === 'private'
        const isPublished = editVisibility === 'community'

        // 2. Manually append to formData (overriding defaults)
        formData.set('is_private', isPrivate ? 'on' : 'off')
        formData.set('is_published', isPublished ? 'on' : 'off')

        // 3. Send to Server
        const result = await updateSpell(spell.id, formData)

        // 4. Handle Response
        if (result?.error) {
            alert(`Error: ${result.error}`)
        } else {
            console.log("Update Success!");
            setIsEditing(false) // Close the form
        }
    } catch (error) {
        console.error("Critical Update Error:", error);
        alert("Something went wrong updating the spell. Check console.");
    } finally {
        setIsLoading(false) // Always unlock the buttons
    }
  }

  const handleBurn = async () => {
    if (readOnly) return;
    if (!confirm("Burn this page? The energy will be released and the record destroyed.")) return;
    setIsBurning(true)
    setTimeout(async () => {
        await deleteSpell(spell.id)
    }, 800) 
  }

  // --- RENDER: EDIT MODE ---
  if (isEditing) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-purple-500/50 rounded-xl p-6 relative shadow-2xl"
      >
         <form action={handleUpdate}>
            {/* Inputs */}
            <div className="mb-4 space-y-3">
               <input name="title" defaultValue={spell.title} required className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-serif font-bold focus:border-purple-500 outline-none" placeholder="Spell Title"/>
               <div className="flex gap-2">
                   <input name="intent" defaultValue={spell.intent || ''} className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none" placeholder="Intent"/>
                   <select name="moon_phase" defaultValue={spell.moon_phase || 'Any'} className="bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none">
                     <option value="Any">Any Phase</option>
                     <option value="New Moon">New Moon</option>
                     <option value="Waxing">Waxing</option>
                     <option value="Full Moon">Full Moon</option>
                     <option value="Waning">Waning</option>
                   </select>
               </div>
               <div>
                 <input name="ingredients" type="text" defaultValue={spell.ingredients || ''} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none" placeholder="Ingredients..."/>
               </div>
            </div>

            <textarea name="content" defaultValue={spell.content || ''} rows={5} required className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 font-serif focus:border-purple-500 outline-none mb-4 resize-none" placeholder="Ritual steps..."/>

             {/* Footer Actions */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* VISIBILITY TOGGLE GROUP */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button 
                      type="button"
                      onClick={() => setEditVisibility('private')}
                      className={clsx("cursor-pointer px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1", editVisibility === 'private' ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-300")}
                    >
                      <Lock className="w-3 h-3" /> Private
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditVisibility('profile')}
                      className={clsx("cursor-pointer px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1", editVisibility === 'profile' ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-300")}
                    >
                      <Eye className="w-3 h-3" /> Profile
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                            if (canPublish) setEditVisibility('community')
                            else alert("You must advance beyond Initiate to publish spells.")
                        }}
                      className={clsx("cursor-pointer px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1",
                        editVisibility === 'community' ? "bg-purple-600 text-white shadow" : "text-slate-500 hover:text-slate-300",
                        // Disable logic
                        canPublish ? "cursor-pointer" : "opacity-50 cursor-not-allowed")}
                    >
                      <Globe className="w-3 h-3" /> Community
                    </button>
                </div>

                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors shadow-lg shadow-purple-900/20 cursor-pointer">
                        {isLoading ? 'Saving...' : <><Save className="w-3 h-3" /> Save</>}
                    </button>
                </div>
             </div>
         </form>
      </motion.div>
    )
  }

  // --- RENDER: VIEW MODE ---
  return (
    <motion.div 
        layout
        animate={isBurning ? { opacity: 0, scale: 0.9, y: -50, filter: "brightness(0) blur(4px)", transition: { duration: 0.8 } } : { opacity: 1, scale: 1, y: 0, filter: "brightness(1) blur(0px)" }}
        className={clsx("bg-slate-900 border border-slate-800 rounded-xl p-6 relative group transition-all duration-300", !isBurning && "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/10")}
    >
        {/* Status Badges */}
        <div className="absolute top-6 right-6 flex gap-2">
           {spell.is_published && (
               <span className="flex items-center gap-1 text-[10px] text-purple-300 border border-purple-900 bg-purple-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm shadow-purple-900/50">
                  <Globe className="w-3 h-3" /> Public
               </span>
           )}
           {spell.is_private && <Lock className="w-4 h-4 text-slate-600" />}
           {!spell.is_private && !spell.is_published && <Eye className="w-4 h-4 text-slate-500" />}
        </div>

        {/* Author Badge */}
        {showAuthor && spell.profiles && (
           <div className="mb-4 flex items-center gap-2 pb-3 border-b border-slate-800/50">
               <span className="text-xs text-slate-500">Scribed by</span>
               <span className="text-sm font-bold text-purple-400 font-serif">{spell.profiles.username}</span>
           </div>
        )}

        <h3 className="text-xl font-bold text-slate-200 font-serif mb-2">{spell.title}</h3>
        
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
           {spell.intent && <span className="bg-purple-900/20 text-purple-300 px-2 py-1 rounded border border-purple-800/30">{spell.intent}</span>}
           {spell.moon_phase && spell.moon_phase !== 'Any' && <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700"><Moon className="w-3 h-3" /> {spell.moon_phase}</span>}
        </div>

        {spell.ingredients && (
           <div className="mb-4 py-2 border-t border-b border-slate-800/50 border-dashed">
              <p className="text-xs text-slate-400 font-serif italic"><span className="not-italic text-slate-600 font-sans text-[10px] uppercase tracking-wider mr-2 font-bold">Requires:</span> {spell.ingredients}</p>
           </div>
        )}

        <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-serif">{spell.content}</div>

        {!readOnly && (
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="Edit Spell"><Pencil className="w-4 h-4" /></button>
                <button onClick={handleBurn} disabled={isBurning} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-950/30 rounded-lg transition-colors cursor-pointer" title="Burn Page"><Flame className={clsx("w-4 h-4", isBurning && "animate-pulse text-orange-500")} /></button>
            </div>
        )}
    </motion.div>
  )
}