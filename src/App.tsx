import { useState, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import CardStack from './components/CardStack';
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import AuthForm from './components/AuthForm';
import { AppProvider, useApp } from './context';
import { useAuth } from './context/AuthContext';
import { CATEGORIES } from './constants';
import deciLogo from './assets/deci_logo.svg';
import type { Card, CategoryKey } from './types';

function AuthenticatedApp() {
  const { currentUser, logout } = useAuth();
  const app = useApp();

  const { firebase, cards, dailyDeck, templates, dragAndDrop, posthog } = app;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const openModal = useCallback((category: CategoryKey, card: Card | null = null) => {
    setSelectedCategory(category);
    setEditingCard(card);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCard(null);
    setSelectedCategory(null);
  }, []);

  const handleSaveCard = useCallback((cardData: Partial<Card>) => {
    if (!selectedCategory) return;

    if (editingCard) {
      cards.updateCard(selectedCategory, editingCard.id, cardData, posthog);
    } else {
      cards.addCard(selectedCategory, cardData, posthog);
    }
    closeModal();
  }, [editingCard, selectedCategory, cards, posthog, closeModal]);

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

  const handleUpdateCard = useCallback((index: number, updates: any) => {
    const updatedDeck = dailyDeck.dailyDeck.map((card, i) =>
      i === index ? { ...card, ...updates } : card
    );
    dailyDeck.setDailyDeck(updatedDeck);

    if (updates.completed && updates.timeSpent) {
      posthog?.capture('card_completed', {
        card_id: dailyDeck.dailyDeck[index]?.id,
        time_spent: updates.timeSpent,
        suggested_duration: dailyDeck.dailyDeck[index]?.duration,
      });
    }
  }, [dailyDeck, posthog]);

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
          <header className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <img src={deciLogo} alt="Deci" className="h-12" />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{currentUser?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Sign out
                </button>
              </div>
            </div>

            {firebase.isUsingFirebase && (
              <div className="text-xs flex items-center gap-1.5">
                {firebase.saveStatus === 'saving' && (
                  <svg className="animate-spin h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {firebase.saveStatus === 'saved' && (
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {firebase.saveStatus === 'error' && (
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={firebase.saveStatus === 'saving' ? 'text-blue-500' : firebase.saveStatus === 'saved' ? 'text-gray-600' : firebase.saveStatus === 'error' ? 'text-red-600' : 'text-gray-600'}>
                  {firebase.saveStatus === 'saving' && 'Syncing to cloud...'}
                  {firebase.saveStatus === 'saved' && 'Cloud sync enabled'}
                  {firebase.saveStatus === 'error' && 'Sync failed'}
                </span>
                {firebase.saveStatus === 'error' && (
                  <button
                    onClick={() => firebase.retrySave(cards.cards, dailyDeck.dailyDeck, templates.templates)}
                    className="underline hover:no-underline ml-1 text-red-600"
                    aria-label="Retry saving data"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </header>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 flex-1 overflow-hidden min-h-0">
            <div className="lg:col-span-8 flex flex-col min-h-0 flex-shrink-0">
              <div className="md:grid md:grid-cols-2 md:auto-rows-min md:gap-4 flex md:flex-none overflow-x-auto md:overflow-x-visible gap-4 md:gap-0 pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
                {(Object.entries(CATEGORIES) as Array<[keyof typeof CATEGORIES, typeof CATEGORIES[keyof typeof CATEGORIES]]>).map(([key, category]) => {
                  const filteredCards = cards.getAvailableCards(key, dailyDeck.dailyDeck);
                  return (
                    <div key={key} className="flex-shrink-0 w-[85vw] md:w-auto snap-start">
                      <CardStack
                        droppableId={key}
                        title={category.name}
                        cards={filteredCards}
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
