'use client';

import { Undo2, Redo2, RotateCcw } from 'lucide-react';

interface HistoryEntry {
  winners: [string, string];
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export function HistoryPanel({
  history,
  currentIndex,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
}: HistoryPanelProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="w-full bg-card rounded-lg border p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Selection History</h3>
          <button
            onClick={onReset}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="Reset all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No spins yet
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm transition-colors ${
                  idx === currentIndex
                    ? 'bg-primary/20 border border-primary text-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="font-medium">{idx + 1}. {entry.winners[0]}</div>
                <div className="font-medium">&amp; {entry.winners[1]}</div>
                <div className="text-xs opacity-70 mt-1">{formatTime(entry.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
