import React from 'react';
import HRSidebar from '../../../components/Layout/HRSidebar';
import SchedulePage from './schedule-page';

const EventCalendar = () => {
  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="dashboard-content">
        <SchedulePage />
      </div>
    </div>
  );
};

export default EventCalendar;

