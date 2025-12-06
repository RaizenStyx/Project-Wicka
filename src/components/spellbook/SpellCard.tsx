'use client'

import { deleteSpell, updateSpell, Spell } from '@/app/actions/spell-actions' // Import updateSpell
import { Trash2, Lock, Globe, Moon, Pencil, Save, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface SpellCardProps {
  spell: Spell
  readOnly?: boolean 
}

export default function SpellCard({ spell, readOnly = false }: SpellCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // New State
  const [isLoading, setIsLoading] = useState(false)

  // HANDLE DELETE
  const handleDelete = async () => {
    if (readOnly) return;
    if(!confirm("Burn this page? This cannot be undone.")) return;
    setIsDeleting(true)
    await deleteSpell(spell.id)
    setIsDeleting(false)
  }

  // HANDLE UPDATE
  const handleUpdate = async (formData: FormData) => {
    setIsLoading(true)
    await updateSpell(spell.id, formData)
    setIsLoading(false)
    setIsEditing(false) // Exit edit mode
  }

  // --- RENDER: EDIT MODE ---
  if (isEditing) {
    return (
      <form action={handleUpdate} className="bg-slate-900 border-2 border-purple-500/50 rounded-xl p-6 relative animate-in fade-in">
         {/* Header Inputs */}
         <div className="mb-4 space-y-3">
            <input 
              name="title" 
              defaultValue={spell.title} 
              required
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-serif font-bold focus:border-purple-500 outline-none" 
              placeholder="Spell Title"
            />
            
            <div className="flex gap-2">
                <input 
                  name="intent" 
                  defaultValue={spell.intent || ''} 
                  className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none" 
                  placeholder="Intent (e.g. Protection)"
                />
                <select 
                  name="moon_phase" 
                  defaultValue={spell.moon_phase || 'Any'}
                  className="bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none"
                >
                  <option value="Any">Any Phase</option>
                  <option value="New Moon">New Moon</option>
                  <option value="Waxing">Waxing</option>
                  <option value="Full Moon">Full Moon</option>
                  <option value="Waning">Waning</option>
                </select>
            </div>
         </div>

         {/* Ingredients Input */}
         <div className="mb-4">
            <input 
              name="ingredients" 
              defaultValue={spell.ingredients || ''} 
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 italic focus:border-purple-500 outline-none" 
              placeholder="Ingredients..."
            />
         </div>

         {/* Content Input */}
         <textarea 
            name="content" 
            defaultValue={spell.content || ''}
            rows={5}
            required
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 font-serif focus:border-purple-500 outline-none mb-4"
            placeholder="Ritual steps..."
         />

         {/* Footer Actions */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="is_private" 
                  id={`privacy-${spell.id}`} 
                  defaultChecked={spell.is_private} 
                  className="accent-purple-500"
                />
                <label htmlFor={`privacy-${spell.id}`} className="text-xs text-slate-400">Private</label>
            </div>

            <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
            </div>
         </div>
      </form>
    )
  }

  // --- RENDER: VIEW MODE (Normal) ---
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 relative group ${isDeleting ? 'opacity-50' : ''}`}>
        
        {/* Badge: Private/Public */}
        <div className="absolute top-6 right-6 text-slate-600">
           {spell.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4 text-purple-400" />}
        </div>

        <h3 className="text-xl font-bold text-slate-200 font-serif mb-2">{spell.title}</h3>
        
        {/* Meta Data Row */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
           {spell.intent && (
             <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-800/50">
               Intent: {spell.intent}
             </span>
           )}
           {spell.moon_phase && (
             <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1">
               <Moon className="w-3 h-3" /> {spell.moon_phase}
             </span>
           )}
        </div>

        {/* Ingredients */}
        {spell.ingredients && (
           <div className="mb-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Needs:</span>
              <p className="text-sm text-slate-300 italic">{spell.ingredients}</p>
           </div>
        )}

        {/* Content */}
        <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-serif">
           {spell.content}
        </div>

        {/* ACTION BUTTONS - Only show if NOT readOnly */}
        {!readOnly && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-600 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Spell"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete Spell"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        )}
    </div>
  )
}