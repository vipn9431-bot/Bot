import React from 'react';

interface M7RLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  pulse?: boolean;
  className?: string;
}

export const M7RLogo: React.FC<M7RLogoProps> = ({
  size = 'md',
  showBadge = true,
  pulse = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }[size];

  const textSize = {
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-xl',
    xl: 'text-3xl'
  }[size];

  const subTextSize = {
    sm: 'text-[6px]',
    md: 'text-[7px]',
    lg: 'text-[10px]',
    xl: 'text-[12px]'
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}>
      {/* Outer ambient glow */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 opacity-60 blur-md transition-all group-hover:opacity-90 ${pulse ? 'animate-pulse' : ''}`} />

      {/* Futuristic Emblem Container */}
      <div className={`relative ${sizeClasses} rounded-2xl p-[2px] bg-gradient-to-br from-rose-500 via-amber-400 to-indigo-600 shadow-xl shadow-rose-950/60`}>
        <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden border border-white/10">
          
          {/* Cyber grid and diagonal highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/15 via-transparent to-cyan-500/15 pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-rose-500/20 rounded-full blur-sm pointer-events-none" />
          
          {/* Corner tech accents */}
          <span className="absolute top-1 left-1 w-1 h-1 bg-amber-400 rounded-full opacity-80" />
          <span className="absolute bottom-1 right-1 w-1 h-1 bg-cyan-400 rounded-full opacity-80" />

          {/* Core Monogram */}
          <div className="flex flex-col items-center justify-center z-10 leading-none select-none">
            <span className={`font-mono font-black ${textSize} tracking-tight bg-gradient-to-r from-rose-400 via-amber-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]`}>
              M7R
            </span>
            {(size === 'lg' || size === 'xl') && (
              <span className={`font-mono font-black uppercase tracking-[0.2em] text-emerald-400 ${subTextSize} mt-0.5`}>
                ULTRA PRO
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Online / Verified Badge */}
      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 border-2 border-[#0a0d14] flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/50 ${
            size === 'sm' || size === 'md' ? 'w-3 h-3 text-[7px]' : 'w-5 h-5 text-[10px]'
          }`}
          title="24/7 Verified Online"
        >
          ✓
        </span>
      )}
    </div>
  );
};
