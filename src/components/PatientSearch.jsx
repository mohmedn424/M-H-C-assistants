import { Button, Form, Select } from 'antd';
import { usePatientQuery } from '../stores/patientStore';
import { useNavigate } from '@tanstack/react-router';
import { useFloatingPanelState } from '../stores/userStore';
import { useState, useEffect } from 'react';

export default function PatientSearch({
  isModal = false,
  setSelectedPatient,
}) {
  const navigate = useNavigate();
  const { queryPatient, queryResultOptions } = usePatientQuery();
  const { closeFloat } = useFloatingPanelState();

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (searchValue) {
      queryPatient(searchValue);
    }
  }, [searchValue]);

  const handleSearch = (value) => {
    setSearchValue(value);
    setIsOpen(true);
  };

  const handleSelect = (value, option) => {
    setIsOpen(false);
    setSearchValue('');
    setSelectedPatient(option.key || []);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleAddNewPatient = () => {
    setIsOpen(false);
    setTimeout(() => {
      closeFloat();
    }, 500);
    setTimeout(() => {
      navigate({ to: '/newpatient' });
    }, 1000);
  };

  return (
    <Form.Item
      style={{ width: '100%' }}
      name="patient"
      rules={[{ required: true, message: 'لازم تكتب اسم المريض' }]}
    >
      <Select
        showSearch
        size="large"
        placeholder="اسم المريض"
        onSearch={handleSearch}
        searchValue={searchValue}
        onSelect={handleSelect}
        onBlur={handleBlur}
        onFocus={handleFocus}
        open={isOpen}
        value={searchValue}
        dropdownStyle={{ direction: 'rtl' }}
        // filterOption={false}
        options={queryResultOptions}
        allowClear
        labelInValue
        mode={'tags'}
        maxCount={1}
        notFoundContent={
          <Button
            onClick={handleAddNewPatient}
            size="large"
            style={{ width: '100%' }}
          >
            اضافة مريض جديد
          </Button>
        }
        style={{ width: '100%', direction: 'rtl' }}
      />
    </Form.Item>
  );
}
