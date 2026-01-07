export const dynamic = 'force-dynamic'

import { createClient } from '../utils/supabase/server'
import SanctuaryTabs from '@/components/sanctuary/SanctuaryTabs'
import DeityAltarView from '@/components/sanctuary/DeityAltarView'
import { getCrystalsData } from '@/app/actions/crystal-actions'
import { getHerbsData } from '@/app/actions/herb-actions'
import { getCandlesData } from '@/app/actions/candle-actions'
import { getOilsData } from '../actions/oil-actions'
import { getRunesData } from '../actions/rune-actions'

export const metadata = {
  title: 'My Sanctuary | Nyxus',
  description: 'Your personal collection of magical tools.',
}

export default async function SanctuaryPage(props: { searchParams: Promise<{ view?: string }> }) {
  const searchParams = await props.searchParams;
  const view = searchParams.view || 'inventory'; // 'inventory' or 'altar'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-12 text-center text-slate-400">Please log in to view your sanctuary.</div>
  }

  // 1. Fetch Inventory Data (Parallel)
  const [crystalsData, herbsData, candlesData, oilsData, runesData] = await Promise.all([
    getCrystalsData(),
    getHerbsData(),
    getCandlesData(),
    getOilsData(),
    getRunesData()
  ])

  // 2. Fetch Altar Data (Deities)
  // A. Get the currently INVOKED deity
  const { data: invokedDeity } = await supabase
    .from('user_deities')
    .select('*, deities(*)')
    .eq('user_id', user.id)
    .eq('is_invoked', true)
    .maybeSingle()

  // B. Get the ROSTER (Wishlisted)
  const { data: roster } = await supabase
    .from('user_deities')
    .select('*, deities(*)')
    .eq('user_id', user.id)
    .eq('is_wishlisted', true)
    .order('created_at', { ascending: false })

  // --- BUILD THE STATE MAP ---
  // We need to construct the Record<string, any> that DeityAltarView expects
  // so it can look up "isOwned" and "isWishlisted" for the modal.
  const userDeityState: Record<string, any> = {};

  // 1. Add Invoked Deity State
  if (invokedDeity) {
      userDeityState[invokedDeity.deity_id] = {
          isOwned: invokedDeity.is_owned,
          isWishlisted: invokedDeity.is_wishlisted,
          isInvoked: invokedDeity.is_invoked,
          lastInvokedAt: invokedDeity.last_invoked_at,
          lastOfferingAt: invokedDeity.last_offering_at
      }
  }

  // 2. Add Roster States
  if (roster) {
      roster.forEach((item) => {
          userDeityState[item.deity_id] = {
              isOwned: item.is_owned,
              isWishlisted: item.is_wishlisted,
              isInvoked: item.is_invoked,
              lastInvokedAt: item.last_invoked_at,
              lastOfferingAt: item.last_offering_at
          }
      })
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-7xl">
        
        {/* TOP HEADER & TOGGLE */}
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
             <h1 className="font-serif text-4xl text-purple-200 text-center md:text-left">My Sanctuary</h1>
             <p className="mt-2 text-slate-400 text-center md:text-left">Your collected knowledge and tools.</p>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
             <a 
                href="/sanctuary?view=inventory"
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${view !== 'altar' ? 'bg-slate-800 text-purple-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Inventory
             </a>
             <a 
                href="/sanctuary?view=altar"
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${view === 'altar' ? 'bg-purple-900/30 text-purple-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Deity Altar
             </a>
          </div>
        </header>

        {/* CONTENT SWITCHER */}
        {view === 'altar' ? (
            <DeityAltarView 
                invokedDeity={invokedDeity}
                roster={roster || []}
                userDeityState={userDeityState}
            />
        ) : (
            <SanctuaryTabs 
                crystals={crystalsData.crystals}
                crystalState={crystalsData.userStateMap}
                
                herbs={herbsData.herbs}
                herbState={herbsData.userStateMap}
                
                candles={candlesData.candles}
                candleState={candlesData.userStateMap}

                runes={runesData.runes}
                runeState={runesData.userStateMap}

                oils={oilsData.oils}
                oilState={oilsData.userStateMap}
            />
        )}
      </div>
    </main>
  )
}