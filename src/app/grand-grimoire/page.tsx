
import { getCommunitySpells, getCommonRituals } from '@/app/actions/spell-actions' // Import new action
import GrimoireFeed from '@/components/spellbook/GrimoireFeed';
import { BookOpen } from 'lucide-react' 

export const metadata = {
  title: 'Grand Grimoire | Nyxus',
  description: 'Explore the spells or rituals others create!',
};

export default async function GrandGrimoirePage() {
  
  // Parallel Data Fetching for speed
  const [communitySpells, commonRituals] = await Promise.all([
    getCommunitySpells(),
    getCommonRituals()
  ])

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-purple-900/20 border border-purple-500/30">
                <BookOpen className="w-10 h-10 text-purple-300" />
            </div>
        </div>
        <h1 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
           The Grand Grimoire
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg">
           Discover rituals and intentions shared by the coven, or study the ancient archives.
           <br/>
           <span className="text-slate-500 text-sm italic">"Knowledge shared is power multiplied."</span>
        </p>
      </div>

      {/* The Interactive Feed */}
      <GrimoireFeed 
        communitySpells={communitySpells} 
        commonRituals={commonRituals} 
      />

    </div>
  )
}