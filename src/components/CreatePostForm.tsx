'use client'

import { useActionState } from 'react'
import { useEffect, useRef } from 'react'
import { createPost, type FormState } from '../app/actions/postActions'

// Ensure initialState matches the type EXACTLY
const initialState: FormState = {
  message: '',
  error: '',
  success: '' 
}

export default function CreatePostForm() {
  // Pass the type to the hook
  const [state, formAction, isPending] = useActionState(createPost, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state.success])

  return (
    <div className="p-4 shadow-lg mt-2 rounded-xl bg-slate-900 border border-slate-800">
      
      {/* Show Error */}
      {state.error && (
         <div className="mb-3 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
            {state.error}
         </div>
      )}

      <form ref={formRef} action={formAction}>
        <div className="flex gap-4">
          {/* <div className="h-10 w-10 rounded-full bg-slate-800 shrink-0 border border-slate-700">
            
          </div> */}
          <input 
            name="content"
            type="text" 
            placeholder="Share your intention..." 
            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-600 outline-none"
            autoComplete="off"
            disabled={isPending}
          />
        </div>
        <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-3">
          <div className="flex gap-4 text-xs text-purple-400/70 cursor-pointer hover:text-purple-300 transition-colors">
            <span>+ Image</span>
            <span>+ Sigil</span>
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            {isPending ? 'Casting...' : 'Cast'}
          </button>
        </div>
      </form>
    </div>
  )
}