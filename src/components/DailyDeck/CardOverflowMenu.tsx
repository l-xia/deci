import { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon, PencilIcon, ArrowUturnLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface CardOverflowMenuProps {
  onEdit: (e: React.MouseEvent) => void;
  onReturnToStack: (e: React.MouseEvent) => void;
  onReset: (e: React.MouseEvent) => void;
  isLarge?: boolean;
}

export const CardOverflowMenu = ({
  onEdit,
  onReturnToStack,
  onReset,
  isLarge = false,
}: CardOverflowMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action(e);
    setIsOpen(false);
  };

  const iconSize = isLarge ? 'w-5 h-5' : 'w-4 h-4';
  const buttonPadding = isLarge ? 'p-1.5' : 'p-1';
  const menuItemPadding = isLarge ? 'px-4 py-2.5' : 'px-3 py-2';
  const menuItemTextSize = isLarge ? 'text-base' : 'text-sm';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className={`${buttonPadding} text-gray-400 hover:text-gray-700 transition-colors rounded-md ${
          isOpen ? 'bg-gray-100' : ''
        }`}
        title="More actions"
      >
        <EllipsisVerticalIcon className={iconSize} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[180px]">
          <div className="py-1">
            <button
              onClick={handleAction(onEdit)}
              className={`w-full ${menuItemPadding} ${menuItemTextSize} text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700`}
            >
              <PencilIcon className={iconSize} />
              Edit
            </button>
            <button
              onClick={handleAction(onReturnToStack)}
              className={`w-full ${menuItemPadding} ${menuItemTextSize} text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700`}
            >
              <ArrowUturnLeftIcon className={iconSize} />
              Return to Stack
            </button>
            <button
              onClick={handleAction(onReset)}
              className={`w-full ${menuItemPadding} ${menuItemTextSize} text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700`}
            >
              <ArrowPathIcon className={iconSize} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
