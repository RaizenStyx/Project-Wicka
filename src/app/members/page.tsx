import { getMembers } from '@/app/actions/member-actions'
import Link from 'next/link'
import { MessageCircle, Shield, House, Cannabis, Cat } from 'lucide-react'
import RoleBadge from '@/components/ui/RoleBadge'
import Avatar from '@/components/ui/Avatar'

export const metadata = {
  title: 'Members | Nyxus',
  description: 'Explore all the current members!',
};

export default async function MembersPage() {
  const members = await getMembers()

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          Nyxus Members 
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
              
              <Avatar url={member.avatar_url} 
                alt ={member.username || 'Member Avatar'}
                size={50}
                fallback = {member.username?.[0]?.toUpperCase() || 'M'} 
                className = "border-slate-700 group-hover:border-purple-500 transition-colors" 
              /> 

              <RoleBadge role={member.role || 'initiate'} />
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-100 font-serif tracking-wide">
                {member.username || 'Unknown Soul'}
                
              </h3>
                {member.subtitle && (
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 px-1 py-0.5 rounded">
                    {member.subtitle}
                  </span>
                )}
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                @{member.handle}
                {/* Optional Role Badge */}
                  {(member.role === 'guardian' || member.role === 'supporter') && (
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
                href={`/u/${member.handle}?from=members`}
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