import { getHerbsData } from '@/app/actions/herb-actions'
import HerbClientWrapper from '@/components/shared/HerbClientWrapper'

export const metadata = {
  title: 'Herbs | Nocta',
  description: 'Explore all the herbs and how to use them to make magic!',
};

export default async function HerbsPage() {
  const { herbs, userStateMap } = await getHerbsData()

  const uniqueElements = Array.from(new Set(herbs.map((h: any) => h.element).filter(Boolean))) as string[]

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <HerbClientWrapper 
           herbs={herbs} 
           elements={uniqueElements.sort()}
           initialUserState={userStateMap}
        />
      </div>
    </main>
  )
}