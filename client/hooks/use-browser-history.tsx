import * as React from "react";
import { useState, useCallback } from "react";

interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
  favicon?: string;
}

interface BrowserHistory {
  entries: HistoryEntry[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

interface BrowserHistoryHook extends BrowserHistory {
  addEntry: (url: string, title: string) => void;
  goBack: () => HistoryEntry | null;
  goForward: () => HistoryEntry | null;
  clearHistory: () => void;
  removeEntry: (id: string) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  getRecentEntries: (limit?: number) => HistoryEntry[];
}

export const useBrowserHistory = (): BrowserHistoryHook => {
  const [history, setHistory] = useState<BrowserHistory>({
    entries: [],
    currentIndex: -1,
    canGoBack: false,
    canGoForward: false,
    canUndo: false,
    canRedo: false,
  });

  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);

  const updateNavigationStates = useCallback(
    (newHistory: BrowserHistory) => {
      newHistory.canGoBack = newHistory.currentIndex > 0;
      newHistory.canGoForward =
        newHistory.currentIndex < newHistory.entries.length - 1;
      newHistory.canUndo = undoStack.length > 0;
      newHistory.canRedo = redoStack.length > 0;
      return newHistory;
    },
    [undoStack.length, redoStack.length],
  );

  const addEntry = useCallback(
    (url: string, title: string) => {
      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        url,
        title,
        timestamp: new Date(),
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=16`,
      };

      setHistory((prev) => {
        // Add current entry to undo stack if it exists
        if (prev.currentIndex >= 0 && prev.entries[prev.currentIndex]) {
          setUndoStack((prevUndo) => [
            ...prevUndo,
            prev.entries[prev.currentIndex],
          ]);
        }

        // If we're not at the end of history, remove forward entries
        const newEntries = prev.entries.slice(0, prev.currentIndex + 1);
        newEntries.push(newEntry);

        const newHistory = {
          ...prev,
          entries: newEntries,
          currentIndex: newEntries.length - 1,
        };

        return updateNavigationStates(newHistory);
      });

      // Clear redo stack when adding new entry
      setRedoStack([]);
    },
    [updateNavigationStates],
  );

  const goBack = useCallback(() => {
    let result: HistoryEntry | null = null;

    setHistory((prev) => {
      if (prev.canGoBack) {
        const currentEntry = prev.entries[prev.currentIndex];
        const newIndex = prev.currentIndex - 1;
        result = prev.entries[newIndex];

        // Add current entry to undo stack
        if (currentEntry) {
          setUndoStack((prevUndo) => [...prevUndo, currentEntry]);
        }

        const newHistory = {
          ...prev,
          currentIndex: newIndex,
        };

        return updateNavigationStates(newHistory);
      }
      return prev;
    });

    return result;
  }, [updateNavigationStates]);

  const goForward = useCallback(() => {
    let result: HistoryEntry | null = null;

    setHistory((prev) => {
      if (prev.canGoForward) {
        const currentEntry = prev.entries[prev.currentIndex];
        const newIndex = prev.currentIndex + 1;
        result = prev.entries[newIndex];

        // Add current entry to undo stack
        if (currentEntry) {
          setUndoStack((prevUndo) => [...prevUndo, currentEntry]);
        }

        const newHistory = {
          ...prev,
          currentIndex: newIndex,
        };

        return updateNavigationStates(newHistory);
      }
      return prev;
    });

    return result;
  }, [updateNavigationStates]);

  const undo = useCallback(() => {
    let result: HistoryEntry | null = null;

    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      result = lastAction;

      setHistory((prev) => {
        // Add current entry to redo stack
        if (prev.currentIndex >= 0) {
          setRedoStack((prevRedo) => [
            ...prevRedo,
            prev.entries[prev.currentIndex],
          ]);
        }

        // Find the entry in history and set as current
        const entryIndex = prev.entries.findIndex(
          (entry) => entry.id === lastAction.id,
        );
        const newHistory = {
          ...prev,
          currentIndex: entryIndex >= 0 ? entryIndex : prev.currentIndex,
        };

        return updateNavigationStates(newHistory);
      });

      setUndoStack((prev) => prev.slice(0, -1));
    }

    return result;
  }, [undoStack, updateNavigationStates]);

  const redo = useCallback(() => {
    let result: HistoryEntry | null = null;

    if (redoStack.length > 0) {
      const nextAction = redoStack[redoStack.length - 1];
      result = nextAction;

      setHistory((prev) => {
        // Add current entry to undo stack
        if (prev.currentIndex >= 0) {
          setUndoStack((prevUndo) => [
            ...prevUndo,
            prev.entries[prev.currentIndex],
          ]);
        }

        // Find the entry in history and set as current
        const entryIndex = prev.entries.findIndex(
          (entry) => entry.id === nextAction.id,
        );
        const newHistory = {
          ...prev,
          currentIndex: entryIndex >= 0 ? entryIndex : prev.currentIndex,
        };

        return updateNavigationStates(newHistory);
      });

      setRedoStack((prev) => prev.slice(0, -1));
    }

    return result;
  }, [redoStack, updateNavigationStates]);

  const clearHistory = useCallback(() => {
    setHistory((prev) =>
      updateNavigationStates({
        ...prev,
        entries: [],
        currentIndex: -1,
      }),
    );
    setUndoStack([]);
    setRedoStack([]);
  }, [updateNavigationStates]);

  const removeEntry = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const newEntries = prev.entries.filter((entry) => entry.id !== id);
        let newIndex = prev.currentIndex;

        // Adjust current index if necessary
        if (newEntries.length === 0) {
          newIndex = -1;
        } else if (newIndex >= newEntries.length) {
          newIndex = newEntries.length - 1;
        }

        const newHistory = {
          ...prev,
          entries: newEntries,
          currentIndex: newIndex,
        };

        return updateNavigationStates(newHistory);
      });
    },
    [updateNavigationStates],
  );

  const getRecentEntries = useCallback(
    (limit: number = 10) => {
      return history.entries.slice().reverse().slice(0, limit);
    },
    [history.entries],
  );

  return {
    ...history,
    addEntry,
    goBack,
    goForward,
    clearHistory,
    removeEntry,
    undo,
    redo,
    getRecentEntries,
  };
};
