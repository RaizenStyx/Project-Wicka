import { getMembers } from '@/app/actions/member-actions'
import Link from 'next/link'
import { User, MessageCircle, Shield, Sparkles, House, Cannabis, Cat } from 'lucide-react'
import { clsx } from 'clsx'

export default async function MembersPage() {
  const members = await getMembers()

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          Nocta Members
        </h1>
        <p className="text-slate-400 mt-2">
          Connect with your fellow witches and practitioners.
        </p>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="group relative bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20"
          >
            {/* Header: Avatar & Role */}
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-purple-500 group-hover:text-purple-300 transition-colors">
                 {/* Eventually use member.avatar_url here */}
                 <User className="w-6 h-6" />
              </div>

              <RoleBadge role={member.role || 'initiate'} />
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-100 font-serif tracking-wide">
                {member.username || 'Unknown Soul'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                @{member.handle}
                {/* Optional Role Badge */}
                  {(member.role === 'verified' || member.role === 'supporter') && (
                      <Shield className="w-3 h-3 text-purple-400 fill-purple-400/20" />
                  )}
                  {(member.role === 'Goddess') && (
                      <Cannabis className="w-3 h-3 text-purple-400 fill-purple-400/20" />
                  )}
                  {(member.role === 'Princess') && (
                      <Cat className="w-3 h-3 text-purple-400 fill-purple-400/20" />
                  )}
              </p>
              {/* Optional: Show Coven Name if they have one */}
              {member.coven_name && (
                <div className="mt-3 flex items-center gap-2 text-xs text-purple-300/80 bg-purple-900/20 px-2 py-1 rounded w-fit">
                    <House className="w-3 h-3" />
                    {member.coven_name}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-800/50">
              {/* Profile Link */}
              <Link 
                href={`/u/${member.handle}`}
                className="flex-1 text-center py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                View Grimoire
              </Link>
              
              {/* Chat Placeholder */}
              <button 
                disabled
                title="Whisper functionality coming soon"
                className="flex items-center justify-center px-4 rounded-lg bg-slate-800/50 text-slate-600 cursor-not-allowed border border-transparent"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {members.length === 0 && (
         <div className="text-center py-20 text-slate-500 italic">
            No members found. The spirits are quiet...
         </div>
      )}

    </div>
  )
}

// --- Helper Component for Roles ---
function RoleBadge({ role }: { role: string }) {
    // Customize colors based on role
    const isSupporter = role === 'supporter' || role === 'admin' || role === 'Princess' || role === 'Goddess';
    const isVerified = role === 'verified';
    return (
        <span className={clsx(
        
          "text-[10px] uppercase font-bold px-2 py-1 rounded-full border flex items-center gap-1",
            isSupporter ? "bg-amber-900/20 text-amber-200 border-amber-800" :
            isVerified ? "bg-purple-900/20 text-purple-200 border-purple-800" :
            "bg-slate-800 text-slate-500 border-slate-700" // Initiate
        )}>
            {isSupporter && <Sparkles className="w-3 h-3" />}
            {role || 'Initiate'}
        </span>
    )
}