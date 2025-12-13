'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import Avatar from './Avatar'
import { Send, Loader2, Trash2 } from 'lucide-react'
import { addComment } from '@/app/actions/social-actions'
import { formatDistanceToNow } from 'date-fns' 

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  postId: string
  currentUserId: string
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Fetch comments on mount (Lazy Load)
  useEffect(() => {
    const fetchComments = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      
      if (!error && data) {
        setComments(data as any) // Type casting for simplicity in this snippet
      }
      setLoading(false)
    }

    fetchComments()
  }, [postId])

  // 2. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    
    try {
      // Call Server Action
      const newCommentData = await addComment(postId, newComment)
      
      // Update Local State immediately
      setComments((prev) => [...prev, newCommentData])
      setNewComment('') // Clear input
    } catch (error) {
      console.error("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4 text-slate-500">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-600 italic text-center py-2">
            No whispers yet. Be the first to speak.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar 
                url={comment.profiles.avatar_url} 
                alt={comment.profiles.username} 
                fallback = {comment.profiles.username?.[0]?.toUpperCase() || 'M'}
                size={32}
                className="mt-1 border-slate-700"
              />
              <div className="flex-1">
                <div className="bg-slate-800/50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-slate-200">{comment.profiles.username}</span>
                    <span className="text-xs text-slate-500">
                       {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-300">{comment.content}</p>
                </div>
                {/* Optional: Delete button if it's my comment */}
                {comment.user_id === currentUserId && (
                  <button className="text-xs text-slate-600 hover:text-red-400 mt-1 ml-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <div className="flex-1 relative">
          <textarea
            name="content"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-slate-600"
            maxLength={300}
            disabled={isSubmitting}
          />
        </div>
        <button 
          type="submit" 
          disabled={!newComment.trim() || isSubmitting}
          className="p-2 rounded-full bg-slate-800 text-purple-400 hover:bg-slate-700 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />}
        </button>
      </form>
    </div>
  )
}