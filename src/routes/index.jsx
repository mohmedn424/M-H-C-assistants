import { createFileRoute } from '@tanstack/react-router';

import QueuePage from '../pages/queue/QueuePage';

export const Route = createFileRoute('/')({
  component: () => <QueuePage />,
});
