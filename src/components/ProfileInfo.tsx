'use server'

import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { X } from 'lucide-react'

export default async function ProfileInfo() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() }
        }
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

    const firstLetter = profile?.handle?.[0]?.toUpperCase() ?? "U";

    return (    
    <>
        <div className="flex justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-3">

            
            <div className="h-16 w-16 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-400 font-bold text-2xl">
                {firstLetter}
            </div>
            <div>
                <p className="font-medium text-slate-200 text-lg">Welcome, {profile?.username}</p> 
                {/* TODO: Fix timestamp  */}
                <p className="text-xs text-slate-500">You joined: {profile?.updated_at}</p>
            </div>
            <X className="w-5 h-5 text-purple-500 rotate-45 -scale-x-100" />
          </div>
            <div>
              <p className="text-sm bg-purple-500 text-white px-2 py-0.5 rounded-full inline-block" title="User Role">{profile?.role || 'witch'}</p>
            </div>
        </div>
        <p className="text-slate-300 text-sm">
            "This is a placeholder bio for the user profile. It gives a brief introduction about the user, their interests, and what they bring to the coven."
        </p>
    </>
    )
}