'use client'

import { useOptimistic, startTransition } from 'react'
import { toggleLike } from '@/app/actions/social-actions' // Make sure this path matches where you put the server action
import clsx from 'clsx'
import { Heart } from 'lucide-react' // Or your preferred icon library

interface LikeButtonProps {
  postId: string
  initialLikes: number
  initialUserHasLiked: boolean
  currentUserId: string
}

export default function LikeButton({ 
  postId, 
  initialLikes, 
  initialUserHasLiked,
  currentUserId
}: LikeButtonProps) {

  // 1. Optimistic State (Immediate UI feedback)
  const [optimisticState, addOptimisticLike] = useOptimistic(
    { likeCount: initialLikes, isLiked: initialUserHasLiked },
    (currentState, newIsLiked: boolean) => ({
      likeCount: newIsLiked ? currentState.likeCount + 1 : currentState.likeCount - 1,
      isLiked: newIsLiked,
    })
  )

  // 2. Handle Interaction
  const handleToggle = async () => {
    const newState = !optimisticState.isLiked
    
    // Update UI instantly
    startTransition(() => {
      addOptimisticLike(newState)
    })

    // Server Action
    try {
      await toggleLike(postId)
    } catch (err) {
      console.error("Failed to manifest", err)
      // Ideally, trigger a toast notification here
    }
  }

  return (
    <button 
      onClick={handleToggle}
      className="hover:text-purple-400 cursor-pointer transition-colors flex items-center gap-2 group"
    >
      <Heart 
        size={18}
        className={clsx(
          "transition-all duration-300",
          optimisticState.isLiked 
            ? "fill-purple-500 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
            : "text-slate-500 group-hover:text-purple-400"
        )}
      />
      <span className={clsx(
        "tabular-nums", 
        optimisticState.isLiked && "text-purple-400"
      )}>
        {optimisticState.likeCount > 0 ?  optimisticState.likeCount + " Manifested"  : "Manifest"}
      </span>
    </button>
  )
}