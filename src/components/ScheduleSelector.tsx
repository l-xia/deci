import { DAYS_OF_WEEK } from '../utils/scheduling';

interface ScheduleSelectorProps {
  scheduleType: 'daily' | 'weekly' | 'monthly';
  selectedDays: number[];
  onChange: (days: number[]) => void;
  onScheduleTypeChange: (type: 'daily' | 'weekly' | 'monthly') => void;
}

export function ScheduleSelector({
  scheduleType,
  selectedDays,
  onChange,
  onScheduleTypeChange,
}: ScheduleSelectorProps) {
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-3">
      {/* Schedule Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schedule Frequency
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onScheduleTypeChange('daily')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              scheduleType === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => onScheduleTypeChange('weekly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              scheduleType === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => onScheduleTypeChange('monthly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              scheduleType === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Weekly: Day of Week Selector */}
      {scheduleType === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Days
          </label>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-2 py-2 text-sm rounded-md transition-colors ${
                  selectedDays.includes(day.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={day.full}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly: Day of Month Selector */}
      {scheduleType === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Dates
          </label>
          <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
              <button
                key={date}
                type="button"
                onClick={() => toggleDay(date)}
                className={`px-2 py-2 text-sm rounded-md transition-colors ${
                  selectedDays.includes(date)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Daily: No day selector needed */}
      {scheduleType === 'daily' && (
        <p className="text-sm text-gray-500">
          This task will be available every day
        </p>
      )}
    </div>
  );
}
