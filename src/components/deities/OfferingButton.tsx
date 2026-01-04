'use client'

import { useState, useEffect } from 'react'
import { Flame, Clock } from 'lucide-react'
import { extendInvocation } from '@/app/actions/deity-invocation-actions'
import { useRouter } from 'next/navigation'

interface Props {
    deityId: string
    lastOfferingAt: string | null
    onUpdate: () => void
}

export default function OfferingButton({ deityId, lastOfferingAt, onUpdate }: Props) {
    const [loading, setLoading] = useState(false)
    const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null)

    useEffect(() => {
        if (!lastOfferingAt) {
            setCooldownRemaining(null)
            return
        }

        const checkCooldown = () => {
            const now = new Date().getTime()
            const offeringTime = new Date(lastOfferingAt).getTime()
            const cooldownMs = 8 * 60 * 60 * 1000 // 8 hours
            const nextAvailable = offeringTime + cooldownMs
            const diff = nextAvailable - now

            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                setCooldownRemaining(`${hours}h ${minutes}m`)
            } else {
                setCooldownRemaining(null)
            }
        }

        checkCooldown()
        const interval = setInterval(checkCooldown, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [lastOfferingAt])

    const handleExtend = async () => {
        setLoading(true)
        try {
            await extendInvocation(deityId)
            onUpdate() // Trigger parent refresh
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (cooldownRemaining) {
        return (
            <button disabled className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full text-slate-500 cursor-not-allowed opacity-75">
                <Clock size={18} />
                <span>Available in {cooldownRemaining}</span>
            </button>
        )
    }

    return (
        <button 
            onClick={handleExtend}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-orange-950/30 border border-orange-900/50 rounded-full text-orange-200 hover:bg-orange-900/40 transition-all hover:scale-105 disabled:opacity-50"
        >
            <Flame size={18} className={loading ? "animate-spin" : "text-orange-500 animate-pulse"} />
            <span>{loading ? 'Offering...' : 'Extend Ritual (+6h)'}</span>
        </button>
    )
}