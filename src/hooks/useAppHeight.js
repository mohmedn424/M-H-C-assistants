import { useEffect } from 'react';

/**
 * Custom hook to handle app height adjustments for mobile keyboards
 * @param {Object} options - Configuration options
 * @param {boolean} options.listenToInputs - Whether to add listeners to input elements
 * @param {string} options.cssVariable - The CSS variable name to update (default: '--app-height')
 */
export function useAppHeight({
  listenToInputs = true,
  cssVariable = '--app-height',
} = {}) {
  useEffect(() => {
    // Function to update the app height CSS variable
    function updateAppHeight() {
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
    }
    // Define focus and blur handlers outside the conditional block
    const handleFocus = () => setTimeout(updateAppHeight, 100);
    const handleBlur = () => setTimeout(updateAppHeight, 100);

    // Set initial app height
    updateAppHeight();

    // Add event listeners for resize and viewport changes
    window.addEventListener('resize', updateAppHeight);

    if ('visualViewport' in window) {
      window.visualViewport.addEventListener(
        'resize',
        updateAppHeight
      );
      window.visualViewport.addEventListener(
        'scroll',
        updateAppHeight
      );
    }

    // Optional input focus/blur listeners for iOS
    let inputs = [];
    if (listenToInputs) {
      inputs = document.querySelectorAll('input, textarea');

      inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
      });
    }

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('resize', updateAppHeight);

      if ('visualViewport' in window) {
        window.visualViewport.removeEventListener(
          'resize',
          updateAppHeight
        );
        window.visualViewport.removeEventListener(
          'scroll',
          updateAppHeight
        );
      }

      if (listenToInputs) {
        inputs.forEach((input) => {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
        });
      }
    };
  }, [cssVariable, listenToInputs]);
}
