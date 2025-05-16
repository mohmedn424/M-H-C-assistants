import { createFileRoute } from '@tanstack/react-router';
import UploadPage from '../../pages/upload/UploadPage';
export const Route = createFileRoute('/upload/')({
  component: () => <UploadPage />,
});
