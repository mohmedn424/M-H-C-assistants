import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
