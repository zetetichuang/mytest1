export interface DrawSettings {
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean; // 是否允許重複
  sortMode: 'drawOrder' | 'asc' | 'desc'; // 結果排序方式
  animationDuration: number; // 動畫秒數 (0 代表即時, 1.5, 3.0 等)
  excludedNumbers: number[]; // 手動排除的號碼
}

export interface DrawRound {
  id: string;
  roundNumber: number;
  timestamp: number;
  numbers: number[];
  settingsSnapshot: {
    min: number;
    max: number;
    allowDuplicates: boolean;
  };
}

export type BallColor = 'amber' | 'emerald' | 'blue' | 'rose' | 'purple' | 'cyan';
