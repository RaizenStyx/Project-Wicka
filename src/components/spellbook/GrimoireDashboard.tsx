'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import GrimoireCard from './GrimoireCard'

interface GrimoireItem {
  id: string
  name: string
  subtitle?: string 
  image_url?: string | null
  color?: string
  slug?: string
  [key: string]: any 
}

interface DashboardProps {
  title: string
  description: string
  items: GrimoireItem[]
  
  filterCategories: string[] 
  filterKey: string 
  
  mode: 'modal' | 'link' 
  
  // Handlers & State
  userState: Record<string, { isOwned: boolean; isWishlisted: boolean }>
  onToggleOwned: (id: string) => void
  onToggleWishlist: (id: string) => void
  onItemClick: (item: any) => void
}

const ITEMS_PER_PAGE = 10;

export default function GrimoireDashboard({ 
  title, description, items, 
  filterCategories, filterKey, 
  mode, userState, 
  onItemClick, onToggleOwned, 
  onToggleWishlist, 
}: DashboardProps) {
  
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Unified Filtering Logic
  const filteredItems = items.filter((item) => {
    const itemName = item.name || item.color || ''; 
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = false;
    if (activeFilter === 'All') {
      matchesFilter = true;
    } else {
      const value = item[filterKey]; 
      if (Array.isArray(value)) {
        matchesFilter = value.includes(activeFilter);
      } else {
        matchesFilter = value === activeFilter;
      }
    }
    return matchesSearch && matchesFilter;
  })

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const currentItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  )

  // 3. Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeFilter])
  
  // 4. Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
        // SCROLL TO TOP LOGIC
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-8 min-h-screen"> 
      {/* HEADER */}
      {title && (
        <div className="text-center">
          <h1 className="font-serif text-4xl text-purple-200">{title}</h1>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>
      )}

      {/* CONTROLS */}
      <div className="sticky top-20 z-20 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-md md:flex-row md:items-center">
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

        {/* Dynamic Filters */}
        {filterCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('All')}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                activeFilter === 'All' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              All
            </button>
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                  activeFilter === cat ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentItems.length > 0 ? (
            currentItems.map((item) => {
            const state = userState?.[item.id] || { isOwned: false, isWishlisted: false };

            return (
                <GrimoireCard
                key={item.id}
                id={item.id}
                title={item.name}
                subtitle={item.element || item.pantheon || ''} 
                image={item.image_url}
                color={item.color}
                
                isOwned={state.isOwned}
                isWishlisted={state.isWishlisted}
                
                onToggleOwned={() => onToggleOwned(item.id)}
                onToggleWishlist={() => onToggleWishlist(item.id)}
                onClick={() => onItemClick(item)}
                />
            )
            })
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                <p>No items found matching your search.</p>
            </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm font-medium text-slate-400">
                Page <span className="text-white">{currentPage}</span> of {totalPages}
            </span>
            
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
      )}
    </div>
  )
}