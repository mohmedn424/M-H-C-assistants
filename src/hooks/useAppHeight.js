import { useEffect, useCallback } from 'react';

/**
 * Custom hook to handle app height adjustments for mobile keyboards
 * @param {Object} options - Configuration options
 * @param {boolean} options.listenToInputs - Whether to add listeners to input elements
 * @param {string} options.cssVariable - The CSS variable name to update (default: '--app-height')
 */
export function useAppHeight({
  listenToInputs = true,
  cssVariable = '--app-height',
  debounceTime = 100,
} = {}) {
  // Memoize the updateAppHeight function to prevent unnecessary re-renders
  const updateAppHeight = useCallback(() => {
    const doc = document.documentElement;

    // Use visualViewport if available for more accurate height when keyboard is open
    if (window.visualViewport) {
      doc.style.setProperty(
        cssVariable,
        `${window.visualViewport.height}px`
      );
    } else {
      doc.style.setProperty(cssVariable, `${window.innerHeight}px`);
    }
  }, [cssVariable]);

  // Debounce function to limit rapid updates
  const debounce = useCallback((fn, delay) => {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => fn(), delay);
    };
  }, []);

  // Create debounced versions of handlers
  const debouncedUpdate = useCallback(
    debounce(updateAppHeight, debounceTime),
    [updateAppHeight, debounceTime]
  );

  // Define focus and blur handlers
  const handleFocus = useCallback(
    () => debouncedUpdate(),
    [debouncedUpdate]
  );
  const handleBlur = useCallback(
    () => debouncedUpdate(),
    [debouncedUpdate]
  );

  useEffect(() => {
    // Set initial app height
    updateAppHeight();

    // Add event listeners for resize and viewport changes
    window.addEventListener('resize', debouncedUpdate, {
      passive: true,
    });

    if ('visualViewport' in window) {
      window.visualViewport.addEventListener(
        'resize',
        debouncedUpdate,
        { passive: true }
      );
      window.visualViewport.addEventListener(
        'scroll',
        debouncedUpdate,
        { passive: true }
      );
    }

    // Optional input focus/blur listeners for iOS
    let inputs = [];
    if (listenToInputs) {
      // Use a more efficient selector
      inputs = Array.from(
        document.querySelectorAll('input, textarea')
      );

      inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus, {
          passive: true,
        });
        input.addEventListener('blur', handleBlur, { passive: true });
      });
    }

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('resize', debouncedUpdate);

      if ('visualViewport' in window) {
        window.visualViewport.removeEventListener(
          'resize',
          debouncedUpdate
        );
        window.visualViewport.removeEventListener(
          'scroll',
          debouncedUpdate
        );
      }

      if (listenToInputs) {
        inputs.forEach((input) => {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
        });
      }
    };
  }, [
    cssVariable,
    listenToInputs,
    updateAppHeight,
    debouncedUpdate,
    handleFocus,
    handleBlur,
  ]);
}

export default useAppHeight;
