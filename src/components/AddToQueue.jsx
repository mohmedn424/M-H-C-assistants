import { Button, Divider, Form, Input, message, Radio } from 'antd';
import PatientSearch from './PatientSearch';

import pb from '../lib/pocketbase';
import { memo, useEffect, useMemo } from 'react';
import { useQueueModalState } from '../stores/queueStore';
import {
  useClinicsStore,
  useClinicValue,
  useDoctorsStore,
  useDoctorValue,
} from '../stores/userStore';
import { Selector } from 'antd-mobile';
import { useToAddPatient } from '../stores/patientStore';

export default memo(function AddToQueue() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { mode } = useQueueModalState();
  const { clinics, setClinics } = useClinicsStore();
  const { doctors, setDoctors } = useDoctorsStore();

  const { doctorValue, setDoctorValues } = useDoctorValue();
  const { clinicValue, setClinicValues } = useClinicValue();

  const { toAddPatient } = useToAddPatient();

  // Filter doctors based on selected clinic
  const filteredDoctors = useMemo(() => {
    if (!clinics || !doctors || !clinicValue.length)
      return doctors || [];

    // Find the selected clinic
    const selectedClinic = clinics.find(
      (clinic) => clinic.id === clinicValue[0]
    );

    if (
      !selectedClinic ||
      !selectedClinic.doctors ||
      !selectedClinic.doctors.length
    ) {
      return []; // No doctors in this clinic
    }

    // Filter doctors that belong to the selected clinic
    return doctors.filter((doctor) =>
      selectedClinic.doctors.includes(doctor.id)
    );
  }, [clinics, doctors, clinicValue]);

  // Memoize the doctor options with null check
  const doctorOptions = useMemo(() => {
    // Use filtered doctors instead of all doctors
    return (filteredDoctors || []).map((doctor) => ({
      label: doctor.name_ar || doctor.name,
      value: doctor.id,
    }));
  }, [filteredDoctors]);

  // Memoize the clinic options with null check
  const clinicOptions = useMemo(() => {
    // Add null check to prevent error when clinics is undefined
    return (clinics || []).map((clinic) => ({
      label: clinic.name,
      value: clinic.id,
    }));
  }, [clinics]);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setClinics(pb.authStore.model?.expand?.clinics || []);
      setDoctors(pb.authStore.model?.expand?.doctors || []);
    }
  }, []);

  useEffect(() => {
    form.setFieldValue('patient', toAddPatient);
  }, [toAddPatient]);

  // Update doctor selection when clinic changes
  useEffect(() => {
    // When clinic changes, check if current doctor is valid for this clinic
    if (clinicValue.length && filteredDoctors.length) {
      const currentDoctorIsValid = filteredDoctors.some(
        (doctor) => doctor.id === doctorValue[0]
      );

      if (!currentDoctorIsValid && filteredDoctors.length > 0) {
        // If current doctor is not valid for this clinic, select the first available doctor
        const newDoctorValue = filteredDoctors[0].id;
        setDoctorValues([newDoctorValue]);
        form.setFieldValue('doctor', newDoctorValue);
      }
    }
  }, [clinicValue, filteredDoctors]);

  useEffect(() => {
    form.setFieldValue('doctor', doctorValue);
    form.setFieldValue('clinic', clinicValue);
  }, [doctorValue, clinicValue]);

  const handleAdding = async (e) => {
    const data = {
      ...e,
      doctor: doctorValue[0],
      clinic: clinicValue[0],
      assistant: pb.authStore.model?.id || '',
      name: '',
    };

    if (e.patient[0].key === undefined) {
      data.name = e.patient[0].value;
      data.status = 'booking';
    }
    data.patient = e.patient[0].key;

    try {
      const record = await pb.collection('queue').create(data);
      if (record) {
        messageApi.success('تمت اضافة المريض بنجاح');

        form.setFieldsValue('patient', null);
      }
    } catch (error) {
      if (error.name === 'ClientResponseError 400')
        messageApi.error('المريض متسجل قبل كدة');
    }
  };

  useEffect(() => {
    form.setFieldValue('status', mode);
  }, [mode]);

  return (
    <div
      className="queue-form-container"
      style={{ padding: '0 8px' }}
    >
      {contextHolder}
      <Form
        layout="vertical"
        size="large"
        className="queue-form"
        initialValues={{
          type: 'new',
          doctor: pb.authStore.model?.id || '',
        }}
        onFinish={(e) => handleAdding(e)}
        form={form}
        style={{
          userSelect: 'none',
          overflowY: 'visible',
          marginTop: '10px',
        }}
        dir="rtl"
      >
        <PatientSearch />

        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <Form.Item
            name="status"
            style={{ margin: 0, flex: 1 }}
            rules={[
              {
                required: true,
                message: 'لازم تختار حجز ولا انتظار',
              },
            ]}
          >
            <Radio.Group
              className="status"
              optionType="button"
              buttonStyle="solid"
              style={{ width: '100%' }}
              options={[
                { label: 'الحجز', value: 'booking' },
                { label: 'الانتظار', value: 'waitlist' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="type"
            style={{ margin: 0, flex: 1 }}
            rules={[
              {
                required: true,
                message: 'لازم تختار كشف ولا استشارة',
              },
            ]}
          >
            <Radio.Group
              className="type"
              optionType="button"
              buttonStyle="solid"
              style={{ width: '100%' }}
              options={[
                { label: 'استشارة', value: 'follow' },
                { label: 'كشف', value: 'new' },
              ]}
            />
          </Form.Item>
        </div>

        {(clinics || []).length > 1 && (
          <Form.Item
            name="clinic"
            label="العيادات"
            style={{ marginBottom: '8px' }}
          >
            <Selector
              showCheckMark={false}
              columns={2}
              options={clinicOptions}
              value={[clinicValue]}
              onChange={(v) => {
                if (v.length) {
                  form.setFieldValue('clinic', v[0]);
                  setClinicValues([v[0]]);
                } else
                  form.setFieldValue(
                    'clinic',
                    clinicValue[clinicValue.length - 1]
                  );
              }}
            />
          </Form.Item>
        )}

        {(filteredDoctors || []).length > 1 && (
          <Form.Item
            name="doctor"
            label="الطبيب"
            style={{ marginBottom: '8px' }}
          >
            <Selector
              showCheckMark={false}
              columns={2}
              options={doctorOptions}
              value={[doctorValue]}
              onChange={(v) => {
                if (v.length) {
                  form.setFieldValue('doctor', v[0]);
                  setDoctorValues([v[0]]);
                } else
                  form.setFieldValue(
                    'doctor',
                    doctorValue[doctorValue.length - 1]
                  );
              }}
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: '8px' }} name="notes">
          <Input placeholder="ملاحظات" />
        </Form.Item>
        <Divider style={{ margin: '8px 0' }} />
        <Button htmlType="submit" type="primary" block>
          اضافة للدور
        </Button>
      </Form>
    </div>
  );
});
