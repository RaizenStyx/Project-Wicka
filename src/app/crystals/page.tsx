import { getCrystalsData } from '@/app/actions/crystals'
import CrystalDashboard from '@/components/crystals/CrystalDashboard'

export default async function CrystalsPage() {
  const { crystals, collectedIds } = await getCrystalsData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-purple-300">Crystal Log</h1>
          <p className="mt-2 text-slate-400">
            Catalog your discoveries and track your collection.
          </p>
          <p>TODO: Add in wish list tab</p>
        </header>

        {/* Pass initial data to the client component */}
        <CrystalDashboard initialCrystals={crystals} initialCollectedIds={collectedIds} />
      </div>
    </main>
  )
}