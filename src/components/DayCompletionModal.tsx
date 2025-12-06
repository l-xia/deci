import { XMarkIcon, FireIcon } from '@heroicons/react/24/outline';
import type { DayCompletionSummary, UserStreak } from '../types/dayCompletion';
import { formatTime, formatDuration, formatDate } from '../utils/date';
import { getCategoryColors } from '../utils/categories';

interface DayCompletionModalProps {
  summary: DayCompletionSummary;
  streak: UserStreak;
  onClose: () => void;
  onStartNewDay?: () => void;
}

export function DayCompletionModal({ summary, streak, onClose, onStartNewDay }: DayCompletionModalProps) {
  const completionRate = summary.totalCards > 0
    ? Math.round((summary.completedCards / summary.totalCards) * 100)
    : 0;

  const getStreakMessage = (currentStreak: number): string => {
    if (currentStreak === 0) return "Great start!";
    if (currentStreak === 1) return "First day done!";
    if (currentStreak < 7) return "Keep it up!";
    if (currentStreak < 30) return "Building momentum!";
    if (currentStreak < 100) return "Amazing consistency!";
    return "You're unstoppable!";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Day Complete! 🎉</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(new Date().toISOString())}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Streak Display */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FireIcon className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-900">{streak.currentStreak}</span>
                  <span className="text-gray-600">day streak</span>
                </div>
                <p className="text-sm text-gray-600">{getStreakMessage(streak.currentStreak)}</p>
              </div>
              {streak.longestStreak > streak.currentStreak && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Longest streak</div>
                  <div className="text-xl font-semibold text-gray-700">{streak.longestStreak} days</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">Cards Completed</div>
              <div className="text-2xl font-bold text-blue-900">
                {summary.completedCards}/{summary.totalCards}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-green-900">{completionRate}%</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">Time Spent</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatDuration(summary.totalTimeSpent)}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {summary.categoryBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {summary.categoryBreakdown.map(cb => {
                  const colors = getCategoryColors(cb.category);
                  return (
                    <div key={cb.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                        <span className="font-medium text-gray-700 capitalize">{cb.category}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{cb.count} task{cb.count !== 1 ? 's' : ''}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatDuration(cb.timeSpent)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Cards List */}
          {summary.cardsList.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Completed Tasks</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {summary.cardsList.map(card => (
                  <div key={card.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{card.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Completed at {formatTime(card.completedAt)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 ml-3">
                      {formatDuration(card.timeSpent)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            {onStartNewDay && (
              <button
                onClick={() => {
                  onClose();
                  onStartNewDay();  // This will now trigger template picker
                }}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Start New Day
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
