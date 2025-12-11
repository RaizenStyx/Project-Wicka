'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation' // 👈 Import navigation hooks
import { Crystal } from '@/app/types/database'
import { Search } from 'lucide-react'
import CrystalCard from './CrystalCard'
import CrystalModal from './CrystalModal'

// Define the shape of our user state
type UserState = { isOwned: boolean; isWishlisted: boolean }

interface DashboardProps {
  initialCrystals: Crystal[]
  initialStateMap: Record<string, UserState>
}

export default function CrystalDashboard({ initialCrystals, initialStateMap }: DashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 1. Get the 'open' param from the URL
  const openId = searchParams.get('open')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'owned' | 'wishlist'>('all')
  const [stateMap, setStateMap] = useState(initialStateMap)

  // 1. Handle State Updates (passed down to Card and Modal)
  const handleStateUpdate = (id: string, newState: UserState) => {
    setStateMap((prev) => ({
      ...prev,
      [id]: newState
    }))
  }

  // 2. Filter Logic
  const filteredCrystals = initialCrystals.filter((crystal) => {
    // Search Filter
    const term = search.toLowerCase()
    const nameMatch = crystal.name.toLowerCase().includes(term)
    const meaningMatch = (crystal.meaning || '').toLowerCase().includes(term)
    const matchesSearch = nameMatch || meaningMatch
    
    // Status Filter
    const userState = stateMap[crystal.id] || { isOwned: false, isWishlisted: false }

    if (filter === 'owned') return matchesSearch && userState.isOwned
    if (filter === 'wishlist') return matchesSearch && userState.isWishlisted
    
    return matchesSearch
  })

  // 3. Modal Selection Logic
  const selectedCrystal = openId ? initialCrystals.find((c) => c.id === openId) : null
  const selectedState = selectedCrystal 
    ? (stateMap[selectedCrystal.id] || { isOwned: false, isWishlisted: false }) 
    : { isOwned: false, isWishlisted: false }

  const handleCloseModal = () => router.push(pathname, { scroll: false })

  return (
    <div>
      {/* Controls Area */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
            type="text"
            placeholder="Search crystals or meanings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-lg bg-slate-900 p-1">
          {(['all', 'owned', 'wishlist'] as const).map((f) => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-4 py-1.5 text-sm capitalize transition-colors cursor-pointer ${
                  filter === f 
                    ? 'bg-purple-900/50 text-purple-200 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
             >
                {f === 'all' ? 'All Crystals' : f === 'owned' ? 'Collection' : 'Wishlist'}
             </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCrystals.map((crystal) => (
          <CrystalCard
            key={crystal.id}
            crystal={crystal}
            isOwned={stateMap[crystal.id]?.isOwned || false}
            isWishlisted={stateMap[crystal.id]?.isWishlisted || false}
            onUpdate={(newState) => handleStateUpdate(crystal.id, newState)}
            onClick={() => router.push(`${pathname}?open=${crystal.id}`, { scroll: false })}
          />
        ))}
      </div>

      {filteredCrystals.length === 0 && (
        <div className="py-20 text-center text-slate-500">
          <p>No crystals found matching your search.</p>
        </div>
      )}

      {/* Modal */}
      {selectedCrystal && (
        <CrystalModal 
          isOpen={!!selectedCrystal}
          onClose={handleCloseModal}
          crystal={selectedCrystal}
          isOwned={selectedState.isOwned}
          isWishlisted={selectedState.isWishlisted}
          onUpdate={(newState) => handleStateUpdate(selectedCrystal.id, newState)}
          // userImage={...} // Hook this up when we do the Widgets/Image part next
        />
      )}
    </div>
  )
}