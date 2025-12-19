'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import GrimoireCard from './GrimoireCard'

// A generic interface for any item in your app
interface GrimoireItem {
  id: string
  name: string
  subtitle?: string // element, pantheon, etc.
  image_url?: string | null
  color?: string
  slug?: string
  [key: string]: any // allow other properties
}

interface DashboardProps {
  title: string
  description: string
  items: GrimoireItem[]
  
  // Configuration
  filterCategories: string[] // e.g. ['Fire', 'Water'] or ['Greek', 'Norse']
  filterKey: string // The key in the item object to filter by (e.g., 'element' or 'pantheon')
  
  // Mode
  mode: 'modal' | 'link'
  basePath?: string // Required if mode is 'link' (e.g., '/astrology')
  
  // For Modal Mode
  onItemClick?: (item: GrimoireItem) => void
  
  // For Collection Mode (Optional)
  userState?: Record<string, { isOwned: boolean }>
  onToggleItem?: (id: string) => void
}

export default function GrimoireDashboard({ 
  title, description, items, 
  filterCategories, filterKey,
  mode, basePath, onItemClick,
  userState, onToggleItem 
}: DashboardProps) {
  
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Unified Filtering Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === 'All' || item[filterKey] === activeFilter
    
    // Inside GrimoireDashboard.tsx filtering logic:
    // TODO: Check the candle fitering
    // const matchesFilter = activeFilter === 'All' 
    // || (Array.isArray(item[filterKey]) 
    //     ? item[filterKey].includes(activeFilter) 
    //     : item[filterKey] === activeFilter)


    return matchesSearch && matchesFilter
  })
  

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="text-center">
        <h1 className="font-serif text-4xl text-purple-200">{title}</h1>
        <p className="mt-2 text-slate-400">{description}</p>
      </div>

      {/* CONTROLS */}
      <div className="sticky top-4 z-20 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-md md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-slate-100 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Dynamic Filters (Pills) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('All')}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all border ${
              activeFilter === 'All' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            All
          </button>
          {filterCategories.map((cat) => (
             <button
             key={cat}
             onClick={() => setActiveFilter(cat)}
             className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all border ${
               activeFilter === cat ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
             }`}
           >
             {cat}
           </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <GrimoireCard
            key={item.id}
            title={item.name}
            subtitle={item[filterKey]} // dynamically pull 'element' or 'pantheon'
            image={item.image_url}
            // Logic: Link mode vs Modal mode
            href={mode === 'link' ? `${basePath}/${item.slug || item.name.toLowerCase()}` : undefined}
            onClick={mode === 'modal' && onItemClick ? () => onItemClick(item) : undefined}
            
            // Collection Logic (Pass through if data exists)
            isOwned={userState ? userState[item.id]?.isOwned : false}
            onToggleCollect={onToggleItem ? () => onToggleItem(item.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}