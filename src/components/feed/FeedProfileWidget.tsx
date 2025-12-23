'use client';

import { useState } from 'react';
import CreatePostForm from './CreatePostForm';

export default function FeedProfileWidget() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="mb-2 mt-2 flex flex-col items-center">
            <button 
                className="hover:text-purple-300 transition-colors cursor-pointer flex flex-row" 
                onClick={() => setIsVisible(!isVisible)}
            >
                {isVisible ? "Delete" : 'Share your intentions'}
            </button>
            
            <div className="w-full"> 
                {isVisible && <CreatePostForm />}
            </div>
        </div>
    );
}