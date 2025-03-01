import { Popup, Radio } from 'antd-mobile';
import React from 'react';

export const ClinicFilterPopup = ({
  showFilter,
  setShowFilter,
  clinics,
  clinicValue,
  handleFilterChange,
}) => {
  return (
    <Popup
      visible={showFilter}
      onMaskClick={() => setShowFilter(false)}
      bodyStyle={{ height: '40vh' }}
    >
      <div className="filter-popup">
        <h3>اختر العيادة</h3>
        <Radio.Group
          value={clinicValue[0] || 'all'}
          onChange={handleFilterChange}
        >
          {(clinics || []).map((clinic) => (
            <Radio
              key={clinic.id}
              value={clinic.id}
              className="clinic-radio"
            >
              {clinic.name}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    </Popup>
  );
};
