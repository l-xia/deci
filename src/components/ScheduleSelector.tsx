import { DAYS_OF_WEEK } from '../utils/scheduling';
import { toggleButtonVariants, dayButtonVariants } from '../utils/variants';

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
  const handleToggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
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
        <div
          className="flex gap-2"
          role="group"
          aria-label="Schedule frequency options"
        >
          <button
            type="button"
            onClick={() => onScheduleTypeChange('daily')}
            className={toggleButtonVariants({
              active: scheduleType === 'daily',
            })}
            aria-pressed={scheduleType === 'daily'}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => onScheduleTypeChange('weekly')}
            className={toggleButtonVariants({
              active: scheduleType === 'weekly',
            })}
            aria-pressed={scheduleType === 'weekly'}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => onScheduleTypeChange('monthly')}
            className={toggleButtonVariants({
              active: scheduleType === 'monthly',
            })}
            aria-pressed={scheduleType === 'monthly'}
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
          <div
            className="grid grid-cols-7 gap-2"
            role="group"
            aria-label="Days of the week"
          >
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleToggleDay(day.value)}
                className={dayButtonVariants({
                  selected: selectedDays.includes(day.value),
                })}
                title={day.full}
                aria-pressed={selectedDays.includes(day.value)}
                aria-label={day.full}
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
          <div
            className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto"
            role="group"
            aria-label="Days of the month"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => handleToggleDay(date)}
                className={dayButtonVariants({
                  selected: selectedDays.includes(date),
                })}
                aria-pressed={selectedDays.includes(date)}
                aria-label={`Day ${date}`}
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
