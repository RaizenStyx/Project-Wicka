import { getCrystalsData } from '@/app/actions/crystal-actions'
import CrystalDashboard from '@/components/crystals/CrystalDashboard'

export const dynamic = 'force-dynamic' 

export default async function AllCrystalsPage() {
  const { crystals, userStateMap } = await getCrystalsData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-purple-300">All Crystals</h1>
          <p className="mt-2 text-slate-400">
            Search for crystals and wishlist them to keep track of crystals you want to collect, or add to your collection to catalog your discoveries and track your collection.
          </p>
        </header>

        {/* Pass initial data to the client component */}
        <CrystalDashboard 
            initialCrystals={crystals || []} 
            initialStateMap={userStateMap} 
        />
      </div>
    </main>
  )
}