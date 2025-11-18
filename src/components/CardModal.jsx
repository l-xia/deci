import { useState, useEffect } from 'react';

function CardModal({ category, card, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('always');
  const [maxUses, setMaxUses] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setDuration(card.duration || '');
      setRecurrenceType(card.recurrenceType || 'always');
      setMaxUses(card.maxUses || '');
    }
  }, [card]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      duration: duration ? parseInt(duration) : null,
      recurrenceType,
      maxUses: recurrenceType === 'limited' && maxUses ? parseInt(maxUses) : null,
      timesUsed: card?.timesUsed || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {card ? 'Edit Card' : 'New Card'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Walk the dog"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Optional details..."
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Suggested Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurrence Type
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recurrence"
                  value="always"
                  checked={recurrenceType === 'always'}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">Always Available</div>
                  <div className="text-xs text-gray-500">Can be added to daily deck unlimited times (e.g., Reading)</div>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recurrence"
                  value="limited"
                  checked={recurrenceType === 'limited'}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Limited Uses</div>
                  <div className="text-xs text-gray-500 mb-1">Can be added X times per day (e.g., Walk dog 3x)</div>
                  {recurrenceType === 'limited' && (
                    <input
                      type="number"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="3"
                      min="1"
                      required
                    />
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recurrence"
                  value="once"
                  checked={recurrenceType === 'once'}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">One-Time Only</div>
                  <div className="text-xs text-gray-500">Disappears after being added once (e.g., Take out trash)</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {card ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CardModal;
