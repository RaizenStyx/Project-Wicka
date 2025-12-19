'use client'

import { useState } from 'react'
import { updateBirthDate } from '@/app/actions/profile-actions'
import { Loader2, Sparkles, Calendar } from 'lucide-react'

interface Props {
  initialDate?: string | null
  initialSign?: string | null // Pass the *Name* of the sign if you have it
}

export default function BirthDateForm({ initialDate, initialSign }: Props) {
  const [date, setDate] = useState(initialDate || '')
  const [loading, setLoading] = useState(false)
  const [detectedSign, setDetectedSign] = useState<string | null>(initialSign || null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    
    const result = await updateBirthDate(formData)
    
    if (result.error) {
      setMsg({ type: 'error', text: result.error })
    } else if (result.success && result.signName) {
      setDetectedSign(result.signName)
      setMsg({ type: 'success', text: `Aligned with the stars! You are a ${result.signName}.` })
    }
    
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-serif text-xl font-medium text-slate-100">Celestial Alignment</h3>
          <p className="text-sm text-slate-400">Enter your birth date to reveal your Zodiac and Ruling Planet.</p>
        </div>
        <div className="rounded-full bg-purple-900/20 p-2 text-purple-400">
           <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            name="birth_date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-slate-100 focus:border-purple-500 focus:outline-none [color-scheme:dark] cursor-pointer"
          />
        </div>

        {detectedSign && (
          <div className="flex items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-900/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white shadow-lg shadow-purple-900/50">
              {/* You could map symbols here if you want later */}
              {detectedSign[0]}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Detected Sign</p>
              <p className="font-serif text-lg text-white">{detectedSign}</p>
            </div>
          </div>
        )}

        {msg && (
          <p className={`text-sm ${msg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {msg.text}
          </p>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 font-medium text-slate-900 transition-colors hover:bg-white disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Birth Date'}
        </button>
      </form>
    </div>
  )
}