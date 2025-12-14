'use server'

import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import RoleBadge from '../ui/RoleBadge'
import Avatar from '../ui/Avatar'

export default async function ProfileInfo() {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

    const firstLetter = profile?.handle?.[0]?.toUpperCase() ?? "U";
    const date = new Date(profile.created_at).toLocaleDateString();
    const bio = profile?.bio || 'Go to public profile to edit your bio';

    return (    
    <>
        <div className="flex justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-3">

            <Avatar 
              url={profile?.avatar_url || undefined} 
              alt={profile?.username || 'User Avatar'} 
              size={84} 
              fallback = {firstLetter || 'M'} 
              className = "border-slate-700 group-hover:border-purple-500 transition-colors" 
            /> 

            <div className="mb-1 flex flex-col">
              {/* ROW 1: Identity (Username + Subtitle) */}
              <div className="flex items-baseline gap-3">
                <p className="font-medium text-slate-200 text-lg">Welcome, {profile?.username}</p>
                {/* Subtitle - Styled as a sleek tag next to the name */}
                {profile.subtitle && (
                  <span className="hidden sm:block text-purple-400 text-sm font-bold uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
                    {profile.subtitle}
                  </span>
                )}
            </div>
            {/* Mobile Only Subtitle (If screen is too small, subtitle drops below) */}
              {profile.subtitle && (
                  <p className="sm:hidden text-purple-400 text-xs font-bold uppercase tracking-wider">
                    {profile.subtitle}
                  </p>
              )}
            <p className="text-xs text-slate-500">You joined: {date}</p>
            </div>
          </div>
          <RoleBadge role={profile.role || 'initiate'} />
        </div>
        <p className="text-slate-300 text-sm">
         {bio}
        </p>
    </>
    )
}
