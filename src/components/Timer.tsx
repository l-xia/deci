import { useState, useEffect, useRef } from 'react';
import type { Card } from '../types';
import { formatTime } from '../utils/formatTime';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface TimerProps {
  card: Card;
  onComplete: (timeSpent: number) => void;
}

function Timer({ card, onComplete }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

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
              <PlayIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
              title="Pause timer"
            >
              <PauseIcon className="w-4 h-4" />
            </button>
          )}

          {seconds > 0 && (
            <>
              <button
                onClick={handleComplete}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                title="Mark as complete"
              >
                <CheckIcon className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors"
                title="Reset timer"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timer;
