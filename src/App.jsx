import { useState, useEffect, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import CardStack from './components/CardStack';
import DailyDeck from './components/DailyDeck';
import CardModal from './components/CardModal';
import { storageManager } from './utils/storage';
import { debounce } from './utils/debounce';
import deciLogo from './assets/deci_logo.svg';

const CATEGORIES = {
  structure: { name: 'Structure', color: 'bg-green-100 border-green-300' },
  upkeep: { name: 'Upkeep', color: 'bg-orange-100 border-orange-300' },
  play: { name: 'Play', color: 'bg-pink-100 border-pink-300' },
  default: { name: 'Default', color: 'bg-purple-100 border-purple-300' },
};

function App() {
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

  // Create debounced save functions (500ms delay)
  const debouncedSaveCards = useMemo(
    () => debounce((data) => storageManager.save('cards', data), 500),
    []
  );

  const debouncedSaveDailyDeck = useMemo(
    () => debounce((data) => storageManager.save('dailyDeck', data), 500),
    []
  );

  const debouncedSaveTemplates = useMemo(
    () => debounce((data) => storageManager.save('templates', data), 500),
    []
  );

  // Initialize storage and load data
  useEffect(() => {
    const initStorage = async () => {
      await storageManager.initialize();

      // Load data
      const savedCards = await storageManager.load('cards');
      const savedDailyDeck = await storageManager.load('dailyDeck');
      const savedTemplates = await storageManager.load('templates');

      if (savedCards) setCards(savedCards);
      if (savedDailyDeck) setDailyDeck(savedDailyDeck);
      if (savedTemplates) setTemplates(savedTemplates);

      setStorageInitialized(true);
    };

    initStorage();
  }, []);

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
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...cardData,
      createdAt: new Date().toISOString(),
    };
    setCards({
      ...cards,
      [category]: [...cards[category], newCard],
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
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // File storage handlers
  const handleSelectSaveLocation = async () => {
    const success = await storageManager.selectSaveLocation();
    if (success) {
      // Re-save all data to the new location
      await storageManager.save('cards', cards);
      await storageManager.save('dailyDeck', dailyDeck);
      await storageManager.save('templates', templates);
      alert('Save location set! Your data will now auto-save to this file.');
    }
  };

  const handleLoadFile = async () => {
    const data = await storageManager.selectFileToLoad();
    if (data) {
      if (data.cards) setCards(data.cards);
      if (data.dailyDeck) setDailyDeck(data.dailyDeck);
      if (data.templates) setTemplates(data.templates);
      alert('Data loaded successfully!');
    }
  };

  const handleExportData = () => {
    const allData = {
      cards,
      dailyDeck,
      templates,
      exportedAt: new Date().toISOString(),
    };
    storageManager.exportAsDownload(allData);
  };

  const handleImportData = async () => {
    const data = await storageManager.importFromUpload();
    if (data) {
      if (data.cards) setCards(data.cards);
      if (data.dailyDeck) setDailyDeck(data.dailyDeck);
      if (data.templates) setTemplates(data.templates);
      alert('Data imported successfully!');
    }
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

              {/* Storage Controls */}
              <div className="flex items-center gap-2">
                {storageManager.supportsFileSystem && (
                  <>
                    <button
                      onClick={handleSelectSaveLocation}
                      className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                      title="Choose where to auto-save your data"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Set Save Location
                    </button>
                    <button
                      onClick={handleLoadFile}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                      title="Load data from a file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Load File
                    </button>
                  </>
                )}
                <button
                  onClick={handleExportData}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                  title="Download your data as a file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={handleImportData}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                  title="Import data from a file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Import
                </button>
              </div>
            </div>
            {storageManager.isUsingFileSystem() && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Auto-saving to file
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
