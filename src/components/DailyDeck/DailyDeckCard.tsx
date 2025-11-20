import { Draggable } from '@hello-pangea/dnd';
import type { Card } from '../../types';
import Timer from '../Timer';
import { getCategoryColors } from '../../utils/categories';
import { formatTime } from '../../utils/formatTime';

interface DailyDeckCardProps {
  card: Card;
  index: number;
  onUpdateCard: (index: number, updates: Partial<Card>) => void;
  onDoubleClick: (index: number) => void;
}

function DailyDeckCard({ card, index, onUpdateCard, onDoubleClick }: DailyDeckCardProps) {
  const colors = getCategoryColors(card.sourceCategory || 'default');
  const borderColor = colors.border;
  const highlightColor = colors.highlight;

  const isFirstCard = index === 0;

  return (
    <Draggable draggableId={`daily-${card.id}-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={() => !snapshot.isDragging && onDoubleClick(index)}
          className={`bg-white border-2 ${borderColor} rounded-md shadow-lg transition-all mb-3 ${
            snapshot.isDragging
              ? 'shadow-2xl rotate-2 cursor-grabbing'
              : 'hover:shadow-xl cursor-grab'
          } ${isFirstCard ? 'p-6' : 'p-4'}`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {isFirstCard ? (
            <>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-gray-900 relative inline-block">
                    <span className="relative z-10">{card.title}</span>
                    <span className={`absolute bottom-0 left-0 right-0 h-3 ${highlightColor} opacity-50 z-0`}></span>
                  </h3>
                </div>
                {card.duration && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {card.duration} min
                  </span>
                )}
              </div>

              {card.description && (
                <p className="text-lg text-gray-700 mt-4 mb-4 whitespace-pre-line">{card.description}</p>
              )}

              <Timer
                card={card}
                onComplete={(timeSpent) => {
                  onUpdateCard(index, {
                    completed: true,
                    timeSpent,
                    completedAt: new Date().toISOString(),
                  });
                }}
              />

              {card.completed && card.timeSpent && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base">Completed in {formatTime(card.timeSpent)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 relative inline-block">
                <span className="relative z-10">{card.title}</span>
                <span className={`absolute bottom-0 left-0 right-0 h-2 ${highlightColor} opacity-50 z-0`}></span>
              </h3>
              {card.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full ml-3 flex-shrink-0">
                  {card.duration} min
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default DailyDeckCard;
