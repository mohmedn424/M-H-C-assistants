import { Button, Divider, Form, Input, message, Radio } from 'antd';
import PatientSearch from './PatientSearch';

import pb from '../lib/pocketbase';
import { useEffect, useState } from 'react';
import { useQueueModalState } from '../stores/queueStore';
import {
  useClinicsStore,
  useClinicValue,
  useDoctorsStore,
  useDoctorValue,
} from '../stores/userStore';
import { Selector } from 'antd-mobile';

export default function AddToQueue() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { mode } = useQueueModalState();
  const { clinics, setClinics } = useClinicsStore();
  const { doctors, setDoctors } = useDoctorsStore();

  const { doctorValue, setDoctorValues } = useDoctorValue();
  const { clinicValue, setClinicValues } = useClinicValue();

  useEffect(() => {
    if (pb.authStore.isValid) {
      setClinics(pb.authStore.model.expand?.clinics);
      setDoctors(pb.authStore.model.expand?.doctors);
    }
  }, []);

  useEffect(() => {
    form.setFieldValue('doctor', doctorValue);
    form.setFieldValue('clinic', clinicValue);
  }, [doctorValue, clinicValue]);

  const handleAdding = async (e) => {
    const data = {
      ...e,
      patient: e.patient.key,
      doctor: doctorValue[0],
      clinic: clinicValue[0],
      assistant: pb.authStore.model.id,
    };

    try {
      const record = await pb.collection('queue').create(data);
      if (record) {
        messageApi.success('Patient added successfully');

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
    <>
      {contextHolder}
      <Form
        size="large"
        className="queue-form"
        initialValues={{
          type: 'new',
          doctor: pb.authStore.model.id,
        }}
        onFinish={(e) => handleAdding(e)}
        form={form}
        style={{
          userSelect: 'none',
        }}
        dir="rtl"
      >
        <PatientSearch isQueue={true} />

        <Form.Item noStyle name="status">
          <Radio.Group
            className="status"
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: 'الحجز', value: 'booking' },
              { label: 'الانتظار', value: 'waitlist' },
            ]}
          />
        </Form.Item>
        <Divider />

        <Form.Item noStyle name="type">
          <Radio.Group
            className="type"
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: 'استشارة', value: 'follow' },
              { label: 'كشف جديد', value: 'new' },
            ]}
          />
        </Form.Item>
        <Divider />
        <Form.Item name="doctor" label="الطبيب">
          <Selector
            showCheckMark={false}
            columns={2}
            options={doctors.map((doctor) => ({
              label: doctor.name_ar,
              value: doctor.id,
            }))}
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
        <Form.Item name="clinic" label="العيادات">
          <Selector
            showCheckMark={false}
            columns={1}
            options={clinics.map((doctor) => ({
              label: doctor.name,
              value: doctor.id,
            }))}
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
        <Form.Item noStyle name="notes">
          <Input placeholder="ملاحظات" />
        </Form.Item>
        <Divider />
        <Button htmlType="submit" type="primary">
          اضافة للدور
        </Button>
      </Form>
    </>
  );
}
