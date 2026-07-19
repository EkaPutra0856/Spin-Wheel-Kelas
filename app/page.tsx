'use client';

import { useState, useMemo, useEffect } from 'react';
import studentData from '@/lib/student-data.json';
import { SpinWheel } from '@/components/SpinWheel';
import { WinnerModal } from '@/components/WinnerModal';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ClassSelector } from '@/components/ClassSelector';
import { useSpinWheelState } from '@/hooks/useSpinWheelState';

export default function Page() {
  const [selectedClass, setSelectedClass] = useState('4A');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState<[string, string] | null>(null);

  // Mengambil kelas yang berawalan angka 4 (4A, 4B, 4C, 4D)
  const availableClasses = useMemo(
    () => Object.keys(studentData.classes).filter(c => c.startsWith('4')).sort(),
    []
  );

  // Mengambil data murid awal berdasarkan kelas yang dipilih
  const initialStudents = useMemo(
    () => studentData.classes[selectedClass as keyof typeof studentData.classes] || [],
    [selectedClass]
  );

  const {
    state,
    spin,
    removeWinner,
    keepWinner,
    undo,
    redo,
    reset,
    getCurrentStudents,
    canUndo,
    canRedo,
  } = useSpinWheelState(initialStudents);

  // Otomatis tutup modal dan bersihkan state pemenang jika user pindah tab kelas
  useEffect(() => {
    handleCloseModal();
  }, [selectedClass]);

  const currentStudents = getCurrentStudents();

  // Dipanggil otomatis ketika roda berhenti berputar di SpinWheel.tsx
  const handleSpinComplete = (newWinners: [string, string]) => {
    setWinners(newWinners);
    setShowWinnerModal(true);
    setIsSpinning(false);
  };

  // Menangani aksi konfirmasi dari modal (menerima array murid yang fix akan dihapus)
  const handleRemoveWinner = (winnersToChange: string[]) => {
    // 1. Masukkan riwayat pasangan pemenang ini ke panel History Log
    if (winners) {
      spin(winners);
    }
    
    // 2. Hapus murid yang statusnya 'Akan Dihapus' dari daftar roda aktif
    winnersToChange.forEach((winner) => {
      removeWinner(winner);
    });
    
    // 3. Tutup modal
    handleCloseModal();
  };

  const handleKeepWinner = () => {
    keepWinner();
    handleCloseModal();
  };

  // Fungsi penutupan modal terpusat untuk mereset state agar tidak infinite loop
  const handleCloseModal = () => {
    setShowWinnerModal(false);
    setWinners(null);
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Kelas 4 - Student Spin Wheel
          </h1>
          <p className="text-muted-foreground text-lg">
            Silakan Memilih Tempat Duduk yang Kalian Inginkan dengan Menggunakan Roda Spin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1 space-y-6">
            <ClassSelector
              classes={availableClasses}
              selectedClass={selectedClass}
              onChange={handleClassChange}
            />
            <HistoryPanel
              history={state?.history || []}
              currentIndex={state?.historyIndex || 0}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onReset={reset}
            />
          </div>

          {/* Main Content (Roda Spin) */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border shadow-lg p-8 flex flex-col items-center">
              <div className="mb-4 text-sm text-muted-foreground font-semibold">
                {selectedClass}
              </div>
              <SpinWheel
                students={currentStudents || []}
                onSpin={() => setIsSpinning(true)}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
              />
            </div>
          </div>
        </div>

        {/* Panel Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {currentStudents?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Remaining
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {state?.history?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Spins
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {initialStudents?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Class Size
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {state?.removed?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Removed
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Winner Modal */}
      {showWinnerModal && winners && (
        <WinnerModal
          winners={winners}
          onRemove={handleRemoveWinner}
          onKeep={handleKeepWinner}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}