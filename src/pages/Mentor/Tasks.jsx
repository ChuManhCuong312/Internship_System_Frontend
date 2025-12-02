import React from 'react';
import MentorSidebar from '../../components/Layout/MentorSidebar';
import TasksWrapper from './tasks/index';
import '../../styles/dashBoard.css';

const Tasks = () => {
  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <TasksWrapper />
      </div>
    </div>
  );
};

export default Tasks;
