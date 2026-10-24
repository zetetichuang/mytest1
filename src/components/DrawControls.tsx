import React from 'react';
import { DrawSettings } from '../types';
import { Settings2, Hash, Sparkles, SlidersHorizontal, ShieldAlert, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DrawControlsProps {
  settings: DrawSettings;
  onUpdateSettings: (newSettings: Partial<DrawSettings>) => void;
  availableCount: number;
  totalRangeCount: number;
  isDrawing: boolean;
  onOpenPoolModal: () => void;
}

const PRESETS = [
  { label: '1 ~ 100 抽獎常用', min: 1, max: 100, count: 1 },
  { label: '1 ~ 50 班級活動', min: 1, max: 50, count: 3 },
  { label: '大樂透 (1~49 抽 6)', min: 1, max: 49, count: 6 },
  { label: '威力彩 (1~38 抽 6)', min: 1, max: 38, count: 6 },
  { label: '1 ~ 10 快速決策', min: 1, max: 10, count: 1 },
  { label: '1 ~ 6 骰子點數', min: 1, max: 6, count: 1 },
  { label: '1 ~ 200 尾牙大型', min: 1, max: 200, count: 5 },
];

export const DrawControls: React.FC<DrawControlsProps> = ({
  settings,
  onUpdateSettings,
  availableCount,
  totalRangeCount,
  isDrawing,
  onOpenPoolModal,
}) => {
  const [excludeInput, setExcludeInput] = React.useState(
    settings.excludedNumbers.join(', ')
  );

  // Sync excludeInput when settings.excludedNumbers change externally
  React.useEffect(() => {
    setExcludeInput(settings.excludedNumbers.join(', '));
  }, [settings.excludedNumbers]);

  const handleApplyExcluded = () => {
    const parsed = excludeInput
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    // Unique numbers
    const unique = Array.from(new Set(parsed)).sort((a, b) => a - b);
    onUpdateSettings({ excludedNumbers: unique });
  };

  const handleMinChange = (val: number) => {
    const newMin = Math.min(val, settings.max);
    onUpdateSettings({ min: newMin });
  };

  const handleMaxChange = (val: number) => {
    const newMax = Math.max(val, settings.min);
    onUpdateSettings({ max: newMax });
  };

  const handleCountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(val, 100));
    onUpdateSettings({ count: clamped });
  };

  return (
    <div id="settings" className="space-y-6">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">抽籤參數設定</h2>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>號碼池總數</span>
          <span className="font-mono tabular-nums text-slate-200 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {totalRangeCount} 個號碼
          </span>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          常用場景快速套用
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const isMatch =
              settings.min === p.min &&
              settings.max === p.max &&
              settings.count === p.count;
            return (
              <button
                key={p.label}
                type="button"
                disabled={isDrawing}
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({
                    min: p.min,
                    max: p.max,
                    count: p.count,
                  });
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isMatch
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-semibold shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                } disabled:opacity-50`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range inputs: Min and Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            號碼範圍：最小值 (Min)
          </label>
          <div className="relative">
            <input
              type="number"
              disabled={isDrawing}
              value={settings.min}
              onChange={(e) => handleMinChange(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            號碼範圍：最大值 (Max)
          </label>
          <div className="relative">
            <input
              type="number"
              disabled={isDrawing}
              value={settings.max}
              onChange={(e) => handleMaxChange(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Draw Count & Quick Buttons */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-amber-400" />
            <span>一次抽取幾個號碼</span>
          </label>
          {!settings.allowDuplicates && (
            <span className="text-xs text-slate-400">
              目前最多可抽 <strong className="text-amber-400 font-mono">{availableCount}</strong> 個
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={settings.allowDuplicates ? 100 : Math.max(1, availableCount)}
            disabled={isDrawing}
            value={settings.count}
            onChange={(e) => handleCountChange(parseInt(e.target.value, 10) || 1)}
            className="w-24 bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums text-center font-bold outline-none transition-colors disabled:opacity-50"
          />

          {/* Quick count selectors */}
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 5, 6, 10].map((c) => (
              <button
                key={c}
                type="button"
                disabled={isDrawing || (!settings.allowDuplicates && c > availableCount)}
                onClick={() => {
                  soundManager.playClick();
                  handleCountChange(c);
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  settings.count === c
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {c} 個
              </button>
            ))}
          </div>
        </div>

        {!settings.allowDuplicates && settings.count > availableCount && availableCount > 0 && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            抽取數量已超過剩餘可用號碼數 ({availableCount})，請調降數量或重置號碼池。
          </p>
        )}
      </div>

      {/* Rules & Mechanisms */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>抽取機制與顯示偏好</span>
        </div>

        {/* Toggle: Allow Duplicates */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-sm font-medium text-slate-200">
              不重複抽取 (抽過不重抽)
            </div>
            <div className="text-xs text-slate-400">
              開啟後，已抽出的號碼將從號碼池移出，直到重置
            </div>
          </div>
          <button
            type="button"
            disabled={isDrawing}
            onClick={() => {
              soundManager.playClick();
              onUpdateSettings({ allowDuplicates: !settings.allowDuplicates });
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              !settings.allowDuplicates ? 'bg-amber-400' : 'bg-slate-700'
            } disabled:opacity-50`}
            role="switch"
            aria-checked={!settings.allowDuplicates}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                !settings.allowDuplicates ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Result Sorting */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            結果排序方式
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {[
              { id: 'drawOrder', label: '依抽出順序' },
              { id: 'asc', label: '由小到大 (升冪)' },
              { id: 'desc', label: '由大到小 (降冪)' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                disabled={isDrawing}
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ sortMode: mode.id as DrawSettings['sortMode'] });
                }}
                className={`py-1.5 text-xs font-medium rounded-md transition-all text-center ${
                  settings.sortMode === mode.id
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                } disabled:opacity-50`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Speed Mode */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            開獎動畫節奏
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {[
              { duration: 2.5, label: '懸疑滾動 (2.5秒)' },
              { duration: 1.2, label: '快速滾動 (1.2秒)' },
              { duration: 0, label: '即時開獎 (立即)' },
            ].map((anim) => (
              <button
                key={anim.duration}
                type="button"
                disabled={isDrawing}
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ animationDuration: anim.duration });
                }}
                className={`py-1.5 text-xs font-medium rounded-md transition-all text-center ${
                  settings.animationDuration === anim.duration
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                } disabled:opacity-50`}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Excluded Numbers Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>自訂排除號碼 (例如已被領走或避開特定號碼)</span>
          </label>
          <button
            type="button"
            onClick={onOpenPoolModal}
            className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            點此點選排除
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            disabled={isDrawing}
            placeholder="以逗號分隔，例如: 4, 13, 88"
            value={excludeInput}
            onChange={(e) => setExcludeInput(e.target.value)}
            onBlur={handleApplyExcluded}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyExcluded();
              }
            }}
            className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            disabled={isDrawing}
            onClick={() => {
              soundManager.playClick();
              handleApplyExcluded();
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors shrink-0"
          >
            <Check className="w-3.5 h-3.5 inline mr-1" />
            套用
          </button>
        </div>

        {settings.excludedNumbers.length > 0 && (
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span>已排除 {settings.excludedNumbers.length} 個號碼：</span>
            <span className="font-mono text-slate-300">
              {settings.excludedNumbers.slice(0, 10).join(', ')}
              {settings.excludedNumbers.length > 10 ? '...' : ''}
            </span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ excludedNumbers: [] })}
              className="text-rose-400 hover:text-rose-300 text-xs ml-1 underline cursor-pointer"
            >
              清除全部排除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
