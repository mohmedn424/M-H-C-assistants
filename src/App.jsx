import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import {
  fetchQueueLogic,
  queueFetchOptions,
  useFullQueue,
} from './stores/queueStore';
import pb from './lib/pocketbase';
import { useEffect, useCallback, memo } from 'react';
import deleteSound from './assets/notification.mp3';
import { Helmet } from 'react-helmet';
import ReloadPrompt from './components/ReloadPrompt';

// Create a new router instance
const router = createRouter({ routeTree });

// Create audio instance outside component to avoid recreation
const deleteAudio = new Audio(deleteSound);

// Memoized notification function to prevent recreation on renders
const sendNotification = (message) => {
  if (Notification.permission === 'granted') {
    new Notification('Queue Update', { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Queue Update', { body: message });
      }
    });
  }
};

// Memoized Helmet component to prevent unnecessary re-renders
const MetaTags = memo(() => (
  <Helmet>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
  </Helmet>
));

function App() {
  // Extract only the handlers needed from the store
  const { deleteHandler, createHandler, updateHandler } =
    useFullQueue(
      useCallback(
        (state) => ({
          deleteHandler: state.deleteHandler,
          createHandler: state.createHandler,
          updateHandler: state.updateHandler,
        }),
        []
      )
    );

  // Handle realtime updates
  const handleRealtimeEvent = useCallback(
    async (e) => {
      switch (e.action) {
        case 'delete':
          try {
            await deleteHandler(e.record.id);
            deleteAudio.play();
            sendNotification(
              `Item with ID ${e.record.id} has been deleted from the queue.`
            );
          } catch (error) {
            console.error('Failed to delete item:', error);
          }
          break;
        case 'create':
          createHandler(e.record);
          break;
        case 'update':
          updateHandler(e.record);
          break;
      }
    },
    [deleteHandler, createHandler, updateHandler]
  );

  useEffect(() => {
    // Skip if not authenticated
    if (!pb.authStore.isValid) return;

    // Initial fetch
    fetchQueueLogic();

    // Set up subscription
    const unsubscribe = pb
      .collection('queue')
      .subscribe('*', handleRealtimeEvent, queueFetchOptions);

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [pb.authStore.isValid, handleRealtimeEvent]);

  return (
    <>
      <MetaTags />
      <RouterProvider router={router} />
      <ReloadPrompt />
    </>
  );
}
export default memo(App);
