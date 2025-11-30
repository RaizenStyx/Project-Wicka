// src/components/PostCard.tsx
import React from 'react';

// This interface defines what data this component requires to work.
interface PostCardProps {
  username: string;
  timeAgo: string;
  content: string;
  moonPhase?: string; // Optional (marked by ?)
  hasImage?: boolean; // Optional: just to simulate if a post has an image
}

// TODO: Add in functionality for likes, comments, and image rendering.

const PostCard = ({ username, timeAgo, content, moonPhase, hasImage }: PostCardProps) => {
  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg mb-6">
      
      {/* Header: Avatar, Name, Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Placeholder Avatar */}
          <div className="h-10 w-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-400 font-bold">
            {username[0]} {/* Grab first letter of username */}
          </div>
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
        <button className="hover:text-purple-400 cursor-pointer transition-colors flex items-center gap-2">
          <span>Manifest</span>
        </button>
        <button className="hover:text-purple-400 cursor-pointer transition-colors">
          Comment
        </button>
      </div>
    </div>
  );
};

export default PostCard;