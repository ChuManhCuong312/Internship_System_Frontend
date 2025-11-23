import React from 'react';
import InternSidebar from '../../components/Layout/InternSidebar';
import SchedulePage from '../../components/Calendar/schedule-page';

const Calendar = () => {
  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <SchedulePage />
      </div>
    </div>
  );
};

export default Calendar;

