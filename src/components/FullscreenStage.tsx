import React from 'react';
import { LotteryBall } from './LotteryBall';
import { Minimize2, Dices, Volume2, VolumeX, Sparkles, Copy, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FullscreenStageProps {
  currentNumbers: number[];
  isDrawing: boolean;
  rollingNumbers: (number | string)[];
  revealedIndices: boolean[];
  onStartDraw: () => void;
  onExitFullscreen: () => void;
  availableCount: number;
  totalCount: number;
  allowDuplicates: boolean;
  drawCount: number;
  currentRound: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const FullscreenStage: React.FC<FullscreenStageProps> = ({
  currentNumbers,
  isDrawing,
  rollingNumbers,
  revealedIndices,
  onStartDraw,
  onExitFullscreen,
  availableCount,
  totalCount,
  allowDuplicates,
  drawCount,
  currentRound,
  isMuted,
  onToggleMute,
}) => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFullscreen();
      } else if (e.code === 'Space' && !isDrawing) {
        e.preventDefault();
        onStartDraw();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, onStartDraw, onExitFullscreen]);

  const handleCopy = () => {
    if (currentNumbers.length === 0) return;
    const text = `【隨機抽籤結果 第 ${currentRound} 輪】抽出號碼：${currentNumbers.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const isPoolEmpty = !allowDuplicates && availableCount < drawCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none">
      {/* Background ambient decorative spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top HUD */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Dices className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              幸運隨機抽獎
            </h1>
            <p className="text-xs text-slate-400">
              {currentRound > 0 ? `第 ${currentRound} 輪 · ` : ''}
              一次抽取 {drawCount} 個號碼
              {!allowDuplicates ? ` · 剩餘 ${availableCount}/${totalCount} 號` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMute}
            className="p-3 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-slate-500" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={onExitFullscreen}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            title="按 ESC 亦可退出"
          >
            <Minimize2 className="w-4 h-4" />
            <span>退出全螢幕 (ESC)</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Huge Balls */}
      <div className="my-auto py-12 flex flex-col items-center justify-center z-10">
        {isDrawing ? (
          <div className="text-center w-full">
            <div className="inline-flex items-center gap-2 text-lg font-bold text-amber-400 animate-pulse mb-8">
              <Sparkles className="w-5 h-5" />
              <span>開獎滾動中，緊張揭曉...</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 max-w-6xl mx-auto px-4">
              {rollingNumbers.map((num, idx) => (
                <LotteryBall
                  key={idx}
                  number={num}
                  isRolling={!revealedIndices[idx]}
                  index={idx}
                  size={drawCount <= 2 ? 'xl' : drawCount <= 6 ? 'lg' : 'md'}
                />
              ))}
            </div>
          </div>
        ) : currentNumbers.length > 0 ? (
          <div className="text-center w-full">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                WINNING NUMBERS
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
                第 {currentRound} 輪 得獎號碼
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 max-w-6xl mx-auto px-4">
              {currentNumbers.map((num, idx) => (
                <LotteryBall
                  key={`${currentRound}-${num}-${idx}`}
                  number={num}
                  isRolling={false}
                  index={idx}
                  size={drawCount <= 2 ? 'xl' : drawCount <= 6 ? 'lg' : 'md'}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '已複製！' : '複製號碼'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-amber-400 mb-6 shadow-xl">
              <Dices className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              全螢幕開獎準備就緒
            </h2>
            <p className="text-sm text-slate-400">
              按下下方開獎按鈕或鍵盤 <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs">空白鍵 Space</kbd> 開始抽籤
            </p>
          </div>
        )}
      </div>

      {/* Bottom Center Draw Button */}
      <div className="flex flex-col items-center justify-center z-10 gap-3">
        <button
          type="button"
          disabled={isDrawing || isPoolEmpty}
          onClick={onStartDraw}
          className={`
            px-12 py-4 rounded-2xl font-black text-lg tracking-wider
            flex items-center gap-3 shadow-2xl transition-all duration-200 cursor-pointer
            ${
              isDrawing
                ? 'bg-amber-500/70 text-slate-950 cursor-wait'
                : isPoolEmpty
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/40 hover:scale-105 active:scale-95'
            }
          `}
        >
          <Dices className={`w-6 h-6 ${isDrawing ? 'animate-spin' : ''}`} />
          <span>
            {isDrawing ? '緊張開獎中...' : currentNumbers.length > 0 ? '再抽下一輪 (空白鍵)' : '開始開獎 (空白鍵)'}
          </span>
        </button>

        <p className="text-[11px] text-slate-500">
          提示：隨時按下 ESC 即可退回一般模式調整參數
        </p>
      </div>
    </div>
  );
};
