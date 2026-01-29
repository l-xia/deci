import { useState, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { addDays, parseISO } from 'date-fns';

/** Delay for scroll animation after completing a card */
const SCROLL_ANIMATION_DELAY_MS = 300;
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import { DayCompletionModal } from './components/DayCompletionModal';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import AuthForm from './components/AuthForm';
import { AppHeader } from './components/AppHeader';
import {
  AppProvider,
  useCardsContext,
  useDailyDeckContext,
  useTemplatesContext,
  useDayCompletionContext,
  useSyncContext,
} from './context';
import { useAuth } from './context';
import {
  isCategoryKey,
  isCardsByCategory,
  isCardArray,
  isTemplateArray,
} from './utils/typeGuards';
import { useCardModal } from './hooks/useCardModal';
import {
  reorderDeckOnComplete,
  reorderDeckOnIncomplete,
} from './utils/deckOperations';
import { CardStacksSection } from './components/CardStacks/CardStacksSection';
import type { Card, CategoryKey } from './types';
import type { DayCompletionSummary, UserStreak } from './types/dayCompletion';

function AuthenticatedApp() {
  const { currentUser, logout } = useAuth();
  const { firebase } = useSyncContext();
  const cards = useCardsContext();
  const dailyDeck = useDailyDeckContext();
  const templates = useTemplatesContext();
  const dayCompletion = useDayCompletionContext();
  const { dragAndDrop } = dailyDeck; // dragAndDrop is now part of dailyDeck context

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDayCompletionModal, setShowDayCompletionModal] = useState(false);
  const [showTemplatePickerModal, setShowTemplatePickerModal] = useState(false);
  const [completionData, setCompletionData] = useState<{
    summary: DayCompletionSummary;
    streak: UserStreak;
  } | null>(null);

  const {
    modalOpen,
    editingCard,
    selectedCategory,
    editingDailyDeckIndex,
    isOneTimeEdit,
    openModal,
    openDailyDeckCardModal,
    openOneTimeEditModal,
    closeModal,
  } = useCardModal();

  const handleSaveCard = useCallback(
    (cardData: Partial<Card>) => {
      if (editingDailyDeckIndex !== null) {
        // Update daily deck instance
        const updatedCard = {
          ...dailyDeck.dailyDeck[editingDailyDeckIndex],
          ...cardData,
        } as Card;
        const updatedDeck = [...dailyDeck.dailyDeck];
        updatedDeck[editingDailyDeckIndex] = updatedCard;
        dailyDeck.setDailyDeck(updatedDeck);

        // Track deck edit
        dailyDeck.setDeckLastEditedDate(new Date().toISOString());

        // Only update source card if NOT one-time edit
        if (!isOneTimeEdit) {
          const sourceCategory = updatedCard.sourceCategory;
          if (sourceCategory && isCategoryKey(sourceCategory)) {
            cards.updateCard(sourceCategory, updatedCard.id, cardData);
          }
        }
      } else if (selectedCategory && !isOneTimeEdit) {
        // Normal stack card editing
        if (editingCard) {
          cards.updateCard(selectedCategory, editingCard.id, cardData);
        } else {
          cards.addCard(selectedCategory, cardData);
        }
      }
      closeModal();
    },
    [
      editingCard,
      selectedCategory,
      editingDailyDeckIndex,
      isOneTimeEdit,
      cards,
      dailyDeck,
      closeModal,
    ]
  );

  const handleDeleteCard = useCallback(
    (category: CategoryKey, cardId: string) => {
      if (
        confirm(
          'Delete this card? This will also remove it from your daily deck if present.'
        )
      ) {
        cards.deleteCard(category, cardId);
        dailyDeck.removeCardById(cardId);
      }
    },
    [cards, dailyDeck]
  );

  const handleArchiveCard = useCallback(
    (category: CategoryKey, cardId: string) => {
      cards.archiveCard(category, cardId);
      dailyDeck.removeCardById(cardId);
    },
    [cards, dailyDeck]
  );

  const handleSaveTemplate = useCallback(
    (name: string) => {
      templates.saveTemplate(name, dailyDeck.dailyDeck);
    },
    [templates, dailyDeck.dailyDeck]
  );

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      const template = templates.getTemplate(templateId);
      if (template) {
        dailyDeck.loadFromTemplate(template.cards, cards.cards);
      }
    },
    [templates, dailyDeck, cards.cards]
  );

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      templates.deleteTemplate(templateId);
    },
    [templates]
  );

  const handleArchiveTemplate = useCallback(
    (templateId: string) => {
      templates.archiveTemplate(templateId);
    },
    [templates]
  );

  const handleCompleteDay = useCallback(() => {
    const result = dayCompletion.completeDay(dailyDeck.dailyDeck);
    setCompletionData({
      summary: result.completion.summary,
      streak: result.streak,
    });
    setShowDayCompletionModal(true);

    // Advance deck date by one day (yesterday's deck → today, today's deck → tomorrow)
    const currentDeckDate = dailyDeck.deckDate
      ? parseISO(dailyDeck.deckDate)
      : new Date();
    dailyDeck.setDeckDate(addDays(currentDeckDate, 1).toISOString());

    // Clear last edited date since we're moving to a new day
    dailyDeck.setDeckLastEditedDate(null);

    // Flush pending saves immediately to ensure day completion is saved
    firebase.flushPendingSaves();
  }, [dayCompletion, dailyDeck, firebase]);

  const handleResetToToday = useCallback(() => {
    dailyDeck.setDeckDate(new Date().toISOString());
  }, [dailyDeck]);

  const scrollToNextIncompleteCard = useCallback(() => {
    setTimeout(() => {
      const nextIncompleteElement = document.querySelector(
        '[data-card-incomplete="true"]'
      );
      if (nextIncompleteElement) {
        nextIncompleteElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, SCROLL_ANIMATION_DELAY_MS);
  }, []);

  const handleMarkCardComplete = useCallback(
    (index: number, card: Card, updates: Partial<Card>) => {
      const updatedCard = { ...card, ...updates };
      const { newDeck } = reorderDeckOnComplete(
        dailyDeck.dailyDeck,
        index,
        updatedCard
      );
      dailyDeck.setDailyDeck(newDeck);

      scrollToNextIncompleteCard();
    },
    [dailyDeck, scrollToNextIncompleteCard]
  );

  const handleRegularCardUpdate = useCallback(
    (index: number, updatedCard: Card) => {
      const updatedDeck = dailyDeck.dailyDeck.map((c, i) =>
        i === index ? updatedCard : c
      );
      dailyDeck.setDailyDeck(updatedDeck);
    },
    [dailyDeck]
  );

  const handleMarkCardIncomplete = useCallback(
    (index: number, card: Card, updates: Partial<Card>) => {
      // Remove completion-related fields
      const { ...cardWithoutCompletionFields } = card;
      const updatedCard = { ...cardWithoutCompletionFields, ...updates };

      const { newDeck } = reorderDeckOnIncomplete(
        dailyDeck.dailyDeck,
        index,
        updatedCard
      );
      dailyDeck.setDailyDeck(newDeck);
    },
    [dailyDeck]
  );

  const handleUpdateCard = useCallback(
    (index: number, updates: Partial<Card>) => {
      const card = dailyDeck.dailyDeck[index];
      if (!card) return;

      const updatedCard = { ...card, ...updates };

      // Track deck edit
      dailyDeck.setDeckLastEditedDate(new Date().toISOString());

      // If marking as complete, reorder the deck
      if (updates.completed && !card.completed) {
        handleMarkCardComplete(index, card, updates);
      } else if (updates.completed === false && card.completed) {
        // If marking as incomplete, reorder the deck
        handleMarkCardIncomplete(index, card, updates);
      } else {
        handleRegularCardUpdate(index, updatedCard);
      }
    },
    [
      dailyDeck,
      handleMarkCardComplete,
      handleMarkCardIncomplete,
      handleRegularCardUpdate,
    ]
  );

  const handleEditDailyDeckCard = useCallback(
    (index: number) => {
      const card = dailyDeck.dailyDeck[index];
      if (card) {
        openDailyDeckCardModal(card, index);
      }
    },
    [dailyDeck.dailyDeck, openDailyDeckCardModal]
  );

  const handleOneTimeEditDailyDeckCard = useCallback(
    (index: number) => {
      const card = dailyDeck.dailyDeck[index];
      if (card) {
        openOneTimeEditModal(card, index);
      }
    },
    [dailyDeck.dailyDeck, openOneTimeEditModal]
  );

  const handleReturnToStack = useCallback(
    (index: number) => {
      const card = dailyDeck.dailyDeck[index];
      if (card) {
        // Clear daily note and timer state when returning card to stack
        if (card.sourceCategory && isCategoryKey(card.sourceCategory)) {
          const updates: Partial<Card> = {};
          if (card.dailyNote) updates.dailyNote = '';
          if (card.timerState)
            updates.timerState = { accumulatedSeconds: 0, isPaused: true };

          if (Object.keys(updates).length > 0) {
            cards.updateCard(card.sourceCategory, card.id, updates);
          }
        }

        dailyDeck.removeCardByIndex(index);
      }
    },
    [dailyDeck, cards]
  );

  const handleRefresh = useCallback(async () => {
    if (!firebase.initialized || isRefreshing) return;

    setIsRefreshing(true);
    try {
      const result = await firebase.loadData();

      // Validate loaded data with runtime type guards
      if (result.cards && isCardsByCategory(result.cards)) {
        cards.setCards(result.cards);
      } else if (result.cards) {
        console.error('Invalid cards data structure received from Firebase');
      }

      if (result.dailyDeck && isCardArray(result.dailyDeck)) {
        dailyDeck.setDailyDeck(result.dailyDeck);
      } else if (result.dailyDeck) {
        console.error(
          'Invalid daily deck data structure received from Firebase'
        );
      }

      if (result.templates && isTemplateArray(result.templates)) {
        templates.setTemplates(result.templates);
      } else if (result.templates) {
        console.error(
          'Invalid templates data structure received from Firebase'
        );
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [firebase, cards, dailyDeck, templates, isRefreshing]);

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
            onRetrySave={() =>
              firebase.retrySave(
                cards.cards,
                dailyDeck.dailyDeck,
                templates.templates
              )
            }
          />

          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 flex-1 overflow-hidden min-h-0">
            <div className="md:col-span-8 flex flex-col min-h-0 max-h-[40vh] md:max-h-none overflow-hidden md:overflow-y-auto">
              <CardStacksSection
                dailyDeck={dailyDeck.dailyDeck}
                getAvailableCards={cards.getAvailableCards}
                onAddCard={openModal}
                onEditCard={(category, card) => openModal(category, card)}
                onArchiveCard={handleArchiveCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>

            <div className="md:col-span-4 flex flex-col min-h-0 flex-1">
              <DailyDeck
                cards={dailyDeck.dailyDeck}
                templates={templates.templates}
                onSaveTemplate={handleSaveTemplate}
                onLoadTemplate={handleLoadTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onArchiveTemplate={handleArchiveTemplate}
                onResetToToday={handleResetToToday}
                onUpdateCard={handleUpdateCard}
                onEditCard={handleEditDailyDeckCard}
                onOneTimeEditCard={handleOneTimeEditDailyDeckCard}
                onReturnToStack={handleReturnToStack}
                onCompleteDay={handleCompleteDay}
                deckDate={dailyDeck.deckDate}
                deckLastEditedDate={dailyDeck.deckLastEditedDate}
              />
            </div>
          </div>
        </div>

        {modalOpen && (
          <CardModal
            card={editingCard}
            isOneTimeEdit={isOneTimeEdit}
            onSave={handleSaveCard}
            onClose={closeModal}
          />
        )}

        {showDayCompletionModal && completionData && (
          <DayCompletionModal
            summary={completionData.summary}
            streak={completionData.streak}
            onClose={() => setShowDayCompletionModal(false)}
            onStartNewDay={() => {
              setShowDayCompletionModal(false);
              if (templates.templates.length > 0) {
                setShowTemplatePickerModal(true);
              } else {
                dailyDeck.setDailyDeck([]);
                // Deck date already set to tomorrow in handleCompleteDay
              }
            }}
          />
        )}

        {showTemplatePickerModal && (
          <TemplatePickerModal
            templates={templates.templates}
            onSelectTemplate={(templateId) => {
              handleLoadTemplate(templateId);
              setShowTemplatePickerModal(false);
            }}
            onSkip={() => {
              dailyDeck.setDailyDeck([]);
              setShowTemplatePickerModal(false);
              // Deck date already set to tomorrow in handleCompleteDay
            }}
            onClose={() => setShowTemplatePickerModal(false)}
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
