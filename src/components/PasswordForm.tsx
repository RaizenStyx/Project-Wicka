'use client'

import { updatePassword } from '@/app/actions/authActions'
import { useActionState } from 'react' 

const initialState = {
  message: '',
  error: '',
}

export default function PasswordForm() {
 const [pwdState, pwdAction, pwdPending] = useActionState(updatePassword, initialState)
    return (
 
    <div className="mt-12 pt-8 border-t border-slate-800">
      <h2 className="text-xl font-serif text-slate-300 mb-6">Security</h2>
      
      <form action={pwdAction} className="bg-slate-900/30 p-8 rounded-xl border border-slate-800/50">
        
        {pwdState?.success && <p className="text-green-400 text-sm mb-4">{pwdState.success}</p>}
        {pwdState?.error && <p className="text-red-400 text-sm mb-4">{pwdState.error}</p>}

        <div className="mb-4">
          <label className="block text-xs uppercase text-slate-500 mb-2">New Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="Min 6 characters"
            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 outline-none focus:border-purple-500"
          />
        </div>

        <button 
          disabled={pwdPending}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 rounded-lg text-sm border border-slate-700 transition-colors"
        >
          {pwdPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
    )
}