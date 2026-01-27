import { useMemo } from 'react';
import { useGlobalTimerContext, useDailyDeckContext } from '../../context';
import { formatTimerDuration } from '../../utils/formatTimerDuration';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';

export function GlobalTimer() {
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
    <div className="flex items-center gap-1 md:gap-2">
      {/* Task Description Input - hidden on mobile */}
      <input
        type="text"
        value={currentDescription}
        onChange={handleDescriptionChange}
        placeholder="What are you working on?"
        className="hidden md:block text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
        disabled={isRunning}
      />

      {/* Card Dropdown */}
      <select
        value={selectedCardIndex !== null ? String(selectedCardIndex) : ''}
        onChange={(e) => handleCardSelect(e.target.value)}
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-24 md:w-40"
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
      <div className="text-xs md:text-sm font-mono font-semibold text-gray-700 min-w-[60px] text-center">
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
          <PauseIcon className="w-4 h-4 md:w-5 md:h-5" />
        ) : (
          <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />
        )}
      </button>

      {/* Stop Button - only show when timer has been used */}
      {(isRunning || accumulatedSeconds > 0) && (
        <button
          onClick={stopTimer}
          className="p-1.5 rounded-md transition-colors text-red-500 hover:text-red-600"
          title="Stop timer and clear"
        >
          <StopIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}
    </div>
  );
}
