import { Button, Form, Select } from 'antd';
import { usePatientQuery } from '../stores/patientStore';
import { useNavigate } from '@tanstack/react-router';
import { useFloatingPanelState } from '../stores/userStore';
import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo,
} from 'react';
import { debounce } from 'lodash';

// Memoize the "Not Found" button component
const AddNewPatientButton = memo(({ onClick }) => (
  <Button onClick={onClick} size="large" style={{ width: '100%' }}>
    اضافة مريض جديد
  </Button>
));

export default function PatientSearch({
  isModal = false,
  setSelectedPatient = () => {},
}) {
  const navigate = useNavigate();
  const { queryPatient, queryResultOptions } = usePatientQuery();
  const { closeFloat } = useFloatingPanelState();

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Use refs to store timeouts for cleanup
  const closeFloatTimeoutRef = useRef(null);
  const navigateTimeoutRef = useRef(null);

  // Debounce the search to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value && value.length > 1) {
        queryPatient(value);
      }
    }, 300),
    [queryPatient]
  );

  // Clean up debounced function and timeouts on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      if (closeFloatTimeoutRef.current)
        clearTimeout(closeFloatTimeoutRef.current);
      if (navigateTimeoutRef.current)
        clearTimeout(navigateTimeoutRef.current);
    };
  }, [debouncedSearch]);

  // Handle search input changes
  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);
      setIsOpen(!!value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle selection of a patient
  const handleSelect = useCallback(
    (value, option) => {
      setIsOpen(false);
      setSearchValue('');
      setSelectedPatient(option.key || []);
    },
    [setSelectedPatient]
  );

  // Handle blur event with delay to allow selection
  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  // Handle focus event
  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Navigate to new patient page
  const handleAddNewPatient = useCallback(() => {
    setIsOpen(false);

    // Clear any existing timeouts
    if (closeFloatTimeoutRef.current)
      clearTimeout(closeFloatTimeoutRef.current);
    if (navigateTimeoutRef.current)
      clearTimeout(navigateTimeoutRef.current);

    // Set new timeouts and store references
    closeFloatTimeoutRef.current = setTimeout(() => {
      closeFloat();
    }, 500);

    navigateTimeoutRef.current = setTimeout(() => {
      navigate({ to: '/newpatient' });
    }, 1000);
  }, [closeFloat, navigate]);

  // Memoize form item rules
  const formRules = useMemo(
    () => [{ required: true, message: 'لازم تكتب اسم المريض' }],
    []
  );

  // Memoize select props for better performance
  const selectProps = useMemo(
    () => ({
      showSearch: true,
      size: 'large',
      placeholder: 'اسم المريض',
      onSearch: handleSearch,
      searchValue: searchValue,
      onSelect: handleSelect,
      onBlur: handleBlur,
      onFocus: handleFocus,
      open: isOpen,
      value: searchValue,
      dropdownStyle: { direction: 'rtl' },
      options: queryResultOptions,
      allowClear: true,
      labelInValue: true,
      mode: 'tags',
      maxCount: 1,
      style: { width: '100%', direction: 'rtl' },
    }),
    [
      handleSearch,
      searchValue,
      handleSelect,
      handleBlur,
      handleFocus,
      isOpen,
      queryResultOptions,
    ]
  );

  return (
    <Form.Item
      style={{ width: '100%' }}
      name="patient"
      rules={formRules}
    >
      <Select
        {...selectProps}
        notFoundContent={
          <AddNewPatientButton onClick={handleAddNewPatient} />
        }
      />
    </Form.Item>
  );
}
