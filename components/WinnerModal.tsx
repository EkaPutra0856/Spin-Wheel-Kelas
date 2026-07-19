'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WinnerModalProps {
  winners: [string, string] | null;
  onRemove: (winners: [string, string]) => void;
  onKeep: () => void;
  onClose: () => void;
}

export function WinnerModal({
  winners,
  onRemove,
  onKeep,
  onClose,
}: WinnerModalProps) {
  const [removed, setRemoved] = useState<string[]>([]);

  // Reset state internal modal saat modal ditutup
  useEffect(() => {
    if (!winners) {
      setRemoved([]);
    }
  }, [winners]);

  if (!winners) {
    return null;
  }

  const handleToggleRemove = (winner: string) => {
    setRemoved((prev) =>
      prev.includes(winner) ? prev.filter((w) => w !== winner) : [...prev, winner]
    );
  };

  const handleConfirm = () => {
    // Jalankan onRemove hanya untuk nama yang masuk daftar removed
    onRemove(winners); 
    onClose(); // Pastikan trigger close dipanggil
  };

  const handleKeep = () => {
    onKeep(); // Panggil fungsi keep dari parent
    onClose(); // Pastikan trigger close dipanggil
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={onClose} // Klik di luar modal akan menutup
    >
      <div 
        className="bg-background rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95" 
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat area dalam diklik
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-foreground">Hasil Spin! 🎉</h2>
          <button
            onClick={onClose} // Klik tombol X akan menutup
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {winners.map((winner, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{winner}</span>
                  <button
                    onClick={() => handleToggleRemove(winner)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      removed.includes(winner)
                        ? 'bg-destructive/20 text-destructive border border-destructive/30 font-medium'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {removed.includes(winner) ? 'Akan Dihapus' : 'Hapus dari Roda'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleKeep} // Tombol Simpan Keduanya
              className="flex-1 px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
            >
              Simpan Keduanya
            </button>
            <button
              onClick={handleConfirm} // Tombol Konfirmasi
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}