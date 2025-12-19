import { useState, useCallback } from 'react';
import { SlideData } from '../types/index';

interface HistoryState {
  past: SlideData[][];
  future: SlideData[][];
}

export const usePresentationHistory = (
  initialSlides: SlideData[], 
  setSlides: (slides: SlideData[]) => void,
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: []
  });

  const pushToHistory = useCallback((newSlides: SlideData[]) => {
    setHistory(prev => {
        // Limit history size to 50
        const newPast = [...prev.past, initialSlides].slice(-50); // Store current state before update
        return {
            past: newPast,
            future: []
        };
    });
  }, [initialSlides]);

  // We need a wrapper that updates slides AND pushes history, 
  // but to avoid stale closures, usually we push history right before state update.
  // However, simpler implementation is: pass the *current* slides to history before updating.
  
  const updateWithHistory = useCallback((newSlides: SlideData[], currentSlidesState: SlideData[]) => {
      setHistory(prev => ({
          past: [...prev.past, currentSlidesState].slice(-50),
          future: []
      }));
      setSlides(newSlides);
  }, [setSlides]);

  const undo = useCallback((currentSlides: SlideData[], currentIndex: number) => {
      if (history.past.length === 0) return;
      
      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);
      
      setHistory(prev => ({
          past: newPast,
          future: [currentSlides, ...prev.future]
      }));
      setSlides(previous);
      
      if (currentIndex >= previous.length) {
          setCurrentSlideIndex(Math.max(0, previous.length - 1));
      }
  }, [history.past, setSlides, setCurrentSlideIndex]);

  const redo = useCallback((currentSlides: SlideData[]) => {
      if (history.future.length === 0) return;
      
      const next = history.future[0];
      const newFuture = history.future.slice(1);
      
      setHistory(prev => ({
          past: [...prev.past, currentSlides],
          future: newFuture
      }));
      setSlides(next);
  }, [history.future, setSlides]);

  return {
    history,
    updateWithHistory,
    undo,
    redo
  };
};