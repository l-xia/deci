import { useMemo } from 'react';
import { useGlobalTimerContext, useDailyDeckContext } from '../../context';
import { formatTimerDuration } from '../../utils/formatTimerDuration';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';

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

  return (
    <div
      className={`flex items-center ${fullWidth ? 'gap-2 w-full' : 'gap-1 md:gap-2'}`}
    >
      {/* Task Description Input - hidden on compact, shown on fullWidth */}
      <input
        type="text"
        value={currentDescription}
        onChange={handleDescriptionChange}
        placeholder="What are you working on?"
        className={`text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          fullWidth ? 'flex-1 min-w-0' : 'hidden md:block text-xs w-48'
        }`}
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
      <div
        className={`font-mono font-semibold text-gray-700 min-w-[60px] text-center ${
          fullWidth ? 'text-base' : 'text-xs md:text-sm'
        }`}
      >
        {formatTimerDuration(accumulatedSeconds)}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={selectedCardIndex === null && !isRunning}
        className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isRunning
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-green-600 hover:text-green-700'
        }`}
        title={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <PauseIcon
            className={fullWidth ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'}
          />
        ) : (
          <PlayIcon
            className={fullWidth ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'}
          />
        )}
      </button>

      {/* Stop Button - only show when timer has been used */}
      {(isRunning || accumulatedSeconds > 0) && (
        <button
          onClick={stopTimer}
          className="p-1.5 rounded-md transition-colors text-red-500 hover:text-red-600"
          title="Stop timer and clear"
        >
          <StopIcon
            className={fullWidth ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'}
          />
        </button>
      )}
    </div>
  );
}
