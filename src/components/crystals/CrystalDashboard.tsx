'use client'

import { useState, useEffect } from 'react' 
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { Crystal } from '@/app/types/database'
import CrystalCard from './CrystalCard'
import CrystalModal from './CrystalModal'

type UserState = { 
  isOwned: boolean; 
  isWishlisted: boolean;
  userImage?: string | null;
}

interface DashboardProps {
  initialCrystals: Crystal[]
  initialStateMap: Record<string, UserState>
}

const ELEMENTS = ['All', 'Earth', 'Air', 'Fire', 'Water', 'Spirit'] as const

export default function CrystalDashboard({ initialCrystals, initialStateMap }: DashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const openId = searchParams.get('open')

  const [search, setSearch] = useState('')
  const [activeElement, setActiveElement] = useState<string>('All')
  const [selectedColor, setSelectedColor] = useState<string>('')
  
  const [stateMap, setStateMap] = useState(initialStateMap)

  useEffect(() => {
    setStateMap(initialStateMap)
  }, [initialStateMap])

  const availableColors = Array.from(new Set(initialCrystals.map(c => c.color_category).filter(Boolean))).sort()

  const handleStateUpdate = (id: string, newState: UserState) => {
    setStateMap((prev) => ({ ...prev, [id]: newState }))
  }

  const filteredCrystals = initialCrystals.filter((crystal) => {
    const term = search.toLowerCase()
    console.log("Crystal Name:" + crystal);
    
    const matchesSearch = 
        crystal.name.toLowerCase().includes(term) || 
        (crystal.meaning || '').toLowerCase().includes(term)

    const matchesElement = activeElement === 'All' 
        ? true 
        : crystal.element === activeElement

    const matchesColor = selectedColor 
        ? crystal.color_category === selectedColor 
        : true
    
    return matchesSearch && matchesElement && matchesColor
  })

  const selectedCrystal = openId ? initialCrystals.find((c) => c.id === openId) : null
  const selectedState = selectedCrystal 
    ? (stateMap[selectedCrystal.id] || { isOwned: false, isWishlisted: false }) 
    : { isOwned: false, isWishlisted: false }
  
  const handleCloseModal = () => router.push(pathname, { scroll: false })

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search crystals or meanings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
            </div>
            <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-8 py-2 text-slate-100 focus:border-purple-500 focus:outline-none cursor-pointer"
                >
                    <option value="">All Colors</option>
                    {availableColors.map((color) => (
                        <option key={color} value={color as string}>{color}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
          {ELEMENTS.map((element) => (
             <button
                key={element}
                onClick={() => setActiveElement(element)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  activeElement === element 
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/20' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
             >
                {element}
             </button>
          ))}
        </div>
      </div>

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
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <p className="text-slate-500">No crystals found matching your filters.</p>
          <button 
            onClick={() => { setSearch(''); setActiveElement('All'); setSelectedColor(''); }}
            className="mt-2 text-sm text-purple-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {selectedCrystal && (
        <CrystalModal 
          isOpen={!!selectedCrystal}
          onClose={handleCloseModal}
          crystal={selectedCrystal}
          isOwned={selectedState.isOwned}
          isWishlisted={selectedState.isWishlisted}
          onUpdate={(newState) => handleStateUpdate(selectedCrystal.id, newState)}
          // 3. PASS THE IMAGE PROP HERE
          userImage={selectedState.userImage} 
        />
      )}
    </div>
  )
}