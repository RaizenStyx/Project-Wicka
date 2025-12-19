import React from 'react';
import { Sparkles, Crown, Gem, Zap } from 'lucide-react';

export const metadata = {
  title: 'Support | Nocta',
  description: 'Learn how to support the platform and become a supporter!',
};

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                        Support the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Coven</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        NOCTA is independent and ad-free. Your support keeps the servers running and the magic flowing.
                    </p>
                </div>

                {/* Main Subscription Card */}
                <div className="relative max-w-lg mx-auto mb-24">
                    {/* Glowing Effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 animate-pulse"></div>
                    
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 md:p-12 text-center overflow-hidden">
                        {/* Decorative Badge */}
                        <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-amber-500/20">
                            MOST POPULAR
                        </div>

                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                            <Crown className="w-10 h-10 text-amber-400" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">Become a Supporter</h2>
                        <div className="flex justify-center items-baseline gap-1 mb-8">
                            <span className="text-4xl font-bold text-white">$5</span>
                            <span className="text-slate-500">/ month</span>
                        </div>

                        <ul className="text-left space-y-4 mb-10 text-slate-300">
                            <li className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                                <span>Exclusive <span className="text-white font-bold">Supporter Badge</span> on profile</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-purple-400 shrink-0" />
                                <span>Access to exclusive channel themes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Gem className="w-5 h-5 text-purple-400 shrink-0" />
                                <span>Early access to new features</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Crown className="w-5 h-5 text-purple-400 shrink-0" />
                                <span>Permanent "Patron of the Arts" role</span>
                            </li>
                        </ul>

                        <button className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition-colors mb-4 cursor-pointer">
                            Subscribe Now
                        </button>
                        <p className="text-xs text-slate-500">Cancel anytime. Secure payment via Stripe.</p>
                    </div>
                </div>

                {/* Future Bazaar Teaser */}
                <div className="border-t border-slate-800 pt-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900/50 p-8 rounded-2xl border border-dashed border-slate-800">
                        <div className="text-left">
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Gem className="text-amber-500" />
                                The Bazaar <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded ml-2 border border-slate-700">COMING SOON</span>
                            </h3>
                            <p className="text-slate-400 max-w-xl">
                                A marketplace for permanent unlocks. Supporters will gain exclusive access to buy special profile frames, tarot sets, and custom roles and badges.
                            </p>
                        </div>
                        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                           {/* Placeholder items just for visuals */}
                           <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700"></div>
                           <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700"></div>
                           <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}