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
    selectedCardId,
    currentDescription,
    accumulatedSeconds,
  } = useGlobalTimerContext();

  const { dailyDeck } = useDailyDeckContext();

  const handleCardSelect = (cardId: string) => {
    selectCard(cardId);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDescription(e.target.value);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      if (!selectedCardId) {
        // If no card selected, select the first card from the daily deck
        const firstCard = dailyDeck[0];
        if (firstCard) {
          selectCard(firstCard.id);
        }
      }
      startTimer();
    }
  };

  // Only show active (non-completed) cards in dropdown (memoized)
  const availableCards = useMemo(
    () => dailyDeck.filter((card) => !card.completed),
    [dailyDeck]
  );

  return (
    <div className="flex items-center gap-2">
      {/* Task Description Input */}
      <input
        type="text"
        value={currentDescription}
        onChange={handleDescriptionChange}
        placeholder="What are you working on?"
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
        disabled={isRunning}
      />

      {/* Card Dropdown */}
      <select
        value={selectedCardId || ''}
        onChange={(e) => handleCardSelect(e.target.value)}
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
        disabled={isRunning || availableCards.length === 0}
      >
        <option value="">Select a card...</option>
        {availableCards.map((card, index) => (
          <option key={`${card.id}-${index}`} value={card.id}>
            {card.title || 'Untitled'}
          </option>
        ))}
      </select>

      {/* Timer Display */}
      <div className="text-sm font-mono font-semibold text-gray-700 min-w-[60px] text-center">
        {formatTimerDuration(accumulatedSeconds)}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={!selectedCardId && !isRunning}
        className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isRunning
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-green-600 hover:text-green-700'
        }`}
        title={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>

      {/* Stop Button - only show when timer has been used */}
      {(isRunning || accumulatedSeconds > 0) && (
        <button
          onClick={stopTimer}
          className="p-1.5 rounded-md transition-colors text-red-500 hover:text-red-600"
          title="Stop timer and clear"
        >
          <StopIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
