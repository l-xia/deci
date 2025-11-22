import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import type { Card as CardType } from '../types';
import { getCategoryColors } from '../utils/categories';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CardStackProps {
  droppableId: 'structure' | 'upkeep' | 'play' | 'default';
  title: string;
  cards: CardType[];
  color: string;
  onAddCard: () => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
}

function CardStack({ droppableId, title, cards, onAddCard, onEditCard, onDeleteCard }: CardStackProps) {
  const colors = getCategoryColors(droppableId);

  return (
    <div className={`rounded-md border-2 ${colors.border} bg-white p-4 shadow-md flex flex-col h-[300px] md:h-full md:max-h-[400px]`}>
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 relative inline-block">
          <span className="relative z-10">{title}</span>
          <span className={`absolute bottom-0 left-0 right-0 h-2 ${colors.highlight} opacity-50`}></span>
        </h3>
        <button
          onClick={onAddCard}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Add card"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-0 flex-1 overflow-y-auto transition-all rounded-md ${
              snapshot.isDraggingOver
                ? 'bg-blue-50 ring-2 ring-blue-400 ring-opacity-50 scale-[1.02]'
                : ''
            }`}
          >
            {cards.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No cards yet. Add one!
              </p>
            ) : (
              cards.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  index={index}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                  isDailyDeck={false}
                  categoryKey={droppableId}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default CardStack;
