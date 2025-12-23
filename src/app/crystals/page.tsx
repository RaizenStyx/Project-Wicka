import { getCrystalsData } from '@/app/actions/crystal-actions'
import CrystalClientWrapper from '@/components/shared/CrystalClientWrapper';
export const dynamic = 'force-dynamic' 

export const metadata = {
  title: 'Crystals | Nyxus',
  description: 'Explore crystals and learn about each one!',
};

export default async function AllCrystalsPage() {
  const { crystals, userStateMap } = await getCrystalsData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">

        <CrystalClientWrapper 
           crystals={crystals} 
           initialUserState={userStateMap}
        />
        
      </div>
    </main>
  )
}