// src/components/widgets/WidgetFrame.tsx
import React from 'react';

interface WidgetFrameProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Allow custom styles (like gradients) if needed
}

const WidgetFrame = ({ title, children, className = "" }: WidgetFrameProps) => {
  // Base classes for every widget: rounded, dark bg, border
  const baseClasses = "p-6 rounded-xl border border-slate-800 shadow-lg mb-6";
  
  // If no specific background is passed in className, use default slate-900
  const finalClass = className.includes('bg-') 
    ? `${baseClasses} ${className}` 
    : `${baseClasses} bg-slate-900 ${className}`;

  return (
    <div className={finalClass}>
      <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4 border-b border-slate-800/50 pb-2">
        {title}
      </h3>
      <div>
        {children}
      </div>
    </div>
  );
};

export default WidgetFrame;