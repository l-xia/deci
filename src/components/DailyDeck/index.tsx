import { Droppable } from '@hello-pangea/dnd';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Card, Template } from '../../types';
import DailyDeckCard from './DailyDeckCard';
import DailyDeckHeader from './DailyDeckHeader';
import DailyDeckStats from './DailyDeckStats';
import DailyDeckFullscreenModal from './DailyDeckFullscreenModal';

interface DailyDeckProps {
  cards: Card[];
  onUpdateCard: (index: number, updates: Partial<Card>) => void;
  onEditCard: (index: number) => void;
  onOneTimeEditCard: (index: number) => void;
  onReturnToStack?: (index: number) => void;
  templates: Template[];
  onSaveTemplate: (name: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onCompleteDay?: () => void;
}

function DailyDeck({
  cards,
  onUpdateCard,
  onEditCard,
  onOneTimeEditCard,
  onReturnToStack,
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onCompleteDay,
}: DailyDeckProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [manuallyExpandedIndex, setManuallyExpandedIndex] = useState<number | null>(null);

  const firstIncompleteIndex = useMemo(() =>
    cards.findIndex(c => !c.completed),
    [cards]
  );

  const expandedCardIndex = manuallyExpandedIndex ?? firstIncompleteIndex;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedCardIndex !== null) {
        setFocusedCardIndex(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [focusedCardIndex]);

  const handleDoubleClick = useCallback((index: number) => {
    setFocusedCardIndex(index);
  }, []);

  return (
    <>
      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Main container */}
      <div
        className={`
          bg-white rounded-t-md border-2 border-gray-200 shadow-lg flex flex-col
          transition-all duration-300 ease-in-out
          ${drawerOpen
            ? 'fixed bottom-0 left-0 right-0 z-50 h-[85vh] rounded-b-none overflow-hidden'
            : 'relative h-[55vh] overflow-hidden'}
          lg:relative lg:h-[85vh] lg:p-2 lg:overflow-hidden lg:static lg:translate-y-0
        `}
      >
        {/* Mobile drawer toggle */}
        <button
          className="lg:hidden flex justify-center overflow-auto max-h-[10vh] items-center pt-2 pb-1 cursor-pointer flex-shrink-0 hover:bg-gray-50 transition-colors"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? 'Close drawer' : 'Open drawer'}
        >
          <ChevronDownIcon
            className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${drawerOpen ? '' : 'rotate-180'}`}
          />
        </button>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 min-h-0 lg:flex">
          <DailyDeckHeader
            menuOpen={menuOpen}
            onMenuToggle={() => setMenuOpen(!menuOpen)}
            onMenuClose={() => setMenuOpen(false)}
            templates={templates}
            onSaveTemplate={onSaveTemplate}
            onLoadTemplate={onLoadTemplate}
            onDeleteTemplate={onDeleteTemplate}
            hasDailyDeck={cards.length > 0}
            onCompleteDay={onCompleteDay}
          />

          {/* Card list */}
          <Droppable droppableId="daily-deck">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
                }`}
              >
                {cards.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Drag cards here to build your daily deck
                    </p>
                  </div>
                ) : (
                  cards.map((card: Card, index: number) => {
                    const isFirstIncomplete = index === firstIncompleteIndex;
                    const isExpanded = expandedCardIndex === index;

                    return (
                      <DailyDeckCard
                        key={`daily-${card.id}-${index}`}
                        card={card}
                        index={index}
                        isFirstIncomplete={isFirstIncomplete}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => setManuallyExpandedIndex(isExpanded ? null : index)}
                        onUpdateCard={onUpdateCard}
                        onEditCard={onEditCard}
                        onOneTimeEdit={onOneTimeEditCard}
                        {...(onReturnToStack && { onReturnToStack })}
                        onDoubleClick={handleDoubleClick}
                      />
                    );
                  })
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Stats */}
          <DailyDeckStats cards={cards} />
        </div>
      </div>

      {/* Fullscreen modal */}
      {focusedCardIndex !== null && cards[focusedCardIndex] && (
        <DailyDeckFullscreenModal
          card={cards[focusedCardIndex]}
          cardIndex={focusedCardIndex}
          onClose={() => setFocusedCardIndex(null)}
          onUpdateCard={onUpdateCard}
        />
      )}
    </>
  );
}

export default DailyDeck;
