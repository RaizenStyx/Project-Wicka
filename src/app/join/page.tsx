import React from 'react';
import { Scroll, Video, Shield, CheckCircle2, Lock } from 'lucide-react';

export default function JoinPage() {
    const perks = [
        "Cast Spells (Create Posts)",
        "Collect Grimoire Items",
        "Access Member Directory",
        "Direct Messaging"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <span className="text-purple-400 font-bold tracking-widest uppercase text-sm mb-2 block">
                        Initiation Protocol
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                        Ascend to Guardian
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        To maintain the sanctity of our coven, we require all Initiates to verify their humanity and intent. 
                        We are building a safe haven for open minds—bots and negativity are banished here.
                    </p>
                </div>

                {/* The Process Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
                    {/* Connecting Line (Desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-900 via-purple-500 to-purple-900 -z-10 opacity-30"></div>

                    {/* Step 1: The Code */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl relative backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-purple-500/50 transition-colors shadow-lg shadow-black/50">
                            <Scroll className="text-purple-400 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">1. The Vow</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Agree to our Community Covenant. We value kindness, open-mindedness, and respect. 
                            Criticism is welcome, but cruelty is not.
                        </p>
                    </div>

                    {/* Step 2: The Offering */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl relative backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-purple-500/50 transition-colors shadow-lg shadow-black/50">
                            <Video className="text-purple-400 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">2. The Proof</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Submit a short 10-second video stating your username and one thing you hope to learn here. 
                            This ensures you are human, not a machine.
                        </p>
                    </div>

                    {/* Step 3: Ascension */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl relative backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-purple-500/50 transition-colors shadow-lg shadow-black/50">
                            <Shield className="text-purple-400 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">3. Ascension</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Once reviewed (usually within 24 hours), your role will shift from <strong>Initiate</strong> to <strong>Guardian</strong>.
                            The gates will open.
                        </p>
                    </div>
                </div>

                {/* Benefits / Permissions Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700/50 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-4">Why Verify?</h2>
                        <p className="text-slate-400 mb-6">
                            Unverified Initiates can only <strong>Observe</strong>. To protect the energy of the space, 
                            only Guardians can influence it.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {perks.map((perk, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <span className="text-sm font-medium">{perk}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="w-full md:w-auto flex flex-col items-center gap-4">
                        <button className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-500/20 transform hover:-translate-y-1 cursor-pointer">
                            Begin Verification
                        </button>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Lock size={12} /> Secure Submission
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}