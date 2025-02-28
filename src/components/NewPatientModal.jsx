import { Modal, Radio, message } from 'antd';
import React, { memo, useState, useCallback, useMemo } from 'react';
import NewPatientPage from '../pages/newPatient/NewPatientPage';
import { useNewPatientModal } from '../stores/patientStore';
import PatientSearch from './PatientSearch';
import pb from '../lib/pocketbase';

const NewPatientModal = memo(function NewPatientModal({ data }) {
  const { isModalOpen, setIsModalOpen } = useNewPatientModal();
  const [status, setStatus] = useState('old');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle modal close
  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  // Handle patient registration modal close
  const handleRegistrationCancel = useCallback(() => {
    setStatus('old');
  }, []);

  // Handle radio group change
  const handleStatusChange = useCallback(
    (e) => {
      const newStatus = e.target.value;
      setStatus(newStatus);

      if (newStatus === 'new') {
        setIsModalOpen(false);
      }
    },
    [setIsModalOpen]
  );

  // Handle form submission
  const handleOk = useCallback(async () => {
    if (!selectedPatient.length) {
      message.error('يرجى اختيار مريض');
      return;
    }

    try {
      setIsSubmitting(true);

      const record = await pb.collection('queue').update(data.id, {
        name: '',
        patient: selectedPatient,
      });

      if (record) {
        setIsModalOpen(false);
        message.success('تم تحديث بيانات المريض بنجاح');
      }
    } catch (error) {
      console.error('Failed to update patient:', error);
      message.error('فشل تحديث بيانات المريض');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPatient, data?.id, setIsModalOpen]);

  // Memoize radio options
  const radioOptions = useMemo(
    () => [
      { label: 'تسجيل', value: 'new' },
      { label: 'بحث', value: 'old' },
    ],
    []
  );

  // Memoize modal props for search modal
  const searchModalProps = useMemo(
    () => ({
      width: 700,
      open: isModalOpen,
      onCancel: handleCancel,
      centered: true,
      destroyOnClose: true,
      focusTriggerAfterClose: true,
      zIndex: 200,
      onOk: handleOk,
      confirmLoading: isSubmitting,
    }),
    [isModalOpen, handleCancel, handleOk, isSubmitting]
  );

  // Memoize modal props for registration modal
  const registrationModalProps = useMemo(
    () => ({
      open: status === 'new',
      onCancel: handleRegistrationCancel,
      footer: null,
      centered: true,
      width: '100%',
      destroyOnClose: true,
    }),
    [status, handleRegistrationCancel]
  );

  return (
    <>
      <Modal {...searchModalProps}>
        <div className="select-type">
          <Radio.Group
            size="large"
            optionType="button"
            buttonStyle="solid"
            value={status}
            defaultValue="old"
            onChange={handleStatusChange}
            options={radioOptions}
          />
        </div>
        <br />
        <PatientSearch
          setSelectedPatient={setSelectedPatient}
          isModal={true}
        />
      </Modal>

      <Modal {...registrationModalProps}>
        <NewPatientPage isModal={true} reservationData={data} />
      </Modal>
    </>
  );
});

export default NewPatientModal;
