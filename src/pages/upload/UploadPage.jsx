import './upload.scss';
import { useEffect, useMemo, useState } from 'react';
import { Space, Badge, Skeleton } from 'antd-mobile';
import {
  CalendarOutline,
  LeftOutline,
  InformationCircleOutline,
} from 'antd-mobile-icons';

import pb from '../../lib/pocketbase';
import PatientSearch from '../../components/PatientSearch';

import {
  usePatientRequestedScansData,
  useSelectedPatient,
} from '../../stores/patientStore';
import { useNavigate } from '@tanstack/react-router';

// Custom List component
const CustomList = ({ header, children }) => (
  <div className="custom-list">
    <h3 className="custom-list-header">{header}</h3>
    <div className="custom-list-items">{children}</div>
  </div>
);

// Custom List Item component
const CustomListItem = ({
  onClick,
  prefix,
  description,
  children,
}) => (
  <div className="custom-list-item" onClick={onClick}>
    <div className="custom-list-item-prefix">{prefix}</div>
    <div className="custom-list-item-content">
      <div className="custom-list-item-title">{children}</div>
      <div className="custom-list-item-description">
        {description}
      </div>
    </div>
    <div className="custom-list-item-arrow">
      <LeftOutline style={{ fontSize: 16, color: '#999' }} />
    </div>
  </div>
);

export default function UploadPage() {
  const navigate = useNavigate();
  const { setSelectedPatient, selectedPatient } =
    useSelectedPatient();
  const { patientRequestedScansData, setPatientRequestedScansData } =
    usePatientRequestedScansData();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset everything when the component mounts
    setSelectedPatient([]);
    setPatientRequestedScansData({});
  }, []);

  useEffect(() => {
    const fetchPatientScans = async () => {
      if (selectedPatient.length > 0) {
        setIsLoading(true);
        try {
          const data = await pb
            .collection('attachments')
            .getList(1, 5, {
              filter: `patient = "${selectedPatient}" && fulfilled = false`,
              sort: '-created',
              fields: 'id,metadata,collectionId,fulfilled',
            });
          setPatientRequestedScansData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setPatientRequestedScansData({});
      }
    };
    fetchPatientScans();
  }, [selectedPatient, setPatientRequestedScansData]);

  const RequestedScansList = useMemo(() => {
    if (isLoading) {
      return (
        <CustomList header="التحاليل المطلوبة">
          <Skeleton.Paragraph lineCount={3} animated />
        </CustomList>
      );
    }

    if (patientRequestedScansData.totalItems <= 0) {
      return (
        <CustomList header="التحاليل المطلوبة">
          <div className="empty-placeholder">
            <InformationCircleOutline
              style={{ fontSize: 48, color: '#999' }}
            />
            <p>لا توجد تحاليل مطلوبة حالياً</p>
          </div>
        </CustomList>
      );
    }

    return (
      <CustomList header="التحاليل المطلوبة">
        {patientRequestedScansData.items?.map((item) => (
          <CustomListItem
            key={item.id}
            onClick={() =>
              navigate({
                to: '/upload/$uploadid',
                params: { uploadid: item.id },
                state: { itemData: item },
              })
            }
            prefix={
              <Badge
                content="New"
                style={{ backgroundColor: '#007bff' }}
              >
                <CalendarOutline
                  style={{ fontSize: 24, color: '#007bff' }}
                />
              </Badge>
            }
            description={item.metadata.creation_date}
          >
            {item.metadata.doctor_name}
          </CustomListItem>
        ))}
      </CustomList>
    );
  }, [patientRequestedScansData, isLoading, navigate]);

  return (
    <div className="upload-page">
      <Space direction="vertical" block>
        <div className="patient-search-wrapper">
          <PatientSearch isModal={true} />
        </div>
        {selectedPatient.length > 0 && RequestedScansList}
      </Space>
    </div>
  );
}
