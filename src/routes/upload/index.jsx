import { UploadOutlined } from '@ant-design/icons';
import { createFileRoute } from '@tanstack/react-router';
import { Button, Upload } from 'antd';
import UploadPage from '../../pages/upload/UploadPage';

export const Route = createFileRoute('/upload/')({
  component: () => <UploadPage />,
});
