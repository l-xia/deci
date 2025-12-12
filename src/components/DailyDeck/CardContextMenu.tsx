import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  PencilIcon,
  PencilSquareIcon,
  CheckIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CardContextMenuProps {
  x: number;
  y: number;
  isCompleted: boolean;
  onOneTimeEdit: () => void;
  onEdit: () => void;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onReturnToStack: () => void;
  onClose: () => void;
}

function CardContextMenu({
  x,
  y,
  isCompleted,
  onOneTimeEdit,
  onEdit,
  onMarkComplete,
  onMarkIncomplete,
  onReturnToStack,
  onClose,
}: CardContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust menu position to keep it within viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const rightOverflow = rect.right > window.innerWidth;
      const bottomOverflow = rect.bottom > window.innerHeight;

      if (rightOverflow) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (bottomOverflow) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const menuItems = [
    {
      label: 'One-time edit (today)',
      icon: PencilIcon,
      onClick: () => {
        onOneTimeEdit();
        onClose();
      },
      show: true,
    },
    {
      label: 'Edit card in stack',
      icon: PencilSquareIcon,
      onClick: () => {
        onEdit();
        onClose();
      },
      show: true,
    },
    {
      label: 'Mark as Complete',
      icon: CheckIcon,
      onClick: () => {
        onMarkComplete();
        onClose();
      },
      show: !isCompleted,
    },
    {
      label: 'Mark as Incomplete',
      icon: XMarkIcon,
      onClick: () => {
        onMarkIncomplete();
        onClose();
      },
      show: isCompleted,
    },
    {
      label: 'Return to Stack',
      icon: ArrowLeftIcon,
      onClick: () => {
        onReturnToStack();
        onClose();
      },
      show: true,
    },
  ];

  return createPortal(
    <div
      ref={menuRef}
      className="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[180px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 99999,
      }}
    >
      {menuItems
        .filter((item) => item.show)
        .map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
    </div>,
    document.body
  );
}

export default CardContextMenu;
