'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { createPost, type FormState } from '../../app/actions/post-actions'
import { X, Image as ImageIcon } from 'lucide-react' 

const initialState: FormState = {
  message: '',
  error: '',
  success: '' 
}

export default function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPost, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  
  // New State for Image Handling
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form AND image state on success
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
      setPreviewUrl(null) 
    }
  }, [state.success])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Optional: 5MB limit check
         alert("File too large. The spirits require simpler offerings.")
         return
      }
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const clearImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-4 shadow-lg mt-2 rounded-xl bg-slate-700 border border-slate-800">
      
      {/* Error Message */}
      {state.error && (
         <div className="mb-3 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
            {state.error}
         </div>
      )}

      <form ref={formRef} action={formAction}>
        <div className="flex gap-4">
          <textarea  
            name="content"
            rows={3} 
            placeholder="Share your intention..." 
            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-600 outline-none resize-none"
            autoComplete="off"
            maxLength={300}
            disabled={isPending}
          />
        </div>

        {/* --- Image Preview Section --- */}
        {previewUrl && (
            <div className="relative mt-3 inline-block">
                <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded-lg border border-slate-600 object-cover" />
                <button 
                    type="button" 
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 hover:text-white rounded-full p-1 border border-slate-700 cursor-pointer"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        )}

        <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-3">
          
          <div className="flex gap-4 text-xs text-purple-400/70">
            {/* Hidden Input */}
            <input 
                type="file" 
                name="image" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
            />
            
            {/* Clickable Label */}
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
            >
                <ImageIcon className="w-3 h-3" />
                + Image
            </button>

            <span className="hover:text-purple-300 transition-colors cursor-pointer opacity-50 cursor-not-allowed">
                + Sigil
            </span>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer"
          >
            {isPending ? 'Casting...' : 'Cast'}
          </button>
        </div>
      </form>
    </div>
  )
}