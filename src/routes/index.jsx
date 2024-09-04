import { createFileRoute } from '@tanstack/react-router';
import HomePage from '../pages/homepage/HomePage';

export const Route = createFileRoute('/')({
  component: () => <HomePage />,
});
