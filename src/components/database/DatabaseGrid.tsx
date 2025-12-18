'use client'
import { useState } from 'react'
import { Crystal } from '@/app/types/database'
import Link from 'next/link'

// You can reuse your existing CrystalCard here, or a simplified version
// that just links to a details modal.

// Currently not being used! Could be adapted for other future grids. 

export default function DatabaseGrid({ initialCrystals, availableColors }: { initialCrystals: Crystal[], availableColors: string[] }) {
  const [search, setSearch] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const filtered = initialCrystals.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesColor = selectedColor ? c.color_category === selectedColor : true
    return matchesSearch && matchesColor
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white w-full max-w-md"
          onChange={e => setSearch(e.target.value)}
        />
        
        <select 
          className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          onChange={e => setSelectedColor(e.target.value)}
          value={selectedColor}
        >
          <option value="">All Colors</option>
          {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map(crystal => (
            <div key={crystal.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800">
               {/* Show Image if available, else fallback to color */}
               {crystal.image_url ? (
                   <img src={crystal.image_url} alt={crystal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                   <div className="w-full h-full" style={{ backgroundColor: crystal.color }} />
               )}
               
               {/* Title Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                   <div>
                       <h3 className="text-white font-serif font-bold">{crystal.name}</h3>
                       <span className="text-xs text-slate-300">{crystal.color_category}</span>
                   </div>
               </div>
            </div>
        ))}
      </div>
    </div>
  )
}