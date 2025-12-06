'use client';

import { useState } from 'react';
import CreatePostForm from '../features/CreatePostForm';

export default function ProfileWidget() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="mb-2 mt-2">
            <button className="hover:text-purple-300 transition-colors cursor-pointer flex flex-row justify-self-center" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? "Delete" : 'Share your intentions'}
            </button>
            {isVisible && <CreatePostForm />}
        </div>
    );
}