import { getCrystalsData } from '@/app/actions/crystal-actions'
import CrystalDashboard from '@/components/crystals/CrystalDashboard'
export const dynamic = 'force-dynamic' 

export default async function AllCrystalsPage() {
  const { crystals, userStateMap } = await getCrystalsData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-purple-200">Crystal Database</h1>
          <p className="text-slate-400">Explore the properties of the earth.</p>
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