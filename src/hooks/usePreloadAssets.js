import { useEffect } from 'react';

/**
 * Hook to preload critical assets for better performance
 * @param {Array} assets - Array of asset URLs to preload
 * @param {Object} options - Configuration options
 */
function usePreloadAssets(assets = [], options = {}) {
  const {
    enabled = true,
    type = 'image',
    crossOrigin = 'anonymous',
  } = options;

  useEffect(() => {
    if (!enabled || !assets.length) return;

    // Create link elements for preloading
    const links = assets.map((asset) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = type;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      return link;
    });

    // Append to head
    links.forEach((link) => document.head.appendChild(link));

    // Cleanup function
    return () => {
      links.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [assets, enabled, type, crossOrigin]);
}

export default usePreloadAssets;
