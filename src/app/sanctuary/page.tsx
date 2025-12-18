import { createClient } from '@/app/utils/supabase/server'
import SanctuaryTabs from '@/components/sanctuary/SanctuaryTabs'

export default async function SanctuaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch User's Crystal Collection (Only what they own/wishlist)
  // Note: We select the standard crystal info AND the user's custom image
  const { data: crystalCollection } = await supabase
    .from('user_crystal_collection')
    .select(`
        *,
        crystals (*)
    `)
    .eq('user_id', user?.id)

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
             <h1 className="font-serif text-3xl text-purple-200">My Sanctuary</h1>
             <p className="text-slate-400">Your collected items and deities.</p>
          </div>
        </header>

        {/* Pass the data into the client-side tab system */}
        <SanctuaryTabs 
            initialCrystals={crystalCollection || []} 
        />
      </div>
    </div>
  )
}