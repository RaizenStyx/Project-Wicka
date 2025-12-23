export const dynamic = 'force-dynamic'

import { createClient } from '../utils/supabase/server'
import SanctuaryTabs from '@/components/sanctuary/SanctuaryTabs'
import { getCrystalsData } from '@/app/actions/crystal-actions'
import { getHerbsData } from '@/app/actions/herb-actions'
import { getDeitiesData } from '@/app/actions/deity-actions'
import { getCandlesData } from '@/app/actions/candle-actions'

export const metadata = {
  title: 'My Sanctuary | Nyxus',
  description: 'Your personal collection of magical tools.',
}

export default async function SanctuaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-12 text-center text-slate-400">Please log in to view your sanctuary.</div>
  }

  // Fetch ALL data in parallel for speed
  const [
    crystalsData, 
    herbsData, 
    deitiesData, 
    candlesData
  ] = await Promise.all([
    getCrystalsData(),
    getHerbsData(),
    getDeitiesData(),
    getCandlesData()
  ])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-4xl text-purple-200">My Sanctuary</h1>
          <p className="mt-2 text-slate-400">Your collected knowledge and tools.</p>
        </header>

        <SanctuaryTabs 
          crystals={crystalsData.crystals}
          crystalState={crystalsData.userStateMap}
          
          herbs={herbsData.herbs}
          herbState={herbsData.userStateMap}
          
          deities={deitiesData.deities}
          deityState={deitiesData.userStateMap}
          
          candles={candlesData.candles}
          candleState={candlesData.userStateMap}
        />
      </div>
    </main>
  )
}