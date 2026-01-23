type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunction = function executedFunction(
    ...args: Parameters<T>
  ): void {
    if (isCancelled) {
      isCancelled = false;
    }

    lastArgs = args;

    const later = () => {
      timeout = null;
      if (!isCancelled) {
        func(...args);
      }
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  debouncedFunction.cancel = function (): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = null;
    lastArgs = null;
    isCancelled = true;
  };

  debouncedFunction.flush = function (): void {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (!isCancelled && lastArgs !== null) {
      func(...lastArgs);
      lastArgs = null;
    }
  };

  return debouncedFunction as DebouncedFunction<T>;
}
