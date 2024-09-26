import { useEffect, useMemo } from 'react';
import { List } from 'antd-mobile';
import pb from '../../lib/pocketbase';
import PatientSearch from '../../components/PatientSearch';
import {
  usePatientRequestedScansData,
  useSelectedPatient,
} from '../../stores/patientStore';
import { useNavigate } from '@tanstack/react-router';

import './upload.scss';
export default function UploadPage() {
  const navigate = useNavigate();

  const { selectedPatient } = useSelectedPatient();
  const { patientRequestedScansData, setPatientRequestedScansData } =
    usePatientRequestedScansData();

  useEffect(() => {
    const fetchPatientScans = async () => {
      if (selectedPatient.length > 0) {
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
        }
      } else {
        setPatientRequestedScansData({});
      }
    };

    fetchPatientScans();
  }, [selectedPatient, setPatientRequestedScansData]);

  const RequestedScansList = useMemo(() => {
    if (patientRequestedScansData.totalItems <= 0) {
      return null;
    }

    return (
      <List>
        {patientRequestedScansData.items?.map((item) => (
          <List.Item
            key={item.id}
            onClick={() =>
              navigate({
                to: '/upload/$uploadid',
                params: { uploadid: item.id },
                state: { itemData: item },
              })
            }
          >
            {`${item.metadata.doctor_name} - ${item.metadata.creation_date}`}
          </List.Item>
        ))}
      </List>
    );
  }, [patientRequestedScansData]);

  return (
    <div className="uploading-page-container">
      <PatientSearch isModal={true} />
      {RequestedScansList}
    </div>
  );
}
