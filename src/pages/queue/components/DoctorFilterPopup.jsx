import { Popup, Radio } from 'antd-mobile';
import React from 'react';

export const DoctorFilterPopup = ({
  showDoctorFilter,
  setShowDoctorFilter,
  doctors,
  selectedDoctor,
  handleDoctorFilterChange,
}) => {
  return (
    <Popup
      visible={showDoctorFilter}
      onMaskClick={() => setShowDoctorFilter(false)}
      bodyStyle={{ height: '40vh' }}
    >
      <div className="filter-popup">
        <h3>اختر الطبيب</h3>
        <Radio.Group
          value={selectedDoctor}
          onChange={handleDoctorFilterChange}
        >
          {doctors.map((doctor) => (
            <Radio
              key={doctor.id}
              value={doctor.id}
              className="clinic-radio"
            >
              {doctor.name_ar || doctor.name}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    </Popup>
  );
};
