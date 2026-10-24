import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Dices, Layers, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenPoolModal: () => void;
  onResetPool: () => void;
  remainingCount: number;
  totalCount: number;
  allowDuplicates: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onOpenPoolModal,
  onResetPool,
  remainingCount,
  totalCount,
  allowDuplicates,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Dices className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            隨機號碼抽籤器
          </span>
        </div>

        {/* Zone 2: Status & Quick Info */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={onOpenPoolModal}
            className="flex items-center gap-2 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left"
            title="檢視全部與已抽出的號碼"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>號碼池檢視</span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {allowDuplicates ? `(全池 ${totalCount} 號)` : `(${remainingCount}/${totalCount} 剩餘)`}
            </span>
          </button>

          <a
            href="#settings"
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            設定參數
          </a>

          <a
            href="#history"
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            歷史紀錄
          </a>
        </nav>

        {/* Zone 3: Primary Action / Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!allowDuplicates && remainingCount < totalCount && (
            <button
              onClick={() => {
                soundManager.playClick();
                onResetPool();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="將號碼池重置為初始狀態"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>重置號碼池</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition-colors shrink-0"
            title={isMuted ? '開啟音效' : '靜音'}
            aria-label={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={onToggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 font-semibold"
            title={isFullscreen ? '退出全螢幕' : '進入大螢幕展示模式'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>結束全螢幕</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>全螢幕開獎</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
