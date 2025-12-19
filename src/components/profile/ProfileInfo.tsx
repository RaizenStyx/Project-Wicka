'use server'

import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
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
              <p className="sm:hidden w-min">
                <RoleBadge role={profile.role || 'initiate'} />
              </p>
              {/* ROW 1: Identity (Username + Subtitle) */}
              <div className="flex gap-3">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-x">
                  {profile?.username}
                </span>
              </h1>

                {/* Subtitle - Styled as a sleek tag next to the name */}
                {profile.subtitle && (
                  <span className="hidden sm:block content-center text-purple-400 text-sm font-bold uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
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
            
            </div>
          </div>
          <div className='hidden sm:block'>
            <RoleBadge role={profile.role || 'initiate'} />
          </div>
        </div>
        <p className="text-slate-300 text-sm py-2.5">
         {bio}
        </p>
    </>
    )
}
