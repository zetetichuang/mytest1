import React from 'react';
import { LotteryBall } from './LotteryBall';
import { Dices, Copy, Check, Volume2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LotteryDisplayProps {
  currentNumbers: number[];
  isDrawing: boolean;
  rollingNumbers: (number | string)[];
  revealedIndices: boolean[];
  onStartDraw: () => void;
  availableCount: number;
  totalCount: number;
  allowDuplicates: boolean;
  drawCount: number;
  currentRound: number;
  onResetPool: () => void;
}

export const LotteryDisplay: React.FC<LotteryDisplayProps> = ({
  currentNumbers,
  isDrawing,
  rollingNumbers,
  revealedIndices,
  onStartDraw,
  availableCount,
  totalCount,
  allowDuplicates,
  drawCount,
  currentRound,
  onResetPool,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  // Copy results
  const handleCopy = () => {
    if (currentNumbers.length === 0) return;
    const text = `【隨機抽籤結果 第 ${currentRound} 輪】\n抽出號碼：${currentNumbers.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  // Text to speech for reading drawn numbers aloud
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (currentNumbers.length === 0) return;

    window.speechSynthesis.cancel();
    const text = `恭喜抽出號碼：${currentNumbers.join('號、')}號！`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const isPoolEmpty = !allowDuplicates && availableCount < drawCount;
  const progressPercent = totalCount > 0 ? Math.round(((totalCount - availableCount) / totalCount) * 100) : 0;

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[460px] overflow-hidden">
      {/* Background glow and subtle stage light */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top stage info */}
      <div className="w-full flex items-center justify-between z-10 text-xs">
        <div className="flex items-center gap-2">
          {currentRound > 0 ? (
            <span className="font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              第 {currentRound} 輪開獎
            </span>
          ) : (
            <span className="text-slate-400">尚未開始抽取</span>
          )}
          <span className="text-slate-400">· 一次抽取 {drawCount} 個號碼</span>
        </div>

        {/* Pool status progress */}
        {!allowDuplicates ? (
          <div className="flex items-center gap-2 text-slate-400">
            <span>
              已開出 <strong className="text-slate-200 tabular-nums">{totalCount - availableCount}</strong> / {totalCount} 號
            </span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-slate-400">可重複模式 (全池常駐)</span>
        )}
      </div>

      {/* Center Stage: Drawn Balls or Idle State */}
      <div className="my-auto py-8 w-full flex flex-col items-center justify-center z-10">
        {isDrawing ? (
          /* Rolling State */
          <div className="w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>開獎滾動中，緊張開獎...</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 max-w-4xl mx-auto px-2">
              {rollingNumbers.map((num, idx) => (
                <LotteryBall
                  key={idx}
                  number={num}
                  isRolling={!revealedIndices[idx]}
                  index={idx}
                  size={drawCount <= 4 ? 'xl' : drawCount <= 8 ? 'lg' : 'md'}
                />
              ))}
            </div>
          </div>
        ) : currentNumbers.length > 0 ? (
          /* Revealed Results */
          <div className="w-full">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-slate-400">
                LUCKY NUMBERS
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                幸運得獎號碼
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 max-w-4xl mx-auto px-2">
              {currentNumbers.map((num, idx) => (
                <LotteryBall
                  key={`${currentRound}-${num}-${idx}`}
                  number={num}
                  isRolling={false}
                  index={idx}
                  size={drawCount <= 4 ? 'xl' : drawCount <= 8 ? 'lg' : 'md'}
                />
              ))}
            </div>

            {/* Quick Action Tools: Copy & TTS */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">已複製號碼！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>複製號碼</span>
                  </>
                )}
              </button>

              {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer shadow-sm ${
                    isSpeaking
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border-slate-700/80'
                  }`}
                  title="語音播報開獎號碼"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSpeaking ? '播報中...' : '語音朗讀'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Initial Idle State */
          <div className="text-center py-6 px-4 max-w-md">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-amber-400 shadow-inner mb-4">
              <Dices className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              準備好開始抽號碼了嗎？
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              自訂上方號碼範圍、抽出數量後，按下下方開獎按鈕即可體驗隨機抽籤與緊張刺激的滾動動畫！
            </p>
          </div>
        )}
      </div>

      {/* Stage Bottom Controls */}
      <div className="w-full pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="text-xs text-slate-400">
          {!allowDuplicates && isPoolEmpty ? (
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              可用號碼已抽完或不足 {drawCount} 個，請重置號碼池。
            </span>
          ) : (
            <span>
              {!allowDuplicates
                ? `池內剩餘 ${availableCount} 個號碼可供抽取`
                : '可重複模式：每次抽取皆從完整範圍獨立抽選'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!allowDuplicates && remainingCountBelowThreshold(availableCount, drawCount) && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onResetPool();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置號碼池</span>
            </button>
          )}

          <button
            type="button"
            disabled={isDrawing || isPoolEmpty}
            onClick={() => {
              onStartDraw();
            }}
            className={`
              w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide
              flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer
              ${
                isDrawing
                  ? 'bg-amber-500/70 text-slate-950 cursor-wait'
                  : isPoolEmpty
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0'
              }
            `}
          >
            <Dices className={`w-5 h-5 ${isDrawing ? 'animate-spin' : ''}`} />
            <span>
              {isDrawing ? '開獎中...' : currentNumbers.length > 0 ? '再抽一次' : '開始抽號碼'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

function remainingCountBelowThreshold(available: number, required: number): boolean {
  return available < required;
}
