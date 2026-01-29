import {
  PencilIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { iconButtonVariants, iconSizeVariants } from '../../utils/variants';

interface CardActionButtonsProps {
  isCompleted: boolean | undefined;
  isExpanded?: boolean;
  isLarge?: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onComplete: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleExpand?: (e: React.MouseEvent) => void;
}

export const CardActionButtons = ({
  isCompleted,
  isExpanded = false,
  isLarge = false,
  onEdit,
  onComplete,
  onDelete,
  onToggleExpand,
}: CardActionButtonsProps) => {
  const buttonSize = isLarge ? 'md' : 'sm';
  const iconSize = isLarge ? 'md' : 'sm';

  if (isCompleted) {
    return onToggleExpand ? (
      <button
        onClick={onToggleExpand}
        className={iconButtonVariants({ size: buttonSize, intent: 'default' })}
        title={isExpanded ? 'Collapse' : 'Expand'}
      >
        <ChevronDownIcon
          className={`${iconSizeVariants({ size: iconSize })} transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    ) : null;
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={onEdit}
        className={iconButtonVariants({ size: buttonSize, intent: 'primary' })}
        title="Edit"
      >
        <PencilIcon className={iconSizeVariants({ size: iconSize })} />
      </button>
      <button
        onClick={onComplete}
        className={iconButtonVariants({ size: buttonSize, intent: 'success' })}
        title="Mark Complete"
      >
        <CheckIcon className={iconSizeVariants({ size: iconSize })} />
      </button>
      <button
        onClick={onDelete}
        className={iconButtonVariants({ size: buttonSize, intent: 'warning' })}
        title="Remove from deck"
      >
        <ArrowUturnLeftIcon className={iconSizeVariants({ size: iconSize })} />
      </button>
    </div>
  );
};
