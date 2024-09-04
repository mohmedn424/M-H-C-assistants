import { Button, Form, Input } from 'antd';
import './login.scss';
import { useState } from 'react';
import pb from '../../lib/pocketbase';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginHandler = async (e) => {
    const authData = await pb
      .collection('assistants')
      .authWithPassword(username, password, {
        fields:
          'record.id,record.avatar,record.gender,record.name,record.verified,token,record.expand.doctors.id,record.expand.doctors.name,record.expand.clinics.id,record.expand.clinics.name',
        expand: 'doctors,clinics',
      });

    if (authData) {
      location.reload();
    }
  };

  return (
    <div className="login-wrapper gradient-bg-2">
      <div className="login-container">
        <div className="inputs">
          <Form>
            <Form.Item noStyle>
              <Input
                size="large"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </Form.Item>
            <Form.Item noStyle>
              <Input.Password
                size="large"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </Form.Item>
          </Form>
        </div>
        <div className="cta">
          <Button
            type="primary"
            onClick={(e) => loginHandler(e)}
            htmlType="submit"
            className="login-btn"
            size="large"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
