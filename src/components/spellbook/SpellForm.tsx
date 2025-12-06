'use client'

import { createSpell } from '@/app/actions/spell-actions'
import { useState } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'

export default function SpellForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    await createSpell(formData)
    setLoading(false)
    setIsOpen(false) // Close form on success
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-purple-500 hover:text-purple-300 transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Write New Entry
      </button>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-200">New Spell Entry</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Title</label>
          <input name="title" required type="text" placeholder="e.g. Protection Jar" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           {/* Intent */}
           <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Intent</label>
            <input name="intent" type="text" placeholder="e.g. Warding" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none" />
          </div>
          {/* Moon Phase */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Moon Phase</label>
            <select name="moon_phase" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none">
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
          <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Ingredients</label>
          <input name="ingredients" type="text" placeholder="e.g. Salt, Black Candle, Obsidian" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none" />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Ritual / Steps</label>
          <textarea name="content" rows={5} required placeholder="Describe the ritual..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none" />
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-2">
           <input type="checkbox" name="is_private" id="is_private" defaultChecked className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500" />
           <label htmlFor="is_private" className="text-sm text-slate-400 select-none">Keep this entry private</label>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
           {loading ? 'Writing...' : <><Sparkles className="w-4 h-4" /> Save to Grimoire</>}
        </button>
      </form>
    </div>
  )
}