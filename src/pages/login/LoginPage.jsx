import { Button, Form, Input, message } from 'antd';
import './login.scss';
import { useState } from 'react';
import pb from '../../lib/pocketbase';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginHandler = async (values) => {
    setLoading(true);
    try {
      const authData = await pb
        .collection('assistants')
        .authWithPassword(values.username, values.password, {
          fields:
            'record.id,record.avatar,record.gender,record.name,record.verified,token,record.expand.doctors.id,record.expand.doctors.name,record.expand.clinics.id,record.expand.clinics.name',
          expand: 'doctors,clinics',
        });

      if (authData) {
        setAuth(authData);
        message.success('Login successful!');
        location.reload();
      }
    } catch (error) {
      message.error(
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper gradient-bg-2">
      <div className="login-container">
        <Form form={form} onFinish={loginHandler} layout="vertical">
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
            ]}
          >
            <Input size="large" placeholder="Username" />
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
            <Input.Password size="large" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-btn"
              size="large"
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
