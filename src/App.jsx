/**
 * Main App Component - Refactored to use Context API
 * Simplified from 422 lines to ~150 lines by extracting logic to hooks and context
 */

import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import CardStack from './components/CardStack';
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import AuthForm from './components/AuthForm';
import { AppProvider, useApp } from './context';
import { useAuth } from './context/AuthContext';
import { CATEGORIES } from './constants';
import deciLogo from './assets/deci_logo.svg';

function AuthenticatedApp() {
  const { currentUser, logout } = useAuth();
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

              {/* User info and logout */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{currentUser.email}</span>
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
                  {firebase.offlinePersistenceEnabled && firebase.saveStatus === 'saved' && (
                    <span className="text-gray-500"> • Offline mode active</span>
                  )}
                </span>
                {firebase.saveStatus === 'error' && (
                  <button
                    onClick={() => firebase.retrySave(cards, dailyDeck, templates)}
                    className="underline hover:no-underline ml-1 text-red-600"
                    aria-label="Retry saving data"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
            {/* Category Stacks - Left Side */}
            <div className="lg:col-span-8 flex flex-col h-full">
              {/* Mobile: Horizontal scroll, Desktop: 2x2 grid */}
              <div className="md:grid md:grid-cols-2 md:auto-rows-min md:gap-4 flex md:flex-none overflow-x-auto md:overflow-x-visible gap-4 md:gap-0 pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
                {Object.entries(CATEGORIES).map(([key, category]) => {
                  const filteredCards = getAvailableCards(key, dailyDeck);
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

function App() {
  const { currentUser } = useAuth();

  // Show auth form if not logged in
  if (!currentUser) {
    return <AuthForm />;
  }

  // Wrap authenticated app with AppProvider
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}

export default App;
