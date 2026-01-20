import { useMemo } from 'react';
import CardStack from '../CardStack';
import { CATEGORIES } from '../../constants';
import type { Card, CategoryKey } from '../../types';

interface CardStacksSectionProps {
  dailyDeck: Card[];
  getAvailableCards: (category: CategoryKey, dailyDeck: Card[]) => Card[];
  onAddCard: (category: CategoryKey) => void;
  onEditCard: (category: CategoryKey, card: Card) => void;
  onArchiveCard: (category: CategoryKey, cardId: string) => void;
  onDeleteCard: (category: CategoryKey, cardId: string) => void;
}

/**
 * Manages card stacks section with filtering
 * Extracts the left side of the main app layout
 */
export function CardStacksSection({
  dailyDeck,
  getAvailableCards,
  onAddCard,
  onEditCard,
  onArchiveCard,
  onDeleteCard,
}: CardStacksSectionProps) {
  // Memoize filtered cards to avoid recalculating on every render
  const filteredCardsByCategory = useMemo(() => {
    return Object.fromEntries(
      (Object.keys(CATEGORIES) as CategoryKey[]).map((key) => [
        key,
        getAvailableCards(key, dailyDeck),
      ])
    ) as Record<CategoryKey, Card[]>;
  }, [getAvailableCards, dailyDeck]);

  return (
    <div className="md:grid md:grid-cols-2 md:auto-rows-min md:gap-4 flex md:flex-none overflow-x-auto md:overflow-x-visible gap-4 md:gap-0 pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
      {(
        Object.entries(CATEGORIES) as Array<
          [
            keyof typeof CATEGORIES,
            (typeof CATEGORIES)[keyof typeof CATEGORIES],
          ]
        >
      ).map(([key, category]) => {
        return (
          <div
            key={key}
            className="flex-shrink-0 w-[85vw] md:w-auto snap-start"
          >
            <CardStack
              droppableId={key}
              title={category.name}
              cards={filteredCardsByCategory[key] ?? []}
              color={category.color}
              onAddCard={() => onAddCard(key)}
              onEditCard={(card) => onEditCard(key, card)}
              onArchiveCard={(cardId) => onArchiveCard(key, cardId)}
              onDeleteCard={(cardId) => onDeleteCard(key, cardId)}
              dailyDeck={dailyDeck}
            />
          </div>
        );
      })}
    </div>
  );
}
