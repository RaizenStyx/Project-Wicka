'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/app/utils/supabase/client' 
import { X, Upload, Sparkles, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAvatarUrl: string | null;
  onUploadComplete: (newUrl: string) => void;
}

export default function AvatarUploadModal({ isOpen, onClose, userId, currentAvatarUrl, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient();

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    
    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) return;
    
    try {
      setUploading(true)
      const file = fileInputRef.current.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Update Database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      
      if (dbError) throw dbError

      // Success
      onUploadComplete(publicUrl)
      onClose()

    } catch (error) {
      console.error('Error:', error)
      alert("The spirits rejected this offering. Try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Content - "The Mirror" */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl shadow-purple-900/50">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-purple-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Update Visage
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Preview Area */}
        <div className="flex flex-col items-center gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-40 h-40 rounded-full border-4 border-dashed border-slate-700 hover:border-purple-500 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-center overflow-hidden group"
          >
            {preview || currentAvatarUrl ? (
              <Image 
                src={preview || currentAvatarUrl!} 
                alt="Preview" 
                fill 
                className={`object-cover ${uploading ? 'opacity-50' : ''}`} 
              />
            ) : (
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-purple-400" />
            )}
            
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <p className="text-sm text-slate-400 text-center">
            Click the circle to choose a new reflection.<br/>
            <span className="text-xs text-slate-600">Max size 2MB</span>
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={!preview || uploading}
              className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Divining...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}