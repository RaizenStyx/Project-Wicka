'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import AvatarUploadModal from './AvatarUploadModal'
import { useRouter } from 'next/navigation' 

// Define the shape of profile data
interface ProfileData {
    id: string
    username: string
    handle: string
    avatar_url: string | null
    // ... any other props
}

interface Props {
  profile: ProfileData
  isOwnProfile: boolean
}

export default function ProfileHeader({ profile, isOwnProfile }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter() // Used to refresh the page after upload

  const handleUploadComplete = (newUrl: string) => {
    // Determine what to do after upload. 
    // Option A: Refresh page to fetch new data from server
    router.refresh() 
    
    // Option B: You could also update local state here if you prefer instant updates without reload
  }

  return (
    <>
      <div className="flex flex-col items-center">
         {/* The Avatar */}
         <Avatar 
           url={profile.avatar_url}
           alt={profile.username}
           fallback={profile.username}
           size={128} // Large size for profile header
           className="border-slate-900 shadow-2xl"
           
           // Only editable if it is the user's own profile
           isEditable={isOwnProfile}
           onEdit={() => setIsModalOpen(true)}
         />
         
      </div>

      {/* The Modal (Only renders if isOwnProfile is true ideally, but the modal logic handles visibility) */}
      {isOwnProfile && (
        <AvatarUploadModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userId={profile.id}
            currentAvatarUrl={profile.avatar_url}
            onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  )
}