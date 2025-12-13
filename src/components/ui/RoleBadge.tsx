import clsx from "clsx";
import { Sparkles, Cannabis, Cat, Shield, ChevronLeft, Check } from 'lucide-react'

export default function RoleBadge({ role }: { role: string }) {
    // Customize colors based on role
    const isSupporter = role === 'supporter' || role === 'admin';
    const isVerified = role === 'verified';
    const isWife = role === 'Goddess';
    const isDaughter = role === 'Princess';
    return (
        <span className={clsx(
          "text-[10px] uppercase font-bold px-2 py-1 rounded-full border flex items-center gap-1",
            isSupporter ? "bg-amber-900/20 text-amber-200 border-amber-800" :
            isWife ? "bg-purple-500/20 text-purple-200 border-purple-500" :
            isDaughter ? "bg-pink-500/20 text-pink-200 border-pink-500" :
            isVerified ? "bg-purple-900/20 text-purple-200 border-purple-800" :
            "bg-slate-800 text-slate-500 border-slate-700" // Initiate
        )}>
            {isVerified && <Shield className="w-3 h-3" />}
            {isSupporter && <Sparkles className="w-3 h-3" />}
            {isWife && <Cannabis className="w-3 h-3" />}
            {isDaughter && <Cat className="w-3 h-3" />}
            {role || 'Initiate'}
        </span>
    )
}