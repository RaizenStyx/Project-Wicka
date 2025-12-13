'use client'

import { useState, useActionState } from 'react';
import { login, signup } from '@/app/login/actions';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true) // Toggle state

  // We need two separate action hooks
  const [loginState, loginAction, loginPending] = useActionState(login, { error: '', success: '' })
  const [signupState, signupAction, signupPending] = useActionState(signup, { error: '', success: '' })

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* Background Vibes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-purple-400 tracking-wider font-bold mb-2">NOCTA</h1>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Enter the circle.' : 'Begin your journey.'}
          </p>
        </div>

        {/* --- LOGIN FORM --- */}
        {isLogin ? (
          <form action={loginAction} className="space-y-4">
            {loginState?.error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{loginState.error}</p>}
            
            <div>
              <input name="email" type="email" placeholder="Email Address" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
            </div>

            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
              <button
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            
            <button disabled={loginPending} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium transition-all cursor-pointer shadow-[0_0_10px_rgba(100,100,100,0.2)] hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              {loginPending ? 'Entering...' : 'Log In'}
            </button>
          </form>
        ) : (
          /* --- SIGN UP FORM --- */
          <form action={signupAction} className="space-y-4">
            {signupState?.error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{signupState.error}</p>}
            {signupState?.success && <p className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded">{signupState.success}</p>}

            <div>
              <input name="email" type="email" placeholder="Email Address" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
            </div>
            <div>
              <input name="username" type="text" placeholder="Witch Name (Display Name)" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="password" type="password" placeholder="Password" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
              <input name="confirmPassword" type="password" placeholder="Confirm" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" />
            </div>

            <button disabled={signupPending} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-medium shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all cursor-pointer">
              {signupPending ? 'Joining...' : 'Join Coven'}
            </button>
          </form>
        )}

        {/* --- TOGGLE SWITCH --- */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 mb-3">
            {isLogin ? "Don't have a grimoire yet?" : "Already initiated?"}
          </p>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-4 cursor-pointer transition-colors"
          >
            {isLogin ? "Create an Account" : "Return to Login"}
          </button>
        </div>

      </div>
    </div>
  )
}