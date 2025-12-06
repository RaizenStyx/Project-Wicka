// 'use client'

// import { useState, useEffect } from 'react'
// import { createClient } from '@/app/utils/supabase/server'
// import Avatar from '@/components/ui/Avatar'
// import { Loader2, Upload, Camera } from 'lucide-react'

// interface Props {
//   uid: string
//   url: string | null
//   fallback: string
// }

// export default async function AvatarUpload({ uid, url, fallback }: Props) {
//   const supabase = await createClient()

//   const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
//   const [uploading, setUploading] = useState(false)

//   const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     try {
//       setUploading(true)

//       if (!event.target.files || event.target.files.length === 0) {
//         throw new Error('You must select an image to upload.')
//       }

//       const file = event.target.files[0]
//       const fileExt = file.name.split('.').pop()
//       // We name the file specifically so we don't accumulate junk.
//       // Using a timestamp forces the browser to fetch the new version.
//       const filePath = `${uid}/avatar-${Date.now()}.${fileExt}`

//       // 1. Upload to Supabase Storage
//       const { error: uploadError } = await supabase.storage
//         .from('avatars')
//         .upload(filePath, file)

//       if (uploadError) {
//         throw uploadError
//       }

//       // 2. Get the Public URL
//       const { data: { publicUrl } } = supabase.storage
//         .from('avatars')
//         .getPublicUrl(filePath)

//       // 3. Update the Profiles Table
//       const { error: updateError } = await supabase
//         .from('profiles')
//         .update({ avatar_url: publicUrl })
//         .eq('id', uid)

//       if (updateError) {
//         throw updateError
//       }

//       setAvatarUrl(publicUrl)
//       alert('Avatar updated!') // Replace with your toast notification system

//     } catch (error) {
//       console.error('Error uploading avatar:', error)
//       alert('Error uploading avatar')
//     } finally {
//       setUploading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col items-center gap-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm">
//       <div className="relative group">
//         <Avatar 
//           url={avatarUrl} 
//           size={120} 
//           fallback={fallback} 
//           alt="User Avatar"
//           className="shadow-xl shadow-purple-900/20"
//         />
        
//         {/* Overlay for upload interaction */}
//         <label 
//           className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
//           htmlFor="single"
//         >
//           {uploading ? (
//             <Loader2 className="h-6 w-6 animate-spin text-white" />
//           ) : (
//             <Camera className="h-8 w-8 text-white" />
//           )}
//         </label>
//         <input
//           style={{
//             visibility: 'hidden',
//             position: 'absolute',
//           }}
//           type="file"
//           id="single"
//           accept="image/*"
//           onChange={uploadAvatar}
//           disabled={uploading}
//         />
//       </div>
      
//       <div className="text-center">
//         <h3 className="text-lg font-medium text-slate-200">Profile Image</h3>
//         <p className="text-sm text-slate-500">Click the image to upload a new one.</p>
//       </div>
//     </div>
//   )
// }