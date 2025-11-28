import { CheckIcon } from '@heroicons/react/24/outline';
import { formatTimerDuration } from '../utils/formatTimerDuration';
import { formatCompletedTime } from '../utils/date';

interface CompletedCardBadgeProps {
  timeSpent?: number | undefined;
  completedAt?: string | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export function CompletedCardBadge({ timeSpent, completedAt, size = 'md' }: CompletedCardBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'mt-3 p-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      time: 'text-xs',
    },
    md: {
      container: 'mt-4 p-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      time: 'text-sm',
    },
    lg: {
      container: 'mt-6 p-4',
      icon: 'w-6 h-6',
      text: 'text-lg',
      time: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`${classes.container} bg-green-50 border ${size === 'lg' ? 'border-2' : 'border'} border-green-200 rounded-${size === 'lg' ? 'lg' : 'md'}`}>
      <div className="flex items-center justify-between text-green-700">
        <div className="flex items-center gap-2">
          <CheckIcon className={classes.icon} />
          <span className={`${classes.text} ${size === 'lg' ? 'font-medium' : ''}`}>
            {timeSpent !== undefined && timeSpent > 0
              ? `Completed in ${formatTimerDuration(timeSpent)}`
              : 'Completed'}
          </span>
        </div>
        {completedAt && (
          <span className={`${classes.time} text-green-600`}>
            {formatCompletedTime(completedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
