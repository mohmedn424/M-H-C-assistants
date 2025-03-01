import { useEffect } from 'react';
import usePreloadAssets from '../hooks/usePreloadAssets';

/**
 * Component that applies various performance optimizations
 * to help achieve 100% Lighthouse score
 */
function PerformanceOptimizer() {
  // Preload critical images
  usePreloadAssets(['/logo.svg', '/pwa-192x192.png'], {
    type: 'image',
  });

  // Preload critical fonts
  usePreloadAssets(
    [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    ],
    { type: 'style' }
  );

  useEffect(() => {
    // Optimize LCP (Largest Contentful Paint)
    const optimizeLCP = () => {
      // Add priority hints to important images
      document
        .querySelectorAll('img[data-priority="high"]')
        .forEach((img) => {
          if ('fetchPriority' in img) {
            img.fetchPriority = 'high';
          }
          img.loading = 'eager';
        });
    };

    // Optimize CLS (Cumulative Layout Shift)
    const optimizeCLS = () => {
      // Set explicit dimensions for images without width/height
      document
        .querySelectorAll('img:not([width]):not([height])')
        .forEach((img) => {
          if (img.naturalWidth && img.naturalHeight) {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
          }
        });
    };

    // Preload critical assets
    const preloadAssets = () => {
      const criticalAssets = [
        { url: '/logo.svg', type: 'image' },
        {
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          type: 'style',
        },
      ];

      criticalAssets.forEach((asset) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset.url;
        link.as = asset.type;
        if (asset.type !== 'style') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });
    };

    // Run optimizations
    optimizeLCP();
    preloadAssets();

    // Run CLS optimization after content loads
    if (document.readyState === 'complete') {
      optimizeCLS();
    } else {
      window.addEventListener('load', optimizeCLS, { once: true });
    }

    return () => {
      window.removeEventListener('load', optimizeCLS);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

export default PerformanceOptimizer;
