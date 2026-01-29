import { CheckIcon } from '@heroicons/react/24/outline';
import { formatTimerDuration } from '../utils/formatTimerDuration';
import { formatCompletedTime } from '../utils/date';
import {
  completedBadgeVariants,
  completedBadgeIconVariants,
  completedBadgeTextVariants,
  completedBadgeTimeVariants,
} from '../utils/variants';

interface CompletedCardBadgeProps {
  timeSpent?: number | undefined;
  completedAt?: string | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export function CompletedCardBadge({
  timeSpent,
  completedAt,
  size = 'md',
}: CompletedCardBadgeProps) {
  return (
    <div className={completedBadgeVariants({ size })}>
      <div className="flex items-center gap-2">
        <CheckIcon className={completedBadgeIconVariants({ size })} />
        <span className={completedBadgeTextVariants({ size })}>
          {timeSpent !== undefined && timeSpent > 0
            ? `Completed in ${formatTimerDuration(timeSpent)}`
            : 'Completed'}
        </span>
      </div>
      {completedAt && (
        <span className={completedBadgeTimeVariants({ size })}>
          {formatCompletedTime(completedAt)}
        </span>
      )}
    </div>
  );
}
