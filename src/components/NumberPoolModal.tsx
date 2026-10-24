import React from 'react';
import { X, Search, Layers, RotateCcw, AlertTriangle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NumberPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  min: number;
  max: number;
  drawnNumbers: Set<number>;
  excludedNumbers: number[];
  onToggleExcludeNumber: (num: number) => void;
  onResetPool: () => void;
  allowDuplicates: boolean;
}

export const NumberPoolModal: React.FC<NumberPoolModalProps> = ({
  isOpen,
  onClose,
  min,
  max,
  drawnNumbers,
  excludedNumbers,
  onToggleExcludeNumber,
  onResetPool,
  allowDuplicates,
}) => {
  const [filter, setFilter] = React.useState<'all' | 'available' | 'drawn' | 'excluded'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const excludedSet = new Set(excludedNumbers);

  // Generate range items (limit display if range is gigantic like > 1000 to keep UI responsive)
  const rangeSize = max - min + 1;
  const isTooLarge = rangeSize > 1500;

  const allNumbers: number[] = [];
  if (!isTooLarge) {
    for (let i = min; i <= max; i++) {
      allNumbers.push(i);
    }
  }

  const filteredNumbers = allNumbers.filter((n) => {
    // Search filter
    if (searchTerm.trim() && !n.toString().includes(searchTerm.trim())) {
      return false;
    }
    const isExcluded = excludedSet.has(n);
    const isDrawn = !allowDuplicates && drawnNumbers.has(n);

    if (filter === 'available') {
      return !isExcluded && !isDrawn;
    }
    if (filter === 'drawn') {
      return isDrawn;
    }
    if (filter === 'excluded') {
      return isExcluded;
    }
    return true;
  });

  const availableCount = allNumbers.filter(
    (n) => !excludedSet.has(n) && (!allowDuplicates ? !drawnNumbers.has(n) : true)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">號碼池詳細檢視</h3>
              <p className="text-xs text-slate-400">
                範圍 {min} ~ {max}（共 {rangeSize} 號）· 點擊任何號碼可切換「排除 / 恢復」
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
              {[
                { id: 'all', label: `全部 (${rangeSize})` },
                { id: 'available', label: `剩餘可抽 (${availableCount})` },
                { id: 'drawn', label: `已抽出 (${allowDuplicates ? 0 : drawnNumbers.size})` },
                { id: 'excluded', label: `已排除 (${excludedNumbers.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setFilter(f.id as typeof filter);
                  }}
                  className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    filter === f.id
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="搜尋指定號碼..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 bg-slate-950 border border-slate-800 focus:border-amber-400 pl-8 pr-3 py-1.5 text-xs text-white rounded-lg outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Content Body: Grid of numbers */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px]">
          {isTooLarge ? (
            <div className="py-12 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
              <p className="text-sm font-medium text-slate-200">號碼範圍過大 ({rangeSize} 個)</p>
              <p className="text-xs text-slate-400 mt-1">
                為保持瀏覽器順暢，矩陣檢視僅支援 1500 個以內的號碼。建議透過設定面板排除號碼。
              </p>
            </div>
          ) : filteredNumbers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              沒有符合當前條件的號碼。
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {filteredNumbers.map((num) => {
                const isExcluded = excludedSet.has(num);
                const isDrawn = !allowDuplicates && drawnNumbers.has(num);

                let badgeClass =
                  'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-amber-400/60 hover:text-white';
                let statusTitle = '點擊排除此號碼';

                if (isExcluded) {
                  badgeClass =
                    'bg-rose-950/40 text-rose-400 border-rose-800/60 line-through opacity-60 hover:opacity-100';
                  statusTitle = '已排除，點擊恢復此號碼';
                } else if (isDrawn) {
                  badgeClass =
                    'bg-amber-950/30 text-amber-400/70 border-amber-900/40 opacity-50';
                  statusTitle = '已被抽出';
                }

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onToggleExcludeNumber(num);
                    }}
                    title={statusTitle}
                    className={`h-11 rounded-lg border text-xs font-mono font-bold tabular-nums flex items-center justify-center transition-all cursor-pointer ${badgeClass}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" /> 可供抽取
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-600/50 inline-block" /> 已抽出
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-600/50 inline-block" /> 已排除
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!allowDuplicates && drawnNumbers.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onResetPool();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置已抽出狀態</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
