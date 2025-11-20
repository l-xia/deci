import { useState, useEffect, useRef } from 'react';
import type { Card } from '../types';

interface TimerProps {
  card: Card;
  onComplete: (timeSpent: number) => void;
}

function Timer({ card, onComplete }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleComplete = () => {
    setIsRunning(false);
    onComplete(seconds);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (card.completed) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-md border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-mono font-bold text-gray-700">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
              title="Start timer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
              title="Pause timer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          )}

          {seconds > 0 && (
            <>
              <button
                onClick={handleComplete}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                title="Mark as complete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors"
                title="Reset timer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timer;
