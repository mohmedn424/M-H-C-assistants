import { Button, Form, Select } from 'antd';
import { usePatientQuery } from '../stores/patientStore';
import { useNavigate } from '@tanstack/react-router';
import { useFloatingPanelState } from '../stores/userStore';
import { useState } from 'react';

export default function PatientSearch({ isQueue = false }) {
  const navigate = useNavigate();
  const queryPatient = usePatientQuery((state) => state.queryPatient);
  const queryResultOptions = usePatientQuery(
    (state) => state.queryResultOptions
  );
  const { closeFloat } = useFloatingPanelState();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Form.Item
      style={{
        width: '100%',
      }}
      name="patient"
      rules={[
        {
          required: true,
          message: 'لازم تختار المريض الاول',
        },
      ]}
    >
      <Select
        onSelect={(_, e) => {
          setIsOpen(false);
          if (!isQueue)
            navigate({
              to: '/prescription/new/$id',
              params: { id: e.key },
            });
        }}
        showSearch
        size="large"
        placeholder="اسم المريض"
        onSearch={(text) => {
          setIsOpen(true);
          queryPatient(text);
        }}
        dropdownStyle={{
          direction: 'rtl',
        }}
        options={queryResultOptions}
        allowClear
        filterOption={false}
        onFocus={() => {
          setIsOpen(true);
        }}
        onBlur={() => {
          setIsOpen(false);
        }}
        open={isOpen}
        labelInValue
        notFoundContent={
          <>
            <h3
              style={{
                textAlign: 'center',

                color: 'white',
              }}
            >
              المريض غير مسجل على قاعدة البيانات
            </h3>
            <br />
            <Button
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => {
                  closeFloat();
                }, 500);
                setTimeout(() => {
                  navigate({ to: '/newpatient' });
                }, 1000);
              }}
              size="large"
              style={{ width: '100%' }}
            >
              اضافة مريض جديد
              <br />
            </Button>
          </>
        }
        style={{ width: '100%', direction: 'rtl' }}
      />
    </Form.Item>
  );
}
