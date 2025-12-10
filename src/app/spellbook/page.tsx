import { getSpells } from '@/app/actions/spell-actions'
import { BookOpen, Feather } from 'lucide-react'
import { createClient } from '../utils/supabase/server'
import SpellForm from '@/components/spellbook/SpellForm' 
import SpellCard from '@/components/spellbook/SpellCard' 

export default async function SpellbookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Fetch User Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
    
  const userRole = profile?.role || 'initiate' // Default to safety

  const spells = await getSpells()

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-purple-200 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <BookOpen className="w-8 h-8 text-purple-400" />
            My Grimoire
          </h1>
          <p className="text-slate-400 mt-2">
            Record your rituals, recipes, and intentions.
          </p>
        </div>
      </div>

      {/* Spell form */}
      <SpellForm userRole = {userRole} />

      {/* SPELL LIST */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif text-slate-300 mb-4 pl-2 border-l-4 border-purple-500">
          Recorded Spells ({spells.length})
        </h2>
        
        {spells.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <Feather className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">Your pages are empty. <br/>Write your first spell above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
             {spells.map((spell) => (
               <SpellCard key={spell.id} spell={spell} userRole = {userRole}/>
             ))}
          </div>
        )}
      </div>

    </div>
  )
}