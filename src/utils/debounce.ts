export function debounce(func, wait) {
  let timeout;
  let isCancelled = false;
  let lastArgs = null;

  const debouncedFunction = function executedFunction(...args) {
    if (isCancelled) return;

    lastArgs = args;

    const later = () => {
      timeout = null;
      if (!isCancelled) {
        func(...args);
      }
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debouncedFunction.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
    lastArgs = null;
    isCancelled = true;
  };

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
