import {
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router';
import UploadItem from '../../pages/upload/UploadItem';

export const Route = createFileRoute('/upload/$uploadid')({
  component: () => {
    const {
      location: { state },
    } = useRouterState();

    return <UploadItem itemData={state?.itemData} />;
  },
});
