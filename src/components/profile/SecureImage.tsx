'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Loader2 } from 'lucide-react'

interface SecureImageProps {
  path: string
  alt: string
  className?: string
}

export default function SecureImage({ path, alt, className }: SecureImageProps) {
  const [src, setSrc] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUrl() {
        if (!path) return
        
        // If it's already a blob (local preview), use it
        if (path.startsWith('blob:')) {
            setSrc(path)
            return
        }

        const { data } = await supabase.storage
            .from('user_uploads')
            .createSignedUrl(path, 3600) // 1 hour link

        if (data?.signedUrl) {
            setSrc(data.signedUrl)
        }
    }
    fetchUrl()
  }, [path])

  if (!src) {
    return (
        <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
            <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
        </div>
    )
  }

  return <img src={src} alt={alt} className={className} />
}