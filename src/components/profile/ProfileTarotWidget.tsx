import { getLatestReading } from '@/app/actions/tarot-actions';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Calendar, Share2, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface ProfileTarotWidgetProps {
    userId: string;
    isOwner: boolean;
}

export default async function ProfileTarotWidget({ userId, isOwner }: ProfileTarotWidgetProps) {
  // Pass the profile's ID to fetch THEIR reading
  const reading = await getLatestReading(userId);

  console.log("User ID" + userId)

  if (!reading) {
    if (isOwner) {
        return (
            <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-500 text-sm mb-4">No fate scribed yet.</p>
                <Link href="/tarot-draw" className="text-xs text-indigo-400 hover:text-indigo-300 uppercase tracking-wider font-bold">
                    Visit Divination Room →
                </Link>
            </div>
        );
    }
    // If visitor and no reading, show nothing or a subtle placeholder
    return (
        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-600 text-sm italic">The cards have not yet spoken for this witch.</p>
        </div>
    );
  }

  const date = new Date(reading.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
        <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-serif text-slate-200 font-medium">Last Spread</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            <Calendar className="w-3 h-3" />
            {date}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        
        {/* Title & Intent */}
        <div className="text-center">
            <h3 className="text-indigo-300 font-serif text-lg leading-none mb-1">{reading.spread_name}</h3>
            {reading.query && <p className="text-xs text-slate-500 italic">"{reading.query}"</p>}
        </div>

        {/* The Spread (Side-by-Side on Mobile) */}
        <div className="grid grid-cols-3 gap-2 w-full">
            {reading.cards.map((card, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                    {/* Card Container */}
                    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shadow-sm">
                        {card.info.image_url ? (
                             <Image 
                                src={card.info.image_url} 
                                alt={card.info.name} 
                                fill 
                                sizes="(max-width: 768px) 33vw, 150px"
                                className={clsx("object-cover", card.reversed && "rotate-180")}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-1 text-center bg-indigo-950/20">
                                <span className="text-[8px] text-slate-500">{card.info.name}</span>
                            </div>
                        )}
                    </div>
                    {/* Position Label */}
                    <div className="text-center w-full">
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider leading-tight truncate w-full px-1">
                            {card.position_name}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer Actions */}
        {/* <div className="text-center mt-2 pt-3 border-t border-slate-800/50">
            {isOwner ? (
                <Link href="/tarot-draw/journal" className="text-[10px] text-slate-400 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1">
                    View Interpretation →
                </Link>
            ) : (
                <button 
                    disabled 
                    className="group flex items-center justify-center gap-2 w-full text-[10px] text-slate-600 cursor-not-allowed"
                    title="Community Sharing coming soon"
                >
                    <Share2 className="w-3 h-3 group-hover:text-slate-500" />
                    <span>Share / Community View (Coming Soon)</span>
                </button>
            )}
        </div> */}

        {/* Might come back to this later */}

      </div>
    </div>
  );
}