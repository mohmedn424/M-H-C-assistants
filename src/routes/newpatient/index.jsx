import { createFileRoute } from '@tanstack/react-router';
import NewpatientPage from '../../pages/newPatient/NewPatientPage';

export const Route = createFileRoute('/newpatient/')({
  component: () => {
    return <NewpatientPage />;
  },
});
