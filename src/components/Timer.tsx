import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Card, TimerState } from '../types';
import { formatTimerDuration } from '../utils/formatTimerDuration';
import { PlayIcon, PauseIcon, CheckIcon } from '@heroicons/react/24/solid';

interface TimerProps {
  card: Card;
  onComplete?: () => void;
  onTimerStateChange?: (state: TimerState) => void;
}

interface TimerRef {
  getSeconds: () => number;
  reset: () => void;
}

const Timer = forwardRef<TimerRef, TimerProps>(({ card, onComplete, onTimerStateChange }, ref) => {
  const [isRunning, setIsRunning] = useState(() => {
    return card.timerState ? !card.timerState.isPaused : false;
  });
  const [seconds, setSeconds] = useState(() => {
    if (card.timerState) {
      const { startedAt, accumulatedSeconds, isPaused } = card.timerState;
      if (!isPaused && startedAt) {
        // Calculate elapsed time since start
        const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        return accumulatedSeconds + elapsed;
      }
      return accumulatedSeconds;
    }
    return 0;
  });
  const intervalRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    getSeconds: () => seconds,
    reset: () => {
      setIsRunning(false);
      setSeconds(0);
    },
  }));

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

  // Debounced state sync every 5 seconds
  useEffect(() => {
    if (!onTimerStateChange || !isRunning) return;

    const timeoutId = setTimeout(() => {
      onTimerStateChange({
        startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
        pausedAt: undefined,
        accumulatedSeconds: seconds,
        isPaused: false,
      });
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [seconds, isRunning, onTimerStateChange]);

  const handleStart = () => {
    setIsRunning(true);
    if (onTimerStateChange) {
      onTimerStateChange({
        startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
        pausedAt: undefined,
        accumulatedSeconds: seconds,
        isPaused: false,
      });
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    if (onTimerStateChange) {
      onTimerStateChange({
        startedAt: undefined,
        pausedAt: new Date().toISOString(),
        accumulatedSeconds: seconds,
        isPaused: true,
      });
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (card.completed) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-md border border-gray-200">
      {!isRunning && card.timerState?.isPaused && card.timerState.accumulatedSeconds > 0 && (
        <div className="text-xs text-gray-500 mb-1">
          Paused at {formatTimerDuration(card.timerState.accumulatedSeconds)}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-gray-700">
          {formatTimerDuration(seconds)}
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="p-2 text-grey-700 hover:text-grey-800 rounded-md transition-colors"
              title="Start timer"
            >
              <PlayIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-2 text-yellow-500 hover:text-yellow-600 rounded-md transition-colors"
              title="Pause timer"
            >
              <PauseIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleComplete}
            className="p-2 text-green-600 hover:text-green-700 rounded-md transition-colors"
            title="Mark as complete"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer;
export type { TimerRef };
