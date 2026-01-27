import { useState, useCallback } from 'react';
import type { Card, CategoryKey } from '../types';

export function useCardModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(
    null
  );
  const [editingDailyDeckIndex, setEditingDailyDeckIndex] = useState<
    number | null
  >(null);
  const [isOneTimeEdit, setIsOneTimeEdit] = useState(false);

  const openModal = useCallback(
    (category: CategoryKey, card: Card | null = null) => {
      setSelectedCategory(category);
      setEditingCard(card);
      setEditingDailyDeckIndex(null);
      setIsOneTimeEdit(false);
      setModalOpen(true);
    },
    []
  );

  const openDailyDeckCardModal = useCallback((card: Card, index: number) => {
    setEditingCard(card);
    setEditingDailyDeckIndex(index);
    setIsOneTimeEdit(false);
    setModalOpen(true);
  }, []);

  const openOneTimeEditModal = useCallback((card: Card, index: number) => {
    setEditingCard(card);
    setEditingDailyDeckIndex(index);
    setIsOneTimeEdit(true);
    setSelectedCategory(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCard(null);
    setSelectedCategory(null);
    setEditingDailyDeckIndex(null);
    setIsOneTimeEdit(false);
  }, []);

  return {
    modalOpen,
    editingCard,
    selectedCategory,
    editingDailyDeckIndex,
    isOneTimeEdit,
    openModal,
    openDailyDeckCardModal,
    openOneTimeEditModal,
    closeModal,
  };
}
