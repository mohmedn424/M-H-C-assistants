import * as React from 'react';
import '../styles/layout.scss';

import { Gradient } from 'whatamesh';

import { Outlet, createRootRoute } from '@tanstack/react-router';
import { isAuthenticated } from '../util/isAuthentectied';
import LoginPage from '../pages/login/LoginPage';

import CommonLayout from '../components/CommonLayout';
import pb from '../lib/pocketbase';

const gradient = new Gradient();

export const Route = createRootRoute({
  component: () => {
    React.useEffect(() => {
      const refreshAuth = async () => {
        await pb.collection('assistants').authRefresh({
          fields:
            'record.id,record.avatar,record.gender,record.name,record.verified,token,record.expand.doctors.id,record.expand.doctors.name_ar,record.expand.clinics.id,record.expand.clinics.name',
          expand: 'doctors,clinics',
        });
      };

      gradient.initGradient('#gradient-canvas');

      if (isAuthenticated()) {
        refreshAuth();
      }

      return () => {
        gradient.pause();
      };
    }, []);

    if (!isAuthenticated()) {
      return <LoginPage />;
    }

    return (
      <CommonLayout>
        <Outlet />
      </CommonLayout>
    );
  },
});
