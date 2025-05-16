import { Button } from 'antd';
import { RedoOutline } from 'antd-mobile-icons';
import React, { memo, useCallback } from 'react';

// Memoize the component to prevent unnecessary re-renders
const QueueHeader = memo(
  ({
    doctors,
    doctorName,
    clinicName,
    setShowDoctorFilter,
    setShowFilter,
    handleRefresh,
  }) => {
    // Memoize event handlers to maintain stable function references
    const openDoctorFilter = useCallback(() => {
      setShowDoctorFilter(true);
    }, [setShowDoctorFilter]);

    const openClinicFilter = useCallback(() => {
      setShowFilter(true);
    }, [setShowFilter]);

    return (
      <div className="queue-header">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {doctors && doctors.length > 1 && (
            <Button
              size="large"
              className="filter-button"
              onClick={openDoctorFilter}
            >
              {doctorName}
            </Button>
          )}
          <Button
            size="large"
            className="filter-button"
            onClick={openClinicFilter}
          >
            {clinicName}
          </Button>

          {/* <Button
            shape="circle"
            size="large"
            type="primary"
            danger
            onClick={handleRefresh}
            style={{ padding: '4px 8px' }}
          >
            <RedoOutline />
          </Button> */}
        </div>
      </div>
    );
  }
);

// Export as default
export default QueueHeader;
