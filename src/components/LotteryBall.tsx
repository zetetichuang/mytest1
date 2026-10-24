import React from 'react';

export type BallColor = 'amber' | 'emerald' | 'blue' | 'rose' | 'purple' | 'cyan' | 'red';

interface LotteryBallProps {
  number: number | string;
  isRolling?: boolean;
  colorTheme?: BallColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  highlight?: boolean;
  index?: number;
}

const colorStyles: Record<BallColor, { bg: string; text: string; shadow: string; border: string }> = {
  amber: {
    bg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700',
    text: 'text-slate-950 font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-amber-300/40',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700',
    text: 'text-slate-950 font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-emerald-300/40',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700',
    text: 'text-slate-950 font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-blue-300/40',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700',
    text: 'text-white font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(244,63,94,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-rose-300/40',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-800',
    text: 'text-white font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(168,85,247,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-purple-300/40',
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-300 via-cyan-500 to-teal-700',
    text: 'text-slate-950 font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(6,182,212,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-cyan-300/40',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-400 via-red-500 to-red-800',
    text: 'text-white font-black',
    shadow: 'shadow-[0_10px_25px_-5px_rgba(239,68,68,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)]',
    border: 'border-red-300/40',
  },
};

const themePalette: BallColor[] = ['amber', 'emerald', 'blue', 'rose', 'purple', 'cyan', 'red'];

export const LotteryBall: React.FC<LotteryBallProps> = ({
  number,
  isRolling = false,
  colorTheme,
  size = 'md',
  highlight = false,
  index = 0,
}) => {
  // Determine color theme
  const selectedTheme = colorTheme || themePalette[index % themePalette.length];
  const style = colorStyles[selectedTheme];

  const sizeClasses = {
    sm: 'w-10 h-10 text-base border-[1.5px]',
    md: 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl border-2',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-3xl sm:text-4xl border-[2.5px]',
    xl: 'w-24 h-24 sm:w-32 sm:h-32 text-4xl sm:text-6xl border-4',
  };

  return (
    <div className="relative inline-flex flex-col items-center group select-none">
      <div
        className={`
          relative flex items-center justify-center rounded-full font-mono tabular-nums tracking-tighter
          transition-all duration-300 transform
          ${sizeClasses[size]}
          ${style.bg}
          ${style.text}
          ${style.shadow}
          ${style.border}
          ${isRolling ? 'scale-105 animate-pulse blur-[0.4px]' : 'hover:scale-110 active:scale-95'}
          ${highlight ? 'ring-4 ring-amber-400/80 ring-offset-2 ring-offset-slate-950 scale-105' : ''}
        `}
      >
        {/* Specular 3D highlight on top-left of ball */}
        <div className="absolute top-1 left-2 w-1/3 h-1/4 bg-white/45 rounded-full blur-[1px] pointer-events-none transform -rotate-12" />

        {/* Center inner subtle white badge ring for lottery ball authenticity */}
        <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-white/20 pointer-events-none" />

        {/* Number text */}
        <span className="relative z-10 drop-shadow-sm font-extrabold leading-none">
          {number}
        </span>
      </div>
    </div>
  );
};
