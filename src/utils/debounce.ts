/**
 * Debounce utility - delays function execution until after wait milliseconds
 * have elapsed since the last time it was invoked.
 * Includes cancel and flush methods for proper cleanup.
 */
export function debounce(func, wait) {
  let timeout;
  let isCancelled = false;
  let lastArgs = null;

  const debouncedFunction = function executedFunction(...args) {
    if (isCancelled) return;

    lastArgs = args; // Save the most recent arguments

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
    lastArgs = null;
    isCancelled = true;
  };

  // Execute immediately with the last pending arguments
  debouncedFunction.flush = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (!isCancelled && lastArgs !== null) {
      func(...lastArgs);
      lastArgs = null;
    }
  };

  return debouncedFunction;
}
