'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation' // 👈 Import navigation hooks
import { Crystal } from '@/app/types/crystal'
import CrystalCard from './CrystalCard'
import CrystalModal from './CrystalModal'

type FilterType = 'all' | 'collected'

interface DashboardProps {
  initialCrystals: Crystal[]
  initialCollectedIds: string[]
}

export default function CrystalDashboard({ initialCrystals, initialCollectedIds }: DashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 1. Get the 'open' param from the URL
  const openId = searchParams.get('open')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set(initialCollectedIds))
  
  // 2. We derive the selected crystal directly from the URL ID
  const selectedCrystal = openId 
    ? initialCrystals.find((c) => c.id === openId) || null 
    : null

  // Filter Logic
  const filteredCrystals = initialCrystals.filter((crystal) => {
    const matchesSearch = crystal.name.toLowerCase().includes(search.toLowerCase()) || 
                          crystal.meaning.toLowerCase().includes(search.toLowerCase())
    const matchesCollection = filter === 'collected' ? collectedIds.has(crystal.id) : true
    
    return matchesSearch && matchesCollection
  })

  const handleToggle = (id: string, isCollected: boolean) => {
    const newSet = new Set(collectedIds)
    if (isCollected) newSet.add(id)
    else newSet.delete(id)
    setCollectedIds(newSet)
  }

  // 3. Handler to Open Modal (Updates URL)
  const handleOpenModal = (crystalId: string) => {
    // We replace the current URL with one that includes ?open=ID
    // scroll: false prevents the page from jumping to the top
    router.push(`${pathname}?open=${crystalId}`, { scroll: false })
  }

  // 4. Handler to Close Modal (Cleans URL)
  const handleCloseModal = () => {
    // Remove the query param
    router.push(pathname, { scroll: false })
  }

  return (
    <div>
      {/* Controls Area */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search crystals or meanings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none md:w-96"
        />

        <div className="flex rounded-lg bg-slate-900 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-purple-900/50 text-purple-200' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Crystals
          </button>
          <button
            onClick={() => setFilter('collected')}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors cursor-pointer ${
              filter === 'collected' ? 'bg-purple-900/50 text-purple-200' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Collection ({collectedIds.size})
          </button>
        </div>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCrystals.map((crystal) => (
          <CrystalCard
            key={crystal.id}
            crystal={crystal}
            isCollected={collectedIds.has(crystal.id)}
            onToggle={(newStatus) => handleToggle(crystal.id, newStatus)}
            // 5. Connect the onClick to our new router handler
            onClick={() => handleOpenModal(crystal.id)} 
          />
        ))}
      </div>

      {filteredCrystals.length === 0 && (
        <div className="py-20 text-center text-slate-500">
          <p>No crystals found matching your search.</p>
        </div>
      )}

      {/* 6. Render Modal based on URL derived state */}
      <CrystalModal 
        isOpen={!!selectedCrystal}
        onClose={handleCloseModal} // Uses router push to close
        crystal={selectedCrystal!}
        isCollected={selectedCrystal ? collectedIds.has(selectedCrystal.id) : false}
        // userImage={...} // You will hook this up later
      />
    </div>
  )
}