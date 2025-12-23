import { getDeitiesData } from '@/app/actions/deity-actions'
import DeityClientWrapper from '@/components/shared/DeityClientWrapper'

export const metadata = {
  title: 'Deities | Nyxus',
  description: 'Explore how each deity relates to modern magic!',
};

export default async function DeitiesPage() {
  const { deities, userStateMap } = await getDeitiesData()

  const uniquePantheons = Array.from(new Set(deities.map((d: any) => d.pantheon).filter(Boolean))) as string[]

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <DeityClientWrapper 
           deities={deities} 
           pantheons={uniquePantheons.sort()}
           initialUserState={userStateMap}
        />
      </div>
    </main>
  )
}