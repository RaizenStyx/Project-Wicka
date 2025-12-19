import { getCandlesData } from '@/app/actions/candle-actions'
import CandleClientWrapper from '@/components/shared/CandleClientWrapper' // Ensure path is correct

export const metadata = {
  title: 'Candles | Nocta',
  description: 'Explore candle magic and learn what each color means!',
};

export default async function CandlesPage() {
  const { candles, userStateMap } = await getCandlesData()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <CandleClientWrapper 
            candles={candles} 
            initialUserState={userStateMap}
        />
      </div>
    </main>
  )
}