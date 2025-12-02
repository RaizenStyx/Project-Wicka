'use client';

import { useState } from 'react';
import CreatePostForm from './CreatePostForm';

export default function ProfileWidget() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="py-4 px-2 rounded-xl bg-slate-500 border border-slate-800 shadow-lg mb-6 mt-6">
            <button className="hover:text-purple-300 transition-colors cursor-pointer flex flex-row justify-self-center" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? "Delete" : 'Share your intentions'}
            </button>
            {isVisible && <CreatePostForm />}
        </div>
    );
}