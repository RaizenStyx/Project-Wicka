import { getRunesData } from '@/app/actions/rune-actions'
import RuneClientWrapper from '@/components/shared/RuneClientWrapper';
export const dynamic = 'force-dynamic' 

export const metadata = {
  title: 'Runes | Nyxus',
  description: 'Explore runes and learn about each one!',
};

export default async function AllRunesPage() {
  const { runes, userStateMap } = await getRunesData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">

        <RuneClientWrapper 
           runes={runes} 
           initialUserState={userStateMap}
        />
        
      </div>
    </main>
  )
}