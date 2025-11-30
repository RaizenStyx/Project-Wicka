// src/app/login/page.tsx
import { login, signup } from '../actions/loginActions'

export default function LoginPage({ searchParams }: { searchParams: { message: string, error: string } }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* Mystical Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-purple-400 tracking-wider font-bold mb-2">COVEN</h1>
          <p className="text-slate-500 text-sm">Enter the circle. Your grimoire awaits.</p>
        </div>

        {/* Error/Success Messages */}
        {searchParams?.error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-900/50 rounded text-red-200 text-sm text-center">
                {searchParams.error}
            </div>
        )}

        {/* The Form */}
        <form className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              id="email"
              name="email"
              type="email"
              placeholder="witch@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              formAction={login}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium transition-all border border-slate-700"
            >
              Log In
            </button>
            <button 
              formAction={signup}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              Join Coven
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-xs text-slate-600">
          By entering, you agree to our <span className="underline cursor-pointer hover:text-purple-400">covenant & rules</span>.
        </p>
      </div>
    </div>
  )
}