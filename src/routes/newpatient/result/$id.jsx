import { createFileRoute } from '@tanstack/react-router';
import ResultPage from '../../../pages/newPatient/ResultPage';

export const Route = createFileRoute('/newpatient/result/$id')({
  component: () => {
    const { id } = Route.useParams();

    return <ResultPage id={id} />;
  },
});
