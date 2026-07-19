'use client';

import { useState, useCallback, useEffect } from 'react';

export interface WheelState {
  students: string[];
  removed: string[];
  history: { winners: [string, string]; timestamp: number }[];
  historyIndex: number;
}

export function useSpinWheelState(initialStudents: string[]) {
  const [state, setState] = useState<WheelState>({
    students: initialStudents,
    removed: [],
    history: [],
    historyIndex: -1,
  });

  // Sinkronisasi ulang saat ganti kelas
  useEffect(() => {
    setState({
      students: initialStudents,
      removed: [],
      history: [],
      historyIndex: -1,
    });
  }, [initialStudents]);

  const spin = useCallback((winners: [string, string]) => {
    setState((prevState) => {
      const newHistory = prevState.history.slice(0, prevState.historyIndex + 1);
      newHistory.push({
        winners,
        timestamp: Date.now(),
      });

      return {
        ...prevState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const removeWinner = useCallback((winner: string) => {
    setState((prevState) => {
      if (!prevState.students.includes(winner)) return prevState;
      return {
        ...prevState,
        students: prevState.students.filter((s) => s !== winner),
        removed: [...prevState.removed, winner],
      };
    });
  }, []);

  const keepWinner = useCallback(() => {
    // Tidak melakukan perubahan state pada daftar murid
  }, []);

  const undo = useCallback(() => {
    setState((prevState) => {
      if (prevState.historyIndex < 0) return prevState;
      
      const prevIndex = prevState.historyIndex;
      const winnersToRestore = prevState.history[prevIndex].winners;

      return {
        ...prevState,
        students: [...prevState.students, ...winnersToRestore],
        removed: prevState.removed.filter((s) => !winnersToRestore.includes(s)),
        historyIndex: prevIndex - 1,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prevState) => {
      if (prevState.historyIndex >= prevState.history.length - 1) return prevState;
      
      const nextIndex = prevState.historyIndex + 1;
      const winnersToRemove = prevState.history[nextIndex].winners;

      return {
        ...prevState,
        students: prevState.students.filter((s) => !winnersToRemove.includes(s)),
        removed: [...prevState.removed, ...winnersToRemove],
        historyIndex: nextIndex,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      students: initialStudents,
      removed: [],
      history: [],
      historyIndex: -1,
    });
  }, [initialStudents]);

  const getCurrentStudents = useCallback(() => {
    return state.students;
  }, [state.students]);

  const canUndo = state.historyIndex > -1;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
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
  };
}