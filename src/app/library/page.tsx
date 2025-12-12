import { getCommunitySpells } from '@/app/actions/spell-actions'
import SpellCard from '@/components/spellbook/SpellCard'
import { Search, BookOpen } from 'lucide-react' 

export default async function CommunityLibraryPage() {
  const spells = await getCommunitySpells()

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-purple-900/20 border border-purple-500/30">
                <BookOpen className="w-10 h-10 text-purple-300" />
            </div>
        </div>
        <h1 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
           The Grand Grimoire
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg">
          Discover rituals and intentions shared by the coven. 
          <br/>
          <span className="text-slate-500 text-sm italic">"Knowledge shared is power multiplied."</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-16 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
             <Search className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search for 'Protection', 'Love', 'Moon'..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-3 pl-10 pr-4 text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-600"
          />
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {spells.map((spell) => (
            <SpellCard 
               key={spell.id} 
               spell={spell} 
               readOnly={true}
               showAuthor={true}
            />
         ))}
      </div>

      {spells.length === 0 && (
         <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <h3 className="text-slate-400 text-xl font-serif mb-2">The Archives are Silent</h3>
            <p className="text-slate-600">Be the first to publish a spell to the community.</p>
         </div>
      )}

    </div>
  )
}