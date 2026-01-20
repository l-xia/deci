import { Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  TrashIcon,
  ArchiveBoxArrowDownIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import {
  useTemplatesContext,
  useCardsContext,
  useDailyDeckContext,
} from '../context';
import type { Template, CategoryKey } from '../types';
import { getCategoryColors } from '../utils/categories';

export default function ArchivePage() {
  const templates = useTemplatesContext();
  const cards = useCardsContext();
  const dailyDeck = useDailyDeckContext();

  const archivedTemplates = templates.getArchivedTemplates();
  const archivedCards = cards.getArchivedCards();

  const handleUnarchiveTemplate = (templateId: string) => {
    templates.unarchiveTemplate(templateId);
  };

  const handlePermanentDeleteTemplate = (
    templateId: string,
    templateName: string
  ) => {
    if (
      confirm(
        `Permanently delete template "${templateName}"? This cannot be undone.`
      )
    ) {
      templates.deleteTemplate(templateId);
    }
  };

  const handleLoadTemplate = (template: Template) => {
    dailyDeck.loadFromTemplate(template.cards, cards.cards);
  };

  const handleUnarchiveCard = (category: CategoryKey, cardId: string) => {
    cards.unarchiveCard(category, cardId);
  };

  const handlePermanentDeleteCard = (
    category: CategoryKey,
    cardId: string,
    cardTitle: string
  ) => {
    if (
      confirm(`Permanently delete card "${cardTitle}"? This cannot be undone.`)
    ) {
      cards.deleteCard(category, cardId);
    }
  };

  const hasArchivedItems =
    archivedTemplates.length > 0 || archivedCards.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-white rounded-md transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Archive</h1>
            <p className="text-gray-600 mt-1">
              View and manage your archived cards and templates
            </p>
          </div>
        </div>

        {!hasArchivedItems ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-12">
              <ArchiveBoxArrowDownIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Nothing archived yet
              </h2>
              <p className="text-gray-500">
                Cards and templates you archive will appear here
              </p>
              <Link
                to="/"
                className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Archived Cards Section */}
            {archivedCards.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Archived Cards ({archivedCards.length})
                </h2>
                <div className="space-y-3">
                  {archivedCards.map((card) => {
                    const colors = getCategoryColors(card.sourceCategory);
                    return (
                      <div
                        key={card.id}
                        className={`border-2 ${colors.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              <span className="relative inline-block">
                                <span className="relative z-10">
                                  {card.title}
                                </span>
                                <span
                                  className={`absolute bottom-0 left-0 right-0 h-2 ${colors.highlight} opacity-50 -z-10`}
                                ></span>
                              </span>
                            </h3>
                            {card.description && (
                              <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                                {card.description}
                              </p>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {card.sourceCategory}
                              </span>
                              {card.duration && (
                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                  {card.duration} min
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUnarchiveCard(
                                  card.sourceCategory,
                                  card.id
                                )
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Restore card"
                            >
                              <ArchiveBoxArrowDownIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handlePermanentDeleteCard(
                                  card.sourceCategory,
                                  card.id,
                                  card.title
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete permanently"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Archived Templates Section */}
            {archivedTemplates.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Archived Templates ({archivedTemplates.length})
                </h2>
                <div className="space-y-3">
                  {archivedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {template.name}
                          </h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div>
                              {template.cardCount} cards •{' '}
                              {new Date(
                                template.createdAt
                              ).toLocaleDateString()}
                            </div>
                            {template.updatedAt && (
                              <div className="text-xs text-gray-400">
                                Archived{' '}
                                {new Date(
                                  template.updatedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadTemplate(template)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Load to daily deck"
                          >
                            <PlayIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUnarchiveTemplate(template.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Restore template"
                          >
                            <ArchiveBoxArrowDownIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handlePermanentDeleteTemplate(
                                template.id,
                                template.name
                              )
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete permanently"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
