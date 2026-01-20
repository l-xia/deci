import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType } from '../types';
import { getCategoryColors } from '../utils/categories';
import {
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface CardProps {
  card: CardType;
  index: number;
  onEdit: (card: CardType) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  isDailyDeck?: boolean;
  categoryKey: 'structure' | 'upkeep' | 'play' | 'default';
  dailyDeck?: CardType[];
}

function Card({
  card,
  index,
  onEdit,
  onArchive,
  onDelete,
  isDailyDeck = false,
  categoryKey,
  dailyDeck = [],
}: CardProps) {
  const colors = getCategoryColors(categoryKey);

  // Calculate how many times this card is in the daily deck
  const timesInDailyDeck = dailyDeck.filter(
    (deckCard) => deckCard.id === card.id
  ).length;

  // Calculate remaining uses for limited recurrence cards
  const remainingUses =
    card.recurrenceType === 'limited' && card.maxUses
      ? card.maxUses - timesInDailyDeck
      : 0;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 rounded-md border-2 ${colors.border} shadow-sm transition-all ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
          } bg-white cursor-move`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 relative inline-block">
                {card.title}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-2 ${colors.highlight} opacity-50 -z-10`}
                ></span>
              </h3>
              {card.description && (
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                  {card.description}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {card.duration && (
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    {card.duration} min
                  </span>
                )}
                {card.recurrenceType === 'limited' && card.maxUses && (
                  <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md">
                    {remainingUses}/{card.maxUses} left
                  </span>
                )}
                {card.recurrenceType === 'once' &&
                  (card.timesUsed || 0) === 0 && (
                    <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                      One-time
                    </span>
                  )}
                {card.recurrenceType === 'always' && (
                  <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                    ∞ {timesInDailyDeck > 0 && `(${timesInDailyDeck} in deck)`}
                  </span>
                )}
              </div>
            </div>
            {!isDailyDeck && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(card);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit"
                  aria-label={`Edit ${card.title}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(card.id);
                  }}
                  className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                  title="Archive"
                  aria-label={`Archive ${card.title}`}
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                  aria-label={`Delete ${card.title}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Card;
