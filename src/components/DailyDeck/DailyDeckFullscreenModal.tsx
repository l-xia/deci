import type { Card } from '../../types';
import Timer from '../Timer';
import { getCategoryColors } from '../../utils/categories';
import { formatTime } from '../../utils/formatTime';
import { CheckIcon } from '@heroicons/react/24/outline';

interface DailyDeckFullscreenModalProps {
  card: Card;
  cardIndex: number;
  onClose: () => void;
  onUpdateCard: (index: number, updates: Partial<Card>) => void;
}

function DailyDeckFullscreenModal({
  card,
  cardIndex,
  onClose,
  onUpdateCard,
}: DailyDeckFullscreenModalProps) {
  const colors = getCategoryColors(card.sourceCategory || 'default');
  const borderColor = colors.border;
  const highlightColor = colors.highlight;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-full overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`border-l-8 ${borderColor} pl-6`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-5xl font-bold text-gray-900 relative inline-block">
              <span className="relative z-10">{card.title}</span>
              <span className={`absolute bottom-0 left-0 right-0 h-4 ${highlightColor} opacity-50 z-0`}></span>
            </h2>
            {card.duration && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 text-lg font-semibold rounded-full ml-4">
                {card.duration} min
              </span>
            )}
          </div>

          {card.description && (
            <p className="text-xl text-gray-700 mb-6 leading-relaxed whitespace-pre-line">{card.description}</p>
          )}

          <Timer
            card={card}
            onComplete={(timeSpent) => {
              onUpdateCard(cardIndex, {
                completed: true,
                timeSpent,
                completedAt: new Date().toISOString(),
              });
            }}
          />

          {card.completed && card.timeSpent && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-3 text-green-700">
                <CheckIcon className="w-6 h-6" />
                <span className="text-lg font-medium">
                  Completed in {formatTime(card.timeSpent)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyDeckFullscreenModal;
