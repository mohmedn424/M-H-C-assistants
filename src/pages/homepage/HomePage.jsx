import './homepage.scss';
import pb from '../../lib/pocketbase';
import { Button } from 'antd';

export default function HomePage() {
  return (
    <div className="home-page-wrapper">
      <h1>{pb.authStore.model.name}</h1>
      <Button
        size="large"
        type="primary"
        className="home-page-cta"
        onClick={() => {
          pb.authStore.clear();
          location.reload();
        }}
      >
        تسجيل خروج
      </Button>
    </div>
  );
}
