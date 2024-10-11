import { Button, Form, Select } from 'antd';
import {
  usePatientQuery,
  useSelectedPatient,
} from '../stores/patientStore';
import { useNavigate } from '@tanstack/react-router';
import { useFloatingPanelState } from '../stores/userStore';
import { useState } from 'react';

export default function PatientSearch({
  isModal = false,
  setSelectedPatient,
}) {
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
          message: 'لازم تكتب اسم المريض',
        },
      ]}
    >
      <Select
        onSelect={() => {
          setIsOpen(false);
        }}
        showSearch
        autoClearSearchValue
        size="large"
        placeholder="اسم المريض"
        onSearch={(text) => {
          setIsOpen(true);
          queryPatient(text);
        }}
        dropdownStyle={{
          direction: 'rtl',
        }}
        onChange={(e) => {
          setSelectedPatient(e?.key || []);
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
        mode={isModal ? null : 'tags'}
        maxCount={isModal ? null : 1}
        notFoundContent={
          <>
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
