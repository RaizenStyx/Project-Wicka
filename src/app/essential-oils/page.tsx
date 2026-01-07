import { getOilsData } from '@/app/actions/oil-actions'
import OilClientWrapper from '@/components/shared/OilClientWrapper';
export const dynamic = 'force-dynamic' 

export const metadata = {
  title: 'Oils | Nyxus',
  description: 'Explore oils and learn about each one!',
};

export default async function AllOilsPage() {
  const { oils, userStateMap } = await getOilsData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">

        <OilClientWrapper 
           oils={oils} 
           initialUserState={userStateMap}
        />
        
      </div>
    </main>
  )
}