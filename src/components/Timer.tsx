import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Card } from '../types';
import { formatTimerDuration } from '../utils/formatTimerDuration';
import { PlayIcon, PauseIcon, CheckIcon } from '@heroicons/react/24/solid';

interface TimerProps {
  card: Card;
  onComplete?: () => void;
}

interface TimerRef {
  getSeconds: () => number;
  reset: () => void;
}

const Timer = forwardRef<TimerRef, TimerProps>(({ card, onComplete }, ref) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
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

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
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
