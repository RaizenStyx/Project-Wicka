import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileForm from './ProfileFile' 
import PasswordForm from '@/components/PasswordForm'

export default async function SettingsPage() {
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

  // Combine the auth email with the profile data
  const initialData = {
    email: user.email || '',
    username: profile?.username || '',
    coven_name: profile?.coven_name || '',
    moon_phase: profile?.moon_phase || '',
    website: profile?.website || '',
    handle: profile?.handle || ''
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif text-purple-400 mb-2">Edit Grimoire</h1>
        <p className="text-slate-500 mb-8">Update your public persona within the coven.</p>
        <Link href={`/u/${profile?.handle || 'handle'}`} className="text-sm text-purple-400 hover:underline mb-6 inline-block">
          &larr; View Public Profile
        </Link>
        {/* Render the Client Component */}
        <ProfileForm initialData={initialData} />
        <PasswordForm />
        
      </div>
    </div>
  )
}