import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';

export default function ScanUpload({ scan }) {
  return (
    <div className="scan-upload-container">
      <Upload>
        <Button
          style={{
            fontWeight: 'bolder',
          }}
          type="primary"
          size="large"
          icon={
            <UploadOutlined
              style={{
                fontSize: '20px',
              }}
            />
          }
        >
          Upload
        </Button>
      </Upload>
    </div>
  );
}
