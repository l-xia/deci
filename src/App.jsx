/**
 * Main App Component - Refactored to use Context API
 * Simplified from 422 lines to ~150 lines by extracting logic to hooks and context
 */

import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import CardStack from './components/CardStack';
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import { useApp } from './context';
import { CATEGORIES } from './constants';
import deciLogo from './assets/deci_logo.svg';

function App() {
  const {
    // Firebase
    firebase,
    // Cards
    cards,
    addCard,
    updateCard,
    deleteCard,
    getAvailableCards,
    // Daily Deck
    dailyDeck,
    removeCardById,
    // Templates
    templates,
    saveTemplate,
    loadFromTemplate,
    deleteTemplate,
    // Drag and Drop
    onDragEnd,
    // PostHog
    posthog,
  } = useApp();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal handlers
  const openModal = (category, card = null) => {
    setSelectedCategory(category);
    setEditingCard(card);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCard(null);
    setSelectedCategory(null);
  };

  const handleSaveCard = (cardData) => {
    if (editingCard) {
      updateCard(selectedCategory, editingCard.id, cardData, posthog);
    } else {
      addCard(selectedCategory, cardData, posthog);
    }
    closeModal();
  };

  const handleDeleteCard = (category, cardId) => {
    if (confirm('Delete this card? This will also remove it from your daily deck.')) {
      deleteCard(category, cardId, posthog);
      removeCardById(cardId, posthog);
    }
  };

  // Show loading state while initializing
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 flex flex-col">
        <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col">
          {/* Header */}
          <header className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <img src={deciLogo} alt="Deci" className="h-12" />

              {/* Save status indicator */}
              {firebase.isUsingFirebase && (
                <div className="flex items-center gap-2">
                  {firebase.saveStatus === 'saving' && (
                    <div className="text-xs text-blue-600 flex items-center gap-1" role="status" aria-live="polite">
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  )}
                  {firebase.saveStatus === 'saved' && (
                    <div className="text-xs text-green-600 flex items-center gap-1" role="status" aria-live="polite">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Saved
                    </div>
                  )}
                  {firebase.saveStatus === 'error' && (
                    <div className="text-xs text-red-600 flex items-center gap-1" role="alert" aria-live="assertive">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Save failed</span>
                      <button
                        onClick={() => firebase.retrySave(cards, dailyDeck, templates)}
                        className="underline hover:no-underline"
                        aria-label="Retry saving data"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {firebase.isUsingFirebase && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Cloud sync enabled{firebase.offlinePersistenceEnabled ? ' • Offline mode available' : ''}
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
            {/* Category Stacks - Left Side */}
            <div className="lg:col-span-8 flex flex-col h-full">
              <div className="grid grid-cols-2 auto-rows-min gap-4">
                {Object.entries(CATEGORIES).map(([key, category]) => {
                  const filteredCards = getAvailableCards(key, dailyDeck);
                  return (
                    <CardStack
                      key={key}
                      droppableId={key}
                      title={category.name}
                      cards={filteredCards}
                      color={category.color}
                      onAddCard={() => openModal(key)}
                      onEditCard={(card) => openModal(key, card)}
                      onDeleteCard={(cardId) => handleDeleteCard(key, cardId)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Daily Deck - Right Side */}
            <div className="lg:col-span-4">
              <DailyDeck
                cards={dailyDeck}
                categories={CATEGORIES}
                templates={templates}
                onSaveTemplate={saveTemplate}
                onLoadTemplate={loadFromTemplate}
                onDeleteTemplate={deleteTemplate}
              />
            </div>
          </div>
        </div>

        {/* Card Modal */}
        {modalOpen && (
          <CardModal
            category={selectedCategory}
            card={editingCard}
            onSave={handleSaveCard}
            onClose={closeModal}
          />
        )}
      </div>
    </DragDropContext>
  );
}

export default App;
