import { useMemo } from 'react';
import { useGlobalTimerContext, useDailyDeckContext } from '../../context';
import { formatTimerDuration } from '../../utils/formatTimerDuration';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';
import {
  timerButtonVariants,
  timerDisplayVariants,
  compactInputVariants,
  iconSizeVariants,
} from '../../utils/variants';

interface GlobalTimerProps {
  fullWidth?: boolean;
}

export function GlobalTimer({ fullWidth = false }: GlobalTimerProps) {
  const {
    startTimer,
    pauseTimer,
    stopTimer,
    updateDescription,
    selectCard,
    isRunning,
    selectedCardIndex,
    currentDescription,
    accumulatedSeconds,
  } = useGlobalTimerContext();

  const { dailyDeck } = useDailyDeckContext();

  const handleCardSelect = (value: string) => {
    if (value === '') {
      selectCard(null);
    } else {
      selectCard(Number(value));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDescription(e.target.value);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      if (selectedCardIndex === null) {
        // If no card selected, select the first non-completed card from the daily deck
        const firstAvailableIndex = dailyDeck.findIndex((c) => !c.completed);
        if (firstAvailableIndex !== -1) {
          selectCard(firstAvailableIndex);
        }
      }
      startTimer();
    }
  };

  // Check if there are any non-completed cards available
  const hasAvailableCards = useMemo(
    () => dailyDeck.some((card) => !card.completed),
    [dailyDeck]
  );

  const iconClass = fullWidth
    ? iconSizeVariants({ size: 'md' })
    : `${iconSizeVariants({ size: 'sm' })} md:${iconSizeVariants({ size: 'md' })}`;

  return (
    <div
      className={`flex items-center ${fullWidth ? 'gap-2 w-full' : 'gap-1 md:gap-2'}`}
    >
      {/* Task Description Input */}
      <input
        type="text"
        value={currentDescription}
        onChange={handleDescriptionChange}
        placeholder="What are you working on?"
        className={`${compactInputVariants({ fullWidth })} ${!fullWidth ? 'hidden md:block w-48' : ''}`}
        disabled={isRunning}
      />

      {/* Card Dropdown */}
      <select
        value={selectedCardIndex !== null ? String(selectedCardIndex) : ''}
        onChange={(e) => handleCardSelect(e.target.value)}
        className={`px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          fullWidth ? 'text-sm w-32' : 'text-xs w-24 md:w-40'
        }`}
        disabled={isRunning || !hasAvailableCards}
      >
        <option value="">Select a card...</option>
        {dailyDeck.map((card, index) =>
          card.completed ? null : (
            <option key={`${card.id}-${index}`} value={String(index)}>
              {card.title || 'Untitled'}
            </option>
          )
        )}
      </select>

      {/* Timer Display */}
      <div className={timerDisplayVariants({ fullWidth })}>
        {formatTimerDuration(accumulatedSeconds)}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={selectedCardIndex === null && !isRunning}
        className={timerButtonVariants({
          state: isRunning ? 'running' : 'paused',
        })}
        title={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <PauseIcon className={iconClass} />
        ) : (
          <PlayIcon className={iconClass} />
        )}
      </button>

      {/* Stop Button - only show when timer has been used */}
      {(isRunning || accumulatedSeconds > 0) && (
        <button
          onClick={stopTimer}
          className={timerButtonVariants({ state: 'stopped' })}
          title="Stop timer and clear"
        >
          <StopIcon className={iconClass} />
        </button>
      )}
    </div>
  );
}
