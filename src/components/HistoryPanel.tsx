import React from 'react';
import { DrawRound } from '../types';
import { History, Trash2, Download, Copy, Check, Calendar } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HistoryPanelProps {
  history: DrawRound[];
  onClearHistory: () => void;
  onDeleteRound: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onDeleteRound,
}) => {
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyRound = (round: DrawRound) => {
    soundManager.playClick();
    const text = `第 ${round.roundNumber} 輪：${round.numbers.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(round.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    if (history.length === 0) return;
    soundManager.playClick();
    const lines = history.map(
      (r) =>
        `第 ${r.roundNumber} 輪 (${new Date(r.timestamp).toLocaleTimeString()}): ${r.numbers.join(', ')}`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    soundManager.playClick();
    const headers = '輪次,抽取時間,抽出號碼,範圍(Min-Max),是否重複\n';
    const rows = history
      .map((r) => {
        const time = new Date(r.timestamp).toLocaleString();
        const nums = `"${r.numbers.join(', ')}"`;
        const range = `${r.settingsSnapshot.min}~${r.settingsSnapshot.max}`;
        const allowDup = r.settingsSnapshot.allowDuplicates ? '可重複' : '不重複';
        return `${r.roundNumber},${time},${nums},${range},${allowDup}`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `抽籤紀錄_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="history" className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">歷次抽籤紀錄</h2>
          <span className="text-xs text-slate-400 font-mono">
            ({history.length} 輪)
          </span>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="複製全部紀錄至剪貼簿"
            >
              {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAll ? '已複製全部' : '複製全部'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="匯出 CSV 試算表"
            >
              <Download className="w-3 h-3" />
              <span>匯出 CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('確定要清除所有抽籤歷史紀錄嗎？')) {
                  soundManager.playClick();
                  onClearHistory();
                }
              }}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="清除所有紀錄"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          尚無抽籤紀錄。完成一次抽籤後，紀錄將即時保留於此。
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {history.map((round) => (
            <div
              key={round.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                  #{round.roundNumber}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {round.numbers.map((n, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold tabular-nums"
                      >
                        {n}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(round.timestamp).toLocaleTimeString()}
                    </span>
                    <span>·</span>
                    <span>範圍: {round.settingsSnapshot.min}~{round.settingsSnapshot.max}</span>
                    <span>·</span>
                    <span>共 {round.numbers.length} 個號碼</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleCopyRound(round)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                  title="複製此輪結果"
                >
                  {copiedId === round.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteRound(round.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                  title="刪除此筆紀錄"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
