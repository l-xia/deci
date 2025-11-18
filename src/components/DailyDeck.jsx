import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';
import Timer from './Timer';
import TemplateManager from './TemplateManager';

function DailyDeckCard({ card, index, onRemove, onUpdateCard, categories, onDoubleClick }) {
  const categoryData = categories[card.sourceCategory] || { name: 'Default', color: 'bg-gray-100 border-gray-300' };
  const borderColor = categoryData.color.split(' ')[1]; // Extract border color class

  // Map category to highlight colors
  const highlightColors = {
    structure: 'bg-green-300',
    upkeep: 'bg-orange-300',
    play: 'bg-pink-300',
    default: 'bg-purple-300',
  };
  const highlightColor = highlightColors[card.sourceCategory] || 'bg-purple-300';

  // First card (index 0) shows as full square card
  const isFirstCard = index === 0;

  return (
    <Draggable draggableId={`daily-${card.id}-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={() => !snapshot.isDragging && onDoubleClick(index)}
          className={`bg-white border-2 ${borderColor} rounded-md shadow-lg transition-all mb-3 ${
            snapshot.isDragging
              ? 'shadow-2xl rotate-2 cursor-grabbing'
              : 'hover:shadow-xl cursor-grab'
          } ${isFirstCard ? 'p-6' : 'p-4'}`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {isFirstCard ? (
            // Full square card for first card
            <>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-gray-900 relative inline-block">
                    <span className="relative z-10">{card.title}</span>
                    <span className={`absolute bottom-0 left-0 right-0 h-3 ${highlightColor} opacity-50 z-0`}></span>
                  </h3>
                </div>
                {card.duration && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {card.duration} min
                  </span>
                )}
              </div>

              {card.description && (
                <p className="text-lg text-gray-700 mt-4 mb-4 whitespace-pre-line">{card.description}</p>
              )}

              <Timer
                card={card}
                onComplete={(timeSpent) => {
                  onUpdateCard(index, {
                    completed: true,
                    timeSpent,
                    completedAt: new Date().toISOString(),
                  });
                }}
              />

              {card.completed && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base">Completed in {Math.floor(card.timeSpent / 60)}:{String(card.timeSpent % 60).padStart(2, '0')}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Compact horizontal row for other cards
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 relative inline-block">
                <span className="relative z-10">{card.title}</span>
                <span className={`absolute bottom-0 left-0 right-0 h-2 ${highlightColor} opacity-50 z-0`}></span>
              </h3>
              {card.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full ml-3 flex-shrink-0">
                  {card.duration} min
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function DailyDeck({ cards, onRemoveCard, onUpdateCard, categories, templates, onSaveTemplate, onLoadTemplate, onDeleteTemplate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusedCardIndex, setFocusedCardIndex] = useState(null);

  // Handle escape key to exit focus mode
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && focusedCardIndex !== null) {
        setFocusedCardIndex(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [focusedCardIndex]);

  const handleDoubleClick = (index) => {
    setFocusedCardIndex(index);
  };

  return (
    <div className="bg-white rounded-md border-2 border-gray-200 p-4 shadow-lg flex flex-col h-[820px] overflow-hidden">
      <div className="mb-4 flex-shrink-0 flex justify-between items-start">
        <h2 className="text-2xl font-semibold text-gray-900 relative inline-block">
          <span className="relative z-10">Today</span>
          <span className="absolute bottom-0 left-0 right-0 h-2 bg-blue-300 opacity-50"></span>
        </h2>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Menu"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                <TemplateManager
                  templates={templates}
                  onSave={onSaveTemplate}
                  onLoad={(templateId) => {
                    onLoadTemplate(templateId);
                    setMenuOpen(false);
                  }}
                  onDelete={onDeleteTemplate}
                  hasDailyDeck={cards.length > 0}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Droppable droppableId="daily-deck">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto ${
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
              cards.map((card, index) => (
                <DailyDeckCard
                  key={`${card.id}-${index}`}
                  card={card}
                  index={index}
                  onRemove={onRemoveCard}
                  onUpdateCard={onUpdateCard}
                  categories={categories}
                  onDoubleClick={handleDoubleClick}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {cards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total cards:</span>
              <span className="font-medium">{cards.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-medium">{cards.filter(c => c.completed).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen focus mode overlay */}
      {focusedCardIndex !== null && cards[focusedCardIndex] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
          onClick={() => setFocusedCardIndex(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-full overflow-y-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const card = cards[focusedCardIndex];
              const categoryData = categories[card.sourceCategory] || { name: 'Default', color: 'bg-gray-100 border-gray-300' };
              const borderColor = categoryData.color.split(' ')[1];
              const highlightColors = {
                structure: 'bg-green-300',
                upkeep: 'bg-orange-300',
                play: 'bg-pink-300',
                default: 'bg-purple-300',
              };
              const highlightColor = highlightColors[card.sourceCategory] || 'bg-purple-300';

              return (
                <>
                  {/* Card content */}
                  <div className={`border-l-8 ${borderColor} pl-6`}>
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-5xl font-bold text-gray-900 relative inline-block">
                        <span className="relative z-10">{card.title}</span>
                        <span className={`absolute bottom-0 left-0 right-0 h-4 ${highlightColor} opacity-50 z-0`}></span>
                      </h2>
                      {card.duration && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 text-lg font-semibold rounded-full ml-4">
                          {card.duration} min
                        </span>
                      )}
                    </div>

                    {card.description && (
                      <p className="text-xl text-gray-700 mb-6 leading-relaxed whitespace-pre-line">{card.description}</p>
                    )}

                    <Timer
                      card={card}
                      onComplete={(timeSpent) => {
                        onUpdateCard(focusedCardIndex, {
                          completed: true,
                          timeSpent,
                          completedAt: new Date().toISOString(),
                        });
                      }}
                    />

                    {card.completed && (
                      <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center gap-3 text-green-700">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-lg font-medium">
                            Completed in {Math.floor(card.timeSpent / 60)}:{String(card.timeSpent % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyDeck;
