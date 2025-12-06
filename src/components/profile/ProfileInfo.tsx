'use server'

import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { Sparkles } from 'lucide-react'
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
    const date = new Date(user.created_at).toLocaleDateString();

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

            <div>
                <p className="font-medium text-slate-200 text-lg">Welcome, {profile?.username}</p> 
              
                <p className="text-xs text-slate-500">You joined: {date}</p>
            </div>
            <X className="w-5 h-5 text-purple-500 rotate-45 -scale-x-100" />
          </div>
          <RoleBadge role={profile.role || 'initiate'} />
        </div>
        <p className="text-slate-300 text-sm">
            "This is a placeholder bio for the user profile. It gives a brief introduction about the user, their interests, and what they bring to the coven."
        </p>
    </>
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