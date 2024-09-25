import { Modal, Radio } from 'antd';
import React, { memo, useState } from 'react';
import NewPatientPage from '../pages/newPatient/NewPatientPage';
import { useNewPatientModal } from '../stores/patientStore';
import PatientSearch from './PatientSearch';
import pb from '../lib/pocketbase';

export default memo(function NewPatientModal({ data }) {
  const { isModalOpen, setIsModalOpen } = useNewPatientModal();

  const [status, setStatus] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');

  return (
    <>
      <Modal
        width={700}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        destroyOnClose
        focusTriggerAfterClose
        zIndex={200}
        onOk={async () => {
          if (selectedPatient.length > 0) {
            const record = await pb
              .collection('queue')
              .update(data.id, {
                name: '',
                patient: selectedPatient,
              });
            record && setIsModalOpen(false);
          }
        }}
      >
        <div className="select-type">
          <Radio.Group
            size="large"
            optionType="button"
            buttonStyle="solid"
            value={status || 'old'}
            defaultValue="old"
            onChange={(e) => {
              setStatus(e.target.value);
              if (e.target.value === 'new') {
                setIsModalOpen(false);
              }
            }}
            options={[
              { label: 'تسجيل', value: 'new' },
              { label: 'بحث', value: 'old' },
            ]}
          />
        </div>
        <br />
        <PatientSearch set={setSelectedPatient} isModal={true} />
      </Modal>

      <Modal
        open={status === 'new'}
        onCancel={() => setStatus('old')}
        footer={null}
        centered
        width={'100%'}
      >
        <NewPatientPage isModal={true} reservationData={data} />
      </Modal>
    </>
  );
});
