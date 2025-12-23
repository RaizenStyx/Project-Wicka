'use client'

import React, { useState } from 'react';
import { Sparkles, Crown, Gem, Zap, CreditCard, Copy, Check, ExternalLink, Heart } from 'lucide-react';

// export const metadata = {
//   title: 'Support | Nyxus',
//   description: 'Learn how to support the platform and become a supporter!',
// };

// Simple Copy-Paste Button Component
const CopyButton = ({ text, label }: { text: string, label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg p-3 group hover:border-purple-500/30 transition-colors">
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-slate-200 font-mono text-sm">{text}</span>
      </div>
      <button 
        onClick={handleCopy}
        className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
      </button>
    </div>
  );
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
                        NYXUS is independent and ad-free. Your support keeps the servers running and the magic flowing.
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
                        <p className="text-xs text-slate-500">Placeholder card for now.</p>
                    </div>
                </div>

                {/* --- DIRECT SUPPORT SECTION --- */}
                <div className="mt-20">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 flex items-center justify-center gap-3">
                    <Heart className="text-pink-500 fill-pink-500/20" />
                    Direct Tribute
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                    Prefer a one-time donation? Your direct support goes 100% toward server costs and development caffeine. No fees, no subscriptions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Option 1: Gumroad (Credit Card / Apple Pay) */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 transition-colors flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 border border-pink-500/20">
                        <CreditCard className="text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Donate via Gumroad</h3>
                        <p className="text-sm text-slate-400 mb-6">
                        Use your Credit Card, Apple Pay, or PayPal securely through my Gumroad page. You can choose your own amount.
                        </p>
                    </div>
                    
                    <a 
                        href="https://6801801549663.gumroad.com/l/nayuj" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-200 font-bold py-3 px-4 rounded-xl border border-slate-700 hover:border-pink-500 transition-all group"
                    >
                        <span>Go to Gumroad</span>
                        <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    </div>

                    {/* Option 2: Direct Transfer (Zelle / PayPal) */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <svg className="w-6 h-6 text-blue-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Direct Transfer</h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Zero fees. Direct transfer using Zelle or PayPal Friends & Family.
                    </p>

                    <div className="space-y-3">
                        {/* Zelle Copy Block */}
                        <CopyButton label="Zelle (Email)" text="c.alexreed@gmail.com" />
                        
                        {/* PayPal Copy Block */}
                        <CopyButton label="PayPal (Handle)" text="@calexreed" />
                    </div>
                    </div>

                </div>
                
                <div className="text-center mt-8">
                    <p className="text-xs text-slate-600 italic">
                    * Please include your Username in the donation note so I can bestow your Supporter Badge!
                    </p>
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