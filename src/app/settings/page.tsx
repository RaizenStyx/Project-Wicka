import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileForm from './ProfileForm' 
import PasswordForm from '@/components/features/PasswordForm'
import BirthDateForm from '@/components/profile/BirthDateForm'

export const metadata = {
  title: 'Settings | Nocta',
  description: 'Change your settings within Nocta.',
};

export default async function SettingsPage() {
  const supabase = await createClient();

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
    handle: profile?.handle || '',
    subtitle: profile?.subtitle
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif text-purple-400 mb-2">Edit Grimoire</h1>
        <p className="text-slate-500 mb-8">Update your public persona within the coven.</p>
        <Link href={`/u/${profile?.handle || 'handle'}`} className="text-sm text-purple-400 hover:underline mb-6 inline-block">
          &larr; View Public Profile
        </Link>
        {/* Render the Client Components */}
        {profile.birth_date ? (
          <div className="bg-gradient-to-r from-purple-900 to-purple-800 border-l-4 border-purple-400 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">✓ Birth Date Registered</h3>
            <p className="text-purple-100 mb-3">Your birth date has been securely recorded in your grimoire.</p>
            <p className="text-sm text-purple-300">To modify your birth date, please <Link href="mailto:me@calexreed.dev" className="text-purple-200 hover:text-purple-100 underline">reach out to the creator</Link>.</p>
          </div>
        ) : (
          <BirthDateForm />
        )}
        
        <ProfileForm initialData={initialData} />
        <PasswordForm />
        
      </div>
    </div>
  )
}