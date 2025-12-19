import { getCandlesData } from '../actions/candle-actions'
import CandleClientWrapper from '@/components/shared/CandleClientWrapper'
import Construction from '@/components/ui/Construction';

export const metadata = {
  title: 'Candles | Nocta',
  description: 'Explore candle magic and learn what each color means!',
};

export default async function CandlesPage() {
  const { candles, userStateMap } = await getCandlesData()

  const uniquecandles = Array.from(new Set(candles.map((c: any) => c.hex).filter(Boolean))) as string[]

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        {/* <CandleClientWrapper 
           candles={candles} 
           hex={uniquecandles.sort()}
           initialUserState={userStateMap}
        /> */}
        <Construction title="Coming Soon" description="This page is under construction because it broke." />
      </div>
    </main>
  )
}