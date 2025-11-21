import { Draggable } from '@hello-pangea/dnd';
import type { Card } from '../../types';
import Timer from '../Timer';
import { getCategoryColors } from '../../utils/categories';
import { formatTime } from '../../utils/formatTime';

interface DailyDeckCardProps {
  card: Card;
  index: number;
  isFirstIncomplete: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateCard: (index: number, updates: Partial<Card>) => void;
  onEditCard: (index: number) => void;
  onDeleteCard: (index: number) => void;
  onDoubleClick: (index: number) => void;
}

function DailyDeckCard({ card, index, isFirstIncomplete, isExpanded, onToggleExpanded, onUpdateCard, onEditCard, onDeleteCard, onDoubleClick }: DailyDeckCardProps) {
  const isFirstCard = isFirstIncomplete && !card.completed;
  const colors = getCategoryColors(card.sourceCategory || 'default');
  const borderColor = colors.border;
  const highlightColor = colors.highlight;

  const handleMarkComplete = () => {
    onUpdateCard(index, {
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpent: 0,
    });
    // Collapse after marking complete
    if (isExpanded) {
      onToggleExpanded();
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded();
  };

  return (
    <Draggable draggableId={`daily-${card.id}-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={() => !snapshot.isDragging && onDoubleClick(index)}
          data-card-incomplete={!card.completed}
          className={`border-2 rounded-md shadow-lg transition-all mb-3 ${
            card.completed
              ? 'bg-gray-50 border-gray-300 opacity-60'
              : `bg-white ${borderColor}`
          } ${
            snapshot.isDragging
              ? 'shadow-2xl rotate-2 cursor-grabbing'
              : 'hover:shadow-xl cursor-grab'
          } ${isFirstCard && isExpanded ? 'p-6' : 'p-4'}`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {isFirstCard ? (
            <>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${
                    isExpanded ? 'text-3xl' : 'text-2xl'
                  } ${card.completed ? 'text-gray-500' : 'text-gray-900'}`}>
                    <span className="relative inline-block">
                      <span className="relative z-10">{card.title}</span>
                      {!card.completed && (
                        <span className={`absolute bottom-0 left-0 right-0 ${highlightColor} opacity-50 z-0 ${
                          isExpanded ? 'h-2.5' : 'h-2'
                        }`}></span>
                      )}
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {card.duration && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full ${
                      card.completed ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {card.duration} min
                    </span>
                  )}
                  <div className="flex gap-1">
                    {!card.completed && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCard(index);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkComplete();
                          }}
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark Complete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCard(index);
                          }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Remove from deck"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                      </>
                    )}
                    {card.completed && (
                      <button
                        onClick={handleToggleExpand}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <>
                  {card.description && (
                    <p className={`text-lg mt-4 mb-4 whitespace-pre-line ${
                      card.completed ? 'text-gray-600' : 'text-gray-700'
                    }`}>{card.description}</p>
                  )}

                  {!card.completed && (
                    <Timer
                      card={card}
                      onComplete={(timeSpent) => {
                        onUpdateCard(index, {
                          completed: true,
                          timeSpent,
                          completedAt: new Date().toISOString(),
                        });
                        // Collapse after marking complete
                        if (isExpanded) {
                          onToggleExpanded();
                        }
                      }}
                    />
                  )}

                  {card.completed && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2 text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-base">
                          {card.timeSpent !== undefined && card.timeSpent > 0
                            ? `Completed in ${formatTime(card.timeSpent)}`
                            : 'Completed'}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-semibold flex-1 ${
                card.completed ? 'text-gray-500' : 'text-gray-900'
              }`}>
                <span className="relative inline-block">
                  <span className="relative z-10">{card.title}</span>
                  {!card.completed && (
                    <span className={`absolute bottom-0 left-0 right-0 h-2 ${highlightColor} opacity-50 z-0`}></span>
                  )}
                </span>
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {card.completed && (
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {card.duration && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    card.completed ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {card.duration} min
                  </span>
                )}
                {!card.completed && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCard(index);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkComplete();
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark Complete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCard(index);
                      }}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Remove from deck"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default DailyDeckCard;
