import type { Card } from '../types';

/**
 * Utility functions for daily deck card operations
 * Centralizes the "completed first, incomplete last" ordering logic
 */

export interface ReorderResult {
  newDeck: Card[];
  insertIndex: number;
}

/**
 * Reorders deck when a card is marked as complete
 * Moves the card to position 0 (completed cards go first)
 */
export function reorderDeckOnComplete(
  deck: Card[],
  cardIndex: number,
  updatedCard: Card
): ReorderResult {
  const newDeck = [...deck];
  newDeck.splice(cardIndex, 1);

  // Insert at position 0 (completed cards go first)
  newDeck.splice(0, 0, updatedCard);

  return { newDeck, insertIndex: 0 };
}

/**
 * Reorders deck when a card is marked as incomplete
 * Moves the card to the first incomplete position
 */
export function reorderDeckOnIncomplete(
  deck: Card[],
  cardIndex: number,
  updatedCard: Card
): ReorderResult {
  const newDeck = [...deck];
  newDeck.splice(cardIndex, 1);

  // Find first incomplete card position
  const firstIncompleteIndex = newDeck.findIndex((c) => !c.completed);
  const insertIndex =
    firstIncompleteIndex === -1 ? newDeck.length : firstIncompleteIndex;

  newDeck.splice(insertIndex, 0, updatedCard);

  return { newDeck, insertIndex };
}

/**
 * Finds the index of the first incomplete card in the deck
 * Returns deck.length if all cards are completed
 */
export function findFirstIncompleteIndex(deck: Card[]): number {
  const index = deck.findIndex((c) => !c.completed);
  return index === -1 ? deck.length : index;
}
