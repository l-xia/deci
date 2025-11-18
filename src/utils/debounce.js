/**
 * Debounce utility - delays function execution until after wait milliseconds
 * have elapsed since the last time it was invoked.
 * Includes cancel and flush methods for proper cleanup.
 */
export function debounce(func, wait) {
  let timeout;
  let isCancelled = false;

  const debouncedFunction = function executedFunction(...args) {
    if (isCancelled) return;

    const later = () => {
      timeout = null;
      if (!isCancelled) {
        func(...args);
      }
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  // Cancel pending execution and prevent future executions
  debouncedFunction.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
    isCancelled = true;
  };

  // Execute immediately if pending, otherwise do nothing
  debouncedFunction.flush = function(...args) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (!isCancelled && args.length > 0) {
      func(...args);
    }
  };

  return debouncedFunction;
}
