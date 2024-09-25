import './settings.scss';
import pb from '../../lib/pocketbase';
import { Button } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';

export default function SettingsPage() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    pb.authStore.clear();
    clearAuth();
    location.reload();
  };

  return (
    <div className="home-page-wrapper">
      <h1>{pb.authStore.model.name}</h1>
      <Button
        size="large"
        type="primary"
        className="home-page-cta"
        onClick={handleLogout}
      >
        تسجيل خروج
      </Button>
    </div>
  );
}
