import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType } from '../types';
import { getCategoryColors } from '../utils/categories';

interface CardProps {
  card: CardType;
  index: number;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
  isDailyDeck?: boolean;
  categoryKey: 'structure' | 'upkeep' | 'play' | 'default';
}

function Card({ card, index, onEdit, onDelete, isDailyDeck = false, categoryKey }: CardProps) {
  const colors = getCategoryColors(categoryKey);

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
                <span className={`absolute bottom-0 left-0 right-0 h-2 ${colors.highlight} opacity-50 -z-10`}></span>
              </h3>
              {card.description && (
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{card.description}</p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {card.duration && (
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    {card.duration} min
                  </span>
                )}
                {card.recurrenceType === 'limited' && card.maxUses && (
                  <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md">
                    {card.maxUses - (card.timesUsed || 0)}/{card.maxUses} left
                  </span>
                )}
                {card.recurrenceType === 'once' && (card.timesUsed || 0) === 0 && (
                  <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                    One-time
                  </span>
                )}
                {card.recurrenceType === 'always' && (
                  <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                    ∞
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
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
