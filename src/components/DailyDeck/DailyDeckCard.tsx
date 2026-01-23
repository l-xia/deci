import { Draggable } from '@hello-pangea/dnd';
import { useState, useMemo } from 'react';
import type { Card } from '../../types';
import { getCategoryColors } from '../../utils/categories';
import { formatScheduleDescription } from '../../utils/scheduling';
import { formatTimerDuration } from '../../utils/formatTimerDuration';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import CardContextMenu from './CardContextMenu';
import { CompletedCardBadge } from '../CompletedCardBadge';
import { useLongPress } from '../../hooks/useLongPress';

interface DailyDeckCardProps {
  card: Card;
  index: number;
  isFirstIncomplete: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateCard: (index: number, updates: Partial<Card>) => void;
  onEditCard: (index: number) => void;
  onOneTimeEdit: (index: number) => void;
  onDoubleClick: (index: number) => void;
  onReturnToStack?: (index: number) => void;
}

function DailyDeckCard({
  card,
  index,
  isFirstIncomplete,
  isExpanded,
  onToggleExpanded,
  onUpdateCard,
  onEditCard,
  onOneTimeEdit,
  onDoubleClick,
  onReturnToStack,
}: DailyDeckCardProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const isFirstCard = isFirstIncomplete && !card.completed;
  const colors = getCategoryColors(card.sourceCategory || 'default');
  const borderColor = colors.border;
  const highlightColor = colors.highlight;

  // Calculate total tracked time from time entries (memoized)
  const trackedSeconds = useMemo(
    () => card.timeEntries?.reduce((sum, entry) => sum + entry.seconds, 0) || 0,
    [card.timeEntries]
  );

  const longPressHandlers = useLongPress({
    onLongPress: (e) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      setContextMenu({ x: clientX || 0, y: clientY || 0 });
    },
    delay: 500,
  });

  const handleMarkComplete = () => {
    const updates: Partial<Card> = {
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpent: trackedSeconds,
    };

    onUpdateCard(index, updates);

    if (isExpanded) {
      onToggleExpanded();
    }
  };

  const handleMarkIncomplete = () => {
    onUpdateCard(index, {
      completed: false,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleReturnToStack = () => {
    if (onReturnToStack) {
      onReturnToStack(index);
    }
  };

  const handleOneTimeEdit = () => {
    onOneTimeEdit(index);
  };

  return (
    <>
      <Draggable draggableId={`daily-${card.id}-${index}`} index={index}>
        {(provided, snapshot) => {
          // Override the drag handle's onContextMenu to show our custom menu
          const dragHandleProps = {
            ...provided.dragHandleProps,
            onContextMenu: handleContextMenu, // Desktop right-click
            ...longPressHandlers, // Mobile long-press
          };

          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...dragHandleProps}
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
                      <h3
                        className={`font-bold ${
                          isExpanded ? 'text-3xl' : 'text-2xl'
                        } ${card.completed ? 'text-gray-500' : 'text-gray-900'}`}
                      >
                        <span className="relative inline-block">
                          <span className="relative z-10">{card.title}</span>
                          {!card.completed && (
                            <span
                              className={`absolute bottom-0 left-0 right-0 ${highlightColor} opacity-50 z-0 ${
                                isExpanded ? 'h-2.5' : 'h-2'
                              }`}
                            ></span>
                          )}
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {trackedSeconds > 0 && !card.completed && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          <ClockIcon className="w-4 h-4" />
                          {formatTimerDuration(trackedSeconds)}
                        </span>
                      )}
                      {card.duration && (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full ${
                            card.completed
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {card.duration} min
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      {card.description && (
                        <p
                          className={`text-lg mt-4 mb-4 whitespace-pre-line ${
                            card.completed ? 'text-gray-600' : 'text-gray-700'
                          }`}
                        >
                          {card.description}
                        </p>
                      )}

                      {card.scheduleConfig && (
                        <div className="text-sm text-gray-500 italic mb-2">
                          📅 {formatScheduleDescription(card.scheduleConfig)}
                        </div>
                      )}

                      {card.completed && (
                        <CompletedCardBadge
                          timeSpent={card.timeSpent}
                          completedAt={card.completedAt}
                          size="md"
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <h3
                    className={`text-xl font-semibold flex-1 ${
                      card.completed ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    <span className="relative inline-block">
                      <span className="relative z-10">{card.title}</span>
                      {!card.completed && (
                        <span
                          className={`absolute bottom-0 left-0 right-0 h-2 ${highlightColor} opacity-50 z-0`}
                        ></span>
                      )}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {card.completed && (
                      <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                    {trackedSeconds > 0 && !card.completed && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 bg-green-100 text-green-800">
                        <ClockIcon className="w-3 h-3" />
                        {formatTimerDuration(trackedSeconds)}
                      </span>
                    )}
                    {card.duration && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                          card.completed
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {card.duration} min
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </Draggable>

      {contextMenu && (
        <CardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isCompleted={!!card.completed}
          onOneTimeEdit={handleOneTimeEdit}
          onEdit={() => onEditCard(index)}
          onMarkComplete={handleMarkComplete}
          onMarkIncomplete={handleMarkIncomplete}
          onReturnToStack={handleReturnToStack}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

export default DailyDeckCard;
