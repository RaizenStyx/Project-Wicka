'use client' 

import React, { useState } from 'react';
import Avatar from './Avatar';
import Image from 'next/image';
import Lightbox from './Lightbox';
import LikeButton from '../feed/LikeButton';
import { MessageCircle, Flag } from 'lucide-react' 
import RoleBadge from './RoleBadge';
import CommentSection from './CommentSection'
import Link from 'next/link'; 

interface PostCardProps {
  id: string; 
  currentUserId: string; 
  username: string;
  handle?: string | null;
  avatar_url?: string | null;
  subtitle?: string;
  timeAgo: string;
  content: string;
  currentUserRole?: string;
  profileUserRole?: string;
  image_url?: string | null; 
  likes: { user_id: string }[]; 
  commentsCount: number;
}

const PostCard = ({ 
  id, 
  commentsCount: initialCommentsCount,
  currentUserId,
  username,
  handle, 
  avatar_url,
  subtitle, 
  timeAgo, 
  content, 
  currentUserRole, 
  profileUserRole, 
  image_url,
  likes 
}: PostCardProps) => {

  const canInteract = currentUserRole && currentUserRole !== 'initiate';
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  // Calculate state for the LikeButton
  const likeCount = likes?.length || 0;
  const userHasLiked = likes?.some(like => like.user_id === currentUserId) || false;

  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(initialCommentsCount);

  const handleReport = () => {
    alert("Report functionality placeholder. For now, email me directly at me@calexreed.dev and I will look into it.");
  };

  return (
    <>
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg mb-6">
        
        {/* Header */}
        {/* Display post cards on feed page */}
        {handle !== '' && (
        <Link href={"u/"+handle}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
                url={avatar_url} 
                alt={username || 'User Avatar'} 
                size={50} 
                fallback={username[0]?.toUpperCase() || 'M'} 
                className="border-slate-700" 
              />
            <div className='flex justify-between items-center'>
              {/* Row 1: Username + Subtitle Side-by-Side */}
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-200">
                  {username}
                </p>
                {subtitle && (
                  <>
                  -
                  <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded">
                   {subtitle}
                  </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="">
            <RoleBadge role={profileUserRole || 'initate'} /> 
          </span>
        </div>
        </Link>
        )}

        {/* Display post cards on profile page */}
        {handle === '' && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
                url={avatar_url} 
                alt={username || 'User Avatar'} 
                size={50} 
                fallback={username[0]?.toUpperCase() || 'M'} 
                className="border-slate-700" 
              />
            <div className='flex justify-between items-center'>
              {/* Row 1: Username + Subtitle Side-by-Side */}
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-200">
                  {username}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Content */}
        <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
          {content}
        </p>
        {/* Row 2: Metadata */}
        <p className="text-xs text-slate-500 mt-0.5">
          {timeAgo}
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
             <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/10 transition-colors duration-300" />
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex gap-6 text-sm text-slate-500 border-t border-slate-800/50 pt-4">
          {canInteract ? (
            <>
              <LikeButton 
                postId={id}
                currentUserId={currentUserId}
                initialLikes={likeCount}
                initialUserHasLiked={userHasLiked}
              />

              <button 
                onClick={() => setCommentsOpen(!isCommentsOpen)}
                className={`hover:text-purple-400 cursor-pointer transition-colors flex items-center gap-2 ${isCommentsOpen ? 'text-purple-400' : ''}`}
              >
                <MessageCircle size={18} />
                <span>
                  {localCommentsCount > 0 ? localCommentsCount : ''} Comments
                </span>
              </button>
            </>
          ) : (
            <span className="text-xs italic text-slate-600">
              Initiates observe in silence.
            </span>
          )}

          {/* Report Button with Icon and Handler */}
          <button 
            onClick={handleReport}
            className="ml-auto hover:text-red-400 transition-colors cursor-pointer flex items-center gap-2"
            aria-label="Report post"
          >
            <Flag size={18} />
            <span>Report</span>
          </button>
        </div>
        {/* The Conditional Comment Section */}
           {isCommentsOpen && (
             <CommentSection postId={id} currentUserId={currentUserId} />
           )}
      </div>

      {/* Lightbox (Same as before) */}
      <Lightbox 
         src={isLightboxOpen ? image_url || null : null}
         alt={`Image by ${username}`}
         onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

export default PostCard;
