import { useState, useEffect, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { usePostHog } from 'posthog-js/react';
import CardStack from './components/CardStack';
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import { firebaseStorage } from './utils/firebaseStorage';
import { debounce } from './utils/debounce';
import deciLogo from './assets/deci_logo.svg';

const CATEGORIES = {
  structure: { name: 'Structure', color: 'bg-green-100 border-green-300' },
  upkeep: { name: 'Upkeep', color: 'bg-orange-100 border-orange-300' },
  play: { name: 'Play', color: 'bg-pink-100 border-pink-300' },
  default: { name: 'Default', color: 'bg-purple-100 border-purple-300' },
};

function App() {
  const posthog = usePostHog();

  const [cards, setCards] = useState({
    structure: [],
    upkeep: [],
    play: [],
    default: [],
  });

  const [dailyDeck, setDailyDeck] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [storageInitialized, setStorageInitialized] = useState(false);

  // Save status tracking
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [saveError, setSaveError] = useState(null);

  // Create debounced save functions with error handling (500ms delay)
  const debouncedSaveCards = useMemo(
    () => debounce(async (data) => {
      setSaveStatus('saving');
      const result = await firebaseStorage.save('cards', data);
      if (result.success) {
        setSaveStatus('saved');
        setSaveError(null);
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
        console.error('Failed to save cards:', result.error);
      }
    }, 500),
    []
  );

  const debouncedSaveDailyDeck = useMemo(
    () => debounce(async (data) => {
      setSaveStatus('saving');
      const result = await firebaseStorage.save('dailyDeck', data);
      if (result.success) {
        setSaveStatus('saved');
        setSaveError(null);
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
        console.error('Failed to save daily deck:', result.error);
      }
    }, 500),
    []
  );

  const debouncedSaveTemplates = useMemo(
    () => debounce(async (data) => {
      setSaveStatus('saving');
      const result = await firebaseStorage.save('templates', data);
      if (result.success) {
        setSaveStatus('saved');
        setSaveError(null);
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
        console.error('Failed to save templates:', result.error);
      }
    }, 500),
    []
  );

  // Initialize storage and load data with error handling
  useEffect(() => {
    const initStorage = async () => {
      try {
        const success = await firebaseStorage.initialize();

        if (success) {
          // Load data from Firebase with error handling
          const cardsResult = await firebaseStorage.load('cards');
          const dailyDeckResult = await firebaseStorage.load('dailyDeck');
          const templatesResult = await firebaseStorage.load('templates');

          // Handle successful loads
          if (cardsResult.success && cardsResult.data) {
            setCards(cardsResult.data);
          } else if (!cardsResult.success) {
            console.error('Failed to load cards:', cardsResult.error);
            posthog.capture('data_load_error', { key: 'cards', error: cardsResult.error?.message });
          }

          if (dailyDeckResult.success && dailyDeckResult.data) {
            setDailyDeck(dailyDeckResult.data);
          } else if (!dailyDeckResult.success) {
            console.error('Failed to load daily deck:', dailyDeckResult.error);
            posthog.capture('data_load_error', { key: 'dailyDeck', error: dailyDeckResult.error?.message });
          }

          if (templatesResult.success && templatesResult.data) {
            setTemplates(templatesResult.data);
          } else if (!templatesResult.success) {
            console.error('Failed to load templates:', templatesResult.error);
            posthog.capture('data_load_error', { key: 'templates', error: templatesResult.error?.message });
          }

          setStorageInitialized(true);

          // Send initial app loaded event to verify PostHog is working
          posthog.capture('app_loaded', {
            storage_type: 'firebase',
            user_id: firebaseStorage.getUserId(),
            has_saved_data: !!(cardsResult.data || dailyDeckResult.data || templatesResult.data),
            total_cards: Object.values(cardsResult.data || {}).flat().length,
            daily_deck_size: dailyDeckResult.data?.length || 0,
            templates_count: templatesResult.data?.length || 0,
            offline_persistence_enabled: firebaseStorage.offlinePersistenceEnabled,
          });
        } else {
          const error = firebaseStorage.getLastError();
          console.error('Failed to initialize Firebase:', error);
          posthog.capture('firebase_init_error', { error: error?.message });
          alert('Failed to connect to Firebase. The app will not save your data. Please refresh the page or check your internet connection.');
        }
      } catch (error) {
        console.error('Unexpected error during initialization:', error);
        posthog.capture('app_init_error', { error: error.message });
        alert('An unexpected error occurred. Please refresh the page.');
      }
    };

    initStorage();
  }, [posthog]);

  // Auto-save to file or localStorage whenever state changes (debounced)
  useEffect(() => {
    if (storageInitialized) {
      debouncedSaveCards(cards);
    }
  }, [cards, storageInitialized, debouncedSaveCards]);

  useEffect(() => {
    if (storageInitialized) {
      debouncedSaveDailyDeck(dailyDeck);
    }
  }, [dailyDeck, storageInitialized, debouncedSaveDailyDeck]);

  useEffect(() => {
    if (storageInitialized) {
      debouncedSaveTemplates(templates);
    }
  }, [templates, storageInitialized, debouncedSaveTemplates]);

  // Cleanup: Cancel all pending debounced operations on unmount
  useEffect(() => {
    return () => {
      if (debouncedSaveCards?.cancel) debouncedSaveCards.cancel();
      if (debouncedSaveDailyDeck?.cancel) debouncedSaveDailyDeck.cancel();
      if (debouncedSaveTemplates?.cancel) debouncedSaveTemplates.cancel();
    };
  }, [debouncedSaveCards, debouncedSaveDailyDeck, debouncedSaveTemplates]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Extract actual card ID (remove 'daily-' prefix and index suffix if present)
    const actualCardId = draggableId.startsWith('daily-')
      ? draggableId.replace(/^daily-/, '').replace(/-\d+$/, '')
      : draggableId;

    // Moving from category to daily deck
    if (source.droppableId.startsWith('category-') && destination.droppableId === 'daily-deck') {
      const category = source.droppableId.replace('category-', '');
      const card = cards[category].find(c => c.id === actualCardId);

      // Check recurrence limits
      const timesInDeck = dailyDeck.filter(c => c.id === actualCardId).length;
      const recurrenceType = card.recurrenceType || 'always';

      if (recurrenceType === 'once' && timesInDeck > 0) {
        return; // Already in deck, can't add again
      }

      if (recurrenceType === 'limited') {
        const maxUses = card.maxUses || 1;
        if (timesInDeck >= maxUses) {
          return; // Hit the limit
        }
      }

      const newDailyDeck = Array.from(dailyDeck);
      newDailyDeck.splice(destination.index, 0, { ...card, sourceCategory: category });
      setDailyDeck(newDailyDeck);

      // Update timesUsed for the card
      const newCards = { ...cards };
      newCards[category] = newCards[category].map(c =>
        c.id === actualCardId ? { ...c, timesUsed: (c.timesUsed || 0) + 1 } : c
      );
      setCards(newCards);
    }

    // Moving from daily deck back to any category (removes from daily deck)
    else if (source.droppableId === 'daily-deck' && destination.droppableId.startsWith('category-')) {
      const removedCard = dailyDeck[source.index];
      const newDailyDeck = Array.from(dailyDeck);
      newDailyDeck.splice(source.index, 1);
      setDailyDeck(newDailyDeck);

      // Decrement timesUsed for the card
      const category = removedCard.sourceCategory;
      const newCards = { ...cards };
      newCards[category] = newCards[category].map(c =>
        c.id === removedCard.id ? { ...c, timesUsed: Math.max(0, (c.timesUsed || 0) - 1) } : c
      );
      setCards(newCards);
    }

    // Moving between categories
    else if (source.droppableId.startsWith('category-') && destination.droppableId.startsWith('category-')) {
      const sourceCategory = source.droppableId.replace('category-', '');
      const destCategory = destination.droppableId.replace('category-', '');

      if (sourceCategory === destCategory) {
        // Reordering within same category
        const newCards = Array.from(cards[sourceCategory]);
        const [moved] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, moved);

        setCards({
          ...cards,
          [sourceCategory]: newCards,
        });
      } else {
        // Moving to different category
        const sourceCards = Array.from(cards[sourceCategory]);
        const destCards = Array.from(cards[destCategory]);
        const [moved] = sourceCards.splice(source.index, 1);
        destCards.splice(destination.index, 0, moved);

        setCards({
          ...cards,
          [sourceCategory]: sourceCards,
          [destCategory]: destCards,
        });

        // Update in daily deck if present
        setDailyDeck(dailyDeck.map(c =>
          c.id === actualCardId ? { ...c, sourceCategory: destCategory } : c
        ));
      }
    }

    // Reordering within daily deck
    else if (source.droppableId === 'daily-deck' && destination.droppableId === 'daily-deck') {
      const newDailyDeck = Array.from(dailyDeck);
      const [moved] = newDailyDeck.splice(source.index, 1);
      newDailyDeck.splice(destination.index, 0, moved);
      setDailyDeck(newDailyDeck);
    }
  };

  const addCard = (category, cardData) => {
    const newCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      ...cardData,
      createdAt: new Date().toISOString(),
    };
    setCards({
      ...cards,
      [category]: [...cards[category], newCard],
    });

    // Track card creation in PostHog
    posthog.capture('card_created', {
      card_id: newCard.id,
      category: category,
      category_name: CATEGORIES[category]?.name,
      has_description: !!cardData.description,
      has_duration: !!cardData.duration,
      duration_minutes: cardData.duration || null,
      recurrence_type: cardData.recurrenceType || 'always',
      max_uses: cardData.maxUses || null,
      title_length: cardData.title?.length || 0,
      description_length: cardData.description?.length || 0,
      total_cards_in_category: cards[category].length + 1,
      timestamp: newCard.createdAt,
    });
  };

  const updateCard = (category, cardId, cardData) => {
    setCards({
      ...cards,
      [category]: cards[category].map(c =>
        c.id === cardId ? { ...c, ...cardData } : c
      ),
    });

    // Update in daily deck if present
    setDailyDeck(dailyDeck.map(c =>
      c.id === cardId ? { ...c, ...cardData } : c
    ));
  };

  const deleteCard = (category, cardId) => {
    setCards({
      ...cards,
      [category]: cards[category].filter(c => c.id !== cardId),
    });

    // Remove from daily deck if present
    setDailyDeck(dailyDeck.filter(c => c.id !== cardId));
  };

  const removeFromDailyDeck = (index) => {
    const newDailyDeck = Array.from(dailyDeck);
    newDailyDeck.splice(index, 1);
    setDailyDeck(newDailyDeck);
  };

  const updateDailyDeckCard = (index, updates) => {
    const newDailyDeck = Array.from(dailyDeck);
    newDailyDeck[index] = { ...newDailyDeck[index], ...updates };
    setDailyDeck(newDailyDeck);
  };

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

  const saveTemplate = (name) => {
    const newTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name,
      cards: dailyDeck.map(card => ({
        id: card.id,
        sourceCategory: card.sourceCategory,
      })),
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
  };

  const loadTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const loadedCards = template.cards
      .map(templateCard => {
        const category = templateCard.sourceCategory;
        const card = cards[category]?.find(c => c.id === templateCard.id);
        return card ? { ...card, sourceCategory: category } : null;
      })
      .filter(Boolean);

    setDailyDeck(loadedCards);
  };

  const deleteTemplate = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };


  // Show loading state while initializing
  if (!storageInitialized) {
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
          <header className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <img src={deciLogo} alt="Deci" className="h-12" />
              {/* Save status indicator */}
              {firebaseStorage.isUsingFirebase() && (
                <div className="flex items-center gap-2">
                  {saveStatus === 'saving' && (
                    <div className="text-xs text-blue-600 flex items-center gap-1" role="status" aria-live="polite">
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  )}
                  {saveStatus === 'saved' && (
                    <div className="text-xs text-green-600 flex items-center gap-1" role="status" aria-live="polite">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Saved
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="text-xs text-red-600 flex items-center gap-1" role="alert" aria-live="assertive">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Save failed</span>
                      <button
                        onClick={() => {
                          // Retry save by triggering re-save
                          debouncedSaveCards(cards);
                          debouncedSaveDailyDeck(dailyDeck);
                          debouncedSaveTemplates(templates);
                        }}
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
            {firebaseStorage.isUsingFirebase() && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Cloud sync enabled{firebaseStorage.offlinePersistenceEnabled ? ' • Offline mode available' : ''}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
            {/* Category Stacks - Left Side (2/3 = 8 columns) */}
            <div className="lg:col-span-8 flex flex-col h-full">
              <div className="grid grid-cols-2 auto-rows-min gap-4">
                {Object.entries(CATEGORIES).map(([key, category]) => {
                  // Filter out cards that have reached their daily limit
                  const filteredCards = cards[key].filter(card => {
                    if (card.recurrenceType === 'once') {
                      // Check if this card is in the daily deck
                      const isInDailyDeck = dailyDeck.some(deckCard => deckCard.id === card.id);
                      return !isInDailyDeck; // Hide if in daily deck
                    }

                    if (card.recurrenceType === 'limited') {
                      // Check how many times this card is in the daily deck
                      const timesInDeck = dailyDeck.filter(deckCard => deckCard.id === card.id).length;
                      const maxUses = card.maxUses || 1;
                      return timesInDeck < maxUses; // Hide if max uses reached
                    }

                    return true; // Show all other cards (including 'always')
                  });

                  return (
                    <CardStack
                      key={key}
                      categoryKey={key}
                      category={category}
                      cards={filteredCards}
                      onAddCard={() => openModal(key)}
                      onEditCard={(card) => openModal(key, card)}
                      onDeleteCard={(cardId) => deleteCard(key, cardId)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Daily Deck - Right Side (1/3 = 4 columns) */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
              <DailyDeck
                cards={dailyDeck}
                onRemoveCard={removeFromDailyDeck}
                onUpdateCard={updateDailyDeckCard}
                categories={CATEGORIES}
                templates={templates}
                onSaveTemplate={saveTemplate}
                onLoadTemplate={loadTemplate}
                onDeleteTemplate={deleteTemplate}
              />
            </div>
          </div>
        </div>

        {modalOpen && (
          <CardModal
            category={selectedCategory}
            card={editingCard}
            onSave={(cardData) => {
              if (editingCard) {
                updateCard(selectedCategory, editingCard.id, cardData);
              } else {
                addCard(selectedCategory, cardData);
              }
              closeModal();
            }}
            onClose={closeModal}
          />
        )}
      </div>
    </DragDropContext>
  );
}

export default App;
