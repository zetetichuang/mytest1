/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DrawSettings, DrawRound } from './types';
import { Header } from './components/Header';
import { DrawControls } from './components/DrawControls';
import { LotteryDisplay } from './components/LotteryDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { NumberPoolModal } from './components/NumberPoolModal';
import { FullscreenStage } from './components/FullscreenStage';
import { soundManager } from './utils/audio';
import { fireConfetti } from './utils/confetti';

const STORAGE_KEY_SETTINGS = 'lottery_app_settings_v1';
const STORAGE_KEY_HISTORY = 'lottery_app_history_v1';
const STORAGE_KEY_DRAWN = 'lottery_app_drawn_v1';
const STORAGE_KEY_MUTED = 'lottery_app_muted_v1';

const DEFAULT_SETTINGS: DrawSettings = {
  min: 1,
  max: 100,
  count: 1,
  allowDuplicates: false,
  sortMode: 'drawOrder',
  animationDuration: 2.5,
  excludedNumbers: [],
};

export default function App() {
  // Load initial settings
  const [settings, setSettings] = useState<DrawSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // History rounds
  const [history, setHistory] = useState<DrawRound[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Set of already drawn numbers (for no-duplicate mode)
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAWN);
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set<number>();
  });

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
    } catch {
      return false;
    }
  });

  // Display states
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rollingNumbers, setRollingNumbers] = useState<(number | string)[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<boolean[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);

  // Sync mute with soundManager
  useEffect(() => {
    soundManager.setMuted(isMuted);
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, String(isMuted));
    } catch {}
  }, [isMuted]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Persist drawn numbers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAWN, JSON.stringify(Array.from(drawnNumbers)));
    } catch {}
  }, [drawnNumbers]);

  // Calculate available numbers in current pool
  const totalRangeCount = Math.max(0, settings.max - settings.min + 1);
  const excludedSet = new Set(settings.excludedNumbers);

  const getAvailablePool = useCallback((): number[] => {
    const pool: number[] = [];
    for (let i = settings.min; i <= settings.max; i++) {
      if (!excludedSet.has(i)) {
        if (settings.allowDuplicates || !drawnNumbers.has(i)) {
          pool.push(i);
        }
      }
    }
    return pool;
  }, [settings.min, settings.max, settings.allowDuplicates, excludedSet, drawnNumbers]);

  const availablePool = getAvailablePool();
  const availableCount = availablePool.length;

  // Handle resetting the drawn numbers pool
  const handleResetPool = () => {
    setDrawnNumbers(new Set());
    setCurrentNumbers([]);
    setRollingNumbers([]);
  };

  // Update settings safely
  const handleUpdateSettings = (newSettings: Partial<DrawSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Auto adjust if min > max
      if (updated.min > updated.max) {
        if ('min' in newSettings) updated.max = updated.min;
        else updated.min = updated.max;
      }
      return updated;
    });
  };

  // Exclude toggle from Pool modal
  const handleToggleExcludeNumber = (num: number) => {
    setSettings((prev) => {
      const exists = prev.excludedNumbers.includes(num);
      const updated = exists
        ? prev.excludedNumbers.filter((n) => n !== num)
        : [...prev.excludedNumbers, num].sort((a, b) => a - b);
      return { ...prev, excludedNumbers: updated };
    });
  };

  // Delete single history round
  const handleDeleteRound = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Sound toggle
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Animation timer ref
  const animIntervalRef = useRef<number | null>(null);
  const animTimeoutsRef = useRef<number[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      animTimeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Main Draw Execution
  const handleStartDraw = useCallback(() => {
    if (isDrawing) return;

    const pool = getAvailablePool();
    if (!settings.allowDuplicates && pool.length < settings.count) {
      alert(`剩餘可用號碼不足！目前僅剩 ${pool.length} 個號碼，請先重置號碼池或調降抽取數量。`);
      return;
    }

    // Pick random numbers
    const selected: number[] = [];
    if (settings.allowDuplicates) {
      // Pick with replacement from all valid numbers in range
      const validPool: number[] = [];
      for (let i = settings.min; i <= settings.max; i++) {
        if (!excludedSet.has(i)) validPool.push(i);
      }
      if (validPool.length === 0) {
        alert('當前範圍內的所有號碼皆已被排除，請先解除排除特定號碼。');
        return;
      }
      for (let i = 0; i < settings.count; i++) {
        const randIdx = Math.floor(Math.random() * validPool.length);
        selected.push(validPool[randIdx]);
      }
    } else {
      // Pick without replacement
      const tempPool = [...pool];
      for (let i = 0; i < settings.count; i++) {
        const randIdx = Math.floor(Math.random() * tempPool.length);
        selected.push(tempPool[randIdx]);
        tempPool.splice(randIdx, 1);
      }
    }

    // Sort according to settings
    let finalNumbers = [...selected];
    if (settings.sortMode === 'asc') {
      finalNumbers.sort((a, b) => a - b);
    } else if (settings.sortMode === 'desc') {
      finalNumbers.sort((a, b) => b - a);
    }

    const nextRoundNumber = history.length + 1;

    // Instant Mode
    if (settings.animationDuration <= 0) {
      soundManager.playReveal(0);
      soundManager.playFanfare();
      fireConfetti(2200);

      setCurrentNumbers(finalNumbers);
      setRollingNumbers(finalNumbers);
      setRevealedIndices(new Array(finalNumbers.length).fill(true));

      if (!settings.allowDuplicates) {
        setDrawnNumbers((prev) => {
          const next = new Set(prev);
          finalNumbers.forEach((n) => next.add(n));
          return next;
        });
      }

      setHistory((prev) => [
        {
          id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          roundNumber: nextRoundNumber,
          timestamp: Date.now(),
          numbers: finalNumbers,
          settingsSnapshot: {
            min: settings.min,
            max: settings.max,
            allowDuplicates: settings.allowDuplicates,
          },
        },
        ...prev,
      ]);
      return;
    }

    // Suspense Rolling Animation Mode
    setIsDrawing(true);
    setRevealedIndices(new Array(settings.count).fill(false));

    // Rapid random digit rolling
    const totalDuration = settings.animationDuration * 1000;
    const intervalMs = 60;
    let tickCount = 0;

    animIntervalRef.current = window.setInterval(() => {
      setRollingNumbers((prev) => {
        return finalNumbers.map((finalVal, idx) => {
          if (revealedIndices[idx]) {
            return finalVal;
          }
          // Random rolling number
          const rand = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
          return rand;
        });
      });

      tickCount++;
      if (tickCount % 2 === 0) {
        soundManager.playTick(1 + Math.random() * 0.2);
      }
    }, intervalMs);

    // Staggered reveal of each ball
    const count = settings.count;
    const baseWait = Math.max(600, totalDuration - count * 220);

    finalNumbers.forEach((val, idx) => {
      const revealDelay = baseWait + idx * 220;
      const t = window.setTimeout(() => {
        setRevealedIndices((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
        setRollingNumbers((prev) => {
          const next = [...prev];
          next[idx] = val;
          return next;
        });
        soundManager.playReveal(idx);

        // If this is the last ball
        if (idx === count - 1) {
          if (animIntervalRef.current) {
            clearInterval(animIntervalRef.current);
            animIntervalRef.current = null;
          }
          setIsDrawing(false);
          setCurrentNumbers(finalNumbers);
          soundManager.playFanfare();
          fireConfetti(2800);

          if (!settings.allowDuplicates) {
            setDrawnNumbers((prevDrawn) => {
              const next = new Set(prevDrawn);
              finalNumbers.forEach((n) => next.add(n));
              return next;
            });
          }

          setHistory((prev) => [
            {
              id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              roundNumber: nextRoundNumber,
              timestamp: Date.now(),
              numbers: finalNumbers,
              settingsSnapshot: {
                min: settings.min,
                max: settings.max,
                allowDuplicates: settings.allowDuplicates,
              },
            },
            ...prev,
          ]);
        }
      }, revealDelay);

      animTimeoutsRef.current.push(t);
    });
  }, [
    isDrawing,
    getAvailablePool,
    settings,
    excludedSet,
    history.length,
    revealedIndices,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bar Navigation */}
      <Header
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onOpenPoolModal={() => setIsPoolModalOpen(true)}
        onResetPool={handleResetPool}
        remainingCount={availableCount}
        totalCount={totalRangeCount}
        allowDuplicates={settings.allowDuplicates}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Center Stage & History (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-8">
            <LotteryDisplay
              currentNumbers={currentNumbers}
              isDrawing={isDrawing}
              rollingNumbers={rollingNumbers}
              revealedIndices={revealedIndices}
              onStartDraw={handleStartDraw}
              availableCount={availableCount}
              totalCount={totalRangeCount}
              allowDuplicates={settings.allowDuplicates}
              drawCount={settings.count}
              currentRound={history.length > 0 ? history[0].roundNumber : 0}
              onResetPool={handleResetPool}
            />

            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onDeleteRound={handleDeleteRound}
            />
          </div>

          {/* Right Column: Settings and Controls (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl sticky top-20">
              <DrawControls
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                availableCount={availableCount}
                totalRangeCount={totalRangeCount}
                isDrawing={isDrawing}
                onOpenPoolModal={() => setIsPoolModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 隨機號碼抽籤器 · 公平隨機演算 · 支援大螢幕投影展示</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>支援鍵盤空白鍵快速開獎</span>
            <span>·</span>
            <button
              onClick={() => setIsPoolModalOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              檢視完整號碼池
            </button>
          </div>
        </div>
      </footer>

      {/* Fullscreen Presentation View */}
      {isFullscreen && (
        <FullscreenStage
          currentNumbers={currentNumbers}
          isDrawing={isDrawing}
          rollingNumbers={rollingNumbers}
          revealedIndices={revealedIndices}
          onStartDraw={handleStartDraw}
          onExitFullscreen={() => setIsFullscreen(false)}
          availableCount={availableCount}
          totalCount={totalRangeCount}
          allowDuplicates={settings.allowDuplicates}
          drawCount={settings.count}
          currentRound={history.length > 0 ? history[0].roundNumber : 0}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Number Pool Matrix Modal */}
      <NumberPoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        min={settings.min}
        max={settings.max}
        drawnNumbers={drawnNumbers}
        excludedNumbers={settings.excludedNumbers}
        onToggleExcludeNumber={handleToggleExcludeNumber}
        onResetPool={handleResetPool}
        allowDuplicates={settings.allowDuplicates}
      />
    </div>
  );
}
