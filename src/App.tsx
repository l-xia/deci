import { useState, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import CardStack from './components/CardStack';
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import AuthForm from './components/AuthForm';
import { AppHeader } from './components/AppHeader';
import { AppProvider, useApp } from './context';
import { useAuth } from './context/AuthContext';
import { CATEGORIES } from './constants';
import { isCategoryKey } from './utils/typeGuards';
import { useCardModal } from './hooks/useCardModal';
import type { Card, CategoryKey, CardsByCategory, Template } from './types';

function AuthenticatedApp() {
  const { currentUser, logout } = useAuth();
  const app = useApp();

  const { firebase, cards, dailyDeck, templates, dragAndDrop, posthog } = app;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    modalOpen,
    editingCard,
    selectedCategory,
    editingDailyDeckIndex,
    openModal,
    openDailyDeckCardModal,
    closeModal,
  } = useCardModal();

  const handleSaveCard = useCallback((cardData: Partial<Card>) => {
    if (editingDailyDeckIndex !== null) {
      const updatedCard = { ...dailyDeck.dailyDeck[editingDailyDeckIndex], ...cardData } as Card;
      const updatedDeck = [...dailyDeck.dailyDeck];
      updatedDeck[editingDailyDeckIndex] = updatedCard;
      dailyDeck.setDailyDeck(updatedDeck);

      const sourceCategory = updatedCard.sourceCategory;
      if (sourceCategory && isCategoryKey(sourceCategory)) {
        cards.updateCard(sourceCategory, updatedCard.id, cardData, posthog);
      }
    } else if (selectedCategory) {
      if (editingCard) {
        cards.updateCard(selectedCategory, editingCard.id, cardData, posthog);
      } else {
        cards.addCard(selectedCategory, cardData, posthog);
      }
    }
    closeModal();
  }, [editingCard, selectedCategory, editingDailyDeckIndex, cards, dailyDeck, posthog, closeModal]);

  const handleDeleteCard = useCallback((category: CategoryKey, cardId: string) => {
    if (confirm('Delete this card? This will also remove it from your daily deck.')) {
      cards.deleteCard(category, cardId, posthog);
      dailyDeck.removeCardById(cardId, posthog);
    }
  }, [cards, dailyDeck, posthog]);

  const handleSaveTemplate = useCallback((name: string) => {
    templates.saveTemplate(name, dailyDeck.dailyDeck, posthog);
  }, [templates, dailyDeck.dailyDeck, posthog]);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = templates.getTemplate(templateId);
    if (template) {
      dailyDeck.loadFromTemplate(template.cards, cards.cards, posthog);
    }
  }, [templates, dailyDeck, cards.cards, posthog]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    templates.deleteTemplate(templateId, posthog);
  }, [templates, posthog]);

  const scrollToNextIncompleteCard = useCallback(() => {
    setTimeout(() => {
      const nextIncompleteElement = document.querySelector('[data-card-incomplete="true"]');
      if (nextIncompleteElement) {
        nextIncompleteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }, []);

  const handleMarkCardComplete = useCallback((index: number, card: Card, updates: Partial<Card>) => {
    const updatedCard = { ...card, ...updates };
    const newDeck = [...dailyDeck.dailyDeck];
    newDeck.splice(index, 1);

    // Find the position after the last completed card
    const lastCompletedIndex = newDeck.findIndex(c => !c.completed);
    const insertIndex = lastCompletedIndex === -1 ? newDeck.length : lastCompletedIndex;

    newDeck.splice(insertIndex, 0, updatedCard);
    dailyDeck.setDailyDeck(newDeck);

    posthog?.capture('card_completed', {
      card_id: card.id,
      time_spent: updates.timeSpent,
      suggested_duration: card.duration,
    });

    scrollToNextIncompleteCard();
  }, [dailyDeck, posthog, scrollToNextIncompleteCard]);

  const handleRegularCardUpdate = useCallback((index: number, updatedCard: Card) => {
    const updatedDeck = dailyDeck.dailyDeck.map((c, i) =>
      i === index ? updatedCard : c
    );
    dailyDeck.setDailyDeck(updatedDeck);
  }, [dailyDeck]);

  const handleUpdateCard = useCallback((index: number, updates: Partial<Card>) => {
    const card = dailyDeck.dailyDeck[index];
    if (!card) return;

    const updatedCard = { ...card, ...updates };

    // If marking as complete, reorder the deck
    if (updates.completed && !card.completed) {
      handleMarkCardComplete(index, card, updates);
    } else {
      handleRegularCardUpdate(index, updatedCard);
    }
  }, [dailyDeck, handleMarkCardComplete, handleRegularCardUpdate]);

  const handleEditDailyDeckCard = useCallback((index: number) => {
    const card = dailyDeck.dailyDeck[index];
    if (card) {
      openDailyDeckCardModal(card, index);
    }
  }, [dailyDeck.dailyDeck, openDailyDeckCardModal]);

  const handleDeleteDailyDeckCard = useCallback((index: number) => {
    const card = dailyDeck.dailyDeck[index];
    if (card) {
      dailyDeck.removeCardById(card.id, posthog);
    }
  }, [dailyDeck, posthog]);

  const handleRefresh = useCallback(async () => {
    if (!firebase.initialized || isRefreshing) return;

    setIsRefreshing(true);
    try {
      const result = await firebase.loadData();
      const loadedCards = result.cards as CardsByCategory | null;
      const loadedDailyDeck = result.dailyDeck as Card[] | null;
      const loadedTemplates = result.templates as Template[] | null;

      if (loadedCards) {
        cards.setCards(loadedCards);
      }
      if (loadedDailyDeck) {
        dailyDeck.setDailyDeck(loadedDailyDeck);
      }
      if (loadedTemplates) {
        templates.setTemplates(loadedTemplates);
      }

      posthog?.capture('data_refreshed', {
        cards_count: loadedCards ? Object.values(loadedCards).flat().length : 0,
        daily_deck_count: loadedDailyDeck?.length || 0,
        templates_count: loadedTemplates?.length || 0,
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      posthog?.capture('refresh_error', { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRefreshing(false);
    }
  }, [firebase, cards, dailyDeck, templates, posthog, isRefreshing]);

  // Memoize filtered cards to avoid recalculating on every render
  const filteredCardsByCategory = useMemo(() => {
    return Object.fromEntries(
      (Object.keys(CATEGORIES) as CategoryKey[]).map(key => [
        key,
        cards.getAvailableCards(key, dailyDeck.dailyDeck)
      ])
    ) as Record<CategoryKey, Card[]>;
  }, [cards, dailyDeck.dailyDeck]);

  if (!firebase.initialized) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={dragAndDrop.onDragEnd}>
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 flex flex-col">
        <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col">
          <AppHeader
            userEmail={currentUser?.email || ''}
            isUsingFirebase={firebase.isUsingFirebase}
            saveStatus={firebase.saveStatus}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onLogout={logout}
            onRetrySave={() => firebase.retrySave(cards.cards, dailyDeck.dailyDeck, templates.templates)}
          />

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 flex-1 overflow-hidden min-h-0">
            <div className="lg:col-span-8 flex flex-col min-h-0 flex-shrink-0">
              <div className="md:grid md:grid-cols-2 md:auto-rows-min md:gap-4 flex md:flex-none overflow-x-auto md:overflow-x-visible gap-4 md:gap-0 pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
                {(Object.entries(CATEGORIES) as Array<[keyof typeof CATEGORIES, typeof CATEGORIES[keyof typeof CATEGORIES]]>).map(([key, category]) => {
                  return (
                    <div key={key} className="flex-shrink-0 w-[85vw] md:w-auto snap-start">
                      <CardStack
                        droppableId={key}
                        title={category.name}
                        cards={filteredCardsByCategory[key]}
                        color={category.color}
                        onAddCard={() => openModal(key)}
                        onEditCard={(card) => openModal(key, card)}
                        onDeleteCard={(cardId) => handleDeleteCard(key, cardId)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col min-h-0 flex-1">
              <DailyDeck
                cards={dailyDeck.dailyDeck}
                templates={templates.templates}
                onSaveTemplate={handleSaveTemplate}
                onLoadTemplate={handleLoadTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onUpdateCard={handleUpdateCard}
                onEditCard={handleEditDailyDeckCard}
                onDeleteCard={handleDeleteDailyDeckCard}
              />
            </div>
          </div>
        </div>

        {modalOpen && (
          <CardModal
            card={editingCard}
            onSave={handleSaveCard}
            onClose={closeModal}
          />
        )}
      </div>
    </DragDropContext>
  );
}

function App() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthForm />;
  }

  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}

export default App;
