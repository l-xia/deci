import { cva, type VariantProps } from 'class-variance-authority';

// =============================================================================
// SIZE VARIANTS
// =============================================================================

export const iconSizeVariants = cva('', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const spinnerSizeVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// =============================================================================
// BADGE VARIANTS
// =============================================================================

export const completedBadgeVariants = cva(
  'bg-green-50 border-green-200 flex items-center justify-between text-green-700',
  {
    variants: {
      size: {
        sm: 'mt-3 p-2 border rounded-md',
        md: 'mt-4 p-3 border rounded-md',
        lg: 'mt-6 p-4 border-2 rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const completedBadgeIconVariants = cva('', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const completedBadgeTextVariants = cva('', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg font-medium',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const completedBadgeTimeVariants = cva('text-green-600', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// =============================================================================
// STATUS VARIANTS
// =============================================================================

export const saveStatusVariants = cva(
  'flex items-center gap-2 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 underline underline-offset-4',
  {
    variants: {
      status: {
        saving: 'decoration-blue-500 text-blue-500',
        saved: 'decoration-green-600 text-green-600',
        error: 'decoration-red-600 text-red-600',
        idle: 'decoration-gray-400 text-gray-600',
      },
    },
    defaultVariants: {
      status: 'idle',
    },
  }
);

export const saveStatusTextVariants = cva('', {
  variants: {
    status: {
      saving: 'text-blue-500',
      saved: 'text-green-600',
      error: 'text-red-600',
      idle: 'text-gray-600',
    },
  },
  defaultVariants: {
    status: 'idle',
  },
});

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const iconButtonVariants = cva('transition-colors', {
  variants: {
    size: {
      sm: 'p-1',
      md: 'p-1.5',
      lg: 'p-2',
    },
    intent: {
      default: 'text-gray-400 hover:text-gray-700',
      primary: 'text-gray-400 hover:text-blue-600',
      success: 'text-gray-400 hover:text-green-600',
      warning: 'text-gray-400 hover:text-orange-600',
      danger: 'text-gray-400 hover:text-red-600',
    },
  },
  defaultVariants: {
    size: 'sm',
    intent: 'default',
  },
});

export const toggleButtonVariants = cva(
  'px-3 py-1.5 text-sm rounded-md transition-colors',
  {
    variants: {
      active: {
        true: 'bg-blue-500 text-white',
        false: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const dayButtonVariants = cva(
  'px-2 py-2 text-sm rounded-md transition-colors',
  {
    variants: {
      selected: {
        true: 'bg-blue-500 text-white',
        false: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

// =============================================================================
// INPUT VARIANTS
// =============================================================================

export const inputVariants = cva(
  'w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent',
  {
    variants: {
      error: {
        true: 'border-red-500 focus:ring-red-500',
        false: 'border-gray-300 focus:ring-blue-500',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

export const compactInputVariants = cva(
  'px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500',
  {
    variants: {
      fullWidth: {
        true: 'text-sm flex-1 min-w-0',
        false: 'text-xs',
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  }
);

// =============================================================================
// TIMER VARIANTS
// =============================================================================

export const timerButtonVariants = cva(
  'p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      state: {
        running: 'text-yellow-500 hover:text-yellow-600',
        paused: 'text-green-600 hover:text-green-700',
        stopped: 'text-red-500 hover:text-red-600',
      },
    },
    defaultVariants: {
      state: 'paused',
    },
  }
);

export const timerDisplayVariants = cva(
  'font-mono font-semibold text-gray-700 min-w-[60px] text-center',
  {
    variants: {
      fullWidth: {
        true: 'text-base',
        false: 'text-xs md:text-sm',
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  }
);

// =============================================================================
// CARD VARIANTS
// =============================================================================

export const dailyDeckCardVariants = cva(
  'border-2 rounded-md shadow-lg transition-all mb-3',
  {
    variants: {
      completed: {
        true: 'bg-gray-50 border-gray-300 opacity-60',
        false: 'bg-white',
      },
      dragging: {
        true: 'shadow-2xl rotate-2 cursor-grabbing',
        false: 'hover:shadow-xl cursor-grab',
      },
      expanded: {
        true: 'p-6',
        false: 'p-4',
      },
    },
    defaultVariants: {
      completed: false,
      dragging: false,
      expanded: false,
    },
  }
);

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type IconSizeVariants = VariantProps<typeof iconSizeVariants>;
export type SpinnerSizeVariants = VariantProps<typeof spinnerSizeVariants>;
export type CompletedBadgeVariants = VariantProps<
  typeof completedBadgeVariants
>;
export type SaveStatusVariants = VariantProps<typeof saveStatusVariants>;
export type IconButtonVariants = VariantProps<typeof iconButtonVariants>;
export type ToggleButtonVariants = VariantProps<typeof toggleButtonVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type TimerButtonVariants = VariantProps<typeof timerButtonVariants>;
export type DailyDeckCardVariants = VariantProps<typeof dailyDeckCardVariants>;
