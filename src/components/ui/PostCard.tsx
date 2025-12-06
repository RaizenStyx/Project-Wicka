// src/components/PostCard.tsx
import React from 'react';
import Avatar from './Avatar';

// This interface defines what data this component requires to work.
interface PostCardProps {
  username: string;
  avatar_url?: string | null;
  timeAgo: string;
  content: string;
  currentUserRole?: string; // Optional: to customize based on viewer's role
  moonPhase?: string; // Optional (marked by ?)
  hasImage?: boolean; // Optional: just to simulate if a post has an image
}

// TODO: Add in functionality for likes, comments, and image rendering.

const PostCard = ({ username, avatar_url, timeAgo, content, currentUserRole, moonPhase, hasImage }: PostCardProps) => {
  // Check if user is allowed to interact
  const canInteract = currentUserRole && currentUserRole !== 'initiate';
  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg mb-6">
      
      {/* Header: Avatar, Name, Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar 
              url={avatar_url} 
              alt={username || 'User Avatar'} 
              size={50} 
              fallback = {username[0]?.toUpperCase() || 'M'} 
              className = "border-slate-700" 
            />
          <div>
            <p className="font-medium text-slate-200">{username}</p>
            <p className="text-xs text-slate-500">
              {timeAgo} {moonPhase && `• ${moonPhase}`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <p className="text-slate-300 leading-relaxed mb-4">
        {content}
      </p>

      {/* Optional Image Placeholder - only shows if hasImage is true */}
      {hasImage && (
        <div className="h-64 w-full rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-600 text-sm italic border border-slate-800/50 mb-4">
          [Image Placeholder for {username}]
        </div>
      )}

      {/* Footer: Action Buttons */}
      <div className="mt-4 flex gap-6 text-sm text-slate-500 border-t border-slate-800/50 pt-4">
        {/* Only render buttons if they are allowed */}
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
  );
};

export default PostCard;