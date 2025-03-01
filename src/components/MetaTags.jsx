import { Helmet } from 'react-helmet';

export default function MetaTags() {
  return (
    <Helmet>
      {/* Character Set */}
      <meta charSet="utf-8" />

      {/* Viewport for responsive design */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />

      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* Font display optimization */}
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        media="print"
        onLoad="this.media='all'"
      />

      {/* Performance optimizations */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="theme-color" content="#ffffff" />

      {/* SEO tags */}
      <title>M-H-C Assistant</title>
      <meta
        name="description"
        content="Medical Health Care Assistant Application"
      />

      {/* PWA related tags */}
      <link rel="manifest" href="/manifest.webmanifest" />
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon.png"
        sizes="180x180"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="default"
      />
      <meta
        name="apple-mobile-web-app-title"
        content="MHC Assistant"
      />

      {/* Preload critical assets */}
      <link rel="preload" as="image" href="/logo.svg" />
    </Helmet>
  );
}
