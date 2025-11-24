import { PencilIcon, CheckIcon, ArrowUturnLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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
  const iconSize = isLarge ? 'w-5 h-5' : 'w-4 h-4';
  const buttonPadding = isLarge ? 'p-1.5' : 'p-1';

  if (isCompleted) {
    return onToggleExpand ? (
      <button
        onClick={onToggleExpand}
        className={`${buttonPadding} text-gray-400 hover:text-gray-700 transition-colors`}
        title={isExpanded ? 'Collapse' : 'Expand'}
      >
        <ChevronDownIcon
          className={`${iconSize} transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    ) : null;
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={onEdit}
        className={`${buttonPadding} text-gray-400 hover:text-blue-600 transition-colors`}
        title="Edit"
      >
        <PencilIcon className={iconSize} />
      </button>
      <button
        onClick={onComplete}
        className={`${buttonPadding} text-gray-400 hover:text-green-600 transition-colors`}
        title="Mark Complete"
      >
        <CheckIcon className={iconSize} />
      </button>
      <button
        onClick={onDelete}
        className={`${buttonPadding} text-gray-400 hover:text-orange-600 transition-colors`}
        title="Remove from deck"
      >
        <ArrowUturnLeftIcon className={iconSize} />
      </button>
    </div>
  );
};
