import { useState, useCallback } from 'react';
import type { Card, CategoryKey } from '../types';

export function useCardModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [editingDailyDeckIndex, setEditingDailyDeckIndex] = useState<number | null>(null);

  const openModal = useCallback((category: CategoryKey, card: Card | null = null) => {
    setSelectedCategory(category);
    setEditingCard(card);
    setEditingDailyDeckIndex(null);
    setModalOpen(true);
  }, []);

  const openDailyDeckCardModal = useCallback((card: Card, index: number) => {
    setEditingCard(card);
    setEditingDailyDeckIndex(index);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCard(null);
    setSelectedCategory(null);
    setEditingDailyDeckIndex(null);
  }, []);

  return {
    modalOpen,
    editingCard,
    selectedCategory,
    editingDailyDeckIndex,
    openModal,
    openDailyDeckCardModal,
    closeModal,
  };
}
