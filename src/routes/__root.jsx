import * as React from 'react';
import '../styles/layout.scss';
import { Gradient } from 'whatamesh';
import {
  Outlet,
  createRootRoute,
  useNavigate,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { isAuthenticated } from '../util/isAuthentectied';
import CommonLayout from '../components/CommonLayout';
import pb from '../lib/pocketbase';
import { fetchQueueLogic } from '../stores/queueStore';
import { useAuthStore } from '../stores/authStore';
import { useClinicValue } from '../stores/userStore';

// Initialize gradient outside component to prevent recreation
const gradient = new Gradient();

// Auth refresh configuration
const AUTH_REFRESH_CONFIG = {
  fields:
    'record.id,record.avatar,record.gender,record.name,record.verified,token,record.expand.doctors.id,record.expand.doctors.name_ar,record.expand.clinics.id,record.expand.clinics.name',
  expand: 'doctors,clinics',
};

export const Route = createRootRoute({
  component: RootComponent,
  // Add beforeLoad to handle authentication check before rendering
  beforeLoad: ({ location }) => {
    // Skip redirect if already on login page
    if (location.pathname === '/login') {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
        replace: true,
      });
    }
  },
});

function RootComponent() {
  const [authChecked, setAuthChecked] = React.useState(false);
  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const router = useRouterState();
  const { setClinicValues } = useClinicValue();

  // Check if current route is login page
  const isLoginPage = router.location.pathname === '/login';

  // Handle authentication refresh and gradient initialization
  React.useEffect(() => {
    // Initialize gradient
    gradient.initGradient('#gradient-canvas');

    // Refresh authentication
    const refreshAuth = async () => {
      try {
        if (isAuthenticated()) {
          const authData = await pb
            .collection('assistants')
            .authRefresh(AUTH_REFRESH_CONFIG);

          // Set default clinic filter if available
          if (authData?.record?.expand?.clinics?.length > 0) {
            const defaultClinic =
              authData.record.expand.clinics[0].id;
            setClinicValues([defaultClinic]);
          }
        }
      } catch (error) {
        console.error('Auth refresh error:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    refreshAuth();

    // Cleanup gradient on unmount
    return () => gradient.pause();
  }, [setClinicValues]);

  // Handle data fetching when authentication state changes
  React.useEffect(() => {
    if (isAuth && authChecked) {
      fetchQueueLogic();
    }
  }, [isAuth, authChecked]);

  // Conditionally render with or without CommonLayout based on route
  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <CommonLayout>
      <Outlet />
    </CommonLayout>
  );
}
