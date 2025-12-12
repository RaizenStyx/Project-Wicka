'use client'

import { updatePassword, sendResetEmail } from '@/app/actions/auth-actions'
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

        {/* Current Password Field (Optional Placeholder for now) */}
        <div className="mb-4">
          <label className="block text-xs uppercase text-slate-500 mb-2">Current Password Will Go Below</label>
          {/* <input 
            name="currentPassword" 
            type="password" 
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 outline-none focus:border-purple-500"
          /> */}
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase text-slate-500 mb-2">New Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="Min 6 characters"
            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 outline-none focus:border-purple-500"
          />
        </div>

        <div className="mb-4">
            <label className="block text-xs uppercase text-slate-500 mb-2">Confirm Password</label>
            <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Retype password"
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 outline-none focus:border-purple-500 transition-colors"
            />
        </div>

          <div className="flex justify-end">
            <button 
            disabled={pwdPending}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 rounded-lg text-sm border border-slate-700 transition-colors"
            >
            {pwdPending ? 'Updating...' : 'Update Password'}
            </button>
        </div>
      </form>
      {/* FORGOT PASSWORD SECTION */}
      <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800/50 flex items-center justify-between">
          <div>
              <h3 className="text-slate-300 font-medium">Forgot your password?</h3>
              <p className="text-xs text-slate-500 mt-1">
                  {/* We will send a secure link to <span className="text-purple-400">{initialData.email}</span> to reset it. */}
              </p>
          </div>
          
          {/* We wrap this in a form to use a Server Action button */}
          {/* <ResetPasswordButton /> */}
      </div>
    </div>
    )
}

// function ResetPasswordButton() {
//     const [state, action, isPending] = useActionState(sendResetEmail, { message: '', error: '', success: '' })

//     return (
//         <form action={action} className="text-right">
//             {state?.success ? (
//                 <p className="text-green-400 text-sm">✓ {state.success}</p>
//             ) : (
//                 <button 
//                     disabled={isPending}
//                     className="text-sm text-purple-400 hover:text-purple-300 hover:underline disabled:opacity-50"
//                 >
//                     {isPending ? 'Sending...' : 'Send Reset Link'}
//                 </button>
//             )}
//             {state?.error && <p className="text-red-400 text-xs mt-1">{state.error}</p>}
//         </form>
//     )
// }