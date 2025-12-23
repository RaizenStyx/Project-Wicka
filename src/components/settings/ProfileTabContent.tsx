'use client'

import Link from 'next/link'
import ProfileForm from './ProfileForm'
import BirthDateForm from '@/components/profile/BirthDateForm'

// Define what data this component expects
interface ProfileTabContentProps {
  initialData: any;
  profile: any;
}

export default function ProfileTabContent({ initialData, profile }: ProfileTabContentProps) {
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif text-purple-400 mb-2">Public Persona</h2>
        <p className="text-slate-500 mb-4">Update how you appear to the coven.</p>
        
        {/* Birth Date Logic */}
        {profile?.birth_date ? (
          <div className="bg-gradient-to-r from-purple-900 to-purple-800 border-l-4 border-purple-400 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">✓ Birth Date Registered</h3>
            <p className="text-purple-100 mb-3">Your birth date has been securely recorded in your grimoire.</p>
            <p className="text-sm text-purple-300">
              To modify your birth date, please <Link href="mailto:me@calexreed.dev" className="text-purple-200 hover:text-purple-100 underline">reach out to the creator</Link>.
            </p>
          </div>
        ) : (
          <BirthDateForm />
        )}
      </div>

      {/* The Main Forms */}
      <ProfileForm initialData={initialData} />
    </div>
  )
}