import React from 'react';

export default function JoinPage() {
    const steps = [
        {
            number: 1,
            title: 'Create Account',
            description: 'Sign up with your email and set up your profile with basic information.',
        },
        {
            number: 2,
            title: 'Verify Identity',
            description: 'Complete identity verification by submitting required documents and information.',
        },
        {
            number: 3,
            title: 'Get Verified',
            description: 'Receive your verified badge once your application is approved.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b bg-slate-950 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-300 mb-4">
                        Become a Verified Member
                    </h1>
                    <p className="text-xl text-gray-300">
                        Follow these 3 simple steps to get verified
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="bg-slate-900 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-gray-900 font-bold text-lg mb-4">
                                {step.number}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-400 mb-3">
                                {step.title}
                            </h2>
                            <p className="text-gray-300">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                        Start Verification
                    </button>
                </div>
            </div>
        </div>
    );
}