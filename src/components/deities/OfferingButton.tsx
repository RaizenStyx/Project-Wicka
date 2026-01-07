'use client'

import { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';
import { extendInvocation } from '@/app/actions/deity-invocation-actions';

interface Props {
    deityId: string;
    lastOfferingAt: string | null;
    onUpdate: () => void;
}

export default function OfferingButton({ deityId, lastOfferingAt, onUpdate }: Props) {
    const [loading, setLoading] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);
    
    // 1. Create an internal state initialized by the prop
    const [optimisticLastOfferingAt, setOptimisticLastOfferingAt] = useState<string | null>(lastOfferingAt)

    // 2. Sync internal state if the prop changes (e.g., on initial load or server refresh)
    useEffect(() => {
        setOptimisticLastOfferingAt(lastOfferingAt)
    }, [lastOfferingAt])

    // 3. Effect now depends on the OPTIMISTIC state, not just the prop
    useEffect(() => {
        if (!optimisticLastOfferingAt) {
            setCooldownRemaining(null)
            return
        }

        const checkCooldown = () => {
            const now = new Date().getTime()
            const offeringTime = new Date(optimisticLastOfferingAt).getTime()
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
    }, [optimisticLastOfferingAt])

    const handleExtend = async () => {
        setLoading(true)
        try {
            await extendInvocation(deityId)
            
            // 4. OPTIMISTIC UPDATE:
            // Set the timestamp immediately upon success.
            // This triggers the useEffect above to disable the button instantly.
            setOptimisticLastOfferingAt(new Date().toISOString())

            onUpdate() // Still trigger the parent refresh to sync server data in background
        } catch (e) {
            console.error(e)
            // Ideally add toast error handling here
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