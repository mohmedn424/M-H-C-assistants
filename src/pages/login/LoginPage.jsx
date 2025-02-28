import { Button, Form, Input, message } from 'antd';
import './login.scss';
import { useState, useCallback } from 'react';
import pb from '../../lib/pocketbase';
import { useAuthStore } from '../../stores/authStore';
import { Helmet } from 'react-helmet';
import { useNavigate } from '@tanstack/react-router';

/**
 * Login page component for user authentication
 */
export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  // Memoize login handler to prevent recreation on each render
  const loginHandler = useCallback(
    async (values) => {
      if (loading) return; // Prevent multiple submissions

      setLoading(true);

      try {
        const authData = await pb
          .collection('assistants')
          .authWithPassword(values.username, values.password, {
            fields: [
              'record.id',
              'record.avatar',
              'record.gender',
              'record.name',
              'record.verified',
              'token',
              'record.expand.doctors.id',
              'record.expand.doctors.name',
              'record.expand.clinics.id',
              'record.expand.clinics.name',
            ].join(','),
            expand: 'doctors,clinics',
          });

        if (authData) {
          setAuth(authData);
          message.success('Login successful!');
          // Use TanStack Router navigation instead of page reload
          navigate({ to: '/' });
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error(
          'Login failed. Please check your credentials and try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, setAuth, navigate]
  );

  // Rest of the component remains the same
  return (
    <div className="login-wrapper gradient-bg-2">
      <Helmet>
        <title>Login - M-H-C Assistant</title>
        <meta name="description" content="Login to M-H-C Assistant" />
      </Helmet>

      <div className="login-container">
        <Form
          form={form}
          onFinish={loginHandler}
          layout="vertical"
          validateTrigger="onSubmit"
          size="large"
        >
          {/* Form items remain the same */}
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
            ]}
          >
            <Input
              placeholder="Username"
              autoComplete="username"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
          >
            <Input.Password
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-btn"
              loading={loading}
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
