'use client'

import { useActionState } from 'react' 
import { updateProfile } from './actions'

// Define what props this form expects to receive
interface ProfileFormProps {
  initialData: {
    username: string
    coven_name: string
    moon_phase: string
    website: string
    email: string
    subtitle: string
  }
}

const initialState = {
  message: '',
  error: '',
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  // useActionState handles the form submission and the return value (state)
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="space-y-6 bg-slate-900/50 p-8 rounded-xl border border-slate-800">
      
      {/* Show Success or Error Messages */}
      {state?.success && (
        <div className="p-3 bg-green-900/30 border border-green-800 text-green-200 text-sm rounded">
          {state.success}
        </div>
      )}
      {state?.error && (
        <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 text-sm rounded">
          {state.error}
        </div>
      )}

      {/* Email (Read Only) */}
      <div>
        <label className="block text-xs uppercase text-slate-500 mb-2">Email (Private)</label>
        <input 
          type="text" 
          disabled 
          defaultValue={initialData.email} 
          className="w-full bg-slate-950/50 border border-slate-800 rounded p-3 text-slate-500 cursor-not-allowed"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs uppercase text-purple-400 mb-2">Witch Name (Username)</label>
        <input 
          name="username" 
          defaultValue={initialData.username || ''}
          type="text" 
          className="w-full bg-slate-950 border border-slate-800 rounded p-3 focus:border-purple-500 outline-none transition-colors"
        />
      </div>

      {/* Subtitle / Witch Title Input */}
      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">
          Magickal Title
        </label>
        <input 
          name="subtitle" 
          type="text" 
          defaultValue={initialData.subtitle || ''} 
          placeholder="e.g. High Priestess, Green Witch, Tarot Reader" 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-700" 
        />
        <p className="text-[10px] text-slate-500 mt-1">
          This appears as a badge next to your name.
        </p>
      </div>

      {/* Coven Name */}
      <div>
        <label className="block text-xs uppercase text-slate-400 mb-2">Coven Name</label>
        <input 
          name="coven_name" 
          defaultValue={initialData.coven_name || ''}
          type="text" 
          placeholder="e.g. The Moon Circle"
          className="w-full bg-slate-950 border border-slate-800 rounded p-3 focus:border-purple-500 outline-none transition-colors"
        />
      </div>

      {/* Favorite Moon Phase */}
       <div>
        <label className="block text-xs uppercase text-slate-400 mb-2">Affinity Moon Phase</label>
        <select 
          name="moon_phase" 
          defaultValue={initialData.moon_phase || 'Full Moon'}
          className="w-full bg-slate-950 border border-slate-800 rounded p-3 focus:border-purple-500 outline-none transition-colors text-slate-300"
        >
          <option value="New Moon">New Moon</option>
          <option value="Waxing Crescent">Waxing Crescent</option>
          <option value="Full Moon">Full Moon</option>
          <option value="Waning Gibbous">Waning Gibbous</option>
        </select>
      </div>

      {/* Website */}
      <div>
        <label className="block text-xs uppercase text-slate-400 mb-2">Spirit Web Link</label>
        <input 
          name="website" 
          defaultValue={initialData.website || ''}
          type="text" 
          placeholder="https://..."
          className="w-full bg-slate-950 border border-slate-800 rounded p-3 focus:border-purple-500 outline-none transition-colors"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isPending} 
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}