'use client' 

import React, { useState } from 'react';
import Avatar from './Avatar';
import Image from 'next/image';
import Lightbox from './Lightbox';

interface PostCardProps {
  username: string;
  avatar_url?: string | null;
  timeAgo: string;
  content: string;
  currentUserRole?: string;
  moonPhase?: string;
  image_url?: string | null; 
}

const PostCard = ({ username, avatar_url, timeAgo, content, currentUserRole, moonPhase, image_url }: PostCardProps) => {
  const canInteract = currentUserRole && currentUserRole !== 'initiate';
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg mb-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
                url={avatar_url} 
                alt={username || 'User Avatar'} 
                size={50} 
                fallback={username[0]?.toUpperCase() || 'M'} 
                className="border-slate-700" 
              />
            <div>
              <p className="font-medium text-slate-200">{username}</p>
              <p className="text-xs text-slate-500">
                {timeAgo} {moonPhase && `• ${moonPhase}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
          {content}
        </p>

        {/* Image Display */}
        {image_url && (
          <div 
            className="relative h-64 w-full rounded-lg bg-slate-950 overflow-hidden border border-slate-800/50 mb-4 cursor-zoom-in group"
            onClick={() => setLightboxOpen(true)}
          >
             <Image 
                src={image_url} 
                alt={`Post by ${username}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 600px"
             />
             {/* Optional: Simple overlay effect */}
             <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/10 transition-colors duration-300" />
          </div>
        )}


        {/* Footer */}
        <div className="mt-4 flex gap-6 text-sm text-slate-500 border-t border-slate-800/50 pt-4">
          {canInteract ? (
            <>
              <button className="hover:text-purple-400 cursor-pointer transition-colors flex items-center gap-2">
                <span>Manifest</span>
              </button>
              <button className="hover:text-purple-400 cursor-pointer transition-colors">
                Comment
              </button>
            </>
          ) : (
            <span className="text-xs italic text-slate-600">
              Initiates observe in silence.
            </span>
          )}
        </div>
      </div>

      {/* Lightbox - Lives outside the main card div structure */}
      <Lightbox 
         src={isLightboxOpen ? image_url || null : null}
         alt={`Image by ${username}`}
         onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

export default PostCard;