'use client' 
import Image from 'next/image';
import { Camera } from 'lucide-react'; 

interface AvatarProps {
  url?: string | null;
  alt: string;
  size?: number;
  fallback: string;
  className?: string;
  isEditable?: boolean;  
  onEdit?: () => void;    
}

export default function Avatar({ 
  url, 
  alt, 
  size = 40, 
  fallback, 
  className = "", 
  isEditable = false,
  onEdit 
}: AvatarProps) {
  
  const content = (
    <>
      {!url ? (
       
        <div 
        style={{ width: size, height: size }}
        className="rounded-full bg-slate-900 border-6 border-slate-900 flex items-center justify-center shadow-lg overflow-hidden text-2xl">
          <span className="text-purple-500 font-serif font-bold">
            {fallback.toUpperCase().slice(0, 1)}
          </span>  
        </div>
      ) : (
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      )}

      {/* Hover Overlay for Editing */}
      {isEditable && (
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
           <Camera className="text-white/80 w-1/3 h-1/3" />
        </div>
      )}
    </>
  );

  // If editable, wrap in a button
  if (isEditable && onEdit) {
    return (
      <button 
        onClick={onEdit}
        style={{ width: size, height: size }} 
        className={`relative rounded-full overflow-hidden border border-slate-600 group cursor-pointer ${className}`}
      >
        {content}
      </button>
    )
  }

  // Otherwise just a div
  return (
    <div 
      style={{ width: size, height: size }} 
      className={`relative rounded-full overflow-hidden border border-slate-600 ${className}`}
    >
      {content}
    </div>
  );
}